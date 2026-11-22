import { GridBounds } from './grid-renderer';

const REFERENCE_FONT_SIZE = 16;
const MAX_LABEL_CACHE_ENTRIES = 1000;
export const SIMPLE_LOD_SCALE_THRESHOLD = 0.45;

const labelWidthCache = new Map<string, number>();

/**
 * Returns true when zoomed out far enough that detailed portrait medallions,
 * dashed halos, and rims can be simplified to lightweight circles.
 */
export function isSimpleLod(globalScale: number): boolean {
  return Number.isFinite(globalScale) && globalScale < SIMPLE_LOD_SCALE_THRESHOLD;
}

/**
 * Checks whether a world-space circle (x, y, margin) intersects the visible viewport bounds.
 * Returns true when bounds are unavailable so rendering fails open.
 */
export function isNodeVisibleInViewport(
  x: number | undefined,
  y: number | undefined,
  margin: number,
  bounds: GridBounds | null | undefined
): boolean {
  if (!bounds) return true;
  if (typeof x !== 'number' || typeof y !== 'number' || !Number.isFinite(x) || !Number.isFinite(y)) {
    return false;
  }
  return (
    x >= bounds.minX - margin &&
    x <= bounds.maxX + margin &&
    y >= bounds.minY - margin &&
    y <= bounds.maxY + margin
  );
}

/**
 * Measures canvas text width once at a reference font size (16px) and caches the result,
 * scaling linearly to the requested fontSize to avoid per-frame ctx.measureText() overhead.
 */
export function measureLabelWidthCached(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontWeight: 'bold' | 'normal',
  fontSize: number,
  fontFamily: string
): number {
  const key = `${fontWeight}|${fontFamily}|${text}`;
  let baseWidth = labelWidthCache.get(key);

  if (baseWidth === undefined) {
    const prevFont = ctx.font;
    ctx.font = `${fontWeight} ${REFERENCE_FONT_SIZE}px ${fontFamily}`;
    baseWidth = ctx.measureText(text).width;
    ctx.font = prevFont;

    if (labelWidthCache.size >= MAX_LABEL_CACHE_ENTRIES) {
      labelWidthCache.clear();
    }
    labelWidthCache.set(key, baseWidth);
  }

  return (baseWidth * fontSize) / REFERENCE_FONT_SIZE;
}

export function clearLabelWidthCache(): void {
  labelWidthCache.clear();
}

export function getLabelWidthCacheSize(): number {
  return labelWidthCache.size;
}
