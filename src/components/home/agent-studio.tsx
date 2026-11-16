'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Magnetic } from '@/components/fx/pointer-fx';

/**
 * The "agent-studio" window from the design: an illustration of how an AI
 * build runs, with one real interaction — approving the human gate. It shows
 * no client data and makes no claim; the figure is labelled as illustrative.
 */
export function AgentStudio() {
  const t = useTranslations('home.studio');
  const [approved, setApproved] = React.useState(false);

  const agents = [
    { name: t('architect'), status: t('done'), task: t('taskArchitect'), width: '100%', color: '#D4FF3A', cls: 'bar' },
    { name: t('coder'), status: t('running'), task: t('taskCoder'), width: '40%', color: '#F2C38B', cls: 'load' },
    { name: t('tester'), status: t('queued'), task: t('taskTester'), width: '12%', color: 'var(--t3)', cls: '' },
    {
      name: t('reviewer'),
      status: approved ? t('approvedStatus') : t('needsYou'),
      task: t('taskReviewer'),
      width: approved ? '100%' : '0%',
      color: '#D4FF3A',
      cls: 'bar',
    },
  ];

  return (
    <figure
      className="reveal m-0 min-w-0 flex-[1_1_480px] overflow-hidden rounded-[28px] border border-ln bg-s1 shadow-[0_60px_120px_-40px_var(--sh)]"
      aria-label={t('illustration')}
    >
      <div className="flex items-center justify-between border-b border-ln px-5 py-4">
        <span className="flex gap-2" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-3 rounded-full bg-ln2" />
          ))}
        </span>
        <span className="mono text-[13px] text-t2">{t('name')}</span>
        <span className="mono inline-flex items-center gap-1.5 text-xs text-acct">
          <span className="pulse-dot size-1.5 rounded-full bg-lime" aria-hidden="true" />
          {t('active')}
        </span>
      </div>

      <ul className="grid gap-px bg-s2 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
        {agents.map((agent) => (
          <li key={agent.name} className="flex flex-col gap-2.5 bg-s1 px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{agent.name}</span>
              <span className="mono text-[11px]" style={{ color: agent.color === '#D4FF3A' ? 'var(--acct)' : agent.color }}>
                {agent.status}
              </span>
            </div>
            <div className="relative h-1 overflow-hidden rounded bg-s2" aria-hidden="true">
              <div className={`${agent.cls} h-full rounded`} style={{ width: agent.width, background: agent.color, transition: 'width .6s' }} />
            </div>
            <span className="text-[13px] text-t3">{agent.task}</span>
          </li>
        ))}
      </ul>

      <pre className="mono m-0 overflow-x-auto whitespace-pre p-6 text-sm leading-[1.9] text-t1" aria-hidden="true">
        <span className="rise d1 block text-t3">{'// sync-orders.ts'}</span>
        <span className="rise d2 block">
          <K>const</K> paid = <K>await</K> store.orders.list({'{'} status: <S>&quot;paid&quot;</S> {'}'});
        </span>
        <span className="rise d3 block">
          <K>for</K> (<K>const</K> order <K>of</K> paid) {'{'}
        </span>
        <span className="rise d4 block pl-6">
          <K>await</K> erp.warehouse.push(mapOrder(order));
        </span>
        <span className="rise d5 block">{'}'}</span>
        <span className="rise d6 block">
          log(<S>{'`synced ${paid.length} orders`'}</S>);
          <span className="blink ml-1 inline-block h-[18px] w-[9px] bg-lime align-[-3px]" />
        </span>
      </pre>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ln bg-s1 px-5 py-4">
        <span className="text-sm text-t1">{t('waiting')}</span>
        <Magnetic>
          <button
            type="button"
            className="btn btn-p btn-sm"
            aria-pressed={approved}
            onClick={() => setApproved(true)}
          >
            {approved ? t('approved') : t('approve')}
          </button>
        </Magnetic>
      </div>
    </figure>
  );
}

const K = ({ children }: { children: React.ReactNode }) => <span className="text-acct">{children}</span>;
const S = ({ children }: { children: React.ReactNode }) => <span className="text-[#F2C38B] [.t-light_&]:text-[#8a4b00]">{children}</span>;
