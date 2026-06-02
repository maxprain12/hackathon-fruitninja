"use client";

import type { HudSnapshot } from "@/lib/game/types";

interface GameHUDProps {
  hud: HudSnapshot;
  playerName?: string;
}

export function GameHUD({ hud, playerName = "Anónimo" }: GameHUDProps) {
  return (
    <>
      <div className="pointer-events-none absolute left-1/2 top-5 z-10 -translate-x-1/2 text-center">
        <h1 className="font-display text-[clamp(20px,3.4vw,46px)] leading-none tracking-wider">
          <span className="bg-gradient-to-b from-[#ffd27a] to-[#ff3b00] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,80,0,0.5)]">
            MEME NINJA
          </span>
          <small className="mt-1.5 block font-body text-[0.32em] tracking-[6px] text-[#ff9d5c]">
            CURSOR MADRID · HACK #3
          </small>
        </h1>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-[96px] z-10 -translate-x-1/2 text-center">
        <div className="font-display text-[clamp(60px,12vw,150px)] leading-[0.85] text-white drop-shadow-[0_0_40px_#00e5ff,0_6px_0_#004466]">
          {hud.score}
          <span className="mt-2 block text-[0.18em] tracking-[8px] text-[#7ae8ff] drop-shadow-none">
            PUNTOS
          </span>
        </div>
      </div>

      <div className="pointer-events-none absolute right-6 top-6 z-10 text-right">
        <div className="font-display text-5xl text-white drop-shadow-[0_0_20px_#00e5ff]">
          {hud.timeLeftSec}s
        </div>
        {hud.combo >= 2 && (
          <div className="mt-1 font-body text-lg font-bold tracking-widest text-[#ff64ff]">
            x{hud.combo} combo
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute bottom-6 left-4 z-10 flex max-w-[14rem] items-center gap-2 text-xs tracking-wider text-[#7ae8ff]">
        <span
          className={`h-2.5 w-2.5 rounded-full shadow-[0_0_10px_currentColor] ${
            hud.connected ? "bg-[#10e0c0] text-[#10e0c0]" : "animate-pulse bg-[#ff3b00] text-[#ff3b00]"
          }`}
        />
        <span>
          {hud.demo
            ? "SIN CONEXIÓN · modo demo"
            : hud.connected
              ? "CÁMARA + LIBREYOLO · en vivo"
              : "CONECTANDO…"}
        </span>
      </div>

      {hud.comboPop && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 animate-pulse font-display text-[clamp(32px,6vw,80px)] text-[#ffe066] drop-shadow-[0_0_30px_#ff00aa]">
          {hud.comboPop}
        </div>
      )}

      {hud.gameOver && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[radial-gradient(circle,rgba(0,20,40,0.88),rgba(2,0,8,0.97))]">
          <h2 className="font-display text-[clamp(40px,9vw,120px)] bg-gradient-to-b from-[#7ae8ff] to-[#ff00aa] bg-clip-text text-transparent drop-shadow-[0_0_50px_#00e5ff]">
            ¡TIEMPO!
          </h2>
          <p className="mt-2 font-body text-lg text-[#7ae8ff]">
            {playerName}
          </p>
          <p className="mt-3 font-body text-[clamp(18px,3vw,32px)] text-[#ffd27a]">
            Puntuación final: <strong className="text-white">{hud.score}</strong>
          </p>
          <p className="mt-2 font-body text-sm text-zinc-400">
            Guardada en el leaderboard
          </p>
        </div>
      )}
    </>
  );
}
