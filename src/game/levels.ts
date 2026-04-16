import { LevelConfig } from "./types";

export const LEVELS: LevelConfig[] = [
  // Phase 1: Controlled branches, wide viewport, learn the mechanics
  { level: 1,  gridSize: 11, seed: 1001,  extraPassages: 0,    viewport: 7, maxBranches: 0 },
  { level: 2,  gridSize: 13, seed: 2002,  extraPassages: 0,    viewport: 7, maxBranches: 1 },
  { level: 3,  gridSize: 15, seed: 3003,  extraPassages: 0,    viewport: 7, maxBranches: 2 },
  { level: 4,  gridSize: 15, seed: 4004,  extraPassages: 0,    viewport: 7, maxBranches: 3 },

  // Phase 2: Viewport shrinks, more branches, first loops
  { level: 5,  gridSize: 17, seed: 5005,  extraPassages: 0,    viewport: 5, maxBranches: 4 },
  { level: 6,  gridSize: 19, seed: 6006,  extraPassages: 0.05, viewport: 5, maxBranches: 6 },
  { level: 7,  gridSize: 21, seed: 7007,  extraPassages: 0.08, viewport: 5, maxBranches: 8 },
  { level: 8,  gridSize: 25, seed: 8008,  extraPassages: 0.10, viewport: 5, maxBranches: 10 },
  { level: 9,  gridSize: 27, seed: 9009,  extraPassages: 0.10, viewport: 5, maxBranches: 13 },
  { level: 10, gridSize: 31, seed: 10010, extraPassages: 0.12, viewport: 5, maxBranches: 16 },

  // Phase 3: Unlimited branches, bigger mazes, more loops
  { level: 11, gridSize: 35, seed: 11011, extraPassages: 0.15, viewport: 5 },
  { level: 12, gridSize: 37, seed: 12012, extraPassages: 0.15, viewport: 5 },
  { level: 13, gridSize: 41, seed: 13013, extraPassages: 0.18, viewport: 5 },
  { level: 14, gridSize: 45, seed: 14014, extraPassages: 0.18, viewport: 5 },

  // Phase 4: Tiny viewport, huge mazes
  { level: 15, gridSize: 49, seed: 15015, extraPassages: 0.20, viewport: 3 },
  { level: 16, gridSize: 51, seed: 16016, extraPassages: 0.20, viewport: 3 },
  { level: 17, gridSize: 55, seed: 17017, extraPassages: 0.22, viewport: 3 },
  { level: 18, gridSize: 61, seed: 18018, extraPassages: 0.22, viewport: 3 },
  { level: 19, gridSize: 71, seed: 19019, extraPassages: 0.25, viewport: 3 },
  { level: 20, gridSize: 81, seed: 20020, extraPassages: 0.28, viewport: 3 },
];

export const TOTAL_LEVELS = LEVELS.length;

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS[level - 1];
}
