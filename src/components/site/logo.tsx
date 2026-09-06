import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * Site logo.
 *
 * Renders the uploaded logo from /admin/settings when one exists, and falls
 * back to the built-in wordmark when it does not — so a fresh install still
 * looks finished.
 *
 * Uploaded images carry no stored dimensions, so they are drawn with `fill`
 * inside a fixed box using `object-contain`. That reserves the space up front,
 * which means no layout shift regardless of the logo's aspect ratio, and
 * `object-left` keeps it aligned when the image is narrower than the box.
 */
export function Logo({
  className,
  src,
  srcDark,
  alt = 'drh.al',
  priority = false,
}: {
  className?: string;
  src?: string | null;
  srcDark?: string | null;
  alt?: string;
  priority?: boolean;
}) {
  if (!src) {
    return (
      <span
        className={cn(
          'inline-flex items-baseline text-[1.0625rem] font-semibold tracking-tight text-foreground',
          className,
        )}
      >
        drh
        <span className="text-accent">.</span>
        al
      </span>
    );
  }

  // Only render a second image when a genuinely different dark variant is set.
  const hasDarkVariant = Boolean(srcDark && srcDark !== src);

  return (
    <span className={cn('relative block h-8 w-[8rem]', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="256px"
        priority={priority}
        className={cn('object-contain object-left', hasDarkVariant && 'dark:hidden')}
      />
      {hasDarkVariant && (
        <Image
          src={srcDark!}
          alt=""
          aria-hidden="true"
          fill
          sizes="256px"
          priority={priority}
          className="hidden object-contain object-left dark:block"
        />
      )}
    </span>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-lg bg-foreground text-[0.8125rem] font-bold tracking-tight text-background',
        className,
      )}
      aria-hidden="true"
    >
      d<span className="text-accent">.</span>
    </span>
  );
}
