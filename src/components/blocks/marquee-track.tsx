'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * A marquee needs its items twice for a seamless loop. Rendering the second
 * copy on the server doubled the page's HTML and hydration payload, so the
 * server sends the list once and the browser clones it after hydration. The
 * clone is hidden from assistive technology and removed from the tab order.
 */
export function MarqueeTrack({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const track = ref.current;
    const original = track?.firstElementChild;
    if (!track || !original || track.children.length > 1) return;
    const clone = original.cloneNode(true) as HTMLElement;
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('a, button').forEach((node) => node.setAttribute('tabindex', '-1'));
    track.appendChild(clone);
    return () => clone.remove();
  }, []);

  return (
    <div ref={ref} className={cn('marquee', className)}>
      {children}
    </div>
  );
}
