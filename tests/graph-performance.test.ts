import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  isSimpleLod,
  isNodeVisibleInViewport,
  measureLabelWidthCached,
  clearLabelWidthCache,
  getLabelWidthCacheSize,
  SIMPLE_LOD_SCALE_THRESHOLD,
} from '../src/lib/graph/canvas-perf';
import {
  createCircularPortraitSprite,
  getPortraitSprite,
  drawPortraitMedallion,
  clearPortraitCache,
  portraitSpriteCache,
  PORTRAIT_SPRITE_SIZE,
} from '../src/lib/graph/portrait-renderer';
import { drawCartographicGrid, GridBounds } from '../src/lib/graph/grid-renderer';
import {
  drawExplorationAtmosphere,
  drawAmbientParchmentMist,
  getRadialGradientSprite,
  clearFogSpriteCache,
  FOG_RESOLUTION_SCALE,
} from '../src/lib/graph/fog-renderer';
import { VisualNode } from '../src/lib/types';

function makeMockNode(overrides: Partial<VisualNode> = {}): VisualNode {
  return {
    id: 'plato',
    name: 'Plato',
    type: 'philosopher',
    eraId: 'classical-greek',
    importanceScore: 99,
    color: '#d4af37',
    summary: '',
    data: {} as any,
    x: 100,
    y: 100,
    val: 12,
    exploration: { state: 'citadel', score: 99, label: 'Citadel', badgeIcon: '🏛️', tagline: '' },
    ...overrides,
  };
}

