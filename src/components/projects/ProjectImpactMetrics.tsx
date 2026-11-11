import React from 'react';
import type { ProjectImpactMetric } from '../../types/project.ts';

interface ProjectImpactMetricsProps {
  metrics?: ProjectImpactMetric[];
}

export const ProjectImpactMetrics: React.FC<ProjectImpactMetricsProps> = ({ metrics }) => {
  // AC-2: Missing optional data (metrics) is handled without empty boxes or errors.
  if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
    return null;
  }

  // Filter out any invalid items
  const validMetrics = metrics.filter((m) => m && (m.label || m.value !== undefined));

  if (validMetrics.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Community Impact Metrics"
      data-testid="project-impact-metrics"
      className="w-full max-w-full overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 p-6 sm:p-8 text-white shadow-md border border-blue-800/60"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl" aria-hidden="true">
          📊
        </span>
        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-400">
          Verified Community Impact
        </h2>
      </div>

      <div
        className={`grid gap-4 sm:gap-6 ${
          validMetrics.length === 1
            ? 'grid-cols-1 max-w-xs'
            : validMetrics.length === 2
              ? 'grid-cols-1 sm:grid-cols-2'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {validMetrics.map((metric, idx) => {
          const displayValue = `${metric.prefix || ''}${metric.value ?? ''}${metric.suffix || ''}`;
          return (
            <div
              key={idx}
              data-testid={`impact-metric-${idx}`}
              className="flex flex-col rounded-xl bg-white/10 backdrop-blur-sm p-4 sm:p-5 border border-white/10"
            >
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-amber-300">
                {displayValue}
              </div>
              <div className="mt-1 text-xs sm:text-sm font-medium text-blue-100/90 leading-snug">
                {metric.label}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
