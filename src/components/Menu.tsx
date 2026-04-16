"use client";

import { useState } from "react";
import { TOTAL_LEVELS } from "@/game/levels";
import { loadHandle, saveHandle } from "@/utils/localStorage";

interface MenuProps {
  onStart: () => void;
  onSelectLevel: (level: number) => void;
  onLeaderboard: () => void;
  attempts: Record<number, number>;
}

export default function Menu({ onStart, onSelectLevel, onLeaderboard, attempts }: MenuProps) {
  const [showLevels, setShowLevels] = useState(false);
  const [handle, setHandle] = useState(() => {
    const saved = loadHandle();
    return saved.startsWith("@") ? saved.slice(1) : saved;
  });
  const [error, setError] = useState("");

  const isValidHandle = handle.trim().length > 0 && /^[a-zA-Z0-9_]+$/.test(handle.trim());

  const handleStart = () => {
    const trimmed = handle.trim();
    if (!trimmed) {
      setError("Enter your X handle to play");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setError("Only letters, numbers, and underscores");
      return;
    }
    setError("");
    saveHandle(`@${trimmed}`);
    onStart();
  };

  const handleSelectLevel = (level: number) => {
    const trimmed = handle.trim();
    if (!trimmed || !/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setError("Enter your X handle first");
      return;
    }
    setError("");
    saveHandle(`@${trimmed}`);
    onSelectLevel(level);
  };

  return (
    <div className="flex flex-col items-center gap-8 animate-fadeIn">
      {/* Logo */}
      <div className="text-center">
        <h1 className="text-6xl font-bold tracking-tighter text-white">
          a<span className="text-orange-400">maze</span>
        </h1>
        <p className="text-white/40 mt-2 text-sm tracking-widest uppercase">
          Memorize the path to escape
        </p>
      </div>

      {/* Glowing ball decoration */}
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-300 to-orange-600 shadow-lg shadow-orange-500/30 animate-pulse" />

      {/* Handle input */}
      <div className="w-64 flex flex-col gap-1.5">
        <label className="text-white/40 text-xs uppercase tracking-wider">
          Your X handle
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 font-mono text-sm">@</span>
          <input
            type="text"
            value={handle}
            onChange={(e) => {
              setHandle(e.target.value.replace(/^@/, ""));
              setError("");
            }}
            placeholder="username"
            maxLength={29}
            className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white font-mono text-sm placeholder-white/30 focus:outline-none focus:border-orange-500/50 transition-colors"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleStart();
            }}
          />
        </div>
        {error && <div className="text-red-400 text-xs">{error}</div>}
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 w-64">
        <button
          onClick={handleStart}
          className={`px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all ${
            isValidHandle
              ? "bg-orange-500 hover:bg-orange-400 hover:scale-105 active:scale-95"
              : "bg-orange-500/40 cursor-not-allowed"
          }`}
        >
          Start Game
        </button>

        <button
          onClick={() => setShowLevels(!showLevels)}
          className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 font-medium transition-all"
        >
          Select Level
        </button>

        {showLevels && (
          <div className="grid grid-cols-5 gap-2 p-3 rounded-xl bg-white/5">
            {Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1).map((level) => (
              <button
                key={level}
                onClick={() => handleSelectLevel(level)}
                className={`w-10 h-10 rounded-lg text-sm font-mono transition-all ${
                  attempts[level]
                    ? "bg-orange-500/30 text-orange-300 hover:bg-orange-500/50"
                    : "bg-white/10 text-white/50 hover:bg-white/20"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={onLeaderboard}
          className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 font-medium transition-all"
        >
          Leaderboard
        </button>
      </div>

      {/* Instructions */}
      <div className="text-white/30 text-xs text-center max-w-xs leading-relaxed">
        Navigate the maze with arrow keys or WASD.
        <br />
        You cannot go back — dead ends are game over.
        <br />
        Complete all 20 levels with the fewest attempts.
      </div>
    </div>
  );
}
