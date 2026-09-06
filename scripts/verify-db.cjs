/**
 * Verifies the database setup after applying supabase/apply-all.sql.
 *
 *   npm run verify:db
 *
 * Uses the service role key over PostgREST — no database password needed. It
 * checks that every table exists, that the seeded content actually landed, and
 * that RLS is genuinely blocking anonymous reads of unpublished content.
 */
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function loadEnv() {
  const file = path.join(root, '.env.local');
  if (!fs.existsSync(file)) return {};
  const env = {};
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    env[t.slice(0, i).trim()] = t
      .slice(i + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
  }
  return env;
}

const env = loadEnv();
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!URL || !SERVICE || !ANON) {
  console.error('Missing Supabase environment variables in .env.local.');
  process.exit(1);
}

const TABLES = [
  'admin_users', 'technologies', 'industries', 'industry_translations',
  'services', 'service_translations', 'service_technologies',
  'projects', 'project_translations', 'project_media', 'project_results',
  'project_technologies', 'project_services',
  'blog_categories', 'blog_tags', 'blog_posts', 'blog_translations', 'blog_post_tags',
  'leads', 'lead_notes', 'lead_activity',
  'testimonials', 'faqs', 'pages', 'page_translations', 'media',
  'newsletter_subscribers', 'seo_settings', 'redirects', 'site_settings',
  'integrations', 'activity_logs', 'admin_notifications', 'page_events', 'rate_limits',
];

/**
 * Expected row counts, derived from the generated seed rather than maintained
 * by hand — a hardcoded list drifts the moment the content changes.
 */
function expectedSeedCounts() {
  const file = path.join(root, 'supabase/seed.sql');
  if (!fs.existsSync(file)) return {};

  const counts = {};
  let table = null;

  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const insert = line.match(/^insert into public\.(\w+) \(/);
    if (insert) {
      table = insert[1];
      counts[table] = 0;
      continue;
    }
    if (!table) continue;
    if (line.startsWith('on conflict')) {
      table = null;
      continue;
    }
    // Each value tuple is emitted on its own indented line.
    if (/^\s{2}\(/.test(line)) counts[table] += 1;
  }

  return counts;
}

const SEEDED = expectedSeedCounts();

async function count(table, key) {
  const response = await fetch(`${URL}/rest/v1/${table}?select=*`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: 'count=exact',
      Range: '0-0',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    return { ok: false, status: response.status, message: (await response.text()).slice(0, 120) };
  }

  const range = response.headers.get('content-range') ?? '';
  const total = Number(range.split('/')[1]);
  return { ok: true, count: Number.isFinite(total) ? total : 0 };
}

const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

(async () => {
  let failures = 0;

  console.log('\nTables');
  const missing = [];
  for (const table of TABLES) {
    const result = await count(table, SERVICE);
    if (!result.ok) missing.push(table);
  }
  if (missing.length === 0) {
    console.log(`  ${green('✓')} all ${TABLES.length} tables present`);
  } else {
    failures += 1;
    console.log(`  ${red('✗')} missing: ${missing.join(', ')}`);
  }

  console.log('\nSeeded content');
  for (const [table, expected] of Object.entries(SEEDED)) {
    const result = await count(table, SERVICE);
    if (!result.ok) {
      failures += 1;
      console.log(`  ${red('✗')} ${table.padEnd(24)} ${result.message}`);
      continue;
    }
    const ok = result.count >= expected;
    if (!ok) failures += 1;
    console.log(
      `  ${ok ? green('✓') : red('✗')} ${table.padEnd(24)} ${String(result.count).padStart(3)} ${dim(`(expected ≥ ${expected})`)}`,
    );
  }

  console.log('\nRow level security');

  // Anon must see published content…
  const publicServices = await count('services', ANON);
  const okPublic = publicServices.ok && publicServices.count > 0;
  if (!okPublic) failures += 1;
  console.log(
    `  ${okPublic ? green('✓') : red('✗')} anon can read published services ${dim(`(${publicServices.count ?? '—'})`)}`,
  );

  // …but never leads, which are server-write-only.
  const anonLeads = await count('leads', ANON);
  const leadsBlocked = !anonLeads.ok || anonLeads.count === 0;
  if (!leadsBlocked) failures += 1;
  console.log(
    `  ${leadsBlocked ? green('✓') : red('✗')} anon cannot read leads ${dim(anonLeads.ok ? `(returned ${anonLeads.count})` : '(blocked)')}`,
  );

  // …and never admin_users.
  const anonUsers = await count('admin_users', ANON);
  const usersBlocked = !anonUsers.ok || anonUsers.count === 0;
  if (!usersBlocked) failures += 1;
  console.log(
    `  ${usersBlocked ? green('✓') : red('✗')} anon cannot read admin_users ${dim(anonUsers.ok ? `(returned ${anonUsers.count})` : '(blocked)')}`,
  );

  console.log('\nStorage');
  const buckets = await fetch(`${URL}/storage/v1/bucket`, {
    headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` },
    cache: 'no-store',
  });
  if (buckets.ok) {
    const list = await buckets.json();
    const names = list.map((b) => b.id);
    for (const wanted of ['media', 'lead-attachments']) {
      const found = names.includes(wanted);
      if (!found) failures += 1;
      console.log(`  ${found ? green('✓') : red('✗')} bucket "${wanted}"`);
    }
  } else {
    failures += 1;
    console.log(`  ${red('✗')} could not list buckets (HTTP ${buckets.status})`);
  }

  console.log(
    failures === 0
      ? `\n${green('Database is ready.')} Next: npm run bootstrap:admin -- you@drh.al "Your Name"\n`
      : `\n${red(`${failures} check(s) failed.`)} Re-run supabase/apply-all.sql, then this script again.\n`,
  );

  process.exit(failures === 0 ? 0 : 1);
})();
