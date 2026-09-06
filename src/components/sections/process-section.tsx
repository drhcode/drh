import type { ProcessStep } from '@/lib/data/types';
import { Section, SectionHeading } from './section';
import { Reveal } from './reveal';

/** Development process (spec §18). */
export function ProcessSection({
  title,
  subtitle,
  steps,
  bordered = true,
}: {
  title?: string;
  subtitle?: string | null;
  steps: ProcessStep[];
  bordered?: boolean;
}) {
  if (steps.length === 0) return null;

  return (
    <Section bordered={bordered}>
      {title && <SectionHeading title={title} subtitle={subtitle} />}

      <ol className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <Reveal as="li" key={step.step} delay={index * 0.06} className="bg-surface">
            <div className="flex h-full flex-col p-7 md:p-8">
              <span className="font-mono text-xs font-medium text-accent">{step.step}</span>
              <h3 className="mt-4 text-lg font-medium text-foreground">{step.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
