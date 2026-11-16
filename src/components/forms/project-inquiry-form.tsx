'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { Link } from '@/i18n/navigation';
import { contentLanguage, type AppLocale } from '@/i18n/routing';
import {
  BUDGET_OPTIONS,
  MESSAGE_MAX,
  SERVICE_OPTIONS,
  TIMELINE_OPTIONS,
  leadFormSchema,
  type LeadFormValues,
} from '@/lib/leads/schema';
import { LEAD_STEPS, parsePrefill } from '@/lib/leads/prefill';
import { collectAttribution, recordVisit } from '@/lib/leads/attribution';
import { submitLead } from '@/app/actions/lead';
import { publicEnv } from '@/lib/env';
import { ANALYTICS_EVENTS, track, trackAdsConversion } from '@/lib/analytics/events';
import { Accent } from '@/components/brand/accent';
import { ArrowRight, Check, Close, Upload } from '@/components/brand/icons';
import { cn, formatBytes } from '@/lib/utils';

// Loaded only when a Turnstile site key is configured and the widget renders.
const Turnstile = dynamic(() => import('@marsidev/react-turnstile').then((m) => m.Turnstile), { ssr: false });

type Status = 'idle' | 'submitting' | 'success' | 'error';

/**
 * Project inquiry form — three steps (service → budget & timeline → details).
 *
 * Same fields, schema and server action as before the redesign: the Zod schema
 * in src/lib/leads/schema.ts validates each step in the browser and the whole
 * submission again on the server (honeypot, rate limit, Turnstile, attachment
 * checks all unchanged).
 */
