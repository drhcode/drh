import { Quote } from '@/components/brand/icons';
import type { TestimonialView } from '@/lib/data';
import { cn } from '@/lib/utils';
import { MarqueeTrack } from './marquee-track';

/**
 * Infinite marquees. The list is server-rendered once and cloned in the
 * browser for the seamless loop (see MarqueeTrack). Hovering or focusing
 * inside pauses the motion; reduced motion stops it.
 */
export function TechMarquee({ items, label }: { items: string[]; label: string }) {
  if (items.length === 0) return null;
  return (
    <section aria-label={label} className="overflow-hidden border-b border-ln py-7">
      <MarqueeTrack className="gap-14 pr-14">
        <ul className="flex gap-14">
          {items.map((item) => (
            <li
              key={item}
              className="flex items-center gap-14 whitespace-nowrap text-[28px] font-medium tracking-[-0.02em] text-t1 after:text-[22px] after:text-acct after:content-['✳'] max-sm:text-xl"
            >
              {item}
            </li>
          ))}
        </ul>
      </MarqueeTrack>
    </section>
  );
}

export function TestimonialMarquee({ testimonials }: { testimonials: TestimonialView[] }) {
  if (testimonials.length === 0) return null;
  return (
    <div className="mt-14 overflow-hidden">
      <MarqueeTrack className="marquee-slow gap-4 pr-4">
        <ul className="flex gap-4">
          {testimonials.map((item) => (
            <li key={item.id} className="flex">
              <figure className="m-0 flex w-[400px] flex-none flex-col gap-7 rounded-3xl border border-ln bg-s1 p-8 max-sm:w-[300px] max-sm:p-6">
                <Quote />
                <blockquote className="m-0 text-xl leading-[1.45] tracking-[-0.01em] max-sm:text-lg">{stripQuotes(item.quote)}</blockquote>
                <figcaption className="mt-auto flex items-center gap-3">
                  <span aria-hidden="true" className="grid size-11 place-items-center rounded-full bg-s2 font-semibold text-acct">
                    {item.clientName.charAt(0)}
                  </span>
                  <span>
                    <span className="block font-semibold">{item.company ?? item.clientName}</span>
                    {item.country && <span className="text-sm text-t3">{item.country}</span>}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </MarqueeTrack>
    </div>
  );
}

/** Some CMS quotes were entered with their own quotation marks. */
export function stripQuotes(text: string): string {
  return text.trim().replace(/^["“”]+|["“”]+$/g, '').trim();
}

/** Client names set as wordmarks, each in one of the design's type treatments. */
const WORDMARK_STYLES = [
  'text-[22px] font-extrabold tracking-[.04em] uppercase',
  'text-2xl font-semibold tracking-[-0.04em]',
  'font-[family-name:var(--font-serif-stack)] text-[26px] italic',
  'font-[family-name:var(--font-serif-stack)] text-[26px] italic',
  'font-jet text-lg font-medium',
  'text-lg font-light tracking-[.32em] uppercase',
  'text-[23px] font-bold tracking-[-0.03em]',
  'font-[family-name:var(--font-serif-stack)] text-2xl italic',
];

export function ClientWordmarks({ names, className }: { names: string[]; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap items-center gap-x-10 gap-y-3.5 text-t3', className)}>
      {names.map((name, index) => (
        <li key={name} className={cn('logo-w', WORDMARK_STYLES[index % WORDMARK_STYLES.length])}>
          {name}
        </li>
      ))}
    </ul>
  );
}
