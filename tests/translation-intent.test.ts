import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { translationIntent } from '../src/lib/admin/translations';

/**
 * Regression cover for the bilingual data-loss bug.
 *
 * Saving a project from the Albanian tab used to delete the English
 * translation. Radix unmounts an inactive tab panel, so `title_en` was never
 * submitted, and the action read a missing field as "the editor removed this
 * translation". The distinction these tests pin down is the one that was
 * missing: a field that was never sent is not the same as a field sent empty.
 */

describe('translationIntent', () => {
  test('a language absent from the submission is never destructive', () => {
    const form = new FormData();
    form.set('title_sq', 'Projekt i ri');

    assert.equal(translationIntent(form, 'sq'), 'write');
    assert.equal(
      translationIntent(form, 'en'),
      'absent',
      'English was not submitted, so it must not be treated as cleared',
    );
  });

  test('an explicitly emptied title clears the translation', () => {
    const form = new FormData();
    form.set('title_en', '');

    assert.equal(translationIntent(form, 'en'), 'clear');
  });

  test('a whitespace-only title counts as cleared, not written', () => {
    const form = new FormData();
    form.set('title_en', '   \t  ');

    assert.equal(translationIntent(form, 'en'), 'clear');
  });

  test('a filled title is written, and surrounding whitespace does not matter', () => {
    const form = new FormData();
    form.set('title_en', '  Rebuilding the ERSK storefront  ');

    assert.equal(translationIntent(form, 'en'), 'write');
  });

  test('both languages present are both written — the fixed tab behaviour', () => {
    // With both panels force-mounted, this is what the browser now submits
    // regardless of which tab the editor happened to have open.
    const form = new FormData();
    form.set('title_en', 'Case study');
    form.set('title_sq', 'Studim rasti');

    assert.equal(translationIntent(form, 'en'), 'write');
    assert.equal(translationIntent(form, 'sq'), 'write');
  });

  test('an empty form touches nothing', () => {
    const form = new FormData();

    assert.equal(translationIntent(form, 'en'), 'absent');
    assert.equal(translationIntent(form, 'sq'), 'absent');
  });

  test('a custom title field is honoured', () => {
    const form = new FormData();
    form.set('name_en', 'Fintech');

    assert.equal(translationIntent(form, 'en', 'name_en'), 'write');
    assert.equal(translationIntent(form, 'en'), 'absent');
  });

  test('a non-string value (a file input) is treated as no title', () => {
    const form = new FormData();
    form.set('title_en', new Blob(['x']), 'cover.png');

    assert.equal(
      translationIntent(form, 'en'),
      'clear',
      'a File has no usable title text, but it was submitted, so it is a clear',
    );
  });
});
