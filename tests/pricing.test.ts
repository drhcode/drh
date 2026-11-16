import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  PRICING,
  PRICE_TIERS,
  budgetBand,
  complexity,
  estimate,
  formatEuro,
  type EstimateInput,
  type FeatureId,
} from '../src/config/pricing';

/**
 * The estimator is the only place prices appear on the site, so these tests
 * pin the promises made elsewhere: estimates stay inside the ranges published
 * in the FAQ, move in the right direction as scope grows, and hand the contact
 * form a budget band that matches what the visitor saw.
 */

const base: EstimateInput = { type: 'business', pages: 1, languages: ['EN'], features: [], fastTrack: false };
const ALL_FEATURES = PRICING.features.map((f) => f.id) as FeatureId[];

describe('estimate — published ranges', () => {
  for (const type of PRICING.projectTypes) {
    test(`${type.id}: never below the published minimum`, () => {
      const result = estimate({ ...base, type: type.id });
      assert.ok(result.low >= type.min, `${result.low} < ${type.min}`);
    });

    if (type.max !== null) {
      test(`${type.id}: never above the published maximum, even at full scope`, () => {
        const result = estimate({ ...base, type: type.id, pages: 40, languages: [...PRICING.languages], features: ALL_FEATURES });
        assert.ok(result.high !== null && result.high <= type.max, `${result.high} > ${type.max}`);
        assert.ok(result.low < (result.high ?? 0));
      });
    } else {
      test(`${type.id}: open-ended types quote a starting price only`, () => {
        const result = estimate({ ...base, type: type.id });
        assert.equal(result.high, null);
      });
    }
  }

  test('fast-track may exceed the closed range — it is a surcharge on the same scope', () => {
    const standard = estimate({ ...base, pages: 20 });
    const fast = estimate({ ...base, pages: 20, fastTrack: true });
    assert.ok(fast.low >= standard.low);
    assert.ok((fast.high ?? 0) >= (standard.high ?? 0));
  });

  test('the three FAQ tiers match the base ranges', () => {
    assert.deepEqual(
      PRICE_TIERS.map((tier) => [tier.min, tier.max]),
      [
        [2000, 5000],
        [5000, 15000],
        [15000, null],
      ],
    );
  });
});

describe('estimate — direction', () => {
  test('more pages never lowers the estimate', () => {
    let previous = 0;
    for (let pages = 1; pages <= 40; pages += 1) {
      const { low } = estimate({ ...base, type: 'corporate', pages });
      assert.ok(low >= previous, `pages=${pages}: ${low} < ${previous}`);
      previous = low;
    }
  });

  test('each extra language and feature raises complexity', () => {
    assert.ok(complexity({ pages: 1, languages: ['EN', 'SQ'], features: [] }) > complexity({ pages: 1, languages: ['EN'], features: [] }));
    assert.ok(complexity({ pages: 1, languages: ['EN'], features: ['cms'] }) > complexity({ pages: 1, languages: ['EN'], features: [] }));
  });

  test('complexity is capped at 1 and clamps the page count', () => {
    assert.equal(complexity({ pages: 400, languages: [...PRICING.languages], features: ALL_FEATURES }), 1);
    assert.equal(complexity({ pages: -5, languages: [], features: [] }), 0);
  });

  test('results are rounded to the configured step', () => {
    for (const pages of [1, 7, 13, 29, 40]) {
      const { low, high } = estimate({ ...base, type: 'corporate', pages, features: ['cms', 'seo'] });
      assert.equal(low % PRICING.roundTo, 0);
      assert.equal((high ?? 0) % PRICING.roundTo, 0);
    }
  });

  test('the price bar stays inside 0–100%', () => {
    for (const type of PRICING.projectTypes) {
      const { bar } = estimate({ ...base, type: type.id, pages: 40, languages: [...PRICING.languages], features: ALL_FEATURES, fastTrack: true });
      assert.ok(bar.left >= 0 && bar.left <= 100);
      assert.ok(bar.left + bar.width <= 100 + 3);
    }
  });
});

describe('hand-off to the contact form', () => {
  test('budget bands follow the contact form options', () => {
    assert.equal(budgetBand(1500, 1900), 'under_2k');
    assert.equal(budgetBand(2000, 4500), '2k_5k');
    assert.equal(budgetBand(6000, 12000), '5k_15k');
    assert.equal(budgetBand(17500, null), '15k_30k');
    assert.equal(budgetBand(34000, null), '30k_plus');
  });

  test('project types map to real contact-form services', () => {
    assert.equal(estimate({ ...base, type: 'webapp' }).service, 'custom_web_application');
    assert.equal(estimate({ ...base, type: 'mobile' }).service, 'mobile_app');
    assert.equal(estimate({ ...base, type: 'business' }).service, 'web_design_development');
  });

  test('formatEuro', () => {
    assert.equal(formatEuro(800), '€800');
    assert.equal(formatEuro(2000), '€2k');
    assert.equal(formatEuro(12500), '€12.5k');
  });
});
