import { neon } from "@neondatabase/serverless";

function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return neon(databaseUrl);
}

export async function ensureTable() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS leaderboard (
      id SERIAL PRIMARY KEY,
      handle VARCHAR(30) NOT NULL,
      total_attempts INTEGER NOT NULL CHECK (total_attempts > 0),
      total_time_ms INTEGER NOT NULL CHECK (total_time_ms > 0),
      completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_leaderboard_rank
    ON leaderboard (total_attempts ASC, total_time_ms ASC)
  `;
}

export async function getLeaderboard() {
  const sql = getDb();
  // Best score per handle: fewest attempts, then fastest time as tiebreaker
  const rows = await sql`
    SELECT DISTINCT ON (handle)
      id, handle, total_attempts, total_time_ms, completed_at
    FROM leaderboard
    ORDER BY handle, total_attempts ASC, total_time_ms ASC
  `;
  return rows
    .sort((a, b) => {
      const attemptDiff = (a.total_attempts as number) - (b.total_attempts as number);
      if (attemptDiff !== 0) return attemptDiff;
      return (a.total_time_ms as number) - (b.total_time_ms as number);
    })
    .slice(0, 50);
}

export async function submitScore(handle: string, totalAttempts: number, totalTimeMs: number) {
  const sql = getDb();

  // Check if player already has a better score
  const existing = await sql`
    SELECT total_attempts, total_time_ms FROM leaderboard
    WHERE handle = ${handle}
    ORDER BY total_attempts ASC, total_time_ms ASC
    LIMIT 1
  `;

  if (existing.length > 0) {
    const ea = existing[0].total_attempts as number;
    const et = existing[0].total_time_ms as number;
    // Keep existing if fewer attempts, or same attempts but faster
    if (ea < totalAttempts || (ea === totalAttempts && et <= totalTimeMs)) {
      return { updated: false, total_attempts: ea, total_time_ms: et };
    }
  }

  // Remove old entries and insert new best
  if (existing.length > 0) {
    await sql`DELETE FROM leaderboard WHERE handle = ${handle}`;
  }

  const result = await sql`
    INSERT INTO leaderboard (handle, total_attempts, total_time_ms)
    VALUES (${handle}, ${totalAttempts}, ${totalTimeMs})
    RETURNING id, handle, total_attempts, total_time_ms, completed_at
  `;

  return { updated: true, entry: result[0] };
}
