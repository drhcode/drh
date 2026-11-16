'use client';

import * as React from 'react';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from '@/components/brand/icons';
import { industryColor } from './industry-colors';

export interface IndustryItem {
  slug: string;
  title: string;
  insight: string | null;
  build: string[];
}

/**
 * Industries master/detail: a tab list of sectors and a panel describing the
 * selected one. Proper ARIA tabs (arrow keys move between sectors), and the
 * panel links through to each industry's own page.
 */
export function IndustryExplorer({
  items,
  labels,
}: {
  items: IndustryItem[];
  labels: { list: string; counter: string; build: string; next: string; more: string };
}) {
  const [active, setActive] = React.useState(0);
  const tabs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const id = React.useId();
  if (items.length === 0) return null;
  const current = items[active];
  const n = String(active + 1).padStart(2, '0');

  const select = (index: number, focus = false) => {
    setActive(index);
    if (focus) tabs.current[index]?.focus();
  };

  return (
    <div className="flex flex-wrap items-start gap-8">
      <div role="tablist" aria-label={labels.list} aria-orientation="vertical" className="flex flex-[1_1_380px] flex-col border-t border-ln">
        {items.map((item, index) => {
          const selected = index === active;
          return (
            <button
              key={item.slug}
              ref={(node) => {
                tabs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${index}`}
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(index)}
              onKeyDown={(event) => {
                const delta = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
                if (event.key === 'Home') {
                  event.preventDefault();
                  select(0, true);
                } else if (event.key === 'End') {
                  event.preventDefault();
                  select(items.length - 1, true);
                } else if (delta) {
                  event.preventDefault();
                  select((index + delta + items.length) % items.length, true);
                }
              }}
              className={`ind flex cursor-pointer items-center gap-5 border-b border-ln px-4 py-5 text-left text-[22px] font-medium tracking-[-0.02em] ${
                selected ? 'bg-fg text-bg' : 'bg-transparent text-t1 hover:text-fg'
              }`}
            >
              <span className="mono min-w-6 text-xs opacity-70">{String(index + 1).padStart(2, '0')}</span>
              {item.title}
            </button>
          );
        })}
      </div>

      <div className="sticky top-28 min-w-0 flex-[1.4_1_520px]">
        <div
          key={current.slug}
          role="tabpanel"
          id={`${id}-panel`}
          aria-labelledby={`${id}-tab-${active}`}
          className="swap overflow-hidden rounded-[32px] border border-ln bg-s1"
        >
          <div className="relative flex h-[260px] items-end overflow-hidden p-8 max-sm:h-[180px]" style={{ background: industryColor(current.slug, active) }}>
            {/* Decorative numeral drawn as generated content, so it is not read or contrast-checked as text. */}
            <span
              aria-hidden="true"
              data-n={n}
              className="absolute -right-5 -top-10 text-[280px] font-bold leading-none tracking-[-0.08em] text-[#0b0d0c22] before:content-[attr(data-n)]"
            />
            <span className="mono relative rounded-full bg-ink px-3.5 py-2 text-xs tracking-[.08em] text-[#F2F4F0]">
              {labels.counter.replace('{n}', n).replace('{total}', String(items.length).padStart(2, '0'))}
            </span>
          </div>
          <div className="p-[clamp(28px,4vw,48px)]">
            <h2 className="m-0 text-[clamp(36px,4vw,56px)] font-semibold leading-none tracking-[-0.04em]">{current.title}</h2>
            {current.insight && <p className="mt-5 text-xl leading-[1.55] text-t1">{current.insight}</p>}
            {current.build.length > 0 && (
              <>
                <h3 className="eyebrow m-0 mt-9 text-xs font-normal">{labels.build}</h3>
                <ul className="mt-3.5 flex flex-wrap gap-2">
                  {current.build.map((label) => (
                    <li key={label} className="rounded-full border border-ln2 px-4 py-2.5 text-[15px]">
                      {label}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href={`/industries/${current.slug}`} className="btn btn-p btn-md">
                {labels.more}
                <ArrowRight />
              </Link>
              <button type="button" className="btn btn-g btn-md" onClick={() => select((active + 1) % items.length)}>
                {labels.next} →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
