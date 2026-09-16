import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { parseValue } from '../src/components/site/project-results';

/**
 * Result metrics are free text entered in the CMS — "+45%", "2.1s", "€12k",
 * "3×". The count-up animation has to take them apart and put them back
 * together without changing how they read, so these pin down the round trip.
 */

describe('parseValue', () => {
  test('separates a leading plus sign from the number', () => {
    const parsed = parseValue('+45%');
    assert.equal(parsed.sign, '+');
    assert.equal(parsed.prefix, '');
    assert.equal(parsed.number, 45);
    assert.equal(parsed.suffix, '%');
    assert.equal(parsed.decimals, 0);
  });

  test('reads a negative value and keeps the sign addressable', () => {
    const parsed = parseValue('-12%');
    assert.equal(parsed.sign, '-');
    assert.equal(parsed.number, -12);
    assert.equal(parsed.suffix, '%');
  });

  test('the sign round-trips so "+45%" never renders as a flat "45%"', () => {
    const parsed = parseValue('+45%');
    const rebuilt = `${parsed.prefix}${parsed.sign}${Math.abs(parsed.number!)}${parsed.suffix}`;
    assert.equal(rebuilt, '+45%');
  });

  test('an unsigned value gains no sign', () => {
    assert.equal(parseValue('1,200').sign, '');
    assert.equal(parseValue('2.1s').sign, '');
  });

  test('preserves decimal places so the count-up formats identically', () => {
    const parsed = parseValue('2.1s');
    assert.equal(parsed.number, 2.1);
    assert.equal(parsed.suffix, 's');
    assert.equal(parsed.decimals, 1);
  });

  test('keeps a currency prefix and a unit suffix together', () => {
    const parsed = parseValue('€12k');
    assert.equal(parsed.prefix, '€');
    assert.equal(parsed.number, 12);
    assert.equal(parsed.suffix, 'k');
  });

  test('detects grouped thousands and strips them for the maths', () => {
    const parsed = parseValue('1,200');
    assert.equal(parsed.number, 1200);
    assert.equal(parsed.grouped, true);
  });

  test('handles a multiplier suffix', () => {
    const parsed = parseValue('3×');
    assert.equal(parsed.number, 3);
    assert.equal(parsed.suffix, '×');
  });

  test('leaves a value with no number alone rather than inventing one', () => {
    const parsed = parseValue('Faster');
    assert.equal(parsed.number, null, 'nothing to count up to');
    assert.equal(parsed.prefix, 'Faster');
  });

  test('zero is a real value, not a missing one', () => {
    const parsed = parseValue('0%');
    assert.equal(parsed.number, 0);
    assert.notEqual(parsed.number, null);
  });

  test('a percentage above 100 still parses to its true figure', () => {
    // The arc is capped for display, but the number itself must not be.
    const parsed = parseValue('150%');
    assert.equal(parsed.number, 150);
  });

  test('an empty string does not throw', () => {
    const parsed = parseValue('');
    assert.equal(parsed.number, null);
  });
});
