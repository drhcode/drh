import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  THEME_STORAGE_KEY,
  applyTheme,
  currentTheme,
  persistTheme,
  readThemeCookie,
  resolveTheme,
  themeCookieValue,
  themeScript,
} from '../src/lib/theme';

/**
 * Theme preference: an explicit choice always wins and is remembered in both
 * localStorage and a cookie; without one, the OS setting decides on the first
 * visit; dark is the fallback.
 */

describe('resolveTheme', () => {
  test('first visit follows the OS preference', () => {
    assert.equal(resolveTheme({ prefersLight: true }), 'light');
    assert.equal(resolveTheme({ prefersLight: false }), 'dark');
  });

  test('dark when nothing is known', () => {
    assert.equal(resolveTheme({}), 'dark');
  });

  test('a stored choice beats the OS preference', () => {
    assert.equal(resolveTheme({ stored: 'dark', prefersLight: true }), 'dark');
    assert.equal(resolveTheme({ stored: 'light', prefersLight: false }), 'light');
  });

  test('the cookie is used when localStorage is empty or unavailable', () => {
    assert.equal(resolveTheme({ stored: null, cookie: 'light', prefersLight: false }), 'light');
  });

  test('garbage values are ignored', () => {
    assert.equal(resolveTheme({ stored: 'purple', cookie: '1', prefersLight: true }), 'light');
  });
});

describe('persistence', () => {
  test('writes both localStorage and the cookie', () => {
    const store = new Map<string, string>();
    let cookie = '';
    persistTheme('light', { setItem: (k, v) => store.set(k, v) }, (value) => (cookie = value));
    assert.equal(store.get(THEME_STORAGE_KEY), 'light');
    assert.match(cookie, /^drh-theme=light;/);
    assert.match(cookie, /path=\//);
    assert.match(cookie, /max-age=\d+/);
  });

  test('a storage failure does not stop the cookie being written', () => {
    let cookie = '';
    persistTheme(
      'dark',
      {
        setItem: () => {
          throw new Error('QuotaExceeded');
        },
      },
      (value) => (cookie = value),
    );
    assert.match(cookie, /drh-theme=dark/);
  });

  test('round-trips through the cookie string', () => {
    const header = `other=1; ${themeCookieValue('light').split(';')[0]}; another=2`;
    assert.equal(readThemeCookie(header), 'light');
    assert.equal(readThemeCookie('nothing=here'), null);
    assert.equal(readThemeCookie(null), null);
  });
});

describe('applying a theme', () => {
  function fakeRoot() {
    const classes = new Set<string>();
    return {
      classList: {
        toggle: (name: string, force: boolean) => (force ? classes.add(name) : classes.delete(name)),
        contains: (name: string) => classes.has(name),
      },
      style: { colorScheme: '' },
      classes,
    };
  }

  test('sets the public and admin classes together', () => {
    const root = fakeRoot();
    applyTheme(root as unknown as HTMLElement, 'light');
    assert.deepEqual([...root.classes].sort(), ['t-light']);
    assert.equal(root.style.colorScheme, 'light');
    assert.equal(currentTheme(root as unknown as HTMLElement), 'light');

    applyTheme(root as unknown as HTMLElement, 'dark');
    assert.deepEqual([...root.classes].sort(), ['dark', 't-dark']);
    assert.equal(currentTheme(root as unknown as HTMLElement), 'dark');
  });

  test('the pre-paint script reads the same storage key and cookie', () => {
    assert.ok(themeScript.includes(`localStorage.getItem('${THEME_STORAGE_KEY}')`));
    assert.ok(themeScript.includes('drh-theme='));
    assert.ok(themeScript.includes('prefers-color-scheme: light'));
  });
});
