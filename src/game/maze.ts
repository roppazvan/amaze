import { createPRNG, shuffle } from "./prng";
import { CellType, MazeGrid, Position, posKey } from "./types";

export function generateMaze(
  gridSize: number,
  seed: number,
  extraPassages: number,
  maxBranches?: number
): MazeGrid {
  const random = createPRNG(seed);
  const height = gridSize;
  const width = gridSize;

  // Initialize grid: all walls
  const cells: CellType[][] = Array.from({ length: height }, () =>
    Array(width).fill(CellType.WALL)
  );

  const mazeRows = Math.floor(height / 2);
  const mazeCols = Math.floor(width / 2);

  const toGrid = (mr: number, mc: number): Position => ({
    row: mr * 2 + 1,
    col: mc * 2 + 1,
  });

  // Recursive backtracker (iterative)
  const visited: boolean[][] = Array.from({ length: mazeRows }, () =>
    Array(mazeCols).fill(false)
  );

  const stack: [number, number][] = [];
  visited[0][0] = true;
  const startGrid = toGrid(0, 0);
  cells[startGrid.row][startGrid.col] = CellType.PATH;
  stack.push([0, 0]);

  const directions: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  while (stack.length > 0) {
    const [cr, cc] = stack[stack.length - 1];
    const neighbors: [number, number, number, number][] = [];

    for (const [dr, dc] of directions) {
      const nr = cr + dr;
      const nc = cc + dc;
      if (nr >= 0 && nr < mazeRows && nc >= 0 && nc < mazeCols && !visited[nr][nc]) {
        neighbors.push([nr, nc, dr, dc]);
      }
    }

    if (neighbors.length === 0) {
      stack.pop();
      continue;
    }

    shuffle(neighbors, random);
    const [nr, nc, dr, dc] = neighbors[0];

    const wallRow = toGrid(cr, cc).row + dr;
    const wallCol = toGrid(cr, cc).col + dc;
    cells[wallRow][wallCol] = CellType.PATH;

    const neighborGrid = toGrid(nr, nc);
    cells[neighborGrid.row][neighborGrid.col] = CellType.PATH;

    visited[nr][nc] = true;
    stack.push([nr, nc]);
  }

  // Add extra passages to create loops
  if (extraPassages > 0) {
    addExtraPassages(cells, width, height, random, extraPassages);
  }

  // Place start: opening on the left edge
  const start: Position = { row: 1, col: 0 };
  cells[1][0] = CellType.PATH;

  // Place exit: random opening on the right edge (using PRNG for fairness)
  const exitCandidates: number[] = [];
  for (let r = 1; r < height - 1; r += 2) {
    if (cells[r][width - 2] === CellType.PATH) {
      exitCandidates.push(r);
    }
  }
  shuffle(exitCandidates, random);
  const exitRow = exitCandidates[0] || 1;
  const exit: Position = { row: exitRow, col: width - 1 };
  cells[exitRow][width - 1] = CellType.PATH;

  const maze: MazeGrid = { width, height, cells, start, exit };

  // Trim branches if maxBranches is specified
  if (maxBranches !== undefined) {
    trimBranches(maze, random, maxBranches);
  }

  return maze;
}

function addExtraPassages(
  cells: CellType[][],
  width: number,
  height: number,
  random: () => number,
  percentage: number
) {
  const candidates: { r: number; c: number }[] = [];

  for (let r = 1; r < height - 1; r++) {
    for (let c = 1; c < width - 1; c++) {
      if (cells[r][c] !== CellType.WALL) continue;

      if (r % 2 === 1 && c % 2 === 0) {
        if (cells[r][c - 1] === CellType.PATH && cells[r][c + 1] === CellType.PATH) {
          candidates.push({ r, c });
        }
      } else if (r % 2 === 0 && c % 2 === 1) {
        if (cells[r - 1][c] === CellType.PATH && cells[r + 1][c] === CellType.PATH) {
          candidates.push({ r, c });
        }
      }
    }
  }

  shuffle(candidates, random);
  const count = Math.floor(candidates.length * percentage);
  for (let i = 0; i < count; i++) {
    cells[candidates[i].r][candidates[i].c] = CellType.PATH;
  }
}

