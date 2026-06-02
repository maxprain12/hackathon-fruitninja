import type { PlayerWrists, Vec2, WristSide } from "./types";

const empty: PlayerWrists = { left: null, right: null };

export function createEmptyWrists(): PlayerWrists {
  return { left: null, right: null };
}

/** Si las muñecas están demasiado juntas, quedarse solo con la de mayor confianza */
export function dedupeWrists(w: PlayerWrists, minDist = 0.035): PlayerWrists {
  const { left, right } = w;
  if (!left || !right) return w;

  const dx = left.x - right.x;
  const dy = left.y - right.y;
  if (dx * dx + dy * dy >= minDist * minDist) return w;

  const lc = left.conf ?? 1;
  const rc = right.conf ?? 1;
  return lc >= rc
    ? { left, right: null }
    : { left: null, right };
}

export function smoothWrists(
  prev: PlayerWrists,
  raw: PlayerWrists,
  alpha: number,
): PlayerWrists {
  const smoothSide = (side: WristSide): Vec2 | null => {
    const r = raw[side];
    const p = prev[side];
    if (!r) return null;
    if (!p) return { ...r };
    return {
      x: p.x + alpha * (r.x - p.x),
      y: p.y + alpha * (r.y - p.y),
      conf: r.conf,
    };
  };

  return {
    left: smoothSide("left"),
    right: smoothSide("right"),
  };
}

export type WristVelocity = { vx: number; vy: number };

export function extrapolateWrists(
  wrists: PlayerWrists,
  vel: Record<WristSide, WristVelocity | null>,
  elapsedMs: number,
  maxMs: number,
): PlayerWrists {
  if (elapsedMs <= 0 || elapsedMs > maxMs) return wrists;

  const t = elapsedMs / 1000;
  const side = (s: WristSide): Vec2 | null => {
    const w = wrists[s];
    const v = vel[s];
    if (!w || !v) return w;
    return {
      x: w.x + v.vx * t,
      y: w.y + v.vy * t,
      conf: w.conf,
    };
  };

  return { left: side("left"), right: side("right") };
}

export function wristSpeed(
  prev: Vec2 | null,
  curr: Vec2 | null,
): number {
  if (!prev || !curr) return 0;
  const dx = curr.x - prev.x;
  const dy = curr.y - prev.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export { empty as EMPTY_WRISTS };
