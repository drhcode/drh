import type { RichPair } from '@/lib/data/types';
import { Section, SectionHeading } from './section';
import { Reveal } from './reveal';

/** "Why drh.al" and similar value-proposition grids (spec §17). */
export function FeatureGrid({
  title,
  subtitle,
  items,
  numbered = false,
  bordered = true,
}: {
  title?: string;
  subtitle?: string | null;
  items: RichPair[];
  numbered?: boolean;
  bordered?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <Section bordered={bordered}>
      {title && <SectionHeading title={title} subtitle={subtitle} />}

      <ul className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <Reveal as="li" key={item.title} delay={index * 0.05}>
            <div className="border-t border-border pt-5">
              {numbered && (
                <span className="mb-3 block font-mono text-xs text-accent">
                  {String(index + 1).padStart(2, '0')}
                </span>
              )}
              <h3 className="text-base font-medium text-foreground">{item.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
