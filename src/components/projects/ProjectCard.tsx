/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { Project, ServicePillar } from '../../types/project';

interface ProjectCardProps {
  project: Project;
}

const PILLAR_STYLES: Record<ServicePillar, { badgeClass: string; label: string; icon: string }> = {
  HEALTHCARE: {
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    label: 'Healthcare',
    icon: '🩺',
  },
  EDUCATION: {
    badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    label: 'Education',
    icon: '📚',
  },
  ENVIRONMENT: {
    badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    label: 'Environment',
    icon: '🌱',
  },
  POVERTY_RELIEF: {
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    label: 'Poverty Relief',
    icon: '🤝',
  },
  OTHER: {
    badgeClass: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
    label: 'Community Service',
    icon: '🦁',
  },
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const pillar = PILLAR_STYLES[project.category] || PILLAR_STYLES.OTHER;

  // Format event date nicely
  const formattedDate = (() => {
    try {
      const d = new Date(project.eventDate);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return project.eventDate;
    }
  })();

  return (
    <article
      data-testid={`project-card-${project.id}`}
      className="group flex flex-col w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {project.coverImageUrl ? (
          <img
            src={project.coverImageUrl}
            alt={project.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-950 p-4 text-center text-white">
            <span className="text-4xl mb-1">{pillar.icon}</span>
            <span className="text-xs font-semibold tracking-wider uppercase text-amber-300">
              Lions Club Balangoda
            </span>
          </div>
        )}

        {/* Category Badge overlay */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur-md ${pillar.badgeClass}`}
          >
            <span>{pillar.icon}</span>
            <span>{pillar.label}</span>
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Date and Location row */}
        <div className="mb-2.5 flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
            <span aria-hidden="true">📅</span>
            <time dateTime={project.eventDate}>{formattedDate}</time>
          </span>
          <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
          <span className="inline-flex items-center gap-1 truncate max-w-[200px]">
            <span aria-hidden="true">📍</span>
            <span className="truncate">{project.location}</span>
          </span>
        </div>

        {/* Project Title */}
        <h2 className="mb-2 text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-50 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 sm:text-lg">
          {project.title}
        </h2>

        {/* Project Summary */}
        <p className="mb-4 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed flex-1">
          {project.summary}
        </p>

        {/* Card Footer Action */}
        <div className="mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            View Project Brief
            <span aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </article>
  );
};
