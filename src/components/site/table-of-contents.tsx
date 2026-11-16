'use client';

import * as React from 'react';
import type { TocEntry } from '@/lib/content/html';
import { useScrollSpy } from '@/lib/hooks/use-scroll-spy';

/** Sticky "On this page" list with a scroll-spy highlight. */
export function TableOfContents({ entries, label }: { entries: TocEntry[]; label: string }) {
  const ids = React.useMemo(() => entries.map((entry) => entry.id), [entries]);
  const activeId = useScrollSpy(ids);

  return (
    <nav aria-label={label} className="toc sticky top-28 flex max-h-[calc(100vh-140px)] flex-col gap-3.5 overflow-y-auto pr-2 text-[15px]">
      <p className="label">{label}</p>
      <ul className="flex flex-col gap-3">
        {entries.map((entry) => (
          <li key={entry.id} className={entry.level === 3 ? 'pl-4' : undefined}>
            <a href={`#${entry.id}`} aria-current={activeId === entry.id ? 'true' : undefined} className="block text-t1">
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
