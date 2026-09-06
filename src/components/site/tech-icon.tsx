import { cn } from '@/lib/utils';

/**
 * Technology marks.
 *
 * Simplified, single-colour glyphs drawn in `currentColor` so they sit quietly
 * in the neutral palette and work in both themes. Anything without a glyph
 * falls back to a monogram tile, which keeps the strip visually even as the
 * team adds technologies from /admin.
 */

const paths: Record<string, React.ReactNode> = {
  react: (
    <>
      <circle cx="12" cy="12" r="2.1" />
      <ellipse cx="12" cy="12" rx="10" ry="4.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <ellipse
        cx="12"
        cy="12"
        rx="10"
        ry="4.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        transform="rotate(60 12 12)"
      />
      <ellipse
        cx="12"
        cy="12"
        rx="10"
        ry="4.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        transform="rotate(120 12 12)"
      />
    </>
  ),
  'react-native': (
    <>
      <circle cx="12" cy="12" r="2.1" />
      <ellipse cx="12" cy="12" rx="10" ry="4.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <ellipse
        cx="12"
        cy="12"
        rx="10"
        ry="4.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        transform="rotate(60 12 12)"
      />
      <ellipse
        cx="12"
        cy="12"
        rx="10"
        ry="4.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        transform="rotate(120 12 12)"
      />
    </>
  ),
  nextjs: (
    <>
      <circle cx="12" cy="12" r="10.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.6 16.2V7.8h1.5l5.6 7.4V7.8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  nodejs: (
    <path
      d="M12 2.2 21 7.1v9.8L12 21.8 3 16.9V7.1zM12 8.4v7.2m0 0c-1.6 0-2.6-.6-2.6-1.7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  ),
  typescript: (
    <>
      <rect x="2.4" y="2.4" width="19.2" height="19.2" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 10.4h5m-2.5 0v7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M17.6 11c-.5-.5-1.2-.7-1.9-.6-1 .1-1.6.7-1.6 1.5 0 1.9 3.6 1.1 3.6 3.2 0 1-.9 1.7-2.1 1.7-.9 0-1.6-.3-2.1-.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </>
  ),
  javascript: (
    <>
      <rect x="2.4" y="2.4" width="19.2" height="19.2" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 10v5.2c0 1-.6 1.6-1.5 1.6-.7 0-1.2-.3-1.5-.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M17.4 10.8c-.4-.5-1-.8-1.7-.8-1 0-1.7.6-1.7 1.4 0 1.8 3.5 1.1 3.5 3.1 0 1-.8 1.6-2 1.6-.9 0-1.6-.3-2-1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </>
  ),
  wordpress: (
    <>
      <circle cx="12" cy="12" r="10.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="m4.6 8.4 3.7 10.1 2.3-6.4-1.6-3.7M14.2 8.4l3 8.7 1.9-5.9c.3-1 .1-1.9-.3-2.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  woocommerce: (
    <>
      <rect x="2" y="5.5" width="20" height="11.5" rx="3.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6.2 9.6l1.2 4 1.4-4 1.3 4 1.4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="15.6" cy="11.6" r="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 17v2.6L12.4 17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </>
  ),
  php: (
    <>
      <ellipse cx="12" cy="12" rx="10.2" ry="6.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6.6 15V9h1.9c1 0 1.6.5 1.6 1.4s-.6 1.5-1.6 1.5H6.9M13.4 15V9m0 3h2.6m0 3V9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </>
  ),
  supabase: (
    <path
      d="M13 2.2 4.2 12.6c-.5.6-.1 1.5.7 1.5H12v8.1c0 .9 1.1 1.3 1.7.6l8.2-10.4c.5-.6.1-1.5-.7-1.5H14V2.8c0-.9-1.1-1.3-1.7-.6z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  ),
  postgresql: (
    <>
      <path
        d="M18.4 5.2c1.6 2.6 1.6 8.6-.5 12.2-.8 1.4-2 1.6-2.6.6M6 5.4C4.2 8 4.3 14 6.3 17.6c.8 1.4 2.1 1.5 2.7.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8.4 4.4c2.3-.9 5.2-.9 7.5 0M12 8.6v8.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </>
  ),
  tailwind: (
    <path
      d="M12 6.4c-2.7 0-4.3 1.3-5 4 1-1.3 2.2-1.8 3.5-1.5.8.2 1.3.8 2 1.4 1 1 2.2 2.2 4.7 2.2 2.7 0 4.4-1.3 5-4-1 1.3-2.1 1.8-3.4 1.5-.8-.2-1.4-.8-2-1.4-1.1-1-2.3-2.2-4.8-2.2zM7 12.9c-2.7 0-4.3 1.3-5 4 1-1.3 2.2-1.8 3.5-1.5.8.2 1.3.8 2 1.4 1 1 2.2 2.2 4.7 2.2 2.7 0 4.4-1.3 5-4-1 1.3-2.1 1.8-3.4 1.5-.8-.2-1.4-.8-2-1.4-1.1-1-2.3-2.2-4.8-2.2z"
      fill="currentColor"
    />
  ),
};

export function TechIcon({ slug, className }: { slug: string; className?: string }) {
  const glyph = paths[slug];

  if (!glyph) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          'inline-flex items-center justify-center rounded border border-current/30 text-[0.5rem] font-bold uppercase leading-none',
          className,
        )}
      >
        {slug.slice(0, 2)}
      </span>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      focusable="false"
    >
      {glyph}
    </svg>
  );
}
