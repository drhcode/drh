'use client';

import { AnimatedGlyph } from './animated-glyph';

/**
 * Line-art glyph for a service, keyed by the `icon_key` the CMS already stores.
 *
 * Replaces the static icon-set import these used to render. Same 48-unit grid
 * and stroke weight as the industry glyphs, so a service card and an industry
 * card sit together without looking like they came from different systems.
 */
const GLYPHS: Record<string, string[]> = {
  // Web design & development
  code: ['M18 18l-8 6 8 6', 'M30 18l8 6-8 6', 'M27 14l-6 20'],

  // Custom web applications
  layers: [
    'M24 8L8 16l16 8 16-8z',
    'M8 24l16 8 16-8',
    'M8 32l16 8 16-8',
  ],

  // Mobile apps
  smartphone: ['M15 6h18a3 3 0 0 1 3 3v30a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3z', 'M21 11h6', 'M24 36h.01'],

  // WordPress & WooCommerce
  wordpress: [
    'M24 7a17 17 0 1 0 0 34 17 17 0 0 0 0-34z',
    'M9 18h30',
    'M24 7c5 5 5 29 0 34',
    'M24 7c-5 5-5 29 0 34',
  ],

  // E-commerce
  'shopping-cart': [
    'M7 9h4l4 19h20l4-13H14',
    'M18 37a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0',
    'M30 37a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0',
  ],

  // UI/UX & brand design
  palette: [
    'M24 7a17 17 0 1 0 0 34c2.5 0 3.5-2 3.5-3.5 0-3.5 4-3.5 6.5-3.5A7 7 0 0 0 41 27c0-11-7.6-20-17-20z',
    'M16 21h.01',
    'M22 15h.01',
    'M30 17h.01',
  ],

  // SEO & performance
  search: ['M21 10a11 11 0 1 0 0 22 11 11 0 0 0 0-22z', 'M29 29l10 10'],

  // Paid acquisition
  target: [
    'M24 7a17 17 0 1 0 0 34 17 17 0 0 0 0-34z',
    'M24 15a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
    'M24 22a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  ],

  // AI engineering — a model graph rather than a robot face.
  ai: [
    'M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    'M12 39a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    'M28 28a5 5 0 1 0 0-10 5 5 0 0 0 0 10z',
    'M40 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    'M40 39a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    'M15 15l9 5M15 33l9-5M33 20l5-4M33 28l5 4',
  ],
};

/** For an icon key we do not have artwork for yet. */
const FALLBACK = ['M10 14h28v22H10z', 'M10 22h28', 'M16 18h.01'];

export function ServiceGlyph({
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
