import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn, formatPercent } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

/** Page title + breadcrumb + actions row used by every admin screen. */
export function AdminPageHeader({
  title,
  description,
  breadcrumbs,
  actions,
}: {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 md:mb-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            {breadcrumbs.map((crumb, index) => (
              <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                {index > 0 && <span className="text-subtle-foreground">/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="transition-colors hover:text-accent">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

/** Panel wrapper — the elevated surface the admin canvas sits on. */
export function AdminPanel({
  title,
  description,
  actions,
  className,
  bodyClassName,
  children,
}: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn('rounded-xl border border-border bg-surface', className)}>
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-medium text-foreground">{title}</h2>}
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn('p-5', bodyClassName)}>{children}</div>
    </section>
  );
}

/**
 * KPI card with a period-over-period comparison (spec §44).
 *
 * `change` is null when the previous period had no data — we show a dash
 * rather than inventing a percentage.
 */
export function StatCard({
  label,
  value,
  change,
  hint,
  invertChange = false,
}: {
  label: string;
  value: string;
  change?: number | null;
  hint?: string;
  /** For metrics where down is good, such as bounce rate. */
  invertChange?: boolean;
}) {
  const positive = change != null && (invertChange ? change < 0 : change > 0);
  const negative = change != null && (invertChange ? change > 0 : change < 0);

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-subtle-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
        {value}
      </p>

      <div className="mt-2 flex items-center gap-2">
        {change == null ? (
          <span className="inline-flex items-center gap-1 text-xs text-subtle-foreground">
            <Minus className="size-3" aria-hidden="true" />
            No comparison
          </span>
        ) : (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-medium tabular-nums',
              positive && 'text-success',
              negative && 'text-danger',
              !positive && !negative && 'text-subtle-foreground',
            )}
          >
            {change > 0 ? (
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            ) : change < 0 ? (
              <ArrowDownRight className="size-3.5" aria-hidden="true" />
            ) : (
              <Minus className="size-3" aria-hidden="true" />
            )}
            {formatPercent(change)}
          </span>
        )}
        {hint && <span className="text-xs text-subtle-foreground">{hint}</span>}
      </div>
    </div>
  );
}

/** Empty state (spec §88). */
export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {icon && (
        <span className="mb-4 flex size-11 items-center justify-center rounded-full bg-surface-sunken text-subtle-foreground">
          {icon}
        </span>
      )}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Error state used when an integration or query fails (spec §88). */
export function ErrorState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3">
      <p className="text-sm font-medium text-danger">{title}</p>
      {description && <p className="mt-1 text-xs text-danger/80">{description}</p>}
    </div>
  );
}

/** Loading skeleton for panels and tables. */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-11 w-full" />
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-7 w-20" />
      <Skeleton className="mt-3 h-3 w-16" />
    </div>
  );
}

const STATUS_VARIANT = {
  published: 'success',
  draft: 'warning',
  archived: 'default',
} as const;

export function ContentStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={STATUS_VARIANT[status as keyof typeof STATUS_VARIANT] ?? 'default'}>
      {status.replace('_', ' ')}
    </Badge>
  );
}

/**
 * Translation status chips (spec §10).
 * Shows at a glance whether both languages are filled in.
 */
export function TranslationStatus({
  translations,
}: {
  translations: { en: boolean; sq: boolean };
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <LanguageChip flag="🇬🇧" code="EN" complete={translations.en} />
      <LanguageChip flag="🇦🇱" code="SQ" complete={translations.sq} />
    </span>
  );
}

function LanguageChip({
  flag,
  code,
  complete,
}: {
  flag: string;
  code: string;
  complete: boolean;
}) {
  return (
    <span
      title={complete ? `${code} translated` : `${code} missing`}
      className={cn(
        'inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium',
        complete
          ? 'border-success/30 bg-success/10 text-success'
          : 'border-border bg-surface-sunken text-subtle-foreground',
      )}
    >
      <span aria-hidden="true">{flag}</span>
      {code}
      <span aria-hidden="true">{complete ? '✓' : '—'}</span>
      <span className="sr-only">{complete ? 'translated' : 'missing'}</span>
    </span>
  );
}
