"use client";

import { useState } from "react";
import { TOTAL_LEVELS } from "@/game/levels";
import ScoreSubmit from "./ScoreSubmit";

interface AllCompleteProps {
  attempts: Record<number, number>;
  levelTimes: Record<number, number>;
  onMenu: () => void;
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min === 0) return `${sec}s`;
  return `${min}m ${sec}s`;
}

export default function AllComplete({ attempts, levelTimes, onMenu }: AllCompleteProps) {
  const [submitted, setSubmitted] = useState(false);
  const totalAttempts = Object.values(attempts).reduce((sum, a) => sum + a, 0);
  const totalTimeMs = Object.values(levelTimes).reduce((sum, t) => sum + t, 0);

  return (
    <div className="flex flex-col items-center gap-6 animate-fadeIn max-w-sm px-4">
      <div className="text-yellow-400 text-sm tracking-widest uppercase">Congratulations</div>
      <div className="text-4xl font-bold text-white text-center">All Mazes Conquered!</div>

      <div className="w-full p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="text-white/40 text-xs uppercase tracking-wider mb-3">Summary</div>
        <div className="grid grid-cols-[1fr_3rem_3.5rem] gap-x-3 gap-y-1 max-h-52 overflow-y-auto pr-1 text-sm">
          <span className="text-white/30 text-xs">Level</span>
          <span className="text-white/30 text-xs text-right">Tries</span>
          <span className="text-white/30 text-xs text-right">Time</span>
          {Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1).map((level) => (
            <div key={level} className="contents">
              <span className="text-white/50">Level {level}</span>
              <span className="text-white font-mono text-right">{attempts[level] || "—"}</span>
              <span className="text-white/60 font-mono text-right text-xs">
                {levelTimes[level] ? formatTime(levelTimes[level]) : "—"}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 mt-3 pt-3 flex justify-between items-baseline">
          <span className="text-white/50 text-sm">Total</span>
          <div className="text-right">
            <span className="text-orange-400 font-bold font-mono text-lg">{totalAttempts} attempts</span>
            <span className="text-white/40 font-mono text-sm ml-2">{formatTime(totalTimeMs)}</span>
          </div>
        </div>
      </div>

      {!submitted ? (
        <ScoreSubmit
          totalAttempts={totalAttempts}
          totalTimeMs={totalTimeMs}
          onSubmitted={() => setSubmitted(true)}
        />
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
