/**
 * Concatenates the migrations and the seed into one paste-ready file for the
 * Supabase SQL editor.
 *
 *   node scripts/build-setup-sql.cjs
 */
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const files = [
  ['supabase/migrations/0001_schema.sql', 'Migration 0001 — schema'],
  ['supabase/migrations/0002_rls.sql', 'Migration 0002 — row level security'],
  ['supabase/seed.sql', 'Seed — initial content'],
];

let out = `-- ============================================================================
-- drh.al — complete database setup, in order.
--
-- GENERATED. Regenerate with: node scripts/build-setup-sql.cjs
-- Safe to re-run: DDL uses IF NOT EXISTS / DROP IF EXISTS, and every seed
-- statement upserts.
-- ============================================================================

`;

for (const [file, label] of files) {
  out += `\n-- ${'='.repeat(74)}\n-- ${label}\n-- ${'='.repeat(74)}\n\n`;
  out += fs.readFileSync(path.join(root, file), 'utf8').trimEnd() + '\n';
}

fs.writeFileSync(path.join(root, 'supabase/apply-all.sql'), out);
console.log('Wrote supabase/apply-all.sql');
