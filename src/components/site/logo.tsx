import Image from 'next/image';
import { cn } from '@/lib/utils';
import { DrhLogo } from '@/components/brand/drh-logo';

/**
 * Site logo.
 *
 * Renders the uploaded logo from /admin/settings when one exists, and falls
 * back to the built-in DRH logo when it does not — so a fresh install still
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
    return <DrhLogo title={alt} className={cn('h-6 text-foreground', className)} />;
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
        className={cn('object-contain object-left', hasDarkVariant ? 'dark:hidden' : 'logo-single')}
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

