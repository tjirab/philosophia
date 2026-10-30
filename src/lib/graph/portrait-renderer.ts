/**
 * Utility functions for philosopher portrait medallions on HTML5 canvas.
 */

export interface PortraitCrop {
  sx: number;
  sy: number;
  sWidth: number;
  sHeight: number;
}

/**
 * Computes an aspect-ratio-preserving square crop for an image,
 * biased slightly towards the top (where faces/heads are positioned).
 */
export function getPortraitCoverCrop(imgWidth: number, imgHeight: number): PortraitCrop {
  if (imgWidth <= 0 || imgHeight <= 0) {
    return { sx: 0, sy: 0, sWidth: Math.max(1, imgWidth), sHeight: Math.max(1, imgHeight) };
  }

  const cropDim = Math.min(imgWidth, imgHeight);
  const sx = Math.max(0, (imgWidth - cropDim) / 2);
  // Bias vertical crop towards the upper 22% of headroom for portrait photographs/busts
  const sy = Math.max(0, Math.min(imgHeight - cropDim, (imgHeight - cropDim) * 0.22));

  return {
    sx,
    sy,
    sWidth: cropDim,
    sHeight: cropDim,
  };
}

/**
 * Generates a two-letter uppercase monogram fallback.
 */
export function getNodeMonogram(name: string, type?: string): string {
  if (type === 'concept') return '✦';
  const cleanName = name.replace(/^(von|de|du|of|the)\s+/i, '').trim();
  const parts = cleanName.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return cleanName.slice(0, 2).toUpperCase();
}

/**
 * Computes node canvas radius given val and importanceScore.
 */
export function getNodeRadius(val?: number, importanceScore?: number): number {
  const base = Math.max(13, (val || 8) * 1.35);
  if (importanceScore && importanceScore >= 95) {
    return Math.max(base, 18);
  }
  return base;
}

export type PortraitCacheEntry = HTMLImageElement | 'loading' | 'failed';

/**
 * Safe check whether an image has completed loading and has positive dimensions.
 * Guarded against SSR/Node environments where HTMLImageElement is undefined.
 */
export function isImageReady(img: unknown): img is HTMLImageElement {
  if (typeof HTMLImageElement !== 'undefined') {
    return img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0;
  }
  return (
    typeof img === 'object' &&
    img !== null &&
    'complete' in img &&
    Boolean((img as any).complete) &&
    'naturalWidth' in img &&
    Number((img as any).naturalWidth) > 0
  );
}

// In-memory global cache for loaded philosopher portraits
export const portraitCache = new Map<string, PortraitCacheEntry>();

export function clearPortraitCache(): void {
  portraitCache.clear();
}

export function getPortraitFromCache(url: string): PortraitCacheEntry | undefined {
  return portraitCache.get(url);
}

/**
 * Preload an image URL into portraitCache and trigger a callback upon completion.
 */
export function preloadPortrait(
  url: string,
  onLoaded?: (img: HTMLImageElement) => void,
  onError?: () => void
): void {
  if (typeof window === 'undefined' || !url) return;

  const existing = portraitCache.get(url);
  if (isImageReady(existing)) {
    onLoaded?.(existing);
    return;
  }
  if (existing === 'loading') {
    return;
  }

  portraitCache.set(url, 'loading');
  const img = new Image();

  img.onload = () => {
    portraitCache.set(url, img);
    onLoaded?.(img);
  };

  img.onerror = () => {
    portraitCache.set(url, 'failed');
    onError?.();
  };

  img.src = url;

  // Handle immediate synchronous completion from browser memory cache
  if (isImageReady(img)) {
    portraitCache.set(url, img);
    onLoaded?.(img);
  }
}

export interface DrawMedallionOptions {
  isSelected?: boolean;
  isPrimaryThinker?: boolean;
  isLight?: boolean;
  size: number;
}

/**
 * Draws the philosopher portrait medallion or fallback monogram on an HTML5 canvas.
 * Returns true if portrait image was painted, or false if fallback monogram was drawn.
 */
export function drawPortraitMedallion(
  ctx: CanvasRenderingContext2D,
  node: { x: number; y: number; name: string; type?: string; color?: string; importanceScore?: number },
  img: unknown,
  options: DrawMedallionOptions
): boolean {
  const { isSelected = false, isPrimaryThinker = false, isLight = false, size } = options;
  const portraitRadius = size * 0.86;

  // Background node base circle
  ctx.beginPath();
  ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
  ctx.fillStyle = node.color || '#f4a261';
  ctx.fill();

  if (isImageReady(img)) {
    const crop = getPortraitCoverCrop(img.naturalWidth, img.naturalHeight);

    ctx.save();
    ctx.beginPath();
    ctx.arc(node.x, node.y, portraitRadius, 0, 2 * Math.PI, false);
    ctx.clip();
    ctx.drawImage(
      img,
      crop.sx,
      crop.sy,
      crop.sWidth,
      crop.sHeight,
      node.x - portraitRadius,
      node.y - portraitRadius,
      portraitRadius * 2,
      portraitRadius * 2
    );
    ctx.restore();

    // Antique medallion rim border
    ctx.beginPath();
    ctx.arc(node.x, node.y, portraitRadius, 0, 2 * Math.PI, false);
    ctx.lineWidth = isSelected ? 2.5 : isPrimaryThinker ? 2 : 1.2;
    ctx.strokeStyle = isSelected
      ? (isLight ? '#9a6f14' : '#fef08a')
      : (isLight ? 'rgba(90, 70, 45, 0.85)' : 'rgba(235, 215, 175, 0.85)');
    ctx.stroke();

    return true;
  }

  // Fallback: antique monogram medallion
  ctx.beginPath();
  ctx.arc(node.x, node.y, portraitRadius, 0, 2 * Math.PI, false);
  ctx.fillStyle = isLight ? 'rgba(245, 240, 230, 0.95)' : 'rgba(25, 22, 18, 0.95)';
  ctx.fill();

  const monogram = getNodeMonogram(node.name, node.type);
  const monogramSize = Math.max(portraitRadius * 0.75, 8);
  ctx.font = `bold ${monogramSize}px "Cinzel", Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = isLight ? '#1f1b15' : '#f5f0e6';
  ctx.fillText(monogram, node.x, node.y);

  ctx.beginPath();
  ctx.arc(node.x, node.y, portraitRadius, 0, 2 * Math.PI, false);
  ctx.lineWidth = isSelected ? 2.5 : isPrimaryThinker ? 2 : 1.2;
  ctx.strokeStyle = isSelected
    ? (isLight ? '#9a6f14' : '#fef08a')
    : (isLight ? 'rgba(90, 70, 45, 0.85)' : 'rgba(235, 215, 175, 0.85)');
  ctx.stroke();

  return false;
}
