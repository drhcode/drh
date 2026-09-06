'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Briefcase, FileText, Layers, Search, Building2 } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import type { SearchResult } from '@/lib/data/types';
import { startRouteProgress } from '@/components/route-progress';

const GROUP_ICON = {
  project: Briefcase,
  service: Layers,
  industry: Building2,
  blog: FileText,
  page: FileText,
} as const;

/** Site-wide search, opened with ⌘K / Ctrl+K (spec §71). */
export function SiteSearch() {
  const t = useTranslations('search');
  const tNav = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchResult[] | null>(null);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // The index is small and static — fetched once, on first open.
  React.useEffect(() => {
    if (!open || results) return;
    let cancelled = false;
    void fetch(`/api/search?locale=${locale}`)
      .then((response) => (response.ok ? response.json() : { results: [] }))
      .then((data: { results: SearchResult[] }) => {
        if (!cancelled) setResults(data.results ?? []);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open, results, locale]);

  const groups = React.useMemo(() => {
    const items = results ?? [];
    return [
      { key: 'project', label: t('groupProjects'), items: items.filter((r) => r.type === 'project') },
      { key: 'service', label: t('groupServices'), items: items.filter((r) => r.type === 'service') },
      { key: 'industry', label: t('groupIndustries'), items: items.filter((r) => r.type === 'industry') },
      { key: 'blog', label: t('groupBlog'), items: items.filter((r) => r.type === 'blog') },
    ].filter((group) => group.items.length > 0);
  }, [results, t]);

  function go(href: string) {
    setOpen(false);
    startRouteProgress();
    router.push(href);
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
        aria-label={tNav('search')}
        className="text-muted-foreground hover:text-foreground"
      >
        <Search className="size-4" />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={t('title')}
        description={t('placeholder')}
      >
        <CommandInput placeholder={t('placeholder')} value={query} onValueChange={setQuery} />
        <CommandList>
          <CommandEmpty>{query ? t('empty', { query }) : t('hint')}</CommandEmpty>
          {groups.map((group) => {
            const Icon = GROUP_ICON[group.key as keyof typeof GROUP_ICON];
            return (
              <CommandGroup key={group.key} heading={group.label}>
                {group.items.map((item) => (
                  <CommandItem
                    key={item.href}
                    value={`${item.title} ${item.description ?? ''}`}
                    onSelect={() => go(item.href)}
                  >
                    <Icon />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate">{item.title}</span>
                      {item.description && (
                        <span className="truncate text-xs text-subtle-foreground">
                          {item.description}
                        </span>
                      )}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}
