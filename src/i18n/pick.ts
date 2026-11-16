import type { AbstractIntlMessages } from 'next-intl';

/**
 * A subset of the message catalogue for a client provider. Client components
 * only receive the namespaces they use, which keeps the serialised payload of
 * every page small.
 */
export function pickMessages(messages: AbstractIntlMessages, namespaces: string[]): AbstractIntlMessages {
  const out: AbstractIntlMessages = {};
  for (const ns of namespaces) {
    if (ns in messages) out[ns] = messages[ns];
  }
  return out;
}
