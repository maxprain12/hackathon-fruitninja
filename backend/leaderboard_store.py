"""Persistencia simple del leaderboard en JSON."""

import json
import os
from datetime import datetime, timezone
from pathlib import Path

LEADERBOARD_PATH = Path(os.environ.get("LEADERBOARD_PATH", "leaderboard.json"))
MAX_ENTRIES = int(os.environ.get("LEADERBOARD_MAX_ENTRIES", "200"))


def _load() -> list[dict]:
    if not LEADERBOARD_PATH.exists():
        return []
    try:
        data = json.loads(LEADERBOARD_PATH.read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except (json.JSONDecodeError, OSError):
        return []


def _save(entries: list[dict]) -> None:
    LEADERBOARD_PATH.parent.mkdir(parents=True, exist_ok=True)
    LEADERBOARD_PATH.write_text(
        json.dumps(entries, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def list_top(limit: int = 10) -> list[dict]:
    limit = max(1, min(limit, 50))
    entries = sorted(_load(), key=lambda e: e.get("score", 0), reverse=True)
    return entries[:limit]


def add_entry(player_name: str, score: int) -> dict:
    name = player_name.strip()[:32] or "Anónimo"
    entry = {
        "player_name": name,
        "score": max(0, int(score)),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    entries = _load()
    entries.append(entry)
    entries.sort(key=lambda e: e.get("score", 0), reverse=True)
    _save(entries[:MAX_ENTRIES])
    return entry
