'use client';

import { useTranslations } from 'next-intl';
import { useConsent } from './consent-provider';

export function CookieSettingsLink({ className }: { className?: string }) {
  const t = useTranslations('footer');
  const { reopen } = useConsent();

  return (
    <button type="button" onClick={reopen} className={className}>
      {t('cookieSettings')}
    </button>
  );
}
