"""
MEME NINJA — Backend de visión
Cursor Madrid Hackathon #3 · LibreYOLO Track

Flujo:
  navegador (webcam)  --frame JPEG-->  WebSocket  -->  este servidor
  servidor: LibreYOLONASn-pose detecta muñecas del jugador principal
  servidor  --[{left, right} wrists 0..1]-->  navegador  -> juego Canvas

Solo enviamos coordenadas de muñecas normalizadas, nunca el frame de vuelta.
"""

import asyncio
import base64
import json
import os
from io import BytesIO

import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pydantic import BaseModel, Field

from leaderboard_store import add_entry, list_top
from libreyolo import LibreYOLO

MODEL = LibreYOLO("LibreYOLONASn-pose.pt")

LEFT_WRIST_IDX = 9
RIGHT_WRIST_IDX = 10
MIN_WRIST_CONF = 0.32
MIN_WRIST_SEP = 0.04

_cors = os.environ.get(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000",
)
CORS_ORIGINS = [o.strip() for o in _cors.split(",") if o.strip()]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ScoreSubmit(BaseModel):
    player_name: str = Field(..., min_length=1, max_length=32)
    score: int = Field(..., ge=0)


def decode_frame(data_url: str) -> np.ndarray:
    """data:image/jpeg;base64,xxxx  ->  numpy RGB"""
    _, b64 = data_url.split(",", 1)
    img = Image.open(BytesIO(base64.b64decode(b64))).convert("RGB")
    return np.array(img)


def _iter_results(raw):
    if raw is None:
        return
    if isinstance(raw, (list, tuple)):
        yield from raw
        return
    yield raw


def _to_numpy(arr):
    if arr is None:
        return None
    if hasattr(arr, "cpu"):
        arr = arr.cpu()
    if hasattr(arr, "numpy"):
        return arr.numpy()
    return np.asarray(arr)


def sanitize_wrists(left: dict | None, right: dict | None) -> dict | None:
    """Evita duplicar la misma mano en left y right."""
    if left and right:
        dx = left["x"] - right["x"]
        dy = left["y"] - right["y"]
        if (dx * dx + dy * dy) ** 0.5 < MIN_WRIST_SEP:
            if left["conf"] >= right["conf"]:
                right = None
            else:
                left = None
    if left is None and right is None:
        return None
    return {"left": left, "right": right}


def pick_player_wrists(results, w: int, h: int) -> dict | None:
    """Elige la persona con mayor bbox y devuelve muñecas normalizadas."""
    best_area = 0.0
    best_wrists = None

    for r in _iter_results(results):
        boxes = getattr(r, "boxes", None)
        keypoints = getattr(r, "keypoints", None)
        if boxes is None or keypoints is None:
            continue

        xyxy = _to_numpy(getattr(boxes, "xyxy", None))
        xyn = _to_numpy(getattr(keypoints, "xyn", None))
        conf = _to_numpy(getattr(keypoints, "conf", None))

        if xyxy is None or xyn is None:
            continue
        if xyxy.ndim == 1:
            xyxy = xyxy.reshape(1, 4)
        if xyn.ndim == 2:
            xyn = xyn.reshape(1, *xyn.shape)
        if conf is not None and conf.ndim == 1:
            conf = conf.reshape(1, *conf.shape)

        for i in range(len(xyxy)):
            x1, y1, x2, y2 = [float(v) for v in xyxy[i].tolist()]
            area = max(0.0, x2 - x1) * max(0.0, y2 - y1)
            if area <= best_area:
                continue

            kpts = xyn[i]
            kconf = conf[i] if conf is not None else None

            def wrist(idx: int):
                x, y = float(kpts[idx][0]), float(kpts[idx][1])
                c = float(kconf[idx]) if kconf is not None else 1.0
                if c < MIN_WRIST_CONF:
                    return None
                if not (0.02 < x < 0.98 and 0.02 < y < 0.98):
                    return None
                return {"x": x, "y": y, "conf": round(c, 3)}

            left = wrist(LEFT_WRIST_IDX)
            right = wrist(RIGHT_WRIST_IDX)
            pair = sanitize_wrists(left, right)
            if pair is None:
                continue

            best_area = area
            best_wrists = pair

    return best_wrists


@app.get("/health")
def health():
    return {"status": "ok", "model": "LibreYOLONASn-pose.pt"}


@app.get("/leaderboard")
def get_leaderboard(limit: int = 10):
    return list_top(limit)


@app.post("/leaderboard")
def post_leaderboard(body: ScoreSubmit):
    return add_entry(body.player_name, body.score)


@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await ws.accept()
    pending: np.ndarray | None = None
    busy = False

    async def drain() -> None:
        nonlocal pending, busy
        busy = True
        try:
            while pending is not None:
                frame = pending
                pending = None
                h, w = frame.shape[:2]
                results = await asyncio.to_thread(MODEL, frame)
                player = pick_player_wrists(results, w, h)
                await ws.send_text(
                    json.dumps({"w": w, "h": h, "player": player})
                )
        except WebSocketDisconnect:
            return
        finally:
            busy = False
            if pending is not None:
                asyncio.create_task(drain())

    try:
        while True:
            raw = await ws.receive_text()
            msg = json.loads(raw)

            if msg.get("type") == "reset":
                continue

            pending = decode_frame(msg["frame"])
            if not busy:
                asyncio.create_task(drain())
    except WebSocketDisconnect:
        pass
