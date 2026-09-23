import { draftMode } from 'next/headers';
import { Eye } from 'lucide-react';

/**
 * Marks a page that is being viewed in draft preview.
 *
 * Unpublished content rendering at a public URL is exactly the sort of thing
 * that gets mistaken for a live page, so the state is stated plainly and the
 * way out is one click. Rendered above everything, in the accent colour, and
 * never present for an ordinary visitor.
 */
export async function DraftBanner({ path }: { path: string }) {
  const draft = await draftMode();
  if (!draft.isEnabled) return null;

  return (
    <div className="sticky top-0 z-[70] bg-accent text-accent-foreground">
      <div className="container-page flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-2.5">
        <p className="flex items-center gap-2 text-sm font-medium">
          <Eye className="size-4 shrink-0" aria-hidden="true" />
          Draft preview — this page is not visible to the public.
        </p>
        {/*
          A plain anchor, not the i18n Link: this hits a route handler that
          clears the cookie, so it must be a real navigation rather than a
          client-side transition.
        */}
        <a
          href={`/admin/api/preview/exit?path=${encodeURIComponent(path)}`}
          className="rounded-md px-3 py-1 text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-80"
        >
          Exit preview
        </a>
      </div>
    </div>
  );
}
