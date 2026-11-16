import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from '@/components/brand/icons';
import { HeroFx } from '@/components/fx/pointer-fx';

/** Custom 404 (spec §87). */
export default async function NotFound() {
  const t = await getTranslations('notFound');

  return (
    <HeroFx className="grid-bg border-b border-ln">
      <div className="wrap relative flex min-h-[70vh] flex-col justify-center py-20">
        <p className="mono rise text-sm text-acct">{t('code')}</p>
        <h1 className="rise-t d1 mt-5 max-w-[900px] text-[clamp(44px,6.6vw,104px)] font-semibold leading-[.95] tracking-[-0.05em]">
          {t('title')}
        </h1>
        <p className="lead rise-t d2 mt-6 max-w-[560px]">{t('body')}</p>
        <div className="rise d3 mt-10 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-p btn-lg">
            {t('home')}
            <ArrowRight />
          </Link>
          <Link href="/work" className="btn btn-g btn-lg">
            {t('work')}
          </Link>
          <Link href="/contact" className="btn btn-g btn-lg">
            {t('contact')}
          </Link>
        </div>
      </div>
    </HeroFx>
  );
}
