"use client";

interface GameControlsProps {
  demo: boolean;
  playing: boolean;
  playerName: string;
  onPlayerNameChange: (name: string) => void;
  onStart: () => void;
  onReset: () => void;
  onToggleCamera: () => void;
}

export function GameControls({
  demo,
  playing,
  playerName,
  onPlayerNameChange,
  onStart,
  onReset,
  onToggleCamera,
}: GameControlsProps) {
  return (
    <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-wrap items-center justify-center gap-3 rounded-2xl border border-[rgba(0,229,255,0.3)] bg-[rgba(4,12,24,0.75)] px-4 py-3 backdrop-blur-md">
      <label className="flex items-center gap-2">
        <span className="font-body text-xs uppercase tracking-wide text-[#7ae8ff]">
          Jugador
        </span>
        <input
          type="text"
          value={playerName}
          onChange={(e) => onPlayerNameChange(e.target.value)}
          maxLength={32}
          placeholder="Tu nombre"
          className="w-36 rounded-lg border border-[rgba(0,229,255,0.35)] bg-black/40 px-3 py-2 font-body text-sm text-white placeholder:text-zinc-500 focus:border-[#00e5ff] focus:outline-none"
        />
      </label>
      <button
        type="button"
        onClick={onStart}
        disabled={playing}
        className="rounded-xl bg-gradient-to-b from-[#7ae8ff] to-[#0066cc] px-5 py-3 font-body text-sm font-extrabold uppercase tracking-wide text-[#001a33] shadow-[0_4px_0_#003366,0_0_20px_rgba(0,229,255,0.4)] transition active:translate-y-0.5 disabled:opacity-50"
      >
        Empezar ronda
      </button>
      <button
        type="button"
        onClick={onReset}
        className="rounded-xl border border-[#00e5ff] bg-transparent px-5 py-3 font-body text-sm font-extrabold uppercase tracking-wide text-[#7ae8ff]"
      >
        Reset
      </button>
      <button
        type="button"
        onClick={onToggleCamera}
        className="rounded-xl border border-[#00e5ff] bg-transparent px-5 py-3 font-body text-sm font-extrabold uppercase tracking-wide text-[#7ae8ff]"
      >
        {demo ? "Activar camara" : "Modo demo"}
      </button>
    </div>
  );
}