// --- Pathfinding ---

function findPath(maze: MazeGrid): Position[] | null {
  const { start, exit } = maze;
  const visited = new Set<string>();
  const parent = new Map<string, string | null>();
  const queue: Position[] = [start];
  const startKey = posKey(start.row, start.col);

  visited.add(startKey);
  parent.set(startKey, null);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentKey = posKey(current.row, current.col);

    if (current.row === exit.row && current.col === exit.col) {
      // Reconstruct
      const path: Position[] = [];
      let key: string | null = currentKey;
      while (key !== null) {
        const [r, c] = key.split(",").map(Number);
        path.unshift({ row: r, col: c });
        key = parent.get(key) ?? null;
      }
      return path;
    }

    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nr = current.row + dr;
      const nc = current.col + dc;
      const nk = posKey(nr, nc);
      if (!visited.has(nk) && isPath(maze, nr, nc)) {
        visited.add(nk);
        parent.set(nk, currentKey);
        queue.push({ row: nr, col: nc });
      }
    }
  }

  return null;
}

// --- Branch trimming ---

interface BranchInfo {
  branchRow: number;
  branchCol: number;
}

function trimBranches(maze: MazeGrid, random: () => number, maxBranches: number) {
  const solutionPath = findPath(maze);
  if (!solutionPath) return;

  const solutionSet = new Set(solutionPath.map((p) => posKey(p.row, p.col)));

  // Find all branch entry points: cells adjacent to the solution path
  // that are PATH but NOT on the solution path
  const branches: BranchInfo[] = [];

  for (const cell of solutionPath) {
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nr = cell.row + dr;
      const nc = cell.col + dc;
      if (isPath(maze, nr, nc) && !solutionSet.has(posKey(nr, nc))) {
        branches.push({ branchRow: nr, branchCol: nc });
      }
    }
  }

  if (branches.length <= maxBranches) return; // already within limit

  // Shuffle and seal excess branches
  shuffle(branches, random);
  const toSeal = branches.slice(maxBranches);

  for (const branch of toSeal) {
    sealDeadEnd(maze, branch.branchRow, branch.branchCol, solutionSet);
  }
}

// Flood-fill from a branch entry, converting all reachable non-solution cells to walls
function sealDeadEnd(
  maze: MazeGrid,
  startRow: number,
  startCol: number,
  solutionSet: Set<string>
) {
  const queue: Position[] = [{ row: startRow, col: startCol }];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const cell = queue.shift()!;
    const key = posKey(cell.row, cell.col);

    if (visited.has(key)) continue;
    if (solutionSet.has(key)) continue; // don't touch solution path
    if (cell.row < 0 || cell.row >= maze.height || cell.col < 0 || cell.col >= maze.width) continue;
    if (maze.cells[cell.row][cell.col] !== CellType.PATH) continue;

    visited.add(key);
    maze.cells[cell.row][cell.col] = CellType.WALL;

    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      queue.push({ row: cell.row + dr, col: cell.col + dc });
    }
  }
}

// --- Utilities ---

export function isPath(maze: MazeGrid, row: number, col: number): boolean {
  if (row < 0 || row >= maze.height || col < 0 || col >= maze.width) return false;
  return maze.cells[row][col] === CellType.PATH;
}

export function getAvailableMoves(
  maze: MazeGrid,
  pos: Position,
  visited: Set<string>
): Position[] {
  const moves: Position[] = [];
  for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    const nr = pos.row + dr;
    const nc = pos.col + dc;
    if (isPath(maze, nr, nc) && !visited.has(posKey(nr, nc))) {
      moves.push({ row: nr, col: nc });
    }
  }
  return moves;
}
