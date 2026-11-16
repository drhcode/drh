'use client';

import * as React from 'react';

/**
 * Counts up to `value` the first time it scrolls into view.
 *
 * The server renders the final number, so it is correct without JavaScript,
 * for crawlers and under reduced motion. The count only replays when the
 * number is off-screen at hydration, so the reset to zero is never visible.
 */
export function CountUp({ value, duration = 2200 }: { value: number; duration?: number }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = React.useState(value);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return; // already visible

    let frame = 0;
    setDisplay(0);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))));
          if (p < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
    </span>
  );
}
