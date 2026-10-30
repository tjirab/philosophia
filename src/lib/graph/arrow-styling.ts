import { getEdgeTypeConfig } from '../types';

/**
 * Returns pronounced arrow head length in px.
 * Elevated from original 4.5px to 8px at rest, and 12px when focused or in active lineage.
 */
export function getArrowLength(isConnectedToFocus: boolean, inPath: boolean): number {
  if (inPath || isConnectedToFocus) return 12;
  return 8;
}

/**
 * Relative position of arrow head along the link curve (0 to 1).
 * Positioned at 0.72 so it sits clearly in view without colliding into node circles or labels.
 */
export const ARROW_REL_POS = 0.72;

/**
 * Returns pronounced arrow color with high contrast and clarity.
 */
export function getArrowColor(
  type: string | undefined,
  isLight: boolean,
  isConnectedToFocus: boolean,
  isDimmed: boolean,
  inPath: boolean
): string {
  if (inPath) {
    return isLight ? '#9a6f14' : '#e5b94c';
  }

  if (isDimmed) {
    return isLight ? 'rgba(180, 168, 150, 0.12)' : 'rgba(70, 60, 50, 0.12)';
  }

  const cfg = getEdgeTypeConfig(type);
  return isLight ? cfg.color : cfg.colorDark;
}
