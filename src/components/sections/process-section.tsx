import type { ProcessStep } from '@/lib/data/types';
import { Section, SectionHeading, type Kicker } from './section';
import { Reveal } from './reveal';

/**
 * Development process (spec §18) as a timeline.
 *
 * Horizontal on wide screens — one rule runs through every step's node — and
 * vertical below that, where each step draws its own segment down to the next.
 */
export function ProcessSection({
  title,
  subtitle,
  kicker,
  steps,
  bordered = true,
}: {
  title?: string;
  subtitle?: string | null;
  kicker?: Kicker;
  steps: ProcessStep[];
  bordered?: boolean;
}) {
  if (steps.length === 0) return null;

  return (
    <Section bordered={bordered}>
      {title && <SectionHeading kicker={kicker} title={title} subtitle={subtitle} />}

      <ol className="relative mt-14 grid gap-10 lg:mt-16 lg:grid-cols-4 lg:gap-8">
        <span
          aria-hidden="true"
          className="absolute left-0 right-0 top-[1.4375rem] hidden h-px bg-gradient-to-r from-accent-border via-border-strong to-transparent lg:block"
        />

        {steps.map((step, index) => (
          <Reveal
            as="li"
            key={step.step}
            delay={index * 0.08}
            className="relative pl-16 before:absolute before:bottom-[-2.5rem] before:left-[1.4375rem] before:top-12 before:w-px before:bg-border-strong last:before:hidden lg:pl-0 lg:before:hidden"
          >
            <span className="absolute left-0 top-0 flex size-[2.875rem] items-center justify-center rounded-full border border-border-strong bg-background font-mono text-xs font-medium text-accent lg:relative">
              {step.step}
            </span>
            <h3 className="pt-2.5 text-xl font-medium text-foreground lg:mt-7 lg:pt-0">{step.title}</h3>
            <p className="mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-muted-foreground">
              {step.body}
            </p>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