export function ProjectInquiryForm({ email }: { email: string }) {
  const t = useTranslations('form');
  const tc = useTranslations('contactForm');
  const locale = useLocale() as AppLocale;

  const [step, setStep] = React.useState(0);
  const [status, setStatus] = React.useState<Status>('idle');
  const [formError, setFormError] = React.useState<string | null>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = React.useState<string | null>(null);
  const startedRef = React.useRef(false);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const moved = React.useRef(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: { language: contentLanguage(locale), privacy: false as unknown as true, company_website: '' },
    mode: 'onBlur',
  });

  React.useEffect(() => {
    recordVisit();
    // Pre-fill from the estimator, a service page or a pricing tier.
    const prefill = parsePrefill(window.location.search);
    if (prefill.service) setValue('service', prefill.service);
    if (prefill.budget) setValue('budget', prefill.budget);
    if (prefill.timeline) setValue('timeline', prefill.timeline);
    if (prefill.message) setValue('message', prefill.message);
  }, [setValue]);

  // Move focus to the new step's heading so keyboard and screen-reader users
  // land on it (but not on first render).
  React.useEffect(() => {
    if (!moved.current) return;
    headingRef.current?.focus();
  }, [step]);

  // react-hook-form keeps field state in refs, so `watch()` cannot be memoised.
  // eslint-disable-next-line react-hooks/incompatible-library
  const values = watch();
  const message = values.message ?? '';

  const handleFirstInteraction = React.useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    track(ANALYTICS_EVENTS.projectFormStarted);
  }, []);

  const errorMessage = (field: keyof LeadFormValues) => {
    const raw = errors[field]?.message;
    if (!raw) return undefined;
    // Zod issues carry message keys; some resolver errors are full sentences.
    return raw.includes(' ') ? raw : t(`validation.${raw}` as never, { max: MESSAGE_MAX });
  };

  async function next() {
    const valid = await trigger([...LEAD_STEPS[step]] as (keyof LeadFormValues)[]);
    if (!valid) return;
    moved.current = true;
    setStep((value) => Math.min(LEAD_STEPS.length - 1, value + 1));
  }

  function back() {
    moved.current = true;
    setStep((value) => Math.max(0, value - 1));
  }

  async function onSubmit(data: LeadFormValues) {
    setStatus('submitting');
    setFormError(null);
    setFileError(null);

    const formData = new FormData();
    formData.set('name', data.name);
    formData.set('email', data.email);
    if (data.phone) formData.set('phone', data.phone);
    if (data.company) formData.set('company', data.company);
    if (data.website) formData.set('website', data.website);
    formData.set('service', data.service);
    formData.set('budget', data.budget);
    formData.set('timeline', data.timeline);
    formData.set('message', data.message);
    formData.set('privacy', String(Boolean(data.privacy)));
    formData.set('language', contentLanguage(locale));
    formData.set('company_website', data.company_website ?? '');
    if (turnstileToken) formData.set('turnstileToken', turnstileToken);
    formData.set('attribution', JSON.stringify(collectAttribution()));
    if (file) formData.set('attachment', file);

    try {
      const result = await submitLead(formData);

      if (result.ok) {
        track(ANALYTICS_EVENTS.projectFormSubmitted, { service: data.service, budget: data.budget });
        trackAdsConversion();
        setStatus('success');
        reset();
        setFile(null);
        setStep(0);
        return;
      }

      if (result.fieldErrors) {
        let firstStep = LEAD_STEPS.length - 1;
        for (const [field, key] of Object.entries(result.fieldErrors)) {
          if (field === 'attachment') {
            setFileError(t(`validation.${key}` as never, { max: MESSAGE_MAX }));
            continue;
          }
          setError(field as keyof LeadFormValues, { message: key });
          const owner = LEAD_STEPS.findIndex((fields) => (fields as readonly string[]).includes(field));
          if (owner !== -1) firstStep = Math.min(firstStep, owner);
        }
        setStep(firstStep);
      }

      setStatus('error');
      setFormError(
        result.errorKey === 'rateLimited'
          ? t('rateLimited')
          : result.errorKey === 'spamCheckFailed'
            ? t('spamCheckFailed')
            : t('errorBody', { email }),
      );
    } catch {
      setStatus('error');
      setFormError(t('errorBody', { email }));
    }
  }

  if (status === 'success') {
    return (
      <div role="status" className="py-12 text-center">
        <div className="pop mx-auto grid size-24 place-items-center rounded-full bg-lime text-ink">
          <Check size={44} strokeWidth={2.6} />
        </div>
        <h2 className="rise d1 mt-8 text-[clamp(36px,4vw,56px)] font-semibold tracking-[-0.04em]">
          <Accent text={tc('doneTitle')} />
        </h2>
        <p className="rise d2 mx-auto mt-4 max-w-[440px] text-lg leading-relaxed text-t2">{tc('doneBody')}</p>
        <div className="rise d3 mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            className="btn btn-g btn-md"
            onClick={() => {
              setStatus('idle');
              startedRef.current = false;
            }}
          >
            {t('successAnother')}
          </button>
          <Link href="/book" className="btn btn-p btn-md">
            {tc('doneBook')} →
          </Link>
        </div>
      </div>
    );
  }

  const stepNames = [tc('step1'), tc('step2'), tc('step3')];

  return (
    <form onSubmit={handleSubmit(onSubmit)} onFocus={handleFirstInteraction} noValidate>
      {/* Honeypot — visually hidden, never announced, never focusable */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-0 size-0 overflow-hidden">
        <label htmlFor="company_website">Company website</label>
        <input id="company_website" type="text" tabIndex={-1} autoComplete="off" {...register('company_website')} />
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="mono text-[13px] text-acct">{tc('stepOf', { n: step + 1, total: LEAD_STEPS.length })}</span>
        <span className="mono text-[13px] text-t3">{stepNames[step]}</span>
      </div>
      <div
        className="mt-4 h-1 overflow-hidden rounded bg-s2"
        role="progressbar"
        aria-label={tc('progress')}
        aria-valuemin={1}
        aria-valuemax={LEAD_STEPS.length}
        aria-valuenow={step + 1}
      >
        <div
          className="h-full bg-lime transition-[width] duration-600 ease-[cubic-bezier(.2,.7,.2,1)]"
          style={{ width: `${((step + 1) / LEAD_STEPS.length) * 100}%` }}
        />
      </div>

      {step === 0 && (
        <fieldset key="s1" className="swap mt-10 border-0 p-0">
          <legend className="contents">
            <h2 ref={headingRef} tabIndex={-1} className="m-0 text-[clamp(30px,3vw,42px)] font-semibold tracking-[-0.03em] outline-none">
              {tc('step1Title')}
            </h2>
          </legend>
          <ChipGroup
            label={t('service')}
            value={values.service}
            options={SERVICE_OPTIONS.map((value) => ({ value, label: t(`serviceOptions.${value}` as never) }))}
            onChange={(value) => setValue('service', value as LeadFormValues['service'], { shouldValidate: true })}
            error={errorMessage('service')}
          />
        </fieldset>
      )}

      {step === 1 && (
        <fieldset key="s2" className="swap mt-10 border-0 p-0">
          <legend className="contents">
            <h2 ref={headingRef} tabIndex={-1} className="m-0 text-[clamp(30px,3vw,42px)] font-semibold tracking-[-0.03em] outline-none">
              {tc('step2Title')}
            </h2>
          </legend>
          <ChipGroup
            label={t('budget')}
            caption
            grid
            value={values.budget}
            options={BUDGET_OPTIONS.map((value) => ({ value, label: t(`budgetOptions.${value}` as never) }))}
            onChange={(value) => setValue('budget', value as LeadFormValues['budget'], { shouldValidate: true })}
            error={errorMessage('budget')}
          />
          <ChipGroup
            label={t('timeline')}
            caption
            value={values.timeline}
            options={TIMELINE_OPTIONS.map((value) => ({ value, label: t(`timelineOptions.${value}` as never) }))}
            onChange={(value) => setValue('timeline', value as LeadFormValues['timeline'], { shouldValidate: true })}
            error={errorMessage('timeline')}
          />
        </fieldset>
      )}

      {step === 2 && (
        <fieldset key="s3" className="swap mt-10 border-0 p-0">
          <legend className="contents">
            <h2 ref={headingRef} tabIndex={-1} className="m-0 text-[clamp(30px,3vw,42px)] font-semibold tracking-[-0.03em] outline-none">
              {tc('step3Title')}
            </h2>
          </legend>
          <div className="mt-7 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr))]">
            <Field id="f-name" label={t('fullName')} required error={errorMessage('name')}>
              <input id="f-name" className="field" autoComplete="name" aria-invalid={Boolean(errors.name)} aria-required="true" {...register('name')} />
            </Field>
            <Field id="f-email" label={t('email')} required error={errorMessage('email')}>
              <input id="f-email" className="field" type="email" inputMode="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-required="true" {...register('email')} />
            </Field>
            <Field id="f-phone" label={t('phone')}>
              <input id="f-phone" className="field" type="tel" inputMode="tel" autoComplete="tel" {...register('phone')} />
            </Field>
            <Field id="f-company" label={t('company')}>
              <input id="f-company" className="field" autoComplete="organization" {...register('company')} />
            </Field>
          </div>
          <Field id="f-url" label={t('website')} error={errorMessage('website')} className="mt-4">
            <input id="f-url" className="field" type="url" inputMode="url" autoComplete="url" placeholder="https://" aria-invalid={Boolean(errors.website)} {...register('website')} />
          </Field>
          <Field
            id="f-details"
            label={t('message')}
            required
            hint={tc('detailsHint', { max: MESSAGE_MAX.toLocaleString('en') })}
            counter={t('messageHint', { count: message.length, max: MESSAGE_MAX })}
            error={errorMessage('message')}
            className="mt-4"
          >
            <textarea id="f-details" className="field" maxLength={MESSAGE_MAX} placeholder={t('messagePlaceholder')} aria-invalid={Boolean(errors.message)} aria-required="true" {...register('message')} />
          </Field>

          <div className="mt-4">
            <input
              ref={fileInputRef}
              id="f-file"
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="peer sr-only"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setFileError(null);
              }}
            />
            {file ? (
              <div className="flex items-center justify-between gap-3 rounded-[14px] border border-ln2 p-4 text-[15px]">
                <span className="min-w-0 truncate">
                  {file.name} <span className="text-t3">· {formatBytes(file.size)}</span>
                </span>
                <button
                  type="button"
                  aria-label={t('attachmentRemove')}
                  className="grid size-9 flex-none place-items-center rounded-full border border-ln2 hover:border-acct"
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  <Close size={16} />
                </button>
              </div>
            ) : (
              <label
                htmlFor="f-file"
                className="flex cursor-pointer items-center gap-3.5 rounded-[14px] border border-dashed border-ln2 p-[18px] text-[15px] text-t2 hover:border-acct peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-acct"
              >
                <Upload size={20} stroke="#D4FF3A" />
                {tc('attach')}
              </label>
            )}
            {fileError && (
              <p role="alert" className="field-error">
                {fileError}
              </p>
            )}
          </div>

          <div className="mt-5">
            <label className="flex items-center gap-3 text-[15px] text-t2">
              <input type="checkbox" className="size-5 flex-none accent-[#D4FF3A]" aria-invalid={Boolean(errors.privacy)} {...register('privacy')} />
              <span>
                {t.rich('privacy', {
                  link: (chunks) => (
                    <Link href="/privacy" className="text-acct underline underline-offset-2">
                      {chunks}
                    </Link>
                  ),
                })}
              </span>
            </label>
            {errors.privacy && (
              <p role="alert" className="field-error">
                {errorMessage('privacy')}
              </p>
            )}
          </div>

          <p className="mono mt-6 rounded-[14px] bg-bg p-4 text-[13px] text-t3">
            {[
              values.service ? t(`serviceOptions.${values.service}` as never) : null,
              values.budget ? t(`budgetOptions.${values.budget}` as never) : null,
              values.timeline ? t(`timelineOptions.${values.timeline}` as never) : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>

          {publicEnv.turnstileSiteKey && (
            <div className="mt-6">
              <Turnstile
                siteKey={publicEnv.turnstileSiteKey}
                onSuccess={setTurnstileToken}
                onExpire={() => setTurnstileToken(null)}
                onError={() => setTurnstileToken(null)}
                options={{ theme: 'auto', size: 'flexible' }}
              />
            </div>
          )}
        </fieldset>
      )}

      {formError && (
        <div role="alert" className="mt-6 rounded-[14px] border border-[#ff8a3d55] bg-[#ff8a3d14] px-4 py-3 text-sm">
          <strong className="font-semibold">{t('errorTitle')}</strong> {formError}
        </div>
      )}

      <div className="mt-10 flex justify-between gap-3">
        <button type="button" onClick={back} disabled={step === 0} className="btn btn-g h-14 px-6 text-base">
          ← {tc('back')}
        </button>
        {step < LEAD_STEPS.length - 1 ? (
          <button type="button" onClick={next} className="btn btn-p h-14 px-7 text-base">
            {tc('continue')}
            <ArrowRight />
          </button>
        ) : (
          <button type="submit" disabled={status === 'submitting'} className="btn btn-p shine h-14 px-7 text-base">
            {status === 'submitting' ? t('submitting') : tc('send')}
            <ArrowRight />
          </button>
        )}
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  required,
  hint,
  counter,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  counter?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span aria-hidden="true"> *</span>}
        {hint && <span className="text-t3"> — {hint}</span>}
      </label>
      {children}
      <div className="flex justify-between gap-3">
        {error ? (
          <p role="alert" className="field-error">
            {error}
          </p>
        ) : (
          <span />
        )}
        {counter && <span className="mt-1.5 text-xs text-t3">{counter}</span>}
      </div>
    </div>
  );
}

