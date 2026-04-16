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
      completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_leaderboard_attempts
    ON leaderboard (total_attempts ASC)
  `;
}

export async function getLeaderboard() {
  const sql = getDb();
  // Best score per handle, sorted by fewest total attempts
  const rows = await sql`
    SELECT DISTINCT ON (handle)
      id, handle, total_attempts, completed_at
    FROM leaderboard
    ORDER BY handle, total_attempts ASC
  `;
  return rows
    .sort((a, b) => (a.total_attempts as number) - (b.total_attempts as number))
    .slice(0, 50);
}

export async function submitScore(handle: string, totalAttempts: number) {
  const sql = getDb();

  // Check if player already has a better score
  const existing = await sql`
    SELECT total_attempts FROM leaderboard
    WHERE handle = ${handle}
    ORDER BY total_attempts ASC
    LIMIT 1
  `;

  if (existing.length > 0 && (existing[0].total_attempts as number) <= totalAttempts) {
    return { updated: false, total_attempts: existing[0].total_attempts };
  }

  // Remove old entries for this handle and insert new best
  if (existing.length > 0) {
    await sql`DELETE FROM leaderboard WHERE handle = ${handle}`;
  }

  const result = await sql`
    INSERT INTO leaderboard (handle, total_attempts)
    VALUES (${handle}, ${totalAttempts})
    RETURNING id, handle, total_attempts, completed_at
  `;

  return { updated: true, entry: result[0] };
}
