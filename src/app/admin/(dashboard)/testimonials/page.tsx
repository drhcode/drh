import { requireCapability } from '@/lib/auth/guard';
import { can } from '@/lib/auth/permissions';
import { listTestimonials } from '@/lib/admin/content';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { AdminPageHeader } from '@/components/admin/admin-ui';
import { TestimonialManager } from '@/components/admin/testimonials/testimonial-manager';
import type { ProjectRow } from '@/types/database';

export const dynamic = 'force-dynamic';

async function listProjectOptions(): Promise<Pick<ProjectRow, 'id' | 'client_name'>[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];
  const { data } = await supabase.from('projects').select('id, client_name').order('client_name');
  return (data as Pick<ProjectRow, 'id' | 'client_name'>[] | null) ?? [];
}

export default async function AdminTestimonialsPage() {
  const admin = await requireCapability('testimonials');
  const [testimonials, projects] = await Promise.all([listTestimonials(), listProjectOptions()]);

  return (
    <>
      <AdminPageHeader
        title="Testimonials"
        description="Real client quotes only. The public section stays hidden while this list is empty."
      />
      <TestimonialManager
        testimonials={testimonials}
        projects={projects}
        canManage={can(admin.role, 'testimonials', 'manage')}
      />
    </>
  );
}
