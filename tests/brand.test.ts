import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { DRH_LOGO_HEIGHT, DRH_LOGO_PATH, DRH_LOGO_WIDTH } from '../src/components/brand/drh-logo';

/**
 * The logo path is the single source for the inline SVG, the footer outline,
 * the social cards and the files in public/brand. These tests catch a path
 * that no longer fits its viewBox and exported files that were not
 * regenerated after the path changed (npm run brand:assets).
 */

describe('DRH logo', () => {
  test('four closed outlines: D, its counter, R and H', () => {
    assert.equal(DRH_LOGO_PATH.match(/M/g)?.length, 4);
    assert.equal(DRH_LOGO_PATH.match(/Z/g)?.length, 4);
  });

  test('every point sits inside the viewBox', () => {
    const numbers = DRH_LOGO_PATH.match(/-?\d+(\.\d+)?/g)!.map(Number);
    for (let i = 0; i < numbers.length; i += 2) {
      assert.ok(numbers[i] >= 0 && numbers[i] <= DRH_LOGO_WIDTH, `x=${numbers[i]}`);
      assert.ok(numbers[i + 1] >= 0 && numbers[i + 1] <= DRH_LOGO_HEIGHT, `y=${numbers[i + 1]}`);
    }
  });

  test('public/brand/drh-logo.svg was generated from the current path', () => {
    const svg = fs.readFileSync(path.join(process.cwd(), 'public', 'brand', 'drh-logo.svg'), 'utf8');
    assert.ok(svg.includes(`d="${DRH_LOGO_PATH}"`), 'run npm run brand:assets');
  });

  test('the PNG used by emails and JSON-LD and the fallback social card exist', () => {
    for (const file of ['brand/drh-logo.png', 'og/default.png']) {
      const buffer = fs.readFileSync(path.join(process.cwd(), 'public', file));
      assert.equal(buffer.subarray(1, 4).toString(), 'PNG', file);
    }
  });
});
