'use client';

import * as React from 'react';
import { LinkedIn } from '@/components/brand/icons';

/** "Copy link" + LinkedIn share for an article. */
export function ShareButtons({ url, labels }: { url: string; labels: { copy: string; copied: string; linkedin: string } }) {
  const [copied, setCopied] = React.useState(false);

  return (
    <div className="flex gap-2">
      <button
        type="button"
        className="btn h-11 border border-ln2 bg-transparent px-[18px] text-sm font-medium text-fg hover:border-acct"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2400);
          } catch {
            // Clipboard blocked — nothing to report beyond not changing the label.
          }
        }}
      >
        <span aria-live="polite">{copied ? labels.copied : labels.copy}</span>
      </button>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={labels.linkedin}
        className="btn grid size-11 place-items-center border border-ln2 p-0 text-fg hover:border-acct"
      >
        <LinkedIn size={16} />
      </a>
    </div>
  );
}
