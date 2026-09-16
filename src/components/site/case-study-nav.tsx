'use client';

import * as React from 'react';
import { useScrollSpy } from '@/lib/hooks/use-scroll-spy';
import { cn } from '@/lib/utils';

export interface CaseStudySection {
  id: string;
  label: string;
}

/**
 * Case-study index.
 *
 * Two presentations of the same list, chosen by viewport rather than duplicated
 * in the markup:
 *
 *   - a sticky numbered rail beside the content on large screens
 *   - a horizontally scrollable chip row pinned under the header on small ones,
 *     where a vertical rail would eat most of the screen
 *
 * A case study runs to four sections at most, so this is orientation rather
 * than navigation — it exists to show where you are in the story.
 */
export function CaseStudyNav({
  sections,
  label,
}: {
  sections: CaseStudySection[];
  label: string;
}) {
  const ids = React.useMemo(() => sections.map((section) => section.id), [sections]);
  const activeId = useScrollSpy(ids);

  if (sections.length < 2) return null;

  return (
    <>
      {/* Mobile: a compact rail that stays under the sticky header. */}
      <nav
        aria-label={label}
        className="sticky top-16 z-30 -mx-5 border-b border-border bg-background/85 backdrop-blur-lg md:-mx-8 lg:hidden"
      >
        <ul className="scrollbar-none flex gap-1 overflow-x-auto px-5 py-2.5 md:px-8">
          {sections.map((section, index) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={activeId === section.id ? 'true' : undefined}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm transition-colors',
                  activeId === section.id
                    ? 'border-accent-border bg-accent-subtle text-accent'
                    : 'border-border text-muted-foreground',
                )}
              >
                <span className="font-mono text-[0.6875rem] opacity-70">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Desktop: a numbered rail that sits alongside the story. */}
      <nav aria-label={label} className="hidden lg:sticky lg:top-28 lg:block">
        <ol className="space-y-1">
          {sections.map((section, index) => {
            const active = activeId === section.id;
            return (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  aria-current={active ? 'true' : undefined}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg py-2 pl-3 pr-2 text-sm transition-colors',
                    active
                      ? 'bg-accent-subtle text-accent'
                      : 'text-muted-foreground hover:bg-surface-sunken hover:text-foreground',
                  )}
                >
                  <span
                    className={cn(
                      'font-mono text-xs transition-colors',
                      active ? 'text-accent' : 'text-subtle-foreground',
                    )}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="font-medium">{section.label}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
