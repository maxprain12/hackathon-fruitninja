"use client";

import {
  BOMB_EMOTES,
  emoteUrl,
  LEGEND_GOOD_SAMPLE,
} from "@/lib/game/emotes";

function EmoteChip({
  id,
  name,
  variant,
}: {
  id: string;
  name: string;
  variant: "good" | "bomb";
}) {
  const border =
    variant === "good"
      ? "border-emerald-400/60 ring-emerald-500/20"
      : "border-red-500/80 ring-red-500/30 animate-pulse";

  return (
    <div
      className={`flex flex-col items-center gap-1 rounded-lg border bg-black/40 p-1.5 ring-1 ${border}`}
      title={name}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={emoteUrl(id)}
        alt={name}
        width={40}
        height={40}
        className="h-10 w-10 object-contain"
      />
      <span className="max-w-[4.5rem] truncate text-[10px] text-zinc-300">
        {name}
      </span>
    </div>
  );
}

export function EmoteLegend() {
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
          {LEGEND_GOOD_SAMPLE.map((e) => (
            <EmoteChip key={e.id} id={e.id} name={e.name} variant="good" />
          ))}
          <span className="self-center text-xs text-zinc-500">+ más…</span>
        </div>
      </section>

      <section>
        <p className="mb-1.5 flex items-center gap-1.5 text-red-400">
          <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
          Evita = pierdes puntos
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
