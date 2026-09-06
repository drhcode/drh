'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExternalLink, LogOut, Menu, Plus, Search, X } from 'lucide-react';
import type { AdminUserRow } from '@/types/database';
import { can } from '@/lib/auth/permissions';
import { ROLE_LABELS } from '@/lib/auth/permissions';
import { NAV_GROUPS, QUICK_COMMANDS } from './nav-config';
import { AdminIcon } from './admin-icon';
import { AdminCommandPalette } from './admin-command-palette';
import { NotificationCenter, type AdminNotification } from './notification-center';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/site/theme-toggle';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn, initials } from '@/lib/utils';

/**
 * Admin chrome (spec §88).
 *
 * Deliberately a different visual language from the public site: denser type,
 * a persistent sidebar, a sunken canvas and elevated panels — it should read as
 * an internal SaaS tool, not as drh.al's marketing site with a menu bolted on.
 */
export function AdminShell({
  admin,
  notifications,
  unreadCount,
  children,
  signOutAction,
}: {
  admin: AdminUserRow;
  notifications: AdminNotification[];
  unreadCount: number;
  children: React.ReactNode;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  // Navigating closes the mobile sidebar, reconciled during render.
  const [lastPathname, setLastPathname] = React.useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (mobileNavOpen) setMobileNavOpen(false);
  }

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => can(admin.role, item.resource)),
  })).filter((group) => group.items.length > 0);

  const quickCreate = QUICK_COMMANDS.filter(
    (command) => command.icon === 'plus' && can(admin.role, command.resource, 'manage'),
  );

  return (
    <div className="min-h-dvh bg-surface-sunken">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-background lg:flex">
        <SidebarContent groups={visibleGroups} pathname={pathname} />
      </aside>

      <div className="lg:pl-60">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
          <div className="flex h-14 items-center gap-2 px-4 md:px-6">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Open menu">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="left-0 right-auto w-72 border-l-0 border-r p-0" closeLabel="Close menu">
                <SheetTitle className="sr-only">Admin navigation</SheetTitle>
                <SidebarContent groups={visibleGroups} pathname={pathname} />
              </SheetContent>
            </Sheet>

            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="flex h-9 flex-1 items-center gap-2 rounded-lg border border-border bg-surface-sunken px-3 text-sm text-subtle-foreground transition-colors hover:border-border-strong md:max-w-xs"
            >
              <Search className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">Search…</span>
              <kbd className="ml-auto hidden shrink-0 rounded border border-border bg-surface px-1.5 font-mono text-[10px] text-subtle-foreground sm:inline">
                ⌘K
              </kbd>
            </button>

            <div className="ml-auto flex items-center gap-1">
              {quickCreate.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" className="hidden sm:inline-flex">
                      <Plus className="size-4" />
                      Create
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {quickCreate.map((command) => (
                      <DropdownMenuItem key={command.href} asChild>
                        <Link href={command.href}>
                          <AdminIcon name={command.icon} className="size-4" />
                          {command.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <NotificationCenter notifications={notifications} unreadCount={unreadCount} />

              <Button variant="ghost" size="icon-sm" asChild aria-label="View website">
                <a href="/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" />
                </a>
              </Button>

              <ThemeToggle />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="ml-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    aria-label="Account"
                  >
                    <Avatar className="size-8">
                      <AvatarFallback>{initials(admin.full_name ?? admin.email)}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[13rem]">
                  <DropdownMenuLabel className="normal-case tracking-normal">
                    <span className="block text-sm font-medium text-foreground">
                      {admin.full_name ?? admin.email}
                    </span>
                    <span className="block text-xs font-normal text-muted-foreground">
                      {ROLE_LABELS[admin.role]}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href="/" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-4" />
                      View website
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-danger transition-colors hover:bg-danger/10"
                    >
                      <LogOut className="size-4" />
                      Sign out
                    </button>
                  </form>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 md:px-6 md:py-8">{children}</main>
      </div>

      <AdminCommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} role={admin.role} />
    </div>
  );
}

function SidebarContent({
  groups,
  pathname,
}: {
  groups: { label: string | null; items: typeof NAV_GROUPS[number]['items'] }[];
  pathname: string;
}) {
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-5">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-foreground text-xs font-bold text-background">
            d
          </span>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            drh<span className="text-accent">.</span>al
          </span>
          <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">
            Admin
          </span>
        </Link>
      </div>

      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4" aria-label="Admin sections">
        {groups.map((group, index) => (
          <div key={group.label ?? `group-${index}`} className={index > 0 ? 'mt-6' : undefined}>
            {group.label && (
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-subtle-foreground">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href, item.exact) ? 'page' : undefined}
                    className={cn(
                      'flex min-h-9 items-center gap-2.5 rounded-lg px-3 text-sm transition-colors',
                      isActive(item.href, item.exact)
                        ? 'bg-accent-subtle font-medium text-accent'
                        : 'text-muted-foreground hover:bg-surface-sunken hover:text-foreground',
                    )}
                  >
                    <AdminIcon name={item.icon} className="size-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </>
  );
}

export { X };
