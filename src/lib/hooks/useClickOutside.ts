import { useEffect, useRef, RefObject } from 'react';

/**
 * Custom hook that detects clicks and touches outside of a referenced DOM element,
 * as well as Escape key presses, to automatically dismiss open dropdown menus or popovers.
 * Uses event capture phase so canvas or third-party stopPropagation calls don't swallow outside clicks.
 *
 * @param ref - Ref object pointing to the container element
 * @param handler - Callback function invoked when an outside click or Escape key is detected
 * @param enabled - Whether the listener should be active (defaults to true)
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent | KeyboardEvent) => void,
  enabled: boolean = true
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (ref.current && target && !ref.current.contains(target)) {
        handlerRef.current(event);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handlerRef.current(event);
      }
    };

    document.addEventListener('mousedown', handlePointerDown, true);
    document.addEventListener('touchstart', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown, true);
      document.removeEventListener('touchstart', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref, enabled]);
}
