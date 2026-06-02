let actx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    actx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    return actx;
  } catch {
    return null;
  }
}

function tone(freq: number, duration: number, type: OscillatorType, gain = 0.25) {
  const ctx = getCtx();
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, ctx.currentTime);
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + duration);
}

export function slashSound(comboLevel: number) {
  const base = 220 + comboLevel * 40;
  tone(base, 0.12, "sawtooth", 0.2);
  tone(base * 1.5, 0.08, "triangle", 0.12);
}

export function bombSound() {
  tone(80, 0.35, "sawtooth", 0.35);
  tone(40, 0.4, "square", 0.2);
}

export function comboPopSound() {
  tone(440, 0.1, "sine", 0.15);
  tone(660, 0.12, "sine", 0.12);
}

export function gameOverSound() {
  tone(330, 0.2, "triangle", 0.2);
  tone(220, 0.35, "triangle", 0.18);
}

export function resumeAudio() {
  const ctx = getCtx();
  if (ctx?.state === "suspended") void ctx.resume();
}
