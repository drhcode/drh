'use client';

import * as React from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { cn } from '@/lib/utils';

export interface ServiceListItem {
  slug: string;
  title: string;
  shortDescription: string | null;
  coverImage: string | null;
}

/**
 * Services as an editorial index rather than a grid of boxes.
 *
 * Each row is one large link. On a desktop pointer, the hovered service's
 * cover image floats beside the cursor; every cover is mounted once and
 * cross-faded, so moving between rows never waits on a network request.
 * The preview is decoration — the row itself carries the title and copy —
 * so it is aria-hidden, and it is skipped entirely for touch and for
 * reduced motion (the rows keep their colour-only hover).
 */
export function ServiceList({
  services,
  learnMore,
}: {
  services: ServiceListItem[];
  learnMore: string;
}) {
  const reduced = useReducedMotion();
  const previewRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState<number | null>(null);
  const hasCovers = services.some((service) => service.coverImage);

  // Follow the cursor with a little lag. One rAF loop, transform only,
  // running only while a row is hovered.
  React.useEffect(() => {
    const preview = previewRef.current;
    if (!preview || reduced || active === null) return;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let started = false;
    let frame = 0;

    function onMove(event: PointerEvent) {
      if (event.pointerType !== 'mouse') return;
      target.x = event.clientX;
      target.y = event.clientY;
      if (!started) {
        current.x = target.x;
        current.y = target.y;
        started = true;
      }
    }

    function tick() {
      current.x += (target.x - current.x) * 0.16;
      current.y += (target.y - current.y) * 0.16;
      // Rotate slightly with horizontal speed — a hint of physical weight.
      const tilt = Math.max(-6, Math.min(6, (target.x - current.x) * 0.08));
      // Below-right of the cursor, so it never covers the title being pointed at.
      preview!.style.transform = `translate3d(${current.x + 32}px, ${current.y + 24}px, 0) rotate(${tilt}deg)`;
      frame = requestAnimationFrame(tick);
    }

    window.addEventListener('pointermove', onMove, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, [active, reduced]);

  return (
    <>
      <ul className="border-t border-border" onPointerLeave={() => setActive(null)}>
        {services.map((service, index) => (
          <li key={service.slug}>
            <Link
              href={`/services/${service.slug}`}
              onPointerEnter={(event) => event.pointerType === 'mouse' && setActive(index)}
              onFocus={() => setActive(null)}
              className="group relative isolate grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-b border-border py-7 md:grid-cols-[4.5rem_minmax(0,1.1fr)_minmax(0,1fr)_3rem] md:gap-x-8 md:py-9"
            >
              {/* Hover band: sweeps in from the left behind the row. */}
              <span
                aria-hidden="true"
                className="absolute inset-y-0 -left-4 -right-4 -z-10 origin-left scale-x-0 rounded-xl bg-surface transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 md:-left-6 md:-right-6"
              />

              <span className="self-start pt-2 font-mono text-xs text-subtle-foreground transition-colors group-hover:text-accent md:self-center md:pt-0 md:text-sm">
                {String(index + 1).padStart(2, '0')}
              </span>

              <h3 className="font-serif text-[1.75rem] font-normal leading-[1.05] tracking-[-0.01em] text-foreground transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2 sm:text-[2.1rem] md:text-[2.6rem]">
                {service.title}
              </h3>

              <span className="col-start-3 row-start-1 flex size-11 items-center justify-center self-start rounded-full border border-border-strong text-foreground transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-accent-foreground md:col-start-4 md:size-12 md:self-center">
                <ArrowUpRight className="size-5 transition-transform duration-300 group-hover:rotate-45" />
                <span className="sr-only">{learnMore}</span>
              </span>

              {service.shortDescription && (
                <p className="col-start-2 col-end-4 text-sm leading-relaxed text-muted-foreground md:col-start-3 md:col-end-4 md:row-start-1 md:text-[0.9375rem]">
                  {service.shortDescription}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>

      {hasCovers && !reduced && (
        <div
          ref={previewRef}
          aria-hidden="true"
          className={cn(
            'pointer-events-none fixed left-0 top-0 z-40 hidden aspect-[3/2] w-[18rem] overflow-hidden rounded-2xl border border-border-strong bg-surface shadow-lg transition-[opacity,scale] duration-300 ease-out lg:block',
            active === null ? 'scale-90 opacity-0' : 'scale-100 opacity-100',
          )}
        >
          {services.map((service, index) =>
            service.coverImage ? (
              <Image
                key={service.slug}
                src={service.coverImage}
                alt=""
                fill
                sizes="288px"
                className={cn(
                  'object-cover transition-opacity duration-300',
                  active === index ? 'opacity-100' : 'opacity-0',
                )}
              />
            ) : null,
          )}
        </div>
      )}
    </>
  );
}
