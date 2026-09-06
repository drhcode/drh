# drh.al

The public website and internal admin platform for **drh.al**, a digital agency in Albania.

Two applications in one codebase:

- **The public site** — a bilingual (EN/SQ) marketing site built for lead generation and search visibility. Statically generated, CMS-driven, no hardcoded content.
- **`/admin`** — an internal SaaS-style control panel: lead CRM, content management, analytics, SEO tooling and settings.

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router, Server Components) |
| Language | TypeScript, strict |
| Styling | Tailwind CSS v4 with a token-based design system |
| UI | Radix primitives, hand-built components |
| Motion | Framer Motion (reduced-motion aware) |
| Database | Supabase / PostgreSQL with Row Level Security |
| Auth | Supabase Auth + a server-side role matrix |
| Storage | Supabase Storage (public `media`, private `lead-attachments`) |
| i18n | next-intl — `/` for English, `/sq` for Albanian |
| Forms | React Hook Form + Zod (revalidated on the server) |
| Email | Resend |
| Spam | Cloudflare Turnstile + honeypot + rate limiting |
| Charts | Recharts |
| Analytics | GA4 Data API, Search Console API, Meta Pixel, Clarity |

---

## Quick start

```bash
npm install
cp .env.example .env.local     # fill in what you have
npm run dev                    # http://localhost:3000
```

The **public site runs with no configuration at all**. When Supabase is absent the
data layer falls back to the typed seed content in `src/content/seed`, so a fresh
clone renders the complete site immediately. The **admin requires a database** —
it is the one part that cannot run on the fallback.

---

## Setting up the database

1. **Create a Supabase project**, then put the URL, anon key and service role key in `.env.local`.

2. **Run the migrations** in order, in the Supabase SQL editor (or via `supabase db push`):

   ```
   supabase/migrations/0001_schema.sql   -- tables, enums, indexes, triggers
   supabase/migrations/0002_rls.sql      -- row level security, storage buckets, auth hook
   ```

3. **Seed the content:**

   ```bash
   npm run seed:sql        # regenerates supabase/seed.sql from src/content/seed
   ```

   Then run `supabase/seed.sql`. It is idempotent — every statement upserts, so it
   is safe to re-run after editing the content modules.

   > **Shortcut:** `supabase/apply-all.sql` is all three files concatenated in the
   > correct order, ready to paste into the Supabase SQL Editor in one go.
   > Regenerate it with `npm run build:setup-sql`.

4. **Verify it landed:**

   ```bash
   npm run verify:db
   ```

   Checks every table, compares seeded row counts against `supabase/seed.sql`,
   confirms both storage buckets exist, and proves RLS is actually blocking
   anonymous reads of leads and admin users. Needs no database password — it
   works over PostgREST with the service role key.

5. **Create the first super admin:**

   ```bash
   npm run bootstrap:admin -- you@drh.al "Your Name"
   ```

   It generates a strong password and prints it once. To choose your own, pass it
   as a third argument, or set `ADMIN_PASSWORD` to keep it out of shell history:

   ```bash
   ADMIN_PASSWORD='…' npm run bootstrap:admin -- you@drh.al "Your Name"
   ```

   Re-running against an existing account promotes it to super admin and resets
   the password when one is supplied — so this doubles as a lockout recovery.

Everyone after that is invited from **Admin → Users**.

---

## Environment variables

Only `NEXT_PUBLIC_*` values ever reach the browser, and none of them are secret —
they are measurement IDs and the Supabase anon key, which is constrained by RLS.

