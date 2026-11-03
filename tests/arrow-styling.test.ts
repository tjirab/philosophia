import { describe, it, expect } from 'vitest';
import {
  getArrowLength,
  ARROW_REL_POS,
  getArrowColor,
  getLinkColor,
  getLinkWidth,
  getLinkLineDash,
  paintLinkPointerArea,
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

    it('clamps edge strength exceeding 5 so lines never blow up', () => {
      expect(getLinkWidth(100, false, false, false)).toBeCloseTo(1.8);
      expect(getLinkWidth(85, false, false, false)).toBeCloseTo(1.8);
      expect(getLinkWidth(-10, false, false, false)).toBeCloseTo(1.16);
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

  describe('paintLinkPointerArea', () => {
    const createMockCtx = () => {
      const calls: Array<{ method: string; args: any[] }> = [];
      const ctx: any = {
        save: () => calls.push({ method: 'save', args: [] }),
        restore: () => calls.push({ method: 'restore', args: [] }),
        beginPath: () => calls.push({ method: 'beginPath', args: [] }),
        moveTo: (x: number, y: number) => calls.push({ method: 'moveTo', args: [x, y] }),
        lineTo: (x: number, y: number) => calls.push({ method: 'lineTo', args: [x, y] }),
        quadraticCurveTo: (cpx: number, cpy: number, x: number, y: number) =>
          calls.push({ method: 'quadraticCurveTo', args: [cpx, cpy, x, y] }),
        bezierCurveTo: (cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) =>
          calls.push({ method: 'bezierCurveTo', args: [cp1x, cp1y, cp2x, cp2y, x, y] }),
        stroke: () => calls.push({ method: 'stroke', args: [] }),
        strokeStyle: '',
        lineWidth: 0,
      };
      return { ctx, calls };
    };

    it('draws quadratic curve matching precomputed __controlPoints', () => {
      const { ctx, calls } = createMockCtx();
      const link = {
        source: { x: 100, y: 100 },
        target: { x: 300, y: 100 },
        __controlPoints: [200, 50],
      };

      paintLinkPointerArea(link, '#123456', ctx, 1.0, 0.12);

      expect(ctx.strokeStyle).toBe('#123456');
      expect(ctx.lineWidth).toBe(16);
      expect(calls).toEqual([
        { method: 'save', args: [] },
        { method: 'beginPath', args: [] },
        { method: 'moveTo', args: [100, 100] },
        { method: 'quadraticCurveTo', args: [200, 50, 300, 100] },
        { method: 'stroke', args: [] },
        { method: 'restore', args: [] },
      ]);
    });

    it('accurately computes control point with positive curvature matching force-graph (not inverted)', () => {
      const { ctx, calls } = createMockCtx();
      // Horizontal link from (100, 100) to (300, 100): dx = 200, dy = 0, l = 200
      // curvature = 0.12 => d = 24
      // cpX = (100 + 300) / 2 + (0 / 200) * 24 = 200
      // cpY = (100 + 100) / 2 - (200 / 200) * 24 = 100 - 24 = 76 (arched UPWARDS, not 124 downwards)
      const link = {
        source: { x: 100, y: 100 },
        target: { x: 300, y: 100 },
      };

      paintLinkPointerArea(link, '#abcdef', ctx, 1.0, 0.12);

      const quadCall = calls.find((c) => c.method === 'quadraticCurveTo');
      expect(quadCall).toBeDefined();
      expect(quadCall?.args[0]).toBeCloseTo(200);
      expect(quadCall?.args[1]).toBeCloseTo(76);
      expect(quadCall?.args[2]).toBe(300);
      expect(quadCall?.args[3]).toBe(100);
    });

    it('scales hit area width with globalScale for effortless pointer interaction', () => {
      const { ctx: ctxZoomedIn } = createMockCtx();
      const link = { source: { x: 0, y: 0 }, target: { x: 100, y: 100 } };

      paintLinkPointerArea(link, '#000', ctxZoomedIn, 2.0);
      expect(ctxZoomedIn.lineWidth).toBe(8); // 16 / 2 = 8

      const { ctx: ctxZoomedOut } = createMockCtx();
      paintLinkPointerArea(link, '#000', ctxZoomedOut, 0.5);
      expect(ctxZoomedOut.lineWidth).toBe(32); // 16 / 0.5 = 32
    });

    it('draws straight line when curvature is 0', () => {
      const { ctx, calls } = createMockCtx();
      const link = {
        source: { x: 50, y: 50 },
        target: { x: 150, y: 150 },
      };

      paintLinkPointerArea(link, '#fff', ctx, 1.0, 0);

      const lineCall = calls.find((c) => c.method === 'lineTo');
      expect(lineCall).toBeDefined();
      expect(lineCall?.args).toEqual([150, 150]);
    });

    it('gracefully handles missing or non-numeric source/target endpoints without throwing', () => {
      const { ctx, calls } = createMockCtx();
      paintLinkPointerArea({ source: null, target: null }, '#000', ctx, 1.0);
      paintLinkPointerArea({ source: { x: 'abc' }, target: { x: 10 } }, '#000', ctx, 1.0);
      expect(calls.length).toBe(0);
    });
  });
});
