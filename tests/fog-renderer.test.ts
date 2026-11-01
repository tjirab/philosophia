import { describe, it, expect, vi } from 'vitest';
import {
  drawExplorationAtmosphere,
  drawCartographicBeacon,
  drawAmbientParchmentMist,
  getOffscreenFogCanvas,
} from '../src/lib/graph/fog-renderer';
import { VisualNode } from '../src/lib/types';

function createMockCanvasContext(): CanvasRenderingContext2D {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    setLineDash: vi.fn(),
    fillText: vi.fn(),
    font: '',
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    textAlign: 'center',
    textBaseline: 'middle',
  } as unknown as CanvasRenderingContext2D;
}

describe('Fog Renderer & Atmospheric Canvas Drawing', () => {
  it('safely handles empty node array without error', () => {
    const ctx = createMockCanvasContext();
    expect(() => {
      drawExplorationAtmosphere(ctx, {
        nodes: [],
        globalScale: 1.0,
        isLight: false,
      });
    }).not.toThrow();
  });

  it('draws atmospheric halos for citadels, frontiers, and uncharted beacons', () => {
    const ctx = createMockCanvasContext();
    const mockNodes: VisualNode[] = [
      {
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
      },
      {
        id: 'chalmers',
        name: 'Chalmers',
        type: 'philosopher',
        eraId: 'contemporary',
        importanceScore: 75,
        color: '#f43f5e',
        summary: '',
        data: {} as any,
        x: 200,
        y: 200,
        val: 10,
        exploration: { state: 'frontier', score: 75, label: 'Frontier', badgeIcon: '⚔️', tagline: '' },
      },
      {
        id: 'nagarjuna',
        name: 'Nagarjuna',
        type: 'philosopher',
        eraId: 'classical-greek',
        importanceScore: 80,
        color: '#6366f1',
        summary: '',
        data: {} as any,
        x: 300,
        y: 300,
        val: 10,
        exploration: { state: 'uncharted', score: 35, label: 'Terra Incognita', badgeIcon: '🌫️', tagline: '' },
      },
    ];

    expect(() => {
      drawExplorationAtmosphere(ctx, {
        nodes: mockNodes,
        globalScale: 1.2,
        isLight: false,
        mouseWorldPos: { x: 150, y: 150 },
        hoveredNodeId: 'plato',
        fogIntensity: 0.8,
      });
    }).not.toThrow();

    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
    expect(ctx.createRadialGradient).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
  });

  it('draws cartographic beacon flourishes for different node exploration states', () => {
    const ctx = createMockCanvasContext();
    const nodeCitadel: VisualNode = {
      id: 'plato',
      name: 'Plato',
      type: 'philosopher',
      eraId: 'classical-greek',
      importanceScore: 99,
      color: '#d4af37',
      summary: '',
      data: {} as any,
      x: 0,
      y: 0,
      exploration: { state: 'citadel', score: 99, label: 'Citadel', badgeIcon: '🏛️', tagline: '' },
    };

    const nodeUncharted: VisualNode = {
      id: 'nagarjuna',
      name: 'Nagarjuna',
      type: 'philosopher',
      eraId: 'classical-greek',
      importanceScore: 80,
      color: '#6366f1',
      summary: '',
      data: {} as any,
      x: 50,
      y: 50,
      exploration: { state: 'uncharted', score: 35, label: 'Terra Incognita', badgeIcon: '🌫️', tagline: '' },
    };

    expect(() => {
      drawCartographicBeacon(ctx, nodeCitadel, 14, false, 1.0);
      drawCartographicBeacon(ctx, nodeUncharted, 12, true, 1.0);
    }).not.toThrow();

    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.setLineDash).toHaveBeenCalled();
  });

  it('drawAmbientParchmentMist safely handles empty nodes or missing offscreen canvas', () => {
    const ctx = createMockCanvasContext();
    expect(() => {
      drawAmbientParchmentMist(ctx, {
        nodes: [],
        globalScale: 1.0,
        isLight: false,
      });
    }).not.toThrow();

    // With nodes but SSR (no document)
    const mockNodes: VisualNode[] = [
      {
        id: 'plato',
        name: 'Plato',
        type: 'philosopher',
        eraId: 'classical-greek',
        importanceScore: 99,
        color: '#d4af37',
        summary: '',
        data: {} as any,
        x: 0,
        y: 0,
        val: 10,
        exploration: { state: 'citadel', score: 99, label: 'Citadel', badgeIcon: '🏛️', tagline: '' },
      },
    ];

    expect(() => {
      drawAmbientParchmentMist(ctx, {
        nodes: mockNodes,
        globalScale: 1.0,
        isLight: true,
        mouseWorldPos: { x: 50, y: 50 },
      });
    }).not.toThrow();
  });

  it('drawAmbientParchmentMist carves clearings with destination-out on offscreen context', () => {
    const mainCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      getTransform: vi.fn(() => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })),
      canvas: { width: 1200, height: 800 },
    } as unknown as CanvasRenderingContext2D;

    const offscreenCtx = {
      setTransform: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      globalCompositeOperation: 'source-over',
      fillStyle: '',
    };

    const offscreenCanvas = {
      width: 1200,
      height: 800,
    };

    const mockNodes: VisualNode[] = [
      {
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
      },
      {
        id: 'chalmers',
        name: 'Chalmers',
        type: 'philosopher',
        eraId: 'contemporary',
        importanceScore: 75,
        color: '#f43f5e',
        summary: '',
        data: {} as any,
        x: 200,
        y: 200,
        val: 10,
        exploration: { state: 'frontier', score: 75, label: 'Frontier', badgeIcon: '⚔️', tagline: '' },
      },
      {
        id: 'nagarjuna',
        name: 'Nagarjuna',
        type: 'philosopher',
        eraId: 'classical-greek',
        importanceScore: 80,
        color: '#6366f1',
        summary: '',
        data: {} as any,
        x: 300,
        y: 300,
        val: 10,
        exploration: { state: 'uncharted', score: 35, label: 'Terra Incognita', badgeIcon: '🌫️', tagline: '' },
      },
    ];

    drawAmbientParchmentMist(mainCtx, {
      nodes: mockNodes,
      globalScale: 1.1,
      isLight: true,
      mouseWorldPos: { x: 150, y: 150 },
      hoveredNodeId: 'nagarjuna',
      selectedNodeId: 'plato',
      highlightedNodeIds: new Set(['chalmers']),
      customOffscreen: {
        canvas: offscreenCanvas as any,
        ctx: offscreenCtx as any,
      },
    });

    expect(offscreenCtx.fillRect).toHaveBeenCalledWith(0, 0, 1200, 800);
    expect(offscreenCtx.globalCompositeOperation).toBe('destination-out');
    expect(offscreenCtx.arc).toHaveBeenCalled();
    expect(offscreenCtx.fill).toHaveBeenCalled();
    expect(mainCtx.drawImage).toHaveBeenCalledWith(offscreenCanvas, 0, 0);
  });
});
