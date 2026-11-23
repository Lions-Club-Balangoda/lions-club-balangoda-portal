'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import type { UserRole } from '../../types/rbac';
import {
  getPermittedAdminNavItems,
  isAdminRouteActive,
  type AdminNavItem,
} from '../../data/admin-navigation';
import { AdminNavIcon, CloseIcon, ExternalLinkIcon } from './AdminIcons';

export interface AdminSidebarProps {
  role?: UserRole | null;
  currentPath: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AdminSidebar({
  role = 'ADMIN',
  currentPath,
  isMobileOpen = false,
  onCloseMobile,
}: AdminSidebarProps) {
  const navItems: AdminNavItem[] = getPermittedAdminNavItems(role);

  // Close mobile drawer when pressing Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen && onCloseMobile) {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  // Sidebar inner content rendered both for desktop sidebar and mobile drawer
  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <Link
            href="/admin"
            className="flex items-center gap-3 group focus-visible:outline-2 focus-visible:outline-amber-600 rounded-lg"
            aria-label="Lions Club Admin Portal"
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 font-black text-xl text-blue-950 shadow-sm transition-transform group-hover:scale-105"
              aria-hidden="true"
            >
              🦁
            </span>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-blue-950 dark:text-amber-400">
                Lions Balangoda
              </span>
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                CMS Portal
              </span>
            </div>
          </Link>

          {/* Close button for mobile drawer */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="md:hidden p-2 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none"
              aria-label="Close navigation menu"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <nav aria-label="Admin Navigation" className="p-3 space-y-1">
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Management Modules
          </p>
          {navItems.map((item) => {
            const isActive = isAdminRouteActive(currentPath, item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onCloseMobile}
                data-testid={`admin-nav-${item.id}`}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-start gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-900 text-amber-400 font-semibold shadow-xs dark:bg-amber-500/15 dark:text-amber-300'
                    : 'text-zinc-700 hover:text-blue-950 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-800/60'
                }`}
              >
                <span
                  className={`mt-0.5 flex-shrink-0 ${
                    isActive ? 'text-amber-400 dark:text-amber-300' : 'text-zinc-400 dark:text-zinc-500'
                  }`}
                  aria-hidden="true"
                >
                  <AdminNavIcon icon={item.icon} className="w-5 h-5" />
                </span>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="truncate">{item.label}</span>
                    {item.requiredRole === 'ADMIN' && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
                        Admin
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                    {item.description}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Utilities */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3 bg-zinc-50/50 dark:bg-zinc-900/50">
        <Link
          href="/"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-zinc-600 hover:text-blue-900 dark:text-zinc-400 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <span>Return to Public Website</span>
          <ExternalLinkIcon className="w-3.5 h-3.5" />
        </Link>
        <div className="px-3 pt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
          <p className="font-semibold text-zinc-600 dark:text-zinc-400">Term 2026/2027</p>
          <p>Lions District 306 • Sri Lanka</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop / Tablet Persistent Sidebar */}
      <aside
        data-testid="admin-desktop-sidebar"
        className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 sticky top-0 h-screen overflow-y-auto"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (with backdrop blur and trap) */}
      {isMobileOpen && (
        <div
          data-testid="admin-mobile-drawer"
          className="fixed inset-0 z-50 md:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Admin Navigation Menu"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative flex flex-col w-4/5 max-w-xs bg-white dark:bg-zinc-900 h-full shadow-2xl z-10 overflow-y-auto animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

