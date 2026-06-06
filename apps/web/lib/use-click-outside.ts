'use client';

import { useEffect, useRef } from 'react';

/**
 * Closes a popover/menu when the user clicks outside it or presses Escape.
 *
 * Attach the returned ref to the popover's outermost element (the one that
 * wraps BOTH the trigger and the panel). We listen on `document` with a
 * `mousedown` + `pointerdown` listener so it works regardless of z-index /
 * stacking context — the old `fixed inset-0` overlay trick broke inside the
 * sticky header's stacking context.
 */
export function useClickOutside<T extends HTMLElement = HTMLDivElement>(
  active: boolean,
  onClose: () => void,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active) return;

    const handlePointer = (e: PointerEvent | MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('pointerdown', handlePointer, true);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handlePointer, true);
      document.removeEventListener('keydown', handleKey);
    };
  }, [active, onClose]);

  return ref;
}
