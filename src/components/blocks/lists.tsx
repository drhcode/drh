import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from '@/components/brand/icons';
import type { BlogPostView, FaqView, IndustryView } from '@/lib/data';
import { cn, formatDate } from '@/lib/utils';

/* ── Industries: numbered rows ─────────────────────────────────────────── */
export function IndustryRows({ industries }: { industries: IndustryView[] }) {
  return (
    <ul className="mt-14 border-t border-ln">
      {industries.map((industry, index) => (
        <li key={industry.slug}>
          <Link
            href={`/industries/${industry.slug}`}
            className="row card card-flat flex items-center gap-6 border-b border-ln py-6 text-fg"
          >
            <span className="mono min-w-8 text-[13px] text-t3">{String(index + 1).padStart(2, '0')}</span>
            <span className="flex-1 text-[clamp(24px,3vw,40px)] font-medium tracking-[-0.03em]">{industry.title}</span>
            {industry.heroSubtitle && (
              <span className="hide-sm max-w-[420px] flex-1 text-[15px] text-t3">{industry.heroSubtitle}</span>
            )}
            <span className="arrow-dot size-11 border border-ln2">
              <ArrowRight />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ── Process: four numbered steps on a self-drawing wave ───────────────── */
export function ProcessSteps({ steps }: { steps: { title: string; body: string }[] }) {
  const wave = 'M0 30 C 120 0, 200 60, 333 30 S 560 0, 666 30 S 880 60, 1000 30';
  return (
    <div className="relative mt-[72px]">
      <svg
        className="hide-sm absolute inset-x-0 -top-0.5 h-[60px] w-full overflow-visible"
        viewBox="0 0 1000 60"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={wave} fill="none" stroke="#23272a" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        <path className="draw-v" pathLength={1000} d={wave} fill="none" stroke="#D4FF3A" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      <ol className="relative grid gap-8 [grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr))]">
        {steps.map((step, index) => (
          <li key={step.title} className="reveal">
            <span
              aria-hidden="true"
              className="grid size-14 place-items-center rounded-full border-2 border-acct bg-bg font-semibold text-acct"
            >
              {index + 1}
            </span>
            <h3 className="m-0 mt-7 text-2xl font-semibold tracking-[-0.02em]">{step.title}</h3>
            <p className="mt-2.5 text-[15px] leading-relaxed text-t3">{step.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ── Why: numbered list beside a sticky heading ────────────────────────── */
export function WhyList({ items }: { items: { title: string; body: string }[] }) {
  return (
    <ol className="min-w-0 flex-[1_1_520px] border-t border-ln2">
      {items.map((item, index) => (
        <li key={item.title} className="reveal flex gap-6 border-b border-ln2 py-8">
          <span className="mono min-w-8 pt-1.5 text-[13px] text-t2">{String(index + 1).padStart(2, '0')}</span>
          <div>
            <h3 className="m-0 text-[26px] font-semibold tracking-[-0.02em]">{item.title}</h3>
            <p className="mt-2 text-base leading-relaxed text-t2">{item.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** The idea → results gauge beside the "why" list. Decorative. */
export function WhyGauge({ idea, results }: { idea: string; results: string }) {
  return (
    <div className="hide-sm relative mt-14 h-[190px] w-80" aria-hidden="true">
      <svg viewBox="0 0 320 180" width="320" height="180" className="absolute left-0 top-0 overflow-visible">
        <path d="M20 170 A140 140 0 0 1 300 170" fill="none" stroke="#c9cfcb" strokeWidth="14" strokeLinecap="round" />
        <path className="draw-v" pathLength={1000} d="M20 170 A140 140 0 0 1 300 170" fill="none" stroke="#0b0d0c" strokeWidth="14" strokeLinecap="round" />
        <path d="M160 6v14M44 54l10 10M276 54l-10 10M4 170h14M302 170h14" stroke="#4b524e" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div className="sweep absolute left-[158px] top-[50px] h-[120px] w-1 rounded bg-fg" />
      <div className="absolute left-[146px] top-[156px] size-7 rounded-full border-4 border-fg bg-lime" />
      <span className="mono absolute left-0 top-48 text-[11px] tracking-[.1em] text-t2">{idea}</span>
      <span className="mono absolute right-0 top-48 text-[11px] tracking-[.1em] text-t2">{results}</span>
    </div>
  );
}

/* ── Journal cards ─────────────────────────────────────────────────────── */
/** Card fields only — article HTML never reaches client components. */
export type PostCardData = Pick<
  BlogPostView,
  'slug' | 'title' | 'excerpt' | 'featuredImage' | 'category' | 'publishedAt' | 'readingTime'
> & {
  /**
   * Date already formatted on the server. Node and the browser ship different
   * ICU data (Albanian month names differ), so formatting in a client
   * component would cause a hydration mismatch.
   */
  dateLabel?: string;
};

export function toPostCard(post: BlogPostView, locale?: string): PostCardData {
  return {
    dateLabel: locale ? formatDate(post.publishedAt, locale, { day: 'numeric', month: 'short', year: 'numeric' }) : undefined,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    featuredImage: post.featuredImage,
    category: post.category,
    publishedAt: post.publishedAt,
    readingTime: post.readingTime,
  };
}

const PLATES = [
  { bg: '#D4FF3A', fg: '#0b0d0c' },
  { bg: 'var(--s2)', fg: 'var(--acct)' },
  { bg: 'var(--fg)', fg: 'var(--bg)' },
];

export function PostMeta({ post, locale, minLabel }: { post: PostCardData; locale: string; minLabel: string }) {
  return (
    <p className="mono text-xs uppercase text-t3">
      {[post.category?.title, post.dateLabel ?? formatDate(post.publishedAt, locale, { day: 'numeric', month: 'short', year: 'numeric' }), minLabel]
        .filter(Boolean)
        .join(' · ')}
    </p>
  );
}

export function PostCard({
  post,
  index,
  locale,
  minLabel,
  className,
  headingLevel: Heading = 'h3',
}: {
  post: PostCardData;
  index: number;
  locale: string;
  minLabel: string;
  className?: string;
  headingLevel?: 'h2' | 'h3';
}) {
  const plate = PLATES[index % PLATES.length];
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn('card reveal flex flex-col overflow-hidden rounded-[26px] border border-ln bg-s1 text-fg', className)}
    >
      <div className="relative h-[230px] overflow-hidden" style={{ background: plate.bg }}>
        {post.featuredImage ? (
          <Image src={post.featuredImage} alt="" fill sizes="(max-width: 860px) 100vw, 420px" className="zoom object-cover" />
        ) : (
          <div className="zoom absolute inset-0 grid place-items-center">
            <span className="text-8xl font-bold tracking-[-0.06em]" style={{ color: plate.fg }} aria-hidden="true">
              {post.title.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-7">
        <PostMeta post={post} locale={locale} minLabel={minLabel} />
        <Heading className="m-0 text-[22px] font-semibold leading-[1.25] tracking-[-0.02em]">{post.title}</Heading>
        {post.excerpt && <p className="text-[15px] leading-[1.55] text-t3">{post.excerpt}</p>}
      </div>
    </Link>
  );
}

/* ── FAQ: native details/summary, first one open ───────────────────────── */
export function FaqList({ faqs, className }: { faqs: FaqView[]; className?: string }) {
  if (faqs.length === 0) return null;
  return (
    <div className={cn('min-w-0 border-t border-ln', className)}>
      {faqs.map((faq, index) => (
        <details key={faq.id} open={index === 0} className="border-b border-ln">
          <summary className="flex items-center justify-between gap-6 py-[26px] text-xl font-medium max-sm:text-lg">
            {faq.question}
            <span
              aria-hidden="true"
              className="plus grid size-10 flex-none place-items-center rounded-full border border-ln2 text-[22px]"
            >
              +
            </span>
          </summary>
          <div
            className="pb-7 pr-16 text-base leading-[1.65] text-t2 max-sm:pr-0"
            // FAQ answers are plain text in the CMS; keep paragraph breaks.
            style={{ whiteSpace: 'pre-line' }}
          >
            {faq.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
