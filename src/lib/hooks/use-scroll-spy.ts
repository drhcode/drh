'use client';

import * as React from 'react';

/**
 * Tracks which of a set of sections is currently being read.
 *
 * Shared by the article table of contents and the case-study index so there is
 * one definition of "the section you are on" rather than two that drift apart.
 *
 * The root margin is what makes it feel right: the top inset clears the sticky
 * header, and the large bottom inset means a section only becomes active once
 * it has actually reached the upper part of the viewport, instead of the moment
 * its first pixel appears.
 */
export function useScrollSpy(ids: string[], topOffset = 96): string | null {
  const [activeId, setActiveId] = React.useState<string | null>(ids[0] ?? null);

  // Observers are rebuilt only when the set of ids genuinely changes, not on
  // every render that happens to produce a new array.
  const key = ids.join('|');

  React.useEffect(() => {
    const sections = key
      .split('|')
      .filter(Boolean)
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: `-${topOffset}px 0px -70% 0px`, threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [key, topOffset]);

  return activeId;
}
