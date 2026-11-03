import { getEdgeTypeConfig } from '../types';

export const ARROW_REL_POS = 0.72;

export const GRAYED_OUT_LINK_LIGHT = 'rgba(165, 158, 148, 0.35)';
export const GRAYED_OUT_LINK_DARK = 'rgba(115, 110, 102, 0.35)';
export const GRAYED_OUT_ARROW_LIGHT = 'rgba(165, 158, 148, 0.45)';
export const GRAYED_OUT_ARROW_DARK = 'rgba(115, 110, 102, 0.45)';

/**
 * Returns pronounced arrow head length in px.
 * 12px for in-path links and focused node edges.
 * 6px for grayed-out non-path edges during lineage tracing (subtle context).
 * 8px at rest.
 */
export function getArrowLength(
  isConnectedToFocus: boolean,
  inPath: boolean,
  isPathActive: boolean = false
): number {
  if (inPath || isConnectedToFocus) return 12;
  if (isPathActive && !inPath) return 6;
  return 8;
}

/**
 * Returns pronounced arrow color with high contrast and dialectical clarity.
 * When inPath is true, preserves the distinct edge type color so influence types are discernible.
 * When isPathActive is true but inPath is false, returns grayed-out color.
 */
export function getArrowColor(
  type: string | undefined,
  isLight: boolean,
  isConnectedToFocus: boolean,
  isDimmed: boolean,
  inPath: boolean,
  isPathActive: boolean = false
): string {
  if (inPath) {
    const cfg = getEdgeTypeConfig(type);
    return isLight ? cfg.color : cfg.colorDark;
  }

  if (isPathActive && !inPath) {
    return isLight ? GRAYED_OUT_ARROW_LIGHT : GRAYED_OUT_ARROW_DARK;
  }

  if (isDimmed) {
    return isLight ? 'rgba(180, 168, 150, 0.12)' : 'rgba(70, 60, 50, 0.12)';
  }

  const cfg = getEdgeTypeConfig(type);
  return isLight ? cfg.color : cfg.colorDark;
}

/**
 * Returns link line color.
 * Preserves distinct edge type color along the active lineage path.
 * Grays out non-path edges during lineage tracing so they remain visible as spatial context.
 */
export function getLinkColor(
  type: string | undefined,
  isLight: boolean,
  isConnectedToFocus: boolean,
  isDimmed: boolean,
  inPath: boolean,
  isPathActive: boolean = false
): string {
  if (inPath) {
    const cfg = getEdgeTypeConfig(type);
    return isLight ? cfg.color : cfg.colorDark;
  }

  if (isPathActive && !inPath) {
    return isLight ? GRAYED_OUT_LINK_LIGHT : GRAYED_OUT_LINK_DARK;
  }

  if (isDimmed) {
    return isLight ? 'rgba(180, 168, 150, 0.08)' : 'rgba(70, 60, 50, 0.08)';
  }

  if (isLight) {
    switch (type) {
      case 'CRITIQUED':
        return isConnectedToFocus ? 'rgba(220, 38, 38, 1.0)' : 'rgba(220, 38, 38, 0.42)';
      case 'SYNTHESIZED':
        return isConnectedToFocus ? 'rgba(147, 51, 234, 1.0)' : 'rgba(147, 51, 234, 0.42)';
      case 'DEVELOPED':
        return isConnectedToFocus ? 'rgba(13, 148, 136, 1.0)' : 'rgba(13, 148, 136, 0.42)';
      case 'INFLUENCED':
      default:
        return isConnectedToFocus ? 'rgba(37, 99, 235, 1.0)' : 'rgba(37, 99, 235, 0.35)';
    }
  } else {
    switch (type) {
      case 'CRITIQUED':
        return isConnectedToFocus ? 'rgba(248, 113, 113, 1.0)' : 'rgba(248, 113, 113, 0.42)';
      case 'SYNTHESIZED':
        return isConnectedToFocus ? 'rgba(192, 132, 252, 1.0)' : 'rgba(192, 132, 252, 0.42)';
      case 'DEVELOPED':
        return isConnectedToFocus ? 'rgba(45, 212, 191, 1.0)' : 'rgba(45, 212, 191, 0.42)';
      case 'INFLUENCED':
      default:
        return isConnectedToFocus ? 'rgba(96, 165, 250, 1.0)' : 'rgba(96, 165, 250, 0.35)';
    }
  }
}

