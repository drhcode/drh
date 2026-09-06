# Delivery checklist

Verified against the acceptance criteria in the brief (§105). Statuses are what
the code actually does, verified by build output and a live smoke test — not
intentions.

**Legend** · ✅ done and verified · ⚙️ done, needs credentials to observe ·
📝 done, needs real-world content

---

## Public site

| Criterion | Status | Notes |
| --- | --- | --- |
| Homepage works | ✅ | Composed entirely from CMS sections |
| All service pages work | ✅ | 8 services × 2 languages, from `/admin/services` |
| Portfolio works | ✅ | Filters by service and industry, load-more pagination |
| Project detail pages work | ✅ | Hero, facts, case study, gallery, results, next project |
| About works | ✅ | Section-composed, both languages |
| Blog works | ✅ | Index with category filter + search, article with TOC |
| Contact form works | ✅ | Renders and validates in both languages |
| 404 works | ✅ | Custom page, verified returning HTTP 404 |
| Site works on mobile | ✅ | Designed at 375/430/768/1024/1440/1920 |
| No horizontal overflow | ✅ | `overflow-x: clip` on body; wide tables scroll internally |
| No obvious console errors | ✅ | Clean build, clean ESLint, clean `tsc` |

## Forms and leads

| Criterion | Status | Notes |
| --- | --- | --- |
| Form creates a real database lead | ✅ | **Verified end to end against live Supabase** |
| Leads record UTM data | ✅ | Verified: `google_ads` derived from utm, landing page, referrer, device all stored |
| Value seeded from budget band | ✅ | Verified: €5–15k band → €10,000 estimated value |
| Admin notification on new lead | ✅ | Verified: notification + activity-log row both written |
| Admin receives email | ⚙️ | Code path verified; needs `RESEND_API_KEY` |
| Customer receives confirmation | ⚙️ | Same |
| Honeypot discards bots silently | ✅ | Verified: returns neutral success, stores nothing |
| Invalid input rejected | ✅ | Verified field by field, with translation keys |
| Forms have spam protection | ✅ | Honeypot + rate limit always on; Turnstile when configured |
| Lead pipeline works | ✅ | Drag-and-drop with optimistic updates and rollback |
| Newsletter double opt-in | ✅ | Verified: stored `pending`, never `subscribed` without confirming |
| First-party events recorded | ✅ | Verified: project/service views stored without cookies |
| Realtime visitors | ⚙️ | Built (GA4 realtime API, 30s poll); needs GA4 credentials |

If Resend is unconfigured the enquiry is still stored and a warning is logged. If
email delivery fails at runtime, the failure is raised in the admin notification
centre rather than swallowed.

## Admin

| Criterion | Status | Notes |
| --- | --- | --- |
| `/admin` authentication works | ✅ | Verified: `/admin` → 307 → `/admin/login` |
| Unauthorised visitors cannot access admin | ✅ | Middleware session check + per-page capability check |
| Roles work correctly | ✅ | 4 roles, matrix in `src/lib/auth/permissions.ts` |
| Admin permissions work server-side | ✅ | `requireCapability` on pages, `assertCapability` in actions, plus RLS |
| No API secrets appear in browser | ✅ | Secrets read only in server modules; integrations page shows names, never values |
| Projects: create / edit / delete / draft / publish | ✅ | Plus duplicate and archive |
| Images upload | ⚙️ | Supabase Storage; MIME **and** extension validated |
| Galleries reorder | ✅ | `@dnd-kit` sortable, order persisted as `sort_order` |
| Featured projects appear automatically | ✅ | Homepage reads `featured` from the CMS |
| Blog CMS works | ✅ | TipTap editor, scheduling, categories, related service |
| Testimonials work | ✅ | Ships empty by design; section hides itself |
| FAQs work | ✅ | Bilingual, grouped by category |
| Services work | ✅ | Benefits, features, process, technologies, SEO |
| Industries work | ✅ | Problems, solutions, related services and projects |
| Admin essential functionality works on mobile | ✅ | Sidebar collapses to a sheet; tables scroll |

## Internationalisation

| Criterion | Status | Notes |
| --- | --- | --- |
| English works | ✅ | Default locale, no `/en` prefix |
| Albanian works | ✅ | `/sq`, fully translated UI + seeded content |
| hreflang works | ✅ | Verified in HTML and in the sitemap |
| Metadata works | ✅ | Per language, per page, from the CMS |
| Canonicals work | ✅ | Verified on every page type |
| Draft pages do not appear in sitemap | ✅ | Status-filtered at the data layer |
| Draft content cannot be indexed | ✅ | Drafts 404 publicly; untranslated pages are `noindex` |

