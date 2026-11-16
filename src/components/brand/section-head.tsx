import type { ReactNode } from 'react';
import { Accent } from './accent';
import { cn } from '@/lib/utils';

/**
 * Section opener: mono eyebrow, display heading with an italic accent, and an
 * optional action (usually an outline link) aligned to the heading's baseline.
 */
export function SectionHead({
  kicker,
  title,
  action,
  autoLast = false,
  plainAccent = false,
  as: Heading = 'h2',
  className,
  titleClassName,
  id,
}: {
  kicker?: string;
  title: string;
  action?: ReactNode;
  autoLast?: boolean;
  plainAccent?: boolean;
  as?: 'h1' | 'h2';
  className?: string;
  titleClassName?: string;
  id?: string;
}) {
  return (
    <div className={cn('reveal flex flex-wrap items-end justify-between gap-6', className)}>
      <div>
        {kicker && <p className="eyebrow">{kicker}</p>}
        <Heading id={id} className={cn('h-section mt-5 max-w-[880px]', titleClassName)}>
          <Accent text={title} autoLast={autoLast} plain={plainAccent} />
        </Heading>
      </div>
      {action}
    </div>
  );
}

/** "(01) — SERVICES" — the numbered kicker used on the home page. */
export function numberedKicker(index: number, label: string): string {
  return `(${String(index).padStart(2, '0')}) — ${label.toUpperCase()}`;
}
