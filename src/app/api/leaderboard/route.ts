import { NextRequest, NextResponse } from "next/server";
import { ensureTable, getLeaderboard, submitScore } from "@/lib/db";

export async function GET() {
  try {
    await ensureTable();
    const entries = await getLeaderboard();
    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Leaderboard GET error:", error);
    return NextResponse.json({ entries: [], error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { handle, total_attempts } = body;

    // Validate handle: must start with @, 2-30 chars, alphanumeric + underscores
    if (typeof handle !== "string") {
      return NextResponse.json({ error: "handle is required" }, { status: 400 });
    }

    const cleanHandle = handle.trim().startsWith("@") ? handle.trim() : `@${handle.trim()}`;

    if (cleanHandle.length < 2 || cleanHandle.length > 30) {
      return NextResponse.json({ error: "handle must be 1-29 characters (excluding @)" }, { status: 400 });
    }

    // Only allow valid X handle characters: letters, numbers, underscores
    const handleBody = cleanHandle.slice(1);
    if (!/^[a-zA-Z0-9_]+$/.test(handleBody)) {
      return NextResponse.json({ error: "handle can only contain letters, numbers, and underscores" }, { status: 400 });
    }

    // Validate total_attempts
    if (typeof total_attempts !== "number" || total_attempts < 1 || !Number.isInteger(total_attempts)) {
      return NextResponse.json({ error: "total_attempts must be a positive integer" }, { status: 400 });
    }

    await ensureTable();
    const result = await submitScore(cleanHandle, total_attempts);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Leaderboard POST error:", error);
    return NextResponse.json({ error: "Failed to submit score" }, { status: 500 });
  }
}
