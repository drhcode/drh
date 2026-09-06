'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight, ChevronDown, Menu } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Logo } from './logo';
import { ServiceIcon } from './service-icon';
import { ThemeToggle } from './theme-toggle';
import { LanguageSwitcher } from './language-switcher';
import { SiteSearch } from './site-search';
import { cn } from '@/lib/utils';

export interface HeaderService {
  slug: string;
  title: string;
  shortDescription?: string | null;
  iconKey?: string | null;
}

const NAV_KEYS = ['work', 'industries', 'about', 'blog'] as const;
const NAV_HREF: Record<(typeof NAV_KEYS)[number], string> = {
  work: '/work',
  industries: '/industries',
  about: '/about',
  blog: '/blog',
};

export interface HeaderBranding {
  logo: string | null;
  logoDark: string | null;
  companyName: string;
}

export function SiteHeader({
  featuredServices,
  allServices,
  branding,
}: {
  featuredServices: HeaderService[];
  allServices: { slug: string; title: string }[];
  branding: HeaderBranding;
}) {
  const t = useTranslations('nav');
  const tA11y = useTranslations('a11y');
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Navigating closes the mobile sheet. Reconciled during render so the panel
  // never paints open on the new route.
  const [lastPathname, setLastPathname] = React.useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (mobileOpen) setMobileOpen(false);
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-[background-color,border-color,backdrop-filter] duration-200',
        scrolled
          ? 'border-b border-border bg-background/80 backdrop-blur-xl'
          : 'border-b border-transparent',
      )}
    >
      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-4 md:h-18">
          <Link href="/" className="shrink-0 rounded-md" aria-label={branding.companyName}>
            <Logo
              src={branding.logo}
              srcDark={branding.logoDark}
              alt={branding.companyName}
              priority
            />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label={tA11y('mainNavigation')}>
            <ServicesMenu featured={featuredServices} all={allServices} />
            {NAV_KEYS.map((key) => (
              <Link
                key={key}
                href={NAV_HREF[key]}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive(NAV_HREF[key])
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t(key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <div className="hidden items-center gap-1 sm:flex">
              <SiteSearch />
              <ThemeToggle label={t('toggleTheme')} />
              <LanguageSwitcher />
            </div>
            <Button asChild size="sm" className="ml-1 hidden sm:inline-flex">
              <Link href="/contact">{t('startProject')}</Link>
            </Button>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label={t('openMenu')}>
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <MobileMenu services={allServices} branding={branding} />
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

/** Desktop services mega menu (spec §7). */
function ServicesMenu({
  featured,
  all,
}: {
  featured: HeaderService[];
  all: { slug: string; title: string }[];
}) {
  const t = useTranslations('nav');
  const [open, setOpen] = React.useState(false);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = React.useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const scheduleClose = React.useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }, [cancelClose]);

  React.useEffect(() => cancelClose, [cancelClose]);

  const secondary = all.filter((s) => !featured.some((f) => f.slug === s.slug));

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false);
        }}
        className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        {t('services')}
        <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          className="anim-pop absolute left-1/2 top-full z-50 w-[46rem] -translate-x-1/2 pt-3"
          data-state="open"
        >
          <div className="overflow-hidden rounded-xl border border-border bg-surface-raised shadow-lg">
            <div className="grid grid-cols-2 gap-1 p-2">
              {featured.map((service) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  onClick={() => setOpen(false)}
                  className="group flex gap-3 rounded-lg p-3 transition-colors hover:bg-surface-sunken"
                >
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-accent transition-colors group-hover:border-accent-border group-hover:bg-accent-subtle">
                    <ServiceIcon iconKey={service.iconKey ?? null} className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">
                      {service.title}
                    </span>
                    {service.shortDescription && (
                      <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-muted-foreground">
                        {service.shortDescription}
                      </span>
                    )}
                  </span>
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border bg-surface-sunken px-5 py-3">
              {secondary.map((service) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  onClick={() => setOpen(false)}
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-accent"
                >
                  {service.title}
                </Link>
              ))}
              <Link
                href="/services"
                onClick={() => setOpen(false)}
                className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
              >
                {t('viewAllServices')}
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Mobile navigation — large tap targets, not a shrunken desktop menu (spec §8). */
function MobileMenu({
  services,
  branding,
}: {
  services: { slug: string; title: string }[];
  branding: HeaderBranding;
}) {
  const t = useTranslations('nav');

  return (
    <SheetContent closeLabel={t('closeMenu')} className="p-0">
      <SheetTitle className="sr-only">{t('menu')}</SheetTitle>

      <div className="flex h-16 shrink-0 items-center border-b border-border px-5">
        <Logo src={branding.logo} srcDark={branding.logoDark} alt={branding.companyName} />
      </div>

      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4">
        <SheetClose asChild>
          <Link
            href="/work"
            className="flex min-h-14 items-center rounded-lg px-3 text-lg font-medium text-foreground transition-colors hover:bg-surface-sunken"
          >
            {t('work')}
          </Link>
        </SheetClose>

        <div className="mt-1">
          <p className="px-3 pb-1 pt-4 text-xs font-medium uppercase tracking-wider text-subtle-foreground">
            {t('services')}
          </p>
          {services.map((service) => (
            <SheetClose asChild key={service.slug}>
              <Link
                href={`/services/${service.slug}`}
                className="flex min-h-12 items-center rounded-lg px-3 text-[0.9375rem] text-muted-foreground transition-colors hover:bg-surface-sunken hover:text-foreground"
              >
                {service.title}
              </Link>
            </SheetClose>
          ))}
          <SheetClose asChild>
            <Link
              href="/services"
              className="flex min-h-12 items-center gap-1.5 rounded-lg px-3 text-[0.9375rem] font-medium text-accent"
            >
              {t('viewAllServices')}
              <ArrowRight className="size-3.5" />
            </Link>
          </SheetClose>
        </div>

        <div className="mt-2 border-t border-border pt-2">
          {(['industries', 'about', 'blog'] as const).map((key) => (
            <SheetClose asChild key={key}>
              <Link
                href={NAV_HREF[key]}
                className="flex min-h-14 items-center rounded-lg px-3 text-lg font-medium text-foreground transition-colors hover:bg-surface-sunken"
              >
                {t(key)}
              </Link>
            </SheetClose>
          ))}
        </div>
      </nav>

      <div className="shrink-0 border-t border-border p-4">
        <div className="mb-3 flex items-center justify-between">
          <LanguageSwitcher />
          <ThemeToggle label={t('toggleTheme')} />
        </div>
        <SheetClose asChild>
          <Button asChild size="lg" className="w-full">
            <Link href="/contact">{t('startProject')}</Link>
          </Button>
        </SheetClose>
      </div>
    </SheetContent>
  );
}
