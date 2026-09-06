import { notFound } from 'next/navigation';
import { requireCapability } from '@/lib/auth/guard';
import { getAdminService, getEditorReferences } from '@/lib/admin/content';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { AdminPageHeader, ContentStatusBadge } from '@/components/admin/admin-ui';
import { ServiceForm } from '@/components/admin/services/service-form';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}

async function getServiceTechnologySlugs(serviceId: string): Promise<string[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from('service_technologies')
    .select('technologies(slug)')
    .eq('service_id', serviceId);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  return ((data ?? []) as any[]).map((row) => row.technologies?.slug).filter(Boolean);
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export default async function EditServicePage({ params, searchParams }: Props) {
  await requireCapability('services', 'manage');
  const { id } = await params;
  const { saved } = await searchParams;

  const [service, references, technologySlugs] = await Promise.all([
    getAdminService(id),
    getEditorReferences(),
    getServiceTechnologySlugs(id),
  ]);

  if (!service) notFound();

  const title = service.translations.find((t) => t.language === 'en')?.title ?? service.slug;

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[{ label: 'Services', href: '/admin/services' }, { label: title }]}
        title={title}
        description={`/services/${service.slug}`}
        actions={
          <>
            <ContentStatusBadge status={service.status} />
            <Button asChild variant="outline" size="sm">
              <a href={`/services/${service.slug}`} target="_blank" rel="noopener noreferrer">
                Preview
              </a>
            </Button>
          </>
        }
      />

      {saved && (
        <p role="status" className="mb-6 rounded-lg border border-success/30 bg-success/8 px-4 py-3 text-sm text-success">
          Service saved.
        </p>
      )}

      <ServiceForm
        service={service}
        translations={service.translations}
        technologies={references.technologies}
        technologySlugs={technologySlugs}
      />
    </>
  );
}
