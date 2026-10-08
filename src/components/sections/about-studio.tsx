import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Check, Gauge, ShieldCheck } from 'lucide-react';
import { CodeRobot } from './code-robot';
import { Reveal } from './reveal';

/** Served from /public; spaces are encoded so the optimiser receives a valid URL. */
const WORKSPACE_IMAGE = encodeURI('/media/services/Custom Web Applications.png');

/**
 * About page: how the studio works.
 *
 * Two rows that mirror each other — copy beside the animated editor, then the
 * workspace photograph beside the numbers. Code-owned rather than a CMS
 * section, because the illustration is part of the design, not content.
 */
export async function AboutStudio() {
  const t = await getTranslations('about');

  const points = [t('point1'), t('point2'), t('point3')];
  const stats = [
    { value: t('stat1Value'), label: t('stat1Label') },
    { value: t('stat2Value'), label: t('stat2Label') },
    { value: t('stat3Value'), label: t('stat3Label') },
  ];

  return (
    <section className="border-t border-border" aria-labelledby="about-studio-title">
      <div className="container-page py-20 md:py-24 lg:py-28">
        {/* Row 1: the editor */}
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-accent">
              {t('studioEyebrow')}
            </p>
            <h2
              id="about-studio-title"
              className="text-dimension text-3xl leading-[1.15] md:text-4xl lg:text-[2.6rem]"
            >
              {t('studioTitle')}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              {t('studioBody')}
            </p>
            <ul className="mt-7 space-y-3">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-3 text-[0.9375rem] text-foreground">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent-subtle text-accent">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.1} className="pb-10 sm:pr-6 lg:col-span-7">
            <CodeRobot label={t('editorLabel')} />
          </Reveal>
        </div>

        {/* Row 2: the workspace */}
        <div className="mt-28 grid items-center gap-12 lg:mt-36 lg:grid-cols-12">
          <Reveal className="relative lg:order-2 lg:col-span-7">
            <div className="rounded-2xl bg-gradient-to-br from-accent via-accent-2 to-accent-3 p-px shadow-lg">
              <div className="group relative aspect-[3/2] overflow-hidden rounded-[calc(1rem-1px)] bg-surface-raised">
                <Image
                  src={WORKSPACE_IMAGE}
                  alt={t('imageAlt')}
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[oklch(0.1_0.03_283/0.55)] via-transparent to-transparent"
                />
              </div>
            </div>

            <div className="float-badge pill-dimension absolute -left-3 top-6 flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium shadow-md sm:-left-6">
              <ShieldCheck className="size-4 text-accent" />
              {t('badgeBuild')}
            </div>
            <div className="float-badge float-badge-late pill-dimension absolute -right-3 bottom-6 flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium shadow-md sm:-right-6">
              <Gauge className="size-4 text-accent-2" />
              {t('badgeSpeed')}
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:order-1 lg:col-span-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-accent">
              {t('workspaceEyebrow')}
            </p>
            <h2 className="text-3xl leading-[1.15] md:text-4xl">{t('workspaceTitle')}</h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              {t('workspaceBody')}
            </p>
            <dl className="mt-9 grid grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border bg-surface p-4">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="block bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-2xl font-semibold text-transparent md:text-3xl">
                      {stat.value}
                    </span>
                    <span aria-hidden="true" className="mt-1 block text-xs leading-snug text-muted-foreground md:text-sm">
                      {stat.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
