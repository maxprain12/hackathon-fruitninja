import { CONFIG } from "../config";
import { bombSound, comboPopSound, gameOverSound, slashSound } from "./audio";
import { checkWristCuts } from "./cutDetection";
import { getDemoWrists } from "./demoWrist";
import { mapWristsToCanvasSpace } from "./videoLayout";
import {
  createEmptyWrists,
  dedupeWrists,
  extrapolateWrists,
  smoothWrists,
  wristSpeed,
  type WristVelocity,
} from "./wristSmoothing";
import {
  beginRoundEmotes,
  getEmoteImage,
  getBombTauntMessage,
  getEmoteMeta,
  getRoundBombChance,
  pickBombEmoteId,
  pickGoodEmoteId,
} from "./emotes";
import type {
  GameState,
  HudSnapshot,
  Meme,
  MemeKind,
  PlayerWrists,
  TrailPoint,
  WristSide,
} from "./types";

export function createGameState(): GameState {
  return {
    playing: false,
    demo: true,
    connected: false,
    score: 0,
    combo: 0,
    comboTimer: 0,
    roundEndAt: 0,
    gameOver: false,
    gameOverReason: null,
    lives: CONFIG.STARTING_LIVES,
    maxLives: CONFIG.STARTING_LIVES,
    lifeLostTaunt: null,
    memes: [],
    halves: [],
    particles: [],
    trail: [],
    wrists: createEmptyWrists(),
    prevRawWrists: createEmptyWrists(),
    smoothedWrists: createEmptyWrists(),
    nextMemeId: 1,
    nextHalfId: 1,
    lastSpawnAt: 0,
    spawnInterval: CONFIG.SPAWN_INTERVAL_MS,
    flashRed: 0,
    comboPop: null,
    canvasW: 1280,
    canvasH: 720,
    videoW: 0,
    videoH: 0,
    wristReceivedAt: 0,
    wristVel: { left: null, right: null },
    time: 0,
  };
}

function cloneWrists(w: PlayerWrists): PlayerWrists {
  return {
    left: w.left ? { ...w.left } : null,
    right: w.right ? { ...w.right } : null,
  };
}

function pickEmote(): { emoteId: string; kind: MemeKind } {
  if (Math.random() < getRoundBombChance()) {
    return { emoteId: pickBombEmoteId(), kind: "bomb" };
  }
  return { emoteId: pickGoodEmoteId(), kind: "good" };
}

function spawnMeme(state: GameState) {
  const { emoteId, kind } = pickEmote();
  const vy =
    CONFIG.LAUNCH_VY_MIN +
    Math.random() * (CONFIG.LAUNCH_VY_MAX - CONFIG.LAUNCH_VY_MIN);
  state.memes.push({
    id: state.nextMemeId++,
    emoteId,
    kind,
    x: 0.08 + Math.random() * 0.84,
    y: 1.08,
    vx: (Math.random() - 0.5) * CONFIG.LAUNCH_VX,
    vy: -vy,
    radius: CONFIG.MEME_RADIUS,
    rotation: (Math.random() - 0.5) * 0.6,
    rotSpeed: (Math.random() - 0.5) * 0.06,
    alive: true,
  });
}

function spawnBurst(state: GameState, x: number, y: number, kind: MemeKind) {
  const colors =
    kind === "bomb"
      ? ["#ff2200", "#ff6600", "#ffaa00"]
      : ["#00e5ff", "#ff00aa", "#ffe066", "#ffffff"];
  for (let i = 0; i < 28; i++) {
    state.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 0.014,
      vy: (Math.random() - 0.5) * 0.014 - 0.006,
      life: 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 3 + Math.random() * 5,
    });
  }
}

function splitMeme(state: GameState, meme: Meme, side: WristSide) {
  meme.alive = false;
  const dir = side === "left" ? -1 : 1;
  for (const clipSide of ["left", "right"] as const) {
    state.halves.push({
      id: state.nextHalfId++,
      emoteId: meme.emoteId,
      kind: meme.kind,
      x: meme.x,
      y: meme.y,
      vx: meme.vx + dir * 0.005 * (clipSide === "left" ? -1 : 1),
      vy: meme.vy - 0.004,
      radius: meme.radius,
      rotation: meme.rotation,
      rotSpeed: meme.rotSpeed + dir * 0.08,
      life: 1,
      clipSide,
    });
  }
  spawnBurst(state, meme.x, meme.y, meme.kind);
}

function addTrail(state: GameState, side: WristSide, w: PlayerWrists) {
  const pt = w[side];
  const prev = state.smoothedWrists[side];
  if (!pt) return;
  state.trail.push({
    x: pt.x,
    y: pt.y,
    life: 1,
    side,
    speed: wristSpeed(prev, pt),
  });
}

