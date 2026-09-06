'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@/types/database';
import { can } from '@/lib/auth/permissions';
import { NAV_GROUPS, QUICK_COMMANDS } from './nav-config';
import { AdminIcon } from './admin-icon';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { startRouteProgress } from '@/components/route-progress';

interface SearchHit {
  id: string;
  type: 'lead' | 'project' | 'blog' | 'page' | 'testimonial';
  title: string;
  subtitle: string | null;
  href: string;
}

const GROUP_LABEL: Record<SearchHit['type'], string> = {
  lead: 'Leads',
  project: 'Projects',
  blog: 'Blog posts',
  page: 'Pages',
  testimonial: 'Testimonials',
};

const GROUP_ICON: Record<SearchHit['type'], string> = {
  lead: 'inbox',
  project: 'briefcase',
  blog: 'file-text',
  page: 'layout',
  testimonial: 'quote',
};

/**
 * Admin ⌘K palette (spec §72).
 *
 * Navigation and quick actions are local; record search hits the server, which
 * re-checks the caller's role before returning anything.
 */
export function AdminCommandPalette({
  open,
  onOpenChange,
  role,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: UserRole;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [hits, setHits] = React.useState<SearchHit[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const term = query.trim();
    if (!open || term.length < 2) return;

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      void fetch(`/admin/api/search?q=${encodeURIComponent(term)}`, {
        signal: controller.signal,
      })
        .then((response) => (response.ok ? response.json() : { results: [] }))
        .then((data: { results: SearchHit[] }) => setHits(data.results ?? []))
        .catch(() => undefined)
        .finally(() => setLoading(false));
    }, 180);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, open]);

  // Hits are only meaningful for the current term, so derive rather than clear
  // them from an effect when the term shortens or the palette closes.
  const term = query.trim();
  const visibleHits = open && term.length >= 2 ? hits : [];

  const navItems = NAV_GROUPS.flatMap((group) => group.items).filter((item) =>
    can(role, item.resource),
  );

  const actions = QUICK_COMMANDS.filter((command) =>
    can(role, command.resource, command.capability ?? 'view'),
  );

  const grouped = (['lead', 'project', 'blog', 'page', 'testimonial'] as const)
    .map((type) => ({ type, items: visibleHits.filter((hit) => hit.type === type) }))
    .filter((group) => group.items.length > 0);

  function go(href: string) {
    setQuery('');
    onOpenChange(false);
    startRouteProgress();
    router.push(href);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setQuery('');
        onOpenChange(next);
      }}
      title="Admin search"
      description="Search leads, projects, blog posts and pages, or jump to a section."
    >
      <CommandInput
        placeholder="Search leads, projects, posts… or type a command"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {loading ? 'Searching…' : query ? `Nothing found for “${query}”.` : 'Type to search.'}
        </CommandEmpty>

        {grouped.map((group) => (
          <CommandGroup key={group.type} heading={GROUP_LABEL[group.type]}>
            {group.items.map((hit) => (
              <CommandItem
                key={hit.id}
                value={`${hit.title} ${hit.subtitle ?? ''}`}
                onSelect={() => go(hit.href)}
              >
                <AdminIcon name={GROUP_ICON[hit.type]} className="size-4" />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate">{hit.title}</span>
                  {hit.subtitle && (
                    <span className="truncate text-xs text-subtle-foreground">{hit.subtitle}</span>
                  )}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}

        <CommandGroup heading="Actions">
          {actions.map((action) => (
            <CommandItem key={action.href} value={action.label} onSelect={() => go(action.href)}>
              <AdminIcon name={action.icon} className="size-4" />
              {action.label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Go to">
          {navItems.map((item) => (
            <CommandItem key={item.href} value={item.label} onSelect={() => go(item.href)}>
              <AdminIcon name={item.icon} className="size-4" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
