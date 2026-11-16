'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { PRICING, estimate, formatEuro, type FeatureId, type ProjectTypeId } from '@/config/pricing';
import { cn } from '@/lib/utils';

/**
 * Project estimator (/pricing). All numbers come from src/config/pricing.ts;
 * this component only collects choices and presents `estimate()`.
 * The CTA carries the choices into the contact form as a pre-filled brief.
 */
export function Estimator() {
  const t = useTranslations('pricing');
  const d = PRICING.defaults;
  const [type, setType] = React.useState<ProjectTypeId>(d.type);
  const [pages, setPages] = React.useState<number>(d.pages);
  const [langs, setLangs] = React.useState<string[]>([...d.languages]);
  const [feats, setFeats] = React.useState<FeatureId[]>([...d.features]);
  const [fast, setFast] = React.useState<boolean>(d.fastTrack);

  const result = estimate({ type, pages, languages: langs, features: feats, fastTrack: fast });
  const max = PRICING.scope.maxPages;
  const pagesLabel = pages >= max ? `${max}+` : String(pages);
  const priceText = result.high
    ? `${formatEuro(result.low)}–${formatEuro(result.high).slice(1)}`
    : t('from', { price: formatEuro(result.low) });

  const summary = [
    { k: t('summary.project'), v: t(`types.${type}`) },
    { k: t('summary.pages'), v: pagesLabel },
    { k: t('summary.languages'), v: langs.join(' · ') },
    { k: t('summary.features'), v: feats.length ? t('summary.featureCount', { count: feats.length }) : t('summary.none') },
    { k: t('summary.timeline'), v: fast ? t('fast') : t('standard') },
  ];

  const brief = [
    `${t('briefIntro')}:`,
    `• ${t('summary.project')}: ${t(`types.${type}`)}`,
    `• ${t('summary.pages')}: ${pagesLabel}`,
    `• ${t('summary.languages')}: ${langs.join(', ')}`,
    `• ${t('summary.features')}: ${feats.length ? feats.map((id) => t(`features.${id}`)).join(', ') : t('summary.none')}`,
    `• ${t('summary.timeline')}: ${fast ? t('fast') : t('standard')}`,
    `• ${t('briefRange')}: ${priceText}`,
  ].join('\n');

  const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  return (
    <div className="flex flex-wrap items-start gap-10">
      <div className="flex min-w-0 flex-[1.6_1_560px] flex-col gap-14">
        <Group title={t('step1')}>
          <div role="radiogroup" aria-label={t('step1')} className="mt-[18px] grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr))]">
            {PRICING.projectTypes.map((option) => (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={type === option.id}
                onClick={() => setType(option.id)}
                className="chip flex min-h-40 flex-col gap-3.5 rounded-[20px] border border-ln bg-s1 p-[22px] text-left text-fg"
              >
                <svg width="36" height="36" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={option.icon} />
                </svg>
                <span className="mt-auto text-lg font-semibold tracking-[-0.01em]">{t(`types.${option.id}`)}</span>
                <span className="mono text-xs opacity-75">
                  {option.max ? `${formatEuro(option.min)}–${formatEuro(option.max).slice(1)}` : t('from', { price: formatEuro(option.min) })}
                </span>
              </button>
            ))}
          </div>
        </Group>

        <Group title={t('step2')}>
          <div className="mt-[18px] flex items-baseline justify-between">
            <label htmlFor="est-pages" className="text-[17px] text-t1">
              {t('pagesLabel')}
            </label>
            <output htmlFor="est-pages" className="text-5xl font-semibold tracking-[-0.05em]">
              {pagesLabel}
            </output>
          </div>
          <input
            id="est-pages"
            className="rng mt-4"
            type="range"
            min={PRICING.scope.minPages}
            max={max}
            value={pages}
            onChange={(event) => setPages(Number(event.target.value))}
            aria-valuetext={pagesLabel}
          />
          <div className="mono mt-3 flex justify-between text-xs text-t3" aria-hidden="true">
            <span>1</span>
            <span>10</span>
            <span>20</span>
            <span>30</span>
            <span>{max}+</span>
          </div>
        </Group>

        <Group title={t('step3')}>
          <div role="group" aria-label={t('step3')} className="mt-[18px] flex flex-wrap gap-2.5">
            {PRICING.languages.map((lang) => (
              <button
                key={lang}
                type="button"
                aria-pressed={langs.includes(lang)}
                onClick={() => {
                  const next = toggle(langs, lang);
                  setLangs(next.length ? next : [lang]);
                }}
                className="chip h-[52px] min-w-[72px] rounded-full border border-ln bg-s1 px-[22px] text-[15px] font-semibold text-fg"
              >
                {lang}
              </button>
            ))}
          </div>
        </Group>

        <Group title={t('step4')}>
          <div role="group" aria-label={t('step4')} className="mt-[18px] grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr))]">
            {PRICING.features.map(({ id }) => {
              const on = feats.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => setFeats(toggle(feats, id))}
                  className={cn(
                    'flex h-[60px] items-center gap-3.5 rounded-2xl border bg-s1 px-[18px] text-left text-base font-medium text-fg transition-[border-color,transform] duration-250 hover:-translate-y-0.5',
                    on ? 'border-lime' : 'border-ln hover:border-acct',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn('grid size-6 flex-none place-items-center rounded-[7px] border-[1.5px] text-ink', on ? 'border-lime bg-lime' : 'border-ln2 bg-transparent')}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ opacity: on ? 1 : 0 }}>
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  </span>
                  {t(`features.${id}`)}
                </button>
              );
            })}
          </div>
        </Group>

        <Group title={t('step5')}>
          <div role="radiogroup" aria-label={t('step5')} className="mt-[18px] flex flex-wrap gap-2.5">
            {[
              { label: t('standard'), value: false },
              { label: t('fast'), value: true },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                role="radio"
                aria-checked={fast === option.value}
                onClick={() => setFast(option.value)}
                className="chip h-14 rounded-full border border-ln bg-s1 px-6 text-[15px] font-semibold text-fg"
              >
                {option.label}
              </button>
            ))}
          </div>
        </Group>
      </div>

      <aside className="sticky top-28 min-w-0 flex-[1_1_360px]" aria-labelledby="estimate-heading">
        <div className="on-lime relative overflow-hidden rounded-[32px] bg-lime p-9 text-ink shadow-[0_40px_80px_-40px_#000] max-sm:p-7">
          <svg aria-hidden="true" viewBox="0 0 300 300" className="pointer-events-none absolute -right-[120px] -top-[120px] size-[300px]">
            <circle className="flow" cx="150" cy="150" r="140" fill="none" stroke="#0b0d0c" strokeOpacity=".3" strokeWidth="1.5" />
            <circle className="drawloop" pathLength={1000} cx="150" cy="150" r="100" fill="none" stroke="#0b0d0c" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <h2 id="estimate-heading" className="mono m-0 text-xs font-normal tracking-[.1em]">
            {t('estimateLabel')}
          </h2>
          <p aria-live="polite" aria-atomic="true" className="m-0">
            <span className="mt-5 block text-[clamp(44px,4.6vw,64px)] font-bold leading-none tracking-[-0.05em]">{priceText}</span>
            <span className="mt-2 block text-[15px] text-lime-ink">{result.high ? t('typicalRange') : t('specNote')}</span>
          </p>
          <div aria-hidden="true" className="relative mt-6 h-2 rounded-lg bg-[#0b0d0c1f]">
            <div
              className="absolute inset-y-0 rounded-lg bg-ink transition-[left,width] duration-600 ease-[cubic-bezier(.2,.7,.2,1)]"
              style={{ left: `${result.bar.left}%`, width: `${result.bar.width}%` }}
            />
          </div>
          <div className="mono mt-2 flex justify-between text-[11px] text-lime-ink" aria-hidden="true">
            <span>€0</span>
            <span>{formatEuro(PRICING.scaleMax / 2)}</span>
            <span>{formatEuro(PRICING.scaleMax)}+</span>
          </div>
          <dl className="mt-7 border-t border-[#0b0d0c26]">
            {summary.map((row) => (
              <div key={row.k} className="flex justify-between gap-4 border-b border-[#0b0d0c26] py-3 text-[15px]">
                <dt className="text-lime-ink">{row.k}</dt>
                <dd className="text-right font-semibold">{row.v}</dd>
              </div>
            ))}
          </dl>
          <Link
            href={{ pathname: '/contact', query: { service: result.service, budget: result.budget, brief } }}
            className="btn btn-ink mt-7 h-[60px] w-full text-[17px]"
          >
            {t('cta')} →
          </Link>
          <Link href="/book" className="btn btn-ink-g mt-2.5 h-14 w-full">
            {t('call')}
          </Link>
          <p className="mt-4 text-[13px] leading-normal text-lime-ink">{t('disclaimer')}</p>
        </div>
      </aside>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mono m-0 text-xs font-normal tracking-[.1em] text-acct">{title}</h2>
      {children}
    </section>
  );
}
