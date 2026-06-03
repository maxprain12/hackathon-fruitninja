"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BombWarningBar, EmoteLegendHub } from "@/components/EmoteLegend";
import { GameCanvas } from "@/components/GameCanvas";
import { GameControls } from "@/components/GameControls";
import { GameHUD } from "@/components/GameHUD";
import { LeaderboardPanel } from "@/components/LeaderboardPanel";
import { resumeAudio } from "@/lib/game/audio";
import {
  BOMB_EMOTES,
  getRoundBombEmotes,
  preloadEmotes,
  type EmoteMeta,
} from "@/lib/game/emotes";
import {
  createGameState,
  resetGame,
  setPlayerWrists,
  startRound,
} from "@/lib/game/engine";
import type { GameState, HudSnapshot, PlayerWrists } from "@/lib/game/types";
import { submitScore } from "@/lib/leaderboard";
import {
  connectWebSocket,
  getWebcamStream,
  sendReset,
  startPump,
} from "@/lib/websocket";

const defaultHud: HudSnapshot = {
  score: 0,
  combo: 0,
  timeLeftSec: 60,
  lives: 5,
  maxLives: 5,
  playing: false,
  demo: true,
  connected: false,
  gameOver: false,
  gameOverReason: null,
  comboPop: null,
  lifeLostTaunt: null,
};

export function MemeNinjaGame() {
  const engineRef = useRef<GameState | null>(null);
  if (!engineRef.current) {
    engineRef.current = createGameState();
  }
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const stopPumpRef = useRef<(() => void) | null>(null);
  const [hud, setHud] = useState<HudSnapshot>(defaultHud);
  const [demo, setDemo] = useState(true);
  const [playerName, setPlayerName] = useState("");
  const [leaderboardKey, setLeaderboardKey] = useState(0);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [roundBombs, setRoundBombs] = useState<EmoteMeta[]>(BOMB_EMOTES);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.onHudUpdate = setHud;
    }
    void preloadEmotes();
  }, []);

  const handleSaveScore = useCallback(async () => {
    if (saveStatus === "saving" || saveStatus === "saved") return;
    setSaveStatus("saving");
    const name = playerName.trim() || "Anónimo";
    const result = await submitScore(name, hud.score);
    if (result) {
      setSaveStatus("saved");
      setLeaderboardKey((k) => k + 1);
    } else {
      setSaveStatus("error");
    }
  }, [saveStatus, playerName, hud.score]);

  const applyWrists = useCallback(
    (frame: { player: PlayerWrists | null; frameW: number; frameH: number }) => {
      const engine = engineRef.current;
      if (!engine) return;
      const video = videoRef.current;
      const videoW =
        frame.frameW > 0 ? frame.frameW : (video?.videoWidth ?? 0);
      const videoH =
        frame.frameH > 0 ? frame.frameH : (video?.videoHeight ?? 0);
      setPlayerWrists(engine, frame.player, videoW, videoH);
    },
    [],
  );

  const disconnectCamera = useCallback(() => {
    stopPumpRef.current?.();
    stopPumpRef.current = null;
    wsRef.current?.close();
    wsRef.current = null;
    const video = videoRef.current;
    if (video?.srcObject) {
      (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    }
    if (engineRef.current) {
      engineRef.current.demo = true;
      engineRef.current.connected = false;
      engineRef.current.wrists = { left: null, right: null };
    }
    setDemo(true);
  }, []);

  const connectCamera = useCallback(async () => {
    resumeAudio();
    try {
      const stream = await getWebcamStream();
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;

      const ws = await connectWebSocket(applyWrists, () => {
        if (engineRef.current) {
          engineRef.current.demo = true;
          engineRef.current.connected = false;
        }
        setDemo(true);
      });

      wsRef.current = ws;
      if (engineRef.current) {
        engineRef.current.demo = false;
        engineRef.current.connected = true;
      }
      setDemo(false);
      stopPumpRef.current = startPump(ws, video);
    } catch (e) {
      alert(
        `No hay camara o backend disponible. Sigue en modo demo.\n${e instanceof Error ? e.message : ""}`,
      );
    }
  }, [applyWrists]);

  const handleStart = useCallback(() => {
    resumeAudio();
    setSaveStatus("idle");
    if (engineRef.current) startRound(engineRef.current);
    setRoundBombs(getRoundBombEmotes());
  }, []);

  const handleReset = useCallback(() => {
    setSaveStatus("idle");
    if (engineRef.current) resetGame(engineRef.current);
    if (wsRef.current) sendReset(wsRef.current);
  }, []);

  const handlePlayAgain = useCallback(() => {
    setSaveStatus("idle");
    if (engineRef.current) startRound(engineRef.current);
    setRoundBombs(getRoundBombEmotes());
  }, []);

  const handleToggleCamera = useCallback(() => {
    resumeAudio();
    if (demo) void connectCamera();
    else disconnectCamera();
  }, [demo, connectCamera, disconnectCamera]);

  useEffect(() => {
    return () => disconnectCamera();
  }, [disconnectCamera]);

  const inRound = hud.playing && !hud.gameOver;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#040810]">
      <GameCanvas engineRef={engineRef} videoRef={videoRef} />
      <GameHUD
        hud={hud}
        playerName={playerName}
        saveStatus={saveStatus}
        onPlayerNameChange={setPlayerName}
        onSaveScore={() => void handleSaveScore()}
        onPlayAgain={handlePlayAgain}
      />

      {inRound && <BombWarningBar bombs={roundBombs} />}

      {!inRound && (
        <div className="pointer-events-auto absolute left-4 top-4 z-20 flex w-56 max-h-[calc(100vh-8rem)] flex-col gap-3 overflow-y-auto">
          <EmoteLegendHub />
          <LeaderboardPanel refreshKey={leaderboardKey} />
        </div>
      )}

      <GameControls
        demo={demo}
        playing={hud.playing}
        gameOver={hud.gameOver}
        playerName={playerName}
        onPlayerNameChange={setPlayerName}
        onStart={handleStart}
        onReset={handleReset}
        onToggleCamera={handleToggleCamera}
      />
    </div>
  );
}
