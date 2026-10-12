'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

/**
 * Whether the visitor asked the OS for reduced motion.
 *
 * Use this instead of framer-motion's `useReducedMotion` in anything that
 * renders on the server. Framer's hook already knows the answer on the
 * client's first render, so a component that branches its markup on it
 * renders differently on the server and the client — a hydration mismatch,
 * which makes React throw away and rebuild the whole tree (including the
 * theme class on <html>). Here the server snapshot, which hydration also
 * uses, is always `false`; the real value arrives on the very next render.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
