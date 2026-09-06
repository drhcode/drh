import { StatCardSkeleton, TableSkeleton } from '@/components/admin/admin-ui';

/** Admin loading skeleton (spec §88). */
export default function AdminLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8 h-8 w-48 rounded-md bg-surface-sunken" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
      <div className="mt-6 rounded-xl border border-border bg-surface p-5">
        <TableSkeleton rows={6} />
      </div>
    </div>
  );
}
