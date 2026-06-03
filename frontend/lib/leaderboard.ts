import { CONFIG } from "./config";

export interface LeaderboardEntry {
  player_name: string;
  score: number;
  created_at: string;
}

export async function fetchLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch(`${CONFIG.API_URL}/leaderboard?limit=${limit}`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function submitScore(
  playerName: string,
  score: number,
): Promise<LeaderboardEntry | null> {
  try {
    const res = await fetch(`${CONFIG.API_URL}/leaderboard`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player_name: playerName.trim(), score }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
