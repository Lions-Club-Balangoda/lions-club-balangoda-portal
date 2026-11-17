export interface NavItem {
  label: string;
  href: string;
  description?: string;
}

export interface ClubContactInfo {
  clubName: string;
  district: string;
  motto: string;
  email: string;
  address: string;
  city: string;
  country: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Projects', href: '/projects' },
  { label: 'News', href: '/news' },
  { label: 'Board', href: '/board' },
  { label: 'Volunteer', href: '/volunteer' },
  { label: 'Contact', href: '/contact' },
] as const;

export const CLUB_CONTACT_INFO: ClubContactInfo = {
  clubName: 'Lions Club of Balangoda',
  district: 'Lions Clubs International District 306',
  motto: 'We Serve',
  email: 'lionsbalangoda@gmail.com',
  address: 'Balangoda Secretariat, Main Street',
  city: 'Balangoda, Sabaragamuwa Province',
  country: 'Sri Lanka',
};

/**
 * Determines whether a given navigation link is currently active.
 * Handles exact matching for home root '/' and prefix matching for sub-paths.
 */
export function isActiveRoute(currentPath: string, href: string): boolean {
  if (!currentPath || !href) return false;
  // Normalize trailing slash (unless it is root)
  const normalizedPath =
    currentPath.length > 1 && currentPath.endsWith('/') ? currentPath.slice(0, -1) : currentPath;
  const normalizedHref = href.length > 1 && href.endsWith('/') ? href.slice(0, -1) : href;

  if (normalizedHref === '/') {
    return normalizedPath === '/';
  }

  return normalizedPath === normalizedHref || normalizedPath.startsWith(`${normalizedHref}/`);
}
