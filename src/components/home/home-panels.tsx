import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { CountUp } from './count-up';

/* ── Stats band ─────────────────────────────────────────────────────────── */
export async function StatsBand() {
  const t = await getTranslations('home.stats');
  // The same figures the site already states (About page, CMS metrics).
  const stats = [
    { value: 8, suffix: '+', label: t('years') },
    { value: 100, suffix: '+', label: t('projects') },
    { value: 3, suffix: '', label: t('languages') },
    { value: 24, suffix: 'h', label: t('reply') },
  ];
  return (
    <section className="border-y border-ln">
      <dl className="mx-auto grid max-w-[1280px] [grid-template-columns:repeat(auto-fit,minmax(min(240px,50%),1fr))]">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col-reverse border-r border-ln px-[clamp(20px,4vw,48px)] py-12 max-sm:py-8">
            <dt className="mt-3 text-[15px] text-t3">{stat.label}</dt>
            <dd className="text-[clamp(48px,6vw,88px)] font-semibold leading-none tracking-[-0.05em]">
              <CountUp value={stat.value} />
              <span className="text-acct">{stat.suffix}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ── Illustrative growth chart (no data) ────────────────────────────────── */
export async function MeasuredChart() {
  const t = await getTranslations('home.chart');
  return (
    <figure
      className="reveal relative m-0 min-w-0 flex-[1.2_1_520px] overflow-hidden rounded-[28px] border border-ln bg-s1 p-7 shadow-[0_60px_120px_-50px_var(--sh)] max-sm:p-5"
      aria-label={t('illustration')}
    >
      <div className="flex flex-wrap items-center justify-between gap-3" aria-hidden="true">
        <span className="mono text-xs tracking-[.08em] text-t3">{t('title')}</span>
        <span className="flex gap-4 text-[13px] text-t2">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-[#5b6360]" />
            {t('before')}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-[3px] w-4 bg-lime" />
            {t('after')}
          </span>
        </span>
      </div>
      <svg viewBox="0 0 600 280" aria-hidden="true" className="mt-5 block h-auto w-full overflow-visible">
        <path d="M0 60H600M0 130H600M0 200H600M0 270H600" stroke="#1d2120" strokeWidth="1" />
        <path d="M300 20V270" stroke="#3a403d" strokeDasharray="4 6" />
        <text x="310" y="32" className="mono" style={{ fontSize: 11, fontWeight: 500, fill: 'var(--t3)', letterSpacing: 1 }}>
          {t('launch')}
        </text>
        <path d="M0 240 C 60 236, 120 246, 180 234 S 260 240, 300 232" fill="none" stroke="#5b6360" strokeWidth="2" strokeDasharray="6 6" />
        <path className="reveal" d="M300 232 C 360 214, 400 180, 450 150 S 540 80, 600 56 L600 270 L300 270 Z" fill="#D4FF3A" fillOpacity=".08" />
        <path className="draw-v" pathLength={1000} d="M300 232 C 360 214, 400 180, 450 150 S 540 80, 600 56" fill="none" stroke="#D4FF3A" strokeWidth="3" strokeLinecap="round" />
        <circle className="glow" cx="600" cy="56" r="16" fill="#D4FF3A" fillOpacity=".25" />
        <circle cx="600" cy="56" r="6" fill="#D4FF3A" />
      </svg>
      <div
        className="bob absolute right-12 top-[72px] flex items-center gap-3 rounded-2xl bg-fg px-4 py-3 text-bg shadow-[0_20px_40px_-12px_var(--sh)] max-sm:right-5 max-sm:top-16"
        aria-hidden="true"
      >
        <span className="grid size-9 place-items-center rounded-[10px] bg-lime">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0b0d0c" strokeWidth="2">
            <path d="M4 6h16v12H4zM4 7l8 6 8-6" />
          </svg>
        </span>
        <span>
          <span className="block text-sm font-semibold">{t('toastTitle')}</span>
          <span className="text-xs opacity-70">{t('toastBody')}</span>
        </span>
      </div>
      <div className="mt-6 flex flex-col gap-3 border-t border-ln pt-5" aria-hidden="true">
        {[
          { label: t('search'), width: '82%', color: '#D4FF3A' },
          { label: t('maps'), width: '58%', color: 'var(--fg)' },
          { label: t('ads'), width: '40%', color: '#8F9893' },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-3.5 text-[13px]">
            <span className="w-16 text-t2">{row.label}</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-md bg-s2">
              <span className="bar-v block h-full" style={{ width: row.width, background: row.color }} />
            </span>
          </div>
        ))}
      </div>
    </figure>
  );
}

/* ── Growth tools: estimator, audit, call ───────────────────────────────── */
export async function ToolCards() {
  const t = await getTranslations('home');
  return (
    <section className="cv wrap pb-[clamp(80px,10vw,140px)]">
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr))]">
        <Link
          href="/pricing"
          className="card reveal on-lime relative flex min-h-[340px] flex-col gap-6 overflow-hidden rounded-[28px] border border-lime bg-lime p-8 text-ink"
        >
          <span className="mono text-xs tracking-[.1em]">{t('tool1k')}</span>
          <span className="text-[32px] font-semibold leading-[1.05] tracking-[-0.035em]">{t('tool1')}</span>
          <span aria-hidden="true" className="relative mt-auto block h-1.5 rounded-md bg-[#0b0d0c22]">
            <span className="bar-v absolute inset-y-0 left-[18%] w-[46%] rounded-md bg-ink" />
            <span className="absolute -top-2.5 left-[calc(64%-13px)] size-[26px] rounded-full border-[5px] border-lime bg-ink" />
          </span>
          <span className="inline-flex items-center gap-2.5 font-semibold">{t('tool1c')} →</span>
        </Link>
        <Link
          href="/audit"
          className="card reveal flex min-h-[340px] flex-col gap-6 rounded-[28px] border border-ln bg-s1 p-8 text-fg"
        >
          <span className="mono text-xs tracking-[.1em] text-acct">{t('tool2k')}</span>
          <span className="text-[32px] font-semibold leading-[1.05] tracking-[-0.035em]">{t('tool2')}</span>
          <svg viewBox="0 0 120 64" width="120" height="64" aria-hidden="true" className="mt-auto overflow-visible">
            <path d="M8 60a52 52 0 01104 0" fill="none" stroke="#23272a" strokeWidth="10" strokeLinecap="round" />
            <path className="draw-v" pathLength={1000} d="M8 60a52 52 0 01104 0" fill="none" stroke="#D4FF3A" strokeWidth="10" strokeLinecap="round" />
          </svg>
          <span className="inline-flex items-center gap-2.5 font-semibold">{t('tool2c')} →</span>
        </Link>
        <Link
          href="/book"
          className="card reveal flex min-h-[340px] flex-col gap-6 rounded-[28px] border border-ln bg-s1 p-8 text-fg"
        >
          <span className="mono text-xs tracking-[.1em] text-acct">{t('tool3k')}</span>
          <span className="text-[32px] font-semibold leading-[1.05] tracking-[-0.035em]">{t('tool3')}</span>
          <span aria-hidden="true" className="mt-auto grid max-w-60 grid-cols-7 gap-1.5">
            {[0, 1, 2, 3, 4, 5, 6].map((day) => (
              <span
                key={day}
                className={day === 3 ? 'glow h-[26px] rounded-lg bg-lime' : 'h-[26px] rounded-lg bg-s2'}
                style={day > 4 ? { opacity: 0.4 } : undefined}
              />
            ))}
          </span>
          <span className="inline-flex items-center gap-2.5 font-semibold">{t('tool3c')} →</span>
        </Link>
      </div>
    </section>
  );
}
