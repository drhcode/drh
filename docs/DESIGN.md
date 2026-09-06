# Design system

The visual identity is built from tokens in `src/app/globals.css`. No component
hard-codes a colour, radius or shadow.

## The idea

A **warm neutral ground** paired with **one cool, precise accent**.

The warmth is the point. Most developer-adjacent agency sites use pure greys,
which read as cold and generic. Shifting the neutrals a few degrees warm
(`oklch(0.987 0.0025 85)` for the light ground, `oklch(0.148 0.006 65)` for dark)
makes the palette feel considered without becoming decorative. The single cool
accent then does all the signalling work — CTAs, links, focus, charts — so
nothing else has to compete for attention.

This is deliberately not Linear's cool violet, Vercel's pure monochrome, or
Stripe's indigo. Warm neutrals plus electric blue is its own combination.

## Tokens

| Group | Purpose |
| --- | --- |
| `--background`, `--surface`, `--surface-raised`, `--surface-sunken` | Four elevation levels |
| `--foreground`, `--muted-foreground`, `--subtle-foreground` | Three text weights |
| `--border`, `--border-strong`, `--ring` | Hairlines and focus |
| `--accent` + `-hover`, `-foreground`, `-subtle`, `-border` | The single accent, complete |
| `--success`, `--warning`, `--danger`, `--info` | Status only — never decoration |
| `--chart-1` … `--chart-6` | Chart series, ordered by visual priority |

Every token is defined in `:root` and redefined under `.dark`, so both themes are
complete by construction rather than by patching.

## Typography

Inter for text, JetBrains Mono for code and numeric labels. Headings are tight
(`-0.022em`, `-0.032em` at h1) and set at weight 560 — heavier than regular,
lighter than bold, which reads as confident rather than shouty. Body copy is
constrained to ~44rem (`.container-prose`) because line length does more for
readability than font choice.

## Motion

Framer Motion, used sparingly:

- **Hero:** one staggered fade-up, 14px of travel, on load only
- **Sections:** 12px reveal, once, on scroll into view
- **Cards:** 1.03 scale on the image, arrow shift on hover
- **Metrics:** count-up on first view
- **Overlays:** 140–180ms fade/pop

Everything is disabled by the global `prefers-reduced-motion` rule, and the
metrics counter renders its final value immediately when motion is reduced —
the animation is never the only way to read a number.

### Route progress

`src/components/route-progress.tsx` — a 2px accent bar at the top of the
viewport, mounted once in the root layout so it covers the public site and the
admin.

A full-screen loader was the wrong shape here: the public site is statically
generated and prefetched, so an overlay would hide content that is already
present and make navigation feel slower than it is. The bar earns its place in
`/admin`, where every route is a server round trip through Supabase.

Three decisions carry it:

- **Nothing shows under ~140ms.** Instant static navigations would otherwise
  produce a flash that reads as a glitch rather than as feedback.
- **It eases toward 90% and stops**, completing only on arrival. It never
  implies progress it has no way to measure.
- **Arrival is detected by watching `location.href` inside the animation loop**,
  not via `useSearchParams()`. That hook would need a Suspense boundary in a
  layout — putting static generation at risk — and is known to go stale there.
  All 85 pages stay statically generated.

Link clicks are caught by one capture-phase listener that ignores modified
clicks, downloads, new-tab targets, external origins and hash-only jumps.
Programmatic `router.push` calls fire no click, so the admin filters, date-range
picker, command palette, language switcher and site search call
`startRouteProgress()` explicitly.

Under reduced motion the bar still appears — it is feedback, not decoration —
but holds one position instead of easing.

### The hero field

`src/components/sections/hero-field.tsx` makes the hero's existing 72px grid
respond to the pointer — mouse, pen or finger — rather than adding unrelated
decoration on top of it. Two layers:

1. **An accent glow** that follows the pointer, moved with a GPU `translate3d`
   and nothing else. Its colour is the `--accent-glow` token, which carries its
   own alpha so no `color-mix()` is needed. (Lightning CSS shims `color-mix`
   with a full-strength fallback rule, which would render a solid accent disc on
   older browsers — the token avoids that entirely.)
2. **Nodes on the grid intersections**, drawn to a DPR-aware canvas, lit by a
   quadratic proximity falloff within 210px. Only the intersections inside that
   window are visited, so a frame touches roughly 30 points.

The listeners sit on the hero `<section>`, not on the visual stack. The stack is
`pointer-events: none` so it can never block a scroll or a tap — which by spec
also means it receives no pointer events at all, so listening there would fire
nothing.

Why it stays quiet:

- **The loop stops.** When the pointer leaves, the effect eases to zero, clears
  the canvas and cancels its rAF. At rest it costs nothing — it never becomes
  the "constant animation" the brief rules out.
- **It pauses off-screen** via `IntersectionObserver`, so scrolling past the hero
  does not keep a loop alive.
- **It never blocks input.** The whole stack is `pointer-events-none` and every
  listener is passive, so scroll and tap are untouched.
- **It is progressive enhancement.** The static grid is plain CSS and renders
  identically before hydration, without JavaScript, and under reduced motion —
  where no canvas, no glow and no listeners are created at all.
- **Touch is handled explicitly.** Touch fires `pointerup`/`pointercancel` rather
  than `pointerleave`, so the effect fades shortly after contact ends instead of
  sticking under the last touch point.

## Accessibility

- One focus treatment everywhere: `:focus-visible` with a 2px accent ring
- Semantic landmarks, a skip link, labelled forms and dialogs
- Mobile nav uses ≥44px tap targets and is a purpose-built layout, not a shrunk desktop menu
- Every drag interaction has a keyboard and select-based alternative
- Wide tables scroll inside their own container; the page body never does

## Admin vs public

The admin is deliberately a different language: denser type, a sunken canvas with
elevated panels, a persistent sidebar, 14px base instead of 17px. It shares the
tokens — so themes and brand stay consistent — but not the layout vocabulary. It
should read as an internal tool, not as the marketing site with a menu attached.

## Adding a component

1. Reach for `src/components/ui` first.
2. Use tokens. If a value is missing, add a token rather than a literal.
3. Both themes, or it is not done.
4. Check keyboard operation and focus visibility before styling states.

## Service pages

The service detail page leads with a split hero: content on the left, a cover
illustration on the right, stacking to a single column below `lg`.

**Covers** are generated by `scripts/gen-service-covers.cjs` — a dark ink frame
around a light interface, one motif per service (editor, layered panels, phones,
article blocks, storefront, design system, search results, campaign dashboard).
They read as product screenshots rather than stock photography, work on both
themes without a second asset, and are replaced from
/admin/services → Cover image. Next.js serves SVG directly rather than through
the image optimizer, so no `dangerouslyAllowSVG` is needed.

**Mobile specifics**, since this page carries the most content:

- The H1 starts at `2rem` rather than `text-4xl`, so a headline like "Web
  Development in Albania for Ambitious Businesses" breaks cleanly at 375px.
- The breadcrumb wraps instead of overflowing on long service names.
- Both CTAs are full-width below `sm`, side by side above it.
- The offset accent panel behind the cover sits at `-12px`, inside the container's
  20px padding — it adds depth without ever creating horizontal scroll.
- "What's included" is a bordered `gap-px` grid: three columns on desktop, one on
  mobile, with no reflow artefacts at any width.
