'use client';

import * as React from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Site-wide particle field.
 *
 * One fixed canvas behind every page. Particles live in a shallow 3D volume
 * and drift slowly towards the viewer, so the field has real depth rather than
 * being a flat layer of dots:
 *
 *   • near particles are larger, brighter and move further with scroll and
 *     pointer (parallax), far ones barely move — that difference is the depth
 *   • particles at a similar depth are joined into constellations
 *   • the pointer acts as a weak lens: nearby particles brighten and lean in
 *   • every few seconds a single streak crosses the field
 *
 * The footer paints an opaque background over this canvas, which is how the
 * field stops there without the canvas needing to know where the footer is.
 *
 * Cost control: one sprite per colour is pre-rendered and stamped with
 * drawImage (no per-particle gradients), DPR is capped, the loop stops when
 * the tab is hidden, and under prefers-reduced-motion a single still frame is
 * drawn and nothing animates.
 */

/** Particles per million square CSS pixels, so phones and ultrawides match. */
const DENSITY = 120;
const MAX_PARTICLES = 170;
const MIN_PARTICLES = 50;
/** Depth range. z is distance from the viewer; 1 is the far plane. */
const NEAR = 0.18;
const FAR = 1;
/** Forward drift per second, in depth units. Slow — this is ambience. */
const DRIFT = 0.018;
/** Screen-space link distance for constellations, in CSS px. */
const LINK_DISTANCE = 128;
/** Particles only link when their depths are this close. */
const LINK_DEPTH = 0.16;
/** How far the pointer lens reaches, in CSS px. */
const LENS_RADIUS = 220;
/** Scroll parallax strength for the nearest particles. */
const SCROLL_PARALLAX = 0.32;
/** Seconds between streaks, randomised within this range. */
const STREAK_MIN = 5;
const STREAK_MAX = 11;
const SPRITE_SIZE = 64;

interface Particle {
  /** Normalised position in the volume, -1..1 on both axes. */
  x: number;
  y: number;
  z: number;
  /** Which palette entry this particle is drawn in. */
  hue: number;
  /** Twinkle phase and rate. */
  phase: number;
  rate: number;
  size: number;
}

interface Streak {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  hue: number;
}

