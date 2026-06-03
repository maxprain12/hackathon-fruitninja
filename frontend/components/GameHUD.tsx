"use client";

import { emoteUrl } from "@/lib/game/emotes";
import type { HudSnapshot } from "@/lib/game/types";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface GameHUDProps {
  hud: HudSnapshot;
  playerName?: string;
  saveStatus?: SaveStatus;
  onPlayerNameChange?: (name: string) => void;
  onSaveScore?: () => void;
  onPlayAgain?: () => void;
}

export function GameHUD({
  hud,
  playerName = "",
  saveStatus = "idle",
  onPlayerNameChange,
  onSaveScore,
  onPlayAgain,
}: GameHUDProps) {
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

      <div
        className={`pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 text-center ${
          hud.playing && !hud.gameOver ? "top-[132px]" : "top-[96px]"
        }`}
      >
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
        <div className="mt-2 flex justify-end gap-1.5">
          {Array.from({ length: hud.maxLives }).map((_, i) => (
            <span
              key={i}
              className={`text-2xl transition-all duration-300 ${
                i < hud.lives
                  ? "scale-100 opacity-100 drop-shadow-[0_0_8px_#ff4466]"
                  : "scale-75 opacity-25 grayscale"
              }`}
            >
              ❤️
            </span>
          ))}
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

      {hud.lifeLostTaunt && (
        <div className="pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center bg-[rgba(80,0,0,0.72)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={emoteUrl(hud.lifeLostTaunt.emoteId)}
            alt={hud.lifeLostTaunt.name}
            className="animate-taunt-meme h-[min(55vh,420px)] w-[min(55vh,420px)] object-contain drop-shadow-[0_0_60px_#ff0000]"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <p className="mt-4 font-display text-[clamp(28px,5vw,64px)] text-red-400 drop-shadow-[0_0_30px_#ff0000]">
            {hud.lifeLostTaunt.message}
          </p>
          <p className="mt-2 font-body text-lg text-red-300/80">
            −1 vida · te quedan {hud.lives}
          </p>
        </div>
      )}

      {hud.gameOver && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[radial-gradient(circle,rgba(0,20,40,0.88),rgba(2,0,8,0.97))]">
          <h2 className="font-display text-[clamp(40px,9vw,120px)] bg-gradient-to-b from-[#7ae8ff] to-[#ff00aa] bg-clip-text text-transparent drop-shadow-[0_0_50px_#00e5ff]">
            {hud.gameOverReason === "lives" ? "¡SIN VIDAS!" : "¡TIEMPO!"}
          </h2>
          <p className="mt-3 font-body text-[clamp(18px,3vw,32px)] text-[#ffd27a]">
            Puntuación final: <strong className="text-white">{hud.score}</strong>
          </p>

          <div className="mt-8 flex flex-col items-center gap-4">
            <label className="flex flex-col items-center gap-2">
              <span className="font-body text-xs uppercase tracking-wide text-[#7ae8ff]">
                Tu nombre
              </span>
              <input
                type="text"
                value={playerName}
                onChange={(e) => onPlayerNameChange?.(e.target.value)}
                maxLength={32}
                placeholder="Anónimo"
                disabled={saveStatus === "saving" || saveStatus === "saved"}
                className="w-56 rounded-lg border border-[rgba(0,229,255,0.35)] bg-black/40 px-4 py-2.5 text-center font-body text-sm text-white placeholder:text-zinc-500 focus:border-[#00e5ff] focus:outline-none disabled:opacity-60"
              />
            </label>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={onSaveScore}
                disabled={saveStatus === "saving" || saveStatus === "saved"}
                className="rounded-xl bg-gradient-to-b from-[#7ae8ff] to-[#0066cc] px-6 py-3 font-body text-sm font-extrabold uppercase tracking-wide text-[#001a33] shadow-[0_4px_0_#003366,0_0_20px_rgba(0,229,255,0.4)] transition active:translate-y-0.5 disabled:opacity-50"
              >
                {saveStatus === "saving"
                  ? "Guardando…"
                  : saveStatus === "saved"
                    ? "¡Guardada!"
                    : "Guardar puntuación"}
              </button>
              <button
                type="button"
                onClick={onPlayAgain}
                className="rounded-xl border border-[#00e5ff] bg-transparent px-6 py-3 font-body text-sm font-extrabold uppercase tracking-wide text-[#7ae8ff]"
              >
                Jugar de nuevo
              </button>
            </div>

            {saveStatus === "saved" && (
              <p className="font-body text-sm text-[#10e0c0]">
                Guardada en el leaderboard
              </p>
            )}
            {saveStatus === "error" && (
              <p className="font-body text-sm text-[#ff6b6b]">
                No se pudo guardar. ¿Está el backend activo?
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
