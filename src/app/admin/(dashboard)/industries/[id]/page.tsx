import { notFound } from 'next/navigation';
import { requireCapability } from '@/lib/auth/guard';
import { getAdminIndustry } from '@/lib/admin/content';
import { AdminPageHeader, ContentStatusBadge } from '@/components/admin/admin-ui';
import { IndustryForm } from '@/components/admin/industries/industry-form';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export default async function EditIndustryPage({ params, searchParams }: Props) {
  await requireCapability('industries', 'manage');
  const { id } = await params;
  const { saved } = await searchParams;

  const industry = await getAdminIndustry(id);
  if (!industry) notFound();

  const title = industry.translations.find((t) => t.language === 'en')?.title ?? industry.slug;

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[{ label: 'Industries', href: '/admin/industries' }, { label: title }]}
        title={title}
        description={`/industries/${industry.slug}`}
        actions={
          <>
            <ContentStatusBadge status={industry.status} />
            <Button asChild variant="outline" size="sm">
              <a href={`/industries/${industry.slug}`} target="_blank" rel="noopener noreferrer">
                Preview
              </a>
            </Button>
          </>
        }
      />

      {saved && (
        <p role="status" className="mb-6 rounded-lg border border-success/30 bg-success/8 px-4 py-3 text-sm text-success">
          Industry saved.
        </p>
      )}

      <IndustryForm industry={industry} translations={industry.translations} />
    </>
  );
}
