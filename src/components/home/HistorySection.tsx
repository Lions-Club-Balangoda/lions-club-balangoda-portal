import React from 'react';
import Link from 'next/link';
import { CLUB_HISTORY } from '../../data/club-pillars';
import { CLUB_CONTACT_INFO } from '../../data/navigation';

export function HistorySection() {
  return (
    <section
      aria-labelledby="history-heading"
      className="py-16 sm:py-24 bg-zinc-50 dark:bg-zinc-950 border-t border-b border-zinc-200 dark:border-zinc-800 transition-colors"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Narrative History */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-950 px-3.5 py-1 text-xs font-bold text-amber-400">
              <span>🏛️</span>
              <span>Our Heritage & Roots</span>
            </div>

            <h2
              id="history-heading"
              className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight"
            >
              The Story of Lions Club of Balangoda
            </h2>

            <p className="text-base sm:text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {CLUB_HISTORY.establishedSummary}
            </p>

            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Serving the diverse mountainous communities of{' '}
              <strong className="text-zinc-900 dark:text-zinc-100">
                {CLUB_HISTORY.regionServed}
              </strong>
              , our members include civic leaders, healthcare workers, business founders, and
              educators dedicated to meaningful, long-term civic upliftment.
            </p>

            <div className="pt-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-3">
                Our Core Operational Commitments:
              </h3>
              <ul className="space-y-2.5">
                {CLUB_HISTORY.keyCommitments.map((commitment, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-blue-950 text-xs font-black">
                      ✓
                    </span>
                    <span>{commitment}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 flex flex-wrap gap-4 items-center">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-950 px-5 py-2.5 text-xs sm:text-sm font-bold text-amber-400 transition-colors hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-950"
              >
                <span>Read Full Charter & Committee History</span>
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/board"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 px-5 py-2.5 text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <span>View Executive Board Directory</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Infographic & Quick Facts */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-gradient-to-br from-blue-950 to-blue-900 text-white p-8 sm:p-10 shadow-xl overflow-hidden border border-blue-800">
              <div
                className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"
                aria-hidden="true"
              />

              <div className="flex items-center gap-3 mb-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-2xl shadow-sm text-blue-950 font-black">
                  🦁
                </span>
                <div>
                  <h4 className="text-base font-bold text-white">{CLUB_CONTACT_INFO.clubName}</h4>
                  <p className="text-xs text-amber-400 font-semibold">
                    {CLUB_HISTORY.charterDistrict}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-zinc-200">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-xs uppercase font-bold text-amber-400 block mb-1">
                    Chartered District
                  </span>
                  <p className="font-medium text-white">{CLUB_HISTORY.charterDistrict}</p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-xs uppercase font-bold text-amber-400 block mb-1">
                    Geographic Focus
                  </span>
                  <p className="font-medium text-white">{CLUB_HISTORY.regionServed}</p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-xs uppercase font-bold text-amber-400 block mb-1">
                    Global Affiliation
                  </span>
                  <p className="font-medium text-white">
                    Lions Clubs International — Over 1.4 million members in 200+ countries
                    worldwide.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-blue-800/80 text-center">
                <p className="text-xs font-semibold text-amber-300">
                  Motto: &quot;{CLUB_CONTACT_INFO.motto}&quot; • Founded on Volunteer Civic Action
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
