import { ArrowUpRight } from 'lucide-react';
import { IndustryGlyph } from '@/components/site/industry-glyph';
import { Link } from '@/i18n/navigation';
import type { IndustryView } from '@/lib/data/types';
import { Section, SectionHeading, type Kicker } from './section';
import { Reveal } from './reveal';

export function IndustriesSection({
  title,
  subtitle,
  kicker,
  industries,
  bordered = true,
}: {
  title?: string;
  subtitle?: string | null;
  kicker?: Kicker;
  industries: IndustryView[];
  bordered?: boolean;
}) {
  if (industries.length === 0) return null;

  return (
    <Section bordered={bordered}>
      {title && <SectionHeading kicker={kicker} title={title} subtitle={subtitle} />}

      <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {industries.map((industry, index) => (
          <Reveal as="li" key={industry.slug} delay={Math.min(index, 9) * 0.03}>
            <Link
              href={`/industries/${industry.slug}`}
              className="group flex h-full min-h-36 flex-col justify-between gap-6 rounded-xl border border-border bg-surface p-5 transition-[border-color,transform,background-color] duration-300 hover:-translate-y-1 hover:border-accent-border md:min-h-40"
            >
              <span className="flex items-start justify-between">
                <IndustryGlyph iconKey={industry.iconKey} className="size-7 text-accent" />
                <ArrowUpRight className="size-4 text-subtle-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent group-hover:opacity-100" />
              </span>
              <span className="text-[0.9375rem] font-medium leading-snug text-foreground">
                {industry.title}
              </span>
            </Link>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
