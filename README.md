# 🥷 MEME NINJA — Cursor Madrid Hackathon #3

Fruit Ninja con memes y visión por computador. La cámara te ve, una estela de sable
sigue tu mano, y al cortar un meme explota con sonido y puntos. **LibreYOLO pose**
detecta las muñecas; todo el juego vive en **Next.js + Canvas**.

## Arquitectura

```
  Next.js :3000 (Bun)              Backend Python :8000
 ┌──────────────────────┐   JPEG   ┌─────────────────────────┐
 │ webcam + Canvas game │ ── WS ─> │ LibreYOLONASn-pose      │
 │ estela, memes, HUD   │ <─ wrists│ muñecas normalizadas    │
 └──────────────────────┘          └─────────────────────────┘
```

Solo viajan coordenadas de muñecas (0..1). Nunca el frame de vuelta.

## Arranque

### 1) LibreYOLO (prerequisito del hackathon)

```bash
git clone -b dev https://github.com/Libre-YOLO/libreyolo.git
cd libreyolo && python -m venv .venv && source .venv/bin/activate
pip install -e .
```

### 2) Backend

```bash
cd hackathon-fruitninja/backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8000
```

### 3) Frontend

```bash
cd hackathon-fruitninja/frontend
bun install
bun dev
# → http://localhost:3000
```

### Solo demo (sin Python)

```bash
cd frontend && bun dev
```

Arranca en **modo demo** con muñeca simulada. Pulsa **▶ Empezar ronda** para jugar.

## Controles

- **▶ Empezar ronda** — 60 s, memes volando, puntuación activa
- **↺ Reset** — limpia la partida
- **📷 Activar cámara** — webcam + WebSocket al backend LibreYOLO

## Guion de demo (2-3 min)

1. (15s) Enseña la cámara y la estela siguiendo tu mano
2. (30s) Empieza ronda, corta memes — explosiones y puntos
3. (30s) Sube el ritmo, haz un combo grande
4. (40s) Saca a alguien del público a jugar
5. Cierre con puntuación final en grande

## Ajustes en vivo

- `MIN_WRIST_CONF` / `POSE_DET_CONF` en `backend/server.py` — sube si hay falsos positivos; baja si pierde la mano
- `EMA_ALPHA` / `WRIST_EXTRAP_MS` en `frontend/lib/config.ts` — sube alpha o baja extrap para seguir la muñeca con menos retardo
- `CUT_SPEED_THRESHOLD` en `frontend/lib/config.ts` — baja si cuesta cortar
- `PUMP_INTERVAL_MS` — sube si la CPU va justa (menos fps, más estable)
