'use client';

import * as React from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Illustration of an AI agent workflow.
 *
 * This is a drawing, not a screenshot. It depicts how a multi-agent build is
 * structured — a planning agent, an implementing agent, a test agent, a review
 * agent — and nothing inside it is presented as a product, a client or a
 * measured result. The content rules forbid inventing those, and a mock that
 * looks like a real dashboard is exactly how that happens by accident.
 *
 * It is always dark, in both themes, for the same reason a code block is: it is
 * standing in for an editor, and an editor that turns white in light mode stops
 * reading as one.
 *
 * The sequence advances on a timer while it is on screen, pauses when scrolled
 * away or the tab is hidden, and under prefers-reduced-motion renders its final
 * state immediately with no timer at all.
 */

interface Step {
  /** Which agent is working during this step. */
  agent: string;
  /** Status line in the editor tab bar. */
  status: string;
  /** Lines of the log that have appeared by the end of this step. */
  log: string[];
  /** Code lines revealed by the end of this step. */
  revealed: number;
}

export interface AgentStudioCopy {
  teamLabel: string;
  activeLabel: string;
  agents: { id: string; short: string; name: string }[];
  lead: string;
  file: string;
  steps: Step[];
}

/** Code shown in the editor. Deliberately generic and unbranded. */
const CODE: { indent: number; tokens: { text: string; kind?: string }[] }[] = [
  { indent: 0, tokens: [{ text: '// agent:coder', kind: 'comment' }, { text: '  orders → warehouse', kind: 'comment' }] },
  {
    indent: 0,
    tokens: [
      { text: 'export', kind: 'keyword' }, { text: ' ' },
      { text: 'async', kind: 'keyword' }, { text: ' ' },
      { text: 'function', kind: 'keyword' }, { text: ' ' },
      { text: 'syncOrders', kind: 'fn' }, { text: '(shop, erp) {' },
    ],
  },
  {
    indent: 1,
    tokens: [
      { text: 'const', kind: 'keyword' }, { text: ' orders = ' },
      { text: 'await', kind: 'keyword' }, { text: ' shop.' },
      { text: 'orders', kind: 'fn' }, { text: '(' },
      { text: "'paid'", kind: 'string' }, { text: ');' },
    ],
  },
  {
    indent: 1,
    tokens: [
      { text: 'for', kind: 'keyword' }, { text: ' (' },
      { text: 'const', kind: 'keyword' }, { text: ' o ' },
      { text: 'of', kind: 'keyword' }, { text: ' orders) {' },
    ],
  },
  {
    indent: 2,
    tokens: [
      { text: 'await', kind: 'keyword' }, { text: ' erp.' },
      { text: 'upsert', kind: 'fn' }, { text: '(' },
      { text: "'orders'", kind: 'string' }, { text: ', ' },
      { text: 'mapOrder', kind: 'fn' }, { text: '(o));' },
    ],
  },
  { indent: 1, tokens: [{ text: '}' }] },
  {
    indent: 1,
    tokens: [
      { text: 'return', kind: 'keyword' }, { text: ' { synced: orders.length };' },
    ],
  },
  { indent: 0, tokens: [{ text: '}' }] },
];

const TOKEN_CLASS: Record<string, string> = {
  comment: 'text-[#6b7a55]',
  keyword: 'text-[#c3e88d]',
  string: 'text-[#f0a060]',
  fn: 'text-[#9fd1ff]',
};

