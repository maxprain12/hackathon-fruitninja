import type { PlayerWrists, Vec2 } from "./types";

/** object-cover: escala y recorte como el <video> de fondo */
export function videoNormToCanvasNorm(
  nx: number,
  ny: number,
  videoW: number,
  videoH: number,
  canvasW: number,
  canvasH: number,
): { x: number; y: number } {
  if (videoW <= 0 || videoH <= 0 || canvasW <= 0 || canvasH <= 0) {
    return { x: nx, y: ny };
  }

  const scale = Math.max(canvasW / videoW, canvasH / videoH);
  const dw = videoW * scale;
  const dh = videoH * scale;
  const ox = (canvasW - dw) / 2;
  const oy = (canvasH - dh) / 2;
  const px = ox + nx * dw;
  const py = oy + ny * dh;
  return { x: px / canvasW, y: py / canvasH };
}

export function mapWristsToCanvasSpace(
  wrists: PlayerWrists,
  videoW: number,
  videoH: number,
  canvasW: number,
  canvasH: number,
): PlayerWrists {
  const map = (v: Vec2 | null): Vec2 | null => {
    if (!v) return null;
    const { x, y } = videoNormToCanvasNorm(
      v.x,
      v.y,
      videoW,
      videoH,
      canvasW,
      canvasH,
    );
    return { x, y, conf: v.conf };
  };
  return { left: map(wrists.left), right: map(wrists.right) };
}
