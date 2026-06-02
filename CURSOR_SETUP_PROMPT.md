# SETUP PROMPT — Meme Ninja (pegar en Cursor DESPUÉS del setup de LibreYOLO)

Ya tengo LibreYOLO instalado y funcionando (`from libreyolo import LibreYOLO`).
Quiero construir **Meme Ninja** para una demo en proyector:

ARQUITECTURA:
- Backend Python (FastAPI + WebSocket) en `backend/server.py` que recibe frames JPEG
  desde el navegador, corre **LibreYOLONASn-pose.pt**, elige **1 jugador** (bbox más
  grande) y devuelve muñecas izquierda/derecha normalizadas (0..1).
- Frontend **Next.js + Bun** en `frontend/` con Canvas: memes con física parabólica,
  detección de corte por **velocidad de muñeca**, estela de sable, partículas, sonido,
  combos, bombas-meme, timer de 60 s y **modo demo** sin cámara.

PRIORIDADES (hackathon, demo 2-3 min):
1. Que se vea espectacular en proyector (score enorme, estela glow, explosiones).
2. Corte responsivo: suavizado EMA + interpolación entre frames + hitboxes 1.4×.
3. Modo demo jugable solo con `bun dev` para iterar estética sin backend.

Arranque:
```bash
# Terminal 1
cd backend && uvicorn server:app --host 0.0.0.0 --port 8000

# Terminal 2
cd frontend && bun dev
```

Los memes son emojis dibujados en Canvas (🤡💀🔥💣), NO detección YOLO de memes.
