import { CONFIG } from "./config";
import type { PlayerWrists } from "./game/types";

export interface WsConnection {
  ws: WebSocket;
  close: () => void;
}

export interface WristFrame {
  player: PlayerWrists | null;
  frameW: number;
  frameH: number;
}

export function connectWebSocket(
  onWrists: (frame: WristFrame) => void,
  onDisconnected: () => void,
): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(CONFIG.WS_URL);

    ws.onopen = () => resolve(ws);
    ws.onerror = () => reject(new Error("WebSocket error"));
    ws.onclose = () => onDisconnected();

    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data as string) as {
          player: PlayerWrists | null;
          w?: number;
          h?: number;
        };
        onWrists({
          player: data.player,
          frameW: data.w ?? 0,
          frameH: data.h ?? 0,
        });
      } catch {
        /* ignore malformed */
      }
    };
  });
}

const tmpCanvas =
  typeof document !== "undefined" ? document.createElement("canvas") : null;

export function startPump(
  ws: WebSocket,
  video: HTMLVideoElement,
): () => void {
  let active = true;
  let lastSent = 0;

  const sendFrame = () => {
    if (!active || ws.readyState !== WebSocket.OPEN) return;

    const now = performance.now();
    if (now - lastSent < CONFIG.PUMP_INTERVAL_MS) {
      schedule();
      return;
    }

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (vw && tmpCanvas) {
      const tw = CONFIG.PUMP_WIDTH;
      const th = Math.round(tw * (vh / vw));
      tmpCanvas.width = tw;
      tmpCanvas.height = th;
      const tctx = tmpCanvas.getContext("2d");
      if (tctx) {
        tctx.save();
        tctx.scale(-1, 1);
        tctx.drawImage(video, -tw, 0, tw, th);
        tctx.restore();
        ws.send(
          JSON.stringify({
            type: "frame",
            frame: tmpCanvas.toDataURL("image/jpeg", CONFIG.JPEG_QUALITY),
          }),
        );
        lastSent = now;
      }
    }
    schedule();
  };

  const schedule = () => {
    if (!active) return;
    if (typeof video.requestVideoFrameCallback === "function") {
      video.requestVideoFrameCallback(() => sendFrame());
    } else {
      setTimeout(sendFrame, CONFIG.PUMP_INTERVAL_MS);
    }
  };

  schedule();
  return () => {
    active = false;
  };
}

export async function getWebcamStream(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    video: { width: 1280, height: 720 },
  });
}

export function sendReset(ws: WebSocket) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "reset" }));
  }
}
