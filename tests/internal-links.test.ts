import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Every internal link must point at a route that exists.
 *
 * The admin's "Add testimonial" quick action pointed at /admin/testimonials/new
 * for as long as the admin has existed. That route was never built — a
 * testimonial is edited in place on the list — so the button 404d every time it
 * was clicked, and nothing in the build, the types or the lint rules noticed.
 *
 * Links are data in this codebase (nav-config, quick actions, hrefs), so the
 * only thing that can catch a dead one is a check that walks them against the
 * routes actually on disk.
 */

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

const posix = (p: string) => p.split(path.sep).join('/');

/** Routes, derived from the App Router file tree. */
function routes(): string[] {
  const found: string[] = [];
  for (const file of walk(path.join(process.cwd(), 'src', 'app'))) {
    const url = posix(file);
    if (!/\/(page|route)\.tsx?$/.test(url)) continue;
    let route = url.slice(url.indexOf('/src/app') + '/src/app'.length).replace(/\/(page|route)\.tsx?$/, '');
    route = route.replace(/\/\([^)]+\)/g, ''); // route groups are not URL segments
    found.push(route === '' ? '/' : route);
  }
  return found;
}

const ROUTES = routes();
const isDynamic = (segment: string) => segment.startsWith('[');

function resolves(href: string): boolean {
  const want = href.split('/').filter(Boolean);
  return ROUTES.some((route) => {
    const have = route.split('/').filter(Boolean);
    // localePrefix is "as-needed", so a leading [locale] may be omitted.
    const variants = have[0] === '[locale]' ? [have, have.slice(1)] : [have];
    return variants.some(
      (segments) =>
        segments.length === want.length &&
        segments.every((segment, i) => isDynamic(segment) || segment === want[i]),
    );
  });
}

/** Static internal links written anywhere in the source. */
function links(): Map<string, string[]> {
  const found = new Map<string, Set<string>>();
  // JSX attributes and object properties both carry routes in this codebase.
  const patterns = [/href=(?:"([^"]+)"|\{`([^`$]+)`\})/g, /href:\s*'([^']+)'/g];

  for (const file of walk(path.join(process.cwd(), 'src'))) {
    const source = fs.readFileSync(file, 'utf8');
    for (const pattern of patterns) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(source)) !== null) {
        const raw = (match[1] ?? match[2] ?? '').trim();
        if (!raw.startsWith('/')) continue;
        if (raw.includes('${')) continue;
        if (/^\/_next\//.test(raw)) continue;

        const clean = raw.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
        if (!found.has(clean)) found.set(clean, new Set());
        found.get(clean)!.add(posix(path.relative(process.cwd(), file)));
      }
    }
  }
  return new Map([...found].map(([k, v]) => [k, [...v]]));
}

describe('internal links', () => {
  const all = links();

  test('the route table was actually discovered', () => {
    assert.ok(ROUTES.length > 20, `expected the app tree to yield routes, got ${ROUTES.length}`);
    assert.ok(all.size > 10, `expected to find internal links, got ${all.size}`);
  });

  test('every static internal link resolves to a real route', () => {
    const broken = [...all].filter(([href]) => !resolves(href));
    const detail = broken.map(([href, files]) => `${href}  <- ${files.join(', ')}`).join('\n  ');

    assert.equal(broken.length, 0, `broken internal links:\n  ${detail}`);
  });

  test('the admin quick actions all resolve', () => {
    const navConfig = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'admin', 'nav-config.ts'),
      'utf8',
    );
    const hrefs = [...navConfig.matchAll(/href:\s*'([^']+)'/g)].map((m) => m[1]);

    assert.ok(hrefs.length > 0, 'expected nav-config to declare hrefs');
    for (const href of hrefs) {
      const clean = href.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
      assert.ok(resolves(clean), `nav-config links to ${href}, which has no route`);
    }
  });
});
