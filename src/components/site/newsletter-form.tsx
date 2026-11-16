'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { track, ANALYTICS_EVENTS } from '@/lib/analytics/events';
import { contentLanguage, type AppLocale } from '@/i18n/routing';

type State = 'idle' | 'submitting' | 'success' | 'error' | 'invalid';

/** Footer newsletter signup. Double opt-in through the existing /api/newsletter. */
export function NewsletterForm() {
  const t = useTranslations('newsletter');
  const locale = useLocale() as AppLocale;
  const [email, setEmail] = React.useState('');
  const [state, setState] = React.useState<State>('idle');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setState('invalid');
      return;
    }

    setState('submitting');
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Subscribers are stored per content language; Italian readers receive
        // the English edition until there is an Italian one.
        body: JSON.stringify({ email, language: contentLanguage(locale), source: 'footer' }),
      });
      if (!response.ok) throw new Error('failed');
      track(ANALYTICS_EVENTS.newsletterSubscribed);
      setState('success');
      setEmail('');
    } catch {
      setState('error');
    }
  }

  const hasError = state === 'invalid' || state === 'error';

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8">
      <label htmlFor="nl-email" className="block text-sm text-t3">
        {t('title')}
      </label>
      <div className="mt-3 flex gap-2 rounded-full border border-ln2 p-1.5 focus-within:border-acct">
        <input
          id="nl-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (hasError) setState('idle');
          }}
          placeholder={t('placeholder')}
          aria-invalid={state === 'invalid'}
          aria-describedby={hasError || state === 'success' ? 'nl-status' : undefined}
          className="h-11 min-w-0 flex-1 rounded-full bg-transparent px-4 text-base text-fg outline-none placeholder:text-t3"
        />
        <button
          type="submit"
          disabled={state === 'submitting'}
          className="btn btn-p h-11 px-5 text-sm"
        >
          {state === 'success' ? t('subscribed') : t('submit')}
        </button>
      </div>
      <p id="nl-status" role="status" className="mt-2 min-h-5 text-[13px] text-t2">
        {state === 'success' ? t('success') : state === 'invalid' ? t('invalid') : state === 'error' ? t('error') : ''}
      </p>
    </form>
  );
}
