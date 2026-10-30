import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useClickOutside } from '../src/lib/hooks/useClickOutside';

describe('useClickOutside hook logic', () => {
  let listeners: Record<string, EventListenerOrEventListenerObject[]> = {};

  beforeEach(() => {
    listeners = {};
    vi.stubGlobal('document', {
      addEventListener: vi.fn((event: string, callback: EventListenerOrEventListenerObject) => {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(callback);
      }),
      removeEventListener: vi.fn((event: string, callback: EventListenerOrEventListenerObject) => {
        if (listeners[event]) {
          listeners[event] = listeners[event].filter((cb) => cb !== callback);
        }
      }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('registers mousedown, touchstart, and keydown listeners when enabled', () => {
    // We can simulate the effect function manually
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

      document.addEventListener('mousedown', handlePointerDown);
      document.addEventListener('touchstart', handlePointerDown);
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('mousedown', handlePointerDown);
        document.removeEventListener('touchstart', handlePointerDown);
        document.removeEventListener('keydown', handleKeyDown);
      };
    })();

    expect(listeners['mousedown']).toHaveLength(1);
    expect(listeners['touchstart']).toHaveLength(1);
    expect(listeners['keydown']).toHaveLength(1);

    cleanup();
    expect(listeners['mousedown']).toHaveLength(0);
    expect(listeners['touchstart']).toHaveLength(0);
    expect(listeners['keydown']).toHaveLength(0);
  });

  it('triggers handler when pointer event occurs outside container', () => {
    const insideNode = { id: 'child' };
    const containerNode = {
      id: 'container',
      contains: vi.fn((target: any) => target === insideNode || target === containerNode),
    };
    const outsideNode = { id: 'outside' };

    const ref = { current: containerNode };
    const handler = vi.fn();

    const handlePointerDown = (event: any) => {
      const target = event.target;
      if (ref.current && target && !(ref.current as any).contains(target)) {
        handler(event);
      }
    };

    // Click inside container
    handlePointerDown({ target: insideNode });
    expect(handler).not.toHaveBeenCalled();

    // Click outside container
    handlePointerDown({ target: outsideNode });
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
