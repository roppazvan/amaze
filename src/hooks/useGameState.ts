import { useReducer, useCallback } from "react";
import { GameScreen, GameState } from "@/game/types";
import { generateMaze } from "@/game/maze";
import { getLevelConfig, TOTAL_LEVELS } from "@/game/levels";
import { loadProgress, saveProgress } from "@/utils/localStorage";

type Action =
  | { type: "START_GAME" }
  | { type: "SELECT_LEVEL"; level: number }
  | { type: "START_LEVEL" }
  | { type: "LEVEL_COMPLETE" }
  | { type: "GAME_OVER" }
  | { type: "RETRY" }
  | { type: "NEXT_LEVEL" }
  | { type: "GO_MENU" }
  | { type: "TOGGLE_PAUSE" }
  | { type: "SHOW_LEADERBOARD" };

function createInitialState(): GameState {
  const saved = loadProgress();
  return {
    screen: GameScreen.MENU,
    currentLevel: 1,
    attempts: saved || {},
    maze: null,
    viewport: 7,
    levelStartTime: 0,
    levelTimes: {},
  };
}

function buildMaze(level: number) {
  const config = getLevelConfig(level);
  return generateMaze(config.gridSize, config.seed, config.extraPassages, config.maxBranches);
}

// Record time spent on the current attempt
function recordAttemptTime(state: GameState): Record<number, number> {
  if (state.levelStartTime === 0) return state.levelTimes;
  const elapsed = Date.now() - state.levelStartTime;
  const times = { ...state.levelTimes };
  times[state.currentLevel] = (times[state.currentLevel] || 0) + elapsed;
  return times;
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "START_GAME":
      return { ...state, screen: GameScreen.LEVEL_INTRO, currentLevel: 1, levelTimes: {} };

    case "SELECT_LEVEL":
      return { ...state, screen: GameScreen.LEVEL_INTRO, currentLevel: action.level };

    case "START_LEVEL": {
      const config = getLevelConfig(state.currentLevel);
      const maze = buildMaze(state.currentLevel);
      const attempts = { ...state.attempts };
      if (!attempts[state.currentLevel]) attempts[state.currentLevel] = 0;
      attempts[state.currentLevel]++;
      saveProgress(attempts);
      return {
        ...state,
        screen: GameScreen.PLAYING,
        maze,
        attempts,
        viewport: config.viewport,
        levelStartTime: Date.now(),
      };
    }

    case "LEVEL_COMPLETE": {
      const levelTimes = recordAttemptTime(state);
      if (state.currentLevel >= TOTAL_LEVELS) {
        return { ...state, screen: GameScreen.ALL_COMPLETE, levelTimes, levelStartTime: 0 };
      }
      return { ...state, screen: GameScreen.LEVEL_COMPLETE, levelTimes, levelStartTime: 0 };
    }

    case "GAME_OVER": {
      const levelTimes = recordAttemptTime(state);
      return { ...state, screen: GameScreen.GAME_OVER, levelTimes, levelStartTime: 0 };
    }

    case "RETRY": {
      const config = getLevelConfig(state.currentLevel);
      const maze = buildMaze(state.currentLevel);
      const attempts = { ...state.attempts };
      attempts[state.currentLevel]++;
      saveProgress(attempts);
      return {
        ...state,
        screen: GameScreen.PLAYING,
        maze,
        attempts,
        viewport: config.viewport,
        levelStartTime: Date.now(),
      };
    }

    case "NEXT_LEVEL": {
      const next = state.currentLevel + 1;
      if (next > TOTAL_LEVELS) {
        return { ...state, screen: GameScreen.ALL_COMPLETE };
      }
      return { ...state, screen: GameScreen.LEVEL_INTRO, currentLevel: next };
    }

    case "GO_MENU":
      return { ...state, screen: GameScreen.MENU, maze: null, levelStartTime: 0 };

    case "TOGGLE_PAUSE":
      if (state.screen === GameScreen.PLAYING) return { ...state, screen: GameScreen.PAUSED };
      if (state.screen === GameScreen.PAUSED) return { ...state, screen: GameScreen.PLAYING };
      return state;

    case "SHOW_LEADERBOARD":
      return { ...state, screen: GameScreen.LEADERBOARD };

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, null, createInitialState);

  return {
    state,
    startGame: useCallback(() => dispatch({ type: "START_GAME" }), []),
    selectLevel: useCallback((level: number) => dispatch({ type: "SELECT_LEVEL", level }), []),
    startLevel: useCallback(() => dispatch({ type: "START_LEVEL" }), []),
    levelComplete: useCallback(() => dispatch({ type: "LEVEL_COMPLETE" }), []),
    gameOver: useCallback(() => dispatch({ type: "GAME_OVER" }), []),
    retry: useCallback(() => dispatch({ type: "RETRY" }), []),
    nextLevel: useCallback(() => dispatch({ type: "NEXT_LEVEL" }), []),
    goMenu: useCallback(() => dispatch({ type: "GO_MENU" }), []),
    togglePause: useCallback(() => dispatch({ type: "TOGGLE_PAUSE" }), []),
    showLeaderboard: useCallback(() => dispatch({ type: "SHOW_LEADERBOARD" }), []),
  };
}
