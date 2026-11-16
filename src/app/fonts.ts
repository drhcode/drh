import localFont from 'next/font/local';

/*
 * Fonts are self-hosted from ./fonts rather than loaded with next/font/google.
 * The Google loader downloads the files during `next build`, and the Hostinger
 * build server intermittently gets a response next/font cannot parse, which
 * fails the whole build. Committed files make the build independent of the
 * network. Each file is Google's "latin" subset (U+0000–00FF plus €, curly
 * quotes and dashes), which covers English, Albanian (ë, ç) and Italian.
 */

/** Public site: body, navigation, buttons and display headings. Variable font. */
export const interTight = localFont({
  src: './fonts/inter-tight-latin-var.woff2',
  weight: '400 700',
  display: 'swap',
  variable: '--font-inter-tight',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
});

/** Italic accent words in headlines, plus the admin's display serif. */
export const instrumentSerif = localFont({
  src: './fonts/instrument-serif-latin-italic.woff2',
  weight: '400',
  style: 'italic',
  display: 'swap',
  variable: '--font-serif-stack',
  fallback: ['Georgia', 'serif'],
  adjustFontFallback: 'Times New Roman',
});

/** The upright cut is only used by the admin, so it is not preloaded. */
export const instrumentSerifUpright = localFont({
  src: './fonts/instrument-serif-latin.woff2',
  weight: '400',
  style: 'normal',
  display: 'swap',
  preload: false,
  variable: '--font-serif-upright',
  fallback: ['Georgia', 'serif'],
});

/** Public site: labels, eyebrows and numbers. Variable font. */
export const jetbrainsMono = localFont({
  src: './fonts/jetbrains-mono-latin-var.woff2',
  weight: '400 500',
  display: 'swap',
  variable: '--font-jetbrains',
  fallback: ['ui-monospace', 'SFMono-Regular', 'monospace'],
  adjustFontFallback: false,
});

/*
 * Admin type. Not preloaded: the public site never renders these families, so
 * a preload would make every public visitor download fonts they never see.
 * The browser still fetches them on demand when the admin uses them.
 */
export const manrope = localFont({
  src: './fonts/manrope-latin-var.woff2',
  weight: '200 800',
  display: 'swap',
  preload: false,
  variable: '--font-sans-stack',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
});

export const geistMono = localFont({
  src: './fonts/geist-mono-latin-var.woff2',
  weight: '100 900',
  display: 'swap',
  preload: false,
  variable: '--font-mono-stack',
  fallback: ['ui-monospace', 'SFMono-Regular', 'monospace'],
  adjustFontFallback: false,
});

/** Every font variable, applied to <html> by both document layouts. */
export const fontVariables = [interTight, instrumentSerif, instrumentSerifUpright, jetbrainsMono, manrope, geistMono]
  .map((font) => font.variable)
  .join(' ');
