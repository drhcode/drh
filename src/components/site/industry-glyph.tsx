'use client';

import { AnimatedGlyph } from './animated-glyph';

/**
 * Line-art glyph for an industry, drawn on when it first scrolls into view.
 *
 * Bespoke geometry rather than an icon-set import, for two reasons: every path
 * carries `pathLength="1"`, so the draw-on is normalised and a long path takes
 * exactly as long as a short one; and the shapes are built on one 48-unit grid
 * with a single stroke weight, so ten different industries still read as one
 * family.
 *
 * Motion runs once, and only when seen. There is no idle loop — ten glyphs
 * animating forever on the index page would be precisely the ambient noise this
 * design system avoids.
 */

/**
 * Paths per icon key, drawn in order. The key matches `industries.icon_key`,
 * which the CMS already stores.
 */
const GLYPHS: Record<string, string[]> = {
  'hard-hat': [
    'M13 34V27a11 11 0 0 1 22 0v7',
    'M7 34h34',
    'M20 24V16h8v8',
  ],
  building: [
    'M14 42V14h20v28',
    'M14 14l10-6 10 6',
    'M7 42h34',
    'M20 22h8',
    'M20 30h8',
  ],
  stethoscope: [
    'M15 10v8a9 9 0 0 0 18 0v-8',
    'M24 27v5a8 8 0 0 0 8 8',
    'M33 34a3 3 0 1 0 6 0 3 3 0 1 0-6 0',
    'M12 10h6',
    'M30 10h6',
  ],
  utensils: [
    'M11 8v8a5 5 0 0 0 10 0V8',
    'M16 16v24',
    'M33 8c5 7 5 15 0 20v12',
  ],
  scale: [
    'M24 12v28',
    'M16 40h16',
    'M10 17h28',
    'M10 17v4',
    'M38 17v4',
    'M5 21l5 8 5-8',
    'M33 21l5 8 5-8',
  ],
  dumbbell: [
    'M15 24h18',
    'M11 17v14',
    'M15 19v10',
    'M33 19v10',
    'M37 17v14',
  ],
  car: [
    'M8 32l5-12h22l5 12v4H8z',
    'M14 20h20',
    'M14 36a3 3 0 1 0 6 0 3 3 0 1 0-6 0',
    'M28 36a3 3 0 1 0 6 0 3 3 0 1 0-6 0',
  ],
  'shopping-bag': [
    'M12 17h24l2 23H10z',
    'M18 17v-3a6 6 0 0 1 12 0v3',
  ],
  cloud: [
    'M15 33a7 7 0 1 1 1.6-13.8A10 10 0 0 1 35 21a6 6 0 0 1 1 12z',
    'M24 40v-6',
    'M20 37l4 3 4-3',
  ],
  'graduation-cap': [
    'M6 20l18-8 18 8-18 8z',
    'M14 24v8c0 3 20 3 20 0v-8',
    'M40 21v9',
  ],
};

/** Shown when an industry has an icon key we have no glyph for. */
const FALLBACK: string[] = [
  'M10 38V18l14-8 14 8v20z',
  'M10 38h28',
  'M19 38V26h10v12',
];

export function IndustryGlyph({
  iconKey,
  className,
  strokeWidth = 1.75,
  eager = false,
}: {
  iconKey: string | null;
  className?: string;
  strokeWidth?: number;
  eager?: boolean;
}) {
  return (
    <AnimatedGlyph
      paths={(iconKey && GLYPHS[iconKey]) || FALLBACK}
      className={className}
      strokeWidth={strokeWidth}
      eager={eager}
    />
  );
}
