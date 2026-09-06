# Database

PostgreSQL via Supabase. Two migrations, applied in order, then the generated seed.

```
supabase/migrations/0001_schema.sql   tables, enums, indexes, triggers
supabase/migrations/0002_rls.sql      row level security, storage, auth hook
supabase/seed.sql                     generated — see npm run seed:sql
```

## Shape

Translated content uses a **parent + translation** pair rather than columns per
language. That keeps "which languages exist" a row-count question, which is what
makes the translation status, hreflang gating and sitemap filtering simple and
correct rather than a set of null checks.

```
projects ──┬── project_translations   (project_id, language) unique
           ├── project_media          ordered by sort_order
           ├── project_results        optional, verified metrics only
           ├── project_technologies   → technologies
           ├── project_services       → services
           └── testimonial_id         → testimonials

services ──── service_translations, service_technologies
industries ── industry_translations
blog_posts ── blog_translations, blog_post_tags → blog_tags
pages ─────── page_translations       sections stored as jsonb

leads ─────┬── lead_notes             internal only
           └── lead_activity          status changes, notes, value edits
```

Supporting tables: `admin_users`, `media`, `newsletter_subscribers`,
`redirects`, `seo_settings`, `site_settings`, `integrations`, `activity_logs`,
`admin_notifications`, `page_events`, `rate_limits`.

## Why some choices were made

**`page_translations.sections` is `jsonb`.** Sections are an ordered,
heterogeneous list of a fixed set of shapes. A relational model would need a
table per section type or an EAV sprawl; neither earns its complexity when the
whole document is always read and written together. The section types are
validated on write (`src/app/admin/actions/pages.ts`) so unknown shapes can never
reach a page.

**Result metrics are a table, not `jsonb`.** They are ordered, individually
edited, and translated — all of which are easier relationally.

**`rate_limits` has RLS enabled and no policies at all.** That makes it
unreachable except through the service role. Deliberate, not an oversight.

**No `ip` column anywhere.** Rate limiting stores `sha256(ip + daily salt)`,
which cannot be reversed and cannot be correlated across days. Rows are pruned
after 24 hours by `prune_rate_limits()`.

## Row Level Security

Enabled on every table. Three broad shapes:

| Reader | Sees |
| --- | --- |
| anon / authenticated visitor | published content only; child rows inherit the parent's visibility |
| signed-in admin | everything their role allows |
| service role | everything — used only by server actions that have already checked the caller's role |

Write policies follow the role matrix:

- **super_admin** — everything, including `admin_users`
- **admin** — content, projects, leads, blog, services, industries, settings
- **editor** — projects, blog, pages, media
- **marketing** — leads, newsletter, SEO, redirects, integrations

`admin_role()` and `has_role()` are `SECURITY DEFINER` so policies on
`admin_users` do not recurse into themselves.

## Storage

| Bucket | Public | Contents |
| --- | --- | --- |
| `media` | yes | Site imagery. Admin-only writes. |
| `lead-attachments` | **no** | Client-supplied documents. Read only by super_admin, admin and marketing, through short-lived signed URLs. |

## Changing the schema

1. Add a new numbered migration — never edit an applied one.
2. Update `src/types/database.ts` to match.
3. If it affects seeded content, update `src/content/seed/*.ts` and run
   `npm run seed:sql`.
4. `npm run typecheck` will find every call site that needs attention.
