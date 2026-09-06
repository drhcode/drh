'use client';

import * as React from 'react';

/**
 * Route change progress bar.
 *
 * A 2px accent bar at the top of the viewport, not a blocking overlay: most of
 * this site is statically generated and prefetched, so a full-screen loader
 * would hide content that is already there and make the site feel slower than
 * it is. It earns its place in /admin, where every navigation is a server round
 * trip through Supabase.
 *
 * Three details do most of the work:
 *   • Nothing appears for navigations under ~140ms. Without that, instant
 *     static navigations produce a flash that reads as a glitch.
 *   • The bar eases toward 90% and only completes on arrival, so it never
 *     implies progress it cannot know about.
 *   • Arrival is detected by watching `location.href` inside the animation loop
 *     rather than through `useSearchParams()`. That avoids both the Suspense
 *     boundary that hook would require in a layout — which would otherwise put
 *     static generation at risk — and its known staleness there.
 */

/** Delay before a pending navigation is worth telling the visitor about. */
const REVEAL_AFTER_MS = 140;
/** Safety net: give up and complete if a navigation never resolves. */
const TIMEOUT_MS = 10_000;

type Listener = () => void;
const starters = new Set<Listener>();

/**
 * Starts the bar for a programmatic navigation (`router.push`), which produces
 * no anchor click for the global listener to catch.
 */
export function startRouteProgress(): void {
  for (const start of starters) start();
}

export function RouteProgress() {
  const barRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let active = false;
    let visible = false;
    let progress = 0;
    let startedAtUrl = '';
    let frame = 0;
    let revealTimer: ReturnType<typeof setTimeout> | null = null;
    let timeoutTimer: ReturnType<typeof setTimeout> | null = null;
    const cleanupTimers: ReturnType<typeof setTimeout>[] = [];

    const paint = (value: number, show: boolean) => {
      bar.style.transform = `scaleX(${value})`;
      bar.style.opacity = show ? '1' : '0';
    };

    const clearTimers = () => {
      if (revealTimer) clearTimeout(revealTimer);
      if (timeoutTimer) clearTimeout(timeoutTimer);
      revealTimer = null;
      timeoutTimer = null;
    };

    function finish() {
      if (!active) return;

      cancelAnimationFrame(frame);
      clearTimers();

      const wasVisible = visible;
      active = false;
      visible = false;

      if (!wasVisible) {
        // Fast navigation: the bar never appeared, so there is nothing to hide.
        progress = 0;
        paint(0, false);
        return;
      }

      paint(1, true);
      cleanupTimers.push(
        setTimeout(() => {
          paint(1, false);
          cleanupTimers.push(
            setTimeout(() => {
              progress = 0;
              paint(0, false);
            }, 220),
          );
        }, 160),
      );
    }

    function start() {
      if (active) return;

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      active = true;
      visible = false;
      progress = reduced ? 0.9 : 0.08;
      startedAtUrl = window.location.href;

      revealTimer = setTimeout(() => {
        if (!active) return;
        visible = true;
        paint(progress, true);
      }, REVEAL_AFTER_MS);

      timeoutTimer = setTimeout(finish, TIMEOUT_MS);

      const tick = () => {
        if (!active) return;

        // The URL changing is the signal that the navigation has committed.
        if (window.location.href !== startedAtUrl) {
          finish();
          return;
        }

        if (!reduced) {
          // Asymptotic approach to 90% — quick at first, then visibly slowing.
          progress += (0.9 - progress) * 0.045;
        }
        if (visible) paint(progress, true);

        frame = requestAnimationFrame(tick);
      };

      frame = requestAnimationFrame(tick);
    }

    function onClick(event: MouseEvent) {
      // Leave anything that is not a plain left click to the browser.
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest?.('a');
      if (!anchor) return;
      if (!anchor.getAttribute('href') || anchor.hasAttribute('download')) return;
      if (anchor.target && anchor.target !== '_self') return;

      let destination: URL;
      try {
        destination = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      // External links leave the app; the browser shows its own progress.
      if (destination.origin !== window.location.origin) return;
      // Same page, or a pure hash jump — no navigation to report.
      if (
        destination.pathname === window.location.pathname &&
        destination.search === window.location.search
      ) {
        return;
      }

      start();
    }

    starters.add(start);
    document.addEventListener('click', onClick, { capture: true });
    window.addEventListener('popstate', start);

    return () => {
      starters.delete(start);
      document.removeEventListener('click', onClick, { capture: true });
      window.removeEventListener('popstate', start);
      cancelAnimationFrame(frame);
      clearTimers();
      for (const timer of cleanupTimers) clearTimeout(timer);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5">
      <div
        ref={barRef}
        className="route-progress-bar"
        style={{ transform: 'scaleX(0)', opacity: 0 }}
      >
        <span className="route-progress-head" />
      </div>
    </div>
  );
}
