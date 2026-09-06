'use client';

import * as React from 'react';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn, slugify } from '@/lib/utils';

/**
 * Building blocks shared by every admin editor.
 *
 * Kept deliberately plain: uncontrolled-friendly inputs with a consistent
 * label/hint/error shape, so each CMS module is mostly a description of its
 * fields rather than layout code.
 */

export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('rounded-xl border border-border bg-surface', className)}>
      <header className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </header>
      <div className="space-y-5 p-5">{children}</div>
    </section>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && (
          <span className="ml-0.5 text-accent" aria-label="required">
            *
          </span>
        )}
      </Label>
      <div className="mt-2">{children}</div>
      {hint && !error && <p className="mt-1.5 text-xs text-subtle-foreground">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField({
  label,
  name,
  hint,
  required,
  className,
  ...props
}: {
  label: string;
  name: string;
  hint?: string;
  required?: boolean;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Field label={label} htmlFor={name} hint={hint} required={required} className={className}>
      <Input id={name} name={name} required={required} {...props} />
    </Field>
  );
}

export function TextAreaField({
  label,
  name,
  hint,
  required,
  className,
  ...props
}: {
  label: string;
  name: string;
  hint?: string;
  required?: boolean;
  className?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Field label={label} htmlFor={name} hint={hint} required={required} className={className}>
      <Textarea id={name} name={name} required={required} {...props} />
    </Field>
  );
}

export function SelectField({
  label,
  name,
  options,
  hint,
  required,
  defaultValue,
  className,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  hint?: string;
  required?: boolean;
  defaultValue?: string;
  className?: string;
}) {
  return (
    <Field label={label} htmlFor={name} hint={hint} required={required} className={className}>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-[0.9375rem] text-foreground shadow-xs transition-colors hover:border-border-strong focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function SwitchField({
  label,
  description,
  name,
  defaultChecked,
}: {
  label: string;
  description?: string;
  name: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = React.useState(Boolean(defaultChecked));

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <Label htmlFor={name}>{label}</Label>
        {description && (
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {/* Hidden input keeps the value in the FormData payload. */}
      <input type="hidden" name={name} value={checked ? 'true' : 'false'} />
      <Switch id={name} checked={checked} onCheckedChange={setChecked} className="shrink-0" />
    </div>
  );
}

/** Title field that keeps a slug in sync until the slug is edited by hand. */
export function SlugField({
  titleName,
  slugName,
  titleLabel = 'Title',
  slugLabel = 'Slug',
  defaultTitle = '',
  defaultSlug = '',
  prefix,
  required = true,
}: {
  titleName: string;
  slugName: string;
  titleLabel?: string;
  slugLabel?: string;
  defaultTitle?: string;
  defaultSlug?: string;
  prefix?: string;
  required?: boolean;
}) {
  const [title, setTitle] = React.useState(defaultTitle);
  const [slug, setSlug] = React.useState(defaultSlug);
  const [touched, setTouched] = React.useState(Boolean(defaultSlug));

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label={titleLabel} htmlFor={titleName} required={required}>
        <Input
          id={titleName}
          name={titleName}
          value={title}
          required={required}
          onChange={(event) => {
            setTitle(event.target.value);
            if (!touched) setSlug(slugify(event.target.value));
          }}
        />
      </Field>

      <Field
        label={slugLabel}
        htmlFor={slugName}
        required={required}
        hint={prefix ? `${prefix}${slug || '…'}` : undefined}
      >
        <Input
          id={slugName}
          name={slugName}
          value={slug}
          required={required}
          onChange={(event) => {
            setTouched(true);
            setSlug(slugify(event.target.value));
          }}
        />
      </Field>
    </div>
  );
}

/**
 * Language tabs for translated content (spec §10).
 * Shows completion state so a missing Albanian translation is visible at a glance.
 */
export function BilingualTabs({
  english,
  albanian,
  englishComplete,
  albanianComplete,
}: {
  english: React.ReactNode;
  albanian: React.ReactNode;
  englishComplete?: boolean;
  albanianComplete?: boolean;
}) {
  return (
    <Tabs defaultValue="en">
      <TabsList>
        <TabsTrigger value="en">
          <span aria-hidden="true">🇬🇧</span> English
          <StatusDot complete={englishComplete} />
        </TabsTrigger>
        <TabsTrigger value="sq">
          <span aria-hidden="true">🇦🇱</span> Shqip
          <StatusDot complete={albanianComplete} />
        </TabsTrigger>
      </TabsList>

      <TabsContent value="en" className="mt-5 space-y-5">
        {english}
      </TabsContent>
      <TabsContent value="sq" className="mt-5 space-y-5">
        {albanian}
        {!albanianComplete && (
          <p className="rounded-lg border border-warning/30 bg-warning/8 px-3 py-2 text-xs text-foreground">
            Albanian is incomplete. Until it is filled in, the Albanian page falls back to English
            content and is excluded from the Albanian sitemap and hreflang.
          </p>
        )}
      </TabsContent>
    </Tabs>
  );
}

function StatusDot({ complete }: { complete?: boolean }) {
  return (
    <span
      className={cn('ml-1 size-1.5 rounded-full', complete ? 'bg-success' : 'bg-border-strong')}
      aria-label={complete ? 'translated' : 'missing'}
    />
  );
}

/** Repeatable key/value blocks — benefits, problems, result metrics, and so on. */
export interface RepeatableItem {
  [key: string]: string;
}

export function RepeatableFields({
  name,
  label,
  description,
  fields,
  defaultValue = [],
  addLabel = 'Add item',
  max = 20,
}: {
  name: string;
  label: string;
  description?: string;
  fields: { key: string; label: string; multiline?: boolean; placeholder?: string }[];
  defaultValue?: RepeatableItem[];
  addLabel?: string;
  max?: number;
}) {
  const [items, setItems] = React.useState<RepeatableItem[]>(
    defaultValue.length > 0 ? defaultValue : [],
  );

  const blank = React.useMemo(
    () => Object.fromEntries(fields.map((field) => [field.key, ''])) as RepeatableItem,
    [fields],
  );

  function update(index: number, key: string, value: string) {
    setItems((current) =>
      current.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    );
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    setItems((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <Label>{label}</Label>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={items.length >= max}
          onClick={() => setItems((current) => [...current, { ...blank }])}
        >
          <Plus className="size-3.5" />
          {addLabel}
        </Button>
      </div>

      {/* Serialised once so the server action receives a single JSON payload. */}
      <input type="hidden" name={name} value={JSON.stringify(items)} />

      {items.length === 0 ? (
        <p className="mt-3 rounded-lg border border-dashed border-border px-4 py-6 text-center text-xs text-subtle-foreground">
          Nothing added yet.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.map((item, index) => (
            <li key={index} className="rounded-lg border border-border bg-surface-sunken p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs text-subtle-foreground">
                  <GripVertical className="size-3.5" aria-hidden="true" />
                  {index + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="rounded px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                    aria-label={`Move item ${index + 1} up`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === items.length - 1}
                    className="rounded px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                    aria-label={`Move item ${index + 1} down`}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
                    className="rounded p-1 text-muted-foreground transition-colors hover:text-danger"
                    aria-label={`Remove item ${index + 1}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {fields.map((field) => (
                  <div key={field.key}>
                    <label className="sr-only" htmlFor={`${name}-${index}-${field.key}`}>
                      {field.label}
                    </label>
                    {field.multiline ? (
                      <Textarea
                        id={`${name}-${index}-${field.key}`}
                        value={item[field.key] ?? ''}
                        placeholder={field.placeholder ?? field.label}
                        onChange={(event) => update(index, field.key, event.target.value)}
                        rows={2}
                        className="min-h-16 text-sm"
                      />
                    ) : (
                      <Input
                        id={`${name}-${index}-${field.key}`}
                        value={item[field.key] ?? ''}
                        placeholder={field.placeholder ?? field.label}
                        onChange={(event) => update(index, field.key, event.target.value)}
                        className="h-9 text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Multi-select rendered as toggle chips — used for services and technologies. */
export function ChipMultiSelect({
  name,
  label,
  description,
  options,
  defaultValue = [],
}: {
  name: string;
  label: string;
  description?: string;
  options: { value: string; label: string }[];
  defaultValue?: string[];
}) {
  const [selected, setSelected] = React.useState<string[]>(defaultValue);

  function toggle(value: string) {
    setSelected((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  }

  return (
    <div>
      <Label>{label}</Label>
      {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      <input type="hidden" name={name} value={JSON.stringify(selected)} />

      <div className="mt-2.5 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggle(option.value)}
              aria-pressed={active}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                active
                  ? 'border-accent bg-accent-subtle text-accent'
                  : 'border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
