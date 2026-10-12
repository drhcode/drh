import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { FaqView } from '@/lib/data/types';
import { getCompanySettings } from '@/lib/data';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { EmailLink, WhatsAppLink } from '@/components/site/contact-links';
import { cn } from '@/lib/utils';
import { Section, SectionHeading, type Kicker } from './section';

/**
 * FAQ (spec §21).
 *
 * The heading and a "still have a question?" card stay pinned beside the
 * list on wide screens, so the way out to a real conversation is always in
 * view while someone reads. The first answer starts open: an FAQ with
 * every item closed looks like a wall of questions and nothing else.
 *
 * The matching FAQPage structured data is emitted separately by
 * <FaqJsonLd> and only for entries that are actually translated, so we never
 * mark up content the visitor cannot read in that language.
 */
export async function FaqSection({
  title,
  subtitle,
  kicker,
  faqs,
  bordered = true,
}: {
  title?: string;
  subtitle?: string | null;
  kicker?: Kicker;
  faqs: FaqView[];
  bordered?: boolean;
}) {
  if (faqs.length === 0) return null;

  const [t, settings] = await Promise.all([getTranslations('faq'), getCompanySettings()]);
  const helpProps = {
    title: t('stillTitle'),
    body: t('stillBody'),
    ask: t('ask'),
    whatsapp: settings.whatsapp,
    email: settings.email,
  };

  return (
    <Section bordered={bordered}>
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
          {title && <SectionHeading kicker={kicker} title={title} subtitle={subtitle} />}

          <HelpCard className="mt-10 hidden lg:block" {...helpProps} />
        </div>

        <div className="lg:col-span-7">
          <Accordion type="single" collapsible defaultValue={faqs[0].id} className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger>
                  <span className="w-6 shrink-0 font-mono text-xs text-subtle-foreground">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="pl-[3.75rem] md:pl-[4.25rem]">
                  {faq.answer.split(/\n{2,}/).map((paragraph, paragraphIndex) => (
                    <p key={paragraphIndex} className={paragraphIndex > 0 ? 'mt-3' : undefined}>
                      {paragraph}
                    </p>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          {/* On small screens the way out comes after the questions, not before. */}
          <HelpCard className="mt-8 lg:hidden" {...helpProps} />
        </div>
      </div>
    </Section>
  );
}

/** "Still have a question?" — the route from the FAQ to a real conversation. */
function HelpCard({
  title,
  body,
  ask,
  whatsapp,
  email,
  className,
}: {
  title: string;
  body: string;
  ask: string;
  whatsapp: string;
  email: string;
  className?: string;
}) {
  return (
    <div className={cn('rounded-2xl border border-border bg-surface p-6 md:p-7', className)}>
      <p className="text-lg font-medium text-foreground">{title}</p>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">
        {body}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
        <Button asChild size="md" className="group">
          <Link href="/contact">
            {ask}
            <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </Button>
        <WhatsAppLink number={whatsapp} label="WhatsApp" className="text-sm font-medium text-foreground" />
      </div>
      <div className="mt-5 border-t border-border pt-5 text-sm text-muted-foreground">
        <EmailLink email={email} />
      </div>
    </div>
  );
}
