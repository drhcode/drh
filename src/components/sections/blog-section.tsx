import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { BlogPostView } from '@/lib/data/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Section, SectionHeading } from './section';
import { Reveal } from './reveal';

export async function BlogSection({
  title,
  subtitle,
  posts,
  bordered = true,
}: {
  title?: string;
  subtitle?: string | null;
  posts: BlogPostView[];
  bordered?: boolean;
}) {
  if (posts.length === 0) return null;

  const t = await getTranslations('common');
  const locale = await getLocale();

  return (
    <Section bordered={bordered}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        {title && <SectionHeading title={title} subtitle={subtitle} />}
        <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
          <Link href="/blog">
            {t('viewAllArticles')}
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>

      <ul className="mt-12 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <Reveal as="li" key={post.slug} delay={index * 0.06}>
            <BlogCard post={post} locale={locale} readingLabel={t('minRead', { minutes: post.readingTime })} />
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

export function BlogCard({
  post,
  locale,
  readingLabel,
  sizes = '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw',
}: {
  post: BlogPostView;
  locale: string;
  readingLabel: string;
  sizes?: string;
}) {
  return (
    <article className="group h-full">
      <Link href={`/blog/${post.slug}`} className="flex h-full flex-col focus-visible:outline-none">
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-surface-sunken">
          {post.featuredImage ? (
            <Image
              src={post.featuredImage}
              alt=""
              fill
              sizes={sizes}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          ) : null}
        </div>

        <div className="mt-5 flex flex-1 flex-col">
          <div className="flex flex-wrap items-center gap-2">
            {post.category && <Badge variant="accent">{post.category.title}</Badge>}
            <span className="text-xs text-subtle-foreground">{readingLabel}</span>
          </div>

          <h3 className="mt-3 text-lg font-medium leading-snug text-foreground transition-colors group-hover:text-accent">
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="mt-2.5 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
          )}

          {post.publishedAt && (
            <time
              dateTime={post.publishedAt}
              className="mt-4 block text-xs text-subtle-foreground"
            >
              {formatDate(post.publishedAt, locale)}
            </time>
          )}
        </div>
      </Link>
    </article>
  );
}
