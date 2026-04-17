"use client";

import { useRef, useEffect } from "react";
import { MazeGrid, GameScreen } from "@/game/types";
import { createPhysicsState, updatePhysics, PhysicsState } from "@/game/physics";
import { createHeldKeyTracker, createSwipeHandler } from "@/game/input";
import { render, setupCanvas, getCanvasPixelSize } from "@/game/renderer";

interface GameCanvasProps {
  maze: MazeGrid;
  screen: GameScreen;
  viewport: number;
  onExit: () => void;
  onTrapped: () => void;
}

const DEAD_DELAY = 600;

export default function GameCanvas({ maze, screen, viewport, onExit, onTrapped }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const physicsRef = useRef<PhysicsState>(createPhysicsState(maze));
  const inputRef = useRef<ReturnType<typeof createHeldKeyTracker> | null>(null);
  const rafRef = useRef(0);
  const prevTimeRef = useRef(0);
  const deadFlashRef = useRef(0);
  const deadTimerRef = useRef(0);
  const firedExitRef = useRef(false);
  const firedDeadRef = useRef(false);

  useEffect(() => {
    physicsRef.current = createPhysicsState(maze);
    deadFlashRef.current = 0;
    deadTimerRef.current = 0;
    firedExitRef.current = false;
    firedDeadRef.current = false;
    prevTimeRef.current = 0;
  }, [maze]);

  // Setup canvas (re-run if viewport changes)
  useEffect(() => {
    if (canvasRef.current) {
      ctxRef.current = setupCanvas(canvasRef.current, viewport);
    }
  }, [viewport]);

  useEffect(() => {
    const tracker = createHeldKeyTracker();
    inputRef.current = tracker;
    tracker.attach();

    let swipe: ReturnType<typeof createSwipeHandler> | null = null;
    if (canvasRef.current) {
      swipe = createSwipeHandler(canvasRef.current, (dir) => {
        tracker.setDirection(dir);
      });
      swipe.attach();
    }

    return () => {
      tracker.detach();
      swipe?.detach();
      inputRef.current = null;
    };
  }, []);

  const onExitRef = useRef(onExit);
  const onTrappedRef = useRef(onTrapped);
  const screenRef = useRef(screen);
  const viewportRef = useRef(viewport);
  onExitRef.current = onExit;
  onTrappedRef.current = onTrapped;
  screenRef.current = screen;
  viewportRef.current = viewport;

  useEffect(() => {
    let running = true;

    function tick(time: number) {
      if (!running) return;

      const ctx = ctxRef.current;
      const physics = physicsRef.current;
      if (!ctx || !physics) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (prevTimeRef.current === 0) prevTimeRef.current = time;
      const dtMs = Math.min(time - prevTimeRef.current, 33);
      prevTimeRef.current = time;
      const dt = dtMs / 1000;

      const currentScreen = screenRef.current;

      if (currentScreen === GameScreen.PLAYING && !physics.dead && !physics.won) {
        const dir = inputRef.current?.getDirection() ?? null;
        physicsRef.current = updatePhysics(physics, maze, dir, dt);

        const p = physicsRef.current;
        if (p.won && !firedExitRef.current) {
          firedExitRef.current = true;
          setTimeout(() => onExitRef.current(), 200);
        }
        if (p.dead && !firedDeadRef.current) {
          firedDeadRef.current = true;
          deadFlashRef.current = 1;
          deadTimerRef.current = 0;
        }
      }

      if (firedDeadRef.current && deadTimerRef.current < DEAD_DELAY) {
        deadTimerRef.current += dtMs;
        deadFlashRef.current = Math.max(0, 1 - deadTimerRef.current / 400);
        if (deadTimerRef.current >= DEAD_DELAY) {
          onTrappedRef.current();
        }
      }

      const p = physicsRef.current;
      render(ctx, maze, p.x, p.y, p.visited, p.cellRow, p.cellCol, deadFlashRef.current, viewportRef.current);

      rafRef.current = requestAnimationFrame(tick);
    }

    const active =
      screen === GameScreen.PLAYING ||
      screen === GameScreen.GAME_OVER ||
      screen === GameScreen.LEVEL_COMPLETE ||
      screen === GameScreen.PAUSED;

    if (active) {
      prevTimeRef.current = 0;
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [maze, screen]);

  const size = getCanvasPixelSize(viewport);

  return (
    <canvas
      ref={canvasRef}
      style={{ maxWidth: size, maxHeight: size }}
      className="rounded-2xl shadow-2xl shadow-black/50 touch-none w-full aspect-square"
    />
  );
}
