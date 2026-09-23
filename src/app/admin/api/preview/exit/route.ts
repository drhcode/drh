import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Leaves draft preview and returns to the public version of the page.
 *
 * No authorisation check: turning the preview cookie *off* only ever reduces
 * what the visitor can see.
 */
export async function GET(request: Request) {
  const draft = await draftMode();
  draft.disable();

  const url = new URL(request.url);
  const back = url.searchParams.get('path') ?? '/';

  redirect(back.startsWith('/') && !back.startsWith('//') ? back : '/');
}
