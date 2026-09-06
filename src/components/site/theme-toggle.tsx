'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'drh-theme';

/**
 * Shared by the public header and the admin shell.
 *
 * The admin is English-only and has no NextIntlClientProvider, so this takes a
 * label rather than reaching for translation context — a UI atom used in both
 * trees must not depend on one of them.
 */
export function ThemeToggle({
  className,
  label = 'Toggle theme',
}: {
  className?: string;
  label?: string;
}) {
  const [isDark, setIsDark] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // The theme is applied by an inline script before hydration, so the only
    // source of truth is the DOM. Reading it after mount is the point here —
    // rendering it during the server pass would guarantee a mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = React.useCallback(() => {
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    document.documentElement.style.colorScheme = next ? 'dark' : 'light';
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
    } catch {
      // Private browsing — the preference just is not remembered.
    }
    setIsDark(next);
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggle}
      aria-label={label}
      className={className}
    >
      {mounted && isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
