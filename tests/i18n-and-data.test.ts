import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { isNamespaceComplete, mergeMessages, messageKeys, missingKeys, type Messages } from '../src/i18n/messages';
import { matchTestimonial } from '../src/lib/data/match';
import type { TestimonialView } from '../src/lib/data/types';

const load = (locale: string) =>
  JSON.parse(fs.readFileSync(path.join(process.cwd(), 'messages', `${locale}.json`), 'utf8')) as Messages;

describe('message catalogues', () => {
  const en = load('en');

  test('Albanian and Italian never contain keys English lacks', () => {
    for (const locale of ['sq', 'it']) {
      const extra = missingKeys(load(locale), en);
      assert.deepEqual(extra, [], `${locale} has keys missing from en: ${extra.join(', ')}`);
    }
  });

  test('every message parses as an ICU string (balanced braces)', () => {
    for (const locale of ['en', 'sq', 'it']) {
      const messages = load(locale);
      for (const key of messageKeys(messages)) {
        const value = key.split('.').reduce<unknown>((node, part) => (node as Messages)[part], messages) as string;
        let depth = 0;
        for (const char of value) {
          if (char === '{') depth += 1;
          if (char === '}') depth -= 1;
          assert.ok(depth >= 0, `${locale}:${key}`);
        }
        assert.equal(depth, 0, `${locale}:${key}`);
      }
    }
  });

  test('missing translations fall back to English, never to a raw key', () => {
    const merged = mergeMessages({ a: { b: 'English', c: 'Also English' } }, { a: { b: 'Shqip' } });
    assert.deepEqual(merged, { a: { b: 'Shqip', c: 'Also English' } });
  });

  test('namespace completeness gates hreflang for code-owned pages', () => {
    const ref: Messages = { pricing: { a: '1', b: '2' }, other: { c: '3' } };
    assert.equal(isNamespaceComplete(ref, { pricing: { a: '1', b: '2' } }, ['pricing']), true);
    assert.equal(isNamespaceComplete(ref, { pricing: { a: '1' } }, ['pricing']), false);
  });
});

describe('testimonial matching', () => {
  const quote = (company: string): TestimonialView => ({
    id: company,
    clientName: company,
    company,
    position: null,
    country: null,
    photoUrl: null,
    logoUrl: null,
    rating: 5,
    quote: '…',
    featured: true,
  });
  const all = [quote('FoxBox'), quote('BIA Empowerment'), quote('Bruno Coffee Store')];

  test('matches on client name, in either direction', () => {
    assert.equal(matchTestimonial({ clientName: 'smsfoxbox.it', testimonial: null }, all)?.id, 'FoxBox');
    assert.equal(matchTestimonial({ clientName: 'BIA', testimonial: null }, all)?.id, 'BIA Empowerment');
    assert.equal(matchTestimonial({ clientName: 'Bruno Coffee Store', testimonial: null }, all)?.id, 'Bruno Coffee Store');
  });

  test('an explicit admin link wins, and unrelated projects get nothing', () => {
    assert.equal(matchTestimonial({ clientName: 'BIA', testimonial: quote('Linked') }, all)?.id, 'Linked');
    assert.equal(matchTestimonial({ clientName: 'Casa Gaçe Hotel', testimonial: null }, all), null);
    assert.equal(matchTestimonial({ clientName: 'AB', testimonial: null }, [quote('ABC Corp')]), null);
  });
});
