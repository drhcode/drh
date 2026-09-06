import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth/guard';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { can } from '@/lib/auth/permissions';

/**
 * Admin ⌘K record search (spec §72).
 *
 * Authorization is checked here, per resource — the palette in the browser
 * filters its own list for tidiness, but this endpoint is what actually decides
 * what the caller may see.
 */
export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ results: [] }, { status: 401 });

  const term = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (term.length < 2) return NextResponse.json({ results: [] });

  const supabase = getSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ results: [] });

  // PostgREST `or` filters take a comma-separated list, so a comma in the term
  // would break out of the intended filter. Strip the characters that matter.
  const safe = term.replace(/[,()%*]/g, ' ').trim();
  if (!safe) return NextResponse.json({ results: [] });
  const pattern = `%${safe}%`;

  const results: {
    id: string;
    type: string;
    title: string;
    subtitle: string | null;
    href: string;
  }[] = [];

  if (can(admin.role, 'leads')) {
    const { data } = await supabase
      .from('leads')
      .select('id, name, email, company, status')
      .or(`name.ilike.${pattern},email.ilike.${pattern},company.ilike.${pattern}`)
      .order('created_at', { ascending: false })
      .limit(5);

    for (const lead of data ?? []) {
      results.push({
        id: `lead-${lead.id}`,
        type: 'lead',
        title: lead.name as string,
        subtitle: [lead.company, lead.email].filter(Boolean).join(' · '),
        href: `/admin/leads/${lead.id}`,
      });
    }
  }

  if (can(admin.role, 'projects')) {
    const { data } = await supabase
      .from('projects')
      .select('id, slug, client_name, status')
      .or(`client_name.ilike.${pattern},slug.ilike.${pattern}`)
      .limit(5);

    for (const project of data ?? []) {
      results.push({
        id: `project-${project.id}`,
        type: 'project',
        title: project.client_name as string,
        subtitle: `${project.slug} · ${project.status}`,
        href: `/admin/projects/${project.id}`,
      });
    }
  }

  if (can(admin.role, 'blog')) {
    const { data } = await supabase
      .from('blog_translations')
      .select('post_id, title, blog_posts!inner(slug, status)')
      .ilike('title', pattern)
      .limit(5);

    for (const row of data ?? []) {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const post = (row as any).blog_posts;
      results.push({
        id: `blog-${(row as any).post_id}`,
        type: 'blog',
        title: (row as any).title,
        subtitle: post ? `${post.slug} · ${post.status}` : null,
        href: `/admin/blog/${(row as any).post_id}`,
      });
      /* eslint-enable @typescript-eslint/no-explicit-any */
    }
  }

  if (can(admin.role, 'pages')) {
    const { data } = await supabase
      .from('pages')
      .select('id, slug, kind, status')
      .ilike('slug', pattern)
      .limit(5);

    for (const page of data ?? []) {
      results.push({
        id: `page-${page.id}`,
        type: 'page',
        title: page.slug as string,
        subtitle: `${page.kind} · ${page.status}`,
        href: `/admin/pages/${page.id}`,
      });
    }
  }

  if (can(admin.role, 'testimonials')) {
    const { data } = await supabase
      .from('testimonials')
      .select('id, client_name, company')
      .or(`client_name.ilike.${pattern},company.ilike.${pattern}`)
      .limit(5);

    for (const testimonial of data ?? []) {
      results.push({
        id: `testimonial-${testimonial.id}`,
        type: 'testimonial',
        title: testimonial.client_name as string,
        subtitle: (testimonial.company as string | null) ?? null,
        href: `/admin/testimonials/${testimonial.id}`,
      });
    }
  }

  return NextResponse.json({ results });
}
