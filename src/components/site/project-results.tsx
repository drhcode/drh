'use client';

import * as React from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import type { ResultMetric } from '@/lib/data/types';
import { GlowGrid } from '@/components/ui/glow';
import { cn } from '@/lib/utils';

/**
 * Project results panel.
 *
 * Everything that moves here is derived from the stored metric — the number
 * counts up to its real value, the arc is drawn to a real percentage, the arrow
 * points the way the stored sign points.
 *
 * Deliberately absent: sparklines, trend curves, comparison bars. A metric is
 * `{ value, label }` — a single figure with no history — so any line implying a
 * trajectory would be invented, which is the fake-analytics problem the content
 * rules exist to prevent (spec §100). The decoration is abstract instead, and
 * never data-shaped.
 *
 * All motion runs once, when the panel is first scrolled into view, and is
 * skipped entirely under prefers-reduced-motion.
 */

interface ParsedValue {
  /** Text before the sign and number, e.g. the currency in "€12k". */
  prefix: string;
  /**
   * The sign as written, kept separate from the number so it survives the
   * count-up. A "+" is meaningful in a result — dropping it turns "+45%" into
   * a flat "45%" and changes what the metric claims.
   */
  sign: '' | '+' | '-';
  /** The signed number, when the value contains one. */
  number: number | null;
  /** Text after the number, e.g. "%", "s", "×". */
  suffix: string;
  /** Decimal places in the source, so the count-up formats identically. */
  decimals: number;
  /** True when the source used grouped thousands, e.g. "1,200". */
  grouped: boolean;
}

/**
 * Splits a stored value into the parts needed to animate it without changing
 * how it reads. "+45%" keeps its plus sign, "2.1s" keeps one decimal and its
 * unit, and something like "Faster" is left alone.
 */
export function parseValue(raw: string): ParsedValue {
  const empty: ParsedValue = {
    prefix: raw,
    sign: '',
    number: null,
    suffix: '',
    decimals: 0,
    grouped: false,
  };

  const match = raw.match(/^([^\d+-]*)([+-]?)(\d[\d.,]*)(.*)$/s);
  if (!match) return empty;

  const [, prefix, sign, digits, suffix] = match;
  const grouped = /,\d{3}(\D|$)/.test(digits);
  const normalised = grouped ? digits.replace(/,/g, '') : digits;

  const magnitude = Number(normalised);
  if (!Number.isFinite(magnitude)) return empty;

  const dot = normalised.indexOf('.');
  const decimals = dot === -1 ? 0 : normalised.length - dot - 1;

  return {
    prefix,
    sign: sign === '+' ? '+' : sign === '-' ? '-' : '',
    number: sign === '-' ? -magnitude : magnitude,
    suffix,
    decimals,
    grouped,
  };
}

/** Formats the magnitude only — the sign is re-applied at display time. */
function formatValue(value: number, { decimals, grouped }: ParsedValue): string {
  const fixed = Math.abs(value).toFixed(decimals);
  if (!grouped) return fixed;

  return Number(fixed).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Counts a number up to its real value. Returns the final value at rest. */
function useCountUp(target: number | null, active: boolean, duration = 1100): number | null {
  const [current, setCurrent] = React.useState<number | null>(target);

  React.useEffect(() => {
    if (target === null) return;
    if (!active) return;

    let frame = 0;
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutExpo — fast to begin with, settling gently on the real figure.
      const eased = progress === 1 ? 1 : 1 - 2 ** (-10 * progress);
      setCurrent(target * eased);

      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, active, duration]);

  return current;
}

const RADIUS = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function MetricMark({
  parsed,
  play,
  index,
}: {
  parsed: ParsedValue;
  play: boolean;
  index: number;
}) {
  const isPercent = parsed.suffix.includes('%');
  // An arrow is shown only when the stored value actually carries a sign.
  const signed = parsed.sign !== '';
  const direction = parsed.sign === '+' ? 1 : parsed.sign === '-' ? -1 : 0;

  /*
   * The arc encodes magnitude only when the value is a percentage, because that
   * is the one case where a proportion is genuinely defined. For anything else
   * the ring is a fixed decorative sweep — it must not imply a scale the metric
   * does not have.
   */
  const fraction = isPercent && parsed.number !== null
    ? Math.min(Math.abs(parsed.number) / 100, 1)
    : 0.62;

  const offset = play ? CIRCUMFERENCE * (1 - fraction) : CIRCUMFERENCE;

  return (
    <svg
      viewBox="0 0 56 56"
      className="size-11 shrink-0 overflow-visible"
      aria-hidden="true"
      role="presentation"
    >
      <circle
        cx="28"
        cy="28"
        r={RADIUS}
        fill="none"
        stroke="var(--border)"
        strokeWidth="2"
      />
      <circle
        cx="28"
        cy="28"
        r={RADIUS}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        // Rotated so the arc grows from the top rather than from three o'clock.
        transform="rotate(-90 28 28)"
        style={{
          transition: 'stroke-dashoffset 1100ms cubic-bezier(0.16, 1, 0.3, 1)',
          transitionDelay: `${index * 90}ms`,
          opacity: isPercent ? 1 : 0.55,
        }}
      />

      {/* An arrow only when the stored value actually carries a direction. */}
      {signed && direction !== 0 && (
        <path
          d={direction > 0 ? 'M28 34 V22 M23 27 L28 22 L33 27' : 'M28 22 V34 M23 29 L28 34 L33 29'}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            opacity: play ? 1 : 0,
            transform: play ? 'translateY(0)' : `translateY(${direction > 0 ? 4 : -4}px)`,
            transition: 'opacity 400ms ease-out, transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
            transitionDelay: `${260 + index * 90}ms`,
          }}
        />
      )}
    </svg>
  );
}

