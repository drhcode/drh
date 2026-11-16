'use client';

import * as React from 'react';
import { Search } from '@/components/brand/icons';
import { PostCard, type PostCardData } from '@/components/blocks/lists';

/** Category filter + search over the post list (client-side; the list is small). */
export function BlogFilter({
  posts,
  featuredSlug,
  categories,
  locale,
  labels,
}: {
  posts: PostCardData[];
  featuredSlug: string | null;
  categories: { slug: string; title: string }[];
  locale: string;
  labels: { categories: string; all: string; search: string; empty: string; min: string };
}) {
  const [category, setCategory] = React.useState('all');
  const [query, setQuery] = React.useState('');

  const used = categories.filter((c) => posts.some((p) => p.category?.slug === c.slug));
  const filtering = category !== 'all' || query.trim() !== '';
  const needle = query.trim().toLowerCase();
  const visible = posts.filter((post) => {
    if (!filtering) return post.slug !== featuredSlug;
    const inCategory = category === 'all' || post.category?.slug === category;
    const matches =
      !needle || post.title.toLowerCase().includes(needle) || (post.excerpt ?? '').toLowerCase().includes(needle);
    return inCategory && matches;
  });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label={labels.categories} className="flex flex-wrap gap-2">
          {[{ slug: 'all', title: labels.all }, ...used].map((item) => (
            <button
              key={item.slug}
              type="button"
              className="pill-tab"
              aria-pressed={category === item.slug}
              onClick={() => setCategory(item.slug)}
            >
              {item.title}
            </button>
          ))}
        </div>
        <label className="flex h-[46px] min-w-[min(280px,100%)] items-center gap-2.5 rounded-full border border-ln2 px-[18px] focus-within:border-acct max-sm:w-full">
          <Search size={18} className="text-t3" />
          <span className="sr-only">{labels.search}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.search}
            className="min-w-0 flex-1 bg-transparent text-[15px] text-fg outline-none placeholder:text-t3"
          />
        </label>
      </div>

      <div aria-live="polite">
        {visible.length > 0 ? (
          <div className="mt-10 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(340px,100%),1fr))]">
            {visible.map((post, index) => (
              <PostCard
                key={post.slug}
                post={post}
                index={index + 1}
                locale={locale}
                minLabel={labels.min.replace('{minutes}', String(post.readingTime))}
                headingLevel="h2"
              />
            ))}
          </div>
        ) : (
          filtering && (
            <p className="mt-6 rounded-[26px] border border-dashed border-ln2 p-12 text-center text-t3">
              {labels.empty.replace('{query}', query)}
            </p>
          )
        )}
      </div>
    </>
  );
}
