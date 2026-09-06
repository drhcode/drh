import { requireCapability } from '@/lib/auth/guard';
import { can } from '@/lib/auth/permissions';
import { getEditorReferences, listFaqs } from '@/lib/admin/content';
import { AdminPageHeader } from '@/components/admin/admin-ui';
import { FaqManager } from '@/components/admin/faqs/faq-manager';

export const dynamic = 'force-dynamic';

export default async function AdminFaqsPage() {
  const admin = await requireCapability('faqs');
  const [faqs, references] = await Promise.all([listFaqs(), getEditorReferences()]);

  return (
    <>
      <AdminPageHeader
        title="FAQs"
        description="Shown on the homepage, contact page, service pages and industry pages."
      />
      <FaqManager
        faqs={faqs}
        services={references.services}
        industries={references.industries}
        canManage={can(admin.role, 'faqs', 'manage')}
      />
    </>
  );
}
