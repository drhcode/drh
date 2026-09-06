import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { isAppLocale, routing, type AppLocale } from '@/i18n/routing';
import { getIndustries } from '@/lib/data';
import { Section } from '@/components/sections/section';
import { Reveal } from '@/components/sections/reveal';
import { CtaSection } from '@/components/sections/cta-section';
import { JsonLd } from '@/components/seo/json-ld';
import { buildMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema, jsonLdGraph } from '@/lib/seo/schema';

interface Props {
  params: Promise<{ locale: string }>;
}

export const revalidate = 3600;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: 'industries' });

  return buildMetadata({
    locale,
    path: '/industries',
    title: `${t('heroTitle')} | drh.al`,
    description: t('heroDescription'),
  });
}

export default async function IndustriesPage({ params }: Props) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations('industries');
  const tCta = await getTranslations('cta');
  const industries = await getIndustries(locale);

  return (
    <>
      <JsonLd
        json={jsonLdGraph(
          breadcrumbSchema(
            [
              { name: 'Home', path: '/' },
              { name: t('title'), path: '/industries' },
            ],
            locale as AppLocale,
          ),
        )}
      />

      <section className="border-b border-border">
        <div className="container-page pb-14 pt-16 md:pb-16 md:pt-24">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.14em] text-accent">
            {t('title')}
          </p>
          <h1 className="max-w-3xl text-balance text-4xl leading-[1.1] md:text-5xl lg:text-[3.5rem]">
            {t('heroTitle')}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {t('heroDescription')}
          </p>
        </div>
      </section>

      <Section bordered={false}>
        <ul className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry, index) => (
            <Reveal as="li" key={industry.slug} delay={Math.min(index, 9) * 0.04} className="bg-surface">
              <Link
                href={`/industries/${industry.slug}`}
                className="group flex h-full flex-col p-7 transition-colors hover:bg-surface-sunken md:p-8"
              >
                <h2 className="text-lg font-medium text-foreground transition-colors group-hover:text-accent">
                  {industry.title}
                </h2>
                {industry.description && (
                  <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {industry.description}
                  </p>
                )}
                <ArrowRight className="mt-6 size-4 text-subtle-foreground transition-all duration-200 group-hover:translate-x-1 group-hover:text-accent" />
              </Link>
            </Reveal>
          ))}
        </ul>
      </Section>

      <CtaSection title={tCta('title')} body={tCta('body')} primaryCta={tCta('button')} />
    </>
  );
}
