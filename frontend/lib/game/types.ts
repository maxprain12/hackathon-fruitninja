export type WristSide = "left" | "right";

export interface Vec2 {
  x: number;
  y: number;
  conf?: number;
}

export interface PlayerWrists {
  left: Vec2 | null;
  right: Vec2 | null;
}

export type MemeKind = "good" | "bomb";

export interface Meme {
  id: number;
  emoteId: string;
  kind: MemeKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  rotSpeed: number;
  alive: boolean;
}

export interface MemeHalf {
  id: number;
  emoteId: string;
  kind: MemeKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  rotSpeed: number;
  life: number;
  clipSide: "left" | "right";
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export interface TrailPoint {
  x: number;
  y: number;
  life: number;
  side: WristSide;
  speed: number;
}

export interface HudSnapshot {
  score: number;
  combo: number;
  timeLeftSec: number;
  playing: boolean;
  demo: boolean;
  connected: boolean;
  gameOver: boolean;
  comboPop: string | null;
}

export interface GameState {
  playing: boolean;
  demo: boolean;
  connected: boolean;
  score: number;
  combo: number;
  comboTimer: number;
  roundEndAt: number;
  gameOver: boolean;
  memes: Meme[];
  halves: MemeHalf[];
  particles: Particle[];
  trail: TrailPoint[];
  wrists: PlayerWrists;
  prevRawWrists: PlayerWrists;
  smoothedWrists: PlayerWrists;
  nextMemeId: number;
  nextHalfId: number;
  lastSpawnAt: number;
  spawnInterval: number;
  flashRed: number;
  comboPop: { text: string; life: number } | null;
  canvasW: number;
  canvasH: number;
  videoW: number;
  videoH: number;
  wristReceivedAt: number;
  wristVel: { left: { vx: number; vy: number } | null; right: { vx: number; vy: number } | null };
  time: number;
  onHudUpdate?: (snap: HudSnapshot) => void;
}
