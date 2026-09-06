import { cn } from '@/lib/utils';

export function Section({
  className,
  children,
  as: Tag = 'section',
  bordered = false,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  as?: 'section' | 'div';
  bordered?: boolean;
}) {
  return (
    <Tag
      className={cn(
        'py-20 md:py-24 lg:py-28',
        bordered && 'border-t border-border',
        className,
      )}
      {...props}
    >
      <div className="container-page">{children}</div>
    </Tag>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  className,
  id,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string | null;
  align?: 'left' | 'center';
  className?: string;
  id?: string;
}) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && (
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-accent">
          {eyebrow}
        </p>
      )}
      <h2 id={id} className="text-3xl leading-[1.15] md:text-4xl lg:text-[2.6rem]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/** Renders CMS body copy where blank lines separate paragraphs. */
export function Paragraphs({
  text,
  className,
  paragraphClassName,
}: {
  text: string;
  className?: string;
  paragraphClassName?: string;
}) {
  const paragraphs = text.split(/\n{2,}/).filter(Boolean);
  return (
    <div className={className}>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className={cn(index > 0 && 'mt-4', paragraphClassName)}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}
