import type { AdminResource } from '@/lib/auth/permissions';

/**
 * Admin sidebar structure (spec §43).
 *
 * Every item names the resource it needs, so the sidebar is filtered by the
 * same matrix the server uses to authorize the route. The filtering is a
 * convenience — the route itself re-checks.
 */

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  resource: AdminResource;
  /** Matches child routes too (e.g. /admin/leads/abc). */
  exact?: boolean;
}

export interface NavGroup {
  label: string | null;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [
      { label: 'Dashboard', href: '/admin', icon: 'gauge', resource: 'dashboard', exact: true },
      { label: 'Analytics', href: '/admin/analytics', icon: 'bar-chart', resource: 'analytics' },
      { label: 'Leads', href: '/admin/leads', icon: 'inbox', resource: 'leads' },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Projects', href: '/admin/projects', icon: 'briefcase', resource: 'projects' },
      { label: 'Blog', href: '/admin/blog', icon: 'file-text', resource: 'blog' },
      { label: 'Services', href: '/admin/services', icon: 'layers', resource: 'services' },
      { label: 'Industries', href: '/admin/industries', icon: 'building', resource: 'industries' },
      { label: 'Testimonials', href: '/admin/testimonials', icon: 'quote', resource: 'testimonials' },
      { label: 'FAQs', href: '/admin/faqs', icon: 'help-circle', resource: 'faqs' },
      { label: 'Pages', href: '/admin/pages', icon: 'layout', resource: 'pages' },
      { label: 'Media Library', href: '/admin/media', icon: 'image', resource: 'media' },
    ],
  },
  {
    label: 'Growth',
    items: [
      { label: 'Newsletter', href: '/admin/newsletter', icon: 'mail', resource: 'newsletter' },
      { label: 'SEO', href: '/admin/seo', icon: 'search', resource: 'seo' },
      { label: 'Redirects', href: '/admin/redirects', icon: 'shuffle', resource: 'redirects' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Users', href: '/admin/users', icon: 'users', resource: 'users' },
      { label: 'Integrations', href: '/admin/integrations', icon: 'plug', resource: 'integrations' },
      { label: 'Settings', href: '/admin/settings', icon: 'settings', resource: 'settings' },
      { label: 'Activity Log', href: '/admin/activity', icon: 'history', resource: 'activity' },
    ],
  },
];

/** Quick actions offered by the ⌘K palette (spec §72). */
export const QUICK_COMMANDS: {
  label: string;
  href: string;
  icon: string;
  resource: AdminResource;
  capability?: 'view' | 'manage';
}[] = [
  { label: 'Create project', href: '/admin/projects/new', icon: 'plus', resource: 'projects', capability: 'manage' },
  { label: 'Create blog post', href: '/admin/blog/new', icon: 'plus', resource: 'blog', capability: 'manage' },
  { label: 'Add testimonial', href: '/admin/testimonials/new', icon: 'plus', resource: 'testimonials', capability: 'manage' },
  { label: 'Add redirect', href: '/admin/redirects', icon: 'plus', resource: 'redirects', capability: 'manage' },
  { label: 'Open analytics', href: '/admin/analytics', icon: 'bar-chart', resource: 'analytics' },
  { label: 'Open leads', href: '/admin/leads', icon: 'inbox', resource: 'leads' },
  { label: 'Open SEO', href: '/admin/seo', icon: 'search', resource: 'seo' },
  { label: 'Open settings', href: '/admin/settings', icon: 'settings', resource: 'settings' },
];
