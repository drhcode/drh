/**
 * Lists every message key that is not translated yet, per locale.
 * Untranslated keys render in English (see src/i18n/request.ts).
 *
 *   npm run i18n:missing            # summary per namespace
 *   npm run i18n:missing -- --keys  # every key
 */
import fs from 'node:fs';
import path from 'node:path';
import { missingKeys, type Messages } from '../src/i18n/messages';

const load = (locale: string) =>
  JSON.parse(fs.readFileSync(path.join(process.cwd(), 'messages', `${locale}.json`), 'utf8')) as Messages;

const en = load('en');
const showKeys = process.argv.includes('--keys');

for (const locale of ['sq', 'it']) {
  const missing = missingKeys(en, load(locale));
  console.log(`\n${locale.toUpperCase()}: ${missing.length} untranslated key(s)`);
  const byNamespace = new Map<string, string[]>();
  for (const key of missing) {
    const ns = key.split('.')[0];
    byNamespace.set(ns, [...(byNamespace.get(ns) ?? []), key]);
  }
  for (const [ns, keys] of byNamespace) {
    console.log(`  ${ns.padEnd(14)} ${keys.length}`);
    if (showKeys) for (const key of keys) console.log(`      ${key}`);
  }
}
