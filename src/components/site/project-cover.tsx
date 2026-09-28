import Image from 'next/image';

/**
 * Case-study cover: the desktop screenshot and the phone screenshot together.
 *
 * Both crops are shown rather than swapped by breakpoint. The point of the pair
 * is to demonstrate that the same site was built for both, which is only
 * visible if both are on screen at once — so they sit side by side, bottom
 * aligned, at every width.
 *
 * The proportions come from the files themselves, not from habit. Uploaded
 * desktop captures run about 1700x1300 (≈4:3) and phone captures about 442x955
 * (≈9:19.5); framing the desktop shot at 16:9, as this previously did, cropped
 * roughly a quarter of its height away.
 *
 * Both images anchor to the top. A website screenshot loses its header and hero
 * first if it is cropped from the centre, which is the part worth keeping.
 */

/** Matches the phone captures the CMS receives, so nothing is letterboxed. */
const PHONE_ASPECT = '442/955';

export function ProjectCover({
  cover,
  coverMobile,
  alt,
  priority = false,
}: {
  cover: string;
  coverMobile?: string | null;
  alt: string;
  priority?: boolean;
}) {
  // Without a phone capture there is no pair to show, so the desktop shot takes
  // the full width instead of leaving a gap where the phone would have been.
  if (!coverMobile) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-surface-sunken shadow-sm md:rounded-2xl">
        <Image
          src={cover}
          alt={alt}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 1200px, 100vw"
          className="object-cover object-top"
        />
      </div>
    );
  }

  return (
    <div className="flex items-end gap-3 sm:gap-5 lg:gap-8">
      {/* Desktop capture — takes whatever width the phone leaves. */}
      <div className="relative aspect-[4/3] min-w-0 flex-1 overflow-hidden rounded-xl border border-border bg-surface-sunken shadow-sm md:rounded-2xl">
        <Image
          src={cover}
          alt={alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 70vw, (min-width: 640px) 72vw, 74vw"
          className="object-cover object-top"
        />
      </div>

      {/*
        Phone capture. Sized as a percentage rather than fixed pixels so the
        pair keeps its proportions from a 360px phone to a 1440px desktop, and
        capped so it cannot grow into a second hero on a very wide screen.
      */}
      <div
        className="relative w-[26%] max-w-[230px] shrink-0 overflow-hidden rounded-2xl border border-border bg-surface-sunken shadow-md sm:w-[24%] lg:rounded-[1.5rem]"
        style={{ aspectRatio: PHONE_ASPECT }}
      >
        <Image
          src={coverMobile}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1280px) 230px, 26vw"
          className="object-cover object-top"
        />
      </div>
    </div>
  );
}
