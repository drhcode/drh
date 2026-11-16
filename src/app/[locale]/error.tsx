'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

/** Public site error boundary. */
export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('error');

  React.useEffect(() => {
    console.error('[site] render error', error);
  }, [error]);

  return (
    <div className="wrap flex min-h-[60vh] flex-col justify-center py-20">
      <h1 className="m-0 text-[clamp(36px,4vw,56px)] font-semibold tracking-[-0.04em]">{t('title')}</h1>
      <p className="lead mt-4 max-w-[560px]">{t('body')}</p>
      {error.digest && <p className="mono mt-3 text-xs text-t3">Ref: {error.digest}</p>}
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="btn btn-p btn-md">
          {t('retry')}
        </button>
        <Link href="/" className="btn btn-g btn-md">
          {t('home')}
        </Link>
      </div>
    </div>
  );
}
