import { requireCapability } from '@/lib/auth/guard';
import { can } from '@/lib/auth/permissions';
import { listAdminMedia } from '@/lib/admin/content';
import { AdminPageHeader } from '@/components/admin/admin-ui';
import { MediaLibrary } from '@/components/admin/media/media-library';

export const dynamic = 'force-dynamic';

export default async function AdminMediaPage() {
  const admin = await requireCapability('media');
  const media = await listAdminMedia();
  const folders = [...new Set(media.map((item) => item.folder))].sort();

  return (
    <>
      <AdminPageHeader
        title="Media library"
        description="Images are delivered through Next.js in AVIF or WebP, resized per device — upload the highest-quality original you have."
      />
      <MediaLibrary
        media={media}
        folders={folders}
        canManage={can(admin.role, 'media', 'manage')}
      />
    </>
  );
}
