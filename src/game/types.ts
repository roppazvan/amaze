export enum CellType {
  WALL = 0,
  PATH = 1,
}

export enum Direction {
  UP = "UP",
  DOWN = "DOWN",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}

export const DIRECTION_DELTA: Record<Direction, { dx: number; dy: number }> = {
  [Direction.UP]: { dx: 0, dy: -1 },
  [Direction.DOWN]: { dx: 0, dy: 1 },
  [Direction.LEFT]: { dx: -1, dy: 0 },
  [Direction.RIGHT]: { dx: 1, dy: 0 },
};

export interface Position {
  row: number;
  col: number;
}

export interface MazeGrid {
  width: number;
  height: number;
  cells: CellType[][];
  start: Position;
  exit: Position;
}

export interface LevelConfig {
  level: number;
  gridSize: number;
  seed: number;
  extraPassages: number;
  viewport: number; // visible cells around the player (3, 5, or 7)
  maxBranches?: number; // max wrong-turn branches along solution path. undefined = no limit
}

export enum GameScreen {
  MENU = "MENU",
  LEVEL_INTRO = "LEVEL_INTRO",
  PLAYING = "PLAYING",
  GAME_OVER = "GAME_OVER",
  LEVEL_COMPLETE = "LEVEL_COMPLETE",
  ALL_COMPLETE = "ALL_COMPLETE",
  LEADERBOARD = "LEADERBOARD",
  PAUSED = "PAUSED",
}

export interface GameState {
  screen: GameScreen;
  currentLevel: number;
  attempts: Record<number, number>;
  maze: MazeGrid | null;
  viewport: number;
}

export interface LeaderboardEntry {
  id?: number;
  handle: string;
  total_attempts: number;
  completed_at?: string;
}

export function posKey(row: number, col: number): string {
  return `${row},${col}`;
}
