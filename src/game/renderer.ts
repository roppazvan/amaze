import { CellType, MazeGrid } from "./types";
import { BALL_RADIUS } from "./physics";

const CELL_SIZE = 64;

const COLORS = {
  background: "#1a1a2e",
  wall: "#404060",
  wallHighlight: "#505078",
  floor: "#16162a",
  trail: "#2a1a1a",
  trailMark: "rgba(255, 80, 60, 0.15)",
  ball: "#ff8c00",
  ballGlow: "rgba(255, 140, 0, 0.25)",
  ballCenter: "#ffb347",
  exit: "#00cc88",
  exitGlow: "rgba(0, 204, 136, 0.3)",
  fog: "#0d0d1a",
};

// viewport = visible cells (3, 5, or 7). We add 2 for fog border.
export function getCanvasPixelSize(viewport: number): number {
  return (viewport + 2) * CELL_SIZE;
}

export function getCellSize(): number {
  return CELL_SIZE;
}

export function setupCanvas(canvas: HTMLCanvasElement, viewport: number): CanvasRenderingContext2D {
  const canvasSize = getCanvasPixelSize(viewport);
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvasSize * dpr;
  canvas.height = canvasSize * dpr;
  canvas.style.width = `${canvasSize}px`;
  canvas.style.height = `${canvasSize}px`;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  return ctx;
}

export function render(
  ctx: CanvasRenderingContext2D,
  maze: MazeGrid,
  ballX: number,
  ballY: number,
  visited: Set<string>,
  currentCellRow: number,
  currentCellCol: number,
  deadFlash: number,
  viewport: number
) {
  const canvasSize = getCanvasPixelSize(viewport);
  const halfVisible = viewport / 2; // e.g. 2.5 for viewport=5

  // Camera center in pixel space
  const camPx = ballX * CELL_SIZE;
  const camPy = ballY * CELL_SIZE;

  const vpX = camPx - canvasSize / 2;
  const vpY = camPy - canvasSize / 2;

  // Clear
  ctx.fillStyle = COLORS.fog;
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  const startCol = Math.floor(vpX / CELL_SIZE) - 1;
  const endCol = Math.ceil((vpX + canvasSize) / CELL_SIZE) + 1;
  const startRow = Math.floor(vpY / CELL_SIZE) - 1;
  const endRow = Math.ceil((vpY + canvasSize) / CELL_SIZE) + 1;

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const screenX = col * CELL_SIZE - vpX;
      const screenY = row * CELL_SIZE - vpY;

      if (
        screenX + CELL_SIZE < -CELL_SIZE ||
        screenX > canvasSize + CELL_SIZE ||
        screenY + CELL_SIZE < -CELL_SIZE ||
        screenY > canvasSize + CELL_SIZE
      ) continue;

      const fogFactor = calculateFog(screenX, screenY, canvasSize, halfVisible);
      if (fogFactor <= 0) continue;

      ctx.globalAlpha = fogFactor;

      if (row < 0 || row >= maze.height || col < 0 || col >= maze.width) {
        drawWall(ctx, screenX, screenY);
      } else if (maze.cells[row][col] === CellType.WALL) {
        drawWall(ctx, screenX, screenY);
      } else {
        drawFloor(ctx, screenX, screenY);

        const key = `${row},${col}`;
        const isCurrent = row === currentCellRow && col === currentCellCol;
        const isVisited = visited.has(key);
        const isExit = row === maze.exit.row && col === maze.exit.col;

        if (isVisited && !isCurrent) {
          drawTrail(ctx, screenX, screenY);
        }

        if (isExit) {
          drawExit(ctx, screenX, screenY);
        }
      }
    }
  }

  ctx.globalAlpha = 1;

  // Ball
  const ballScreenX = ballX * CELL_SIZE - vpX;
  const ballScreenY = ballY * CELL_SIZE - vpY;
  drawBall(ctx, ballScreenX, ballScreenY);

  // Vignette
  drawVignette(ctx, canvasSize);

  // Death flash
  if (deadFlash > 0) {
    ctx.globalAlpha = deadFlash * 0.35;
    ctx.fillStyle = "#ff2020";
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    ctx.globalAlpha = 1;
  }
}

