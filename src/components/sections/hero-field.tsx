'use client';

import * as React from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Interactive hero backdrop.
 *
 * One canvas draws three layers that share a coordinate system, so the whole
 * thing reads as a single field rather than stacked decorations:
 *
 *   1. drifting particles — slow ambient motion, the "alive" layer
 *   2. grid nodes at the 72px intersections, lit by pointer proximity
 *   3. links between lit particles that are also near each other
 *
 * Plus a soft accent glow following the pointer, moved by GPU transform only.
 *
 * Restraint is structural, not just a matter of taste:
 *   • The loop stops when the hero leaves the viewport or the tab is hidden.
 *   • Ambient drift is capped at ~30fps; only pointer response runs full rate.
 *   • Under prefers-reduced-motion nothing is created at all — no canvas, no
 *     glow, no listeners — and the static CSS grid stands alone.
 *   • It is decoration behind text, so it is aria-hidden and pointer-events-none;
 *     scrolling and touch gestures pass straight through.
 */

/** Matches the 72px background-size of `.grid-lines`, so nodes sit on the grid. */
const GRID = 72;
/** How far the pointer's influence reaches, in CSS pixels. */
const RADIUS = 210;
/** Smoothing on the pointer follow. Lower is lazier. */
const EASE = 0.12;
/**
 * Particles per million square pixels. Density rather than a fixed count, so
 * the field has the same visual weight on a phone and on an ultrawide.
 */
const DENSITY = 64;
const MAX_PARTICLES = 130;
/** Ambient drift is imperceptible above this rate, and capping it halves the work. */
const AMBIENT_FPS = 30;
/** Lit particles closer than this to each other get a connecting line. */
const LINK_DISTANCE = 118;
/** Share of particles drawn as ring nodes instead of plain dots. */
const NODE_FRACTION = 0.2;
/** Seconds for one full breath of a ring node. */
const NODE_PERIOD = 4200;
/**
 * Nodes are joined to each other whether or not the pointer is near, which is
 * what makes the field read as a network rather than as scattered dust. Only
 * nodes take part — linking every particle would be both slower and noisier.
 */
const NODE_LINK_DISTANCE = 210;
/** Share of particles tinted with the accent rather than the neutral line colour. */
const ACCENT_FRACTION = 0.45;

interface Pointer {
  /** Where the pointer actually is. */
  targetX: number;
  targetY: number;
  /** Where the effect has eased to. */
  x: number;
  y: number;
  /** 0 when away, 1 when engaged — fades the pointer layers in and out. */
  strength: number;
  targetStrength: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  /** Baseline opacity, before any pointer influence. */
  alpha: number;
  /**
   * A few particles are drawn as concentric rings rather than dots — the
   * anchor points of the field. Kept rare on purpose: the effect depends on
   * most of the field being quiet, and a sky full of rings is just noise.
   */
  node: boolean;
  /** Phase offset so the rings do not breathe in unison. */
  phase: number;
  /** Drawn in the accent rather than the neutral line colour. */
  accent: boolean;
}

