/**
 * Deciding what a submitted form means for a translation row.
 *
 * Every bilingual editor posts one form containing both languages. The actions
 * used to treat "no title for this language" as "the editor removed this
 * translation" and delete the row. That conflated two very different things:
 *
 *   - the editor genuinely cleared the title, and the row should go, versus
 *   - the language's fields were never in the submission at all.
 *
 * The second case used to happen constantly, because Radix unmounts an inactive
 * tab panel: saving while the Albanian tab was open submitted no `title_en`, so
 * the English translation was deleted. Whichever tab happened to be open
 * decided whether the other language survived.
 *
 * `BilingualTabs` now keeps both panels mounted, so the fields are always
 * submitted. This helper is the second line of defence: destroying stored
 * content requires positive evidence that the editor asked for it, and a field
 * that simply is not in the payload can never be that evidence.
 */

export type TranslationIntent =
  /** The language's fields were submitted with a title — write the row. */
  | 'write'
  /** Submitted with the title deliberately emptied — remove the row. */
  | 'clear'
  /** Not part of this submission at all — leave whatever is stored untouched. */
  | 'absent';

/**
 * Classifies what a submitted form is asking for, for one language.
 *
 * The title field is the marker because every bilingual form requires one, and
 * a translation without a title is what the CMS treats as missing.
 */
export function translationIntent(
  formData: FormData,
  language: 'en' | 'sq',
  titleField = `title_${language}`,
): TranslationIntent {
  // `has` is the whole point: it separates "sent empty" from "never sent".
  if (!formData.has(titleField)) return 'absent';

  const raw = formData.get(titleField);
  const title = typeof raw === 'string' ? raw.trim() : '';

  return title === '' ? 'clear' : 'write';
}
