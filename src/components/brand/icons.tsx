import type { SVGProps } from 'react';

/**
 * The handful of stroke icons used by the design. Inline so they inherit
 * `currentColor` and cost no extra request; all are decorative by default.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 18, strokeWidth = 2, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const ArrowRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const ArrowUpRight = (p: IconProps) => (
  <Svg strokeWidth={2.2} {...p}>
    <path d="M7 17L17 7M9 7h8v8" />
  </Svg>
);

export const ArrowLeft = (p: IconProps) => (
  <Svg {...p}>
    <path d="M15 6l-6 6 6 6" />
  </Svg>
);

export const ChevronRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 6l6 6-6 6" />
  </Svg>
);

export const Check = (p: IconProps) => (
  <Svg strokeWidth={2.4} {...p}>
    <path d="M5 12l5 5L20 7" />
  </Svg>
);

export const Sun = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Svg>
);

export const Moon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
  </Svg>
);

export const Menu = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 8h16M4 16h16" />
  </Svg>
);

export const Close = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const Chat = (p: IconProps) => (
  <Svg size={22} {...p}>
    <path d="M4 20l1.4-4.2A8 8 0 1112 20a8 8 0 01-3.8-1z" />
  </Svg>
);

export const Spark = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19" />
  </Svg>
);

export const Search = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-4-4" />
  </Svg>
);

export const Upload = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 16V4M6 10l6-6 6 6M4 20h16" />
  </Svg>
);

export const Clock = (p: IconProps) => (
  <Svg strokeWidth={2.2} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
);

export const Video = (p: IconProps) => (
  <Svg strokeWidth={2.2} {...p}>
    <path d="M3 7h12v10H3zM15 10l6-3v10l-6-3" />
  </Svg>
);

export const LinkedIn = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 9v11M4 4v.01M9 20v-6a4 4 0 018 0v6M9 9v11" />
  </Svg>
);

export const Quote = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#D4FF3A" aria-hidden="true" focusable="false">
    <path d="M4 18h6v-6H6c0-2.2 1.8-4 4-4V6c-3.3 0-6 2.7-6 6v6zm10 0h6v-6h-4c0-2.2 1.8-4 4-4V6c-3.3 0-6 2.7-6 6v6z" />
  </svg>
);
