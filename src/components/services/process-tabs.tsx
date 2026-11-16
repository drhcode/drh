'use client';

import * as React from 'react';

/**
 * Process stepper from the service artboard: a tab list of steps beside a
 * detail panel with a progress bar. Real ARIA tabs with arrow-key movement.
 */
export function ProcessTabs({
  steps,
  label,
  stepLabel,
}: {
  steps: { title: string; body: string }[];
  label: string;
  /** e.g. "STEP {n} / {total}" with the numbers already filled in per step. */
  stepLabel: string[];
}) {
  const [active, setActive] = React.useState(0);
  const tabs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const id = React.useId();

  if (steps.length === 0) return null;
  const current = steps[active];

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    const delta = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1 : 0;
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : steps.length - 1;
      setActive(next);
      tabs.current[next]?.focus();
      return;
    }
    if (!delta) return;
    event.preventDefault();
    const next = (active + delta + steps.length) % steps.length;
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className="mt-14 flex flex-wrap gap-6">
      <div role="tablist" aria-label={label} aria-orientation="vertical" className="flex flex-[1_1_360px] flex-col gap-2">
        {steps.map((step, index) => {
          const selected = index === active;
          return (
            <button
              key={step.title}
              ref={(node) => {
                tabs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${index}`}
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={onKeyDown}
              className={
                selected
                  ? 'btn flex items-center justify-start gap-5 rounded-[20px] border border-lime bg-lime p-6 text-left text-[22px] font-semibold tracking-[-0.02em] text-ink'
                  : 'btn flex items-center justify-start gap-5 rounded-[20px] border border-ln bg-transparent p-6 text-left text-[22px] font-semibold tracking-[-0.02em] text-fg'
              }
            >
              <span className="mono text-[13px] font-normal opacity-70">{String(index + 1).padStart(2, '0')}</span>
              <span className="whitespace-normal">{step.title}</span>
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${active}`}
        className="flex min-h-[380px] min-w-0 flex-[1_1_520px] flex-col gap-6 rounded-[28px] border border-ln bg-s1 p-12 max-sm:min-h-0 max-sm:p-7"
      >
        <p className="mono text-[13px] text-acct">{stepLabel[active]}</p>
        <h3 className="m-0 text-[clamp(32px,3.4vw,48px)] font-semibold leading-[1.05] tracking-[-0.035em]">{current.title}</h3>
        <p className="max-w-[520px] text-lg leading-relaxed text-t2">{current.body}</p>
        <div className="mt-auto h-1.5 overflow-hidden rounded-md bg-s2" aria-hidden="true">
          <div
            className="h-full rounded-md bg-lime transition-[width] duration-600 ease-[cubic-bezier(.2,.7,.2,1)]"
            style={{ width: `${((active + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