function calculateFog(
  screenX: number, screenY: number,
  canvasSize: number, halfVisible: number
): number {
  const centerX = canvasSize / 2;
  const centerY = canvasSize / 2;
  const cellCenterX = screenX + CELL_SIZE / 2;
  const cellCenterY = screenY + CELL_SIZE / 2;

  const dx = Math.abs(cellCenterX - centerX) / CELL_SIZE;
  const dy = Math.abs(cellCenterY - centerY) / CELL_SIZE;
  const dist = Math.max(dx, dy);

  const fadeStart = halfVisible;
  const fadeEnd = halfVisible + 1;

  if (dist <= fadeStart) return 1;
  if (dist >= fadeEnd) return 0;
  return 1 - (dist - fadeStart);
}

function drawWall(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const r = 4;
  const inset = 1;
  ctx.fillStyle = COLORS.wall;
  ctx.beginPath();
  ctx.roundRect(x + inset, y + inset, CELL_SIZE - inset * 2, CELL_SIZE - inset * 2, r);
  ctx.fill();

  ctx.fillStyle = COLORS.wallHighlight;
  ctx.beginPath();
  ctx.roundRect(x + inset, y + inset, CELL_SIZE - inset * 2, CELL_SIZE * 0.3, [r, r, 0, 0]);
  ctx.fill();
}

function drawFloor(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
  ctx.lineWidth = 0.5;
  ctx.strokeRect(x + 0.5, y + 0.5, CELL_SIZE - 1, CELL_SIZE - 1);
}

function drawTrail(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = COLORS.trail;
  ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

  ctx.strokeStyle = COLORS.trailMark;
  ctx.lineWidth = 2;
  ctx.beginPath();
  const p = 18;
  ctx.moveTo(x + p, y + p);
  ctx.lineTo(x + CELL_SIZE - p, y + CELL_SIZE - p);
  ctx.moveTo(x + CELL_SIZE - p, y + p);
  ctx.lineTo(x + p, y + CELL_SIZE - p);
  ctx.stroke();
}

function drawExit(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const cx = x + CELL_SIZE / 2;
  const cy = y + CELL_SIZE / 2;

  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, CELL_SIZE * 0.8);
  glow.addColorStop(0, COLORS.exitGlow);
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(x - CELL_SIZE * 0.3, y - CELL_SIZE * 0.3, CELL_SIZE * 1.6, CELL_SIZE * 1.6);

  ctx.fillStyle = COLORS.exit;
  ctx.beginPath();
  ctx.arc(cx, cy, CELL_SIZE * 0.2, 0, Math.PI * 2);
  ctx.fill();

  const pulse = (Math.sin(Date.now() / 400) + 1) / 2;
  const savedAlpha = ctx.globalAlpha;
  ctx.globalAlpha *= 0.3 + pulse * 0.4;
  ctx.strokeStyle = COLORS.exit;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, CELL_SIZE * 0.3 + pulse * 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = savedAlpha;
}

function drawBall(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const radius = BALL_RADIUS * CELL_SIZE;

  const outerGlow = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius * 3);
  outerGlow.addColorStop(0, COLORS.ballGlow);
  outerGlow.addColorStop(1, "transparent");
  ctx.fillStyle = outerGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 3, 0, Math.PI * 2);
  ctx.fill();

  const bodyGrad = ctx.createRadialGradient(
    cx - radius * 0.3, cy - radius * 0.3, 0,
    cx, cy, radius
  );
  bodyGrad.addColorStop(0, COLORS.ballCenter);
  bodyGrad.addColorStop(0.7, COLORS.ball);
  bodyGrad.addColorStop(1, "#cc6600");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.beginPath();
  ctx.arc(cx - radius * 0.2, cy - radius * 0.25, radius * 0.25, 0, Math.PI * 2);
  ctx.fill();
}

function drawVignette(ctx: CanvasRenderingContext2D, canvasSize: number) {
  const cx = canvasSize / 2;
  const cy = canvasSize / 2;
  const grad = ctx.createRadialGradient(cx, cy, canvasSize * 0.25, cx, cy, canvasSize * 0.55);
  grad.addColorStop(0, "transparent");
  grad.addColorStop(1, "rgba(0, 0, 0, 0.4)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvasSize, canvasSize);
}
