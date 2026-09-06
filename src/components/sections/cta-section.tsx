import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { getCompanySettings } from '@/lib/data';
import { EmailLink, PhoneLink, WhatsAppButton } from '@/components/site/contact-links';
import { Reveal } from './reveal';

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
  const settings = await getCompanySettings();

  return (
    <section className="border-t border-border bg-surface-sunken">
      <div className="container-page py-20 md:py-24 lg:py-28">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-3xl leading-[1.12] md:text-4xl lg:text-[2.9rem]">
            {title}
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

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="group w-full sm:w-auto">
              <Link href={href}>
                {primaryCta ?? 'Start a Project'}
                <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <WhatsAppButton
              number={settings.whatsapp}
              label="WhatsApp"
              className="w-full sm:w-auto"
            />
          </div>

          {showContactDetails && (
            <div className="mt-8 flex flex-col items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground sm:flex-row">
              <EmailLink email={settings.email} />
              <PhoneLink phone={settings.phone} display={settings.phoneDisplay} />
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
