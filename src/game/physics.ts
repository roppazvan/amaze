import { CellType, Direction, DIRECTION_DELTA, MazeGrid, posKey } from "./types";

// Visual radius (used by renderer)
export const BALL_RADIUS = 0.32;

// Physics constants
const COLLISION_RADIUS = 0.2;
const BALL_SPEED = 5.5; // cells per second
const SNAP_SPEED = 16.0; // perpendicular axis centering speed

export interface PhysicsState {
  x: number; // ball center X in cell units (col + 0.5 = center of that col)
  y: number; // ball center Y in cell units (row + 0.5 = center of that row)
  cellRow: number;
  cellCol: number;
  visited: Set<string>;
  dead: boolean;
  won: boolean;
}

export function createPhysicsState(maze: MazeGrid): PhysicsState {
  const visited = new Set<string>();
  visited.add(posKey(maze.start.row, maze.start.col));

  return {
    x: maze.start.col + 0.5,
    y: maze.start.row + 0.5,
    cellRow: maze.start.row,
    cellCol: maze.start.col,
    visited,
    dead: false,
    won: false,
  };
}

// Only walls are used for collision — NOT visited cells.
// Visited cells are enforced via cell-transition blocking.
function isWall(maze: MazeGrid, row: number, col: number): boolean {
  if (row < 0 || row >= maze.height || col < 0 || col >= maze.width) return true;
  return maze.cells[row][col] === CellType.WALL;
}

// Check if ball at (bx, by) with COLLISION_RADIUS overlaps any wall cell
function overlapsWall(bx: number, by: number, maze: MazeGrid): boolean {
  const eps = 1e-4;
  const r1 = Math.floor(by - COLLISION_RADIUS + eps);
  const r2 = Math.floor(by + COLLISION_RADIUS - eps);
  const c1 = Math.floor(bx - COLLISION_RADIUS + eps);
  const c2 = Math.floor(bx + COLLISION_RADIUS - eps);

  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      if (isWall(maze, r, c)) return true;
    }
  }
  return false;
}

