/**
 * Message-file helpers. Pure functions with no Next.js dependency, so the
 * missing-translation report and the tests can use them directly.
 */

export type Messages = { [key: string]: string | Messages };

/** Deep merge: `override` wins, anything it lacks is taken from `base`. */
export function mergeMessages(base: Messages, override: Messages): Messages {
  const out: Messages = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const existing = out[key];
    out[key] =
      typeof value === 'object' && value !== null && typeof existing === 'object' && existing !== null
        ? mergeMessages(existing, value)
        : value;
  }
  return out;
}

/** Flattened dot-paths of every string in a message tree. */
export function messageKeys(messages: Messages, prefix = ''): string[] {
  return Object.entries(messages).flatMap(([key, value]) =>
    typeof value === 'string' ? [`${prefix}${key}`] : messageKeys(value, `${prefix}${key}.`),
  );
}

/** Keys present in `reference` but absent from `candidate`. */
export function missingKeys(reference: Messages, candidate: Messages): string[] {
  const have = new Set(messageKeys(candidate));
  return messageKeys(reference).filter((key) => !have.has(key));
}

/**
 * True when every key under the given namespaces is translated. Used to decide
 * whether a code-owned page (no CMS content) is genuinely available in a
 * locale, and so whether it earns an hreflang entry and a sitemap URL.
 */
export function isNamespaceComplete(
  reference: Messages,
  candidate: Messages,
  namespaces: string[],
): boolean {
  const missing = missingKeys(reference, candidate);
  return namespaces.every((ns) => !missing.some((key) => key === ns || key.startsWith(`${ns}.`)));
}
