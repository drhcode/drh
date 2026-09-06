import { getTranslations, getLocale } from 'next-intl/server';
import { Github, Instagram, Linkedin, Facebook } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { localeLabels, routing, type AppLocale } from '@/i18n/routing';
import type { CompanySettings } from '@/content/seed/settings';
import { Logo } from './logo';
import { EmailLink, PhoneLink, WhatsAppLink } from './contact-links';
import { CookieSettingsLink } from './cookie-settings-link';
import { NewsletterForm } from './newsletter-form';

const COMPANY_LINKS = [
  { key: 'work', href: '/work' },
  { key: 'about', href: '/about' },
  { key: 'industries', href: '/industries' },
  { key: 'blog', href: '/blog' },
  { key: 'contact', href: '/contact' },
] as const;

export async function SiteFooter({
  settings,
  services,
}: {
  settings: CompanySettings;
  services: { slug: string; title: string }[];
}) {
  const t = await getTranslations('footer');
  const tNav = await getTranslations('nav');
  const tA11y = await getTranslations('a11y');
  const locale = (await getLocale()) as AppLocale;

  const socials = [
    { href: settings.social.linkedin, Icon: Linkedin, label: 'LinkedIn' },
    { href: settings.social.instagram, Icon: Instagram, label: 'Instagram' },
    { href: settings.social.facebook, Icon: Facebook, label: 'Facebook' },
    { href: settings.social.github, Icon: Github, label: 'GitHub' },
  ].filter((s) => Boolean(s.href));

  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface-sunken">
      <div className="container-page">
        <div className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-12 lg:gap-8 lg:py-16">
          {/* Brand + newsletter */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block rounded-md" aria-label={settings.companyName}>
              <Logo
                src={settings.logo || null}
                srcDark={settings.logoDark || null}
                alt={settings.companyName}
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {settings.footerText}
            </p>
            <div className="mt-6 max-w-xs">
              <NewsletterForm />
            </div>
            {socials.length > 0 && (
              <ul className="mt-6 flex items-center gap-2" aria-label={tA11y('socialLinks')}>
                {socials.map(({ href, Icon, label }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex size-9 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground transition-colors hover:border-accent-border hover:text-accent"
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <nav
            className="lg:col-span-2 lg:col-start-6"
            aria-label={`${tA11y('footerNavigation')} — ${t('services')}`}
          >
            <h2 className="text-xs font-medium uppercase tracking-wider text-subtle-foreground">
              {t('services')}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-accent"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="lg:col-span-2" aria-label={`${tA11y('footerNavigation')} — ${t('company')}`}>
            <h2 className="text-xs font-medium uppercase tracking-wider text-subtle-foreground">
              {t('company')}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {COMPANY_LINKS.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-accent"
                  >
                    {tNav(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className="text-xs font-medium uppercase tracking-wider text-subtle-foreground">
              {t('contact')}
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li>
                <EmailLink email={settings.email} />
              </li>
              <li>
                <PhoneLink phone={settings.phone} display={settings.phoneDisplay} />
              </li>
              <li>
                <WhatsAppLink number={settings.whatsapp} label="WhatsApp" />
              </li>
              <li className="pt-1 text-subtle-foreground">
                {settings.location} · {settings.serviceArea}
              </li>
            </ul>

            <h2 className="mt-8 text-xs font-medium uppercase tracking-wider text-subtle-foreground">
              {t('languages')}
            </h2>
            <ul className="mt-3 flex gap-4">
              {routing.locales.map((code) => (
                <li key={code}>
                  <Link
                    href="/"
                    locale={code}
                    className={
                      code === locale
                        ? 'text-sm font-medium text-foreground'
                        : 'text-sm text-muted-foreground transition-colors hover:text-accent'
                    }
                  >
                    {localeLabels[code].name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-border py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-subtle-foreground">
            {settings.copyright.replace('{year}', String(year))}
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <li>
              <Link href="/privacy" className="transition-colors hover:text-accent">
                {t('privacy')}
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="transition-colors hover:text-accent">
                {t('cookies')}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="transition-colors hover:text-accent">
                {t('terms')}
              </Link>
            </li>
            <li>
              <CookieSettingsLink className="transition-colors hover:text-accent" />
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
