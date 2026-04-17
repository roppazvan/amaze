"use client";

import { useEffect } from "react";

interface GameOverProps {
  level: number;
  attempts: number;
  onRetry: () => void;
  onMenu: () => void;
}

export default function GameOver({ level, attempts, onRetry, onMenu }: GameOverProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "r") {
        e.preventDefault();
        onRetry();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onRetry]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn z-10">
      <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
        <div className="text-red-400 text-sm tracking-widest uppercase">Dead End</div>
        <div className="text-4xl font-bold text-white">Trapped!</div>
        <div className="text-white/40 text-sm">
          Level {level} — Attempt #{attempts}
        </div>
        <div className="flex gap-3 mt-2">
          <button
            onClick={onRetry}
            className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-semibold transition-all hover:scale-105 active:scale-95"
          >
            Try Again
          </button>
          <button
            onClick={onMenu}
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 font-medium transition-all"
          >
            Menu
          </button>
        </div>
        <div className="text-white/20 text-xs">Press R or Enter to retry</div>
      </div>
    </div>
  );
}
