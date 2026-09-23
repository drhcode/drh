import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/guard';
import { can } from '@/lib/auth/permissions';

/**
 * Draft preview (spec §54).
 *
 * The admin listed a Preview button against every content type, pointing
 * straight at the public URL — which 404s for anything not yet published. Since
 * a newly created item is a draft by default, the first thing an editor saw
 * after saving was a 404.
 *
 * This enables Next's draft mode for the current session and forwards to the
 * public page, which then reads unpublished rows.
 *
 * Authorisation is checked here, server-side, every time: draft mode exposes
 * content that is deliberately not public, so the cookie must never be
 * obtainable by someone who is not a signed-in editor.
 */

/** Only internal paths, and only the ones that render CMS content. */
const ALLOWED = /^\/(sq\/)?(work|blog|services|industries)\/[A-Za-z0-9-]+$|^\/(sq\/)?[A-Za-z0-9-]+$/;

export async function GET(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  const url = new URL(request.url);
  const path = url.searchParams.get('path') ?? '';

  /*
   * An open redirect here would be handed out to anyone who can reach the
   * admin, so the target must be a relative path on this site and must match a
   * content route. Protocol-relative URLs ("//evil.com") are rejected too.
   */
  if (!path.startsWith('/') || path.startsWith('//') || !ALLOWED.test(path)) {
    redirect('/admin');
  }

  // Previewing is a read; anyone who can view content in the admin may preview.
  const resource = path.includes('/blog/')
    ? 'blog'
    : path.includes('/work/')
      ? 'projects'
      : path.includes('/services/')
        ? 'services'
        : path.includes('/industries/')
          ? 'industries'
          : 'pages';

  if (!can(admin.role, resource, 'view')) redirect('/admin');

  const draft = await draftMode();
  draft.enable();

  redirect(path);
}