export function DimensionField() {
  const reduced = useReducedMotion();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let sprites: HTMLCanvasElement[] = [];
    let palette: string[] = [];
    let additive = true;
    let frame = 0;
    let running = false;
    let last = 0;
    let scrollY = window.scrollY;
    let nextStreak = 2 + Math.random() * 3;
    let streak: Streak | null = null;

    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, strength: 0, target: 0 };

    /**
     * Resolve a token to something canvas accepts. Browsers that cannot parse
     * oklch in a fillStyle keep the sentinel, and we fall back to a hex
     * approximation of the same token.
     */
    const resolveColor = (token: string, fallback: string): string => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
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

    /**
     * Each sprite is a white radial falloff tinted with `source-in`. Tinting a
     * white mask avoids the dark fringe canvas gradients produce when they
     * interpolate a colour towards `transparent` (which is transparent black).
     */
    function buildSprites() {
      const dark = document.documentElement.classList.contains('dark');
      additive = dark;
      palette = [
        resolveColor('--accent', '#8b6cff'),
        resolveColor('--accent-2', '#5ee0ff'),
        resolveColor('--accent-3', '#ff6ad5'),
        dark ? resolveColor('--foreground', '#f4f2ff') : resolveColor('--accent-hover', '#5a3df0'),
      ];

      sprites = palette.map((colour) => {
        const sprite = document.createElement('canvas');
        sprite.width = SPRITE_SIZE;
        sprite.height = SPRITE_SIZE;
        const s = sprite.getContext('2d')!;
        const half = SPRITE_SIZE / 2;
        const gradient = s.createRadialGradient(half, half, 0, half, half, half);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.12, 'rgba(255,255,255,0.9)');
        gradient.addColorStop(0.3, 'rgba(255,255,255,0.28)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        s.fillStyle = gradient;
        s.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
        s.globalCompositeOperation = 'source-in';
        s.fillStyle = colour;
        s.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
        return sprite;
      });
    }

    function spawn(z = NEAR + Math.random() * (FAR - NEAR)): Particle {
      const roll = Math.random();
      return {
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        z,
        // Mostly the primary accent, then the cool secondary, a few warm and white.
        hue: roll < 0.48 ? 0 : roll < 0.8 ? 1 : roll < 0.9 ? 2 : 3,
        phase: Math.random() * Math.PI * 2,
        rate: 0.6 + Math.random() * 1.4,
        size: 0.7 + Math.random() * 0.9,
      };
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      context!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = Math.max(
        MIN_PARTICLES,
        Math.min(MAX_PARTICLES, Math.round(((width * height) / 1_000_000) * DENSITY)),
      );
      if (particles.length > target) particles.length = target;
      while (particles.length < target) particles.push(spawn());
    }

    /** Volume coordinates to screen. Nearer particles spread wider. */
    function project(p: Particle, time: number) {
      const perspective = 1 / p.z;
      const cx = width / 2;
      const cy = height / 2;
      const spread = Math.max(width, height) * 0.62;

      const parallaxX = (pointer.x - cx) * 0.018 * perspective * pointer.strength;
      const parallaxY = (pointer.y - cy) * 0.018 * perspective * pointer.strength;
      const scroll = scrollY * SCROLL_PARALLAX * (NEAR / p.z);

      let sx = cx + p.x * spread * perspective * 0.55 - parallaxX;
      let sy = cy + p.y * spread * perspective * 0.55 - parallaxY - scroll;

      // Wrap vertically so scrolling never empties the screen.
      const span = height + 80;
      sy = ((((sy + 40) % span) + span) % span) - 40;

      // A slow sway so the field never looks frozen between drifts.
      sx += Math.sin(time * 0.00012 + p.phase) * 6 * (1 - p.z);
      return { sx, sy, perspective };
    }

    function draw(time: number, dt: number) {
      context!.clearRect(0, 0, width, height);
      context!.globalCompositeOperation = additive ? 'lighter' : 'source-over';

      pointer.x += (pointer.tx - pointer.x) * 0.08;
      pointer.y += (pointer.ty - pointer.y) * 0.08;
      pointer.strength += (pointer.target - pointer.strength) * 0.06;

      const projected: { sx: number; sy: number; z: number; hue: number; alpha: number }[] = [];

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        p.z -= DRIFT * dt;
        if (p.z < NEAR) {
          particles[i] = spawn(FAR);
          continue;
        }

        let { sx, sy } = project(p, time);
        if (sx < -40 || sx > width + 40) continue;

        // Depth fades the far plane in, so particles never pop into existence.
        const depth = 1 - (p.z - NEAR) / (FAR - NEAR);
        const fadeIn = Math.min(1, (FAR - p.z) / 0.12);
        const twinkle = 0.72 + Math.sin(time * 0.001 * p.rate + p.phase) * 0.28;

        let lens = 0;
        if (pointer.strength > 0.01) {
          const dx = pointer.x - sx;
          const dy = pointer.y - sy;
          const distance = Math.hypot(dx, dy);
          if (distance < LENS_RADIUS) {
            lens = (1 - distance / LENS_RADIUS) ** 2 * pointer.strength;
            // Lean towards the pointer — a gravity well, not a magnet.
            sx += dx * lens * 0.14;
            sy += dy * lens * 0.14;
          }
        }

        const alpha = Math.min(1, (0.24 + depth * 0.7) * twinkle * fadeIn + lens * 0.6) * (additive ? 1 : 0.8);
        const size = (4 + depth * 16) * p.size * (1 + lens * 0.7);

        context!.globalAlpha = alpha;
        context!.drawImage(sprites[p.hue], sx - size / 2, sy - size / 2, size, size);

        projected.push({ sx, sy, z: p.z, hue: p.hue, alpha });
      }

      // Constellations: only between particles at a similar depth, so links
      // read as structures inside the volume rather than lines across it.
      context!.lineWidth = 0.7;
      const maxSq = LINK_DISTANCE * LINK_DISTANCE;
      for (let i = 0; i < projected.length; i += 1) {
        const a = projected[i];
        for (let j = i + 1; j < projected.length; j += 1) {
          const b = projected[j];
          if (Math.abs(a.z - b.z) > LINK_DEPTH) continue;
          const dx = a.sx - b.sx;
          const dy = a.sy - b.sy;
          const sq = dx * dx + dy * dy;
          if (sq > maxSq) continue;

          const near = 1 - (a.z + b.z) / 2;
          context!.globalAlpha =
            (1 - Math.sqrt(sq) / LINK_DISTANCE) * (0.06 + near * 0.22) * Math.min(a.alpha, b.alpha) * 1.6;
          context!.strokeStyle = palette[a.hue === 3 ? b.hue : a.hue];
          context!.beginPath();
          context!.moveTo(a.sx, a.sy);
          context!.lineTo(b.sx, b.sy);
          context!.stroke();
        }
      }

      drawStreak(dt);
      context!.globalAlpha = 1;
      context!.globalCompositeOperation = 'source-over';
    }

    function drawStreak(dt: number) {
      nextStreak -= dt;
      if (!streak && nextStreak <= 0) {
        const fromLeft = Math.random() < 0.5;
        const speed = 900 + Math.random() * 500;
        const angle = (0.12 + Math.random() * 0.22) * (fromLeft ? 1 : -1);
        streak = {
          x: fromLeft ? -60 : width + 60,
          y: Math.random() * height * 0.6,
          vx: Math.cos(angle) * speed * (fromLeft ? 1 : -1),
          vy: Math.abs(Math.sin(angle)) * speed,
          life: 1,
          hue: Math.random() < 0.5 ? 1 : 0,
        };
        nextStreak = STREAK_MIN + Math.random() * (STREAK_MAX - STREAK_MIN);
      }
      if (!streak) return;

      streak.x += streak.vx * dt;
      streak.y += streak.vy * dt;
      streak.life -= dt * 0.9;
      if (streak.life <= 0 || streak.x < -200 || streak.x > width + 200 || streak.y > height + 200) {
        streak = null;
        return;
      }

      const tail = 0.16;
      const gradient = context!.createLinearGradient(
        streak.x,
        streak.y,
        streak.x - streak.vx * tail,
        streak.y - streak.vy * tail,
      );
      gradient.addColorStop(0, palette[streak.hue]);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      context!.globalAlpha = streak.life * (additive ? 0.9 : 0.55);
      context!.strokeStyle = gradient;
      context!.lineWidth = 1.4;
      context!.beginPath();
      context!.moveTo(streak.x, streak.y);
      context!.lineTo(streak.x - streak.vx * tail, streak.y - streak.vy * tail);
      context!.stroke();
      context!.drawImage(sprites[streak.hue], streak.x - 9, streak.y - 9, 18, 18);
    }

    function tick(now: number) {
      if (!running) return;
      // Clamp so a long frame (or a return from a background tab) never jumps.
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      draw(now, dt);
      frame = requestAnimationFrame(tick);
    }

    function start() {
      if (running || reduced || document.visibilityState === 'hidden') return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(frame);
    }

    function onPointerMove(event: PointerEvent) {
      if (event.pointerType !== 'mouse') return;
      pointer.tx = event.clientX;
      pointer.ty = event.clientY;
      if (pointer.strength < 0.02) {
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
      }
      pointer.target = 1;
    }

    function onPointerLeave() {
      pointer.target = 0;
    }

    function onScroll() {
      scrollY = window.scrollY;
      if (reduced) draw(performance.now(), 0);
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') start();
      else stop();
    }

    buildSprites();
    resize();

    const themeObserver = new MutationObserver(() => {
      buildSprites();
      if (reduced) draw(performance.now(), 0);
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const onResize = () => {
      resize();
      if (reduced) draw(performance.now(), 0);
    };

    if (reduced) draw(performance.now(), 0);
    else start();

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      stop();
      themeObserver.disconnect();
      particles = [];
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}
