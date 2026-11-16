'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Moon, Sun } from '@/components/brand/icons';
import { currentTheme, setTheme, type Theme } from '@/lib/theme';
import { cn } from '@/lib/utils';

/**
 * Sun/moon toggle from the design. The icons cross-fade purely in CSS from the
 * `.t-dark` / `.t-light` class on <html>, so the button renders correctly
 * before hydration and never flashes the wrong icon. Only the label needs
 * JavaScript, and it is set right after mount.
 */
export function ThemeSwitch({ className }: { className?: string }) {
  const t = useTranslations('nav');
  const [theme, setThemeState] = React.useState<Theme>('dark');

  React.useEffect(() => {
    // The DOM is the source of truth — the pre-paint script set it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(currentTheme(document.documentElement));
  }, []);

  return (
    <button
      type="button"
      className={cn(
        'tt relative grid size-11 flex-none cursor-pointer place-items-center overflow-hidden rounded-full border border-ln2 bg-transparent text-fg',
        className,
      )}
      aria-label={theme === 'light' ? t('switchToDark') : t('switchToLight')}
      onClick={() => {
        const next: Theme = currentTheme(document.documentElement) === 'dark' ? 'light' : 'dark';
        setThemeState(setTheme(next));
      }}
    >
      <Sun size={20} className="sun absolute" />
      <Moon size={20} className="moon absolute" />
    </button>
  );
}
