'use client';

import type * as React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { ArrowRight, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HeroField } from './hero-field';
import { DimensionField } from '@/components/site/dimension-field';
import { AccentTitle } from '@/components/site/accent-title';

interface HeroSectionProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  body?: string;
  primaryCta?: string;
  primaryHref?: string;
  secondaryCta?: string;
  secondaryHref?: string;
  note?: string;
  /** Compact variant for inner pages. */
  size?: 'lg' | 'md';
  as?: 'h1' | 'h2';
  /**
   * Optional illustration beside the copy (below it on small screens). The
   * copy column narrows and the headline steps down a size to make room.
   */
  visual?: React.ReactNode;
  /**
   * Full-viewport hero with the particle field behind it. Used by the home
   * page only; every other hero stays compact and particle-free.
   */
  immersive?: boolean;
}

/**
 * Homepage and landing-page hero.
 *
 * The only entrance animation on the page: a short staggered fade-up, disabled
 * entirely under prefers-reduced-motion.
 */
export function HeroSection({
  eyebrow,
  title,
  subtitle,
  body,
  primaryCta,
  primaryHref = '/contact',
  secondaryCta,
  secondaryHref = '/work',
  note,
  size = 'lg',
  as: Heading = 'h1',
  visual,
  immersive = false,
}: HeroSectionProps) {
  const reduced = useReducedMotion();
  const t = useTranslations('hero');

  // Always animate to the visible state; reduced motion only makes it instant.
  // Dropping `animate` instead would strand the copy at its initial opacity:
  // `reduced` becomes known just after hydration, when the element has
  // already mounted with `initial` applied.
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: reduced
      ? { duration: 0 }
      : { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <section
      className={cn(
        'hero-top relative overflow-hidden',
        // svh, not vh: mobile browser toolbars would otherwise push the fold.
        immersive && 'flex min-h-[100svh] flex-col justify-center',
      )}
    >
      {immersive && <DimensionField />}
      {/* Structural grid that responds to the pointer — texture, not decoration */}
      <HeroField />

      <div className="container-page relative w-full">
        <div
          className={cn(
            visual && 'grid items-center gap-10 lg:grid-cols-12 lg:gap-6',
            // Immersive heroes are centred in the viewport by the section, so
            // they only need breathing room, not fixed top and bottom spacing.
            immersive
              ? 'py-10 md:py-14 lg:py-8'
              : size === 'lg'
                ? visual
                  ? 'pb-16 pt-14 md:pb-20 md:pt-20 lg:pb-24 lg:pt-24'
                  : 'pb-16 pt-20 md:pb-24 md:pt-28 lg:pb-28 lg:pt-32'
                : 'pb-12 pt-16 md:pb-16 md:pt-24',
          )}
        >
          <div className={cn('max-w-4xl', visual && 'lg:col-span-7')}>
            {eyebrow && (
              <motion.p
                {...rise(0)}
                className="pill-dimension mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                <span className="size-1.5 rounded-full bg-accent shadow-[0_0_10px_2px_var(--accent-glow)]" aria-hidden="true" />
                {eyebrow}
              </motion.p>
            )}

            <motion.div {...rise(0.06)}>
              <Heading
                className={cn(
                  'text-balance',
                  size === 'lg'
                    ? visual
                      ? 'text-[3rem] sm:text-6xl md:text-7xl lg:text-[4.75rem] xl:text-[5.5rem]'
                      : 'text-[3rem] sm:text-6xl md:text-7xl lg:text-[6.25rem]'
                    : 'text-[2.75rem] md:text-6xl lg:text-[4.5rem]',
                  // After the sizes: tailwind-merge drops a leading-* that precedes a text-* size.
                  'leading-[1]',
                )}
              >
                <AccentTitle text={title} autoLast />
              </Heading>
            </motion.div>

            {subtitle && (
              <motion.p
                {...rise(0.12)}
                className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground md:text-xl"
              >
                {subtitle}
              </motion.p>
            )}

            {body && (
              <motion.div {...rise(0.18)} className="mt-5 max-w-2xl space-y-4">
                {body.split(/\n{2,}/).map((paragraph, index) => (
                  <p key={index} className="text-base leading-relaxed text-muted-foreground md:text-[1.0625rem]">
                    {paragraph}
                  </p>
                ))}
              </motion.div>
            )}

            {(primaryCta || secondaryCta) && (
              <motion.div {...rise(0.24)} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                {primaryCta && (
                  <Button asChild size="lg" className="group">
                    <Link href={primaryHref}>
                      {primaryCta}
                      <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                )}
                {secondaryCta && (
                  <Button asChild size="lg" variant="outline">
                    <Link href={secondaryHref}>{secondaryCta}</Link>
                  </Button>
                )}
              </motion.div>
            )}

            {note && (
              // The note is a "·"-separated list of assurances; each becomes a chip.
              <motion.ul {...rise(0.3)} className="mt-8 flex flex-wrap gap-2">
                {note.split('·').map((item) => item.trim()).filter(Boolean).map((item) => (
                  <li
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 py-1.5 text-xs text-muted-foreground"
                  >
                    <Check className="size-3.5 text-accent" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </motion.ul>
            )}
          </div>

          {visual && (
            <motion.div {...rise(0.2)} className="lg:col-span-5">
              {visual}
            </motion.div>
          )}
        </div>
      </div>

      {immersive && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-6 hidden flex-col items-center gap-3 lg:flex"
        >
          <span className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-subtle-foreground">
            {t('scroll')}
          </span>
          <span className="relative h-10 w-px overflow-hidden bg-border-strong">
            <span className="scroll-cue absolute inset-x-0 top-0 h-1/2 bg-accent" />
          </span>
        </div>
      )}
    </section>
  );
}
