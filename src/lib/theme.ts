/**
 * Theme preference — one implementation shared by the inline pre-paint script,
 * the public sun/moon switch and the admin toggle.
 *
 * Resolution order on every page load:
 *   1. an explicit choice the visitor made (localStorage, then cookie)
 *   2. otherwise the OS `prefers-color-scheme`
 *   3. otherwise dark, the brand default
 *
 * The cookie exists so the choice survives a cleared localStorage and is
 * visible to anything server-side that wants it later. It is deliberately not
 * read during rendering: doing that would opt every statically generated page
 * into dynamic rendering. The inline script below applies the theme before
 * first paint instead, so there is no flash either way.
 */

export type Theme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'drh-theme';
export const THEME_COOKIE = 'drh-theme';
const ONE_YEAR = 60 * 60 * 24 * 365;

export function isTheme(value: unknown): value is Theme {
  return value === 'dark' || value === 'light';
}

/** Pure resolution step — the part worth testing. */
export function resolveTheme({
  stored,
  cookie,
  prefersLight,
}: {
  stored?: string | null;
  cookie?: string | null;
  prefersLight?: boolean | null;
}): Theme {
  if (isTheme(stored)) return stored;
  if (isTheme(cookie)) return cookie;
  return prefersLight ? 'light' : 'dark';
}

/** Reads the theme cookie out of a `document.cookie` string. */
export function readThemeCookie(cookieString: string | null | undefined): string | null {
  if (!cookieString) return null;
  const match = cookieString.match(/(?:^|;\s*)drh-theme=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function themeCookieValue(theme: Theme): string {
  return `${THEME_COOKIE}=${theme}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
}

/** Minimal storage surface so persistence can be tested without a browser. */
export interface ThemeStorage {
  setItem(key: string, value: string): void;
}

/**
 * Writes the choice to both stores. Each write is independent: private
 * browsing can refuse localStorage while still accepting the cookie.
 */
export function persistTheme(
  theme: Theme,
  storage: ThemeStorage | null,
  setCookie: ((value: string) => void) | null,
): void {
  try {
    storage?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage unavailable — the cookie still carries the choice.
  }
  try {
    setCookie?.(themeCookieValue(theme));
  } catch {
    // Cookies blocked — the choice lasts for this page view only.
  }
}

/**
 * Applies a theme to the document. `.dark` drives the admin palette and the
 * shared UI primitives; `.t-dark` / `.t-light` drive the public design tokens.
 */
export function applyTheme(root: HTMLElement, theme: Theme): void {
  root.classList.toggle('dark', theme === 'dark');
  root.classList.toggle('t-dark', theme === 'dark');
  root.classList.toggle('t-light', theme === 'light');
  root.style.colorScheme = theme;
}

export function currentTheme(root: HTMLElement): Theme {
  return root.classList.contains('t-light') ? 'light' : 'dark';
}

/** Browser entry point used by both toggles. Returns the theme now applied. */
export function setTheme(theme: Theme): Theme {
  const root = document.documentElement;
  applyTheme(root, theme);
  persistTheme(theme, safeLocalStorage(), (value) => {
    document.cookie = value;
  });
  return theme;
}

function safeLocalStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Inline, render-blocking script for <head>. Mirrors `resolveTheme` and
 * `applyTheme` exactly; kept as a string because it must run before React.
 */
export const themeScript = `(function(){try{var d=document.documentElement,s=null,c=null,m=null;try{s=localStorage.getItem('${THEME_STORAGE_KEY}')}catch(e){}m=document.cookie.match(/(?:^|;\\s*)${THEME_COOKIE}=([^;]+)/);c=m?decodeURIComponent(m[1]):null;var t=(s==='dark'||s==='light')?s:(c==='dark'||c==='light')?c:(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');d.classList.toggle('dark',t==='dark');d.classList.toggle('t-dark',t==='dark');d.classList.toggle('t-light',t==='light');d.style.colorScheme=t;}catch(e){}})();`;
