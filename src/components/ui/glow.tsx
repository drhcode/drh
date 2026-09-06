'use client';

import * as React from 'react';

/**
 * Pointer-following glow for card grids.
 *
 * The glow is drawn on the card's *border*, not across its face, so it never
 * sits between the reader and the text. A soft interior wash would tint body
 * copy and cost contrast; a lit edge reads as premium and costs nothing.
 *
 * One listener per grid rather than one per card: the card under the pointer is
 * found with `closest()`, so cost is constant no matter how many cards there
 * are, and no layout is read for cards the pointer is not over.
 */
export function GlowGrid({
  children,
  className,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'ul' | 'ol';
}) {
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const container = ref.current;
    if (!container) return;

    // Purely decorative, so it is skipped entirely rather than reduced.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let active: HTMLElement | null = null;
    /* Cached bounds of the active card. Measuring on every pointermove would
       force layout dozens of times a second for a purely decorative effect. */
    let bounds: DOMRect | null = null;
    let frame = 0;
    let pending: { card: HTMLElement; x: number; y: number } | null = null;

    function apply() {
      frame = 0;
      if (!pending) return;
      const { card, x, y } = pending;
      card.style.setProperty('--glow-x', `${x}px`);
      card.style.setProperty('--glow-y', `${y}px`);
    }

    function clear(card: HTMLElement | null) {
      if (!card) return;
      card.style.setProperty('--glow-opacity', '0');
    }

    function onMove(event: PointerEvent) {
      const card = (event.target as HTMLElement | null)?.closest?.<HTMLElement>('[data-glow]');

      if (card !== active) {
        clear(active);
        active = card ?? null;
        bounds = active ? active.getBoundingClientRect() : null;
        if (active) active.style.setProperty('--glow-opacity', '1');
      }
      if (!card || !bounds) return;

      pending = { card, x: event.clientX - bounds.left, y: event.clientY - bounds.top };
      // Coalesce to one write per frame — pointermove can outpace paint.
      if (!frame) frame = requestAnimationFrame(apply);
    }

    function onLeave() {
      clear(active);
      active = null;
      bounds = null;
    }

    // Scrolling or resizing moves the card out from under the cached rect.
    function remeasure() {
      if (active) bounds = active.getBoundingClientRect();
    }

    container.addEventListener('pointermove', onMove, { passive: true });
    container.addEventListener('pointerleave', onLeave, { passive: true });
    window.addEventListener('scroll', remeasure, { passive: true });
    window.addEventListener('resize', remeasure, { passive: true });

    return () => {
      container.removeEventListener('pointermove', onMove);
      container.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', remeasure);
      window.removeEventListener('resize', remeasure);
      if (frame) cancelAnimationFrame(frame);
      clear(active);
    };
  }, []);

  return (
    <Tag ref={ref as React.Ref<HTMLDivElement & HTMLUListElement & HTMLOListElement>} className={className}>
      {children}
    </Tag>
  );
}
