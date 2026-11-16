'use client';

import * as React from 'react';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from '@/components/brand/icons';

export type ServiceGroup = 'build' | 'design' | 'grow';

export interface ServiceRow {
  slug: string;
  title: string;
  description: string | null;
  group: ServiceGroup;
}

/** Filterable service list. Filters are toggle buttons; the list is a plain list. */
export function ServiceFilter({
  rows,
  labels,
}: {
  rows: ServiceRow[];
  labels: { filter: string; all: string; groups: Record<ServiceGroup, string>; tabs: Record<ServiceGroup, string> };
}) {
  const [tab, setTab] = React.useState<'all' | ServiceGroup>('all');
  const tabs: ('all' | ServiceGroup)[] = ['all', 'build', 'design', 'grow'];
  const visible = tab === 'all' ? rows : rows.filter((row) => row.group === tab);

  return (
    <>
      <div role="group" aria-label={labels.filter} className="flex flex-wrap gap-2">
        {tabs.map((id) => {
          const count = id === 'all' ? rows.length : rows.filter((row) => row.group === id).length;
          if (count === 0) return null;
          return (
            <button key={id} type="button" className="pill-tab" aria-pressed={tab === id} onClick={() => setTab(id)}>
              {id === 'all' ? labels.all : labels.tabs[id]}
              <span className="mono ml-1.5 opacity-60">{count}</span>
            </button>
          );
        })}
      </div>
      <ul className="mt-10 border-t border-ln" aria-live="polite">
        {visible.map((row) => (
          <li key={row.slug}>
            <Link
              href={`/services/${row.slug}`}
              className="srow flex flex-wrap items-center gap-x-10 gap-y-6 border-b border-ln px-4 py-9 text-fg max-sm:px-0"
            >
              <span className="mono min-w-8 text-[13px] text-t3">
                {String(rows.indexOf(row) + 1).padStart(2, '0')}
              </span>
              <span className="stitle flex-[1_1_360px] text-[clamp(28px,3.4vw,48px)] font-semibold leading-[1.05] tracking-[-0.035em]">
                {row.title}
              </span>
              {row.description && (
                <span className="flex-[1_1_320px] text-base leading-relaxed text-t3">{row.description}</span>
              )}
              <span className="mono hide-sm flex-[0_0_160px] text-xs tracking-[.06em] text-t2">{labels.groups[row.group]}</span>
              <span className="arrow-dot size-[52px] border border-ln2">
                <ArrowRight size={20} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
