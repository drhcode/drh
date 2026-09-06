'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import type { ProjectView } from '@/lib/data/types';
import { ProjectCard } from '@/components/sections/project-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type WorkFilterKey =
  | 'all'
  | 'websites'
  | 'webApps'
  | 'mobileApps'
  | 'ecommerce'
  | 'seo'
  | 'branding';

/** Category chips map onto real service slugs, so filters stay CMS-driven. */
export const WORK_FILTERS: { key: WorkFilterKey; services: string[] }[] = [
  { key: 'all', services: [] },
  { key: 'websites', services: ['web-development', 'wordpress-development'] },
  { key: 'webApps', services: ['web-app-development'] },
  { key: 'mobileApps', services: ['mobile-app-development'] },
  { key: 'ecommerce', services: ['ecommerce-development'] },
  { key: 'seo', services: ['seo', 'google-ads'] },
  { key: 'branding', services: ['ui-ux-design'] },
];

const FILTER_LABEL: Record<WorkFilterKey, string> = {
  all: 'filterAll',
  websites: 'filterWebsites',
  webApps: 'filterWebApps',
  mobileApps: 'filterMobileApps',
  ecommerce: 'filterEcommerce',
  seo: 'filterSeo',
  branding: 'filterBranding',
};

const PAGE_SIZE = 9;

export function WorkGrid({
  projects,
  industries,
}: {
  projects: ProjectView[];
  industries: { slug: string; title: string }[];
}) {
  const t = useTranslations('work');
  const tCommon = useTranslations('common');

  const [filter, setFilter] = React.useState<string>('all');
  const [industry, setIndustry] = React.useState<string>('all');
  const [visible, setVisible] = React.useState(PAGE_SIZE);
  const [lastFilterKey, setLastFilterKey] = React.useState('all|all');

  // Only show chips that would actually return something.
  const availableFilters = React.useMemo(
    () =>
      WORK_FILTERS.filter(
        (option) =>
          option.key === 'all' ||
          projects.some((project) =>
            project.services.some((service) => option.services.includes(service.slug)),
          ),
      ),
    [projects],
  );

  const availableIndustries = React.useMemo(
    () => industries.filter((i) => projects.some((p) => p.industry?.slug === i.slug)),
    [industries, projects],
  );

  const filtered = React.useMemo(() => {
    const option = WORK_FILTERS.find((o) => o.key === filter);
    return projects.filter((project) => {
      const matchesService =
        !option || option.services.length === 0
          ? true
          : project.services.some((service) => option.services.includes(service.slug));
      const matchesIndustry = industry === 'all' || project.industry?.slug === industry;
      return matchesService && matchesIndustry;
    });
  }, [projects, filter, industry]);

  // Changing a filter resets pagination. Adjusting state during render is the
  // React-recommended pattern here — an effect would render the stale page first.
  const filterKey = `${filter}|${industry}`;
  if (filterKey !== lastFilterKey) {
    setLastFilterKey(filterKey);
    setVisible(PAGE_SIZE);
  }

  const shown = filtered.slice(0, visible);
  const isFiltered = filter !== 'all' || industry !== 'all';

  return (
    <div>
      <div className="flex flex-col gap-4 border-y border-border py-5 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="scrollbar-thin -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
          role="group"
          aria-label={t('filterByService')}
        >
          {availableFilters.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setFilter(option.key)}
              aria-pressed={filter === option.key}
              className={cn(
                'whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                filter === option.key
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground',
              )}
            >
              {t(FILTER_LABEL[option.key])}
            </button>
          ))}
        </div>

        {availableIndustries.length > 1 && (
          <div className="flex items-center gap-3">
            <label htmlFor="industry-filter" className="shrink-0 text-sm text-muted-foreground">
              {t('filterByIndustry')}
            </label>
            <select
              id="industry-filter"
              value={industry}
              onChange={(event) => setIndustry(event.target.value)}
              className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25"
            >
              <option value="all">{t('allIndustries')}</option>
              {availableIndustries.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <p className="mt-6 text-sm text-subtle-foreground" aria-live="polite">
        {t('showing', { count: shown.length, total: filtered.length })}
      </p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="text-muted-foreground">{t('empty')}</p>
          {isFiltered && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilter('all');
                setIndustry('all');
              }}
            >
              <X className="size-3.5" />
              {t('clearFilters')}
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((project, index) => (
              <ProjectCard key={project.slug} project={project} priority={index < 3} />
            ))}
          </div>

          {visible < filtered.length && (
            <div className="mt-14 flex justify-center">
              <Button variant="outline" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                {tCommon('loadMore')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
