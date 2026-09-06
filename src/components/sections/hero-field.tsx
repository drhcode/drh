'use client';

import * as React from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Interactive hero backdrop.
 *
 * The static CSS grid stays exactly as it was — this layers two cheap effects
 * on top that follow the pointer (mouse, pen or finger):
 *
 *   1. a soft accent glow, moved with a GPU transform only
 *   2. nodes at the grid intersections that light up by proximity
 *
 * Design constraints this respects:
 *   • Nothing animates while the pointer is away — the loop stops entirely, so
 *     it costs nothing at rest and never becomes ambient noise.
 *   • It is decoration behind text, so it is aria-hidden and pointer-events-none;
 *     scrolling and touch gestures pass straight through.
 *   • Under prefers-reduced-motion nothing is rendered at all and no listener is
 *     attached.
 */

/** Matches the 72px background-size of `.grid-lines`, so nodes sit on the grid. */
const GRID = 72;
/** How far the pointer's influence reaches, in CSS pixels. */
const RADIUS = 210;
/** Smoothing on the pointer follow. Lower is lazier. */
const EASE = 0.12;

interface Pointer {
  /** Where the pointer actually is. */
  targetX: number;
  targetY: number;
  /** Where the effect has eased to. */
  x: number;
  y: number;
  /** 0 when away, 1 when engaged — fades the whole effect in and out. */
  strength: number;
  targetStrength: number;
}

