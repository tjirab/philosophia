import { describe, it, expect } from 'vitest';
import {
  getArrowLength,
  ARROW_REL_POS,
  getArrowColor,
} from '../src/lib/graph/arrow-styling';

describe('Edge Arrow Styling', () => {
  describe('getArrowLength', () => {
    it('returns pronounced rest length of 8px for standard edges', () => {
      expect(getArrowLength(false, false)).toBe(8);
    });

    it('returns prominent length of 12px when edge is connected to focused node', () => {
      expect(getArrowLength(true, false)).toBe(12);
    });

    it('returns prominent length of 12px when edge is part of an active lineage path', () => {
      expect(getArrowLength(false, true)).toBe(12);
      expect(getArrowLength(true, true)).toBe(12);
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
    it('returns gold theme color when link is in active lineage path', () => {
      expect(getArrowColor('INFLUENCED', true, false, false, true)).toBe('#9a6f14');
      expect(getArrowColor('INFLUENCED', false, false, false, true)).toBe('#e5b94c');
    });

    it('returns dimmed subtle color when another node is focused', () => {
      expect(getArrowColor('INFLUENCED', true, false, true, false)).toBe('rgba(180, 168, 150, 0.12)');
      expect(getArrowColor('INFLUENCED', false, false, true, false)).toBe('rgba(70, 60, 50, 0.12)');
    });

    it('returns vibrant dialectical edge colors for critique, development, synthesis, and influence', () => {
      // Light theme
      expect(getArrowColor('CRITIQUED', true, false, false, false)).toBe('#dc2626');
      expect(getArrowColor('DEVELOPED', true, false, false, false)).toBe('#0d9488');
      expect(getArrowColor('SYNTHESIZED', true, false, false, false)).toBe('#9333ea');
      expect(getArrowColor('INFLUENCED', true, false, false, false)).toBe('#2563eb');

      // Dark theme
      expect(getArrowColor('CRITIQUED', false, false, false, false)).toBe('#f87171');
      expect(getArrowColor('DEVELOPED', false, false, false, false)).toBe('#2dd4bf');
      expect(getArrowColor('SYNTHESIZED', false, false, false, false)).toBe('#c084fc');
      expect(getArrowColor('INFLUENCED', false, false, false, false)).toBe('#60a5fa');
    });

    it('falls back safely to INFLUENCED color when edge type is undefined', () => {
      expect(getArrowColor(undefined, true, false, false, false)).toBe('#2563eb');
      expect(getArrowColor(undefined, false, false, false, false)).toBe('#60a5fa');
    });
  });
});
