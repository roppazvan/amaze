"use client";

import { useEffect, useCallback } from "react";
import { GameScreen, Direction } from "@/game/types";
import { useGameState } from "@/hooks/useGameState";
import GameCanvas from "./GameCanvas";
import Menu from "./Menu";
import LevelIntro from "./LevelIntro";
import GameOver from "./GameOver";
import LevelComplete from "./LevelComplete";
import AllComplete from "./AllComplete";
import Leaderboard from "./Leaderboard";
import PauseMenu from "./PauseMenu";

export default function Game() {
  const {
    state,
    startGame,
    selectLevel,
    startLevel,
    levelComplete,
    gameOver,
    retry,
    nextLevel,
    goMenu,
    togglePause,
    showLeaderboard,
  } = useGameState();

  // Handle escape key for pause
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (state.screen === GameScreen.PLAYING || state.screen === GameScreen.PAUSED) {
          togglePause();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.screen, togglePause]);

  const handleExit = useCallback(() => {
    levelComplete();
  }, [levelComplete]);

  const handleTrapped = useCallback(() => {
    gameOver();
  }, [gameOver]);

  const showCanvas =
    state.maze &&
    (state.screen === GameScreen.PLAYING ||
      state.screen === GameScreen.GAME_OVER ||
      state.screen === GameScreen.LEVEL_COMPLETE ||
      state.screen === GameScreen.PAUSED);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#0d0d1a] select-none overflow-hidden">
      {/* Game canvas */}
      {showCanvas && state.maze && (
        <div className="relative">
          <GameCanvas
            key={`${state.currentLevel}-${state.attempts[state.currentLevel]}`}
            maze={state.maze}
            screen={state.screen}
            viewport={state.viewport}
            onExit={handleExit}
            onTrapped={handleTrapped}
          />

          {/* HUD */}
          {(state.screen === GameScreen.PLAYING || state.screen === GameScreen.PAUSED) && (
            <div className="absolute top-4 left-4 right-4 flex justify-between text-white/60 text-sm font-mono pointer-events-none">
              <span>Level {state.currentLevel}</span>
              <span>Attempt #{state.attempts[state.currentLevel] || 1}</span>
            </div>
          )}

          {/* Mobile D-pad */}
          {state.screen === GameScreen.PLAYING && (
            <div className="absolute -bottom-36 left-1/2 -translate-x-1/2 md:hidden">
              <DPad />
            </div>
          )}
        </div>
      )}

      {/* Screen overlays */}
      {state.screen === GameScreen.MENU && (
        <Menu
          onStart={startGame}
          onSelectLevel={selectLevel}
          onLeaderboard={showLeaderboard}
          attempts={state.attempts}
        />
      )}

      {state.screen === GameScreen.LEVEL_INTRO && (
        <LevelIntro
          level={state.currentLevel}
          attempts={state.attempts[state.currentLevel] || 0}
          onStart={startLevel}
        />
      )}

      {state.screen === GameScreen.GAME_OVER && (
        <GameOver
          level={state.currentLevel}
          attempts={state.attempts[state.currentLevel] || 1}
          onRetry={retry}
          onMenu={goMenu}
        />
      )}

      {state.screen === GameScreen.LEVEL_COMPLETE && (
        <LevelComplete
          level={state.currentLevel}
          attempts={state.attempts[state.currentLevel] || 1}
          onNext={nextLevel}
          onMenu={goMenu}
        />
      )}

      {state.screen === GameScreen.ALL_COMPLETE && (
        <AllComplete attempts={state.attempts} levelTimes={state.levelTimes} onMenu={goMenu} />
      )}

      {state.screen === GameScreen.LEADERBOARD && (
        <Leaderboard onBack={goMenu} />
      )}

      {state.screen === GameScreen.PAUSED && (
        <PauseMenu onResume={togglePause} onQuit={goMenu} />
      )}
    </div>
  );
}

function DPad() {
  const btn =
    "w-14 h-14 rounded-xl bg-white/10 active:bg-white/20 flex items-center justify-center text-white/60 text-2xl transition-colors touch-manipulation";

  // D-pad fires keyboard events so the held-key tracker picks them up
  const fireKey = (key: string, type: "keydown" | "keyup") => {
    window.dispatchEvent(new KeyboardEvent(type, { key, bubbles: true }));
  };

  return (
    <div className="grid grid-cols-3 gap-1.5">
      <div />
      <button
        className={btn}
        onTouchStart={() => fireKey("ArrowUp", "keydown")}
        onTouchEnd={() => fireKey("ArrowUp", "keyup")}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 4l6 8H4z"/></svg>
      </button>
      <div />
      <button
        className={btn}
        onTouchStart={() => fireKey("ArrowLeft", "keydown")}
        onTouchEnd={() => fireKey("ArrowLeft", "keyup")}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M4 10l8-6v12z"/></svg>
      </button>
      <div />
      <button
        className={btn}
        onTouchStart={() => fireKey("ArrowRight", "keydown")}
        onTouchEnd={() => fireKey("ArrowRight", "keyup")}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M16 10l-8-6v12z"/></svg>
      </button>
      <div />
      <button
        className={btn}
        onTouchStart={() => fireKey("ArrowDown", "keydown")}
        onTouchEnd={() => fireKey("ArrowDown", "keyup")}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 16l6-8H4z"/></svg>
      </button>
      <div />
    </div>
  );
}
