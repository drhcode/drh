'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { RotateCcw } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

/** Public site error boundary. */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('error');

  React.useEffect(() => {
    console.error('[site] render error', error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[60vh] flex-col justify-center py-20">
      <div className="max-w-xl">
        <h1 className="text-3xl md:text-4xl">{t('title')}</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{t('body')}</p>
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-subtle-foreground">Ref: {error.digest}</p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button onClick={reset}>
            <RotateCcw className="size-4" />
            {t('retry')}
          </Button>
          <Button asChild variant="outline">
            <Link href="/">{t('home')}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