| Variable | Required for | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonicals, sitemap, emails | Set this in production |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Admin, live content | Public by design |
| `SUPABASE_SERVICE_ROLE_KEY` | Lead storage, admin writes | **Server only.** Bypasses RLS |
| `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_ADMIN_TO` | Transactional email | Without it, leads are stored but not emailed |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Form spam protection | Honeypot + rate limiting still apply without it |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` | GA4 + Search Console reporting | Server only |
| `GA4_PROPERTY_ID`, `GSC_SITE_URL` | Reporting | Grant the service account Viewer access to both |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | Client analytics | Loads only after consent |
| `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_CLARITY_PROJECT_ID` | Marketing tags | Load only after consent |

**Google reporting setup:** create a service account in Google Cloud, enable the
*Analytics Data API* and the *Search Console API*, then add the service account
email as a Viewer on the GA4 property and on the Search Console property.

---

## Project layout

```
src/
  app/
    [locale]/            Public site — one tree, two languages
      [pageSlug]/        Legal documents + SEO landing pages
      work/ services/ industries/ blog/ about/ contact/
    admin/
      (auth)/login/      Sign-in, outside the admin shell
      (dashboard)/       Everything behind authentication
      actions/           Server actions, each one role-guarded
      api/search/        Admin ⌘K record search
    api/                 Public endpoints: search, newsletter, events
    sitemap.ts robots.ts
  components/
    ui/                  Design-system primitives
    site/                Public chrome — header, footer, consent, search
    sections/            CMS-driven page sections
    forms/               Project inquiry form
    admin/               Admin shell, tables, editors, charts
  lib/
    data/                Public content layer (DB or seed fallback)
    admin/               Admin queries: leads, content, SEO audit, audit log
    analytics/           GA4, Search Console, date ranges, client events
    auth/                Role matrix + server-side guards
    seo/                 Metadata builders, structured data
    security/            Rate limiting, Turnstile, request context
    email/               Resend client + branded templates
  content/
    seed/                The single source of initial content
    legal.ts             Privacy, terms, cookie policy (EN + SQ)
