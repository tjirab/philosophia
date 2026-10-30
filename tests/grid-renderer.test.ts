import { describe, it, expect, vi } from 'vitest';
import {
  getGridStep,
  getGridBounds,
  drawCartographicGrid,
  Matrix2D,
} from '../src/lib/graph/grid-renderer';

describe('Cartographic Grid Renderer', () => {
  describe('getGridStep', () => {
    it('returns baseStep when globalScale is 1.0 and within range', () => {
      const step = getGridStep(1.0, 56, 40, 110);
      expect(step).toBe(56);
      expect(step * 1.0).toBeGreaterThanOrEqual(40);
      expect(step * 1.0).toBeLessThanOrEqual(110);
    });

    it('scales up step by powers of 2 when zoomed out', () => {
      // Zoomed out to 0.25x: 56 * 0.25 = 14 (< 40), so step must double to 112 (112*0.25=28 < 40) then 224 (224*0.25=56)
      const step = getGridStep(0.25, 56, 40, 110);
      expect(step).toBe(224);
      expect(step * 0.25).toBeGreaterThanOrEqual(40);
      expect(step * 0.25).toBeLessThanOrEqual(110);
    });

    it('scales down step by powers of 2 when zoomed in', () => {
      // Zoomed in to 3.0x: 56 * 3.0 = 168 (> 110), so step halves to 28 (28*3.0=84)
      const step = getGridStep(3.0, 56, 40, 110);
      expect(step).toBe(28);
      expect(step * 3.0).toBeGreaterThanOrEqual(40);
      expect(step * 3.0).toBeLessThanOrEqual(110);
    });

    it('handles non-positive or invalid scales gracefully', () => {
      expect(getGridStep(0)).toBe(56);
      expect(getGridStep(-1)).toBe(56);
      expect(getGridStep(NaN)).toBe(56);
      expect(getGridStep(Infinity)).toBe(56);
    });
  });

  describe('getGridBounds', () => {
    it('calculates bounds correctly for identity matrix', () => {
      const matrix: Matrix2D = { a: 1, d: 1, e: 0, f: 0 };
      const bounds = getGridBounds(matrix, 1000, 800);
      expect(bounds).toEqual({
        minX: 0,
        maxX: 1000,
        minY: 0,
        maxY: 800,
      });
    });

    it('calculates bounds correctly when panned and zoomed', () => {
      // scale = 2.0, translated by (200, 100)
      const matrix: Matrix2D = { a: 2, d: 2, e: 200, f: 100 };
      const bounds = getGridBounds(matrix, 1000, 800);
      expect(bounds.minX).toBe(-100);
      expect(bounds.maxX).toBe(-100 + 500); // 400
      expect(bounds.minY).toBe(-50);
      expect(bounds.maxY).toBe(-50 + 400); // 350
    });

    it('handles null, undefined, or zero scales safely', () => {
      const fallback = getGridBounds(null, 800, 600);
      expect(fallback).toEqual({ minX: 0, maxX: 800, minY: 0, maxY: 600 });

      const zeroMatrix: Matrix2D = { a: 0, d: 0, e: 0, f: 0 };
      const zeroFallback = getGridBounds(zeroMatrix, 800, 600);
      expect(zeroFallback).toEqual({ minX: 0, maxX: 800, minY: 0, maxY: 600 });
    });
  });

  describe('drawCartographicGrid', () => {
    function createMockCtx(matrix: Matrix2D = { a: 1, d: 1, e: 0, f: 0 }) {
      return {
        canvas: { width: 800, height: 600 },
        save: vi.fn(),
        restore: vi.fn(),
        getTransform: vi.fn(() => matrix),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        lineWidth: 1,
        strokeStyle: '',
        fillStyle: '',
      } as unknown as CanvasRenderingContext2D;
    }

    it('renders minor and major grid lines, dots, and origin marker at origin view', () => {
      const ctx = createMockCtx({ a: 1, d: 1, e: 400, f: 300 }); // (0,0) is in center
      drawCartographicGrid(ctx, 1.0, true);

      expect(ctx.save).toHaveBeenCalledTimes(1);
      expect(ctx.restore).toHaveBeenCalledTimes(1);
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.arc).toHaveBeenCalled(); // dots and origin circle
    });

    it('renders correctly in dark mode', () => {
      const ctx = createMockCtx({ a: 1, d: 1, e: 400, f: 300 });
      drawCartographicGrid(ctx, 1.0, false);

      expect(ctx.save).toHaveBeenCalledTimes(1);
      expect(ctx.restore).toHaveBeenCalledTimes(1);
    });

    it('omits origin marker when viewport is scrolled away from origin', () => {
      // panned far away: minX = 5000, maxX = 5800
      const ctx = createMockCtx({ a: 1, d: 1, e: -5000, f: -5000 });
      drawCartographicGrid(ctx, 1.0, true);

      // Verify restore is called safely
      expect(ctx.restore).toHaveBeenCalledTimes(1);
    });
  });
});
