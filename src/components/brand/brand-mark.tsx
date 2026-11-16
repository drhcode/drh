import { cn } from '@/lib/utils';

/** The lime "drh" tile plus the drh.al wordmark, as drawn in the design. */
export function BrandMark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex flex-none items-center gap-2.5 font-bold tracking-[-0.04em] text-fg',
        compact ? 'text-[20px]' : 'text-[22px]',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'grid place-items-center rounded-[10px] bg-lime text-ink tracking-[-0.06em]',
          compact ? 'size-8 text-[13px]' : 'size-9 text-[15px]',
        )}
      >
        drh
      </span>
      <span>
        drh<span className="text-acct">.</span>al
      </span>
    </span>
  );
}
