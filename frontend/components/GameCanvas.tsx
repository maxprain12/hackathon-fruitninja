"use client";

import { useEffect, useRef } from "react";
import { draw, setCanvasSize, setVideoSize, tick } from "@/lib/game/engine";
import type { GameState } from "@/lib/game/types";

interface GameCanvasProps {
  engineRef: React.RefObject<GameState | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export function GameCanvas({ engineRef, videoRef }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const state = engineRef.current;
    const canvas = canvasRef.current;
    if (!state || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      setCanvasSize(state, w, h);
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = (now: number) => {
      const video = videoRef.current;
      if (video && video.videoWidth > 0 && video.videoHeight > 0) {
        setVideoSize(state, video.videoWidth, video.videoHeight);
      }
      tick(state, now);
      draw(ctx, state);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [engineRef]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        style={{ transform: "scaleX(-1)" }}
      />
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
    </div>
  );
}
