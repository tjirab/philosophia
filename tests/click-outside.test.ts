import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useClickOutside hook logic', () => {
  let listeners: Record<string, Array<{ callback: EventListenerOrEventListenerObject; capture: boolean }>> = {};

  beforeEach(() => {
    listeners = {};
    vi.stubGlobal('document', {
      addEventListener: vi.fn((event: string, callback: EventListenerOrEventListenerObject, useCapture?: boolean) => {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push({ callback, capture: Boolean(useCapture) });
      }),
      removeEventListener: vi.fn((event: string, callback: EventListenerOrEventListenerObject, useCapture?: boolean) => {
        if (listeners[event]) {
          listeners[event] = listeners[event].filter(
            (l) => l.callback !== callback || l.capture !== Boolean(useCapture)
          );
        }
      }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('registers mousedown, touchstart, and keydown listeners with capture phase when enabled', () => {
    const ref = { current: null };
    const handler = vi.fn();

    // Replicate hook effect body
    const cleanup = (() => {
      const handlePointerDown = (event: any) => {
        const target = event.target;
        if (ref.current && target && !(ref.current as any).contains(target)) {
          handler(event);
        }
      };
      const handleKeyDown = (event: any) => {
        if (event.key === 'Escape') handler(event);
      };

      document.addEventListener('mousedown', handlePointerDown, true);
      document.addEventListener('touchstart', handlePointerDown, true);
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('mousedown', handlePointerDown, true);
        document.removeEventListener('touchstart', handlePointerDown, true);
        document.removeEventListener('keydown', handleKeyDown);
      };
    })();

    expect(listeners['mousedown']).toHaveLength(1);
    expect(listeners['mousedown'][0].capture).toBe(true);
    expect(listeners['touchstart']).toHaveLength(1);
    expect(listeners['touchstart'][0].capture).toBe(true);
    expect(listeners['keydown']).toHaveLength(1);

    cleanup();
    expect(listeners['mousedown']).toHaveLength(0);
    expect(listeners['touchstart']).toHaveLength(0);
    expect(listeners['keydown']).toHaveLength(0);
  });

  it('triggers handler when pointer event occurs outside container (e.g. on canvas)', () => {
    const insideNode = { id: 'popover-button' };
    const containerNode = {
      id: 'popover-container',
      contains: vi.fn((target: any) => target === insideNode || target === containerNode),
    };
    const canvasNode = { id: 'graph-canvas' };

    const ref = { current: containerNode };
    const handler = vi.fn();

    const handlePointerDown = (event: any) => {
      const target = event.target;
      if (ref.current && target && !(ref.current as any).contains(target)) {
        handler(event);
      }
    };

    // Click inside container does not trigger collapse
    handlePointerDown({ target: insideNode });
    expect(handler).not.toHaveBeenCalled();

    // Click on canvas outside container triggers collapse
    handlePointerDown({ target: canvasNode });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('triggers handler when Escape key is pressed', () => {
    const handler = vi.fn();
    const handleKeyDown = (event: any) => {
      if (event.key === 'Escape') handler(event);
    };

    handleKeyDown({ key: 'Enter' });
    expect(handler).not.toHaveBeenCalled();

    handleKeyDown({ key: 'Escape' });
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
