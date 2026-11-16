'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { currentTheme, setTheme } from '@/lib/theme';

/**
 * The admin shell's theme button. The public site uses `ThemeSwitch`, which
 * shares the same storage, cookie and pre-paint script (src/lib/theme.ts).
 *
 * The admin is English-only and has no NextIntlClientProvider, so this takes a
 * label rather than reaching for translation context.
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
    setIsDark(currentTheme(document.documentElement) === 'dark');
  }, []);

  const toggle = React.useCallback(() => {
    const next = currentTheme(document.documentElement) === 'dark' ? 'light' : 'dark';
    setIsDark(setTheme(next) === 'dark');
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