export function HeroField() {
  const reduced = useReducedMotion();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const glowRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (reduced) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const glow = glowRef.current;
    if (!container || !canvas || !glow) return;

    /*
     * The visual stack is pointer-events:none so it can never block a scroll or
     * a tap — which also means it receives no pointer events of its own. The
     * hero section is the surface the visitor actually points at, so listen
     * there and translate into container-relative coordinates.
     */
    const surface = container.parentElement;
    if (!surface) return;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;

    /*
     * Resolve the palette from CSS custom properties so this never hard-codes a
     * colour. Browsers that cannot parse oklch in a canvas fillStyle fall back
     * to a hex approximation of the same token.
     */
    const resolveColor = (token: string, fallback: string): string => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue(token)
        .trim();
      if (!raw) return fallback;

      const sentinel = '#ff00ff';
      context.fillStyle = sentinel;
      try {
        context.fillStyle = raw;
      } catch {
        return fallback;
      }
      return context.fillStyle === sentinel ? fallback : raw;
    };

    let accent = resolveColor('--accent', '#2f5fe0');
    let nodeColor = resolveColor('--border-strong', '#d5d1cb');

    // The theme toggle swaps tokens on <html>, so re-read when it changes.
    const themeObserver = new MutationObserver(() => {
      accent = resolveColor('--accent', '#2f5fe0');
      nodeColor = resolveColor('--border-strong', '#d5d1cb');
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    const pointer: Pointer = {
      targetX: -9999,
      targetY: -9999,
      x: -9999,
      y: -9999,
      strength: 0,
      targetStrength: 0,
    };

    let bounds = { left: 0, top: 0 };
    let width = 0;
    let height = 0;
    let columns = 0;
    let rows = 0;
    let frame = 0;
    let running = false;
    let visible = true;

    function measure() {
      const rect = container!.getBoundingClientRect();
      bounds = { left: rect.left, top: rect.top };
      return rect;
    }

    function resize() {
      const rect = measure();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;
      height = rect.height;
      columns = Math.ceil(width / GRID) + 1;
      rows = Math.ceil(height / GRID) + 1;

      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      context!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      context!.clearRect(0, 0, width, height);
      if (pointer.strength <= 0.001) return;

      // Only the nodes inside the influence circle can be lit, so walk that
      // window rather than the whole grid.
      const minColumn = Math.max(0, Math.floor((pointer.x - RADIUS) / GRID));
      const maxColumn = Math.min(columns, Math.ceil((pointer.x + RADIUS) / GRID));
      const minRow = Math.max(0, Math.floor((pointer.y - RADIUS) / GRID));
      const maxRow = Math.min(rows, Math.ceil((pointer.y + RADIUS) / GRID));

      for (let column = minColumn; column <= maxColumn; column += 1) {
        for (let row = minRow; row <= maxRow; row += 1) {
          const x = column * GRID;
          const y = row * GRID;

          const distance = Math.hypot(x - pointer.x, y - pointer.y);
          if (distance > RADIUS) continue;

          // Quadratic falloff keeps the lit area tight and deliberate.
          const falloff = (1 - distance / RADIUS) ** 2 * pointer.strength;
          if (falloff < 0.01) continue;

          // A neutral dot underneath keeps the node visible as it fades out,
          // with the accent riding on top near the pointer.
          context!.globalAlpha = falloff * 0.5;
          context!.fillStyle = nodeColor;
          context!.beginPath();
          context!.arc(x, y, 1.6, 0, Math.PI * 2);
          context!.fill();

          context!.globalAlpha = falloff;
          context!.fillStyle = accent;
          context!.beginPath();
          context!.arc(x, y, 0.8 + falloff * 2.2, 0, Math.PI * 2);
          context!.fill();
        }
      }

      context!.globalAlpha = 1;
    }

    function tick() {
      pointer.x += (pointer.targetX - pointer.x) * EASE;
      pointer.y += (pointer.targetY - pointer.y) * EASE;
      pointer.strength += (pointer.targetStrength - pointer.strength) * EASE;

      glow!.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%)`;
      glow!.style.opacity = String(pointer.strength * 0.75);

      draw();

      const settled =
        pointer.targetStrength === 0 &&
        pointer.strength < 0.004 &&
        Math.abs(pointer.targetX - pointer.x) < 0.5;

      if (settled) {
        // Fully at rest: clear and stop burning frames until the next move.
        pointer.strength = 0;
        glow!.style.opacity = '0';
        context!.clearRect(0, 0, width, height);
        running = false;
        return;
      }

      frame = requestAnimationFrame(tick);
    }

    function start() {
      if (running || !visible) return;
      running = true;
      frame = requestAnimationFrame(tick);
    }

    function onPointerMove(event: PointerEvent) {
      pointer.targetX = event.clientX - bounds.left;
      pointer.targetY = event.clientY - bounds.top;

      // First contact should not streak across from the far corner. Only snap
      // when the effect is genuinely at rest — snapping mid-fade would jump.
      if (pointer.strength < 0.02) {
        pointer.x = pointer.targetX;
        pointer.y = pointer.targetY;
      }

      pointer.targetStrength = 1;
      start();
    }

    function onPointerLeave() {
      pointer.targetStrength = 0;
      start();
    }

    /*
     * A finger leaving the glass fires pointerup, not pointerleave, and touch
     * points are transient — so fade out shortly after the touch ends rather
     * than leaving the effect stuck under the last contact point.
     */
    function onPointerUp(event: PointerEvent) {
      if (event.pointerType === 'mouse') return;
      window.setTimeout(() => {
        pointer.targetStrength = 0;
        start();
      }, 600);
    }

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) {
          pointer.targetStrength = 0;
        } else if (pointer.strength > 0) {
          start();
        }
      },
      { threshold: 0 },
    );
    visibilityObserver.observe(container);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    // Passive listeners: this must never delay a scroll or a tap.
    surface.addEventListener('pointermove', onPointerMove, { passive: true });
    surface.addEventListener('pointerdown', onPointerMove, { passive: true });
    surface.addEventListener('pointerleave', onPointerLeave, { passive: true });
    surface.addEventListener('pointercancel', onPointerLeave, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('scroll', measure, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      themeObserver.disconnect();
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      surface.removeEventListener('pointermove', onPointerMove);
      surface.removeEventListener('pointerdown', onPointerMove);
      surface.removeEventListener('pointerleave', onPointerLeave);
      surface.removeEventListener('pointercancel', onPointerLeave);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('scroll', measure);
    };
  }, [reduced]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Static structural grid — unchanged, and all that renders without JS. */}
      <div className="absolute inset-0 grid-lines opacity-[0.35] dark:opacity-[0.22]" />

      {!reduced && (
        <div className="hero-field-mask absolute inset-0">
          <div
            ref={glowRef}
            className="hero-glow absolute left-0 top-0 opacity-0"
            style={{ willChange: 'transform, opacity' }}
          />
          <canvas ref={canvasRef} className="absolute inset-0" />
        </div>
      )}
    </div>
  );
}
