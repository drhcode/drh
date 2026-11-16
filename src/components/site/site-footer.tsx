import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { localeLabels, routing } from '@/i18n/routing';
import type { CompanySettings } from '@/content/seed/settings';
import { Accent } from '@/components/brand/accent';
import { ArrowRight, ArrowUpRight } from '@/components/brand/icons';
import { CookieSettingsLink } from './cookie-settings-link';
import { NewsletterForm } from './newsletter-form';
import { TrackedLink } from './tracked-link';

/**
 * Footer: lime CTA band (rotating "Let's talk" badge, animated rings), the
 * newsletter, link columns, the self-drawing wordmark and the legal row.
 */
export async function SiteFooter({
  settings,
  services,
}: {
  settings: CompanySettings;
  services: { slug: string; title: string }[];
}) {
  const t = await getTranslations('footer');
  const whatsapp = `https://wa.me/${settings.whatsapp}`;

  const company = [
    { href: '/work', label: t('work') },
    { href: '/industries', label: t('industries') },
    { href: '/about', label: t('about') },
    { href: '/blog', label: t('journal') },
    { href: '/contact', label: t('contactPage') },
    { href: '/pricing', label: t('priceEstimator') },
    { href: '/audit', label: t('freeAudit') },
    { href: '/book', label: t('bookCall') },
  ];

  return (
    <footer className="cv bg-bg px-[clamp(12px,2vw,24px)] pb-6 text-fg">
      {/* CTA band */}
      <section className="on-lime relative overflow-hidden rounded-[40px] bg-lime text-ink" aria-labelledby="footer-cta">
        <svg
          className="hide-sm pointer-events-none absolute -bottom-60 -right-36 size-[640px]"
          viewBox="0 0 600 600"
          aria-hidden="true"
        >
          <circle className="flow" cx="300" cy="300" r="290" fill="none" stroke="#0b0d0c" strokeOpacity=".3" strokeWidth="1.5" />
          <circle cx="300" cy="300" r="220" fill="none" stroke="#0b0d0c" strokeOpacity=".15" />
          <circle className="drawloop" pathLength={1000} cx="300" cy="300" r="220" fill="none" stroke="#0b0d0c" strokeWidth="3" strokeLinecap="round" transform="rotate(-90 300 300)" />
          <circle className="flow" cx="300" cy="300" r="150" fill="none" stroke="#0b0d0c" strokeOpacity=".35" />
        </svg>

        <Link
          href="/book"
          aria-label={t('badgeLabel')}
          className="dock hide-sm absolute right-[clamp(24px,6vw,96px)] top-16 z-[1] grid size-[150px] place-items-center rounded-full bg-ink"
        >
          <svg className="orbit absolute inset-0" style={{ animationDuration: '18s' }} viewBox="0 0 150 150" width="150" height="150" aria-hidden="true">
            <defs>
              <path id="badge-footer" d="M75 75m-56 0a56 56 0 1 1 112 0a56 56 0 1 1 -112 0" />
            </defs>
            <text className="mono" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '2.8px', fill: '#F2F4F0' }}>
              <textPath href="#badge-footer">{t('badgeText')}</textPath>
            </text>
          </svg>
          <span className="grid size-14 place-items-center rounded-full bg-lime text-ink">
            <ArrowUpRight size={22} />
          </span>
        </Link>

        <div className="wrap relative py-[clamp(64px,9vw,120px)]">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-ink px-4 py-2 text-sm font-medium">
            <span className="pulse-dot size-2 rounded-full bg-ink" aria-hidden="true" />
            {t('ctaBadge')}
          </div>
          <h2 id="footer-cta" className="reveal mt-7 max-w-[940px] text-[clamp(48px,7.6vw,120px)] font-semibold leading-[.92] tracking-[-0.05em]">
            <Accent text={t('ctaTitle')} plain />
          </h2>
          <div className="mt-12 flex flex-wrap items-end justify-between gap-8">
            <p className="max-w-[460px] text-lg leading-[1.55] text-lime-ink">{t('ctaBody')}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className="btn btn-ink h-[60px] px-[30px] text-[17px]">
                {t('ctaButton')}
                <ArrowRight />
              </Link>
              <TrackedLink href={whatsapp} event="whatsapp" external className="btn btn-ink-g h-[60px] px-[26px]">
                WhatsApp
              </TrackedLink>
              <TrackedLink href={`mailto:${settings.email}`} event="email" className="btn btn-ink-g h-[60px] px-[26px]">
                {settings.email}
              </TrackedLink>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-[clamp(8px,3vw,36px)] pt-24">
        <div className="flex flex-wrap justify-between gap-14">
          <div className="max-w-[440px] flex-[1_1_360px]">
            <p className="text-[28px] font-semibold leading-[1.15] tracking-[-0.03em]">
              <Accent text={t('tagline')} />
            </p>
            <NewsletterForm />
          </div>

          <div className="grid flex-[2_1_560px] grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-10">
            <nav aria-labelledby="footer-services">
              <h2 id="footer-services" className="label">{t('services')}</h2>
              <ul className="mt-5 flex flex-col gap-3 text-[15px]">
                {services.map((service) => (
                  <li key={service.slug}>
                    <Link href={`/services/${service.slug}`} className="text-t1 hover:text-fg">
                      {service.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-labelledby="footer-company">
              <h2 id="footer-company" className="label">{t('company')}</h2>
              <ul className="mt-5 flex flex-col gap-3 text-[15px]">
                {company.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-t1 hover:text-fg">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div>
              <h2 className="label">{t('contact')}</h2>
              <ul className="mt-5 flex flex-col gap-3 text-[15px]">
                <li>
                  <TrackedLink href={`mailto:${settings.email}`} event="email" className="text-t1 hover:text-fg">
                    {settings.email}
                  </TrackedLink>
                </li>
                <li>
                  <TrackedLink href={`tel:${settings.phone}`} event="phone" className="text-t1 hover:text-fg">
                    {settings.phoneDisplay}
                  </TrackedLink>
                </li>
                <li>
                  <TrackedLink href={whatsapp} event="whatsapp" external className="text-t1 hover:text-fg">
                    WhatsApp
                  </TrackedLink>
                </li>
                <li className="text-t3">{t('location')}</li>
              </ul>
            </div>
          </div>
        </div>

        <Wordmark />

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-ln pt-6 text-sm text-t3">
          <span>
            © {new Date().getFullYear()} {settings.companyName}
          </span>
          <div className="flex flex-wrap gap-6">
            <Link href="/privacy" className="hover:text-fg">{t('privacy')}</Link>
            <Link href="/cookies" className="hover:text-fg">{t('cookies')}</Link>
            <Link href="/terms" className="hover:text-fg">{t('terms')}</Link>
            <CookieSettingsLink className="cursor-pointer bg-transparent p-0 text-t3 hover:text-fg" />
          </div>
          <span>{routing.locales.map((code) => localeLabels[code].short).join(' · ')}</span>
        </div>
      </div>
    </footer>
  );
}

/** The outlined "drh.al" wordmark that draws itself as it scrolls in. */
function Wordmark() {
  return (
    <svg viewBox="0 0 1200 300" aria-hidden="true" className="mt-24 block h-auto w-full overflow-visible">
      <text
        className="wordmark-draw"
        x="0"
        y="250"
        fill="none"
        stroke="#4b524e"
        strokeWidth="1.5"
        style={{ fontSize: 340, fontWeight: 700, letterSpacing: -24, fontFamily: 'var(--font-display)' }}
      >
        drh<tspan fill="#D4FF3A" stroke="none">.</tspan>al
      </text>
    </svg>
  );
}
