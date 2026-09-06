import type { MetadataRoute } from 'next';
import { publicEnv } from '@/lib/env';

/**
 * robots.txt (spec §68).
 *
 * Blocks the admin area and private API routes while leaving public assets —
 * images, fonts, CSS and JS — fully crawlable, which Google needs in order to
 * render and evaluate the pages.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Only the admin area and non-public endpoints. Assets stay crawlable
        // so Google can render pages properly.
        disallow: ['/admin', '/admin/', '/api/private', '/api/events'],
      },
    ],
    sitemap: `${publicEnv.siteUrl}/sitemap.xml`,
    host: publicEnv.siteUrl,
  };
}
