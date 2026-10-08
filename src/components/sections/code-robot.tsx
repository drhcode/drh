'use client';

import * as React from 'react';
import { useReducedMotion } from 'framer-motion';
import { Bug, Files, GitBranch, Puzzle, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * An editor window with a small robot typing into it.
 *
 * The code types out character by character, the terminal runs a build, the
 * robot smiles, and the loop starts over. It is an illustration rather than
 * content, so the whole thing is one labelled image to assistive technology.
 *
 * Timers only run while the window is on screen. Under prefers-reduced-motion
 * the finished state is rendered once and nothing moves.
 */

type Kind = 'k' | 'f' | 's' | 't' | 'n' | 'c' | 'p';
type Token = [Kind, string];

const CODE: Token[][] = [
  [['c', '// drh.al · how a project ships']],
  [['k', 'import'], ['p', ' { discover } '], ['k', 'from'], ['s', " '@drh/strategy'"], ['p', ';']],
  [['k', 'import'], ['p', ' { design, build } '], ['k', 'from'], ['s', " '@drh/studio'"], ['p', ';']],
  [],
  [['k', 'export async function'], ['p', ' '], ['f', 'ship'], ['p', '(idea: '], ['t', 'Idea'], ['p', ') {']],
  [['p', '  '], ['k', 'const'], ['p', ' plan = '], ['k', 'await'], ['p', ' '], ['f', 'discover'], ['p', '(idea.goals);']],
  [['p', '  '], ['k', 'const'], ['p', ' ui = '], ['f', 'design'], ['p', '(plan, { a11y: '], ['k', 'true'], ['p', ' });']],
  [['p', '  '], ['k', 'return'], ['p', ' '], ['f', 'build'], ['p', '(ui, { lighthouse: '], ['n', '95'], ['p', ' });']],
  [['p', '}']],
];

const LINE_LENGTHS = CODE.map((line) => line.reduce((sum, [, text]) => sum + text.length, 0));
const TOTAL = LINE_LENGTHS.reduce((a, b) => a + b, 0);

const TERMINAL = ['$ npm run build', '✓ Compiled successfully in 1.4s', '✓ Lighthouse 98 · SEO 100 · A11y 100'];

const FILES = ['app', 'components', 'ship.ts', 'design.ts', 'seo.ts'];

type Phase = 'typing' | 'building' | 'done';

/** Each line of CODE truncated to the first `typed` characters overall. */
function visibleCode(typed: number): Token[][] {
  let budget = typed;
  return CODE.map((line) => {
    const visible: Token[] = [];
    for (const [kind, text] of line) {
      if (budget <= 0) break;
      const slice = text.slice(0, budget);
      budget -= slice.length;
      visible.push([kind, slice]);
    }
    return visible;
  });
}

/** Ms per character, with a little jitter so it reads as a hand, not a clock. */
const TYPE_SPEED = 30;
const LINE_PAUSE = 180;
const TERMINAL_STEP = 650;
const HOLD = 3600;

export function CodeRobot({ label, className }: { label: string; className?: string }) {
  const reduced = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);
  const [typed, setTyped] = React.useState(0);
  const [phase, setPhase] = React.useState<Phase>('typing');
  const [terminalLines, setTerminalLines] = React.useState(0);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.2,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // One scheduler drives every phase. Each step queues exactly one timeout,
  // and the cleanup cancels it, so leaving the viewport freezes the loop.
  React.useEffect(() => {
    if (reduced || !visible) return;

    let delay: number;
    let next: () => void;

    if (phase === 'typing') {
      if (typed >= TOTAL) {
        delay = 500;
        next = () => setPhase('building');
      } else {
        // Pause briefly at the end of each line, like someone reading back.
        let boundary = 0;
        let atLineEnd = false;
        for (const length of LINE_LENGTHS) {
          boundary += length;
          if (typed === boundary && length > 0) atLineEnd = true;
        }
        delay = atLineEnd ? LINE_PAUSE : TYPE_SPEED * (0.55 + Math.random() * 0.9);
        next = () => setTyped((value) => value + 1);
      }
    } else if (phase === 'building') {
      if (terminalLines >= TERMINAL.length) {
        delay = 200;
        next = () => setPhase('done');
      } else {
        delay = TERMINAL_STEP;
        next = () => setTerminalLines((value) => value + 1);
      }
    } else {
      delay = HOLD;
      next = () => {
        setTyped(0);
        setTerminalLines(0);
        setPhase('typing');
      };
    }

    const timer = window.setTimeout(next, delay);
    return () => window.clearTimeout(timer);
  }, [reduced, visible, phase, typed, terminalLines]);

  const showTyped = reduced ? TOTAL : typed;
  const showTerminal = reduced ? TERMINAL.length : terminalLines;
  const showPhase: Phase = reduced ? 'done' : phase;

  // Where the caret sits, for both the caret itself and the status bar.
  let remaining = showTyped;
  let caretLine = 0;
  let caretColumn = 0;
  for (let i = 0; i < LINE_LENGTHS.length; i += 1) {
    if (remaining <= LINE_LENGTHS[i]) {
      caretLine = i;
      caretColumn = remaining;
      break;
    }
    remaining -= LINE_LENGTHS[i];
    caretLine = i + 1;
    caretColumn = 0;
  }
  caretLine = Math.min(caretLine, CODE.length - 1);

  const visibleLines = visibleCode(showTyped);

  return (
    <div ref={ref} role="img" aria-label={label} className={cn('relative', className)}>
      {/* Halo behind the window, so it floats on the page rather than sitting on it. */}
      <div
        aria-hidden="true"
        className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(closest-side,var(--accent-glow),transparent)] opacity-80 blur-2xl"
      />

      <div aria-hidden="true" className="code-window relative overflow-hidden rounded-xl">
        {/* Title bar */}
        <div className="code-chrome flex h-9 items-center gap-2 px-3.5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
          <span className="code-muted mx-auto pr-10 font-mono text-[11px]">drh.al — ship.ts</span>
        </div>

        <div className="flex">
          {/* Activity bar */}
          <div className="code-activity hidden w-11 shrink-0 flex-col items-center gap-4 py-3 sm:flex">
            <Files className="code-accent size-[18px]" />
            <Search className="code-muted size-[18px]" />
            <GitBranch className="code-muted size-[18px]" />
            <Bug className="code-muted size-[18px]" />
            <Puzzle className="code-muted size-[18px]" />
          </div>

          {/* Explorer */}
          <div className="code-explorer hidden w-36 shrink-0 py-2.5 font-mono text-[11px] md:block">
            <p className="code-muted px-3 pb-2 text-[10px] uppercase tracking-[0.12em]">Explorer</p>
            {FILES.map((file, index) => (
              <p
                key={file}
                className={cn(
                  'truncate px-3 py-[3px]',
                  index < 2 ? 'code-muted' : 'pl-6',
                  file === 'ship.ts' ? 'code-active code-text' : index >= 2 && 'code-muted',
                )}
              >
                {index < 2 ? `▸ ${file}` : file}
              </p>
            ))}
          </div>

          {/* Editor */}
          <div className="min-w-0 flex-1">
            <div className="code-tabs flex h-8 items-end font-mono text-[11px]">
              <span className="code-tab-active code-text flex h-full items-center gap-1.5 px-3">
                <span className="code-type">TS</span> ship.ts
              </span>
              <span className="code-muted flex h-full items-center px-3">design.ts</span>
            </div>

            <div className="overflow-hidden py-3 font-mono text-[10.5px] leading-[1.75] sm:text-[12.5px]">
              {visibleLines.map((line, lineIndex) => {
                const hasCaret = lineIndex === caretLine && showPhase === 'typing';
                return (
                  <div
                    key={lineIndex}
                    className={cn('flex whitespace-pre pr-3', hasCaret && 'code-line-active')}
                  >
                    <span className="code-gutter w-8 shrink-0 select-none pr-3 text-right sm:w-10">
                      {lineIndex + 1}
                    </span>
                    <span>
                      {line.map(([kind, text], index) => (
                        <span key={index} className={`code-${kind}`}>
                          {text}
                        </span>
                      ))}
                      {hasCaret && <span className="code-caret" />}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Terminal */}
            <div className="code-terminal min-h-[5.5rem] px-3 py-2 font-mono text-[10.5px] leading-[1.7] sm:text-[11.5px]">
              <p className="code-muted pb-1 text-[10px] uppercase tracking-[0.12em]">Terminal</p>
              {TERMINAL.slice(0, showTerminal).map((line, index) => (
                <p key={index} className={index === 0 ? 'code-text' : 'code-ok'}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Status bar */}
        {/* Right padding keeps the readout clear of the robot sitting on this corner. */}
        <div className="code-status flex h-6 items-center gap-4 pl-3 pr-28 font-mono text-[10.5px] sm:pr-40">
          <span className="flex items-center gap-1">
            <GitBranch className="size-3" /> main
          </span>
          <span className="hidden sm:inline">{showPhase === 'done' ? '✓ 0 problems' : 'TypeScript'}</span>
          <span className="ml-auto">
            Ln {caretLine + 1}, Col {caretColumn + 1}
          </span>
        </div>
      </div>

      <Robot
        state={showPhase}
        className="absolute -bottom-10 -right-3 w-28 drop-shadow-[0_18px_30px_rgba(0,0,0,0.35)] sm:-bottom-12 sm:-right-8 sm:w-40"
      />
    </div>
  );
}

/**
 * The robot. Drawn in SVG so it stays crisp at any size; every moving part is
 * its own group so CSS can animate it with transforms only.
 */
function Robot({ state, className }: { state: Phase; className?: string }) {
  const gradientId = React.useId();
  return (
    <svg
      viewBox="0 0 160 176"
      aria-hidden="true"
      className={cn('robot', state === 'typing' && 'robot-typing', state === 'done' && 'robot-happy', className)}
    >
      <defs>
        <linearGradient id={`${gradientId}-shell`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#cfc8f5" />
        </linearGradient>
      </defs>

      <g className="robot-body">
        {/* Antenna */}
        <line x1="80" y1="24" x2="80" y2="10" stroke="#2a2550" strokeWidth="3" strokeLinecap="round" />
        <circle className="robot-antenna" cx="80" cy="8" r="5" />

        {/* Ears */}
        <rect x="31" y="44" width="10" height="20" rx="4" fill="#9d93e0" />
        <rect x="119" y="44" width="10" height="20" rx="4" fill="#9d93e0" />

        {/* Head */}
        <rect x="38" y="22" width="84" height="62" rx="20" fill={`url(#${gradientId}-shell)`} stroke="#2a2550" strokeWidth="3" />
        <rect x="49" y="34" width="62" height="38" rx="13" fill="#120e2b" />

        {/* Face: eyes glance left, towards the code */}
        <g className="robot-eyes">
          <rect className="robot-eye" x="61" y="45" width="10" height="14" rx="5" />
          <rect className="robot-eye" x="89" y="45" width="10" height="14" rx="5" />
        </g>
        <path className="robot-smile" d="M70 64 Q80 71 90 64" fill="none" strokeWidth="3" strokeLinecap="round" />

        {/* Neck and torso */}
        <rect x="70" y="84" width="20" height="8" fill="#9d93e0" />
        <rect x="44" y="90" width="72" height="54" rx="16" fill={`url(#${gradientId}-shell)`} stroke="#2a2550" strokeWidth="3" />
        <circle className="robot-core" cx="80" cy="114" r="8" />
        <rect x="64" y="128" width="32" height="4" rx="2" fill="#9d93e0" />
      </g>

      {/* Arms reaching down to the keyboard */}
      <g className="robot-arm robot-arm-l">
        <path d="M48 102 Q26 116 34 146" fill="none" stroke="#2a2550" strokeWidth="9" strokeLinecap="round" />
        <path d="M48 102 Q26 116 34 146" fill="none" stroke="#e9e5ff" strokeWidth="4.5" strokeLinecap="round" />
        <circle cx="34" cy="148" r="7" fill="#9d93e0" stroke="#2a2550" strokeWidth="3" />
      </g>
      <g className="robot-arm robot-arm-r">
        <path d="M112 102 Q134 116 126 146" fill="none" stroke="#2a2550" strokeWidth="9" strokeLinecap="round" />
        <path d="M112 102 Q134 116 126 146" fill="none" stroke="#e9e5ff" strokeWidth="4.5" strokeLinecap="round" />
        <circle cx="126" cy="148" r="7" fill="#9d93e0" stroke="#2a2550" strokeWidth="3" />
      </g>

      {/* Keyboard */}
      <rect x="14" y="150" width="132" height="20" rx="6" fill="#1b1638" stroke="#2a2550" strokeWidth="3" />
      {Array.from({ length: 9 }, (_, index) => (
        <rect key={index} className="robot-key" x={22 + index * 13.2} y="156" width="9" height="7" rx="2" />
      ))}
    </svg>
  );
}
