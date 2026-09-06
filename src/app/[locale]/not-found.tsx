import { getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

/** Custom 404 (spec §87). */
export default async function NotFound() {
  const t = await getTranslations('notFound');

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid-lines opacity-[0.35] dark:opacity-[0.2]"
      />

      <div className="container-page relative flex min-h-[70vh] flex-col justify-center py-20">
        <div className="max-w-2xl">
          <p className="font-mono text-sm font-medium text-accent">{t('code')}</p>

          <h1 className="mt-5 text-balance text-4xl leading-[1.1] md:text-5xl lg:text-[3.5rem]">
            {t('title')}
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {t('body')}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="group">
              <Link href="/">
                {t('home')}
                <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/work">{t('work')}</Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link href="/contact">{t('contact')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
