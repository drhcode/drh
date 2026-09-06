import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit, getRequestContext } from '@/lib/security/request';

/**
 * First-party content engagement events (spec §91).
 *
 * Stores only what is needed to report on which case studies and services get
 * attention: an event name, an entity reference, the path, a device category
 * and a coarse country. No cookie, no identifier, no IP address.
 */
const eventSchema = z.object({
  event: z.string().trim().min(1).max(60),
  path: z.string().trim().max(300).optional(),
  entity_type: z.string().trim().max(40).optional(),
  entity_id: z.string().uuid().optional(),
  slug: z.string().trim().max(120).optional(),
  service: z.string().trim().max(120).optional(),
  budget: z.string().trim().max(60).optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  const supabase = getSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ ok: true });

  const context = await getRequestContext();

  // Generous ceiling: enough to stop a flood, never enough to affect a real visit.
  const { allowed } = await checkRateLimit('events', context.identifierHash, {
    limit: 120,
    windowMinutes: 10,
  });
  if (!allowed) return NextResponse.json({ ok: true });

  const { event, path, entity_type, entity_id, ...metadata } = parsed.data;

  await supabase.from('page_events').insert({
    event_name: event,
    entity_type: entity_type ?? null,
    entity_id: entity_id ?? null,
    path: path ?? null,
    device: context.device,
    country: context.country,
    metadata: Object.keys(metadata).length > 0 ? metadata : null,
  });

  return NextResponse.json({ ok: true });
}