export function updatePhysics(
  state: PhysicsState,
  maze: MazeGrid,
  direction: Direction | null,
  dt: number
): PhysicsState {
  if (state.dead || state.won) return state;

  let { x, y } = state;
  let { cellRow, cellCol } = state;
  let visited = state.visited;
  let dead = false;
  let won = false;

  if (direction) {
    const delta = DIRECTION_DELTA[direction];

    // Rail snap: center ball on the perpendicular corridor axis
    if (delta.dx !== 0) {
      // Moving horizontally — snap Y toward current row center
      const targetY = Math.floor(y) + 0.5;
      y += (targetY - y) * Math.min(1, SNAP_SPEED * dt);
    }
    if (delta.dy !== 0) {
      // Moving vertically — snap X toward current col center
      const targetX = Math.floor(x) + 0.5;
      x += (targetX - x) * Math.min(1, SNAP_SPEED * dt);
    }

    const moveX = delta.dx * BALL_SPEED * dt;
    const moveY = delta.dy * BALL_SPEED * dt;

    // Resolve X axis
    if (moveX !== 0) {
      const newX = x + moveX;
      if (!overlapsWall(newX, y, maze)) {
        x = newX;
      } else {
        // Slide to the wall boundary
        if (moveX > 0) {
          // Moving right: find the wall column and stop just before it
          const wallC = Math.floor(x + COLLISION_RADIUS + Math.abs(moveX));
          for (let testC = Math.floor(x + COLLISION_RADIUS); testC <= wallC; testC++) {
            const checkR1 = Math.floor(y - COLLISION_RADIUS + 1e-4);
            const checkR2 = Math.floor(y + COLLISION_RADIUS - 1e-4);
            let blocked = false;
            for (let r = checkR1; r <= checkR2; r++) {
              if (isWall(maze, r, testC)) { blocked = true; break; }
            }
            if (blocked) {
              x = testC - COLLISION_RADIUS;
              break;
            }
          }
        } else {
          // Moving left
          const wallC = Math.floor(x - COLLISION_RADIUS - Math.abs(moveX));
          for (let testC = Math.floor(x - COLLISION_RADIUS); testC >= wallC; testC--) {
            const checkR1 = Math.floor(y - COLLISION_RADIUS + 1e-4);
            const checkR2 = Math.floor(y + COLLISION_RADIUS - 1e-4);
            let blocked = false;
            for (let r = checkR1; r <= checkR2; r++) {
              if (isWall(maze, r, testC)) { blocked = true; break; }
            }
            if (blocked) {
              x = testC + 1 + COLLISION_RADIUS;
              break;
            }
          }
        }
      }
    }

    // Resolve Y axis
    if (moveY !== 0) {
      const newY = y + moveY;
      if (!overlapsWall(x, newY, maze)) {
        y = newY;
      } else {
        if (moveY > 0) {
          const wallR = Math.floor(y + COLLISION_RADIUS + Math.abs(moveY));
          for (let testR = Math.floor(y + COLLISION_RADIUS); testR <= wallR; testR++) {
            const checkC1 = Math.floor(x - COLLISION_RADIUS + 1e-4);
            const checkC2 = Math.floor(x + COLLISION_RADIUS - 1e-4);
            let blocked = false;
            for (let c = checkC1; c <= checkC2; c++) {
              if (isWall(maze, testR, c)) { blocked = true; break; }
            }
            if (blocked) {
              y = testR - COLLISION_RADIUS;
              break;
            }
          }
        } else {
          const wallR = Math.floor(y - COLLISION_RADIUS - Math.abs(moveY));
          for (let testR = Math.floor(y - COLLISION_RADIUS); testR >= wallR; testR--) {
            const checkC1 = Math.floor(x - COLLISION_RADIUS + 1e-4);
            const checkC2 = Math.floor(x + COLLISION_RADIUS - 1e-4);
            let blocked = false;
            for (let c = checkC1; c <= checkC2; c++) {
              if (isWall(maze, testR, c)) { blocked = true; break; }
            }
            if (blocked) {
              y = testR + 1 + COLLISION_RADIUS;
              break;
            }
          }
        }
      }
    }
  }

  // Cell transition: check if ball center moved to a new cell
  const newCellCol = Math.floor(x);
  const newCellRow = Math.floor(y);

  if (newCellCol !== cellCol || newCellRow !== cellRow) {
    const key = posKey(newCellRow, newCellCol);

    if (visited.has(key)) {
      // Block transition: clamp ball center to stay in current cell
      if (newCellCol > cellCol) x = Math.min(x, cellCol + 1 - 1e-3);
      if (newCellCol < cellCol) x = Math.max(x, cellCol + 1e-3);
      if (newCellRow > cellRow) y = Math.min(y, cellRow + 1 - 1e-3);
      if (newCellRow < cellRow) y = Math.max(y, cellRow + 1e-3);
    } else {
      // Allow transition: mark old cell as visited
      visited = new Set(visited);
      visited.add(posKey(cellRow, cellCol));
      cellRow = newCellRow;
      cellCol = newCellCol;
    }
  }

  // Check win
  if (cellRow === maze.exit.row && cellCol === maze.exit.col) {
    won = true;
  }

  // Check trapped: no non-visited PATH neighbors
  if (!won) {
    const deltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    let hasExit = false;
    for (const [dr, dc] of deltas) {
      const nr = cellRow + dr;
      const nc = cellCol + dc;
      if (nr >= 0 && nr < maze.height && nc >= 0 && nc < maze.width) {
        if (maze.cells[nr][nc] === CellType.PATH && !visited.has(posKey(nr, nc))) {
          hasExit = true;
          break;
        }
      }
    }
    if (!hasExit) dead = true;
  }

  return { x, y, cellRow, cellCol, visited, dead, won };
}
