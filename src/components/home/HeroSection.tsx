import React from 'react';
import Link from 'next/link';
import { CLUB_CONTACT_INFO } from '../../data/navigation';
import { CLUB_MISSION_VISION } from '../../data/club-pillars';

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 text-white py-16 sm:py-24 lg:py-32"
    >
      {/* Background glow & decorative accents */}
      <div
        className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-500/15 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {/* Badge: District & Motto */}
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-amber-300 border border-amber-500/25 mb-6">
            <span
              className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse"
              aria-hidden="true"
            />
            <span>{CLUB_CONTACT_INFO.district}</span>
            <span className="text-amber-500/60" aria-hidden="true">
              •
            </span>
            <span>Motto: &quot;{CLUB_MISSION_VISION.motto}&quot;</span>
          </div>

          {/* Primary Heading */}
          <h1
            id="hero-heading"
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight"
          >
            Serving the Community of{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
              Balangoda
            </span>{' '}
            with Dignity and Purpose.
          </h1>

          {/* Subtitle Narrative */}
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-zinc-300 leading-relaxed">
            {CLUB_MISSION_VISION.purpose}
          </p>

          {/* Primary CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link
              href="/projects"
              className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-6 py-3.5 text-sm sm:text-base font-bold text-blue-950 transition-all hover:bg-amber-400 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 shadow-md active:scale-[0.98]"
            >
              Explore Our Projects
              <svg
                className="ml-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>

            <Link
              href="/volunteer"
              className="inline-flex items-center justify-center rounded-xl bg-white/10 px-6 py-3.5 text-sm sm:text-base font-bold text-white backdrop-blur-sm border border-white/20 transition-all hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.98]"
            >
              Join as a Volunteer
            </Link>
          </div>

          {/* Quick Pillar Anchors */}
          <div className="mt-12 pt-8 border-t border-blue-800/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-zinc-300">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-sm">👁️</span> Vision Care
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-sm">📚</span> Youth Education
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-sm">🌱</span> Conservation
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-sm">🤝</span> Famine Relief
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
