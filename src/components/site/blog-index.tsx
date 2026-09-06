'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import type { BlogPostView } from '@/lib/data/types';
import { BlogCard } from '@/components/sections/blog-section';
import { GlowGrid } from '@/components/ui/glow';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 9;

export function BlogIndex({
  posts,
  categories,
}: {
  posts: BlogPostView[];
  categories: { slug: string; title: string }[];
}) {
  const t = useTranslations('blog');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const [category, setCategory] = React.useState('all');
  const [query, setQuery] = React.useState('');
  const [visible, setVisible] = React.useState(PAGE_SIZE);
  const [lastFilterKey, setLastFilterKey] = React.useState('all|');

  const available = React.useMemo(
    () => categories.filter((c) => posts.some((p) => p.category?.slug === c.slug)),
    [categories, posts],
  );

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesCategory = category === 'all' || post.category?.slug === category;
      const matchesQuery =
        needle.length === 0 ||
        post.title.toLowerCase().includes(needle) ||
        (post.excerpt ?? '').toLowerCase().includes(needle);
      return matchesCategory && matchesQuery;
    });
  }, [posts, category, query]);

  // Reset pagination when the filters change, during render rather than in an
  // effect so the stale page is never painted first.
  const filterKey = `${category}|${query}`;
  if (filterKey !== lastFilterKey) {
    setLastFilterKey(filterKey);
    setVisible(PAGE_SIZE);
  }

  const shown = filtered.slice(0, visible);

  return (
    <div>
      <div className="flex flex-col gap-4 border-y border-border py-5 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="scrollbar-thin -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
          role="group"
          aria-label={t('categories')}
        >
          <CategoryChip
            active={category === 'all'}
            onClick={() => setCategory('all')}
            label={t('allCategories')}
          />
          {available.map((item) => (
            <CategoryChip
              key={item.slug}
              active={category === item.slug}
              onClick={() => setCategory(item.slug)}
              label={item.title}
            />
          ))}
        </div>

        <div className="relative w-full lg:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground"
            aria-hidden="true"
          />
          <label htmlFor="blog-search" className="sr-only">
            {t('search')}
          </label>
          <Input
            id="blog-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('searchPlaceholder')}
            className="h-10 pl-9 text-sm"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-24 text-center text-muted-foreground">{t('empty')}</p>
      ) : (
        <>
          <GlowGrid as="ul" className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((post) => (
              <li key={post.slug}>
                <BlogCard
                  post={post}
                  locale={locale}
                  readingLabel={tCommon('minRead', { minutes: post.readingTime })}
                />
              </li>
            ))}
          </GlowGrid>

          {visible < filtered.length && (
            <div className="mt-14 flex justify-center">
              <Button variant="outline" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                {tCommon('loadMore')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors',
        active
          ? 'border-foreground bg-foreground text-background'
          : 'border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground',
      )}
    >
      {label}
    </button>
  );
}
