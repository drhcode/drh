'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useConsent } from './consent-provider';

export function CookieConsent() {
  const t = useTranslations('cookies');
  const { consent, decided, save, acceptAll, rejectOptional, reopenSignal } = useConsent();

  const [dismissed, setDismissed] = React.useState(false);
  const [customising, setCustomising] = React.useState(false);
  const [analytics, setAnalytics] = React.useState(consent.analytics);
  const [marketing, setMarketing] = React.useState(consent.marketing);

  // The footer's "Cookie Settings" link bumps a counter rather than reaching
  // into this component. Reconciling it during render keeps the banner out of
  // effect-driven state syncing.
  const [lastReopenSignal, setLastReopenSignal] = React.useState(reopenSignal);
  if (reopenSignal !== lastReopenSignal) {
    setLastReopenSignal(reopenSignal);
    setAnalytics(consent.analytics);
    setMarketing(consent.marketing);
    setCustomising(true);
    setDismissed(false);
  }

  // Shown until the visitor has chosen, or whenever preferences are reopened.
  const open = !dismissed && (!decided || reopenSignal > 0);
  if (!open) return null;

  const close = () => setDismissed(true);

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-title"
      className="fixed inset-x-0 bottom-0 z-[80] p-3 sm:p-5"
    >
      <div className="container-page">
        <div className="mx-auto max-w-3xl rounded-xl border border-border bg-surface-raised p-5 shadow-lg sm:p-6">
          <div className="flex items-start gap-4">
            <span className="hidden size-10 shrink-0 items-center justify-center rounded-lg bg-accent-subtle text-accent sm:flex">
              <Cookie className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="cookie-title" className="text-base font-medium text-foreground">
                {customising ? t('manageTitle') : t('title')}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t('body')}</p>

              {customising && (
                <div className="mt-5 space-y-3">
                  <ConsentRow
                    title={t('necessary')}
                    body={t('necessaryBody')}
                    control={
                      <span className="text-xs font-medium text-subtle-foreground">
                        {t('alwaysOn')}
                      </span>
                    }
                  />
                  <ConsentRow
                    title={t('analytics')}
                    body={t('analyticsBody')}
                    control={
                      <Switch
                        checked={analytics}
                        onCheckedChange={setAnalytics}
                        aria-label={t('analytics')}
                      />
                    }
                  />
                  <ConsentRow
                    title={t('marketing')}
                    body={t('marketingBody')}
                    control={
                      <Switch
                        checked={marketing}
                        onCheckedChange={setMarketing}
                        aria-label={t('marketing')}
                      />
                    }
                  />
                </div>
              )}

              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {customising ? (
                  <Button
                    size="sm"
                    onClick={() => {
                      save({ analytics, marketing });
                      close();
                    }}
                  >
                    {t('save')}
                  </Button>
                ) : (
                  <>
                    <Button
                      size="sm"
                      onClick={() => {
                        acceptAll();
                        close();
                      }}
                    >
                      {t('acceptAll')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        rejectOptional();
                        close();
                      }}
                    >
                      {t('rejectOptional')}
                    </Button>
                  </>
                )}
                {!customising && (
                  <Button size="sm" variant="ghost" onClick={() => setCustomising(true)}>
                    {t('customize')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConsentRow({
  title,
  body,
  control,
}: {
  title: string;
  body: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-surface p-3.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
      </div>
      <div className="shrink-0 pt-0.5">{control}</div>
    </div>
  );
}
