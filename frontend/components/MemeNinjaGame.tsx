"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EmoteLegend } from "@/components/EmoteLegend";
import { GameCanvas } from "@/components/GameCanvas";
import { GameControls } from "@/components/GameControls";
import { GameHUD } from "@/components/GameHUD";
import { LeaderboardPanel } from "@/components/LeaderboardPanel";
import { resumeAudio } from "@/lib/game/audio";
import { preloadEmotes } from "@/lib/game/emotes";
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
  playing: false,
  demo: true,
  connected: false,
  gameOver: false,
  comboPop: null,
};

export function MemeNinjaGame() {
  const engineRef = useRef<GameState | null>(null);
  if (!engineRef.current) {
    engineRef.current = createGameState();
  }
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const stopPumpRef = useRef<(() => void) | null>(null);
  const submittedRef = useRef(false);

  const [hud, setHud] = useState<HudSnapshot>(defaultHud);
  const [demo, setDemo] = useState(true);
  const [playerName, setPlayerName] = useState("");
  const [leaderboardKey, setLeaderboardKey] = useState(0);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.onHudUpdate = setHud;
    }
    void preloadEmotes();
  }, []);

  useEffect(() => {
    if (!hud.gameOver || submittedRef.current) return;
    const name = playerName.trim() || "Anónimo";
    submittedRef.current = true;
    void submitScore(name, hud.score).then(() => {
      setLeaderboardKey((k) => k + 1);
    });
  }, [hud.gameOver, hud.score, playerName]);

  const applyWrists = useCallback((player: PlayerWrists | null) => {
    const engine = engineRef.current;
    if (!engine) return;
    const video = videoRef.current;
    setPlayerWrists(
      engine,
      player,
      video?.videoWidth,
      video?.videoHeight,
    );
  }, []);

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
    submittedRef.current = false;
    if (engineRef.current) startRound(engineRef.current);
  }, []);

  const handleReset = useCallback(() => {
    submittedRef.current = false;
    if (engineRef.current) resetGame(engineRef.current);
    if (wsRef.current) sendReset(wsRef.current);
  }, []);

  const handleToggleCamera = useCallback(() => {
    resumeAudio();
    if (demo) void connectCamera();
    else disconnectCamera();
  }, [demo, connectCamera, disconnectCamera]);

  useEffect(() => {
    return () => disconnectCamera();
  }, [disconnectCamera]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#040810]">
      <GameCanvas engineRef={engineRef} videoRef={videoRef} />
      <GameHUD hud={hud} playerName={playerName.trim() || "Anónimo"} />

      <div className="pointer-events-auto absolute left-4 top-4 z-20 flex w-56 flex-col gap-3 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <EmoteLegend />
        <LeaderboardPanel refreshKey={leaderboardKey} />
      </div>

      <GameControls
        demo={demo}
        playing={hud.playing}
        playerName={playerName}
        onPlayerNameChange={setPlayerName}
        onStart={handleStart}
        onReset={handleReset}
        onToggleCamera={handleToggleCamera}
      />
    </div>
  );
}
