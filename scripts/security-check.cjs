/**
 * Production readiness and security probe.
 *
 *   node scripts/security-check.cjs [baseUrl]
 *
 * Probes the running application and the live Supabase project the way an
 * attacker would: with the anon key, with no session, and against the built
 * client bundles. It asserts what should be impossible, not just what works.
 */
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const BASE = process.argv[2] || 'http://localhost:3400';

function loadEnv() {
  const file = path.join(root, '.env.local');
  if (!fs.existsSync(file)) return {};
  const env = {};
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

const env = loadEnv();
const SB = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;

const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

let pass = 0;
let fail = 0;
let warn = 0;

function ok(label, detail) {
  pass += 1;
  console.log(`  ${green('✓')} ${label}${detail ? dim(`  ${detail}`) : ''}`);
}
function bad(label, detail) {
  fail += 1;
  console.log(`  ${red('✗')} ${label}${detail ? `  ${detail}` : ''}`);
}
function caution(label, detail) {
  warn += 1;
  console.log(`  ${yellow('!')} ${label}${detail ? dim(`  ${detail}`) : ''}`);
}
function section(title) {
  console.log(`\n${title}`);
}

const anonHeaders = { apikey: ANON, Authorization: `Bearer ${ANON}` };

/** Can an anonymous caller read this table at all? */
async function anonRead(table) {
  const r = await fetch(`${SB}/rest/v1/${table}?select=*&limit=1`, {
    headers: anonHeaders,
    cache: 'no-store',
  });
  const body = await r.text();
  let rows = [];
  try {
    rows = JSON.parse(body);
  } catch {
    rows = [];
  }
  return { status: r.status, count: Array.isArray(rows) ? rows.length : 0 };
}

/** Can an anonymous caller write to this table? */
async function anonWrite(table, payload) {
  const r = await fetch(`${SB}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...anonHeaders, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  return r.status;
}

(async () => {
  console.log(`\nProbing ${BASE} and ${SB}`);

  // ── 1. Row level security: reads ─────────────────────────────────────────
  section('Row level security — anonymous reads');

  const mustBeHidden = [
    'leads', 'lead_notes', 'lead_activity', 'admin_users',
    'activity_logs', 'admin_notifications', 'page_events',
    'newsletter_subscribers', 'rate_limits',
  ];

  for (const table of mustBeHidden) {
    const { status, count } = await anonRead(table);
    // Either the request is rejected, or RLS returns an empty set. Both fine.
    if (status >= 400 || count === 0) ok(`${table} not readable`, `HTTP ${status}`);
    else bad(`${table} IS READABLE by anon`, `${count} row(s) returned`);
  }

  const mustBeReadable = ['services', 'projects', 'blog_posts', 'site_settings'];
  for (const table of mustBeReadable) {
    const { status, count } = await anonRead(table);
    if (status < 400 && count > 0) ok(`${table} readable (public content)`);
    else caution(`${table} returned nothing to anon`, `HTTP ${status}`);
  }

  // ── 2. Row level security: writes ────────────────────────────────────────
  section('Row level security — anonymous writes');

  const writeProbes = [
    ['leads', { name: 'RLS probe', email: 'rls-probe@example.com' }],
    ['newsletter_subscribers', { email: 'rls-probe@example.com' }],
    ['projects', { slug: `rls-probe-${Date.now()}`, client_name: 'RLS probe' }],
    ['site_settings', { key: `rls-probe-${Date.now()}`, value: {} }],
    ['admin_users', { id: '00000000-0000-4000-8000-000000000000', email: 'x@example.com' }],
    ['page_events', { event_name: 'rls_probe' }],
  ];

  for (const [table, payload] of writeProbes) {
    const status = await anonWrite(table, payload);
    if (status >= 400) ok(`${table} write blocked`, `HTTP ${status}`);
    else bad(`${table} ACCEPTED an anonymous write`, `HTTP ${status}`);
  }

  // ── 3. Secrets must not reach the browser ────────────────────────────────
  section('Secret exposure in client bundles');

  const chunkDir = path.join(root, '.next/static/chunks');
  const secrets = [
    ['SUPABASE_SERVICE_ROLE_KEY', SERVICE],
    ['GOOGLE_PRIVATE_KEY', env.GOOGLE_PRIVATE_KEY],
    ['RESEND_API_KEY', env.RESEND_API_KEY],
    ['TURNSTILE_SECRET_KEY', env.TURNSTILE_SECRET_KEY],
  ].filter(([, value]) => value && value.length > 8);

  function walk(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(full) : [full];
    });
  }

  const bundles = walk(chunkDir).filter((f) => f.endsWith('.js'));
  if (bundles.length === 0) {
    caution('no client bundles found', 'run `next build` first');
  } else {
    for (const [name, value] of secrets) {
      const leaked = bundles.filter((file) => fs.readFileSync(file, 'utf8').includes(value));
      if (leaked.length === 0) ok(`${name} absent from ${bundles.length} client chunks`);
      else bad(`${name} LEAKED into the browser bundle`, leaked.join(', '));
    }
    if (secrets.length === 0) caution('no secrets configured to test against');
  }

  // ── 4. Admin access control ──────────────────────────────────────────────
  section('Admin access control (no session)');

  const adminRoutes = ['/admin', '/admin/leads', '/admin/settings', '/admin/users', '/admin/analytics'];
  for (const route of adminRoutes) {
    const r = await fetch(BASE + route, { redirect: 'manual', cache: 'no-store' });
    const location = r.headers.get('location') ?? '';
    if (r.status >= 300 && r.status < 400 && location.includes('/admin/login')) {
      ok(`${route} redirects to login`, `HTTP ${r.status}`);
    } else {
      bad(`${route} did NOT redirect`, `HTTP ${r.status} ${location}`);
    }
  }

  // Admin APIs must reject unauthenticated callers outright.
  for (const route of ['/admin/api/search?q=test', '/admin/api/realtime']) {
    const r = await fetch(BASE + route, { redirect: 'manual', cache: 'no-store' });
    if (r.status === 401 || (r.status >= 300 && r.status < 400)) {
      ok(`${route.split('?')[0]} rejects anonymous`, `HTTP ${r.status}`);
    } else {
      bad(`${route.split('?')[0]} responded to anonymous`, `HTTP ${r.status}`);
    }
  }

  // ── 5. Security headers ──────────────────────────────────────────────────
  section('HTTP security headers');

  const home = await fetch(BASE + '/', { cache: 'no-store' });
  const expected = {
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'x-frame-options': 'SAMEORIGIN',
    'strict-transport-security': null,
    'permissions-policy': null,
  };
  for (const [header, value] of Object.entries(expected)) {
    const actual = home.headers.get(header);
    if (!actual) bad(`${header} missing`);
    else if (value && actual.toLowerCase() !== value.toLowerCase()) {
      caution(`${header} unexpected`, actual);
    } else ok(header, actual.slice(0, 52));
  }

  const adminRobots = await fetch(BASE + '/admin/login', { cache: 'no-store' });
  const tag = adminRobots.headers.get('x-robots-tag') ?? '';
  if (tag.includes('noindex')) ok('admin sends X-Robots-Tag: noindex');
  else bad('admin is missing X-Robots-Tag: noindex', tag || '(none)');

  // ── 6. Spam and abuse controls ───────────────────────────────────────────
  section('Spam and abuse controls');

  const newsletterBurst = [];
  for (let i = 0; i < 8; i += 1) {
    const r = await fetch(BASE + '/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `burst-${i}-${Date.now()}@example.com` }),
      cache: 'no-store',
    });
    newsletterBurst.push(r.status);
  }
  if (newsletterBurst.includes(429)) {
    ok('newsletter rate limit engaged', `statuses ${newsletterBurst.join(',')}`);
  } else {
    caution('newsletter rate limit not observed', `statuses ${newsletterBurst.join(',')}`);
  }

  const badEmail = await fetch(BASE + '/api/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'definitely-not-an-email' }),
    cache: 'no-store',
  });
  if (badEmail.status === 400) ok('newsletter rejects malformed email');
  else bad('newsletter accepted a malformed email', `HTTP ${badEmail.status}`);

  const badEvent = await fetch(BASE + '/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nope: true }),
    cache: 'no-store',
  });
  if (badEvent.status === 400) ok('events endpoint validates its payload');
  else caution('events endpoint accepted an unknown payload', `HTTP ${badEvent.status}`);

  // ── 7. Storage ───────────────────────────────────────────────────────────
  section('Storage buckets');

  const buckets = await fetch(`${SB}/storage/v1/bucket`, {
    headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` },
    cache: 'no-store',
  });
  if (buckets.ok) {
    for (const bucket of await buckets.json()) {
      if (bucket.id === 'lead-attachments') {
        if (bucket.public) bad('lead-attachments is PUBLIC', 'client documents are exposed');
        else ok('lead-attachments is private');
      }
      if (bucket.id === 'media') {
        if (bucket.public) ok('media is public', 'expected for site imagery');
        else caution('media is private', 'site images may not load');
      }
    }
  } else {
    bad('could not list storage buckets', `HTTP ${buckets.status}`);
  }

  const anonList = await fetch(`${SB}/storage/v1/object/list/lead-attachments`, {
    method: 'POST',
    headers: { ...anonHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix: '', limit: 5 }),
    cache: 'no-store',
  });
  const listed = anonList.ok ? await anonList.json() : [];
  if (!anonList.ok || (Array.isArray(listed) && listed.length === 0)) {
    ok('anon cannot list lead attachments', `HTTP ${anonList.status}`);
  } else {
    bad('anon CAN list lead attachments', `${listed.length} object(s)`);
  }

  // ── 8. Public surface sanity ─────────────────────────────────────────────
  section('Public surface');

  const robots = await fetch(BASE + '/robots.txt', { cache: 'no-store' });
  const robotsText = await robots.text();
  if (robotsText.includes('Disallow: /admin')) ok('robots.txt blocks /admin');
  else bad('robots.txt does not block /admin');

  const sitemap = await fetch(BASE + '/sitemap.xml', { cache: 'no-store' });
  const sitemapText = await sitemap.text();
  const locs = (sitemapText.match(/<loc>/g) || []).length;
  if (locs > 0) ok(`sitemap has ${locs} URLs`);
  else bad('sitemap is empty');
  if (sitemapText.includes('/admin')) bad('sitemap exposes admin URLs');
  else ok('sitemap contains no admin URLs');

  const notFound = await fetch(BASE + '/definitely-not-a-page', { cache: 'no-store' });
  if (notFound.status === 404) ok('unknown route returns 404');
  else bad('unknown route did not 404', `HTTP ${notFound.status}`);

  // ── 9. Production configuration ──────────────────────────────────────────
  section('Production configuration');

  const required = {
    NEXT_PUBLIC_SITE_URL: 'canonical URLs, sitemap, email links',
    RESEND_API_KEY: 'lead notification + confirmation email',
    TURNSTILE_SECRET_KEY: 'form bot protection',
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'form bot protection',
    NEXT_PUBLIC_GA4_MEASUREMENT_ID: 'client analytics',
    GA4_PROPERTY_ID: 'dashboard traffic + realtime',
    GOOGLE_SERVICE_ACCOUNT_EMAIL: 'GA4 and Search Console reporting',
    GOOGLE_PRIVATE_KEY: 'GA4 and Search Console reporting',
    GSC_SITE_URL: 'Search Console reporting',
  };
  for (const [key, why] of Object.entries(required)) {
    if (env[key]) ok(`${key} set`);
    else caution(`${key} not set`, why);
  }

  if (env.NEXT_PUBLIC_SITE_URL && env.NEXT_PUBLIC_SITE_URL.includes('localhost')) {
    caution('NEXT_PUBLIC_SITE_URL still points at localhost', env.NEXT_PUBLIC_SITE_URL);
  }

  console.log(
    `\n${pass} passed · ${warn} to address · ${fail} failed\n` +
      (fail === 0
        ? green('No security failures.\n')
        : red('Security failures above must be fixed before launch.\n')),
  );

  process.exit(fail === 0 ? 0 : 1);
})();
