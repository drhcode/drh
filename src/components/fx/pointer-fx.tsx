'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Pointer effects from the design, as small progressive enhancements:
 *
 * - `HeroFx`   spotlight that follows the cursor or finger, a ripple on tap,
 *              and `--px` / `--py` for parallax children (`.par`).
 * - `Magnetic` pulls a button towards the pointer (mouse and pen only).
 * - `Tilt`     3D tilt towards the pointer (mouse and pen only).
 *
 * Everything writes CSS custom properties or a transform inside a single
 * requestAnimationFrame, and nothing runs under prefers-reduced-motion. The
 * markup is identical without JavaScript; it simply does not react.
 */

function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(true);
  React.useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

function useFrame() {
  const frame = React.useRef(0);
  React.useEffect(() => () => cancelAnimationFrame(frame.current), []);
  return React.useCallback((fn: () => void) => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(fn);
  }, []);
}

export function HeroFx({
  as: Tag = 'section',
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLElement> & { as?: 'section' | 'div' | 'header' }) {
  const ref = React.useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const schedule = useFrame();

  const setPoint = React.useCallback(
    (event: React.PointerEvent<HTMLElement>, ripple: boolean) => {
      const el = ref.current;
      if (!el || reduced) return;
      const rect = el.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      schedule(() => {
        el.style.setProperty('--mx', `${x}px`);
        el.style.setProperty('--my', `${y}px`);
        el.style.setProperty('--px', (x / rect.width - 0.5).toFixed(3));
        el.style.setProperty('--py', (y / rect.height - 0.5).toFixed(3));
        if (ripple) {
          el.classList.add('touched');
          el.style.setProperty('--rx', `${x}px`);
          el.style.setProperty('--ry', `${y}px`);
          const node = el.querySelector<HTMLElement>(':scope > .ripple');
          if (node) {
            node.classList.remove('go');
            void node.offsetWidth; // restart the animation
            node.classList.add('go');
          }
        }
      });
    },
    [reduced, schedule],
  );

  return (
    <Tag
      ref={ref as React.Ref<HTMLElement & HTMLDivElement>}
      className={cn('fx', className)}
      onPointerMove={(event: React.PointerEvent<HTMLElement>) => setPoint(event, false)}
      onPointerDown={(event: React.PointerEvent<HTMLElement>) => setPoint(event, true)}
      {...rest}
    >
      <div className="spot" aria-hidden="true" />
      <div className="ripple" aria-hidden="true" />
      {children}
    </Tag>
  );
}

export function Magnetic({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const schedule = useFrame();

  return (
    <span
      ref={ref}
      className={cn('mag inline-flex', className)}
      onPointerMove={(event) => {
        const el = ref.current;
        if (!el || reduced || event.pointerType === 'touch') return;
        const rect = el.getBoundingClientRect();
        const dx = (event.clientX - rect.left - rect.width / 2) * 0.22;
        const dy = (event.clientY - rect.top - rect.height / 2) * 0.32;
        schedule(() => {
          el.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
        });
      }}
      onPointerLeave={() => {
        schedule(() => {
          if (ref.current) ref.current.style.transform = '';
        });
      }}
    >
      {children}
    </span>
  );
}

export function Tilt({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const schedule = useFrame();

  return (
    <div
      ref={ref}
      className={cn('tilt', className)}
      onPointerMove={(event) => {
        const el = ref.current;
        if (!el || reduced || event.pointerType === 'touch') return;
        const rect = el.getBoundingClientRect();
        const rx = -((event.clientY - rect.top) / rect.height - 0.5) * 16;
        const ry = ((event.clientX - rect.left) / rect.width - 0.5) * 16;
        schedule(() => {
          el.style.transform = `perspective(900px) rotateY(${ry.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg)`;
        });
      }}
      onPointerLeave={() => {
        schedule(() => {
          if (ref.current) ref.current.style.transform = '';
        });
      }}
    >
      {children}
    </div>
  );
}
