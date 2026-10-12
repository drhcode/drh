import type { RichPair } from '@/lib/data/types';
import { Section, SectionHeading, type Kicker } from './section';
import { Reveal } from './reveal';
import { GlowGrid } from '@/components/ui/glow';

/**
 * "Why drh.al" and similar value-proposition grids (spec §17).
 *
 * Cards rather than loose text, each with a large mono index, so a list of
 * six principles reads as six distinct commitments. The pointer-following
 * edge light (`glow-card`) is the only hover motion.
 */
export function FeatureGrid({
  title,
  subtitle,
  kicker,
  items,
  bordered = true,
}: {
  title?: string;
  subtitle?: string | null;
  kicker?: Kicker;
  items: RichPair[];
  /** Kept for API compatibility; items are always numbered now. */
  numbered?: boolean;
  bordered?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <Section bordered={bordered}>
      {title && <SectionHeading kicker={kicker} title={title} subtitle={subtitle} />}

      <GlowGrid as="ul" className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
        {items.map((item, index) => (
          <Reveal as="li" key={item.title} delay={index * 0.05}>
            <div
              data-glow
              className="glow-card flex h-full flex-col rounded-2xl border border-border bg-surface p-7 md:p-8"
            >
              <span className="font-mono text-sm text-accent">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="mt-10 text-lg font-medium text-foreground md:mt-12">{item.title}</h3>
              <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          </Reveal>
        ))}
      </GlowGrid>
    </Section>
  );
}
