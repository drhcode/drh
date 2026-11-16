'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { contentLanguage, localeLabels, type AppLocale } from '@/i18n/routing';
import { BOOKING_WINDOW_DAYS, CALL_SLOTS, isRequestableDate, tiranaDate } from '@/lib/leads/requests';
import { collectAttribution } from '@/lib/leads/attribution';
import { requestCall } from '@/app/actions/requests';
import { publicEnv } from '@/lib/env';
import { track, ANALYTICS_EVENTS } from '@/lib/analytics/events';
import { Accent } from '@/components/brand/accent';
import { ArrowLeft, ChevronRight, Check } from '@/components/brand/icons';
import { cn } from '@/lib/utils';

// Loaded only when a Turnstile site key is configured and the widget renders.
const Turnstile = dynamic(() => import('@marsidev/react-turnstile').then((m) => m.Turnstile), { ssr: false });

/**
 * INTEGRATION POINT — booking provider.
 *
 * Set NEXT_PUBLIC_CALENDLY_URL (e.g. https://calendly.com/drh-al/30min) and
 * rebuild: /book then embeds that Calendly page and real availability comes
 * from Calendly. Without it, visitors pick a preferred weekday and time here
 * and the request is stored as a lead (src/app/actions/requests.ts) for the
 * team to confirm by email. No availability is invented in that mode: every
 * weekday slot in the window is offered as a preference, not a booking.
 */
export function Booking() {
  if (publicEnv.calendlyUrl) return <CalendlyEmbed url={publicEnv.calendlyUrl} />;
  return <RequestATime />;
}

function CalendlyEmbed({ url }: { url: string }) {
  const t = useTranslations('book');
  React.useEffect(() => {
    track(ANALYTICS_EVENTS.calendlyOpened);
  }, []);
  const src = new URL(url);
  src.searchParams.set('embed_type', 'Inline');
  src.searchParams.set('hide_gdpr_banner', '1');
  if (typeof window !== 'undefined') src.searchParams.set('embed_domain', window.location.hostname);
  return (
    <iframe
      title={t('calendlyTitle')}
      src={src.toString()}
      loading="lazy"
      className="h-[720px] w-full rounded-[22px] border-0 bg-bg"
    />
  );
}

type Step = 'pick' | 'form' | 'done';

