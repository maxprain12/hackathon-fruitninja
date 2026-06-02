"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchLeaderboard, type LeaderboardEntry } from "@/lib/leaderboard";

interface LeaderboardPanelProps {
  refreshKey?: number;
}

export function LeaderboardPanel({ refreshKey = 0 }: LeaderboardPanelProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchLeaderboard(10);
    setEntries(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  return (
    <aside className="rounded-xl border border-zinc-700/80 bg-zinc-950/90 p-3 text-sm shadow-lg backdrop-blur">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Leaderboard
        </h2>
        <button
          type="button"
          onClick={() => void load()}
          className="text-xs text-zinc-500 hover:text-zinc-300"
        >
          ↻
        </button>
      </div>

      {loading && entries.length === 0 ? (
        <p className="text-xs text-zinc-500">Cargando…</p>
      ) : entries.length === 0 ? (
        <p className="text-xs text-zinc-500">Aún no hay puntuaciones.</p>
      ) : (
        <ol className="space-y-1">
          {entries.map((entry, i) => (
            <li
              key={`${entry.player_name}-${entry.created_at}-${i}`}
              className="flex items-center justify-between rounded-md bg-black/30 px-2 py-1"
            >
              <span className="flex items-center gap-2 truncate">
                <span className="w-5 text-right text-xs text-zinc-500">
                  {i + 1}.
                </span>
                <span className="truncate font-medium text-zinc-200">
                  {entry.player_name}
                </span>
              </span>
              <span className="ml-2 shrink-0 font-mono text-amber-300">
                {entry.score.toLocaleString()}
              </span>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}
