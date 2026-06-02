import type { PlayerWrists, Vec2 } from "./types";

/** Espeja X para alinear muñecas con el video (scaleX(-1)) */
export function mirrorWrists(w: PlayerWrists): PlayerWrists {
  const m = (v: Vec2 | null): Vec2 | null =>
    v ? { ...v, x: 1 - v.x } : null;
  return { left: m(w.left), right: m(w.right) };
}

/** Demo: tajo diagonal rápido que barre la pantalla */
export function getDemoWrists(t: number): PlayerWrists {
  const cycle = 1400;
  const p = (t % cycle) / cycle;
  const slash = p < 0.55;
  const right = slash
    ? {
        x: 0.12 + p * 1.4,
        y: 0.75 - Math.sin(p * Math.PI) * 0.55,
        conf: 1,
      }
    : { x: 0.85, y: 0.35, conf: 1 };
  const left = slash
    ? { x: 0.08 + p * 1.35, y: 0.8 - Math.sin(p * Math.PI) * 0.5, conf: 1 }
    : { x: 0.15, y: 0.4, conf: 1 };

  return { left, right };
}
