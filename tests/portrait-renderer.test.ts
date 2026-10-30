import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getPortraitCoverCrop,
  getNodeMonogram,
  getNodeRadius,
  drawPortraitMedallion,
  portraitCache,
  clearPortraitCache,
  preloadPortrait,
  getPortraitFromCache,
  isImageReady,
} from '../src/lib/graph/portrait-renderer';

describe('portrait-renderer', () => {
  beforeEach(() => {
    clearPortraitCache();
  });

  describe('getPortraitCoverCrop', () => {
    it('handles square images', () => {
      const crop = getPortraitCoverCrop(400, 400);
      expect(crop).toEqual({
        sx: 0,
        sy: 0,
        sWidth: 400,
        sHeight: 400,
      });
    });

    it('centers wide landscape images horizontally', () => {
      const crop = getPortraitCoverCrop(600, 400);
      expect(crop.sx).toBe(100);
      expect(crop.sy).toBe(0);
      expect(crop.sWidth).toBe(400);
      expect(crop.sHeight).toBe(400);
    });

    it('crops tall portrait images with slight upward bias for face framing', () => {
      const crop = getPortraitCoverCrop(300, 500);
      expect(crop.sx).toBe(0);
      expect(crop.sWidth).toBe(300);
      expect(crop.sHeight).toBe(300);
      // Headroom = 200 * 0.22 = 44
      expect(crop.sy).toBeCloseTo(44, 1);
    });

    it('handles zero or negative dimensions safely', () => {
      const crop = getPortraitCoverCrop(0, 0);
      expect(crop).toEqual({
        sx: 0,
        sy: 0,
        sWidth: 1,
        sHeight: 1,
      });
    });
  });

  describe('getNodeMonogram', () => {
    it('returns ✦ for concepts', () => {
      expect(getNodeMonogram('Categorical Imperative', 'concept')).toBe('✦');
    });

    it('generates two-letter monograms from multi-word philosopher names', () => {
      expect(getNodeMonogram('Friedrich Nietzsche')).toBe('FN');
      expect(getNodeMonogram('Baruch Spinoza')).toBe('BS');
      expect(getNodeMonogram('Thomas Aquinas')).toBe('TA');
    });

    it('strips common aristocratic/regional prefixes', () => {
      expect(getNodeMonogram('von Leibniz')).toBe('LE');
      expect(getNodeMonogram('de Spinoza')).toBe('SP');
      expect(getNodeMonogram('of Canterbury')).toBe('CA');
    });

    it('handles single-name philosophers', () => {
      expect(getNodeMonogram('Plato')).toBe('PL');
      expect(getNodeMonogram('Aristotle')).toBe('AR');
      expect(getNodeMonogram('Socrates')).toBe('SO');
    });
  });

  describe('getNodeRadius', () => {
    it('computes standard node radius from val', () => {
      expect(getNodeRadius(8)).toBe(13);
      expect(getNodeRadius(10)).toBe(13.5);
      expect(getNodeRadius(12)).toBeCloseTo(16.2, 1);
    });

    it('applies minimum radius when val is small or undefined', () => {
      expect(getNodeRadius(undefined)).toBe(13);
      expect(getNodeRadius(4)).toBe(13);
    });

    it('enlarges anchor foundational thinkers with importanceScore >= 95', () => {
      expect(getNodeRadius(8, 98)).toBe(18);
      expect(getNodeRadius(14, 98)).toBeCloseTo(18.9, 1);
    });
  });

  describe('isImageReady', () => {
    it('returns true for completed images with positive dimensions', () => {
      expect(isImageReady({ complete: true, naturalWidth: 100 })).toBe(true);
    });

    it('returns false for incomplete or zero-dimension images', () => {
      expect(isImageReady(null)).toBe(false);
      expect(isImageReady(undefined)).toBe(false);
      expect(isImageReady({ complete: false, naturalWidth: 100 })).toBe(false);
      expect(isImageReady({ complete: true, naturalWidth: 0 })).toBe(false);
      expect(isImageReady('loading')).toBe(false);
      expect(isImageReady('failed')).toBe(false);
    });
  });

  describe('portraitCache and preloadPortrait', () => {
    it('loads and caches images via Image mock', () => {
      class MockImage {
        crossOrigin = '';
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        naturalWidth = 300;
        naturalHeight = 400;
        complete = false;
        private _src = '';

        get src() {
          return this._src;
        }
        set src(v: string) {
          this._src = v;
          setTimeout(() => {
            this.complete = true;
            this.onload?.();
          }, 0);
        }
      }

      vi.stubGlobal('Image', MockImage);
      vi.stubGlobal('window', {});

      const onLoaded = vi.fn();
      preloadPortrait('/portraits/kant.jpg', onLoaded);

      expect(getPortraitFromCache('/portraits/kant.jpg')).toBe('loading');

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(onLoaded).toHaveBeenCalled();
          const cached = getPortraitFromCache('/portraits/kant.jpg');
          expect(isImageReady(cached)).toBe(true);
          resolve();
        }, 10);
      });
    });

    it('handles immediately completed / memory-cached images', () => {
      class SynchronousCachedImage {
        naturalWidth = 300;
        naturalHeight = 400;
        complete = true;
        private _src = '';

        get src() {
          return this._src;
        }
        set src(v: string) {
          this._src = v;
        }
      }

      vi.stubGlobal('Image', SynchronousCachedImage);
      vi.stubGlobal('window', {});

      const onLoaded = vi.fn();
      preloadPortrait('/portraits/plato.jpg', onLoaded);

      expect(onLoaded).toHaveBeenCalled();
      const cached = getPortraitFromCache('/portraits/plato.jpg');
      expect(isImageReady(cached)).toBe(true);
    });

    it('handles image loading failure', () => {
      class FailingImage {
        crossOrigin = '';
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        naturalWidth = 0;
        naturalHeight = 0;
        complete = false;
        private _src = '';

        set src(v: string) {
          this._src = v;
          setTimeout(() => {
            this.onerror?.();
          }, 0);
        }
      }

      vi.stubGlobal('Image', FailingImage);
      vi.stubGlobal('window', {});

      const onError = vi.fn();
      preloadPortrait('/portraits/missing.jpg', undefined, onError);

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(onError).toHaveBeenCalled();
          expect(getPortraitFromCache('/portraits/missing.jpg')).toBe('failed');
          resolve();
        }, 10);
      });
    });
  });

  describe('drawPortraitMedallion', () => {
    function createMockCtx() {
      return {
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
        font: '',
        textAlign: '',
        textBaseline: '',
      } as unknown as CanvasRenderingContext2D;
    }

    it('draws circular clipped image and rim when image is complete', () => {
      const ctx = createMockCtx();
      const mockImg = {
        complete: true,
        naturalWidth: 300,
        naturalHeight: 400,
      };

      const node = { x: 100, y: 150, name: 'Immanuel Kant', importanceScore: 96 };
      const drawn = drawPortraitMedallion(ctx, node, mockImg, {
        size: 18,
        isSelected: true,
        isPrimaryThinker: true,
        isLight: false,
      });

      expect(drawn).toBe(true);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.clip).toHaveBeenCalled();
      expect(ctx.drawImage).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
      expect(ctx.fillText).not.toHaveBeenCalled();
    });

    it('draws fallback monogram when image is not loaded or null', () => {
      const ctx = createMockCtx();
      const node = { x: 100, y: 150, name: 'Immanuel Kant', importanceScore: 90 };
      const drawn = drawPortraitMedallion(ctx, node, null, {
        size: 16,
        isSelected: false,
        isPrimaryThinker: false,
        isLight: true,
      });

      expect(drawn).toBe(false);
      expect(ctx.drawImage).not.toHaveBeenCalled();
      expect(ctx.fillText).toHaveBeenCalledWith('IK', 100, 150);
      expect(ctx.stroke).toHaveBeenCalled();
    });
  });
});
