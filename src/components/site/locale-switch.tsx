'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/navigation';
import { localeLabels, routing, type AppLocale } from '@/i18n/routing';
import { track, ANALYTICS_EVENTS } from '@/lib/analytics/events';
import { startRouteProgress } from '@/components/route-progress';
import { cn } from '@/lib/utils';

/**
 * EN · SQ · IT segmented switch. Keeps the visitor on the same page in the
 * other language through next-intl's router, so slugs and query strings carry
 * over exactly as before.
 */
export function LocaleSwitch({ size = 'sm', className }: { size?: 'sm' | 'lg'; className?: string }) {
  const t = useTranslations('nav');
  const current = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  function change(locale: AppLocale) {
    if (locale === current) return;
    track(ANALYTICS_EVENTS.languageChanged, { from: current, to: locale });
    startRouteProgress();
    router.replace(
      // @ts-expect-error — pathname is a valid route in every locale
      { pathname, params },
      { locale },
    );
  }

  return (
    <div
      role="group"
      aria-label={t('language')}
      className={cn(
        size === 'sm' ? 'flex rounded-full border border-ln2 p-[3px]' : 'flex gap-2',
        className,
      )}
    >
      {routing.locales.map((locale) => {
        const selected = locale === current;
        return (
          <button
            key={locale}
            type="button"
            lang={localeLabels[locale].htmlLang}
            aria-pressed={selected}
            aria-label={localeLabels[locale].name}
            onClick={() => change(locale)}
            className={cn(
              'cursor-pointer rounded-full font-semibold transition-colors',
              size === 'sm' ? 'h-[34px] min-w-10 text-xs' : 'h-12 flex-1 border border-ln2 text-sm',
              selected ? 'bg-fg text-bg' : 'bg-transparent text-t1 hover:text-fg',
            )}
          >
            {localeLabels[locale].short}
          </button>
        );
      })}
    </div>
  );
}
