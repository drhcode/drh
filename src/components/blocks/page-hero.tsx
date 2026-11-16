import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { Accent } from '@/components/brand/accent';
import { HeroFx } from '@/components/fx/pointer-fx';
import { cn } from '@/lib/utils';

export interface Crumb {
  label: string;
  href?: string;
}

/** "Home / Services" — the last crumb is the current page. */
export function Crumbs({ items, label, className }: { items: Crumb[]; label: string; className?: string }) {
  return (
    <nav aria-label={label} className={cn('crumbs rise', className)}>
      <ol className="flex flex-wrap gap-x-1.5">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="inline-flex gap-1.5">
              {last || !item.href ? (
                <span aria-current={last ? 'page' : undefined}>{item.label}</span>
              ) : (
                <Link href={item.href}>{item.label}</Link>
              )}
              {!last && <span aria-hidden="true">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Interior page hero: grid ground with spotlight + ripple, breadcrumbs, a
 * display title with an italic accent, a lead paragraph and optional actions.
 * `visual` renders a decorative illustration (hidden on small screens).
 */
export function PageHero({
  crumbs,
  crumbsLabel,
  title,
  lead,
  children,
  visual,
  autoLast = false,
  titleClassName,
  className,
  aside,
}: {
  crumbs: Crumb[];
  crumbsLabel: string;
  title: string;
  lead?: ReactNode;
  children?: ReactNode;
  visual?: ReactNode;
  autoLast?: boolean;
  titleClassName?: string;
  className?: string;
  /** Content laid out beside the copy (e.g. a browser mock), not hidden on mobile. */
  aside?: ReactNode;
}) {
  return (
    <HeroFx className={cn('grid-bg border-b border-ln', className)}>
      {visual}
      <div className={cn('wrap relative pb-20 pt-[clamp(64px,9vw,120px)]', aside && 'flex flex-wrap items-center gap-14')}>
        <div className={cn(aside && 'min-w-0 flex-[1_1_560px]')}>
          <Crumbs items={crumbs} label={crumbsLabel} />
          <h1 className={cn('h-hero rise-t d1 mt-7', titleClassName)}>
            <Accent text={title} autoLast={autoLast} />
          </h1>
          {lead && <div className="lead rise-t d2 mt-9 max-w-[620px]">{lead}</div>}
          {children}
        </div>
        {aside}
      </div>
    </HeroFx>
  );
}
