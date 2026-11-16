import { cn } from '@/lib/utils';

/** 64×64 line icons from the design, keyed by service slug. */
const PATHS: Record<string, string> = {
  'web-development': 'M8 14h48v36H8zM8 22h48M14 18h2M20 18h2M18 32h20M18 40h28',
  'web-app-development': 'M10 10h20v20H10zM34 10h20v20H34zM10 34h20v20H10zM34 44h20M44 34v20',
  'mobile-app-development': 'M20 6h24v52H20zM28 12h8M30 50h4M26 22h12M26 30h8',
  'wordpress-development': 'M8 14h48v36H8zM8 22h48M18 32h28M18 40h16',
  'ecommerce-development': 'M6 10h8l6 30h30l6-20H18M24 50a3 3 0 106 0a3 3 0 10-6 0M42 50a3 3 0 106 0a3 3 0 10-6 0',
  'ui-ux-design': 'M32 6l14 26-14 26-14-26zM32 6v52M18 32h28',
  seo: 'M8 54h48M14 46l12-14 10 8 18-22M44 18h10v10',
  'google-ads': 'M32 8a24 24 0 100 48 24 24 0 000-48zM32 20a12 12 0 100 24 12 12 0 000-24zM32 30v4',
};

const FALLBACK = 'M8 14h48v36H8zM8 22h48';

export function servicePath(slug: string): string {
  return PATHS[slug] ?? FALLBACK;
}

/** Draws itself as it scrolls in, and redraws on card hover (`.card .ico`). */
export function ServiceIcon({ slug, size = 56, className }: { slug: string; size?: number; className?: string }) {
  return (
    <svg
      className={cn('ico', className)}
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      stroke="#D4FF3A"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path className="draw-v" pathLength={1000} d={servicePath(slug)} />
    </svg>
  );
}