describe('Graph Rendering Performance Optimizations', () => {
  beforeEach(() => {
    clearLabelWidthCache();
    clearPortraitCache();
    clearFogSpriteCache();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('canvas-perf utilities', () => {
    it('detects simple LOD threshold accurately', () => {
      expect(isSimpleLod(SIMPLE_LOD_SCALE_THRESHOLD - 0.01)).toBe(true);
      expect(isSimpleLod(0.2)).toBe(true);
      expect(isSimpleLod(SIMPLE_LOD_SCALE_THRESHOLD)).toBe(false);
      expect(isSimpleLod(1.5)).toBe(false);
      expect(isSimpleLod(NaN)).toBe(false);
      expect(isSimpleLod(Infinity)).toBe(false);
    });

    it('performs viewport culling with margin and fails open when bounds are null', () => {
      const bounds: GridBounds = { minX: 0, maxX: 500, minY: 0, maxY: 400 };

      expect(isNodeVisibleInViewport(100, 100, 20, bounds)).toBe(true);
      expect(isNodeVisibleInViewport(-15, 200, 20, bounds)).toBe(true); // within margin
      expect(isNodeVisibleInViewport(-25, 200, 20, bounds)).toBe(false); // outside margin
      expect(isNodeVisibleInViewport(530, 200, 20, bounds)).toBe(false);
      expect(isNodeVisibleInViewport(undefined, 100, 20, bounds)).toBe(false);
      expect(isNodeVisibleInViewport(NaN, 100, 20, bounds)).toBe(false);
      expect(isNodeVisibleInViewport(9999, 9999, 20, null)).toBe(true);
      expect(isNodeVisibleInViewport(9999, 9999, 20, undefined)).toBe(true);
    });

    it('caches label width measurements at reference font size and scales linearly', () => {
      const measureText = vi.fn((text: string) => ({ width: text.length * 8 }));
      const ctx = {
        font: 'normal 10px serif',
        measureText,
      } as unknown as CanvasRenderingContext2D;

      const w1 = measureLabelWidthCached(ctx, 'Aristotle', 'bold', 8, '"EB Garamond", Georgia, serif');
      const w2 = measureLabelWidthCached(ctx, 'Aristotle', 'bold', 16, '"EB Garamond", Georgia, serif');
      const w3 = measureLabelWidthCached(ctx, 'Aristotle', 'bold', 32, '"EB Garamond", Georgia, serif');

      // measureText should only be called once for the same label + weight + family
      expect(measureText).toHaveBeenCalledTimes(1);
      expect(w2).toBe(72); // 9 chars * 8 at 16px reference
      expect(w1).toBe(36); // half size
      expect(w3).toBe(144); // double size
      expect(ctx.font).toBe('normal 10px serif'); // restores font
      expect(getLabelWidthCacheSize()).toBe(1);

      clearLabelWidthCache();
      expect(getLabelWidthCacheSize()).toBe(0);
    });

    it('bounds label width cache size to prevent unbounded growth', () => {
      const ctx = {
        font: '',
        measureText: vi.fn(() => ({ width: 50 })),
      } as unknown as CanvasRenderingContext2D;

      for (let i = 0; i < 1005; i++) {
        measureLabelWidthCached(ctx, `Thinker ${i}`, 'normal', 12, 'serif');
      }
      expect(getLabelWidthCacheSize()).toBeLessThanOrEqual(1000);
    });
  });

  describe('portrait-renderer circular sprite baking & LOD', () => {
    it('returns null from createCircularPortraitSprite when document is unavailable', () => {
      const img = { complete: true, naturalWidth: 300, naturalHeight: 400 } as HTMLImageElement;
      expect(createCircularPortraitSprite(img)).toBeNull();
      expect(getPortraitSprite('/portraits/plato.jpg', img)).toBeNull();
    });

    it('bakes and caches circular portrait sprites when offscreen canvas is available', () => {
      const spriteCtx = {
        beginPath: vi.fn(),
        arc: vi.fn(),
        clip: vi.fn(),
        drawImage: vi.fn(),
      };
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => spriteCtx),
      };
      vi.stubGlobal('document', {
        createElement: vi.fn(() => mockCanvas),
      });

      const img = { complete: true, naturalWidth: 300, naturalHeight: 400 } as HTMLImageElement;
      const sprite1 = getPortraitSprite('/portraits/plato.jpg', img);
      const sprite2 = getPortraitSprite('/portraits/plato.jpg', img);

      expect(sprite1).toBe(mockCanvas);
      expect(sprite2).toBe(sprite1);
      expect(mockCanvas.width).toBe(PORTRAIT_SPRITE_SIZE);
      expect(mockCanvas.height).toBe(PORTRAIT_SPRITE_SIZE);
      expect(spriteCtx.clip).toHaveBeenCalledTimes(1);
      expect(spriteCtx.drawImage).toHaveBeenCalledTimes(1);
      expect(portraitSpriteCache.size).toBe(1);

      clearPortraitCache();
      expect(portraitSpriteCache.size).toBe(0);
    });

    it('draws pre-baked sprite without per-frame ctx.save/clip/restore calls', () => {
      const ctx = {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        clip: vi.fn(),
        drawImage: vi.fn(),
        fillText: vi.fn(),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
      } as unknown as CanvasRenderingContext2D;

      const fakeSprite = { width: 128, height: 128 } as HTMLCanvasElement;
      const drawn = drawPortraitMedallion(
        ctx,
        { x: 50, y: 60, name: 'Plato', color: '#d4af37' },
        null,
        { size: 18, isSelected: false, isPrimaryThinker: true, isLight: false, sprite: fakeSprite }
      );

      expect(drawn).toBe(true);
      expect(ctx.drawImage).toHaveBeenCalledTimes(1);
      expect(ctx.save).not.toHaveBeenCalled();
      expect(ctx.clip).not.toHaveBeenCalled();
      expect(ctx.restore).not.toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalledTimes(1);
    });

    it('renders simplified base circle in lodSimple mode', () => {
      const ctx = {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        clip: vi.fn(),
        drawImage: vi.fn(),
        fillText: vi.fn(),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
      } as unknown as CanvasRenderingContext2D;

      const fakeSprite = { width: 128, height: 128 } as HTMLCanvasElement;
      const drawn = drawPortraitMedallion(
        ctx,
        { x: 50, y: 60, name: 'Plato', color: '#d4af37' },
        null,
        { size: 18, sprite: fakeSprite, lodSimple: true }
      );

      expect(drawn).toBe(false);
      expect(ctx.fill).toHaveBeenCalledTimes(1);
      expect(ctx.drawImage).not.toHaveBeenCalled();
      expect(ctx.stroke).not.toHaveBeenCalled();
      expect(ctx.fillText).not.toHaveBeenCalled();
    });
  });

  describe('grid-renderer rect stippling & bounds return', () => {
    it('returns computed GridBounds, uses fast ctx.rect for stippling dots, and skips dots when zoomed far out', () => {
      const ctx = {
        canvas: { width: 800, height: 600 },
        save: vi.fn(),
        restore: vi.fn(),
        getTransform: vi.fn(() => ({ a: 1, d: 1, e: 0, f: 0 })),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        rect: vi.fn(),
        stroke: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        lineWidth: 1,
        strokeStyle: '',
        fillStyle: '',
      } as unknown as CanvasRenderingContext2D;

      const bounds = drawCartographicGrid(ctx, 1.0, false);
      expect(bounds).toEqual({ minX: 0, maxX: 800, minY: 0, maxY: 600 });
      expect(ctx.rect).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalledTimes(1);

      // Zoomed far out (< 0.35): stippling dots should be skipped
      vi.clearAllMocks();
      drawCartographicGrid(ctx, 0.2, false);
      expect(ctx.rect).not.toHaveBeenCalled();
      expect(ctx.fill).not.toHaveBeenCalled();
    });
  });

  describe('fog-renderer viewport culling, sprite caching & half-res offscreen mist', () => {
    it('bakes and caches radial gradient sprites when document is available', () => {
      const addColorStop = vi.fn();
      const sCtx = {
        createRadialGradient: vi.fn(() => ({ addColorStop })),
        fillRect: vi.fn(),
        fillStyle: '',
      };
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => sCtx),
      };
      vi.stubGlobal('document', {
        createElement: vi.fn(() => mockCanvas),
      });

      const sprite1 = getRadialGradientSprite('test:halo', [
        [0, 'rgba(255,255,255,0.5)'],
        [1, 'rgba(0,0,0,0)'],
      ]);
      const sprite2 = getRadialGradientSprite('test:halo', [
        [0, 'rgba(255,255,255,0.5)'],
        [1, 'rgba(0,0,0,0)'],
      ]);

      expect(sprite1).toBe(mockCanvas);
      expect(sprite2).toBe(sprite1);
      expect(sCtx.createRadialGradient).toHaveBeenCalledTimes(1);
    });

    it('viewport-culls off-screen nodes in drawExplorationAtmosphere', () => {
      const ctx = {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
        fillStyle: '',
      } as unknown as CanvasRenderingContext2D;

      const offscreenNode = makeMockNode({ id: 'far', x: 5000, y: 5000 });
      const visibleNode = makeMockNode({ id: 'near', x: 100, y: 100 });

      drawExplorationAtmosphere(ctx, {
        nodes: [offscreenNode, visibleNode],
        globalScale: 1.0,
        isLight: false,
        viewportBounds: { minX: 0, maxX: 500, minY: 0, maxY: 400 },
      });

      // Only the visible node should produce a radial gradient draw
      expect(ctx.createRadialGradient).toHaveBeenCalledTimes(1);
    });

    it('renders default offscreen fog at half resolution and scales onto main canvas', () => {
      const offscreenCtx = {
        setTransform: vi.fn(),
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        drawImage: vi.fn(),
        createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
        globalCompositeOperation: 'source-over',
        fillStyle: '',
      };
      const offscreenCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => offscreenCtx),
      };
      vi.stubGlobal('document', {
        createElement: vi.fn(() => offscreenCanvas),
      });

      const mainCtx = {
        save: vi.fn(),
        restore: vi.fn(),
        setTransform: vi.fn(),
        drawImage: vi.fn(),
        getTransform: vi.fn(() => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })),
        canvas: { width: 1200, height: 800 },
      } as unknown as CanvasRenderingContext2D;

      drawAmbientParchmentMist(mainCtx, {
        nodes: [makeMockNode({ x: 100, y: 100 })],
        globalScale: 1.0,
        isLight: false,
        viewportBounds: { minX: 0, maxX: 1200, minY: 0, maxY: 800 },
      });

      const expectedW = Math.round(1200 * FOG_RESOLUTION_SCALE);
      const expectedH = Math.round(800 * FOG_RESOLUTION_SCALE);
      expect(offscreenCtx.fillRect).toHaveBeenCalledWith(0, 0, expectedW, expectedH);
      expect(mainCtx.drawImage).toHaveBeenCalledWith(offscreenCanvas, 0, 0, 1200, 800);
    });
  });

  describe('ForceGraphView performance invariants', () => {
    const forceGraphCode = fs.readFileSync(
      path.resolve(__dirname, '../src/components/graph/ForceGraphView.tsx'),
      'utf-8'
    );

    it('pauses idle canvas redraws when Exploration Mode is inactive', () => {
      expect(forceGraphCode).toContain('autoPauseRedraw={!isExplorationActive}');
      expect(forceGraphCode).not.toContain('autoPauseRedraw={false}');
    });

    it('tracks mouseWorldPos via ref rather than React state', () => {
      expect(forceGraphCode).toContain('const mouseWorldPosRef = useRef');
      expect(forceGraphCode).not.toContain('setMouseWorldPos(');
    });

    it('wires viewport culling, LOD, sprite lookup, cached label width, and conditional link overlay', () => {
      expect(forceGraphCode).toContain('isNodeVisibleInViewport(');
      expect(forceGraphCode).toContain('isSimpleLod(globalScale)');
      expect(forceGraphCode).toContain('getPortraitSprite(portraitUrl, cached)');
      expect(forceGraphCode).toContain('measureLabelWidthCached(');
      expect(forceGraphCode).toContain('linkCanvasObjectMode={hasLinkOverlay ? linkCanvasObjectModeAfter : undefined}');
    });
  });
});
