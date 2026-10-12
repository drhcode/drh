import { Fragment } from 'react';

/**
 * Headline text with italic caramel accents (Instrument Serif italic).
 *
 * Editors mark an accent by wrapping it in asterisks — "Built for *growth*".
 * When a title has no marker and `autoLast` is set, its last word becomes the
 * accent, which gives every display heading the same editorial rhythm without
 * anyone having to edit existing CMS copy. Titles of one or two words are
 * left alone: accenting half a heading stops reading as an accent.
 */
export function AccentTitle({ text, autoLast = false }: { text: string; autoLast?: boolean }) {
  const parts = text.split(/(\*[^*]+\*)/g);

  if (parts.length > 1) {
    return (
      <>
        {parts.map((part, index) =>
          part.startsWith('*') && part.endsWith('*') ? (
            <em key={index} className="accent-italic">
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

  const last = words.pop();
  return (
    <>
      {words.join(' ')} <em className="accent-italic">{last}</em>
    </>
  );
}
