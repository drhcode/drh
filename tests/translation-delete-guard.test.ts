import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Structural guard against the bilingual data-loss bug coming back.
 *
 * The unit tests cover the decision helper, but the bug was never in a helper —
 * it was in five near-identical copies of a loop that deleted a translation row
 * whenever a title was missing. Adding a sixth content type by copying one of
 * those loops is exactly how this would return, and no unit test would notice.
 *
 * So this asserts the invariant at the source level: any admin action that
 * deletes from a *_translations table must first classify intent, and must only
 * delete on an explicit 'clear'.
 */

const ACTIONS_DIR = path.join(process.cwd(), 'src', 'app', 'admin', 'actions');

function actionFiles(): string[] {
  return fs
    .readdirSync(ACTIONS_DIR)
    .filter((file) => file.endsWith('.ts'))
    .map((file) => path.join(ACTIONS_DIR, file));
}

/** Source with comments stripped, so prose about deleting cannot match. */
function code(file: string): string {
  return fs
    .readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '');
}

describe('translation delete sites', () => {
  const files = actionFiles().map((file) => ({ file, source: code(file) }));

  const deleters = files.filter(({ source }) => /_translations'\)\s*\n?\s*\.delete\(\)/.test(source));

  test('the content types that delete translations are the ones we expect', () => {
    const names = deleters.map(({ file }) => path.basename(file)).sort();

    assert.deepEqual(
      names,
      ['blog.ts', 'content.ts', 'pages.ts', 'projects.ts'],
      'a new file deletes translation rows — make sure it classifies intent first',
    );
  });

  for (const { file, source } of deleters) {
    const name = path.basename(file);

    test(`${name} classifies intent before deleting`, () => {
      assert.match(
        source,
        /translationIntent\(formData/,
        `${name} deletes translation rows without calling translationIntent`,
      );
    });

    test(`${name} skips languages absent from the submission`, () => {
      assert.match(
        source,
        /intent === 'absent'\s*\)\s*continue;/,
        `${name} must leave a language alone when it was not submitted`,
      );
    });

    test(`${name} only deletes on an explicit clear`, () => {
      // Every delete on a *_translations table must sit inside a `clear` branch.
      const deleteCount = (source.match(/_translations'\)\s*\n?\s*\.delete\(\)/g) ?? []).length;
      const clearGuards = (source.match(/intent === 'clear'/g) ?? []).length;

      assert.equal(
        clearGuards,
        deleteCount,
        `${name} has ${deleteCount} translation delete(s) but ${clearGuards} clear guard(s)`,
      );
    });
  }
});

describe('bilingual form panels', () => {
  test('both language panels stay mounted so both are always submitted', () => {
    // Stripped of comments — the explanation above `TabsContent` names
    // `forceMount` too, and prose must not satisfy a structural assertion.
    const source = code(path.join(process.cwd(), 'src', 'components', 'admin', 'form-kit.tsx'));

    const forceMounts = (source.match(/forceMount/g) ?? []).length;
    assert.equal(forceMounts, 2, 'both TabsContent panels must be force-mounted');

    // forceMount alone makes Radix render both panels visible, because it
    // derives `hidden` from the same condition. CSS has to do the hiding, and
    // fields hidden with display:none are still submitted.
    const hidden = (source.match(/data-\[state=inactive\]:hidden/g) ?? []).length;
    assert.equal(hidden, 2, 'both panels must be hidden via CSS, not unmounted');
  });
});
