"use client";

import { useEffect } from "react";

interface LevelCompleteProps {
  level: number;
  attempts: number;
  onNext: () => void;
  onMenu: () => void;
}

export default function LevelComplete({ level, attempts, onNext, onMenu }: LevelCompleteProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onNext]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn z-10">
      <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
        <div className="text-emerald-400 text-sm tracking-widest uppercase">Escaped!</div>
        <div className="text-4xl font-bold text-white">Level {level} Complete</div>
        <div className="text-white/40 text-sm">
          Solved in {attempts} {attempts === 1 ? "attempt" : "attempts"}
        </div>
        {attempts === 1 && (
          <div className="text-yellow-400 text-sm font-semibold">Perfect run!</div>
        )}
        <div className="flex gap-3 mt-2">
          <button
            onClick={onNext}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-all hover:scale-105 active:scale-95"
          >
            Next Level
          </button>
          <button
            onClick={onMenu}
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 font-medium transition-all"
          >
            Menu
          </button>
        </div>
        <div className="text-white/20 text-xs">Press Enter to continue</div>
      </div>
    </div>
  );
}
