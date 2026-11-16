# Design system

The public site follows the "drh.al — Website Redesign" artboards (redesign v2).
The admin keeps its own, denser design language and shares only the base tokens.

| File | Holds |
| --- | --- |
| `src/styles/site.css` | Public palette, theme tokens, motion, component classes. Loaded by the localized layout only, so the admin never downloads it. |
| `src/app/globals.css` | Tailwind, the shared base/admin tokens, and the Tailwind colour mapping for the public tokens. |
| `src/app/fonts.ts` | Self-hosted fonts (`next/font/local`). |
| `src/lib/theme.ts` | Theme resolution, persistence and the pre-paint script. |

## Tokens

Two themes, defined on `<html>` as `.t-dark` (default) and `.t-light`. `.inv`
flips a band to the opposite theme (the ivory "Selected work" band on a dark page).

| Token | Use | Tailwind |
| --- | --- | --- |
| `--bg` `--fg` | Page ground and primary text | `bg-bg`, `text-fg` |
| `--s1` `--s2` | Raised surfaces (cards, panels) | `bg-s1`, `bg-s2` |
| `--ln` `--ln2` | Hairlines and outlines | `border-ln`, `border-ln2` |
| `--t1` `--t2` `--t3` | Text, from strongest to quietest | `text-t1` … |
| `--acct` | Accent text and focus ring — lime in dark, deep green in light | `text-acct` |
| `#D4FF3A` / `#0b0d0c` | The fixed brand lime and ink (CTAs, lime bands) | `bg-lime`, `text-ink` |

Shared UI primitives (dialogs, menus, cookie banner, toasts) use the older
`--background`/`--foreground` tokens; `site.css` remaps those onto the public
palette, so they follow the visitor's theme.

Contrast (WCAG): every text token on every surface is at least 4.5:1 in both
themes. The lowest pairs are light-theme `--acct` on `--s2` (4.88:1) and
`--t3` on `--s2` (5.05:1). Ink on lime is 16.9:1. Fixed lime is only ever used
as text on ink.

## Type

- **Inter Tight** — everything read or clicked; display headings at weight 600
  with tight negative tracking.
- **Instrument Serif italic** — the accent word in a headline. Copy marks it with
  asterisks (`"Built for *growth*."`); CMS titles without markers accent their
  last word (`<Accent autoLast>`). Accents never wrap.
- **JetBrains Mono** — eyebrows, breadcrumbs, labels and numbers.

Fonts are committed `woff2` files loaded with `next/font/local` — the Hostinger
build server cannot reliably fetch Google Fonts. Only the families the public
site renders are preloaded; the admin's Manrope and Geist Mono load on demand.

## Theme

Dark is the brand default. On a first visit the OS `prefers-color-scheme`
decides; once the visitor uses the sun/moon switch, that choice wins and is
stored in localStorage **and** a `drh-theme` cookie. A tiny blocking script in
`<head>` applies the theme before first paint, so there is no flash. The cookie
is deliberately not read on the server: that would make every page dynamic.

## Motion

CSS only — no animation library. Keyframes live in `site.css`:
rise, reveal (scroll-driven), marquee, draw / draw-v / drawloop, flow, orbit,
glow, shine, bob, sweep, recscroll, curtain, ripple and a few page-specific ones.

- **Scroll reveals** use `animation-timeline: view()` inside `@supports`.
  Browsers without view timelines skip to the end state — content is simply
  visible, never stuck hidden.
- **Hero headlines and lead paragraphs** slide in without fading (`.rise-t`), so
  the page's largest text is painted at first render. Smaller hero elements use
  the full fade (`.rise`).
- **Page curtain**: lime panel with "drh.al" sweeping up, on first load and on
  every client-side route change (keyed by pathname). Next's experimental view
  transitions were not used — they require the experimental React channel.
- **Pointer effects** (`src/components/fx/pointer-fx.tsx`): spotlight that
  follows the cursor or finger, a tap ripple, `--px/--py` parallax on the home
  orbit, magnetic primary buttons and the 3D tilt on the home performance card.
  Magnetic and tilt ignore touch input. Everything writes CSS variables inside
  one `requestAnimationFrame`.
- **Reduced motion**: `prefers-reduced-motion: reduce` switches off every
  animation and transition on the public site, shows drawn lines fully drawn,
  hides the curtain and freezes pointer effects.
- **Below the fold**, home sections and the footer use `content-visibility:
  auto`, so the browser does not lay them out until they approach the viewport.

## Components

| Folder | What |
| --- | --- |
| `components/site` | Shell: header (frosted, hides on scroll down), locale and theme switches, footer with CTA band, floating dock, curtain, ⌘K search (lazy). |
| `components/brand` | Primitives: accent headline, section head, icons, brand mark, service icons. |
| `components/blocks` | Content blocks shared by the home page and CMS landing pages: page hero, service cards, project cards, lists (industries, process, why, journal, FAQ), marquees. |
| `components/{home,services,work,industries,blog,pricing,book,audit}` | Page-specific client pieces. |
| `components/sections/page-sections.tsx` | Renders a CMS landing page from its fixed catalogue of section blocks, using the blocks above. |

Marquees server-render their list once and clone it in the browser for the
seamless loop, which keeps page weight down.

## Accessibility

- One visible focus treatment: a 2px `--acct` outline, ink on lime surfaces.
- Real semantics for interactive widgets: ARIA tabs with arrow keys (service
  process, industries), radio groups for single choices (contact form, estimator,
  booking slots), toggle buttons for filters, native range inputs for the
  estimator and the before/after slider.
- The mobile menu traps focus, closes on Escape and returns focus to its button.
- Decorative SVG and motion are `aria-hidden`; illustrative panels (agent
  studio, growth chart) are labelled as illustrations.
- Every input has a label; errors are announced with `role="alert"`.

## Admin vs public

The admin is deliberately a different language: denser type, a sunken canvas
with elevated panels, a persistent sidebar, 14px base. It shares the base tokens
and the theme preference (same storage, same pre-paint script) but none of the
public components.

### Route progress

`src/components/route-progress.tsx` — a 2px accent bar at the top of the
viewport, mounted by the shared document so it covers the public site and the
admin. Nothing shows under ~140ms, it eases toward 90% and completes only on
arrival, and under reduced motion it holds one position instead of easing.

## Adding a component

1. Reach for `components/blocks` and `components/brand` first.
2. Use the tokens (`bg-s1`, `text-t2`, `border-ln` …). If a value is missing,
   add a token rather than a literal.
3. Check both themes, 390px and 1440px, keyboard operation and reduced motion.
