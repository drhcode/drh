'use client';

import * as React from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { track, ANALYTICS_EVENTS } from '@/lib/analytics/events';

/**
 * First-party engagement tracking for case studies and service pages
 * (spec §75, §91).
 *
 * These fire our own `/api/events` endpoint, which stores no cookie and no
 * visitor identifier — so the reporting in /admin keeps working regardless of
 * cookie consent or ad blockers.
 */

export function ProjectViewTracker({ projectId, slug }: { projectId: string; slug: string }) {
  React.useEffect(() => {
    track(ANALYTICS_EVENTS.projectViewed, { entity_type: 'project', entity_id: projectId, slug });
  }, [projectId, slug]);

  return null;
}

export function ServiceViewTracker({ serviceId, slug }: { serviceId: string; slug: string }) {
  React.useEffect(() => {
    track(ANALYTICS_EVENTS.serviceViewed, { entity_type: 'service', entity_id: serviceId, slug });
  }, [serviceId, slug]);

  return null;
}

/** "Visit website" on a case study — measures which projects drive curiosity. */
export function OutboundProjectLink({
  href,
  projectId,
  slug,
  label,
}: {
  href: string;
  projectId: string;
  slug: string;
  label: string;
}) {
  return (
    <Button asChild variant="outline" size="sm" className="mt-7">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          track(ANALYTICS_EVENTS.outboundProjectClicked, {
            entity_type: 'project',
            entity_id: projectId,
            slug,
          })
        }
      >
        {label}
        <ExternalLink className="size-3.5" />
      </a>
    </Button>
  );
}

/** The closing CTA on a case study — the conversion signal for that project. */
export function CaseStudyCtaButton({
  projectId,
  slug,
  label,
}: {
  projectId: string;
  slug: string;
  label: string;
}) {
  return (
    <Button asChild size="lg" className="group w-full sm:w-auto">
      <Link
        href="/contact"
        onClick={() =>
          track(ANALYTICS_EVENTS.caseStudyCtaClicked, {
            entity_type: 'project',
            entity_id: projectId,
            slug,
          })
        }
      >
        {label}
        <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
      </Link>
    </Button>
  );
}
