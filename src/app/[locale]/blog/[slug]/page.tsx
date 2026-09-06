import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { isAppLocale, routing, type AppLocale } from '@/i18n/routing';
import { getBlogPost, getBlogPosts, getRelatedBlogPosts } from '@/lib/data';
import { withHeadingAnchors } from '@/lib/content/html';
import { Badge } from '@/components/ui/badge';
import { Section } from '@/components/sections/section';
import { BlogCard } from '@/components/sections/blog-section';
import { CtaSection } from '@/components/sections/cta-section';
import { TableOfContents } from '@/components/site/table-of-contents';
import { JsonLd } from '@/components/seo/json-ld';
import { buildMetadata, seoText } from '@/lib/seo/metadata';
import { articleSchema, breadcrumbSchema, jsonLdGraph } from '@/lib/seo/schema';
import { formatDate, plainText, truncate } from '@/lib/utils';

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

  const post = await getBlogPost(locale, slug);
  if (!post) return {};

  return buildMetadata({
    locale,
    path: `/blog/${post.slug}`,
    title: seoText(post.seo.title, post.title, post.title),
    description: seoText(
      post.seo.description,
      post.excerpt,
      truncate(plainText(post.contentHtml), 180),
    ),
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

  const post = await getBlogPost(locale, slug);
  if (!post) notFound();

  const [t, tCommon, related] = await Promise.all([
    getTranslations('blog'),
    getTranslations('common'),
    getRelatedBlogPosts(locale, post, 3),
  ]);

  const { html, toc } = withHeadingAnchors(post.contentHtml ?? '');

  return (
    <>
      <JsonLd
        json={jsonLdGraph(
          articleSchema(post, locale as AppLocale),
          breadcrumbSchema(
            [
              { name: 'Home', path: '/' },
              { name: t('title'), path: '/blog' },
              { name: post.title, path: `/blog/${post.slug}` },
            ],
            locale as AppLocale,
          ),
        )}
      />

      <article>
        <header className="border-b border-border">
          <div className="container-page pb-12 pt-14 md:pt-20">
            <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
              <Link href="/blog" className="transition-colors hover:text-accent">
                {t('title')}
              </Link>
              {post.category && (
                <>
                  <span className="mx-2 text-subtle-foreground">/</span>
                  <span className="text-foreground">{post.category.title}</span>
                </>
              )}
            </nav>

            <div className="mt-7 max-w-3xl">
              <h1 className="text-balance text-3xl leading-[1.14] md:text-4xl lg:text-[3rem]">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>
              )}

              <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-subtle-foreground">
                {post.authorName && (
                  <span>
                    {t('by')} <span className="text-foreground">{post.authorName}</span>
                  </span>
                )}
                {post.publishedAt && (
                  <>
                    <span aria-hidden="true">·</span>
                    <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale)}</time>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span>{tCommon('minRead', { minutes: post.readingTime })}</span>
              </div>
            </div>
          </div>
        </header>

        {post.featuredImage && (
          <div className="container-page py-10 md:py-12">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-surface-sunken">
              <Image
                src={post.featuredImage}
                alt=""
                fill
                priority
                sizes="(min-width: 1280px) 1200px, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        )}

        <div className="container-page pb-16 pt-4 md:pb-20">
          <div className="grid gap-12 lg:grid-cols-12">
            {toc.length > 2 && (
              <aside className="lg:col-span-3 lg:order-2">
                <TableOfContents entries={toc} label={t('tableOfContents')} />
              </aside>
            )}

            <div className={toc.length > 2 ? 'lg:col-span-8 lg:order-1' : 'lg:col-span-8 lg:col-start-3'}>
              {/*
                Article HTML is authored by drh.al staff in the admin editor and
                rendered through the fixed .prose-drh stylesheet.
              */}
              <div className="prose-drh" dangerouslySetInnerHTML={{ __html: html }} />

              {post.tags.length > 0 && (
                <ul className="mt-12 flex flex-wrap gap-2 border-t border-border pt-8">
                  {post.tags.map((tag) => (
                    <li key={tag.slug}>
                      <Badge>{tag.title}</Badge>
                    </li>
                  ))}
                </ul>
              )}

              {/* Blog → Services internal link (spec §70) */}
              {post.relatedService && (
                <div className="mt-10 rounded-xl border border-border bg-surface-sunken p-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-subtle-foreground">
                    {t('relatedService')}
                  </p>
                  <Link
                    href={`/services/${post.relatedService.slug}`}
                    className="group mt-2 inline-flex items-center gap-2 text-lg font-medium text-foreground transition-colors hover:text-accent"
                  >
                    {post.relatedService.title}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <Section bordered>
          <h2 className="text-2xl md:text-3xl">{t('relatedPosts')}</h2>
          <ul className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug}>
                <BlogCard
                  post={item}
                  locale={locale}
                  readingLabel={tCommon('minRead', { minutes: item.readingTime })}
                />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <CtaSection title={t('ctaTitle')} body={t('ctaBody')} primaryCta={t('ctaButton')} />
    </>
  );
}
