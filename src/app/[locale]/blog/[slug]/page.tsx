import type { Metadata } from 'next';
import Image from 'next/image';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { contentLanguage, hasContentLanguage, isAppLocale, routing } from '@/i18n/routing';
import { getBlogPost, getBlogPosts, getRelatedBlogPosts } from '@/lib/data';
import { withHeadingAnchors } from '@/lib/content/html';
import { formatDate, plainText, truncate } from '@/lib/utils';
import { Accent } from '@/components/brand/accent';
import { ArrowRight } from '@/components/brand/icons';
import { Crumbs } from '@/components/blocks/page-hero';
import { DrhLogo } from '@/components/brand/drh-logo';
import { ShareButtons } from '@/components/blog/share-buttons';
import { JsonLd } from '@/components/seo/json-ld';
import { DraftBanner } from '@/components/site/draft-banner';
import { TableOfContents } from '@/components/site/table-of-contents';
import { absoluteUrl, buildMetadata, seoText } from '@/lib/seo/metadata';
import { articleSchema, breadcrumbSchema, jsonLdGraph } from '@/lib/seo/schema';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export const revalidate = 1800;

export async function generateStaticParams() {
  const posts = await getBlogPosts('en');
  return routing.locales.flatMap((locale) => posts.map((post) => ({ locale, slug: post.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isAppLocale(locale)) return {};

  const post = await getBlogPost(contentLanguage(locale), slug);
  if (!post) return {};

  return buildMetadata({
    locale,
    path: `/blog/${post.slug}`,
    title: seoText(post.seo.title, post.title, post.title),
    description: seoText(post.seo.description, post.excerpt, truncate(plainText(post.contentHtml), 180)),
    ogImage: post.seo.ogImage,
    ogTitle: post.seo.ogTitle,
    ogDescription: post.seo.ogDescription,
    isIndexable: post.seo.isIndexable,
    translations: post.translations,
    type: 'article',
    publishedTime: post.publishedAt,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);
  const language = contentLanguage(locale);

  // Draft mode is enabled only by the admin preview route, which checks
  // authorisation first, so unpublished content stays private.
  const preview = (await draftMode()).isEnabled;
  const post = await getBlogPost(language, slug, { includeUnpublished: preview });
  if (!post) notFound();

  const [t, tCommon, tArticle, related] = await Promise.all([
    getTranslations('blog'),
    getTranslations('common'),
    getTranslations('article'),
    getRelatedBlogPosts(language, post, 2),
  ]);

  const { html, toc } = withHeadingAnchors(post.contentHtml ?? '');
  // Italian pages show the English article; mark it so screen readers switch voice.
  const contentLang = hasContentLanguage(locale) && post.translations[locale] ? undefined : 'en';

  return (
    <>
      <DraftBanner path={`/blog/${slug}`} />
      <JsonLd
        json={jsonLdGraph(
          articleSchema(post, locale),
          breadcrumbSchema(
            [
              { name: tCommon('home'), path: '/' },
              { name: t('crumb'), path: '/blog' },
              { name: post.title, path: `/blog/${post.slug}` },
            ],
            locale,
          ),
        )}
      />

      <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[55] h-1">
        <div className="read-progress h-full bg-lime" />
      </div>

      <article lang={contentLang}>
        <header className="mx-auto max-w-[980px] px-[clamp(20px,4vw,48px)] pb-12 pt-[clamp(56px,8vw,104px)]">
          <Crumbs
            items={[{ label: t('crumb'), href: '/blog' }, { label: post.category?.title ?? post.title }]}
            label={tCommon('breadcrumb')}
          />
          <h1 className="rise-t d1 mt-7 text-[clamp(44px,6.4vw,92px)] font-semibold leading-[.96] tracking-[-0.05em]">
            <Accent text={post.title} />
          </h1>
          {post.excerpt && <p className="rise d2 mt-7 text-[21px] leading-[1.55] text-t2">{post.excerpt}</p>}
          <div className="rise d3 mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-ln pt-6">
            <div className="flex items-center gap-3.5">
              <span aria-hidden="true" className="grid size-10 flex-none place-items-center rounded-[10px] bg-lime text-ink">
                <DrhLogo className="h-auto w-[26px]" />
              </span>
              <span>
                <span className="block font-semibold">{post.authorName ?? tArticle('team')}</span>
                <span className="mono text-xs uppercase text-t3">
                  {post.publishedAt && (
                    <time dateTime={post.publishedAt}>
                      {formatDate(post.publishedAt, locale, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </time>
                  )}
                  {' · '}
                  {tCommon('minRead', { minutes: post.readingTime })}
                </span>
              </span>
            </div>
            <ShareButtons
              url={absoluteUrl(`/blog/${post.slug}`, locale)}
              labels={{ copy: tArticle('copyLink'), copied: tArticle('copied'), linkedin: tArticle('shareLinkedIn') }}
            />
          </div>
        </header>

        {post.featuredImage && (
          <div className="rise d3 wrap">
            <div className="relative h-[clamp(240px,36vw,520px)] overflow-hidden rounded-[32px] border border-ln bg-s1">
              <Image src={post.featuredImage} alt="" fill priority sizes="(max-width: 1280px) 100vw, 1184px" className="object-cover" />
            </div>
          </div>
        )}

        <div className="wrap flex flex-wrap gap-16 pb-[120px] pt-20">
          {toc.length > 1 && (
            <aside className="hide-sm flex-[0_0_240px]">
              <TableOfContents entries={toc} label={t('tableOfContents')} />
            </aside>
          )}
          <div className="min-w-0 max-w-[720px] flex-[1_1_560px]">
            {/* Article HTML is authored by drh.al staff in the admin editor. */}
            <div className="prose-v2" dangerouslySetInnerHTML={{ __html: html }} />

            {post.tags.length > 0 && (
              <ul className="mt-12 flex flex-wrap gap-2 border-t border-ln pt-8">
                {post.tags.map((tag) => (
                  <li key={tag.slug} className="rounded-full border border-ln2 px-3.5 py-1.5 text-sm text-t2">
                    {tag.title}
                  </li>
                ))}
              </ul>
            )}

            {post.relatedService && (
              <Link
                href={`/services/${post.relatedService.slug}`}
                className="card mt-10 flex items-center justify-between gap-4 rounded-[22px] border border-ln bg-s1 p-6 text-fg"
              >
                <span>
                  <span className="label block">{t('relatedService')}</span>
                  <span className="mt-2 block text-xl font-semibold">{post.relatedService.title}</span>
                </span>
                <span className="arrow-dot size-11 border border-ln2">
                  <ArrowRight />
                </span>
              </Link>
            )}

            <div className="reveal on-lime mt-12 flex flex-wrap items-center justify-between gap-5 rounded-[26px] bg-lime p-9 text-ink max-sm:p-7">
              <div className="max-w-[400px]">
                <p className="m-0 text-[26px] font-semibold tracking-[-0.02em]">{tArticle('ctaTitle')}</p>
                <p className="mt-1.5 text-[15px] text-lime-ink">{tArticle('ctaBody')}</p>
              </div>
              <Link href="/audit" className="btn btn-ink btn-md">
                {tArticle('ctaButton')}
              </Link>
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-ln">
          <div className="wrap py-24">
            <h2 className="m-0 text-[clamp(36px,4vw,56px)] font-semibold tracking-[-0.04em]">
              <Accent text={tArticle('keepReading')} />
            </h2>
            <ul className="mt-10 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(340px,100%),1fr))]">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link href={`/blog/${item.slug}`} className="card reveal flex items-center gap-5 rounded-[22px] border border-ln p-5 text-fg">
                    <span className="relative grid size-24 flex-none place-items-center overflow-hidden rounded-2xl bg-lime text-4xl font-bold text-ink">
                      {item.featuredImage ? (
                        <Image src={item.featuredImage} alt="" fill sizes="96px" className="object-cover" />
                      ) : (
                        item.title.charAt(0)
                      )}
                    </span>
                    <span>
                      <span className="mono block text-xs uppercase text-t3">
                        {[item.category?.title, tCommon('minShort', { minutes: item.readingTime })].filter(Boolean).join(' · ')}
                      </span>
                      <span className="mt-1.5 block text-xl font-semibold tracking-[-0.02em]">{item.title}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