/**
 * Returns link line stroke width in px.
 */
export function getLinkWidth(
  strength: number | undefined,
  isConnectedToFocus: boolean,
  inPath: boolean,
  isPathActive: boolean = false
): number {
  if (inPath) {
    return 4.2;
  }

  if (isPathActive && !inPath) {
    return 0.8;
  }

  if (isConnectedToFocus) {
    return 3.2;
  }

  // Defensively clamp edge weight / strength between 1 and 5
  const s = Math.min(5, Math.max(1, typeof strength === 'number' ? strength : 3));
  return 1.0 + s * 0.16;
}

/**
 * Returns stroke dash array for HTML Canvas setLineDash.
 * Distinguishes dialectical critiques and synthetic mergers with tactile dashed line patterns.
 */
export function getLinkLineDash(
  type: string | undefined,
  inPath: boolean,
  isPathActive: boolean = false
): number[] | null {
  // Grayed-out non-path edges stay solid to prevent a noisy visual background
  if (isPathActive && !inPath) {
    return null;
  }

  switch (type) {
    case 'CRITIQUED':
      return [7, 4]; // Dashed line for dialectical critique and rebuttal
    case 'SYNTHESIZED':
      return [8, 3, 2, 3]; // Dash-dot pattern for synthetic integration
    case 'DEVELOPED':
    case 'INFLUENCED':
    default:
      return null; // Solid line
  }
}

/**
 * Paints an accurate curved hit-testing stroke on the shadow canvas for graph link interactions.
 * Uses link.__controlPoints directly to match the visible canvas curve to the sub-pixel,
 * and uses the exact trigonometric control-point formula as fallback.
 * Fixes inverted hit-box curvature where hover was detected 1-2 cm on the wrong side of the edge.
 */
export function paintLinkPointerArea(
  link: any,
  color: string,
  ctx: CanvasRenderingContext2D,
  globalScale: number = 1,
  defaultCurvature: number = 0.12
): void {
  const start = link.source;
  const end = link.target;
  if (!start || !end || typeof start.x !== 'number' || typeof end.x !== 'number') return;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);

  const controlPoints = link.__controlPoints;
  if (controlPoints && controlPoints.length >= 2) {
    if (controlPoints.length === 2) {
      ctx.quadraticCurveTo(controlPoints[0], controlPoints[1], end.x, end.y);
    } else {
      ctx.bezierCurveTo(controlPoints[0], controlPoints[1], controlPoints[2], controlPoints[3], end.x, end.y);
    }
  } else {
    // If __controlPoints hasn't been cached yet, compute exactly matching force-graph:
    // a = atan2(dy, dx)
    // cp.x = midX + d * cos(a - PI/2) = midX + (dy / l) * d
    // cp.y = midY + d * sin(a - PI/2) = midY - (dx / l) * d
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const l = Math.hypot(dx, dy);
    const curvature = typeof link.curvature === 'number' ? link.curvature : defaultCurvature;

    if (l > 0 && curvature) {
      const d = l * curvature;
      const cpX = (start.x + end.x) / 2 + (dy / l) * d;
      const cpY = (start.y + end.y) / 2 - (dx / l) * d;
      ctx.quadraticCurveTo(cpX, cpY, end.x, end.y);
    } else {
      ctx.lineTo(end.x, end.y);
    }
  }

  ctx.strokeStyle = color;
  // Ensure a generous, effortless hit area (16px wide in screen coordinates, min 4 in graph space)
  const hitWidth = typeof globalScale === 'number' && globalScale > 0
    ? Math.max(16 / globalScale, 4)
    : 16;
  ctx.lineWidth = hitWidth;
  ctx.stroke();
  ctx.restore();
}
