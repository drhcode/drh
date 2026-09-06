import { requireCapability } from '@/lib/auth/guard';
import { getCompanySettings } from '@/lib/data';
import { AdminPageHeader } from '@/components/admin/admin-ui';
import { SettingsForm } from '@/components/admin/settings/settings-form';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  await requireCapability('settings', 'manage');
  const settings = await getCompanySettings();

  return (
    <>
      <AdminPageHeader
        title="Settings"
        description="Company details used across the site — header, footer, contact page, emails and structured data."
      />
      <SettingsForm settings={settings} />
    </>
  );
}
