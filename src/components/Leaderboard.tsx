"use client";

import { useState, useEffect } from "react";
import { LeaderboardEntry } from "@/game/types";

interface LeaderboardProps {
  onBack: () => void;
}

export default function Leaderboard({ onBack }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.entries || []);
        setLoading(false);
      })
      .catch(() => {
        setEntries([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 animate-fadeIn w-full max-w-md px-4">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Leaderboard</h2>
        <p className="text-white/40 text-sm mt-1">
          Complete all 20 levels with the fewest total attempts
        </p>
      </div>

      <div className="w-full rounded-xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="grid grid-cols-[2.5rem_1fr_5rem] gap-2 px-4 py-2 text-xs text-white/40 uppercase tracking-wider border-b border-white/10">
          <span>#</span>
          <span>Player</span>
          <span className="text-right">Attempts</span>
        </div>

        {loading ? (
          <div className="px-4 py-8 text-center text-white/30 text-sm">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="px-4 py-8 text-center text-white/30 text-sm">
            No scores yet. Be the first to conquer all 20 levels!
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {entries.map((entry, i) => (
              <div
                key={entry.id || i}
                className={`grid grid-cols-[2.5rem_1fr_5rem] gap-2 px-4 py-3 text-sm ${
                  i % 2 === 0 ? "bg-white/[0.02]" : ""
                }`}
              >
                <span
                  className={`font-mono ${
                    i === 0
                      ? "text-yellow-400"
                      : i === 1
                        ? "text-gray-300"
                        : i === 2
                          ? "text-orange-600"
                          : "text-white/40"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="text-white font-mono truncate">{entry.handle}</span>
                <span className="text-right font-mono text-white/80">{entry.total_attempts}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onBack}
        className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 font-medium transition-all"
      >
        Back to Menu
      </button>
    </div>
  );
}