function RequestATime() {
  const t = useTranslations('book');
  const tf = useTranslations('form');
  const locale = useLocale() as AppLocale;
  const intl = localeLabels[locale].intl;

  const [month, setMonth] = React.useState(0);
  const [day, setDay] = React.useState<string | null>(null);
  const [time, setTime] = React.useState<string | null>(null);
  const [step, setStep] = React.useState<Step>('pick');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [token, setToken] = React.useState<string | null>(null);
  const [now, setNow] = React.useState<Date | null>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  // Dates depend on "today", so they are computed after mount to avoid a
  // server/client mismatch around midnight.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
  }, []);

  React.useEffect(() => {
    if (step !== 'pick') headingRef.current?.focus();
  }, [step]);

  const monthLimit = Math.ceil(BOOKING_WINDOW_DAYS / 30);
  const today = now ? tiranaDate(now) : null;
  const base = today ? new Date(`${today.slice(0, 7)}-01T12:00:00Z`) : null;
  if (base) base.setUTCMonth(base.getUTCMonth() + month);

  const cells: ({ iso: string; label: number; ok: boolean } | null)[] = [];
  if (base && now) {
    const year = base.getUTCFullYear();
    const m = base.getUTCMonth();
    const daysIn = new Date(Date.UTC(year, m + 1, 0)).getUTCDate();
    const lead = (base.getUTCDay() + 6) % 7;
    for (let i = 0; i < lead; i++) cells.push(null);
    for (let d = 1; d <= daysIn; d++) {
      const iso = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ iso, label: d, ok: isRequestableDate(iso, now) });
    }
  }

  const fmtDay = (iso: string) =>
    new Intl.DateTimeFormat(intl, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`));
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(intl, { weekday: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(2024, 0, 1 + i))).toUpperCase(),
  );
  const when = day && time ? `${fmtDay(day)} · ${time} CET` : '';

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!day || !time) return;
    const form = new FormData(event.currentTarget);
    form.set('date', day);
    form.set('time', time);
    form.set('language', contentLanguage(locale));
    form.set('attribution', JSON.stringify(collectAttribution()));
    if (token) form.set('turnstileToken', token);
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      const result = await requestCall(form);
      if (result.ok) {
        track(ANALYTICS_EVENTS.contactClicked, { channel: 'call_request' });
        setStep('done');
        return;
      }
      setFieldErrors(result.fieldErrors ?? {});
      if (result.fieldErrors?.date || result.fieldErrors?.time) setStep('pick');
      setError(
        result.errorKey === 'rateLimited' ? tf('rateLimited') : result.errorKey === 'spamCheckFailed' ? tf('spamCheckFailed') : tf('errorBody', { email: 'info@drh.al' }),
      );
    } catch {
      setError(tf('errorBody', { email: 'info@drh.al' }));
    } finally {
      setSubmitting(false);
    }
  }

  const fieldError = (key: string) => (fieldErrors[key] ? tf(`validation.${fieldErrors[key]}` as never, { max: 1200 }) : null);

  if (step === 'done') {
    return (
      <div role="status" className="py-10 text-center">
        <div className="pop mx-auto grid size-24 place-items-center rounded-full bg-lime text-ink">
          <Check size={44} strokeWidth={2.6} />
        </div>
        <h2 ref={headingRef} tabIndex={-1} className="rise d1 mt-7 text-[clamp(34px,4vw,52px)] font-semibold tracking-[-0.04em] outline-none">
          <Accent text={t('doneTitle')} />
        </h2>
        <p className="rise d2 mx-auto mt-3 max-w-[480px] text-lg text-t2">{t('doneBody', { when })}</p>
      </div>
    );
  }

  if (step === 'form') {
    return (
      <form className="swap" onSubmit={onSubmit} noValidate>
        <button type="button" onClick={() => setStep('pick')} className="inline-flex items-center gap-1.5 bg-transparent p-0 text-[15px] font-medium text-t2 hover:text-fg">
          <ArrowLeft size={16} /> {t('changeTime')}
        </button>
        <h2 ref={headingRef} tabIndex={-1} className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[18px] bg-bg p-5 text-xl font-semibold outline-none">
          {when}
          <span className="mono text-[13px] font-normal text-acct">{t('slotBadge')}</span>
        </h2>
        <div aria-hidden="true" className="absolute left-[-9999px] size-0 overflow-hidden">
          <label htmlFor="b-hp">Company website</label>
          <input id="b-hp" name="company_website" tabIndex={-1} autoComplete="off" />
        </div>
        <div className="mt-6 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr))]">
          <div>
            <label htmlFor="b-name" className="field-label">
              {tf('fullName')} <span aria-hidden="true">*</span>
            </label>
            <input id="b-name" name="name" className="field" autoComplete="name" required aria-required="true" aria-invalid={Boolean(fieldErrors.name)} />
            {fieldError('name') && <p role="alert" className="field-error">{fieldError('name')}</p>}
          </div>
          <div>
            <label htmlFor="b-email" className="field-label">
              {tf('email')} <span aria-hidden="true">*</span>
            </label>
            <input id="b-email" name="email" type="email" inputMode="email" className="field" autoComplete="email" required aria-required="true" aria-invalid={Boolean(fieldErrors.email)} />
            {fieldError('email') && <p role="alert" className="field-error">{fieldError('email')}</p>}
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="b-topic" className="field-label">
            {t('topic')}
          </label>
          <textarea id="b-topic" name="topic" maxLength={1200} className="field h-[120px]" />
        </div>
        {publicEnv.turnstileSiteKey && (
          <div className="mt-5">
            <Turnstile siteKey={publicEnv.turnstileSiteKey} onSuccess={setToken} onExpire={() => setToken(null)} options={{ theme: 'auto', size: 'flexible' }} />
          </div>
        )}
        {error && (
          <p role="alert" className="mt-5 rounded-[14px] border border-[#ff8a3d55] bg-[#ff8a3d14] px-4 py-3 text-sm">
            {error}
          </p>
        )}
        <button type="submit" disabled={submitting} className="btn btn-p shine mt-6 h-[60px] px-8 text-[17px]">
          {submitting ? tf('submitting') : t('confirm')}
        </button>
      </form>
    );
  }

  return (
    <div className="flex flex-wrap gap-8">
      <div className="min-w-0 flex-[1.3_1_320px]">
        <div className="flex items-center justify-between">
          <h2 className="m-0 text-[26px] font-semibold tracking-[-0.02em]" aria-live="polite">
            {base ? new Intl.DateTimeFormat(intl, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(base) : ' '}
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMonth((v) => Math.max(0, v - 1))}
              disabled={month === 0}
              aria-label={t('prevMonth')}
              className="grid size-11 place-items-center rounded-full border border-ln2 text-fg disabled:text-ln2"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => setMonth((v) => Math.min(monthLimit, v + 1))}
              disabled={month === monthLimit}
              aria-label={t('nextMonth')}
              className="grid size-11 place-items-center rounded-full border border-ln2 text-fg disabled:text-ln2"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className="mono mt-6 grid grid-cols-7 gap-1.5 text-center text-xs text-t3" aria-hidden="true">
          {weekdays.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>
        <div className="mt-2.5 grid grid-cols-7 gap-1.5">
          {cells.map((cell, index) =>
            cell ? (
              <button
                key={cell.iso}
                type="button"
                disabled={!cell.ok}
                aria-pressed={day === cell.iso}
                aria-label={`${fmtDay(cell.iso)}${cell.ok ? '' : ` — ${t('unavailable')}`}`}
                onClick={() => {
                  setDay(cell.iso);
                  setTime(null);
                }}
                className={cn(
                  'day h-12 rounded-[14px] border text-[15px] font-semibold',
                  day === cell.iso
                    ? 'border-lime bg-lime text-ink'
                    : cell.ok
                      ? 'cursor-pointer border-ln bg-bg text-fg'
                      : 'cursor-not-allowed border-transparent bg-transparent text-t3 opacity-50',
                )}
              >
                {cell.label}
              </button>
            ) : (
              <span key={`blank-${index}`} aria-hidden="true" />
            ),
          )}
        </div>
        <p className="mono mt-4 text-xs text-t3">{t('timezone')}</p>
      </div>

      <div className="min-w-0 flex-[1_1_220px]">
        <h3 className="m-0 text-lg font-semibold">{day ? fmtDay(day) : t('pickDay')}</h3>
        <div role="radiogroup" aria-label={t('times')} className="mt-5 flex flex-col gap-2">
          {CALL_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              role="radio"
              aria-checked={time === slot}
              disabled={!day}
              onClick={() => setTime(slot)}
              className="chip mono h-[52px] rounded-[14px] border border-ln2 bg-transparent text-base font-semibold text-fg disabled:cursor-not-allowed disabled:opacity-35"
            >
              {slot}
            </button>
          ))}
        </div>
        {fieldErrors.date && <p role="alert" className="field-error">{t('dateInvalid')}</p>}
        <button
          type="button"
          disabled={!time}
          onClick={() => setStep('form')}
          className="btn btn-p mt-5 h-14 w-full text-base"
        >
          {t('continue')} →
        </button>
        <p className="mt-3 text-[13px] leading-normal text-t3">{t('requestNote')}</p>
      </div>
    </div>
  );
}