/** Single-choice chips with radio semantics (arrow keys move the choice). */
function ChipGroup({
  label,
  value,
  options,
  onChange,
  error,
  caption = false,
  grid = false,
}: {
  label: string;
  value: string | undefined;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  error?: string;
  caption?: boolean;
  grid?: boolean;
}) {
  const id = React.useId();
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = options.findIndex((option) => option.value === value);

  return (
    <div className="mt-7">
      <p id={id} className={caption ? 'label' : 'sr-only'}>
        {label}
      </p>
      <div
        role="radiogroup"
        aria-labelledby={id}
        aria-invalid={Boolean(error)}
        className={cn('mt-3 gap-2.5', grid ? 'grid [grid-template-columns:repeat(auto-fit,minmax(min(180px,100%),1fr))]' : 'flex flex-wrap')}
      >
        {options.map((option, index) => {
          const checked = option.value === value;
          return (
            <button
              key={option.value}
              ref={(node) => {
                refs.current[index] = node;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked || (selectedIndex === -1 && index === 0) ? 0 : -1}
              onClick={() => onChange(option.value)}
              onKeyDown={(event) => {
                const delta = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 0;
                if (!delta) return;
                event.preventDefault();
                const nextIndex = (index + delta + options.length) % options.length;
                onChange(options[nextIndex].value);
                refs.current[nextIndex]?.focus();
              }}
              className={cn(
                'chip border border-ln2 bg-transparent text-fg',
                grid ? 'h-16 rounded-2xl px-[18px] text-left text-[17px] font-semibold' : 'h-[52px] rounded-full px-[22px] text-base font-medium',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