function processCut(state: GameState, meme: Meme, side: WristSide) {
  if (!meme.alive) return;
  splitMeme(state, meme, side);

  if (meme.kind === "bomb") {
    state.score = Math.max(0, state.score - CONFIG.BOMB_PENALTY);
    state.combo = 0;
    state.comboTimer = 0;
    state.flashRed = 1;
    bombSound();
    state.lives = Math.max(0, state.lives - 1);

    const meta = getEmoteMeta(meme.emoteId);
    const name = meta?.name ?? "???";
    state.lifeLostTaunt = {
      emoteId: meme.emoteId,
      name,
      message: getBombTauntMessage(name),
      life: CONFIG.LIFE_LOST_TAUNT_MS / 1000,
    };
    state.comboPop = { text: "¡-1 VIDA!", life: 1.2 };

    if (state.lives <= 0) {
      state.playing = false;
      state.gameOver = true;
      state.gameOverReason = "lives";
      gameOverSound();
    }
    return;
  }

  const now = performance.now();
  if (now - state.comboTimer < CONFIG.COMBO_WINDOW_MS) {
    state.combo += 1;
  } else {
    state.combo = 1;
  }
  state.comboTimer = now;

  const mult = 1 + (state.combo - 1) * 0.5;
  state.score += Math.round(CONFIG.BASE_POINTS * mult);
  slashSound(state.combo);

  if (state.combo >= 2) {
    state.comboPop = { text: `x${state.combo} COMBO`, life: 1 };
    comboPopSound();
  }
}

function hudSnapshot(state: GameState): HudSnapshot {
  const timeLeftSec = state.playing
    ? Math.max(0, Math.ceil((state.roundEndAt - performance.now()) / 1000))
    : CONFIG.ROUND_DURATION_MS / 1000;
  return {
    score: state.score,
    combo: state.combo,
    timeLeftSec,
    lives: state.lives,
    maxLives: state.maxLives,
    playing: state.playing,
    demo: state.demo,
    connected: state.connected,
    gameOver: state.gameOver,
    gameOverReason: state.gameOverReason,
    comboPop:
      state.comboPop && state.comboPop.life > 0 ? state.comboPop.text : null,
    lifeLostTaunt:
      state.lifeLostTaunt && state.lifeLostTaunt.life > 0
        ? {
            emoteId: state.lifeLostTaunt.emoteId,
            name: state.lifeLostTaunt.name,
            message: state.lifeLostTaunt.message,
          }
        : null,
  };
}

function emitHud(state: GameState) {
  state.onHudUpdate?.(hudSnapshot(state));
}

export function setPlayerWrists(
  state: GameState,
  player: PlayerWrists | null,
  videoW?: number,
  videoH?: number,
) {
  if (videoW && videoH) {
    state.videoW = videoW;
    state.videoH = videoH;
  }

  if (!player) {
    state.wrists = createEmptyWrists();
    state.wristVel = { left: null, right: null };
    state.wristReceivedAt = performance.now();
    return;
  }

  const cleaned = dedupeWrists(player);
  const mapped =
    state.videoW > 0 && state.videoH > 0
      ? mapWristsToCanvasSpace(
          cleaned,
          state.videoW,
          state.videoH,
          state.canvasW,
          state.canvasH,
        )
      : cleaned;

  const now = performance.now();
  const dtSec = state.wristReceivedAt > 0 ? (now - state.wristReceivedAt) / 1000 : 0;
  if (dtSec > 0 && dtSec < 0.5) {
    updateWristVel(state, mapped, dtSec);
  } else {
    state.wristVel = { left: null, right: null };
  }

  state.wrists = mapped;
  state.wristReceivedAt = now;
}

function updateWristVel(state: GameState, next: PlayerWrists, dtSec: number) {
  const vel = (side: WristSide): WristVelocity | null => {
    const prev = state.wrists[side];
    const curr = next[side];
    if (!prev || !curr) return null;
    return {
      vx: (curr.x - prev.x) / dtSec,
      vy: (curr.y - prev.y) / dtSec,
    };
  };
  state.wristVel = { left: vel("left"), right: vel("right") };
}

export function setVideoSize(state: GameState, videoW: number, videoH: number) {
  if (videoW > 0 && videoH > 0) {
    state.videoW = videoW;
    state.videoH = videoH;
  }
}

