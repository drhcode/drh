'use client';

import * as React from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Shared renderer for the site's line-art glyphs.
 *
 * Every path carries `pathLength="1"`, so the draw-on is normalised: a long
 * path takes exactly as long as a short one and the stagger reads as one
 * considered sequence rather than a race. Industries and services both draw
 * from this, so the two sets stay one visual family instead of drifting apart.
 *
 * Motion runs once, and only when seen. Under prefers-reduced-motion the glyph
 * is simply already drawn — there is no reduced variant to get wrong.
 */
export function AnimatedGlyph({
  paths,
  className,
  strokeWidth = 1.75,
  /** Renders drawn immediately instead of waiting to be scrolled into view. */
  eager = false,
  /** Milliseconds between each path starting to draw. */
  stagger = 110,
}: {
  paths: string[];
  className?: string;
  strokeWidth?: number;
  eager?: boolean;
  stagger?: number;
}) {
  const reduced = useReducedMotion();
  const ref = React.useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px -10% 0px' });

  const play = reduced || eager || inView;

  return (
    <svg
      ref={ref}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-10', className)}
      aria-hidden="true"
      role="presentation"
    >
      {paths.map((d, index) => (
        <path
          key={d}
          d={d}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={play ? 0 : 1}
          style={{
            transition: reduced
              ? undefined
              : 'stroke-dashoffset 620ms cubic-bezier(0.16, 1, 0.3, 1)',
            transitionDelay: reduced ? undefined : `${index * stagger}ms`,
          }}
        />
      ))}
    </svg>
  );
}