export function AgentStudio({ copy, className }: { copy: AgentStudioCopy; className?: string }) {
  const reduced = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-15% 0px -15% 0px' });

  const lastStep = copy.steps.length - 1;
  // With reduced motion the illustration is a still: the finished state.
  const [step, setStep] = React.useState(reduced ? lastStep : 0);

  React.useEffect(() => {
    if (reduced) return;
    if (!inView) return;

    let timer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      timer = setTimeout(() => {
        // A hidden tab should not advance; rAF-less timers keep firing there.
        if (document.visibilityState === 'visible') {
          setStep((current) => (current + 1) % copy.steps.length);
        }
        schedule();
      }, 2200);
    };

    schedule();
    return () => clearTimeout(timer);
  }, [reduced, inView, copy.steps.length]);

  const current = copy.steps[step];

  return (
    <div
      ref={ref}
      // Fixed dark surface in both themes — see the note above.
      className={cn(
        'overflow-hidden rounded-2xl border border-[#2a3320] bg-[#0d1108] shadow-lg',
        className,
      )}
      role="img"
      aria-label={`${copy.teamLabel}: ${copy.agents.map((a) => a.name).join(', ')}`}
    >
      {/* ── Window chrome ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 border-b border-[#222a19] px-4 py-3">
        <span className="flex gap-1.5" aria-hidden="true">
          {['#3d4a30', '#3d4a30', '#3d4a30'].map((c, i) => (
            <span key={i} className="size-2.5 rounded-full" style={{ background: c }} />
          ))}
        </span>
        <span className="truncate font-mono text-xs text-[#7e8f68]">drh.al/agent-studio</span>
        <span className="ml-auto flex shrink-0 items-center gap-2">
          <span className="relative flex size-1.5">
            {!reduced && (
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#c3e88d] opacity-60" />
            )}
            <span className="relative inline-flex size-1.5 rounded-full bg-[#c3e88d]" />
          </span>
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-[#c3e88d]">
            {copy.activeLabel}
          </span>
        </span>
      </div>

      {/* ── Agent team ────────────────────────────────────────────────────── */}
      <div className="px-4 pb-4 pt-4 sm:px-5">
        <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-[#5f6f4c]">
          {copy.teamLabel}
        </p>

        <ul className="mt-3 flex flex-wrap gap-2">
          {copy.agents.map((agent) => {
            const active = agent.id === current.agent;
            return (
              <li key={agent.id}>
                <span
                  className={cn(
                    'flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs transition-colors duration-500',
                    active
                      ? 'border-[#c3e88d]/50 bg-[#c3e88d]/10 text-[#dff3c0]'
                      : 'border-[#293320] bg-[#121709] text-[#7e8f68]',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-5 items-center justify-center rounded-full font-mono text-[0.5625rem] transition-colors duration-500',
                      active ? 'bg-[#c3e88d] text-[#0d1108]' : 'bg-[#1e2614] text-[#6b7a55]',
                    )}
                  >
                    {agent.short}
                  </span>
                  {agent.name}
                  {active && <span className="size-1.5 rounded-full bg-[#c3e88d]" />}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-2.5 inline-flex items-center gap-2 rounded-full border border-[#c3e88d]/40 bg-[#c3e88d]/[0.07] px-2.5 py-1.5 text-xs text-[#dff3c0]">
          <span className="relative flex size-5 items-center justify-center">
            <span
              className={cn(
                'absolute size-5 rounded-full border border-[#c3e88d]/60',
                !reduced && 'animate-pulse',
              )}
            />
            <span className="size-2 rounded-full bg-[#c3e88d]" />
          </span>
          {copy.lead}
        </div>
      </div>

      {/* ── Editor ────────────────────────────────────────────────────────── */}
      <div className="border-t border-[#222a19]">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-[#222a19] px-4 py-2.5 sm:px-5">
          <span className="rounded-md border border-[#293320] bg-[#121709] px-2.5 py-1 font-mono text-[0.6875rem] text-[#b9cf96]">
            {copy.file}
          </span>
          <span className="flex min-w-0 items-center gap-2 font-mono text-[0.6875rem] text-[#7e8f68]">
            <span className="size-1.5 shrink-0 rounded-full bg-[#c3e88d]" aria-hidden="true" />
            <span className="truncate">{current.status}</span>
          </span>
        </div>

        <pre className="overflow-x-auto px-4 py-4 font-mono text-[0.6875rem] leading-[1.7] sm:px-5 sm:text-xs">
          <code>
            {CODE.map((line, index) => {
              const shown = index < current.revealed;
              return (
                <span
                  key={index}
                  className="flex gap-3 transition-opacity duration-500"
                  style={{ opacity: shown ? 1 : 0.18 }}
                >
                  <span className="w-4 shrink-0 select-none text-right text-[#4a5839]">
                    {index + 1}
                  </span>
                  <span style={{ paddingLeft: `${line.indent * 1.1}rem` }}>
                    {line.tokens.map((token, i) => (
                      <span key={i} className={token.kind ? TOKEN_CLASS[token.kind] : 'text-[#c9d6b4]'}>
                        {token.text}
                      </span>
                    ))}
                  </span>
                </span>
              );
            })}
          </code>
        </pre>
      </div>

      {/* ── Log ───────────────────────────────────────────────────────────── */}
      <div className="border-t border-[#222a19] px-4 py-3.5 font-mono text-[0.6875rem] leading-relaxed sm:px-5">
        {current.log.map((entry, index) => (
          <p key={entry} className="flex gap-2 text-[#8fa377]">
            <span className="shrink-0 text-[#c3e88d]">{index === current.log.length - 1 ? '›' : '✓'}</span>
            <span className="truncate">{entry}</span>
          </p>
        ))}
      </div>

    </div>
  );
}