export function startRound(state: GameState) {
  beginRoundEmotes();
  state.playing = true;
  state.gameOver = false;
  state.gameOverReason = null;
  state.lives = CONFIG.STARTING_LIVES;
  state.maxLives = CONFIG.STARTING_LIVES;
  state.lifeLostTaunt = null;
  state.score = 0;
  state.combo = 0;
  state.comboTimer = 0;
  state.memes = [];
  state.halves = [];
  state.particles = [];
  state.trail = [];
  state.flashRed = 0;
  state.comboPop = null;
  state.prevRawWrists = createEmptyWrists();
  state.lastSpawnAt = performance.now();
  state.spawnInterval = CONFIG.SPAWN_INTERVAL_MS;
  state.roundEndAt = performance.now() + CONFIG.ROUND_DURATION_MS;
  emitHud(state);
}

export function resetGame(state: GameState) {
  state.playing = false;
  state.gameOver = false;
  state.gameOverReason = null;
  state.lives = CONFIG.STARTING_LIVES;
  state.lifeLostTaunt = null;
  state.score = 0;
  state.combo = 0;
  state.memes = [];
  state.halves = [];
  state.particles = [];
  state.trail = [];
  state.flashRed = 0;
  state.comboPop = null;
  state.prevRawWrists = createEmptyWrists();
  emitHud(state);
}

function getRawWrists(state: GameState, now: number): PlayerWrists {
  if (state.demo) return getDemoWrists(now);
  const elapsed = now - state.wristReceivedAt;
  return extrapolateWrists(
    state.wrists,
    state.wristVel,
    elapsed,
    CONFIG.WRIST_EXTRAP_MS,
  );
}

export function tick(state: GameState, now: number) {
  state.time = now;
  const rawWrists = getRawWrists(state, now);

  state.smoothedWrists = smoothWrists(
    state.smoothedWrists,
    rawWrists,
    CONFIG.EMA_ALPHA,
  );

  if (state.playing && !state.gameOver) {
    if (now >= state.roundEndAt) {
      state.playing = false;
      state.gameOver = true;
      state.gameOverReason = "time";
      gameOverSound();
      emitHud(state);
    }

    const hits = checkWristCuts(
      state.prevRawWrists.left,
      state.prevRawWrists.right,
      rawWrists.left,
      rawWrists.right,
      state.memes,
      state.canvasW,
      state.canvasH,
    );
    for (const { meme, side } of hits) {
      processCut(state, meme, side);
    }

    const elapsed = CONFIG.ROUND_DURATION_MS - (state.roundEndAt - now);
    state.spawnInterval = Math.max(
      CONFIG.MIN_SPAWN_INTERVAL_MS,
      CONFIG.SPAWN_INTERVAL_MS - elapsed * 0.00018,
    );

    if (now - state.lastSpawnAt >= state.spawnInterval) {
      spawnMeme(state);
      state.lastSpawnAt = now;
    }

    for (const meme of state.memes) {
      if (!meme.alive) continue;
      meme.vy += CONFIG.GRAVITY;
      meme.x += meme.vx;
      meme.y += meme.vy;
      meme.rotation += meme.rotSpeed;
    }
    state.memes = state.memes.filter((m) => m.alive && m.y > -0.2);
  }

  state.prevRawWrists = cloneWrists(rawWrists);

  addTrail(state, "left", state.smoothedWrists);
  addTrail(state, "right", state.smoothedWrists);

  for (const h of state.halves) {
    h.vy += CONFIG.GRAVITY;
    h.x += h.vx;
    h.y += h.vy;
    h.rotation += h.rotSpeed;
    h.life -= 0.02;
  }
  state.halves = state.halves.filter((h) => h.life > 0);

  for (const p of state.particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += CONFIG.GRAVITY * 0.5;
    p.life -= 0.025;
  }
  state.particles = state.particles.filter((p) => p.life > 0);

  for (const t of state.trail) t.life -= 0.08;
  state.trail = state.trail.filter((t) => t.life > 0);
  if (state.trail.length > 80) state.trail.splice(0, state.trail.length - 80);

  if (state.flashRed > 0) state.flashRed -= 0.05;
  if (state.comboPop) state.comboPop.life -= 0.016;
  if (state.lifeLostTaunt) state.lifeLostTaunt.life -= 0.016;

  emitHud(state);
}

function normToPx(state: GameState, x: number, y: number) {
  return { px: x * state.canvasW, py: y * state.canvasH };
}

