/**
 * Cartographic background grid calculations and canvas rendering for ForceGraph.
 * Provides adaptive multi-scale grid lines, intersection dots, and origin compass
 * that smoothly transform with user pan and zoom operations.
 */

export interface Matrix2D {
  a: number; // horizontal scale
  d: number; // vertical scale
  e: number; // horizontal translation
  f: number; // vertical translation
}

export interface GridBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/**
 * Calculates adaptive step size in graph coordinates.
 * Multiplies or divides baseStep by powers of 2 to keep visual screen spacing
 * comfortably bounded between minScreenSpacing and maxScreenSpacing px.
 */
export function getGridStep(
  globalScale: number,
  baseStep = 56,
  minScreenSpacing = 40,
  maxScreenSpacing = 110
): number {
  if (globalScale <= 0 || !Number.isFinite(globalScale)) {
    return baseStep;
  }

  let step = baseStep;
  while (step * globalScale < minScreenSpacing) {
    step *= 2;
  }
  while (step * globalScale > maxScreenSpacing) {
    step /= 2;
  }
  return step;
}

/**
 * Calculates visible world space coordinates (minX, maxX, minY, maxY)
 * from a 2D canvas context transformation matrix.
 */
export function getGridBounds(
  matrix: Matrix2D | null | undefined,
  canvasWidth: number,
  canvasHeight: number
): GridBounds {
  if (!matrix || matrix.a === 0 || matrix.d === 0 || !Number.isFinite(matrix.a) || !Number.isFinite(matrix.d)) {
    return {
      minX: 0,
      maxX: canvasWidth,
      minY: 0,
      maxY: canvasHeight,
    };
  }

  const minX = -matrix.e / matrix.a || 0;
  const minY = -matrix.f / matrix.d || 0;
  const maxX = minX + canvasWidth / matrix.a;
  const maxY = minY + canvasHeight / matrix.d;

  return { minX, maxX, minY, maxY };
}

/**
 * Draws the cartographic constellation grid directly onto the canvas context.
 * Called in onRenderFramePre before nodes and links are drawn.
 */
export function drawCartographicGrid(
  ctx: CanvasRenderingContext2D,
  globalScale: number,
  isLight: boolean
): void {
  ctx.save();
  try {
    const matrix = ctx.getTransform();
    const bounds = getGridBounds(matrix, ctx.canvas.width, ctx.canvas.height);
    const { minX, maxX, minY, maxY } = bounds;

    const step = getGridStep(globalScale, 56);
    const startX = Math.floor(minX / step) * step;
    const endX = Math.ceil(maxX / step) * step;
    const startY = Math.floor(minY / step) * step;
    const endY = Math.ceil(maxY / step) * step;

    const lineWidth = 1 / globalScale;
    ctx.lineWidth = lineWidth;

    // 1. Minor grid lines
    ctx.beginPath();
    for (let x = startX; x <= endX; x += step) {
      ctx.moveTo(x, minY);
      ctx.lineTo(x, maxY);
    }
    for (let y = startY; y <= endY; y += step) {
      ctx.moveTo(minX, y);
      ctx.lineTo(maxX, y);
    }
    ctx.strokeStyle = isLight
      ? 'rgba(140, 100, 30, 0.055)'
      : 'rgba(229, 185, 76, 0.04)';
    ctx.stroke();

    // 2. Major grid lines (every 4th step) for cartographic structure
    const majorStep = step * 4;
    const majorStartX = Math.floor(minX / majorStep) * majorStep;
    const majorEndX = Math.ceil(maxX / majorStep) * majorStep;
    const majorStartY = Math.floor(minY / majorStep) * majorStep;
    const majorEndY = Math.ceil(maxY / majorStep) * majorStep;

    ctx.beginPath();
    for (let x = majorStartX; x <= majorEndX; x += majorStep) {
      ctx.moveTo(x, minY);
      ctx.lineTo(x, maxY);
    }
    for (let y = majorStartY; y <= majorEndY; y += majorStep) {
      ctx.moveTo(minX, y);
      ctx.lineTo(maxX, y);
    }
    ctx.strokeStyle = isLight
      ? 'rgba(140, 100, 30, 0.11)'
      : 'rgba(229, 185, 76, 0.085)';
    ctx.stroke();

    // 3. Intersection stippling dots
    const dotRadius = 1.3 / globalScale;
    ctx.beginPath();
    for (let x = startX; x <= endX; x += step) {
      for (let y = startY; y <= endY; y += step) {
        ctx.moveTo(x + dotRadius, y);
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      }
    }
    ctx.fillStyle = isLight
      ? 'rgba(140, 100, 30, 0.18)'
      : 'rgba(229, 185, 76, 0.16)';
    ctx.fill();

    // 4. Cartographic origin marker (0, 0) if within visible viewport
    if (minX <= 0 && maxX >= 0 && minY <= 0 && maxY >= 0) {
      const originCross = 16 / globalScale;
      const originRadius = 6 / globalScale;

      ctx.beginPath();
      ctx.moveTo(-originCross, 0);
      ctx.lineTo(originCross, 0);
      ctx.moveTo(0, -originCross);
      ctx.lineTo(0, originCross);
      ctx.strokeStyle = isLight
        ? 'rgba(154, 111, 20, 0.45)'
        : 'rgba(229, 185, 76, 0.45)';
      ctx.lineWidth = 1.5 / globalScale;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, originRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
  } finally {
    ctx.restore();
  }
}
