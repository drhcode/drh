'use client';

import * as React from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

export interface Metric {
  value: string;
  label: string;
}

/**
 * Trust metrics (spec §12).
 *
 * Values come from the CMS — nothing here is hard-coded, so the team never has
 * to ask a developer to correct a number.
 */
export function MetricsSection({ items }: { items: Metric[] }) {
  if (items.length === 0) return null;

  return (
    <section className="border-y border-border bg-surface-sunken">
      <div className="container-page">
        <dl className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
          {items.map((metric) => (
            <div
              key={metric.label}
              className="flex flex-col gap-1 px-2 py-8 first:border-l-0 sm:px-6 sm:py-10 [&:nth-child(-n+2)]:border-t-0 [&:nth-child(odd)]:border-l-0 sm:[&:nth-child(odd)]:border-l"
            >
              <dt className="sr-only">{metric.label}</dt>
              <dd>
                <AnimatedValue value={metric.value} />
                <span className="mt-1.5 block text-sm leading-snug text-muted-foreground">
                  {metric.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/**
 * Counts up to a numeric value once, when scrolled into view.
 *
 * Non-numeric values and reduced-motion visitors get the final value straight
 * away — the count is decoration, never the only way to read the number.
 */
function AnimatedValue({ value }: { value: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduced = useReducedMotion();

  // "8+" → prefix "", number 8, suffix "+"
  const match = value.match(/^(\D*)(\d+)(.*)$/);
  const target = match ? Number(match[2]) : null;
  const animate = target !== null && !reduced;

  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!animate || !inView || target === null) return;

    const duration = 900;
    const start = performance.now();
    let frame = 0;

    // setState here runs from requestAnimationFrame — an external scheduler,
    // not synchronously during the effect.
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutExpo — fast start, gentle settle
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, animate, target]);

  const display = animate ? `${match![1]}${count}${match![3]}` : value;

  return (
    <span
      ref={ref}
      className="block text-3xl font-semibold tabular-nums tracking-tight text-foreground md:text-4xl"
    >
      {display}
    </span>
  );
}