supabase/migrations/     Schema and RLS
scripts/                 Seed generation, admin bootstrap, placeholders
```

---

## How content works

**Nothing on the public site is hardcoded.** Every page reads from the CMS:

- **Pages** (`/`, `/about`, landing pages) are composed from a fixed catalogue of
  designed section blocks — hero, metrics, feature grid, process, CTA, and the
  data-backed ones that pull services, projects, testimonials, blog posts and FAQs
  automatically. It is deliberately *not* a free-form page builder: an editor
  controls content and order, the design system controls everything else.
- **Projects, services, industries, blog posts** each have a parent row plus one
  translation row per language.
- **Adding a project** makes it appear on the work grid, and on the relevant
  service and industry pages, with no further work.

### Translations

English is the default and is served without a prefix. Albanian lives under `/sq`.

A translation exists only when it has a title. When a language is missing:

- the page still renders, using English as a fallback so a visitor is never shown an empty page;
- it is marked `noindex`;
- it is excluded from that language's sitemap entries and hreflang set.

The admin shows this state on every list (`🇬🇧 EN ✓ / 🇦🇱 SQ —`) and on the editor tabs.

### Seed content

`src/content/seed/*.ts` is the single source of truth for the initial dataset.
`npm run seed:sql` generates `supabase/seed.sql` from it. Editing the TypeScript
and regenerating keeps the offline fallback and the database in sync.

---

## Content integrity

Some things are deliberately absent, and should stay absent:

- **No invented testimonials.** The table ships empty and the public section hides
  itself until real quotes are added.
- **No invented project results.** The three seeded case studies describe scope,
  architecture and delivery only. Result metrics are optional in the CMS, and the
  Results section is hidden when there are none.
- **No fake analytics.** If GA4 or Search Console is not connected, the dashboard
  says so and shows an empty state. It never substitutes sample data.
- **No `AggregateRating`, review, award or certification schema.**
- **Placeholder imagery is obviously placeholder** — generated abstract SVG
  browser frames under `public/media`, not stock photography. Replace them from
  Admin → Media.

> The seeded case-study narratives were written from the technical brief. Review
> them against what was actually delivered before launch — only drh.al knows the
> specifics of each engagement.

---

## Security

- **Two independent layers.** Every admin page and server action calls
  `requireCapability()` / `assertCapability()` against the role matrix in
  `src/lib/auth/permissions.ts`. Underneath that, PostgreSQL Row Level Security
  enforces the same boundaries. Hiding a button is never the security model.
- **Session validation** uses `getUser()`, which revalidates the token with
  Supabase, rather than trusting the session cookie.
- **Roles:** `super_admin`, `admin`, `editor`, `marketing` — see the matrix in
  `permissions.ts` and the summary rendered on Admin → Users.
- **Form pipeline:** Zod validation → honeypot → rate limit → Turnstile →
  attachment MIME *and* extension check → store → notify.
- **Uploads** get generated filenames, an allow-list of types, and size ceilings.
  Lead attachments go to a private bucket and are opened through short-lived
  signed URLs.
- **Secrets** never reach the browser. The Google private key is used only in
  server-side reporting calls; the admin receives aggregated numbers.

### Privacy

- **Full IP addresses are never stored.** Rate limiting uses `sha256(ip + salt)`
  with a salt that rotates daily. The hashes are pruned after 24 hours.
- **Analytics and advertising scripts do not load** until the visitor accepts the
  matching cookie category. Rejecting means they are never loaded — not loaded
  and then disabled.
- Lead attribution stores campaign parameters and a coarse country/city from edge
  headers. No fingerprinting, no cross-site identifiers.

---

## Admin overview

| Section | What it does |
| --- | --- |
| Dashboard | KPIs with period-over-period comparison, traffic + leads chart, pipeline, recent leads, Search Console summary, activity |
| Analytics | Audience, acquisition, pages, Search Console, first-party content engagement, and lead-to-revenue attribution by channel |
| Leads | Filterable list and drag-and-drop pipeline, full attribution, notes, activity trail, CSV export |
| Projects | Full case-study CMS: bilingual content, gallery with drag reordering and per-language alt text, optional metrics, SEO |
| Blog | Rich editor (headings, lists, quotes, images, tables, code), scheduling, categories, related service |
| Services / Industries | Bilingual pages with benefits, features, process, FAQs |
| Testimonials / FAQs | Bilingual, with translation status visible |
| Pages | Structured section editor for the homepage, About, Contact and landing pages |
| Media | Upload, alt text per language, folders, search |
| Newsletter | Double opt-in subscribers, filters, CSV export |
| SEO | Audits every page for missing/duplicate titles, description length, missing translations, noindex |
| Redirects | 301/302/307/308 with loop detection, applied in middleware |
| Users | Invite, change role, disable — super admin only |
| Integrations | Live connection status, with a real API probe for GA4 and Search Console |
| Settings | Company details used across the site, emails and structured data |
| Activity | Who changed what, and when |

`⌘K` / `Ctrl+K` opens command search in both the admin and the public site.

See [`docs/ACCEPTANCE.md`](docs/ACCEPTANCE.md) for the delivery checklist and what still
needs real-world data before launch, and [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for
production environment variables — including why a missing `NEXT_PUBLIC_SITE_URL`
silently breaks canonicals, `sitemap.xml` and `robots.txt`.

---

## Commands

```bash
npm run dev               # development server
npm run build             # production build
npm run start             # serve the production build
npm run typecheck         # tsc --noEmit
npm run seed:sql          # regenerate supabase/seed.sql from the TS seed content
npm run bootstrap:admin   # create the first super admin
npm run gen:placeholders  # regenerate placeholder imagery
```

---

## Deployment

Designed for Vercel, but nothing is Vercel-specific except the geo headers used
for coarse lead location (`x-vercel-ip-country`, `x-vercel-ip-city`), which also
falls back to Cloudflare's `cf-ipcountry`.

Before going live:

1. Set `NEXT_PUBLIC_SITE_URL` to `https://drh.al`.
2. Apply both migrations and the seed.
3. Bootstrap the super admin, then change the password.
4. Connect GA4 and Search Console, and verify the status on Admin → Integrations.
5. Replace the placeholder imagery with real project photography.
6. Review the seeded case-study copy and the legal pages.
7. Add real testimonials once you have them.

---

## Prepared for, but not built

The schema and routing leave room for these without a migration rewrite:

- **Client portal** (`/client`) — the admin routes are namespaced so a separate
  client-facing tree can be added alongside them.
- **Proposal workflow** — `leads` already carries `estimated_value`, `won_value`
  and a status pipeline that runs to `won`, which is the natural join point for
  proposals and projects.
