import React from 'react';
import Link from 'next/link';
import { NAV_ITEMS, CLUB_CONTACT_INFO } from '../../data/navigation';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      className="w-full bg-blue-950 text-zinc-100 border-t border-blue-900/60 dark:bg-zinc-950 dark:border-zinc-800 transition-colors"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Organization Brief & Motto */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 font-black text-xl text-blue-950 shadow-sm"
                aria-hidden="true"
              >
                🦁
              </span>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  {CLUB_CONTACT_INFO.clubName}
                </h2>
                <p className="text-xs font-semibold text-amber-400">
                  {CLUB_CONTACT_INFO.district}
                </p>
              </div>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Dedicated to uplifting the community of Balangoda through humanitarian service across
              healthcare, education, environmental preservation, and disaster relief.
            </p>
            <div className="inline-flex items-center rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-500/20">
              Motto: &quot;{CLUB_CONTACT_INFO.motto}&quot;
            </div>
          </div>

          {/* Column 2: Quick Navigation Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-4">
              Navigation
            </h3>
            <ul className="space-y-2.5">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-zinc-300 hover:text-amber-400 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 rounded-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Verified Contact Information */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-4">
              Secretariat Contact
            </h3>
            <address className="not-italic space-y-3 text-sm text-zinc-300">
              <div className="flex items-start gap-2.5">
                <svg
                  className="h-5 w-5 text-amber-400 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
                <span>
                  {CLUB_CONTACT_INFO.address}
                  <br />
                  {CLUB_CONTACT_INFO.city}, {CLUB_CONTACT_INFO.country}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <svg
                  className="h-5 w-5 text-amber-400 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
                <a
                  href={`mailto:${CLUB_CONTACT_INFO.email}`}
                  className="text-amber-300 hover:text-amber-200 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 rounded-sm"
                  aria-label={`Send email to ${CLUB_CONTACT_INFO.email}`}
                >
                  {CLUB_CONTACT_INFO.email}
                </a>
              </div>
            </address>
          </div>

          {/* Column 4: Service Pillars & Affiliation */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-4">
              Humanitarian Pillars
            </h3>
            <ul className="space-y-1.5 text-xs text-zinc-300">
              <li className="flex items-center gap-2">
                <span className="text-amber-400">✓</span> Vision & Healthcare
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400">✓</span> Youth Education & Literacy
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400">✓</span> Environmental Stewardship
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400">✓</span> Hunger & Poverty Relief
              </li>
            </ul>
            <div className="pt-3">
              <Link
                href="/volunteer"
                className="inline-flex w-full items-center justify-center rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-blue-950 transition-colors hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 shadow-sm"
              >
                Join as a Volunteer
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Accreditation */}
        <div className="mt-12 pt-8 border-t border-blue-900/60 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>
            © {currentYear} {CLUB_CONTACT_INFO.clubName}. All rights reserved.
          </p>
          <p className="text-center sm:text-right">
            Sabaragamuwa University of Sri Lanka • IS5109 Community Information Systems Project
          </p>
        </div>
      </div>
    </footer>
  );
}

