'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS, isActiveRoute } from '../../data/navigation';

export function Navbar() {
  const pathname = usePathname() || '/';
  const [isOpen, setIsOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close mobile drawer when route changes
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  // Handle keyboard navigation: close menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 transition-colors">
      <nav
        aria-label="Main Navigation"
        className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16 sm:h-20"
      >
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 transition-opacity hover:opacity-90"
            aria-label="Lions Club of Balangoda - Home"
          >
            <span
              className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-amber-500 font-black text-xl sm:text-2xl text-blue-950 shadow-sm"
              aria-hidden="true"
            >
              🦁
            </span>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-blue-950 dark:text-amber-400">
                Lions Club of Balangoda
              </span>
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 -mt-0.5">
                District 306 • Sri Lanka
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links (>= 768px tablet & desktop) */}
        <div className="hidden md:flex md:items-center md:gap-1 lg:gap-2">
          {NAV_ITEMS.map((item) => {
            const active = isActiveRoute(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`relative px-3 py-2 text-sm font-semibold rounded-md transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${
                  active
                    ? 'text-blue-900 bg-blue-50 dark:text-amber-300 dark:bg-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-blue-950 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:text-amber-400 dark:hover:bg-zinc-900'
                }`}
              >
                {item.label}
                {active && (
                  <span
                    className="absolute inset-x-3 -bottom-1 h-0.5 bg-amber-500 rounded-full dark:bg-amber-400"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Mobile / Tablet Menu Button (< 768px) */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation-menu"
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex items-center justify-center rounded-lg p-2.5 text-zinc-700 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 dark:text-zinc-200 dark:hover:bg-zinc-900 transition-colors"
          >
            <span className="sr-only">Toggle navigation</span>
            {isOpen ? (
              // Close icon (X)
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Hamburger icon
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer (< 768px) */}
      <div
        id="mobile-navigation-menu"
        className={`md:hidden border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 transition-all duration-200 ease-in-out ${
          isOpen ? 'block px-4 pt-3 pb-6 space-y-1 shadow-lg' : 'hidden'
        }`}
      >
        <div className="flex flex-col space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActiveRoute(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 text-base font-semibold rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${
                  active
                    ? 'text-blue-900 bg-blue-50 border-l-4 border-amber-500 dark:text-amber-300 dark:bg-zinc-900 dark:border-amber-400 pl-3'
                    : 'text-zinc-700 hover:text-blue-950 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:text-amber-400 dark:hover:bg-zinc-900'
                }`}
              >
                <span>{item.label}</span>
                {active && (
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    Active
                  </span>
                )}
              </Link>
            );
          })}
        </div>
        <div className="pt-4 mt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-500 dark:text-zinc-400 px-3.5">
          <span>Lions Clubs International District 306</span>
        </div>
      </div>
    </header>
  );
}
