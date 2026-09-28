import { getImageProps } from 'next/image';

/**
 * Case-study cover, art-directed between phone and desktop.
 *
 * A project can carry two crops: a landscape cover and an optional portrait one
 * for phones. The obvious implementation — two `<Image>` elements, one hidden
 * per breakpoint — renders correctly but downloads *both* files, because
 * `display: none` does not reliably stop an `<img>` from fetching. With
 * `priority` on each it also emits two preloads, so a phone paid for a desktop
 * JPEG it could never see.
 *
 * `<picture>` makes the choice in the browser before any request: exactly one
 * source is ever fetched. `getImageProps` is what keeps Next's optimiser in the
 * loop, since a bare `<source>` would otherwise bypass it and serve the
 * original file at full size.
 *
 * The frame itself is one element whose aspect ratio changes at the same
 * breakpoint as the source, so the portrait crop is never letterboxed into a
 * landscape box.
 */

/** Where the portrait crop gives way to the landscape one. */
const SWITCH = 768;

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
  const shared = { alt, quality: 82, priority } as const;

  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({
    ...shared,
    src: cover,
    width: 1600,
    height: 900,
    sizes: '(min-width: 1280px) 1200px, 100vw',
  });

  // The `<img>` fallback is the phone crop when there is one, so a browser
  // without <picture> support still gets something sensibly proportioned.
  const {
    props: { srcSet: mobileSrcSet, ...imgProps },
  } = getImageProps({
    ...shared,
    src: coverMobile || cover,
    width: coverMobile ? 900 : 1600,
    height: coverMobile ? 1125 : 900,
    sizes: '100vw',
  });

  return (
    <div
      className={
        'relative overflow-hidden rounded-xl border border-border bg-surface-sunken shadow-sm md:rounded-2xl ' +
        (coverMobile ? 'aspect-[4/5] md:aspect-[16/9]' : 'aspect-[4/3] md:aspect-[16/9]')
      }
    >
      {/*
        A bare <img> rather than next/image: the optimiser cannot render a
        <source>, so getImageProps is the supported way to art-direct. The src
        and srcSet still come from Next, so the files served are optimised.
      */}
      <picture>
        <source media={`(min-width: ${SWITCH}px)`} srcSet={desktopSrcSet} />
        {coverMobile && <source media={`(max-width: ${SWITCH - 1}px)`} srcSet={mobileSrcSet} />}
        <img
          {...imgProps}
          alt={alt}
          className="absolute inset-0 size-full object-cover"
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : undefined}
        />
      </picture>
    </div>
  );
}
