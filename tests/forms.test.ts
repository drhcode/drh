import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { leadFormSchema } from '../src/lib/leads/schema';
import { LEAD_STEPS, parsePrefill } from '../src/lib/leads/prefill';
import {
  auditRequestSchema,
  callRequestSchema,
  isRequestableDate,
  normaliseSiteUrl,
} from '../src/lib/leads/requests';

/**
 * Form validation. The contact form kept its schema through the redesign; these
 * tests pin that, check the three steps validate every required field between
 * them, and cover the two new request forms (call, audit).
 */

const validLead = {
  name: 'Ana Hoxha',
  email: 'ana@example.al',
  service: 'web_design_development',
  budget: '5k_15k',
  timeline: '1_2_months',
  message: 'We need a bilingual site for our clinic with online booking.',
  privacy: true,
};

describe('contact form schema', () => {
  test('accepts a complete brief', () => {
    assert.equal(leadFormSchema.safeParse(validLead).success, true);
  });

  test('rejects the documented failure cases with message keys', () => {
    const cases: [Record<string, unknown>, string, string][] = [
      [{ name: 'A' }, 'name', 'nameTooShort'],
      [{ email: 'not-an-email' }, 'email', 'emailInvalid'],
      [{ service: 'logo_design' }, 'service', 'serviceRequired'],
      [{ budget: '1m' }, 'budget', 'budgetRequired'],
      [{ message: 'too short' }, 'message', 'messageTooShort'],
      [{ message: 'x'.repeat(1201) }, 'message', 'messageTooLong'],
      [{ privacy: false }, 'privacy', 'privacyRequired'],
      [{ website: 'not a url' }, 'website', 'urlInvalid'],
    ];
    for (const [override, field, key] of cases) {
      const result = leadFormSchema.safeParse({ ...validLead, ...override });
      assert.equal(result.success, false, `${field} should fail`);
      const issue = result.error!.issues.find((i) => i.path[0] === field);
      assert.equal(issue?.message, key);
    }
  });

  test('the three steps cover every required field between them', () => {
    const covered = new Set<string>(LEAD_STEPS.flat());
    for (const field of ['service', 'budget', 'timeline', 'name', 'email', 'message', 'privacy']) {
      assert.ok(covered.has(field), `${field} is not validated by any step`);
    }
  });
});

describe('contact form pre-fill', () => {
  test('reads option ids and service page slugs', () => {
    assert.deepEqual(parsePrefill('?service=mobile_app&budget=15k_30k'), { service: 'mobile_app', budget: '15k_30k' });
    assert.deepEqual(parsePrefill('?service=web-app-development'), { service: 'custom_web_application' });
  });

  test('ignores unknown values and caps the brief', () => {
    const prefill = parsePrefill(`?service=hacking&budget=free&brief=${'a'.repeat(5000)}`);
    assert.equal(prefill.service, undefined);
    assert.equal(prefill.budget, undefined);
    assert.equal(prefill.message?.length, 1200);
  });

  test('the estimator brief survives the round trip', () => {
    const brief = 'Estimate from the drh.al price estimator:\n• Project: Online store';
    const url = `?${new URLSearchParams({ service: 'web_design_development', budget: '15k_30k', brief })}`;
    assert.equal(parsePrefill(url).message, brief);
  });
});

describe('call request', () => {
  // Monday 16 November 2026, 10:00 in Tirana.
  const now = new Date('2026-11-16T09:00:00Z');

  test('weekdays from tomorrow to 60 days ahead are requestable', () => {
    assert.equal(isRequestableDate('2026-11-17', now), true);
    assert.equal(isRequestableDate('2027-01-15', now), true);
  });

  test('today, weekends, the past, far future and malformed dates are not', () => {
    assert.equal(isRequestableDate('2026-11-16', now), false);
    assert.equal(isRequestableDate('2026-11-21', now), false); // Saturday
    assert.equal(isRequestableDate('2026-11-22', now), false); // Sunday
    assert.equal(isRequestableDate('2026-10-01', now), false);
    assert.equal(isRequestableDate('2027-03-01', now), false);
    assert.equal(isRequestableDate('2026-02-30', now), false);
    assert.equal(isRequestableDate('17/11/2026', now), false);
  });

  test('schema rejects an unknown time slot', () => {
    const result = callRequestSchema.safeParse({ name: 'Ana', email: 'ana@example.al', date: '2099-01-05', time: '03:00' });
    assert.equal(result.success, false);
    const fields = result.error!.issues.map((i) => i.path[0]);
    assert.ok(fields.includes('time'));
    assert.ok(fields.includes('date'));
  });
});

describe('audit request', () => {
  test('normalises bare domains to https', () => {
    assert.equal(normaliseSiteUrl('example.al'), 'https://example.al/');
    assert.equal(normaliseSiteUrl('  www.example.com/page '), 'https://www.example.com/page');
    assert.equal(normaliseSiteUrl('http://example.it'), 'http://example.it/');
  });

  test('rejects things that are not public web addresses', () => {
    for (const bad of ['', 'localhost', 'javascript:alert(1)', 'ftp://example.com', 'exa mple.com', 'https://user:pw@example.com', 'http://127.0.0.1']) {
      assert.equal(normaliseSiteUrl(bad), null, bad);
    }
  });

  test('schema validates url and email and defaults the locale', () => {
    const ok = auditRequestSchema.safeParse({ url: 'drh.al', email: 'a@b.al' });
    assert.equal(ok.success, true);
    assert.equal(ok.data?.url, 'https://drh.al/');
    assert.equal(ok.data?.locale, 'en');

    const bad = auditRequestSchema.safeParse({ url: 'nope', email: 'nope' });
    assert.equal(bad.success, false);
    assert.deepEqual(bad.error!.issues.map((i) => i.path[0]).sort(), ['email', 'url']);
  });
});
