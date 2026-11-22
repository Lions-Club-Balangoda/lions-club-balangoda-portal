import React from 'react';
import { IMPACT_METRICS } from '../../data/club-pillars';
import type { ImpactMetric } from '../../types/homepage';

function MetricCard({ metric }: { metric: ImpactMetric }) {
  const iconEmoji: Record<string, string> = {
    Users: '👥',
    Eye: '👁️',
    TreePine: '🌲',
    HeartHandshake: '🤝',
  };

  return (
    <div
      aria-labelledby={`metric-label-${metric.key}`}
      className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-center transition-all hover:shadow-md hover:border-amber-500/40"
    >
      <span className="text-3xl mb-3" aria-hidden="true">
        {iconEmoji[metric.iconName] || '✨'}
      </span>
      <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-blue-950 dark:text-amber-400 tracking-tight">
        {metric.formattedValue}
      </span>
      <h3
        id={`metric-label-${metric.key}`}
        className="mt-2 text-sm sm:text-base font-bold text-zinc-900 dark:text-white"
      >
        {metric.label}
      </h3>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-normal max-w-xs">
        {metric.description}
      </p>
    </div>
  );
}

export function ImpactMetricsSection() {
  return (
    <section
      aria-labelledby="impact-heading"
      className="py-16 sm:py-20 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-black transition-colors"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Real Community Impact
          </p>
          <h2
            id="impact-heading"
            className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight"
          >
            Verified Milestones of Humanitarian Service
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Every statistic represents real families assisted, eyesight restored, and nature
            preserved across the Balangoda community.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {IMPACT_METRICS.map((metric) => (
            <MetricCard key={metric.key} metric={metric} />
          ))}
        </div>
      </div>
    </section>
  );
}