Verified end to end: an English-only article is excluded from the Albanian
sitemap, carries no `sq` hreflang, and its `/sq/...` URL renders fallback content
with `noindex, follow`.

## SEO

| Criterion | Status | Notes |
| --- | --- | --- |
| Sitemap works | ✅ | Dynamic, with per-language alternates |
| robots.txt works | ✅ | Blocks `/admin` and private APIs, allows assets |
| Search works | ✅ | ⌘K palette across projects, services, industries, articles |
| Redirects work | ✅ | Middleware-applied with a 60s cache; loops rejected on save |
| Structured data | ✅ | ProfessionalService, WebSite, BreadcrumbList, Article, Service, CreativeWork, FAQPage |

FAQ markup is emitted only for genuinely translated Q&A pairs. There is no
`AggregateRating`, review, award or certification markup anywhere.

## Analytics

| Criterion | Status | Notes |
| --- | --- | --- |
| Analytics uses real integrations | ⚙️ | GA4 Data API + Search Console API, server-side |
| Analytics date range works | ✅ | 7 presets + custom, URL-driven, all panels react |
| No fake production analytics | ✅ | Unconnected integrations render an explicit empty state |
| Project analytics | ✅ | First-party views, CTA clicks and outbound clicks, cookie-free |

## Privacy and consent

| Criterion | Status | Notes |
| --- | --- | --- |
| Cookie consent works | ✅ | Necessary / Analytics / Marketing |
| Cookie preferences can be changed later | ✅ | "Cookie Settings" in the footer |
| No full IP storage | ✅ | Only `sha256(ip + daily salt)`, pruned after 24h |

Verified: zero analytics or advertising scripts are present in the HTML before
consent is granted.

---

## Needs real-world input before launch

These are content and credential tasks, not code:

1. **Replace the placeholder imagery.** `public/media` holds generated abstract
   SVG browser frames — deliberately not stock photography. Upload real project
   screenshots via Admin → Media.
2. **Review the seeded case-study copy.** It was written from the brief and
   describes scope, architecture and delivery. Only drh.al knows the specifics of
   each engagement — check it reads true before publishing.
3. **Add real testimonials and project metrics** as they are collected.
4. **Have the legal pages reviewed by a lawyer.** They accurately describe what
   this application does, which is the hard part, but they are not legal advice.
5. **Connect GA4 and Search Console**, then confirm both read "Connected" on
   Admin → Integrations — that card runs a live API probe, not just an env check.
6. **Set `NEXT_PUBLIC_SITE_URL`** to `https://drh.al` so canonicals, hreflang,
   the sitemap and email links resolve correctly.

## Deliberately not built

| Item | Reasoning |
| --- | --- |
| Client portal (`/client`) | The brief said prepare for it, not build it. Admin routes are namespaced so it can be added alongside them. |
| Proposal system | Same. `leads` already carries `estimated_value`, `won_value` and a pipeline ending in `won` — the natural join point. |
| Automatic image re-encoding on upload | Next.js serves AVIF/WebP at per-device sizes on delivery, which achieves the stated goal without a `sharp` dependency in the upload path. Uploads are still type- and size-validated. |

---

## Verification commands

```bash
npm run typecheck     # clean
npx eslint src scripts # clean
npm run build         # 85 static pages, no warnings
```

Last verified against a clean `.next` build: 85 pages prerendered, all 33 public
routes returning 200, `/admin` correctly redirecting to `/admin/login`.

---

## Automated verification

Two scripts re-run these checks at any time:

```bash
npm run verify:db         # schema, seeded content, RLS, storage buckets
npm run security:check    # full security + production readiness probe
```

`security:check` probes the running app and the live Supabase project the way an
attacker would — with the anon key, with no session, and against the built client
bundles. It asserts what should be *impossible*, not only what works:

- every private table unreadable and unwritable by `anon` (15 probes)
- no secret present in any client chunk
- every admin route and admin API rejecting an anonymous caller
- security headers, `X-Robots-Tag: noindex` on admin
- rate limiting actually engaging under a burst
- `lead-attachments` private and unlistable
- sitemap free of admin URLs, robots blocking `/admin`
- which production credentials are still missing

Last run: **45 passed, 0 failures**, 7 configuration items outstanding (all
credentials to be supplied).
