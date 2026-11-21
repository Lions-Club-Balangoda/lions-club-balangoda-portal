import React from 'react';
import { CLUB_MISSION_VISION } from '../../data/club-pillars';

export function MissionVisionSection() {
  return (
    <section
      aria-labelledby="mission-vision-heading"
      className="py-16 sm:py-20 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 transition-colors"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Our Purpose & Compass
          </p>
          <h2
            id="mission-vision-heading"
            className="mt-2 text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight"
          >
            Mission & Vision
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Guided by over a century of global Lions service and grounded in the immediate
            humanitarian priorities of Balangoda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {/* Mission Card */}
          <div className="flex flex-col justify-between rounded-2xl bg-white dark:bg-zinc-900 p-8 sm:p-10 shadow-sm border border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-md">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-950 text-amber-400 text-2xl shadow-sm">
                  🎯
                </span>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Our Mission</h3>
                  <p className="text-xs font-semibold text-blue-900 dark:text-blue-400">
                    Empowerment Through Service
                  </p>
                </div>
              </div>

              <blockquote className="text-base sm:text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed italic border-l-4 border-amber-500 pl-4 py-1">
                &quot;{CLUB_MISSION_VISION.mission}&quot;
              </blockquote>

              <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                We bridge the gap between community need and direct humanitarian action by
                mobilizing local volunteers, medical professionals, and educators to solve pressing
                grassroots challenges.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              <span>District 306 Sri Lanka</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">#WeServe</span>
            </div>
          </div>

          {/* Vision Card */}
          <div className="flex flex-col justify-between rounded-2xl bg-white dark:bg-zinc-900 p-8 sm:p-10 shadow-sm border border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-md">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-blue-950 text-2xl shadow-sm">
                  🌟
                </span>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Our Vision</h3>
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                    Enduring Community Impact
                  </p>
                </div>
              </div>

              <blockquote className="text-base sm:text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed italic border-l-4 border-blue-900 dark:border-blue-500 pl-4 py-1">
                &quot;{CLUB_MISSION_VISION.vision}&quot;
              </blockquote>

              <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                We envision a resilient, healthy, and educated Balangoda where no child lacks
                learning supplies, no elder suffers from untreated eyesight failure, and our natural
                ecosystems flourish sustainably.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              <span>Lions Clubs International</span>
              <span className="font-bold text-blue-900 dark:text-blue-400">
                Global Humanitarian Network
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