function drawTrail(ctx: CanvasRenderingContext2D, state: GameState) {
  const bySide: Record<WristSide, TrailPoint[]> = { left: [], right: [] };
  for (const t of state.trail) bySide[t.side].push(t);

  for (const side of ["left", "right"] as WristSide[]) {
    const pts = bySide[side];
    if (pts.length < 2) continue;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      const { px: x1, py: y1 } = normToPx(state, a.x, a.y);
      const { px: x2, py: y2 } = normToPx(state, b.x, b.y);
      const alpha = Math.min(a.life, b.life) * 0.85;
      ctx.strokeStyle =
        side === "right"
          ? `rgba(0, 229, 255, ${alpha})`
          : `rgba(255, 100, 255, ${alpha})`;
      ctx.lineWidth = 4 + b.speed * 1200;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function bombShakeOffset(t: number): { dx: number; dy: number; extraRot: number } {
  return {
    dx: Math.sin(t * 0.028) * 7 + Math.sin(t * 0.047) * 4,
    dy: Math.cos(t * 0.034) * 7 + Math.cos(t * 0.021) * 4,
    extraRot: Math.sin(t * 0.04) * 0.12,
  };
}

function drawEmote(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  emoteId: string,
  x: number,
  y: number,
  radius: number,
  rotation: number,
  alpha = 1,
  clipSide?: "left" | "right",
  kind: MemeKind = "good",
) {
  const { px, py } = normToPx(state, x, y);
  const size = radius * state.canvasW * 2.2;
  const img = getEmoteImage(emoteId);
  const isBomb = kind === "bomb";
  const shake = isBomb ? bombShakeOffset(state.time) : null;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(px, py);
  if (shake) {
    ctx.translate(shake.dx, shake.dy);
    ctx.rotate(rotation + shake.extraRot);
  } else {
    ctx.rotate(rotation);
  }

  if (clipSide === "left") {
    ctx.beginPath();
    ctx.rect(-size, -size, size, size * 2);
    ctx.clip();
  } else if (clipSide === "right") {
    ctx.beginPath();
    ctx.rect(0, -size, size, size * 2);
    ctx.clip();
  }

  if (isBomb) {
    const pulse = 0.55 + Math.sin(state.time * 0.014) * 0.2;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.58, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 0, 0, ${pulse * 0.35})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(255, 40, 40, ${0.75 + Math.sin(state.time * 0.018) * 0.2})`;
    ctx.lineWidth = 4 + Math.sin(state.time * 0.012) * 1.5;
    ctx.stroke();
  }

  if (img?.complete && img.naturalWidth > 0) {
    if (isBomb) {
      const pulse = 18 + Math.sin(state.time * 0.012) * 12;
      ctx.shadowColor = "rgba(255, 0, 0, 1)";
      ctx.shadowBlur = pulse;
    } else {
      ctx.shadowColor = "rgba(255,255,255,0.35)";
      ctx.shadowBlur = 14;
    }
    ctx.drawImage(img, -size / 2, -size / 2, size, size);
    if (isBomb) {
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = "rgba(255, 0, 0, 0.48)";
      ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.globalCompositeOperation = "source-over";
    }
  } else {
    ctx.fillStyle = isBomb ? "#ff2020" : "#ff00aa";
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawWristDebug(ctx: CanvasRenderingContext2D, state: GameState) {
  for (const side of ["left", "right"] as WristSide[]) {
    const w = state.smoothedWrists[side];
    if (!w) continue;
    const { px, py } = normToPx(state, w.x, w.y);
    ctx.beginPath();
    ctx.arc(px, py, 10, 0, Math.PI * 2);
    ctx.fillStyle = side === "right" ? "#00e5ff" : "#ff64ff";
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

export function draw(ctx: CanvasRenderingContext2D, state: GameState) {
  ctx.clearRect(0, 0, state.canvasW, state.canvasH);

  if (state.flashRed > 0) {
    ctx.fillStyle = `rgba(255, 0, 0, ${state.flashRed * 0.35})`;
    ctx.fillRect(0, 0, state.canvasW, state.canvasH);
  }

  drawTrail(ctx, state);

  for (const meme of state.memes) {
    if (!meme.alive) continue;
    drawEmote(
      ctx,
      state,
      meme.emoteId,
      meme.x,
      meme.y,
      meme.radius,
      meme.rotation,
      1,
      undefined,
      meme.kind,
    );
  }

  for (const h of state.halves) {
    drawEmote(
      ctx,
      state,
      h.emoteId,
      h.x,
      h.y,
      h.radius,
      h.rotation,
      h.life,
      h.clipSide,
      h.kind,
    );
  }

  for (const p of state.particles) {
    const { px, py } = normToPx(state, p.x, p.y);
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(px, py, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  drawWristDebug(ctx, state);
}

export function setCanvasSize(state: GameState, w: number, h: number) {
  state.canvasW = w;
  state.canvasH = h;
}
