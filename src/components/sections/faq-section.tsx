import type { FaqView } from '@/lib/data/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Section, SectionHeading } from './section';

/**
 * FAQ (spec §21).
 *
 * The matching FAQPage structured data is emitted separately by
 * <FaqJsonLd> and only for entries that are actually translated, so we never
 * mark up content the visitor cannot read in that language.
 */
export function FaqSection({
  title,
  subtitle,
  faqs,
  bordered = true,
}: {
  title?: string;
  subtitle?: string | null;
  faqs: FaqView[];
  bordered?: boolean;
}) {
  if (faqs.length === 0) return null;

  return (
    <Section bordered={bordered}>
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          {title && <SectionHeading title={title} subtitle={subtitle} />}
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          <Accordion type="single" collapsible className="border-t border-border">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>
                  {faq.answer.split(/\n{2,}/).map((paragraph, index) => (
                    <p key={index} className={index > 0 ? 'mt-3' : undefined}>
                      {paragraph}
                    </p>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </Section>
  );
}
