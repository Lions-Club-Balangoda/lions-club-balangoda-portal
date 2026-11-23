import type { UserRole, Resource } from '../types/rbac';

export interface AdminNavItem {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly description: string;
  readonly resource?: Resource;
  readonly requiredRole?: UserRole;
  readonly icon: 'dashboard' | 'projects' | 'news' | 'board' | 'media' | 'submissions' | 'users';
}

/**
 * Standard Admin Navigation items mapped to modules and RBAC requirements.
 * Story: LBW-43 (AC1: Links to Projects, News/Announcements, Board, Media, Submissions, User Accounts)
 */
export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/admin',
    description: 'Operational summary and quick module shortcuts',
    icon: 'dashboard',
  },
  {
    id: 'projects',
    label: 'Projects',
    href: '/admin/projects',
    description: 'Manage community service projects, drafts, and galleries',
    resource: 'PROJECTS',
    icon: 'projects',
  },
  {
    id: 'news',
    label: 'News & Announcements',
    href: '/admin/news',
    description: 'Publish club updates, press releases, and announcements',
    resource: 'NEWS',
    icon: 'news',
  },
  {
    id: 'board',
    label: 'Executive Board',
    href: '/admin/board',
    description: 'Directory of club officers and board appointments',
    resource: 'BOARD',
    icon: 'board',
  },
  {
    id: 'media',
    label: 'Media Assets',
    href: '/admin/media',
    description: 'Uploaded photo assets and activity image library',
    resource: 'MEDIA',
    icon: 'media',
  },
  {
    id: 'submissions',
    label: 'Submissions & Inquiries',
    href: '/admin/submissions',
    description: 'Review volunteer applications and community messages',
    resource: 'VOLUNTEERS',
    icon: 'submissions',
  },
  {
    id: 'users',
    label: 'User Accounts',
    href: '/admin/users',
    description: 'Officer accounts, password resets, and role assignments',
    resource: 'USERS',
    requiredRole: 'ADMIN',
    icon: 'users',
  },
] as const;

/**
 * Filters the admin navigation items based on the officer's role.
 * - ADMIN: Returns all navigation items including User Accounts.
 * - EDITOR: Returns all content items; excludes User Accounts.
 * - Unauthenticated / null: Returns empty array.
 */
export function getPermittedAdminNavItems(role?: UserRole | null): AdminNavItem[] {
  if (!role) return [];
  return ADMIN_NAV_ITEMS.filter((item) => {
    if (item.requiredRole && item.requiredRole !== role) {
      return false;
    }
    return true;
  });
}

/**
 * Checks whether an admin navigation link is active given the current pathname.
 */
export function isAdminRouteActive(currentPath: string, href: string): boolean {
  if (!currentPath || !href) return false;
  if (href === '/admin') {
    return currentPath === '/admin' || currentPath === '/admin/';
  }
  return currentPath.startsWith(href);
}