function Metric({ result, index, play }: { result: ResultMetric; index: number; play: boolean }) {
  const parsed = React.useMemo(() => parseValue(result.value), [result.value]);
  const counted = useCountUp(parsed.number, play);

  const display =
    parsed.number === null || counted === null
      ? result.value
      : `${parsed.prefix}${parsed.sign}${formatValue(counted, parsed)}${parsed.suffix}`;

  return (
    <div data-glow className="glow-cell flex flex-col justify-between gap-6 bg-surface p-7">
      <MetricMark parsed={parsed} play={play} index={index} />
      <div>
        <dt className="sr-only">{result.label}</dt>
        <dd>
          {/* Tabular figures stop the card reflowing while the number counts. */}
          <span className="block font-mono text-3xl font-semibold tracking-tight text-foreground tabular-nums md:text-4xl">
            {display}
          </span>
          <span className="mt-2 block text-sm leading-snug text-muted-foreground">
            {result.label}
          </span>
        </dd>
      </div>
    </div>
  );
}

export function ProjectResults({
  title,
  results,
  resultsText,
}: {
  title: string;
  results: ResultMetric[];
  resultsText: string | null;
}) {
  const reduced = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px -15% 0px' });

  // Under reduced motion every animation starts already finished.
  const play = reduced ? true : inView;

  const hasMetrics = results.length > 0;

  return (
    <div ref={ref}>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <h2 className="text-2xl md:text-3xl">{title}</h2>
        {hasMetrics && resultsText && (
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{resultsText}</p>
        )}
      </div>

      {hasMetrics ? (
        <GlowGrid
          as="dl"
          className={cn(
            'mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border',
            results.length === 1 && 'sm:grid-cols-1',
            results.length === 2 && 'sm:grid-cols-2',
            results.length === 3 && 'sm:grid-cols-2 lg:grid-cols-3',
            results.length >= 4 && 'sm:grid-cols-2 lg:grid-cols-4',
          )}
        >
          {results.map((result, index) => (
            <Metric key={result.label} result={result} index={index} play={play} />
          ))}
        </GlowGrid>
      ) : (
        /*
         * No metrics recorded yet. Rather than hide the section or pad it with
         * placeholder figures, the panel says plainly that numbers are published
         * once measured — the honest state, presented deliberately.
         */
        resultsText && (
          <div className="mt-8 rounded-xl border border-border bg-surface p-7 md:p-9">
            <PendingMark play={play} />
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {resultsText}
            </p>
          </div>
        )
      )}
    </div>
  );
}

/**
 * Decoration for the "not measured yet" state: three concentric arcs that draw
 * themselves once. Abstract on purpose — there is no figure here to represent,
 * so it must not resemble a chart.
 */
function PendingMark({ play }: { play: boolean }) {
  return (
    <svg viewBox="0 0 120 40" className="h-10 w-auto" aria-hidden="true" role="presentation">
      {[0, 1, 2].map((i) => {
        const r = 12 + i * 7;
        const length = Math.PI * r;
        return (
          <path
            key={i}
            d={`M ${20 - r} 30 A ${r} ${r} 0 0 1 ${20 + r} 30`}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray={length}
            strokeDashoffset={play ? 0 : length}
            style={{
              opacity: 0.55 - i * 0.14,
              transition: 'stroke-dashoffset 900ms cubic-bezier(0.16, 1, 0.3, 1)',
              transitionDelay: `${i * 120}ms`,
            }}
          />
        );
      })}
    </svg>
  );
}
