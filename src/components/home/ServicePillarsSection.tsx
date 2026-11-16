import React from 'react';
import Link from 'next/link';
import { SERVICE_PILLARS } from '../../data/club-pillars';
import type { ServicePillar } from '../../types/homepage';

function PillarCard({ pillar }: { pillar: ServicePillar }) {
  const categoryBadges: Record<
    ServicePillar['category'],
    { bg: string; text: string; icon: string }
  > = {
    HEALTHCARE: {
      bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
      text: 'Healthcare & Vision',
      icon: '👁️',
    },
    EDUCATION: {
      bg: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
      text: 'Education & Youth',
      icon: '📖',
    },
    ENVIRONMENT: {
      bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
      text: 'Environment & Climate',
      icon: '🌿',
    },
    RELIEF: {
      bg: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
      text: 'Hunger & Relief',
      icon: '🤝',
    },
  };

  const badge = categoryBadges[pillar.category];

  return (
    <article
      aria-labelledby={`pillar-title-${pillar.id}`}
      className="flex flex-col justify-between rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-amber-400/50"
    >
      <div>
        {/* Header with Icon and Category Tag */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${badge.bg}`}
          >
            <span aria-hidden="true">{badge.icon}</span>
            <span>{badge.text}</span>
          </span>
          <span className="text-2xl" aria-hidden="true">
            {badge.icon}
          </span>
        </div>

        {/* Pillar Title */}
        <h3
          id={`pillar-title-${pillar.id}`}
          className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight"
        >
          {pillar.title}
        </h3>

        {/* Narrative Description */}
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {pillar.shortDescription}
        </p>

        {/* Key Initiatives List */}
        <div className="mt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-3">
            Key Initiatives & Activities:
          </h4>
          <ul className="space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            {pillar.keyInitiatives.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold shrink-0 mt-0.5" aria-hidden="true">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer with Impact Highlight & Filter CTA */}
      <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
        <div className="rounded-xl bg-amber-500/10 p-3 mb-4 text-xs font-semibold text-amber-900 dark:text-amber-300">
          💡 {pillar.impactHighlight}
        </div>

        <Link
          href={`/projects?category=${pillar.category}`}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-100 px-4 py-2 text-xs font-bold text-zinc-900 transition-colors hover:bg-amber-500 hover:text-blue-950 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-amber-400 dark:hover:text-blue-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
        >
          <span>View {pillar.title} Projects</span>
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      </div>
    </article>
  );
}

export function ServicePillarsSection() {
  return (
    <section
      aria-labelledby="service-pillars-heading"
      className="py-16 sm:py-24 bg-white dark:bg-black transition-colors"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Lions International Global Causes
          </p>
          <h2
            id="service-pillars-heading"
            className="mt-2 text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight"
          >
            Humanitarian Service Pillars
          </h2>
          <p className="mt-4 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Our projects address critical community needs across four key pillars established by
            Lions International and tailored to the unique socio-economic landscape of the Balangoda
            region.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-stretch">
          {SERVICE_PILLARS.map((pillar) => (
            <PillarCard key={pillar.id} pillar={pillar} />
          ))}
        </div>
      </div>
    </section>
  );
}
