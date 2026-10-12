import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { getCompanySettings } from '@/lib/data';
import { EmailLink, PhoneLink, WhatsAppButton } from '@/components/site/contact-links';
import { Reveal } from './reveal';
import { AccentTitle } from '@/components/site/accent-title';

/** Closing conversion block (spec §22). */
export async function CtaSection({
  title,
  body,
  primaryCta,
  href = '/contact',
  showContactDetails = true,
}: {
  title: string;
  body?: string | null;
  primaryCta?: string | null;
  href?: string;
  showContactDetails?: boolean;
}) {
  const [settings, t] = await Promise.all([getCompanySettings(), getTranslations('cta')]);

  return (
    <section className="py-16 md:py-20 lg:py-24">
      <div className="container-page">
        <Reveal className="relative isolate overflow-hidden rounded-[2rem] border border-border bg-surface px-6 py-16 text-center sm:px-10 md:py-24">
          {/* Backdrop: a masked grid and one soft pool of green rising from below. */}
          <div aria-hidden="true" className="grid-lines absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_100%,#000_30%,transparent_100%)]" />
          <div
            aria-hidden="true"
            className="absolute -bottom-72 left-1/2 -z-10 size-[44rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--accent-glow),transparent)]"
          />

          <p className="inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            {t('available')}
          </p>

          <h2 className="mx-auto mt-7 max-w-4xl text-balance text-[2.75rem] leading-[1.02] md:text-6xl lg:text-[4.75rem]">
            <AccentTitle text={title} autoLast />
          </h2>

          {body && (
            <div className="mx-auto mt-6 max-w-2xl space-y-4">
              {body.split(/\n{2,}/).map((paragraph, index) => (
                <p key={index} className="text-base leading-relaxed text-muted-foreground md:text-lg">
                  {paragraph}
                </p>
              ))}
            </div>
          )}

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="group w-full sm:w-auto">
              <Link href={href}>
                {primaryCta ?? t('button')}
                <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <WhatsAppButton
              number={settings.whatsapp}
              label="WhatsApp"
              className="h-13 w-full px-7 sm:w-auto"
            />
          </div>

          {showContactDetails && (
            <div className="mt-10 flex flex-col items-center justify-center gap-x-8 gap-y-3 border-t border-border pt-8 text-sm text-muted-foreground sm:flex-row">
              <EmailLink email={settings.email} />
              <PhoneLink phone={settings.phone} display={settings.phoneDisplay} />
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
