'use client';

import * as React from 'react';
import Image from 'next/image';

/**
 * Before/after drag slider. A native range input covers the frame, so it works
 * with mouse, touch and keyboard (arrow keys, Home/End) and is announced as a
 * slider by screen readers. Vertical scrolling still works on touch screens.
 */
export function BeforeAfter({
  before,
  after,
  labels,
}: {
  before: string;
  after: string;
  labels: { before: string; after: string; compare: string; beforeAlt: string; afterAlt: string };
}) {
  const [value, setValue] = React.useState(50);
  const id = React.useId();

  return (
    <div className="relative mt-12 h-[clamp(320px,42vw,560px)] touch-pan-y overflow-hidden rounded-[28px] border border-ln has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-4 has-[input:focus-visible]:outline-acct">
      <Image src={after} alt={labels.afterAlt} fill sizes="(max-width: 1280px) 100vw, 1184px" className="object-cover object-top" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}>
        <Image src={before} alt={labels.beforeAlt} fill sizes="(max-width: 1280px) 100vw, 1184px" className="object-cover object-top" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -ml-[1.5px] w-[3px] bg-lime"
        style={{ left: `${value}%` }}
      >
        <span className="absolute left-1/2 top-1/2 -ml-7 -mt-7 grid size-14 place-items-center rounded-full bg-lime text-ink shadow-[0_10px_30px_-8px_#000]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" />
          </svg>
        </span>
      </div>
      <span className="mono pointer-events-none absolute left-5 top-5 rounded-full bg-ink px-3 py-1.5 text-[11px] tracking-[.1em] text-[#F2F4F0]">
        {labels.before}
      </span>
      <span className="mono pointer-events-none absolute right-5 top-5 rounded-full bg-lime px-3 py-1.5 text-[11px] tracking-[.1em] text-ink">
        {labels.after}
      </span>
      <label htmlFor={id} className="sr-only">
        {labels.compare}
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => setValue(Number(event.target.value))}
        aria-valuetext={`${value}%`}
        className="absolute inset-0 m-0 h-full w-full cursor-ew-resize opacity-0 focus-visible:opacity-0"
      />
    </div>
  );
}
