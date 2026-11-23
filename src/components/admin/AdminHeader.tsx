'use client';

import React from 'react';
import Link from 'next/link';
import type { UserRole } from '../../types/rbac';
import { ROLE_DEFINITIONS } from '../../types/rbac';
import { MenuIcon, LogoutIcon, ExternalLinkIcon } from './AdminIcons';

export interface AdminHeaderProps {
  user?: {
    fullName: string;
    role: UserRole;
    email?: string;
  } | null;
  onToggleMobile?: () => void;
  onSignOut?: () => void;
  pageTitle?: string;
}

export function AdminHeader({
  user,
  onToggleMobile,
  onSignOut,
  pageTitle = 'Dashboard Overview',
}: AdminHeaderProps) {
  const roleLabel = user?.role ? ROLE_DEFINITIONS[user.role]?.label || user.role : 'Officer';

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur px-4 sm:px-6 py-3.5 dark:border-zinc-800 dark:bg-zinc-900/95 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle + Title / Breadcrumb */}
        <div className="flex items-center gap-3">
          {onToggleMobile && (
            <button
              type="button"
              onClick={onToggleMobile}
              className="md:hidden p-2 -ml-1 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label="Open mobile navigation menu"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
          )}

          <div>
            <h1 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white leading-tight">
              {pageTitle}
            </h1>
            <p className="hidden sm:block text-xs text-zinc-500 dark:text-zinc-400">
              Lions Club Balangoda • Officer Administration
            </p>
          </div>
        </div>

        {/* Right: User Profile, Public Link, Sign Out */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Public Portal Link */}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-blue-900 dark:hover:text-amber-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Open public website in new tab"
          >
            <span>Public Site</span>
            <ExternalLinkIcon className="w-3.5 h-3.5" />
          </Link>

          {/* Officer Info & Role Badge */}
          {user && (
            <div className="flex items-center gap-2.5 pl-2 sm:border-l sm:border-zinc-200 dark:sm:border-zinc-800">
              <div
                className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-blue-900 font-bold text-xs text-amber-400 shadow-xs"
                aria-hidden="true"
              >
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'L'}
              </div>
              <div className="flex flex-col text-right sm:text-left">
                <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[130px] sm:max-w-[200px]">
                  {user.fullName || 'Club Officer'}
                </span>
                <div className="flex items-center gap-1 mt-0.5 justify-end sm:justify-start">
                  <span
                    data-testid="user-role-badge"
                    className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold tracking-wide uppercase ${
                      user.role === 'ADMIN'
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60'
                        : 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 border border-blue-300/60 dark:border-blue-700/60'
                    }`}
                  >
                    {roleLabel}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Sign Out Button */}
          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/40 dark:hover:bg-red-900/40 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Sign out of administrative portal"
            >
              <LogoutIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

