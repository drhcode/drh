# Deploying drh.al

The site runs as a Node app on Hostinger (hPanel, behind LiteSpeed).

## The one thing that catches everyone

`.env.local` is **gitignored**. It is never pushed and never deployed. Setting a
value on your laptop changes nothing in production.

Worse, variables prefixed `NEXT_PUBLIC_` are **inlined into the JavaScript at
build time**, not read at runtime. So even after you put the value on the
server, restarting the app is not enough — the old value is already baked into
the compiled bundle. You must rebuild.

**The order is: set the variable → `npm run build` → restart.**

Skipping the rebuild is the most common cause of "I set it but nothing changed".

## Symptoms of a missing `NEXT_PUBLIC_SITE_URL`

This one is worth calling out because it fails silently and hurts SEO badly.
`src/lib/env.ts` falls back to `http://localhost:3000`, so the site keeps
working — but every page tells Google it lives on localhost:

- `<link rel="canonical" href="http://localhost:3000">` on every page
- `sitemap.xml` full of `http://localhost:3000/...`
- `robots.txt` pointing `Host:` and `Sitemap:` at localhost
- Open Graph URLs broken, so shared links preview wrong

Google treats a canonical pointing at an unreachable host as a reason not to
index the page at all. Nothing on the site can rank until this is set.

## Production environment file

On the server, in the application root, create `.env.local` containing every
variable from `.env.example` that applies. At minimum:

```
NEXT_PUBLIC_SITE_URL=https://drh.al

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

GOOGLE_SITE_VERIFICATION=...
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-...
```

`NEXT_PUBLIC_SITE_URL` must have **no trailing slash** and must match the
canonical host exactly — `https://drh.al`, not `https://www.drh.al`, unless you
redirect the apex to www instead.

## Deploy sequence

```bash
git pull
npm ci
npm run build
# then restart the Node app from hPanel
```

## Verifying a deploy actually took

Do not trust the admin UI for this — check what the server sends:

```bash
curl -s https://drh.al/robots.txt
curl -s https://drh.al/ | grep -o '<link rel="canonical"[^>]*>'
curl -s https://drh.al/ | grep -c 'google-site-verification'
```

`robots.txt` is the fastest signal: if `Host:` still says localhost, the rebuild
did not happen.

## Which integrations need which variables

| Feature | Variables | Effect when missing |
| --- | --- | --- |
| Canonical URLs, sitemap, robots, OG | `NEXT_PUBLIC_SITE_URL` | Falls back to localhost — pages cannot be indexed |
| Content from the CMS | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Falls back to bundled seed content |
| Admin writes, lead capture | `SUPABASE_SERVICE_ROLE_KEY` | Privileged writes fail |
| Search Console ownership | `GOOGLE_SITE_VERIFICATION` | Meta tag absent, verification fails |
| GA4 page tracking | `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | No tag loads |
| Admin traffic dashboard | `GA4_PROPERTY_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` | Panels show "not connected" rather than invented numbers |
| Contact form spam protection | `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Turnstile widget does not render |
| Transactional email | `RESEND_API_KEY` | Lead notifications are not sent |

## Google tag and consent

`src/components/site/analytics-scripts.tsx` uses **Consent Mode v2 in advanced
mode**: `gtag.js` loads on every page view, but with `ad_storage`,
`ad_user_data`, `ad_personalization` and `analytics_storage` all defaulted to
`denied`. No cookie is set and nothing is stored until the visitor accepts, at
which point a `consent update` is pushed and storage begins.

Two consequences worth knowing:

- Google's "Test your website" and Tag Assistant **will** detect the tag, because
  the script is present regardless of the consent choice.
- GA4 Realtime will show a visit only after cookies are accepted. Before that,
  Google receives cookieless pings it can use for modelling but not for
  identifying a session.

Meta Pixel and Microsoft Clarity have no equivalent consent signal, so they stay
behind a hard gate and do not load at all until consent is given.

If a tag still is not detected after a deploy, check `NEXT_PUBLIC_GA4_MEASUREMENT_ID`
is set **and that the site was rebuilt** — see the top of this document.
