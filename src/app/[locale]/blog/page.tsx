import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { contentLanguage, isAppLocale, routing } from '@/i18n/routing';
import { getBlogCategories, getBlogPosts } from '@/lib/data';
import { ArrowRight } from '@/components/brand/icons';
import { PageHero } from '@/components/blocks/page-hero';
import { PostMeta, toPostCard } from '@/components/blocks/lists';
import { BlogFilter } from '@/components/blog/blog-filter';
import { JsonLd } from '@/components/seo/json-ld';
import { buildMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema, jsonLdGraph } from '@/lib/seo/schema';

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
    available: ['en', 'sq'],
  });
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);
  const language = contentLanguage(locale);

  const [t, tCommon, posts, categories] = await Promise.all([
    getTranslations('blog'),
    getTranslations('common'),
    getBlogPosts(language),
    getBlogCategories(language),
  ]);

  const featured = posts.find((post) => post.featured) ?? posts[0];

  return (
    <>
      <JsonLd
        json={jsonLdGraph(
          breadcrumbSchema(
            [
              { name: tCommon('home'), path: '/' },
              { name: t('crumb'), path: '/blog' },
            ],
            locale,
          ),
        )}
      />

      <PageHero
        crumbs={[{ label: tCommon('home'), href: '/' }, { label: t('crumb') }]}
        crumbsLabel={tCommon('breadcrumb')}
        title={t('v2HeroTitle')}
        titleClassName="whitespace-pre-line"
        lead={<p>{t('v2Lead')}</p>}
      />

      {featured && (
        <section className="wrap pt-16">
          <Link
            href={`/blog/${featured.slug}`}
            className="card rise d3 flex flex-wrap overflow-hidden rounded-[32px] border border-ln bg-s1 text-fg"
          >
            <div className="relative min-h-[420px] flex-[1_1_520px] overflow-hidden bg-lime max-sm:min-h-[260px]">
              {featured.featuredImage ? (
                <Image src={featured.featuredImage} alt="" fill priority sizes="(max-width: 860px) 100vw, 680px" className="zoom object-cover" />
              ) : (
                <div className="zoom absolute inset-0 grid place-items-center">
                  <div className="spin-slow absolute size-[360px] rounded-full border-2 border-dashed border-[#0b0d0c55]" style={{ animationDuration: '20s' }} />
                </div>
              )}
              <span className="mono absolute left-6 top-6 rounded-full bg-ink px-3.5 py-2 text-xs tracking-[.08em] text-lime">
                {t('featured').toUpperCase()}
              </span>
            </div>
            <div className="flex flex-[1_1_400px] flex-col gap-5 p-[clamp(32px,4vw,56px)]">
              <PostMeta post={featured} locale={locale} minLabel={tCommon('minRead', { minutes: featured.readingTime })} />
              <h2 className="m-0 text-[clamp(34px,3.6vw,52px)] font-semibold leading-[1.02] tracking-[-0.04em]">{featured.title}</h2>
              {featured.excerpt && <p className="m-0 text-[17px] leading-relaxed text-t2">{featured.excerpt}</p>}
              <span className="mt-auto inline-flex items-center gap-3 font-semibold">
                {t('readArticle')}
                <span className="arrow-dot size-12 border border-ln2">
                  <ArrowRight />
                </span>
              </span>
            </div>
          </Link>
        </section>
      )}

      <section className="wrap pb-[120px] pt-[72px]">
        <BlogFilter
          posts={posts.map((post) => toPostCard(post, locale))}
          featuredSlug={featured?.slug ?? null}
          categories={categories}
          locale={locale}
          labels={{
            categories: t('categories'),
            all: t('allCategories'),
            search: t('search'),
            empty: t.raw('noMatch') as string,
            min: tCommon.raw('minShort') as string,
          }}
        />
        {posts.length === 0 && <p className="text-t3">{t('empty')}</p>}
      </section>
    </>
  );
}
