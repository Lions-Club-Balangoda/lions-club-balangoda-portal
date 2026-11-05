import React from 'react';
import { Project, ServicePillar } from '../../types/project';

interface ProjectCardProps {
  project: Project;
}

const PILLAR_STYLES: Record<ServicePillar, { label: string; badgeClass: string }> = {
  HEALTHCARE: {
    label: 'Healthcare',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300',
  },
  EDUCATION: {
    label: 'Education',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300',
  },
  ENVIRONMENT: {
    label: 'Environment',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300',
  },
  POVERTY_RELIEF: {
    label: 'Poverty Relief',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300',
  },
  OTHER: {
    label: 'Community Service',
    badgeClass: 'bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300',
  },
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const pillar = PILLAR_STYLES[project.category] || PILLAR_STYLES.OTHER;
  const formattedDate = new Date(project.eventDate).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <article
      data-testid={`project-card-${project.id}`}
      className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="relative h-48 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.coverImageUrl}
          alt={project.title}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 right-3">
          <span
            data-testid="project-category-badge"
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${pillar.badgeClass}`}
          >
            {pillar.label}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span>📅 {formattedDate}</span>
          <span>•</span>
          <span>📍 {project.location}</span>
        </div>

        <h3 className="mb-2 text-lg font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2">
          {project.title}
        </h3>

        <p className="mb-4 flex-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">
          {project.summary}
        </p>

        <div className="mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <a
            href={`/projects/${project.slug}`}
            className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Read Story & View Gallery →
          </a>
        </div>
      </div>
    </article>
  );
};

