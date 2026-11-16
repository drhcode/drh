import { Fragment } from 'react';
import { cn } from '@/lib/utils';

/**
 * Headline text with an italic accent (Instrument Serif), as in the design.
 *
 * Copy marks the accent by wrapping it in asterisks — "Built for *growth*." —
 * which keeps the accent inside a single translatable string. CMS titles have
 * no markers, so `autoLast` accents the last word instead (titles of one or two
 * words are left alone: accenting half a heading stops reading as an accent).
 */
export function Accent({
  text,
  autoLast = false,
  className,
  plain = false,
}: {
  text: string;
  autoLast?: boolean;
  /** Extra classes for the accent word. */
  className?: string;
  /** Keep the surrounding text colour (used on lime and inverted bands). */
  plain?: boolean;
}) {
  const accentClass = cn('it', plain && 'it-plain', className);
  const parts = text.split(/(\*[^*]+\*)/g);

  if (parts.length > 1) {
    return (
      <>
        {parts.map((part, index) =>
          part.startsWith('*') && part.endsWith('*') ? (
            <em key={index} className={accentClass}>
              {part.slice(1, -1)}
            </em>
          ) : (
            <Fragment key={index}>{part}</Fragment>
          ),
        )}
      </>
    );
  }

  const words = text.trim().split(/\s+/);
  if (!autoLast || words.length < 3) return <>{text}</>;

  const last = words.pop() ?? '';
  // Keep trailing punctuation upright, after the italic word.
  const match = last.match(/^(.*?)([.!?:,]*)$/);
  return (
    <>
      {words.join(' ')} <em className={accentClass}>{match?.[1] ?? last}</em>
      {match?.[2]}
    </>
  );
}

/** Plain-text version of an accented string, for metadata and aria labels. */
export function stripAccent(text: string): string {
  return text.replace(/\*([^*]+)\*/g, '$1');
}
