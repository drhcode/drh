import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ArrowRight, ArrowUpRight, Check } from '@/components/brand/icons';
import { HeroFx, Magnetic, Tilt } from '@/components/fx/pointer-fx';

/** Home hero: orbit system with parallax, staggered headline, performance card. */
export async function HomeHero() {
  const t = await getTranslations('home');

  const budget = [
    { label: 'LCP', value: '< 2.5s', width: '82%', delay: 'd3' },
    { label: 'INP', value: '< 200ms', width: '90%', delay: 'd5' },
    { label: 'CLS', value: '< 0.1', width: '94%', delay: 'd7' },
  ];

  return (
    <HeroFx className="grid-bg grain border-b border-ln">
      <Orbits labels={t.raw('orbit') as Record<string, string>} />

      <div className="wrap relative pb-[72px] pt-[clamp(64px,9vw,128px)]">
        <p className="rise inline-flex items-center gap-2.5 rounded-full border border-ln2 bg-s1 py-2 pl-3 pr-4 text-sm text-t1">
          <span className="pulse-dot size-2 rounded-full bg-lime" aria-hidden="true" />
          {t('badge')}
        </p>

        <h1 className="mt-8 max-w-[1100px] text-[clamp(40px,7.4vw,118px)] font-semibold leading-[.95] tracking-[-0.045em]">
          <span className="rise-t d1 block">{t('heroLine1')}</span>
          <span className="rise-t d2 block">{t('heroLine2')}</span>
          <span className="rise-t d3 block">
            {t('heroLine3')}{' '}
            <span className="relative inline-block">
              <em className="it text-[1.08em]">{t('heroAccent')}</em>
              <svg
                aria-hidden="true"
                viewBox="0 0 300 30"
                preserveAspectRatio="none"
                className="absolute bottom-[-0.1em] left-0 h-[.28em] w-full overflow-visible"
              >
                <path
                  className="draw"
                  pathLength={1000}
                  d="M4 20 C 60 4, 120 30, 180 14 S 280 6, 296 16"
                  fill="none"
                  stroke="#D4FF3A"
                  strokeWidth="5"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  style={{ animationDelay: '1.1s' }}
                />
              </svg>
            </span>
            <span className="text-acct">.</span>
          </span>
        </h1>

        <div className="mt-12 flex flex-wrap items-end justify-between gap-12">
          <div className="max-w-[560px] flex-[1_1_420px]">
            <p className="rise-t d4 text-[clamp(17px,1.4vw,20px)] leading-relaxed text-t2">{t('sub')}</p>
            <div className="rise d5 mt-8 flex flex-wrap gap-3">
              <Magnetic>
                <Link href="/contact" className="btn btn-p btn-lg shine">
                  {t('cta1')}
                  <ArrowRight />
                </Link>
              </Magnetic>
              <Magnetic>
                <Link href="/work" className="btn btn-g btn-lg">
                  {t('cta2')}
                </Link>
              </Magnetic>
            </div>
            <ul className="rise d6 mt-7 flex flex-wrap gap-5 text-sm text-t3">
              {[t('trust1'), t('trust2'), t('trust3')].map((item) => (
                <li key={item} className="inline-flex items-center gap-2">
                  <Check size={16} stroke="#D4FF3A" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <Tilt className="min-w-[min(300px,100%)] flex-[0_1_400px]">
            <div className="rise d6 drift relative rounded-3xl border border-ln bg-s1 p-6 shadow-[0_40px_80px_-30px_var(--sh)]">
              <Link
                href="/contact"
                aria-label={t('badgeLabel')}
                className="dock hide-sm absolute -left-[84px] -top-[84px] z-[2] grid size-[132px] place-items-center rounded-full border border-ln2 bg-bg"
              >
                <svg className="orbit absolute inset-0" style={{ animationDuration: '16s' }} viewBox="0 0 132 132" width="132" height="132" aria-hidden="true">
                  <defs>
                    <path id="badge-home" d="M66 66m-48 0a48 48 0 1 1 96 0a48 48 0 1 1 -96 0" />
                  </defs>
                  <text className="mono" style={{ fontSize: 11, fontWeight: 600, letterSpacing: '2.2px', fill: 'var(--fg)' }}>
                    <textPath href="#badge-home">{t('badgeText')}</textPath>
                  </text>
                </svg>
                <span className="grid size-12 place-items-center rounded-full bg-lime text-ink">
                  <ArrowUpRight size={20} />
                </span>
              </Link>

              <div className="flex items-center justify-between">
                <span className="mono text-xs tracking-[.08em] text-t3">{t('perfTitle')}</span>
                <span className="mono inline-flex items-center gap-1.5 text-xs text-acct">
                  <span className="pulse-dot size-1.5 rounded-full bg-lime" aria-hidden="true" />
                  {t('perfStatus')}
                </span>
              </div>
              <ul className="mt-6 flex flex-col gap-[18px]">
                {budget.map((row) => (
                  <li key={row.label}>
                    <div className="flex justify-between text-sm">
                      <span>{row.label}</span>
                      <span className="mono text-t2">{row.value}</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-md bg-s2" aria-hidden="true">
                      <div className={`bar ${row.delay} h-full rounded-md bg-lime`} style={{ width: row.width }} />
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-[22px] border-t border-ln pt-[18px] text-[13px] text-t3">{t('perfNote')}</p>
            </div>
          </Tilt>
        </div>
      </div>
    </HeroFx>
  );
}

function Orbits({ labels }: { labels: Record<string, string> }) {
  const chip =
    'counter inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-ln2 bg-s1 px-4 py-2.5 text-sm font-medium text-fg shadow-[0_10px_30px_-10px_var(--sh)]';
  return (
    <div
      className="hide-sm par pointer-events-none absolute -right-[170px] top-2.5 size-[760px]"
      aria-hidden="true"
      style={{ transform: 'translate(calc(var(--px, 0) * -70px), calc(var(--py, 0) * -70px))' }}
    >
      <svg viewBox="0 0 760 760" width="760" height="760" className="absolute inset-0 overflow-visible">
        <path d="M380 0V760M0 380H760" stroke="#ffffff0d" strokeWidth="1" />
        <circle cx="380" cy="380" r="370" fill="none" stroke="#1f2422" strokeWidth="1" />
        <circle className="flow" cx="380" cy="380" r="300" fill="none" stroke="#2f3532" strokeWidth="1.5" />
        <circle className="drawloop" pathLength={1000} cx="380" cy="380" r="300" fill="none" stroke="#D4FF3A" strokeWidth="2" strokeLinecap="round" transform="rotate(-90 380 380)" />
        <circle cx="380" cy="380" r="210" fill="none" stroke="#262b29" strokeWidth="1" />
        <circle className="drawloop" pathLength={1000} cx="380" cy="380" r="210" fill="none" stroke="#F2F4F0" strokeOpacity=".5" strokeWidth="1.5" strokeLinecap="round" transform="rotate(90 380 380)" style={{ animationDelay: '-3s', animationDuration: '9s' }} />
        <circle className="flow" cx="380" cy="380" r="120" fill="none" stroke="#D4FF3A" strokeOpacity=".4" strokeWidth="1" />
        <g className="glow">
          <circle cx="380" cy="380" r="64" fill="#D4FF3A" fillOpacity=".07" />
          <circle cx="380" cy="380" r="38" fill="#D4FF3A" fillOpacity=".14" />
        </g>
        <circle cx="380" cy="380" r="9" fill="#D4FF3A" />
      </svg>
      <div className="orbit absolute inset-20" style={{ animationDuration: '60s' }}>
        {[
          { key: 'nextjs', left: '50%', top: '0%' },
          { key: 'agents', left: '93.3%', top: '75%' },
          { key: 'seo', left: '6.7%', top: '75%' },
        ].map((item) => (
          <div key={item.key} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: item.left, top: item.top }}>
            <div className={chip} style={{ animationDuration: '60s' }}>
              <span className="glow size-2 rounded-full bg-lime" />
              {labels[item.key]}
            </div>
          </div>
        ))}
      </div>
      <div className="orbit absolute inset-[170px]" style={{ animationDuration: '45s', animationDirection: 'reverse' }}>
        <div className="absolute left-full top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="counter whitespace-nowrap rounded-full bg-lime px-3.5 py-2 text-[13px] font-semibold text-ink" style={{ animationDuration: '45s', animationDirection: 'reverse' }}>
            {labels.mobile}
          </div>
        </div>
        <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="counter whitespace-nowrap rounded-full bg-fg px-3.5 py-2 text-[13px] font-semibold text-bg" style={{ animationDuration: '45s', animationDirection: 'reverse' }}>
            {labels.ecommerce}
          </div>
        </div>
      </div>
    </div>
  );
}
