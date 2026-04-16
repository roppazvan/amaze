"use client";

import { useState } from "react";
import { loadHandle, saveHandle } from "@/utils/localStorage";

interface ScoreSubmitProps {
  totalAttempts: number;
  onSubmitted: () => void;
}

export default function ScoreSubmit({ totalAttempts, onSubmitted }: ScoreSubmitProps) {
  const [handle, setHandle] = useState(loadHandle);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let trimmed = handle.trim();
    if (trimmed.startsWith("@")) trimmed = trimmed.slice(1);

    if (!trimmed || trimmed.length > 29) {
      setError("Handle must be 1-29 characters");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setError("Only letters, numbers, and underscores");
      return;
    }

    setSubmitting(true);
    setError("");
    saveHandle(`@${trimmed}`);

    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: `@${trimmed}`,
          total_attempts: totalAttempts,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit score");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-mono">@</span>
        <input
          type="text"
          value={handle.startsWith("@") ? handle.slice(1) : handle}
          onChange={(e) => setHandle(e.target.value.replace(/^@/, ""))}
          placeholder="your_x_handle"
          maxLength={29}
          className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 font-mono focus:outline-none focus:border-orange-500/50 transition-colors"
        />
      </div>
      {error && <div className="text-red-400 text-xs text-center">{error}</div>}
      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:bg-orange-500/50 text-white font-semibold transition-all"
      >
        {submitting ? "Submitting..." : "Submit to Leaderboard"}
      </button>
    </form>
  );
}
