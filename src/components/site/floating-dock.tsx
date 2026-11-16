import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Chat } from '@/components/brand/icons';
import { TrackedLink } from './tracked-link';

/** WhatsApp + "Book a free call", fixed bottom-right on every page. */
export async function FloatingDock({ whatsapp }: { whatsapp: string }) {
  const t = await getTranslations('footer');

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 max-[480px]:bottom-4 max-[480px]:right-4">
      <TrackedLink
        href={`https://wa.me/${whatsapp}`}
        event="whatsapp"
        external
        aria-label={t('whatsappLabel')}
        className="dock grid size-14 place-items-center rounded-full border border-ln2 bg-s1 text-fg shadow-[0_20px_40px_-12px_var(--sh)]"
      >
        <Chat />
      </TrackedLink>
      <Link
        href="/book"
        className="dock shine on-lime inline-flex h-14 items-center gap-2.5 rounded-full bg-lime pl-[18px] pr-[22px] text-[15px] font-semibold text-ink shadow-[0_20px_40px_-12px_var(--sh)]"
      >
        <span className="glow size-2 rounded-full bg-ink" aria-hidden="true" />
        {t('dock')}
      </Link>
    </div>
  );
}