export function HeroField({ particles: ambient = true }: { particles?: boolean }) {
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
    let particles: Particle[] = [];
    let frame = 0;
    let running = false;
    let onScreen = true;
    let lastAmbient = 0;

    function seedParticles() {
      if (!ambient) {
        particles.length = 0;
        return;
      }
      const target = Math.min(
        MAX_PARTICLES,
        Math.round(((width * height) / 1_000_000) * DENSITY),
      );

      // Keep existing particles across a resize so the field does not visibly
      // reshuffle when the window changes.
      if (particles.length > target) {
        particles.length = target;
        return;
      }
      while (particles.length < target) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          // Slow enough to read as drift rather than as movement.
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.16,
          radius: 0.7 + Math.random() * 1.3,
          alpha: 0.3 + Math.random() * 0.32,
          node: Math.random() < NODE_FRACTION,
          phase: Math.random() * Math.PI * 2,
          accent: Math.random() < ACCENT_FRACTION,
        });
      }
    }

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

      seedParticles();
    }

    function drawParticles(now: number) {
      const lit: Particle[] = [];
      const nodes: Particle[] = [];

      for (const particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap rather than bounce — bouncing clusters them along the edges.
        if (particle.x < -10) particle.x = width + 10;
        if (particle.x > width + 10) particle.x = -10;
        if (particle.y < -10) particle.y = height + 10;
        if (particle.y > height + 10) particle.y = -10;

        const distance = Math.hypot(particle.x - pointer.x, particle.y - pointer.y);
        const influence =
          distance < RADIUS ? (1 - distance / RADIUS) ** 2 * pointer.strength : 0;

        if (influence > 0.05) lit.push(particle);
        if (particle.node) nodes.push(particle);

        const colour = particle.accent || influence > 0.02 ? accent : nodeColor;

        if (particle.node) {
          /*
           * A ring node: a filled core with two rings breathing outward around
           * it. The rings carry only a fraction of the core's alpha, so they
           * read as a halo rather than as more dots.
           */
          const breath = (Math.sin(now / NODE_PERIOD + particle.phase) + 1) / 2;
          const core = particle.radius + 0.5 + influence * 1.4;

          context!.globalAlpha = Math.min(1, particle.alpha + influence * 0.7);
          context!.fillStyle = colour;
          context!.beginPath();
          context!.arc(particle.x, particle.y, core, 0, Math.PI * 2);
          context!.fill();

          context!.strokeStyle = colour;
          context!.lineWidth = 1;
          for (const [index, scale] of [3.2, 5.4].entries()) {
            const radius = core + scale + breath * (1.6 + index * 1.4);
            context!.globalAlpha =
              Math.min(1, particle.alpha + influence * 0.7) * (0.5 - index * 0.18) * (0.55 + breath * 0.45);
            context!.beginPath();
            context!.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
            context!.stroke();
          }
        } else {
          context!.globalAlpha = Math.min(1, particle.alpha + influence * 0.7);
          context!.fillStyle = colour;
          context!.beginPath();
          context!.arc(particle.x, particle.y, particle.radius + influence * 1.4, 0, Math.PI * 2);
          context!.fill();
        }
      }

      /*
       * Always-on links between node particles. There are only a handful of
       * nodes, so this stays cheap, and it is what turns a drifting dust field
       * into something that reads as a network.
       */
      context!.lineWidth = 1;
      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i];
          const b = nodes[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance > NODE_LINK_DISTANCE) continue;

          context!.globalAlpha = (1 - distance / NODE_LINK_DISTANCE) * 0.16;
          context!.strokeStyle = a.accent || b.accent ? accent : nodeColor;
          context!.beginPath();
          context!.moveTo(a.x, a.y);
          context!.lineTo(b.x, b.y);
          context!.stroke();
        }
      }

      // Link only the particles the pointer has lit. A full O(n²) web would be
      // both slower and visually much noisier.
      context!.strokeStyle = accent;
      context!.lineWidth = 1;

      for (let i = 0; i < lit.length; i += 1) {
        for (let j = i + 1; j < lit.length; j += 1) {
          const a = lit[i];
          const b = lit[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance > LINK_DISTANCE) continue;

          context!.globalAlpha = (1 - distance / LINK_DISTANCE) * 0.2 * pointer.strength;
          context!.beginPath();
          context!.moveTo(a.x, a.y);
          context!.lineTo(b.x, b.y);
          context!.stroke();
        }
      }
    }

    function drawGridNodes() {
      if (pointer.strength <= 0.001) return;

      // Only nodes inside the influence circle can be lit, so walk that window
      // rather than the whole grid.
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
    }

    function tick(now: number) {
      if (!running) return;

      pointer.x += (pointer.targetX - pointer.x) * EASE;
      pointer.y += (pointer.targetY - pointer.y) * EASE;
      pointer.strength += (pointer.targetStrength - pointer.strength) * EASE;
      if (pointer.targetStrength === 0 && pointer.strength < 0.004) pointer.strength = 0;

      glow!.style.opacity = String(pointer.strength * 0.75);
      if (pointer.strength > 0) {
        glow!.style.transform =
          `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%)`;
      }

      /*
       * Two rates in one loop: while the pointer is engaged everything redraws
       * every frame so the response feels immediate; once it leaves, only the
       * ambient drift continues, and that is throttled.
       */
      const engaged = pointer.strength > 0.01;
      if (engaged || (ambient && now - lastAmbient >= 1000 / AMBIENT_FPS)) {
        lastAmbient = now;
        context!.clearRect(0, 0, width, height);
        if (ambient) drawParticles(now);
        drawGridNodes();
        context!.globalAlpha = 1;
      }

      /*
       * Without drift there is nothing to animate once the pointer has gone, so
       * the loop shuts down completely and the hero costs nothing at rest. With
       * drift it keeps running — but only while on screen and foregrounded.
       */
      if (!ambient && !engaged && pointer.targetStrength === 0) {
        context!.clearRect(0, 0, width, height);
        glow!.style.opacity = '0';
        running = false;
        return;
      }

      frame = requestAnimationFrame(tick);
    }

    function start() {
      if (running || !onScreen || document.visibilityState === 'hidden') return;
      running = true;
      lastAmbient = 0;
      frame = requestAnimationFrame(tick);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(frame);
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

    // A backgrounded tab should cost nothing. rAF already throttles hard there,
    // but stopping outright also prevents a burst of catch-up drift on return.
    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        if (ambient) start();
      } else {
        stop();
      }
    }

    const viewportObserver = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) {
          if (ambient) start();
        } else {
          pointer.targetStrength = 0;
          pointer.strength = 0;
          glow!.style.opacity = '0';
          stop();
        }
      },
      { threshold: 0 },
    );
    viewportObserver.observe(container);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();
    if (ambient) start();

    // Passive listeners: this must never delay a scroll or a tap.
    surface.addEventListener('pointermove', onPointerMove, { passive: true });
    surface.addEventListener('pointerdown', onPointerMove, { passive: true });
    surface.addEventListener('pointerleave', onPointerLeave, { passive: true });
    surface.addEventListener('pointercancel', onPointerLeave, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('scroll', measure, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      stop();
      themeObserver.disconnect();
      viewportObserver.disconnect();
      resizeObserver.disconnect();
      particles = [];
      surface.removeEventListener('pointermove', onPointerMove);
      surface.removeEventListener('pointerdown', onPointerMove);
      surface.removeEventListener('pointerleave', onPointerLeave);
      surface.removeEventListener('pointercancel', onPointerLeave);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('scroll', measure);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [reduced, ambient]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Static structural grid — unchanged, and all that renders without JS. */}
      <div className="absolute inset-0 grid-lines opacity-[0.45] dark:opacity-[0.3]" />

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
