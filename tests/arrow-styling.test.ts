import { describe, it, expect } from 'vitest';
import {
  getArrowLength,
  ARROW_REL_POS,
  getArrowColor,
  getLinkColor,
  getLinkWidth,
  getLinkLineDash,
  GRAYED_OUT_LINK_LIGHT,
  GRAYED_OUT_LINK_DARK,
  GRAYED_OUT_ARROW_LIGHT,
  GRAYED_OUT_ARROW_DARK,
} from '../src/lib/graph/arrow-styling';

describe('Edge & Arrow Styling', () => {
  describe('getArrowLength', () => {
    it('returns pronounced rest length of 8px for standard edges', () => {
      expect(getArrowLength(false, false, false)).toBe(8);
    });

    it('returns prominent length of 12px when edge is connected to focused node', () => {
      expect(getArrowLength(true, false, false)).toBe(12);
    });

    it('returns prominent length of 12px when edge is part of an active lineage path', () => {
      expect(getArrowLength(false, true, true)).toBe(12);
      expect(getArrowLength(true, true, true)).toBe(12);
    });

    it('returns subdued length of 6px for non-path edges when a lineage path is active', () => {
      expect(getArrowLength(false, false, true)).toBe(6);
    });
  });

  describe('ARROW_REL_POS', () => {
    it('positions arrow heads at 0.72 along the curve for unobstructed visibility', () => {
      expect(ARROW_REL_POS).toBe(0.72);
      expect(ARROW_REL_POS).toBeGreaterThan(0.5);
      expect(ARROW_REL_POS).toBeLessThan(0.9);
    });
  });

  describe('getArrowColor', () => {
    it('preserves distinct dialectical edge type colors along the active lineage path', () => {
      // In-path edges must NOT be universal gold; they must be discernible by influence type
      // Light theme
      expect(getArrowColor('CRITIQUED', true, false, false, true, true)).toBe('#dc2626');
      expect(getArrowColor('DEVELOPED', true, false, false, true, true)).toBe('#0d9488');
      expect(getArrowColor('SYNTHESIZED', true, false, false, true, true)).toBe('#9333ea');
      expect(getArrowColor('INFLUENCED', true, false, false, true, true)).toBe('#2563eb');

      // Dark theme
      expect(getArrowColor('CRITIQUED', false, false, false, true, true)).toBe('#f87171');
      expect(getArrowColor('DEVELOPED', false, false, false, true, true)).toBe('#2dd4bf');
      expect(getArrowColor('SYNTHESIZED', false, false, false, true, true)).toBe('#c084fc');
      expect(getArrowColor('INFLUENCED', false, false, false, true, true)).toBe('#60a5fa');
    });

    it('returns grayed-out arrow color for non-path edges when lineage is active', () => {
      expect(getArrowColor('INFLUENCED', true, false, false, false, true)).toBe(GRAYED_OUT_ARROW_LIGHT);
      expect(getArrowColor('INFLUENCED', false, false, false, false, true)).toBe(GRAYED_OUT_ARROW_DARK);
    });

    it('returns dimmed subtle color when another node is focused without active lineage', () => {
      expect(getArrowColor('INFLUENCED', true, false, true, false, false)).toBe('rgba(180, 168, 150, 0.12)');
      expect(getArrowColor('INFLUENCED', false, false, true, false, false)).toBe('rgba(70, 60, 50, 0.12)');
    });

    it('returns vibrant dialectical edge colors at rest', () => {
      expect(getArrowColor('CRITIQUED', true, false, false, false, false)).toBe('#dc2626');
      expect(getArrowColor('DEVELOPED', true, false, false, false, false)).toBe('#0d9488');
      expect(getArrowColor('SYNTHESIZED', true, false, false, false, false)).toBe('#9333ea');
      expect(getArrowColor('INFLUENCED', true, false, false, false, false)).toBe('#2563eb');

      expect(getArrowColor('CRITIQUED', false, false, false, false, false)).toBe('#f87171');
      expect(getArrowColor('DEVELOPED', false, false, false, false, false)).toBe('#2dd4bf');
      expect(getArrowColor('SYNTHESIZED', false, false, false, false, false)).toBe('#c084fc');
      expect(getArrowColor('INFLUENCED', false, false, false, false, false)).toBe('#60a5fa');
    });

    it('falls back safely to INFLUENCED color when edge type is undefined', () => {
      expect(getArrowColor(undefined, true, false, false, true, true)).toBe('#2563eb');
      expect(getArrowColor(undefined, false, false, false, true, true)).toBe('#60a5fa');
    });
  });

  describe('getLinkColor', () => {
    it('returns distinct dialectical colors for edges on the active lineage path', () => {
      expect(getLinkColor('CRITIQUED', true, false, false, true, true)).toBe('#dc2626');
      expect(getLinkColor('DEVELOPED', true, false, false, true, true)).toBe('#0d9488');
      expect(getLinkColor('SYNTHESIZED', true, false, false, true, true)).toBe('#9333ea');
      expect(getLinkColor('INFLUENCED', true, false, false, true, true)).toBe('#2563eb');

      expect(getLinkColor('CRITIQUED', false, false, false, true, true)).toBe('#f87171');
      expect(getLinkColor('DEVELOPED', false, false, false, true, true)).toBe('#2dd4bf');
      expect(getLinkColor('SYNTHESIZED', false, false, false, true, true)).toBe('#c084fc');
      expect(getLinkColor('INFLUENCED', false, false, false, true, true)).toBe('#60a5fa');
    });

    it('returns visible grayed-out color for non-path edges during active lineage tracing', () => {
      // Must not be entirely hidden (rgba with 0.10 alpha on beige was practically invisible)
      expect(getLinkColor('INFLUENCED', true, false, false, false, true)).toBe(GRAYED_OUT_LINK_LIGHT);
      expect(getLinkColor('INFLUENCED', false, false, false, false, true)).toBe(GRAYED_OUT_LINK_DARK);
    });

    it('returns dimmed color when another node is focused without active lineage', () => {
      expect(getLinkColor('INFLUENCED', true, false, true, false, false)).toBe('rgba(180, 168, 150, 0.08)');
      expect(getLinkColor('INFLUENCED', false, false, true, false, false)).toBe('rgba(70, 60, 50, 0.08)');
    });

    it('returns full alpha color when connected to focused node', () => {
      expect(getLinkColor('CRITIQUED', true, true, false, false, false)).toBe('rgba(220, 38, 38, 1.0)');
      expect(getLinkColor('DEVELOPED', true, true, false, false, false)).toBe('rgba(13, 148, 136, 1.0)');
      expect(getLinkColor('SYNTHESIZED', true, true, false, false, false)).toBe('rgba(147, 51, 234, 1.0)');
      expect(getLinkColor('INFLUENCED', true, true, false, false, false)).toBe('rgba(37, 99, 235, 1.0)');
    });
  });

  describe('getLinkWidth', () => {
    it('returns prominent 4.2px width for edges in active lineage path', () => {
      expect(getLinkWidth(3, false, true, true)).toBe(4.2);
    });

    it('returns delicate 0.8px width for grayed-out non-path edges', () => {
      expect(getLinkWidth(5, false, false, true)).toBe(0.8);
    });

    it('returns 3.2px width for edges connected to focused node', () => {
      expect(getLinkWidth(3, true, false, false)).toBe(3.2);
    });

    it('calculates rest width based on strength score', () => {
      expect(getLinkWidth(3, false, false, false)).toBeCloseTo(1.48);
      expect(getLinkWidth(5, false, false, false)).toBeCloseTo(1.8);
      expect(getLinkWidth(undefined, false, false, false)).toBeCloseTo(1.48);
    });
  });

  describe('getLinkLineDash', () => {
    it('returns dashed pattern for CRITIQUED edges', () => {
      expect(getLinkLineDash('CRITIQUED', true, true)).toEqual([7, 4]);
      expect(getLinkLineDash('CRITIQUED', false, false)).toEqual([7, 4]);
    });

    it('returns dash-dot pattern for SYNTHESIZED edges', () => {
      expect(getLinkLineDash('SYNTHESIZED', true, true)).toEqual([8, 3, 2, 3]);
      expect(getLinkLineDash('SYNTHESIZED', false, false)).toEqual([8, 3, 2, 3]);
    });

    it('returns null (solid) for DEVELOPED and INFLUENCED edges', () => {
      expect(getLinkLineDash('DEVELOPED', true, true)).toBeNull();
      expect(getLinkLineDash('INFLUENCED', true, true)).toBeNull();
    });

    it('returns null (solid) for grayed-out non-path edges to keep background calm', () => {
      expect(getLinkLineDash('CRITIQUED', false, true)).toBeNull();
      expect(getLinkLineDash('SYNTHESIZED', false, true)).toBeNull();
    });
  });
});
