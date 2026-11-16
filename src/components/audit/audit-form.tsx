'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { Link } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { normaliseSiteUrl } from '@/lib/leads/requests';
import { collectAttribution } from '@/lib/leads/attribution';
import { requestAudit } from '@/app/actions/requests';
import { publicEnv } from '@/lib/env';
import { track, ANALYTICS_EVENTS } from '@/lib/analytics/events';
import { Check } from '@/components/brand/icons';

// Loaded only when a Turnstile site key is configured and the widget renders.
const Turnstile = dynamic(() => import('@marsidev/react-turnstile').then((m) => m.Turnstile), { ssr: false });

type Phase = 'idle' | 'sending' | 'done';

/**
 * Website + email → queued audit. The progress bar reflects the real request
 * (it fills while the server action runs and completes when it returns); it
 * does not pretend to scan anything in the browser.
 */
export function AuditForm() {
  const t = useTranslations('audit');
  const tf = useTranslations('form');
  const locale = useLocale() as AppLocale;
  const [phase, setPhase] = React.useState<Phase>('idle');
  const [progress, setProgress] = React.useState(0);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [token, setToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (phase !== 'sending') return;
    const timer = window.setInterval(() => setProgress((p) => Math.min(90, p + 15)), 300);
    return () => window.clearInterval(timer);
  }, [phase]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const url = String(form.get('url') ?? '');
    const email = String(form.get('email') ?? '');
    const next: Record<string, string> = {};
    if (!normaliseSiteUrl(url)) next.url = t('urlInvalid');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) next.email = tf('validation.emailInvalid');
    setErrors(next);
    if (Object.keys(next).length) return;

    form.set('locale', locale);
    form.set('attribution', JSON.stringify(collectAttribution()));
    if (token) form.set('turnstileToken', token);
    setFormError(null);
    setProgress(10);
    setPhase('sending');
    try {
      const result = await requestAudit(form);
      if (result.ok) {
        setProgress(100);
        track(ANALYTICS_EVENTS.contactClicked, { channel: 'audit_request' });
        window.setTimeout(() => setPhase('done'), 400);
        return;
      }
      setPhase('idle');
      if (result.fieldErrors?.url) next.url = t('urlInvalid');
      if (result.fieldErrors?.email) next.email = tf('validation.emailInvalid');
      setErrors(next);
      setFormError(result.errorKey === 'rateLimited' ? tf('rateLimited') : result.errorKey === 'spamCheckFailed' ? tf('spamCheckFailed') : tf('errorBody', { email: 'info@drh.al' }));
    } catch {
      setPhase('idle');
      setFormError(tf('errorBody', { email: 'info@drh.al' }));
    }
  }

  if (phase === 'done') {
    return (
      <div role="status" className="swap on-lime mt-9 max-w-[620px] rounded-3xl bg-lime p-7 text-ink">
        <div className="flex items-center gap-3.5">
          <span className="pop grid size-12 flex-none place-items-center rounded-full bg-ink text-lime">
            <Check size={22} strokeWidth={2.6} />
          </span>
          <span className="text-[22px] font-semibold tracking-[-0.02em]">{t('doneTitle')}</span>
        </div>
        <p className="mt-3.5 text-base leading-[1.55] text-lime-ink">{t('doneBody')}</p>
        <Link href="/book" className="btn btn-ink btn-md mt-[18px]">
          {t('doneCta')} →
        </Link>
      </div>
    );
  }

  if (phase === 'sending') {
    return (
      <div className="swap mt-9 max-w-[620px] rounded-3xl border border-ln bg-s1 p-6" role="status" aria-live="polite">
        <div className="flex justify-between text-[15px]">
          <span>{t('queuing')}</span>
          <span className="mono text-acct">{progress}%</span>
        </div>
        <div className="mt-3.5 h-1.5 overflow-hidden rounded-md bg-s2">
          <div className="h-full bg-lime transition-[width] duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
    );
  }

  return (
    <form className="rise d3 mt-9 max-w-[620px]" onSubmit={onSubmit} noValidate>
      <div aria-hidden="true" className="absolute left-[-9999px] size-0 overflow-hidden">
        <label htmlFor="a-hp">Company website</label>
        <input id="a-hp" name="company_website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="flex flex-wrap gap-2 rounded-3xl border border-ln2 bg-s1 p-2 focus-within:border-acct">
        <label htmlFor="a-url" className="sr-only">
          {t('urlLabel')}
        </label>
        <input
          id="a-url"
          name="url"
          type="text"
          inputMode="url"
          autoComplete="url"
          required
          placeholder="https://yourbusiness.al"
          aria-invalid={Boolean(errors.url)}
          aria-describedby={errors.url ? 'a-url-error' : undefined}
          className="h-14 min-w-0 flex-[1_1_220px] rounded-2xl bg-transparent px-[18px] text-[17px] text-fg outline-none placeholder:text-t3 focus-visible:outline-2 focus-visible:outline-acct"
        />
        <label htmlFor="a-email" className="sr-only">
          {t('emailLabel')}
        </label>
        <input
          id="a-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="you@company.com"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'a-email-error' : undefined}
          className="h-14 min-w-0 flex-[1_1_200px] rounded-2xl bg-bg px-[18px] text-[17px] text-fg outline-none placeholder:text-t3 focus-visible:outline-2 focus-visible:outline-acct"
        />
        <button type="submit" className="btn btn-p shine h-14 flex-[1_1_160px] rounded-2xl px-6 text-base">
          {t('submit')}
        </button>
      </div>
      {errors.url && <p id="a-url-error" role="alert" className="field-error">{errors.url}</p>}
      {errors.email && <p id="a-email-error" role="alert" className="field-error">{errors.email}</p>}
      {publicEnv.turnstileSiteKey && (
        <div className="mt-4">
          <Turnstile siteKey={publicEnv.turnstileSiteKey} onSuccess={setToken} onExpire={() => setToken(null)} options={{ theme: 'auto', size: 'flexible' }} />
        </div>
      )}
      {formError && (
        <p role="alert" className="mt-4 rounded-[14px] border border-[#ff8a3d55] bg-[#ff8a3d14] px-4 py-3 text-sm">
          {formError}
        </p>
      )}
      <p className="mono mt-3.5 text-xs text-t3">{t('noSpam')}</p>
    </form>
  );
}
