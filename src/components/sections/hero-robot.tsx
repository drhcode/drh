'use client';

import * as React from 'react';
import { useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Heart, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Home hero robot.
 *
 * A robot typing at a holographic screen. It is playful on purpose, so it
 * answers the visitor rather than just looping:
 *
 *   • its eyes and head follow the pointer — or a finger while it drags
 *   • hovering it (mouse) makes it smile
 *   • tapping or clicking it makes it smile, wave, say something and throw
 *     a few hearts; each tap moves to the next line
 *   • left alone for a moment, it goes back to watching its code
 *
 * It is a real <button>, so keyboard users get the same greeting with Enter
 * or Space. Head and eye motion is written straight to SVG attributes from a
 * rAF loop that only runs while something is moving and the robot is on
 * screen — no React render per frame.
 */

/** How long a tap keeps the robot happy, in ms. */
const HAPPY_MS = 2800;
/** After this long without pointer movement, look back at the code. */
const IDLE_MS = 3500;
const MESSAGE_COUNT = 5;

interface Burst {
  id: number;
  x: number;
  y: number;
  rotate: number;
  kind: 0 | 1 | 2;
}

/** Code lines on the hologram: indent, width, colour token. */
const HOLO_LINES: [number, number, string][] = [
  [0, 70, 'var(--accent-3)'],
  [0, 112, 'var(--accent)'],
  [14, 88, 'var(--accent-2)'],
  [14, 64, 'var(--accent)'],
  [28, 96, 'var(--accent-2)'],
  [14, 52, 'var(--accent-3)'],
  [0, 30, 'var(--accent)'],
];

export function HeroRobot() {
  const t = useTranslations('robot');
  const reduced = useReducedMotion();
  const svgRef = React.useRef<SVGSVGElement>(null);
  const headRef = React.useRef<SVGGElement>(null);
  const eyesRef = React.useRef<SVGGElement>(null);
  const [hovered, setHovered] = React.useState(false);
  const [poked, setPoked] = React.useState(false);
  const [message, setMessage] = React.useState(-1);
  const [bursts, setBursts] = React.useState<Burst[]>([]);
  const pokeTimer = React.useRef<number | undefined>(undefined);
  const burstId = React.useRef(0);

  const happy = hovered || poked;

  // Eye and head tracking.
  React.useEffect(() => {
    if (reduced) return;
    const svg = svgRef.current;
    const head = headRef.current;
    const eyes = eyesRef.current;
    if (!svg || !head || !eyes) return;

    // Resting pose: glancing right and down at the hologram.
    const rest = { x: 7, y: 4, tilt: 4 };
    const target = { ...rest };
    const current = { ...rest };
    let lastMove = 0;
    let frame = 0;
    let running = false;
    let onScreen = true;

    function apply() {
      eyes!.setAttribute('transform', `translate(${current.x.toFixed(2)} ${current.y.toFixed(2)})`);
      head!.setAttribute('transform', `rotate(${current.tilt.toFixed(2)} 175 190)`);
    }

    function tick(now: number) {
      if (lastMove && now - lastMove > IDLE_MS) {
        target.x = rest.x;
        target.y = rest.y;
        target.tilt = rest.tilt;
        lastMove = 0;
      }
      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;
      current.tilt += (target.tilt - current.tilt) * 0.08;
      apply();

      const settled =
        Math.abs(target.x - current.x) < 0.05 &&
        Math.abs(target.y - current.y) < 0.05 &&
        Math.abs(target.tilt - current.tilt) < 0.05;
      if (settled && !lastMove) {
        running = false;
        return;
      }
      frame = requestAnimationFrame(tick);
    }

    function start() {
      if (running || !onScreen) return;
      running = true;
      frame = requestAnimationFrame(tick);
    }

    function onPointerMove(event: PointerEvent) {
      if (!onScreen) return;
      const rect = svg!.getBoundingClientRect();
      // Head centre in screen space (the visor sits at ~42% / 30% of the art).
      const cx = rect.left + rect.width * 0.42;
      const cy = rect.top + rect.height * 0.3;
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;
      const reach = Math.max(rect.width, 320);
      target.x = Math.max(-1, Math.min(1, dx / reach)) * 13;
      target.y = Math.max(-1, Math.min(1, dy / reach)) * 9;
      target.tilt = Math.max(-1, Math.min(1, dx / (reach * 2))) * 9;
      lastMove = performance.now();
      start();
    }

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (!onScreen) {
        cancelAnimationFrame(frame);
        running = false;
      }
    });
    observer.observe(svg);

    apply();
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerMove);
    };
  }, [reduced]);

  React.useEffect(() => () => window.clearTimeout(pokeTimer.current), []);

  function poke() {
    setPoked(true);
    setMessage((index) => (index + 1) % MESSAGE_COUNT);
    window.clearTimeout(pokeTimer.current);
    pokeTimer.current = window.setTimeout(() => setPoked(false), HAPPY_MS);

    if (reduced) return;
    const fresh: Burst[] = Array.from({ length: 6 }, () => ({
      id: (burstId.current += 1),
      x: 30 + Math.random() * 40,
      y: 14 + Math.random() * 16,
      rotate: Math.random() * 50 - 25,
      kind: Math.floor(Math.random() * 3) as Burst['kind'],
    }));
    setBursts((list) => [...list, ...fresh].slice(-18));
    const ids = new Set(fresh.map((burst) => burst.id));
    window.setTimeout(() => setBursts((list) => list.filter((burst) => !ids.has(burst.id))), 1400);
  }

  return (
    <div className="relative mx-auto w-full max-w-[22rem] sm:max-w-[26rem] lg:max-w-[30rem]">
      {/* Speech bubble */}
      <div
        aria-live="polite"
        className={cn(
          'hero-bubble pointer-events-none absolute left-[6%] top-[-2%] z-10 max-w-[70%] rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm font-medium shadow-lg sm:text-[0.9375rem]',
          poked && message >= 0 ? 'hero-bubble-on' : 'hero-bubble-off',
        )}
      >
        {message >= 0 ? t(`message${message + 1}` as 'message1') : ''}
      </div>

      {/* Hearts and sparks */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
        {bursts.map((burst) => {
          const Icon = burst.kind === 0 ? Heart : burst.kind === 1 ? Sparkles : Star;
          return (
            <Icon
              key={burst.id}
              className={cn(
                'hero-burst absolute size-5',
                burst.kind === 0 ? 'fill-accent-3 text-accent-3' : burst.kind === 1 ? 'text-accent-2' : 'fill-accent text-accent',
              )}
              style={
                {
                  left: `${burst.x}%`,
                  top: `${burst.y}%`,
                  '--burst-rotate': `${burst.rotate}deg`,
                  '--burst-x': `${(burst.x - 50) * 1.6}px`,
                } as React.CSSProperties
              }
            />
          );
        })}
      </div>

      <button
        type="button"
        onClick={poke}
        onPointerEnter={(event) => event.pointerType === 'mouse' && setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        aria-label={t('ariaLabel')}
        className="group block w-full cursor-pointer touch-manipulation rounded-[2rem] [-webkit-tap-highlight-color:transparent]"
      >
        <svg
          ref={svgRef}
          viewBox="0 0 420 400"
          aria-hidden="true"
          className={cn('hero-robot block h-auto w-full', happy ? 'is-happy' : 'is-typing', poked && 'is-waving')}
        >
          <defs>
            <linearGradient id="hr-shell" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.6" stopColor="#e4dfff" />
              <stop offset="1" stopColor="#b9aff0" />
            </linearGradient>
            <linearGradient id="hr-visor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1d1745" />
              <stop offset="1" stopColor="#0b0920" />
            </linearGradient>
            <linearGradient id="hr-holo" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" style={{ stopColor: 'var(--accent)' }} stopOpacity="0.28" />
              <stop offset="1" style={{ stopColor: 'var(--accent-2)' }} stopOpacity="0.1" />
            </linearGradient>
            <radialGradient id="hr-floor">
              <stop offset="0" style={{ stopColor: 'var(--accent)' }} stopOpacity="0.55" />
              <stop offset="1" style={{ stopColor: 'var(--accent)' }} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Floor: a holographic disc with rings radiating out */}
          <ellipse cx="185" cy="372" rx="170" ry="24" fill="url(#hr-floor)" />
          <ellipse className="hr-ring" cx="185" cy="372" rx="120" ry="16" fill="none" style={{ stroke: 'var(--accent-2)' }} strokeWidth="1.5" />
          <ellipse className="hr-ring hr-ring-late" cx="185" cy="372" rx="120" ry="16" fill="none" style={{ stroke: 'var(--accent)' }} strokeWidth="1.5" />

          {/* Hologram code screen */}
          <g className="hr-holo">
            <path d="M232 44 L404 30 L404 176 L232 186 Z" fill="url(#hr-holo)" style={{ stroke: 'var(--accent-2)' }} strokeOpacity="0.7" strokeWidth="1.5" />
            <circle cx="246" cy="54" r="3" style={{ fill: 'var(--accent-3)' }} />
            <circle cx="256" cy="53" r="3" style={{ fill: 'var(--accent-2)' }} />
            <circle cx="266" cy="52" r="3" style={{ fill: 'var(--accent)' }} />
            {HOLO_LINES.map(([indent, width, colour], index) => (
              <rect
                key={index}
                className="hr-code"
                style={{ animationDelay: `${index * 0.55}s`, fill: colour }}
                x={246 + indent}
                y={70 + index * 15 - index * 0.9}
                width={width}
                height="6"
                rx="3"
              />
            ))}
            {/* Light beam from the screen down to the keyboard */}
            <path d="M232 186 L300 318 L262 318 Z" style={{ fill: 'var(--accent-2)' }} opacity="0.07" />
          </g>

          {/* Holographic keyboard */}
          <g className="hr-keyboard">
            <path d="M84 316 H312 L292 344 H62 Z" style={{ fill: 'var(--accent)', stroke: 'var(--accent-2)' }} fillOpacity="0.16" strokeOpacity="0.8" strokeWidth="1.5" />
            {Array.from({ length: 22 }, (_, index) => {
              const row = index < 11 ? 0 : 1;
              const column = index % 11;
              return (
                <rect
                  key={index}
                  className="hr-key"
                  x={92 + column * 19 - row * 9}
                  y={322 + row * 10}
                  width="13"
                  height="6"
                  rx="1.5"
                />
              );
            })}
          </g>

          <g className="hr-bob">
            {/* Body */}
            <rect x="160" y="184" width="30" height="22" rx="6" fill="#9d93e0" stroke="#2a2550" strokeWidth="3" />
            <rect x="110" y="200" width="130" height="104" rx="34" fill="url(#hr-shell)" stroke="#2a2550" strokeWidth="3.5" />
            <rect x="134" y="222" width="82" height="46" rx="14" fill="url(#hr-visor)" />
            {Array.from({ length: 6 }, (_, index) => (
              <rect
                key={index}
                className="hr-eq"
                style={{ animationDelay: `${index * -0.17}s` }}
                x={144 + index * 11}
                y="232"
                width="6"
                height="26"
                rx="3"
              />
            ))}
            <rect x="150" y="280" width="50" height="6" rx="3" fill="#9d93e0" />

            {/* Typing arms */}
            <g className="hr-arm hr-arm-l">
              <path d="M116 230 Q84 272 116 318" fill="none" stroke="#2a2550" strokeWidth="15" strokeLinecap="round" />
              <path d="M116 230 Q84 272 116 318" fill="none" stroke="#efeaff" strokeWidth="8" strokeLinecap="round" />
              <circle cx="117" cy="321" r="12" fill="#9d93e0" stroke="#2a2550" strokeWidth="3.5" />
            </g>
            <g className="hr-arm hr-arm-r">
              <path d="M234 230 Q266 272 236 318" fill="none" stroke="#2a2550" strokeWidth="15" strokeLinecap="round" />
              <path d="M234 230 Q266 272 236 318" fill="none" stroke="#efeaff" strokeWidth="8" strokeLinecap="round" />
              <circle cx="235" cy="321" r="12" fill="#9d93e0" stroke="#2a2550" strokeWidth="3.5" />
            </g>
            {/* Waving arm, shown instead of the right typing arm after a tap */}
            <g className="hr-arm-wave">
              <path d="M234 228 Q280 214 292 162" fill="none" stroke="#2a2550" strokeWidth="15" strokeLinecap="round" />
              <path d="M234 228 Q280 214 292 162" fill="none" stroke="#efeaff" strokeWidth="8" strokeLinecap="round" />
              <circle cx="293" cy="152" r="14" fill="#9d93e0" stroke="#2a2550" strokeWidth="3.5" />
            </g>

            {/* Head — rotated from JS around the neck */}
            <g ref={headRef} transform="rotate(4 175 190)">
              <line x1="175" y1="60" x2="175" y2="34" stroke="#2a2550" strokeWidth="4" strokeLinecap="round" />
              <circle className="hr-antenna" cx="175" cy="28" r="8" />
              <rect x="70" y="102" width="22" height="54" rx="9" fill="#9d93e0" stroke="#2a2550" strokeWidth="3" />
              <rect x="258" y="102" width="22" height="54" rx="9" fill="#9d93e0" stroke="#2a2550" strokeWidth="3" />
              <rect x="85" y="58" width="180" height="132" rx="48" fill="url(#hr-shell)" stroke="#2a2550" strokeWidth="3.5" />
              <rect x="103" y="80" width="144" height="90" rx="34" fill="url(#hr-visor)" />
              {/* Visor glint */}
              <path d="M118 92 Q150 84 186 88" fill="none" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="5" strokeLinecap="round" />

              <circle className="hr-cheek" cx="124" cy="150" r="9" />
              <circle className="hr-cheek" cx="226" cy="150" r="9" />

              <g ref={eyesRef} transform="translate(7 4)">
                <g className="hr-eyes-open">
                  <rect className="hr-eye" x="132" y="104" width="24" height="34" rx="12" />
                  <rect className="hr-eye" x="194" y="104" width="24" height="34" rx="12" />
                </g>
                <g className="hr-eyes-happy" fill="none" strokeWidth="7" strokeLinecap="round">
                  <path d="M131 126 Q144 108 157 126" />
                  <path d="M193 126 Q206 108 219 126" />
                </g>
                <rect className="hr-mouth-idle" x="164" y="150" width="22" height="5" rx="2.5" />
                <path className="hr-mouth-happy" d="M150 146 Q175 170 200 146" fill="none" strokeWidth="6" strokeLinecap="round" />
              </g>
            </g>
          </g>
        </svg>
      </button>

      <p className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <span className="relative flex size-2" aria-hidden="true">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent-2 opacity-60 motion-reduce:hidden" />
          <span className="relative inline-flex size-2 rounded-full bg-accent-2" />
        </span>
        {t('hint')}
      </p>
    </div>
  );
}
