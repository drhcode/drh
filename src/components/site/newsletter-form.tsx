'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { track, ANALYTICS_EVENTS } from '@/lib/analytics/events';

type State = 'idle' | 'submitting' | 'success' | 'error' | 'invalid';

export function NewsletterForm() {
  const t = useTranslations('newsletter');
  const locale = useLocale();
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
        body: JSON.stringify({ email, language: locale, source: 'footer' }),
      });
      if (!response.ok) throw new Error('failed');
      track(ANALYTICS_EVENTS.newsletterSubscribed);
      setState('success');
      setEmail('');
    } catch {
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <p className="flex items-start gap-2 text-sm text-muted-foreground">
        <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
        {t('success')}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <p className="text-sm font-medium text-foreground">{t('title')}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t('body')}</p>
      <div className="mt-3 flex gap-2">
        <label htmlFor="newsletter-email" className="sr-only">
          {t('placeholder')}
        </label>
        <Input
          id="newsletter-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (state === 'invalid' || state === 'error') setState('idle');
          }}
          placeholder={t('placeholder')}
          aria-invalid={state === 'invalid'}
          aria-describedby={state === 'invalid' || state === 'error' ? 'newsletter-error' : undefined}
          className="h-10 text-sm"
        />
        <Button
          type="submit"
          size="icon"
          className="size-10 shrink-0"
          disabled={state === 'submitting'}
          aria-label={t('submit')}
        >
          {state === 'submitting' ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ArrowRight className="size-4" />
          )}
        </Button>
      </div>
      {(state === 'invalid' || state === 'error') && (
        <p id="newsletter-error" role="alert" className="mt-2 text-xs text-danger">
          {state === 'invalid' ? t('invalid') : t('error')}
        </p>
      )}
    </form>
  );
}
