import { getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Reveal } from './reveal';
import { AgentStudio, type AgentStudioCopy } from './agent-studio';
import { AnimatedGlyph } from '@/components/site/animated-glyph';

/**
 * AI engineering section (homepage).
 *
 * Describes how the work is done rather than claiming outcomes: no adoption
 * figures, no client names, no speed multipliers. Everything here is either a
 * capability drh.al can demonstrate on request or a description of process.
 */

/** Capability glyphs, drawn on the shared 48-unit grid. */
const CAPABILITY_GLYPHS: string[][] = [
  // Agent workflows — a directed graph.
  [
    'M11 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    'M37 42a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    'M24 28a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    'M14 13l8 7M27 27l8 7',
  ],
  // Retrieval over your own content — a document feeding a query.
  [
    'M12 8h16l8 8v24H12z',
    'M28 8v8h8',
    'M18 26h12',
    'M18 32h8',
  ],
  // Integration — two systems joined.
  [
    'M8 24h10',
    'M30 24h10',
    'M18 17h12v14H18z',
    'M24 10v7M24 31v7',
  ],
  // Evaluation — a checked result.
  [
    'M10 12h28v24H10z',
    'M10 19h28',
    'M18 28l4 4 8-8',
  ],
];

export async function AiSection() {
  const t = await getTranslations('ai');

  const studio: AgentStudioCopy = {
    teamLabel: t('studio.teamLabel'),
    activeLabel: t('studio.active', { count: 4 }),
    lead: t('studio.lead'),
    file: 'sync-orders.ts',
    agents: [
      { id: 'architect', short: 'AR', name: t('studio.roles.architect') },
      { id: 'coder', short: 'CO', name: t('studio.roles.coder') },
      { id: 'tester', short: 'TE', name: t('studio.roles.tester') },
      { id: 'reviewer', short: 'RE', name: t('studio.roles.reviewer') },
    ],
    steps: [
      {
        agent: 'architect',
        status: t('studio.status.architect'),
        revealed: 1,
        log: [t('studio.log.planning')],
      },
      {
        agent: 'coder',
        status: t('studio.status.coder'),
        revealed: 5,
        log: [t('studio.log.planned'), t('studio.log.writing')],
      },
      {
        agent: 'tester',
        status: t('studio.status.tester'),
        revealed: 8,
        log: [t('studio.log.planned'), t('studio.log.written'), t('studio.log.testing')],
      },
      {
        agent: 'reviewer',
        status: t('studio.status.reviewer'),
        revealed: 8,
        log: [t('studio.log.planned'), t('studio.log.written'), t('studio.log.tested'), t('studio.log.reviewing')],
      },
    ],
  };

  const capabilities = (['agents', 'retrieval', 'integration', 'evaluation'] as const).map(
    (key, index) => ({
      key,
      title: t(`capabilities.${key}.title`),
      body: t(`capabilities.${key}.body`),
      paths: CAPABILITY_GLYPHS[index],
    }),
  );

  return (
    <section className="border-t border-border bg-surface-sunken">
      <div className="container-page py-20 md:py-24 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="inline-flex items-center gap-2 rounded-full border border-accent-border bg-accent-subtle px-3 py-1 text-xs font-medium text-accent">
                <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
                {t('eyebrow')}
              </p>

              <h2 className="mt-5 text-balance text-3xl leading-[1.12] md:text-4xl lg:text-[2.6rem]">
                {t('title')}
              </h2>

              <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
                {t('body')}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="group">
                  <Link href="/contact">
                    {t('cta')}
                    <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/services">{t('secondaryCta')}</Link>
                </Button>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={0.08}>
              <AgentStudio copy={studio} />
            </Reveal>
          </div>
        </div>

        <ul className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
          {capabilities.map((capability, index) => (
            <Reveal as="li" key={capability.key} delay={index * 0.06}>
              <AnimatedGlyph paths={capability.paths} className="size-8 text-accent" />
              <h3 className="mt-4 text-base font-medium text-foreground">{capability.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{capability.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
