/**
 * src/types/rbac.ts
 * Role-Based Access Control (RBAC) Specification & Permission Matrix
 *
 * Story: LBW-39 (Role-based access control - administrator and editor)
 * Security Standards: SEC-02 (Input Validation & Authorization), SEC-04 (Secrets & Access Control)
 * Course: IS5109 Community Project (Group 14)
 * Client: Lions Club of Balangoda (Lions Clubs International District 306)
 */

/**
 * System User Roles
 * - ADMIN: Full administrative rights across all operations and resources
 * - EDITOR: Content curation rights (Create, Read, Update, Publish) with destructive/export/user actions restricted
 */
export type UserRole = 'ADMIN' | 'EDITOR';

export const USER_ROLES: readonly UserRole[] = ['ADMIN', 'EDITOR'] as const;

export interface RoleDefinition {
  name: UserRole;
  label: string;
  description: string;
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  ADMIN: {
    name: 'ADMIN',
    label: 'Administrator',
    description:
      'Full administrative access. Manages users, system settings, exports volunteer submissions, and executes permanent deletions.',
  },
  EDITOR: {
    name: 'EDITOR',
    label: 'Editor',
    description:
      'Content management access. Can create, edit, publish, and unpublish projects, news, and board records. Destructive deletion, submission export, and user management restricted.',
  },
};

/**
 * Protected System Resources
 */
export type Resource =
  | 'PROJECTS'
  | 'NEWS'
  | 'BOARD'
  | 'MEDIA'
  | 'VOLUNTEERS'
  | 'INQUIRIES'
  | 'USERS'
  | 'SETTINGS'
  | 'DASHBOARD';

/**
 * Operations on Resources
 */
export type Operation =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'PUBLISH'
  | 'UNPUBLISH'
  | 'EXPORT'
  | 'MANAGE';

/**
 * Unified Permission String Format: "RESOURCE:OPERATION"
 */
export type Permission = `${Resource}:${Operation}`;

/**
 * Operations Matrix: Explicit permission mapping per role.
 *
 * Acceptance Criteria (LBW-39 AC1):
 * - Roles Administrator and Editor exist
 * - Permissions per operation are documented
 * - Only Administrator can delete content, manage users, or export submissions
 */
export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  ADMIN: [
    // Dashboard & Overview
    'DASHBOARD:READ',

    // Projects CRUD + Lifecycle
    'PROJECTS:CREATE',
    'PROJECTS:READ',
    'PROJECTS:UPDATE',
    'PROJECTS:DELETE', // Restricted to ADMIN
    'PROJECTS:PUBLISH',
    'PROJECTS:UNPUBLISH',

    // News & Announcements CRUD + Lifecycle
    'NEWS:CREATE',
    'NEWS:READ',
    'NEWS:UPDATE',
    'NEWS:DELETE', // Restricted to ADMIN
    'NEWS:PUBLISH',
    'NEWS:UNPUBLISH',

    // Executive Board Directory
    'BOARD:CREATE',
    'BOARD:READ',
    'BOARD:UPDATE',
    'BOARD:DELETE', // Restricted to ADMIN

    // Media Asset CDN
    'MEDIA:CREATE',
    'MEDIA:READ',
    'MEDIA:UPDATE',
    'MEDIA:DELETE', // Restricted to ADMIN

    // Volunteer Applications & Submissions (FR-07)
    'VOLUNTEERS:READ',
    'VOLUNTEERS:UPDATE',
    'VOLUNTEERS:DELETE', // Restricted to ADMIN
    'VOLUNTEERS:EXPORT', // Restricted to ADMIN (CSV export)

    // General & Sponsor Inquiries
    'INQUIRIES:READ',
    'INQUIRIES:UPDATE',
    'INQUIRIES:DELETE', // Restricted to ADMIN
    'INQUIRIES:EXPORT', // Restricted to ADMIN (CSV export)

    // User Management & System Configuration
    'USERS:CREATE', // Restricted to ADMIN
    'USERS:READ', // Restricted to ADMIN
    'USERS:UPDATE', // Restricted to ADMIN
    'USERS:DELETE', // Restricted to ADMIN
    'USERS:MANAGE', // Restricted to ADMIN
    'SETTINGS:MANAGE', // Restricted to ADMIN
  ],

  EDITOR: [
    // Dashboard & Overview
    'DASHBOARD:READ',

    // Projects (Authoring & Publishing allowed; DELETE strictly denied)
    'PROJECTS:CREATE',
    'PROJECTS:READ',
    'PROJECTS:UPDATE',
    'PROJECTS:PUBLISH',
    'PROJECTS:UNPUBLISH',

    // News (Authoring & Publishing allowed; DELETE strictly denied)
    'NEWS:CREATE',
    'NEWS:READ',
    'NEWS:UPDATE',
    'NEWS:PUBLISH',
    'NEWS:UNPUBLISH',

    // Board Directory (Update info allowed; DELETE strictly denied)
    'BOARD:CREATE',
    'BOARD:READ',
    'BOARD:UPDATE',

    // Media Asset CDN (Upload and preview allowed; DELETE strictly denied)
    'MEDIA:CREATE',
    'MEDIA:READ',
    'MEDIA:UPDATE',

    // Submissions (Review & Status notes allowed; EXPORT & DELETE strictly denied)
    'VOLUNTEERS:READ',
    'VOLUNTEERS:UPDATE',
    'INQUIRIES:READ',
    'INQUIRIES:UPDATE',

    // USERS & SETTINGS: Fully omitted for EDITOR role
  ],
};

/**
 * Authenticated User Session Payload
 */
export interface AuthUser {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
}

/**
 * Checks if a given role has permission for a specific resource and operation.
 */
export function hasPermission(role: UserRole, resource: Resource, operation: Operation): boolean {
  const permission: Permission = `${resource}:${operation}`;
  const allowedPermissions = ROLE_PERMISSIONS[role] || [];
  return allowedPermissions.includes(permission);
}

/**
 * Validates whether a user's role satisfies a required role level.
 * Hierarchy: ADMIN satisfies both ADMIN and EDITOR requirements.
 */
export function satisfiesRole(userRole: UserRole, requiredRole: UserRole): boolean {
  if (userRole === 'ADMIN') return true;
  return userRole === requiredRole;
}
