'use client';

import * as React from 'react';
import type { TocEntry } from '@/lib/content/html';
import { useScrollSpy } from '@/lib/hooks/use-scroll-spy';
import { cn } from '@/lib/utils';

/** Sticky article table of contents with a scroll-spy highlight. */
export function TableOfContents({ entries, label }: { entries: TocEntry[]; label: string }) {
  const ids = React.useMemo(() => entries.map((entry) => entry.id), [entries]);
  const activeId = useScrollSpy(ids);

  return (
    <nav aria-label={label} className="lg:sticky lg:top-28">
      <p className="text-xs font-medium uppercase tracking-wider text-subtle-foreground">{label}</p>
      <ul className="mt-4 space-y-1 border-l border-border">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className={cn(
                '-ml-px block border-l py-1.5 text-sm transition-colors',
                entry.level === 3 ? 'pl-7' : 'pl-4',
                activeId === entry.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted-foreground hover:border-border-strong hover:text-foreground',
              )}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
