"use client";

import { useEffect, useState } from "react";
import {
  BOMB_EMOTES,
  emoteUrl,
  LEGEND_GOOD_SAMPLE,
  sampleLegendGoodEmotes,
  type EmoteMeta,
} from "@/lib/game/emotes";

function EmoteChip({
  id,
  name,
  variant,
  compact = false,
}: {
  id: string;
  name: string;
  variant: "good" | "bomb";
  compact?: boolean;
}) {
  const border =
    variant === "good"
      ? "border-emerald-400/60 ring-emerald-500/20"
      : "border-red-500 animate-bomb-vibrate bg-red-950/30";

  return (
    <div
      className={`flex flex-col items-center gap-1 rounded-lg border bg-black/40 ring-1 ${border} ${
        compact ? "p-1" : "p-1.5"
      }`}
      title={name}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={emoteUrl(id)}
        alt={name}
        width={compact ? 32 : 40}
        height={compact ? 32 : 40}
        className={`object-contain ${compact ? "h-8 w-8" : "h-10 w-10"} ${
          variant === "bomb"
            ? "rounded-md ring-2 ring-red-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.85)] saturate-[1.35] hue-rotate-[-8deg]"
            : ""
        }`}
        onError={(e) => {
          e.currentTarget.style.visibility = "hidden";
        }}
      />
      {!compact && (
        <span className="max-w-[4.5rem] truncate text-[10px] text-zinc-300">
          {name}
        </span>
      )}
    </div>
  );
}

/** Leyenda completa en el menú (antes / después de jugar). */
export function EmoteLegendHub() {
  const [goodSample, setGoodSample] =
    useState<EmoteMeta[]>(LEGEND_GOOD_SAMPLE);

  useEffect(() => {
    setGoodSample(sampleLegendGoodEmotes(8));
  }, []);

  return (
    <aside className="rounded-xl border border-zinc-700/80 bg-zinc-950/90 p-3 text-sm shadow-lg backdrop-blur">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Leyenda de memes
      </h2>

      <section className="mb-3">
        <p className="mb-1.5 flex items-center gap-1.5 text-emerald-400">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
          Corta = suma puntos
        </p>
        <div className="flex flex-wrap gap-2">
          {goodSample.map((e) => (
            <EmoteChip key={e.id} id={e.id} name={e.name} variant="good" />
          ))}
          <span className="self-center text-xs text-zinc-500">+ más…</span>
        </div>
      </section>

      <section>
        <p className="mb-1.5 flex items-center gap-1.5 text-red-400">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500 shadow-[0_0_8px_#ff0000]" />
          Evita = pierdes puntos y vidas
        </p>
        <div className="flex flex-wrap gap-2">
          {BOMB_EMOTES.map((e) => (
            <EmoteChip key={e.id} id={e.id} name={e.name} variant="bomb" />
          ))}
        </div>
      </section>
    </aside>
  );
}

/** Barra superior con memes prohibidos de la partida actual. */
export function BombWarningBar({ bombs }: { bombs: EmoteMeta[] }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-[72px] z-20 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-red-500/50 bg-red-950/75 px-4 py-2 shadow-[0_0_24px_rgba(255,0,0,0.25)] backdrop-blur-md">
      <p className="shrink-0 font-body text-xs font-bold uppercase tracking-wider text-red-400">
        No cortar · rojo
      </p>
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {bombs.map((e) => (
          <EmoteChip
            key={e.id}
            id={e.id}
            name={e.name}
            variant="bomb"
            compact
          />
        ))}
      </div>
    </div>
  );
}
