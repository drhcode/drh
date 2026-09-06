import { Section } from './section';
import { Reveal } from './reveal';

/**
 * Editorial block: a heading in the left column, body copy in a comfortable
 * measure on the right. Used for About and landing-page prose.
 */
export function RichTextSection({
  title,
  body,
  bordered = true,
}: {
  title?: string;
  body: string;
  bordered?: boolean;
}) {
  return (
    <Section bordered={bordered}>
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        {title && (
          <div className="lg:col-span-4">
            <h2 className="text-2xl leading-tight md:text-3xl">{title}</h2>
          </div>
        )}

        <Reveal className={title ? 'lg:col-span-7 lg:col-start-6' : 'lg:col-span-8'}>
          <div className="space-y-5">
            {body.split(/\n{2,}/).map((paragraph, index) => (
              <p
                key={index}
                className="text-base leading-relaxed text-muted-foreground md:text-[1.0625rem]"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
