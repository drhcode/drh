'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HeroField } from './hero-field';

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
  /**
   * Adds the drifting particle layer behind the grid. Reserved for the
   * homepage: ambient motion on every hero would be exactly the constant
   * animation this design system avoids.
   */
  particles?: boolean;
  as?: 'h1' | 'h2';
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
  particles = false,
  as: Heading = 'h1',
}: HeroSectionProps) {
  const reduced = useReducedMotion();

  const rise = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <section className="relative overflow-hidden">
      {/* Structural grid that responds to the pointer — texture, not decoration */}
      <HeroField particles={particles} />

      <div className="container-page relative">
        <div
          className={cn(
            'max-w-4xl',
            size === 'lg' ? 'pb-16 pt-20 md:pb-24 md:pt-28 lg:pb-28 lg:pt-32' : 'pb-12 pt-16 md:pb-16 md:pt-24',
          )}
        >
          {eyebrow && (
            <motion.p
              {...rise(0)}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
              {eyebrow}
            </motion.p>
          )}

          <motion.div {...rise(0.06)}>
            <Heading
              className={cn(
                'text-balance leading-[1.06]',
                size === 'lg'
                  ? 'text-[2.5rem] sm:text-5xl md:text-6xl lg:text-[4.25rem]'
                  : 'text-4xl md:text-5xl lg:text-[3.25rem]',
              )}
            >
              {title}
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
            <motion.p {...rise(0.3)} className="mt-6 text-sm text-subtle-foreground">
              {note}
            </motion.p>
          )}
        </div>
      </div>
    </section>
  );
}
