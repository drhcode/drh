'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Check, Languages } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { localeLabels, routing, type AppLocale } from '@/i18n/routing';
import { track, ANALYTICS_EVENTS } from '@/lib/analytics/events';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { startRouteProgress } from '@/components/route-progress';

export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations('nav');
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const current = (params.locale as AppLocale) ?? routing.defaultLocale;

  function change(locale: AppLocale) {
    if (locale === current) return;
    track(ANALYTICS_EVENTS.languageChanged, { from: current, to: locale });
    // Keeps the visitor on the same page in the other language.
    startRouteProgress();
    router.replace(
      // @ts-expect-error — pathname is a valid route for both locales
      { pathname, params },
      { locale },
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('gap-1.5 px-2.5 text-muted-foreground hover:text-foreground', className)}
          aria-label={t('language')}
        >
          <Languages className="size-4" />
          <span className="text-xs font-semibold tracking-wide">{localeLabels[current].short}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[9.5rem]">
        {routing.locales.map((locale) => (
          <DropdownMenuItem key={locale} onSelect={() => change(locale)}>
            <span aria-hidden="true">{localeLabels[locale].flag}</span>
            <span className="flex-1">{localeLabels[locale].name}</span>
            {locale === current && <Check className="size-3.5 text-accent" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
