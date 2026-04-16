import { Direction } from "./types";

const KEY_MAP: Record<string, Direction> = {
  ArrowUp: Direction.UP,
  ArrowDown: Direction.DOWN,
  ArrowLeft: Direction.LEFT,
  ArrowRight: Direction.RIGHT,
  w: Direction.UP,
  s: Direction.DOWN,
  a: Direction.LEFT,
  d: Direction.RIGHT,
  W: Direction.UP,
  S: Direction.DOWN,
  A: Direction.LEFT,
  D: Direction.RIGHT,
};

// Tracks which direction keys are held, returns the most recently pressed one
export function createHeldKeyTracker(): {
  attach: () => void;
  detach: () => void;
  getDirection: () => Direction | null;
  setDirection: (dir: Direction | null) => void;
} {
  const held = new Set<Direction>();
  const order: Direction[] = [];
  let overrideDir: Direction | null = null;

  const onKeyDown = (e: KeyboardEvent) => {
    const dir = KEY_MAP[e.key];
    if (dir) {
      e.preventDefault();
      if (!held.has(dir)) {
        held.add(dir);
        order.push(dir);
      }
      overrideDir = null; // keyboard takes over from touch
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    const dir = KEY_MAP[e.key];
    if (dir) {
      held.delete(dir);
      const idx = order.lastIndexOf(dir);
      if (idx >= 0) order.splice(idx, 1);
    }
  };

  const onBlur = () => {
    held.clear();
    order.length = 0;
  };

  return {
    attach: () => {
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);
      window.addEventListener("blur", onBlur);
    },
    detach: () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      held.clear();
      order.length = 0;
      overrideDir = null;
    },
    getDirection: () => {
      if (overrideDir) return overrideDir;
      return order.length > 0 ? order[order.length - 1] : null;
    },
    setDirection: (dir: Direction | null) => {
      overrideDir = dir;
    },
  };
}

export function createSwipeHandler(
  element: HTMLElement,
  callback: (dir: Direction) => void
): {
  attach: () => void;
  detach: () => void;
} {
  let startX = 0;
  let startY = 0;
  const MIN_SWIPE = 30;

  const onTouchStart = (e: TouchEvent) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  };

  const onTouchEnd = (e: TouchEvent) => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < MIN_SWIPE) return;

    if (absDx > absDy) {
      callback(dx > 0 ? Direction.RIGHT : Direction.LEFT);
    } else {
      callback(dy > 0 ? Direction.DOWN : Direction.UP);
    }
  };

  return {
    attach: () => {
      element.addEventListener("touchstart", onTouchStart, { passive: true });
      element.addEventListener("touchend", onTouchEnd, { passive: true });
    },
    detach: () => {
      element.removeEventListener("touchstart", onTouchStart);
      element.removeEventListener("touchend", onTouchEnd);
    },
  };
}
