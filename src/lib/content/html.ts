import { headingId, plainText } from '@/lib/utils';

export interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * Adds stable anchor ids to <h2>/<h3> in stored article HTML and returns the
 * table of contents alongside it.
 *
 * Article HTML comes from the block editor in /admin/blog, i.e. from
 * authenticated staff, not from visitors. It is still parsed narrowly here —
 * only heading tags are rewritten — and rendered through a fixed prose
 * stylesheet rather than arbitrary inline styles.
 */
export function withHeadingAnchors(html: string): { html: string; toc: TocEntry[] } {
  const toc: TocEntry[] = [];
  const used = new Set<string>();

  const rewritten = html.replace(
    /<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi,
    (match, levelRaw: string, attrs: string | undefined, inner: string) => {
      const level = Number(levelRaw) as 2 | 3;
      const text = plainText(inner);
      if (!text) return match;

      // Respect an id the author already set; otherwise derive a unique one.
      const existing = attrs?.match(/\bid=["']([^"']+)["']/i)?.[1];
      let id = existing ?? headingId(text);
      let suffix = 2;
      while (!existing && used.has(id)) {
        id = `${headingId(text)}-${suffix}`;
        suffix += 1;
      }
      used.add(id);
      toc.push({ id, text, level });

      const cleanedAttrs = (attrs ?? '').replace(/\sid=["'][^"']*["']/i, '');
      return `<h${level}${cleanedAttrs} id="${id}">${inner}</h${level}>`;
    },
  );

  return { html: rewritten, toc };
}

/** Rough word count used for reading time when the editor saves a post. */
export function estimateReadingTime(html: string): number {
  const words = plainText(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
