'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { KanbanSquare, List, Search, X } from 'lucide-react';
import { LEAD_STATUSES, LEAD_STATUS_LABELS } from '@/lib/admin/leads';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { startRouteProgress } from '@/components/route-progress';

export interface FilterOptions {
  services: string[];
  budgets: string[];
  sources: string[];
  countries: string[];
}

/** Lead list filters and view switch (spec §50). State lives in the URL. */
export function LeadFilters({
  options,
  view,
}: {
  options: FilterOptions;
  view: 'list' | 'pipeline';
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = React.useState(searchParams.get('q') ?? '');

  const update = React.useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== 'all') params.set(key, value);
      else params.delete(key);
      startRouteProgress();
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  // Debounced search so each keystroke does not push a history entry.
  React.useEffect(() => {
    const current = searchParams.get('q') ?? '';
    if (query === current) return;

    const timer = setTimeout(() => update('q', query || null), 350);
    return () => clearTimeout(timer);
  }, [query, searchParams, update]);

  const activeFilters = ['status', 'service', 'budget', 'source', 'country', 'from', 'to', 'q'].filter(
    (key) => searchParams.get(key),
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground"
            aria-hidden="true"
          />
          <label htmlFor="lead-search" className="sr-only">
            Search leads by name, email or company
          </label>
          <Input
            id="lead-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email or company…"
            className="h-9 pl-9 text-sm"
          />
        </div>

        <div className="flex items-center rounded-lg border border-border bg-surface p-0.5">
          <ViewButton
            active={view === 'list'}
            onClick={() => update('view', null)}
            icon={<List className="size-3.5" />}
            label="List"
          />
          <ViewButton
            active={view === 'pipeline'}
            onClick={() => update('view', 'pipeline')}
            icon={<KanbanSquare className="size-3.5" />}
            label="Pipeline"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          label="Status"
          value={searchParams.get('status') ?? 'all'}
          onChange={(value) => update('status', value)}
          options={[
            { value: 'all', label: 'All statuses' },
            ...LEAD_STATUSES.map((status) => ({
              value: status,
              label: LEAD_STATUS_LABELS[status],
            })),
          ]}
        />
        <FilterSelect
          label="Service"
          value={searchParams.get('service') ?? 'all'}
          onChange={(value) => update('service', value)}
          options={[
            { value: 'all', label: 'All services' },
            ...options.services.map((value) => ({ value, label: value })),
          ]}
        />
        <FilterSelect
          label="Budget"
          value={searchParams.get('budget') ?? 'all'}
          onChange={(value) => update('budget', value)}
          options={[
            { value: 'all', label: 'All budgets' },
            ...options.budgets.map((value) => ({ value, label: value })),
          ]}
        />
        <FilterSelect
          label="Source"
          value={searchParams.get('source') ?? 'all'}
          onChange={(value) => update('source', value)}
          options={[
            { value: 'all', label: 'All sources' },
            ...options.sources.map((value) => ({ value, label: value })),
          ]}
        />
        <FilterSelect
          label="Country"
          value={searchParams.get('country') ?? 'all'}
          onChange={(value) => update('country', value)}
          options={[
            { value: 'all', label: 'All countries' },
            ...options.countries.map((value) => ({ value, label: value })),
          ]}
        />

        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="sr-only">From date</span>
          <input
            type="date"
            value={searchParams.get('from') ?? ''}
            onChange={(event) => update('from', event.target.value || null)}
            className="h-9 rounded-lg border border-border bg-surface px-2 text-sm text-foreground focus-visible:border-accent focus-visible:outline-none"
          />
        </label>
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="sr-only">To date</span>
          <input
            type="date"
            value={searchParams.get('to') ?? ''}
            onChange={(event) => update('to', event.target.value || null)}
            className="h-9 rounded-lg border border-border bg-surface px-2 text-sm text-foreground focus-visible:border-accent focus-visible:outline-none"
          />
        </label>

        {activeFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('');
              const params = new URLSearchParams();
              if (view === 'pipeline') params.set('view', 'pipeline');
              startRouteProgress();
              router.push(`${pathname}?${params.toString()}`);
            }}
          >
            <X className="size-3.5" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
        active
          ? 'bg-surface-sunken text-foreground'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  if (options.length <= 1) return null;

  return (
    <label className="inline-flex items-center">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 max-w-44 rounded-lg border border-border bg-surface px-2.5 text-sm text-foreground focus-visible:border-accent focus-visible:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
