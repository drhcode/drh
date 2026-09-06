import type { UserRole } from '@/types/database';

/**
 * Role → capability matrix (spec §42).
 *
 * This is the single source of truth. It is consulted on the server before
 * every mutation and before rendering any admin route — hiding a nav item is
 * never the security boundary, it is only the courtesy.
 */

export const ADMIN_RESOURCES = [
  'dashboard',
  'analytics',
  'leads',
  'projects',
  'blog',
  'services',
  'industries',
  'testimonials',
  'faqs',
  'media',
  'pages',
  'newsletter',
  'seo',
  'redirects',
  'users',
  'integrations',
  'settings',
  'activity',
] as const;

export type AdminResource = (typeof ADMIN_RESOURCES)[number];
export type Capability = 'view' | 'manage';

const MATRIX: Record<UserRole, Partial<Record<AdminResource, Capability>>> = {
  super_admin: Object.fromEntries(
    ADMIN_RESOURCES.map((resource) => [resource, 'manage' as Capability]),
  ),

  admin: {
    dashboard: 'manage',
    analytics: 'manage',
    leads: 'manage',
    projects: 'manage',
    blog: 'manage',
    services: 'manage',
    industries: 'manage',
    testimonials: 'manage',
    faqs: 'manage',
    media: 'manage',
    pages: 'manage',
    newsletter: 'manage',
    seo: 'manage',
    redirects: 'manage',
    integrations: 'manage',
    settings: 'manage',
    activity: 'view',
    users: 'view',
  },

  editor: {
    dashboard: 'view',
    projects: 'manage',
    blog: 'manage',
    pages: 'manage',
    media: 'manage',
    services: 'view',
    industries: 'view',
    testimonials: 'view',
    faqs: 'view',
    seo: 'view',
  },

  marketing: {
    dashboard: 'view',
    analytics: 'manage',
    leads: 'manage',
    seo: 'manage',
    integrations: 'manage',
    redirects: 'manage',
    newsletter: 'manage',
    media: 'view',
    blog: 'view',
    projects: 'view',
    activity: 'view',
  },
};

export function can(
  role: UserRole | null | undefined,
  resource: AdminResource,
  capability: Capability = 'view',
): boolean {
  if (!role) return false;
  const granted = MATRIX[role]?.[resource];
  if (!granted) return false;
  return capability === 'view' ? true : granted === 'manage';
}

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  editor: 'Editor',
  marketing: 'Marketing',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  super_admin: 'Full access, including team management and site settings.',
  admin: 'Manages content, projects, leads, blog and services.',
  editor: 'Creates and edits pages, projects and blog articles.',
  marketing: 'Works with analytics, leads, SEO and integrations.',
};
