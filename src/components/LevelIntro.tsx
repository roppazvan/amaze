"use client";

import { useEffect } from "react";
import { getLevelConfig } from "@/game/levels";

interface LevelIntroProps {
  level: number;
  attempts: number;
  onStart: () => void;
}

export default function LevelIntro({ level, attempts, onStart }: LevelIntroProps) {
  const config = getLevelConfig(level);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onStart();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onStart]);

  return (
    <div className="flex flex-col items-center gap-6 animate-fadeIn">
      <div className="text-white/40 text-sm tracking-widest uppercase">Level</div>
      <div className="text-8xl font-bold text-white animate-bounceIn">{level}</div>
      <div className="text-white/30 text-sm">
        {config.gridSize} x {config.gridSize} maze
      </div>
      {attempts > 0 && (
        <div className="text-orange-400/60 text-sm">
          Previous attempts: {attempts}
        </div>
      )}
      <button
        onClick={onStart}
        className="mt-4 px-8 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-semibold transition-all hover:scale-105 active:scale-95"
      >
        Enter Maze
      </button>
      <div className="text-white/20 text-xs">Press Enter or Space to start</div>
    </div>
  );
}
