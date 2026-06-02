import { CONFIG } from "../config";
import type { Meme, Vec2, WristSide } from "./types";

export function dist(a: Vec2, b: Vec2): number {
  const dx = (a.x - b.x) * 1;
  const dy = (a.y - b.y) * 1;
  return Math.sqrt(dx * dx + dy * dy);
}

function segmentHitsCirclePx(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  rPx: number,
  canvasW: number,
  canvasH: number,
): boolean {
  const sx = (x: number) => x * canvasW;
  const sy = (y: number) => y * canvasH;
  const pax = sx(ax);
  const pay = sy(ay);
  const pbx = sx(bx);
  const pby = sy(by);
  const pcx = sx(cx);
  const pcy = sy(cy);

  const dx = pbx - pax;
  const dy = pby - pay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-6) {
    const ddx = pcx - pax;
    const ddy = pcy - pay;
    return ddx * ddx + ddy * ddy <= rPx * rPx;
  }
  let t = ((pcx - pax) * dx + (pcy - pay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const px = pax + t * dx;
  const py = pay + t * dy;
  const ddx = pcx - px;
  const ddy = pcy - py;
  return ddx * ddx + ddy * ddy <= rPx * rPx;
}

export function checkCut(
  prev: Vec2 | null,
  curr: Vec2 | null,
  meme: Meme,
  canvasW: number,
  canvasH: number,
): boolean {
  if (!prev || !curr || !meme.alive) return false;

  const speed = dist(prev, curr);
  if (speed < CONFIG.CUT_SPEED_THRESHOLD) return false;

  const rPx = meme.radius * canvasW * CONFIG.HITBOX_SCALE;
  const steps = CONFIG.INTERPOLATION_STEPS;

  for (let i = 0; i < steps; i++) {
    const t0 = i / steps;
    const t1 = (i + 1) / steps;
    const ax = prev.x + (curr.x - prev.x) * t0;
    const ay = prev.y + (curr.y - prev.y) * t0;
    const bx = prev.x + (curr.x - prev.x) * t1;
    const by = prev.y + (curr.y - prev.y) * t1;
    if (
      segmentHitsCirclePx(ax, ay, bx, by, meme.x, meme.y, rPx, canvasW, canvasH)
    ) {
      return true;
    }
  }
  return false;
}

export function checkWristCuts(
  prevLeft: Vec2 | null,
  prevRight: Vec2 | null,
  left: Vec2 | null,
  right: Vec2 | null,
  memes: Meme[],
  canvasW: number,
  canvasH: number,
): { meme: Meme; side: WristSide }[] {
  const hits: { meme: Meme; side: WristSide }[] = [];
  const cut = new Set<number>();

  for (const meme of memes) {
    if (!meme.alive || cut.has(meme.id)) continue;
    if (checkCut(prevLeft, left, meme, canvasW, canvasH)) {
      hits.push({ meme, side: "left" });
      cut.add(meme.id);
    } else if (checkCut(prevRight, right, meme, canvasW, canvasH)) {
      hits.push({ meme, side: "right" });
      cut.add(meme.id);
    }
  }
  return hits;
}
