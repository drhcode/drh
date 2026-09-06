import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { isAppLocale, routing, type AppLocale } from '@/i18n/routing';
import { getBlogCategories, getBlogPosts } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { BlogIndex } from '@/components/site/blog-index';
import { GlowGrid } from '@/components/ui/glow';
import { CtaSection } from '@/components/sections/cta-section';
import { JsonLd } from '@/components/seo/json-ld';
import { buildMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema, jsonLdGraph } from '@/lib/seo/schema';
import { formatDate } from '@/lib/utils';

interface Props {
  params: Promise<{ locale: string }>;
}

export const revalidate = 1800;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: 'blog' });

  return buildMetadata({
    locale,
    path: '/blog',
    title: `${t('heroTitle')} | drh.al`,
    description: t('heroDescription'),
  });
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);

  const [t, tCommon, tCta, posts, categories] = await Promise.all([
    getTranslations('blog'),
    getTranslations('common'),
    getTranslations('cta'),
    getBlogPosts(locale),
    getBlogCategories(locale),
  ]);

  const featured = posts.find((post) => post.featured) ?? posts[0];
  const rest = featured ? posts.filter((post) => post.slug !== featured.slug) : posts;

  return (
    <>
      <JsonLd
        json={jsonLdGraph(
          breadcrumbSchema(
            [
              { name: 'Home', path: '/' },
              { name: t('title'), path: '/blog' },
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

      {featured && (
        <GlowGrid className="container-page py-12 md:py-16">
          <article className="group">
            <Link
              href={`/blog/${featured.slug}`}
              className="grid gap-8 focus-visible:outline-none lg:grid-cols-2 lg:gap-12 lg:items-center"
            >
              <div
                data-glow
                className="glow-card focus-frame relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-surface-sunken"
              >
                {featured.featuredImage && (
                  <Image
                    src={featured.featuredImage}
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  />
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="accent">{t('featured')}</Badge>
                  {featured.category && <Badge>{featured.category.title}</Badge>}
                  <span className="text-xs text-subtle-foreground">
                    {tCommon('minRead', { minutes: featured.readingTime })}
                  </span>
                </div>

                <h2 className="mt-4 text-balance text-2xl leading-snug transition-colors group-hover:text-accent md:text-3xl">
                  {featured.title}
                </h2>

                {featured.excerpt && (
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                    {featured.excerpt}
                  </p>
                )}

                {featured.publishedAt && (
                  <time
                    dateTime={featured.publishedAt}
                    className="mt-5 block text-sm text-subtle-foreground"
                  >
                    {formatDate(featured.publishedAt, locale)}
                  </time>
                )}
              </div>
            </Link>
          </article>
        </GlowGrid>
      )}

      <div className="container-page pb-16">
        <BlogIndex posts={rest} categories={categories} />
      </div>

      <CtaSection title={tCta('title')} body={tCta('body')} primaryCta={tCta('button')} />
    </>
  );
}
