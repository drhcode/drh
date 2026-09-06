import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { IndustryView } from '@/lib/data/types';
import { Section, SectionHeading } from './section';
import { Reveal } from './reveal';

export function IndustriesSection({
  title,
  subtitle,
  industries,
  bordered = true,
}: {
  title?: string;
  subtitle?: string | null;
  industries: IndustryView[];
  bordered?: boolean;
}) {
  if (industries.length === 0) return null;

  return (
    <Section bordered={bordered}>
      {title && <SectionHeading title={title} subtitle={subtitle} />}

      <ul className="mt-12 flex flex-wrap gap-3">
        {industries.map((industry, index) => (
          <Reveal as="li" key={industry.slug} delay={Math.min(index, 8) * 0.03}>
            <Link
              href={`/industries/${industry.slug}`}
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-accent-border hover:bg-accent-subtle hover:text-accent"
            >
              {industry.title}
              <ArrowRight className="size-3.5 text-subtle-foreground transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent" />
            </Link>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
