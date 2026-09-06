'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { Turnstile } from '@marsidev/react-turnstile';
import { CheckCircle2, Loader2, Paperclip, X } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import {
  BUDGET_OPTIONS,
  MESSAGE_MAX,
  SERVICE_OPTIONS,
  TIMELINE_OPTIONS,
  leadFormSchema,
  type LeadFormValues,
} from '@/lib/leads/schema';
import { collectAttribution, recordVisit } from '@/lib/leads/attribution';
import { submitLead } from '@/app/actions/lead';
import { publicEnv } from '@/lib/env';
import { ANALYTICS_EVENTS, track, trackAdsConversion } from '@/lib/analytics/events';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn, formatBytes } from '@/lib/utils';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function ProjectInquiryForm() {
  const t = useTranslations('form');
  const locale = useLocale() as 'en' | 'sq';

  const [status, setStatus] = React.useState<Status>('idle');
  const [formError, setFormError] = React.useState<string | null>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = React.useState<string | null>(null);
  const startedRef = React.useRef(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: { language: locale, privacy: false as unknown as true, company_website: '' },
    mode: 'onBlur',
  });

  React.useEffect(() => {
    recordVisit();
  }, []);

  /*
   * react-hook-form keeps field state in refs by design, so `watch()` cannot be
   * memoized and the React Compiler skips this component. That is the library's
   * documented model, and those uncontrolled inputs are exactly why this form
   * stays responsive on mobile — a deliberate trade, not an oversight.
   */
  // eslint-disable-next-line react-hooks/incompatible-library
  const message = watch('message') ?? '';

  /** Fires once, the first time someone actually engages with the form. */
  const handleFirstInteraction = React.useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    track(ANALYTICS_EVENTS.projectFormStarted);
  }, []);

  async function onSubmit(values: LeadFormValues) {
    setStatus('submitting');
    setFormError(null);
    setFileError(null);

    const formData = new FormData();
    formData.set('name', values.name);
    formData.set('email', values.email);
    if (values.phone) formData.set('phone', values.phone);
    if (values.company) formData.set('company', values.company);
    if (values.website) formData.set('website', values.website);
    formData.set('service', values.service);
    formData.set('budget', values.budget);
    formData.set('timeline', values.timeline);
    formData.set('message', values.message);
    formData.set('privacy', String(Boolean(values.privacy)));
    formData.set('language', locale);
    formData.set('company_website', values.company_website ?? '');
    if (turnstileToken) formData.set('turnstileToken', turnstileToken);
    formData.set('attribution', JSON.stringify(collectAttribution()));
    if (file) formData.set('attachment', file);

    try {
      const result = await submitLead(formData);

      if (result.ok) {
        track(ANALYTICS_EVENTS.projectFormSubmitted, {
          service: values.service,
          budget: values.budget,
        });
        trackAdsConversion();
        setStatus('success');
        reset();
        setFile(null);
        return;
      }

      if (result.fieldErrors) {
        for (const [field, key] of Object.entries(result.fieldErrors)) {
          // The attachment is not part of the react-hook-form schema, so its
          // server-side errors are surfaced separately.
          if (field === 'attachment') {
            setFileError(t(`validation.${key}` as never, { max: MESSAGE_MAX }));
            continue;
          }
          setError(field as keyof LeadFormValues, {
            message: t(`validation.${key}` as never, { max: MESSAGE_MAX }),
          });
        }
      }

      setStatus('error');
      setFormError(
        result.errorKey === 'rateLimited'
          ? t('rateLimited')
          : result.errorKey === 'spamCheckFailed'
            ? t('spamCheckFailed')
            : t('errorBody', { email: 'info@drh.al' }),
      );
    } catch {
      setStatus('error');
      setFormError(t('errorBody', { email: 'info@drh.al' }));
    }
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        className="rounded-xl border border-border bg-surface p-8 text-center md:p-12"
      >
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/12 text-success">
          <CheckCircle2 className="size-6" aria-hidden="true" />
        </span>
        <h2 className="mt-6 text-2xl">{t('successTitle')}</h2>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
          {t('successBody')}
        </p>
        <p className="mt-3 text-sm text-subtle-foreground">{t('successNote')}</p>
        <Button
          variant="outline"
          className="mt-8"
          onClick={() => {
            setStatus('idle');
            startedRef.current = false;
          }}
        >
          {t('successAnother')}
        </Button>
      </div>
    );
  }

  const errorMessage = (field: keyof LeadFormValues) => {
    const raw = errors[field]?.message;
    if (!raw) return undefined;
    // Zod issues carry message *keys*, translated here.
    return raw.startsWith('form.') || raw.includes(' ')
      ? raw
      : t(`validation.${raw}` as never, { max: MESSAGE_MAX });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onFocus={handleFirstInteraction}
      noValidate
      className="space-y-6"
    >
      {/* Honeypot — visually hidden, never announced, never focusable */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
        <label htmlFor="company_website">Company website</label>
        <input
          id="company_website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register('company_website')}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label={t('fullName')}
          htmlFor="name"
          required
          error={errorMessage('name')}
          requiredLabel={t('required')}
        >
          <Input
            id="name"
            autoComplete="name"
            placeholder={t('fullNamePlaceholder')}
            aria-invalid={Boolean(errors.name)}
            {...register('name')}
          />
        </Field>

        <Field
          label={t('email')}
          htmlFor="email"
          required
          error={errorMessage('email')}
          requiredLabel={t('required')}
        >
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={t('emailPlaceholder')}
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
        </Field>

        <Field label={t('phone')} htmlFor="phone" optionalLabel={t('optional')}>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={t('phonePlaceholder')}
            {...register('phone')}
          />
        </Field>

        <Field label={t('company')} htmlFor="company" optionalLabel={t('optional')}>
          <Input
            id="company"
            autoComplete="organization"
            placeholder={t('companyPlaceholder')}
            {...register('company')}
          />
        </Field>

        <Field
          label={t('website')}
          htmlFor="website"
          optionalLabel={t('optional')}
          error={errorMessage('website')}
          className="sm:col-span-2"
        >
          <Input
            id="website"
            type="url"
            inputMode="url"
            autoComplete="url"
            placeholder={t('websitePlaceholder')}
            aria-invalid={Boolean(errors.website)}
            {...register('website')}
          />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <SelectField
          control={control}
          name="service"
          label={t('service')}
          placeholder={t('servicePlaceholder')}
          required
          requiredLabel={t('required')}
          error={errorMessage('service')}
          options={SERVICE_OPTIONS.map((value) => ({
            value,
            label: t(`serviceOptions.${value}` as never),
          }))}
        />

        <SelectField
          control={control}
          name="budget"
          label={t('budget')}
          placeholder={t('budgetPlaceholder')}
          required
          requiredLabel={t('required')}
          error={errorMessage('budget')}
          options={BUDGET_OPTIONS.map((value) => ({
            value,
            label: t(`budgetOptions.${value}` as never),
          }))}
        />

        <SelectField
          control={control}
          name="timeline"
          label={t('timeline')}
          placeholder={t('timelinePlaceholder')}
          required
          requiredLabel={t('required')}
          error={errorMessage('timeline')}
          options={TIMELINE_OPTIONS.map((value) => ({
            value,
            label: t(`timelineOptions.${value}` as never),
          }))}
        />
      </div>

      <Field
        label={t('message')}
        htmlFor="message"
        required
        requiredLabel={t('required')}
        error={errorMessage('message')}
        hint={t('messageHint', { count: message.length, max: MESSAGE_MAX })}
      >
        <Textarea
          id="message"
          rows={7}
          maxLength={MESSAGE_MAX}
          placeholder={t('messagePlaceholder')}
          aria-invalid={Boolean(errors.message)}
          {...register('message')}
        />
      </Field>

      {/* Attachment */}
      <div>
        <Label htmlFor="attachment">
          {t('attachment')}{' '}
          <span className="font-normal text-subtle-foreground">({t('optional')})</span>
        </Label>
        <div className="mt-2">
          <input
            ref={fileInputRef}
            id="attachment"
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="sr-only"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setFileError(null);
            }}
          />
          {file ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3.5 py-2.5">
              <span className="flex min-w-0 items-center gap-2 text-sm text-foreground">
                <Paperclip className="size-4 shrink-0 text-subtle-foreground" aria-hidden="true" />
                <span className="truncate">{file.name}</span>
                <span className="shrink-0 text-xs text-subtle-foreground">
                  {formatBytes(file.size)}
                </span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface-sunken hover:text-foreground"
                aria-label={t('attachmentRemove')}
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="size-4" />
              {t('attachmentChoose')}
            </Button>
          )}
        </div>
        <p className="mt-2 text-xs text-subtle-foreground">{t('attachmentHint')}</p>
        {fileError && (
          <p role="alert" className="mt-2 text-sm text-danger">
            {fileError}
          </p>
        )}
      </div>

      {/* Privacy consent */}
      <div>
        <div className="flex items-start gap-3">
          <Controller
            control={control}
            name="privacy"
            render={({ field }) => (
              <Checkbox
                id="privacy"
                checked={Boolean(field.value)}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                aria-invalid={Boolean(errors.privacy)}
                className="mt-0.5"
              />
            )}
          />
          <Label htmlFor="privacy" className="text-sm font-normal leading-relaxed">
            {t.rich('privacy', {
              link: (chunks) => (
                <Link href="/privacy" className="text-accent underline underline-offset-2">
                  {chunks}
                </Link>
              ),
            })}
          </Label>
        </div>
        {errors.privacy && (
          <p role="alert" className="mt-2 text-sm text-danger">
            {errorMessage('privacy')}
          </p>
        )}
      </div>

      {publicEnv.turnstileSiteKey && (
        <Turnstile
          siteKey={publicEnv.turnstileSiteKey}
          onSuccess={setTurnstileToken}
          onExpire={() => setTurnstileToken(null)}
          onError={() => setTurnstileToken(null)}
          options={{ theme: 'auto', size: 'flexible' }}
        />
      )}

      {formError && (
        <div
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/8 px-4 py-3 text-sm text-danger"
        >
          <strong className="font-medium">{t('errorTitle')}</strong> {formError}
        </div>
      )}

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" disabled={status === 'submitting'} className="w-full sm:w-auto">
          {status === 'submitting' && <Loader2 className="size-4 animate-spin" />}
          {status === 'submitting' ? t('submitting') : t('submit')}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required,
  requiredLabel,
  optionalLabel,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  requiredLabel?: string;
  optionalLabel?: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>
        {label}
        {required ? (
          <span className="ml-0.5 text-accent" aria-label={requiredLabel}>
            *
          </span>
        ) : optionalLabel ? (
          <span className="ml-1 font-normal text-subtle-foreground">({optionalLabel})</span>
        ) : null}
      </Label>
      <div className="mt-2">{children}</div>
      <div className="mt-2 flex items-start justify-between gap-3">
        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : (
          <span />
        )}
        {hint && <span className="shrink-0 text-xs text-subtle-foreground">{hint}</span>}
      </div>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function SelectField({
  control,
  name,
  label,
  placeholder,
  options,
  required,
  requiredLabel,
  error,
}: {
  control: any;
  name: 'service' | 'budget' | 'timeline';
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
  required?: boolean;
  requiredLabel?: string;
  error?: string;
}) {
  return (
    <Field label={label} htmlFor={name} required={required} requiredLabel={requiredLabel} error={error}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select value={field.value ?? ''} onValueChange={field.onChange}>
            <SelectTrigger id={name} aria-invalid={Boolean(error)} className={cn(!field.value && 'text-subtle-foreground')}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </Field>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
