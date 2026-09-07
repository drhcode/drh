#!/usr/bin/env node
/**
 * Build-time environment preflight.
 *
 * This exists because of one specific production incident: NEXT_PUBLIC_SITE_URL
 * was never set on the server, so `src/lib/env.ts` fell back to
 * http://localhost:3000. The site kept working, which is exactly what made it
 * dangerous — every canonical tag, the sitemap and robots.txt pointed at
 * localhost, and Google will not index a page whose canonical names an
 * unreachable host.
 *
 * A silent fallback is the wrong behaviour for a value that decides whether the
 * site can be indexed at all, so an unset NEXT_PUBLIC_SITE_URL now fails the
 * build. Setting it explicitly to a localhost URL is still allowed — that is a
 * deliberate choice rather than an omission, which is the distinction that
 * matters here.
 *
 * Everything else only warns: a missing analytics key degrades one panel, it
 * does not corrupt what search engines see.
 */

const fs = require('node:fs');
const path = require('node:path');

/**
 * Next reads .env files itself during `next build`, but this runs first as a
 * `prebuild` step, so it has to repeat that lookup.
 *
 * Real environment variables always win. On a host that injects them directly
 * (hPanel, a systemd unit, a container) there may be no .env file at all, and
 * that is a valid setup rather than something to warn about.
 */
function parseEnvFile(text) {
  const values = {};
  const lines = text.split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const separator = line.indexOf('=');
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim().replace(/^export\s+/, '');
    if (!key) continue;

    let raw = line.slice(separator + 1).trim();
    const quote = raw[0] === '"' || raw[0] === "'" ? raw[0] : null;

    if (quote) {
      // A quoted value may run across several lines — GOOGLE_PRIVATE_KEY does.
      raw = raw.slice(1);
      while (!raw.endsWith(quote) && i + 1 < lines.length) {
        i += 1;
        raw += `\n${lines[i]}`;
      }
      if (raw.endsWith(quote)) raw = raw.slice(0, -1);
    } else {
      // An unquoted value ends where an inline comment begins.
      const comment = raw.indexOf(' #');
      if (comment !== -1) raw = raw.slice(0, comment).trim();
    }

    values[key] = raw;
  }

  return values;
}

function loadEnvFiles() {
  // Precedence matches Next: a later file overrides an earlier one.
  for (const file of ['.env', '.env.production', '.env.local']) {
    const full = path.join(process.cwd(), file);
    if (!fs.existsSync(full)) continue;

    const values = parseEnvFile(fs.readFileSync(full, 'utf8'));
    for (const [key, value] of Object.entries(values)) {
      // Only fill gaps: a value already in the real environment is authoritative.
      if (process.env[key] === undefined || process.env[key] === '') {
        process.env[key] = value;
      }
    }
  }
}

loadEnvFiles();

const REQUIRED = [
  {
    key: 'NEXT_PUBLIC_SITE_URL',
    why: 'canonical URLs, sitemap.xml, robots.txt and Open Graph all derive from it',
  },
];

const RECOMMENDED = [
  ['NEXT_PUBLIC_SUPABASE_URL', 'site falls back to bundled seed content'],
  ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'site falls back to bundled seed content'],
  ['SUPABASE_SERVICE_ROLE_KEY', 'admin writes and lead capture fail'],
  ['GOOGLE_SITE_VERIFICATION', 'Search Console ownership meta tag is omitted'],
  ['NEXT_PUBLIC_GA4_MEASUREMENT_ID', 'no analytics tag loads'],
  ['GA4_PROPERTY_ID', 'admin traffic panels stay empty'],
  ['GOOGLE_SERVICE_ACCOUNT_EMAIL', 'admin traffic and Search Console panels stay empty'],
  ['GOOGLE_PRIVATE_KEY', 'admin traffic and Search Console panels stay empty'],
  ['NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'contact form has no spam protection'],
  ['TURNSTILE_SECRET_KEY', 'contact form has no spam protection'],
  ['RESEND_API_KEY', 'lead notification emails are not sent'],
];

const value = (key) => {
  const raw = process.env[key];
  const trimmed = typeof raw === 'string' ? raw.trim() : '';
  return trimmed ? trimmed : null;
};

const errors = [];
const warnings = [];

for (const { key, why } of REQUIRED) {
  if (!value(key)) errors.push(`${key} is not set — ${why}.`);
}

const siteUrl = value('NEXT_PUBLIC_SITE_URL');
if (siteUrl) {
  if (!/^https?:\/\//.test(siteUrl)) {
    errors.push(`NEXT_PUBLIC_SITE_URL must start with http:// or https:// (got "${siteUrl}").`);
  }
  if (siteUrl.endsWith('/')) {
    errors.push(
      `NEXT_PUBLIC_SITE_URL must not end with a slash (got "${siteUrl}") — it is joined to paths directly.`,
    );
  }
  if (/localhost|127\.0\.0\.1/.test(siteUrl)) {
    warnings.push(
      `NEXT_PUBLIC_SITE_URL points at ${siteUrl}. Fine for a local production build; never deploy it.`,
    );
  }
}

for (const [key, consequence] of RECOMMENDED) {
  if (!value(key)) warnings.push(`${key} is not set — ${consequence}.`);
}

for (const warning of warnings) console.warn(`  warning  ${warning}`);

if (errors.length > 0) {
  console.error('\n  Build stopped: required environment variables are missing.\n');
  for (const error of errors) console.error(`  error  ${error}`);
  console.error(
    '\n  On the server these live in .env.local, which is gitignored and never deployed.',
  );
  console.error('  See docs/DEPLOYMENT.md.\n');
  process.exit(1);
}

if (warnings.length > 0) console.warn('');
