"use client";

import { useState } from "react";
import { TOTAL_LEVELS } from "@/game/levels";
import ScoreSubmit from "./ScoreSubmit";

interface AllCompleteProps {
  attempts: Record<number, number>;
  onMenu: () => void;
}

export default function AllComplete({ attempts, onMenu }: AllCompleteProps) {
  const [submitted, setSubmitted] = useState(false);
  const totalAttempts = Object.values(attempts).reduce((sum, a) => sum + a, 0);

  return (
    <div className="flex flex-col items-center gap-6 animate-fadeIn max-w-sm px-4">
      <div className="text-yellow-400 text-sm tracking-widest uppercase">Congratulations</div>
      <div className="text-4xl font-bold text-white text-center">All Mazes Conquered!</div>

      <div className="w-full p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="text-white/40 text-xs uppercase tracking-wider mb-3">Summary</div>
        <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-1">
          {Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1).map((level) => (
            <div key={level} className="flex justify-between text-sm">
              <span className="text-white/50">Level {level}</span>
              <span className="text-white font-mono">
                {attempts[level] || "—"}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 mt-3 pt-3 flex justify-between">
          <span className="text-white/50 text-sm">Total attempts</span>
          <span className="text-orange-400 font-bold font-mono text-lg">{totalAttempts}</span>
        </div>
      </div>

      {!submitted ? (
        <ScoreSubmit totalAttempts={totalAttempts} onSubmitted={() => setSubmitted(true)} />
      ) : (
        <div className="text-emerald-400 text-sm">Score submitted!</div>
      )}

      <button
        onClick={onMenu}
        className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 font-medium transition-all"
      >
        Back to Menu
      </button>
    </div>
  );
}
