/* eslint-disable @next/next/no-img-element */
import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPublishedProjectBySlug } from '../../../lib/projects-repository.ts';
import {
  getPublishedProjectBySlugFromData,
  formatProjectDate,
  sanitizeProjectDescription,
  normalizeProjectPhotos,
} from '../../../lib/projects.ts';
import { ProjectImpactMetrics } from '../../../components/projects/ProjectImpactMetrics';
import { ProjectGallery } from '../../../components/projects/ProjectGallery';
import type { ServicePillar } from '../../../types/project.ts';

interface ProjectDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const PILLAR_STYLES: Record<ServicePillar, { badgeClass: string; label: string; icon: string }> = {
  HEALTHCARE: {
    badgeClass:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    label: 'Healthcare',
    icon: '🩺',
  },
  EDUCATION: {
    badgeClass:
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    label: 'Education',
    icon: '📚',
  },
  ENVIRONMENT: {
    badgeClass:
      'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    label: 'Environment',
    icon: '🌱',
  },
  POVERTY_RELIEF: {
    badgeClass:
      'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    label: 'Poverty Relief',
    icon: '🤝',
  },
  OTHER: {
    badgeClass:
      'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
    label: 'Community Service',
    icon: '🦁',
  },
};

/**
 * Helper to fetch a published project either from database repository
 * or fallback to verified in-memory seed data.
 */
function resolvePublishedProject(slug: string) {
  try {
    const dbProject = getPublishedProjectBySlug(slug);
    if (dbProject && dbProject.status === 'PUBLISHED') {
      return dbProject;
    }
  } catch {
    // If DB is offline or table uninitialized, fallback to seed data
  }
  return getPublishedProjectBySlugFromData(slug);
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = resolvePublishedProject(slug);

  if (!project || project.status !== 'PUBLISHED') {
    return {
      title: 'Project Not Found | Lions Club of Balangoda',
      description: 'The requested community project could not be found.',
    };
  }

  return {
    title: `${project.title} | Lions Club of Balangoda`,
    description: project.summary,
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = resolvePublishedProject(slug);

  // AC-3: Unknown or unpublished slug shows a friendly 404 page
  if (!project || project.status !== 'PUBLISHED') {
    notFound();
  }

  const pillar = PILLAR_STYLES[project.category] || PILLAR_STYLES.OTHER;
  const formattedDate = formatProjectDate(project.eventDate);
  const sanitizedDescription = sanitizeProjectDescription(project.description);
  const galleryPhotos = normalizeProjectPhotos(project);
  const hasMetrics = Array.isArray(project.impactMetrics) && project.impactMetrics.length > 0;
  const hasPhotos = galleryPhotos.length > 0;

  return (
    <article
      data-testid="project-detail-article"
      className="min-h-screen bg-zinc-50/70 dark:bg-black py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans w-full max-w-full overflow-x-hidden"
    >
      <div className="mx-auto max-w-4xl w-full min-w-0 space-y-8 sm:space-y-10">
        {/* Navigation Breadcrumb / Back Link */}
        <nav aria-label="Breadcrumb">
          <Link
            href="/projects"
            data-testid="back-to-projects-link"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-900 hover:text-amber-600 dark:text-blue-400 dark:hover:text-amber-300 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 rounded-sm"
          >
            <span aria-hidden="true">←</span>
            <span>Back to Community Projects</span>
          </Link>
        </nav>

        {/* Project Header */}
        <header className="space-y-4 sm:space-y-5">
          {/* Metadata badges row */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            {/* Category Pillar Badge */}
            <span
              data-testid="project-category-badge"
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-semibold ${pillar.badgeClass}`}
            >
              <span aria-hidden="true">{pillar.icon}</span>
              <span>{pillar.label}</span>
            </span>

            {/* Event Date */}
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1 font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
              <span aria-hidden="true">📅</span>
              <time dateTime={project.eventDate}>{formattedDate}</time>
            </span>

            {/* Location */}
            <span
              data-testid="project-location"
              className="inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1 font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 truncate max-w-full"
            >
              <span aria-hidden="true">📍</span>
              <span className="truncate">{project.location}</span>
            </span>
          </div>

          {/* Project Title */}
          <h1
            data-testid="project-title"
            className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight"
          >
            {project.title}
          </h1>

          {/* Author / Organizing Chair (if present) */}
          {project.authorName && (
            <p className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Activity Chair:{' '}
              <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                {project.authorName}
              </span>
            </p>
          )}

          {/* Lead Summary Callout */}
          {project.summary && (
            <div
              data-testid="project-summary-box"
              className="rounded-xl border-l-4 border-amber-500 bg-amber-50/70 p-4 sm:p-5 text-sm sm:text-base font-medium text-zinc-800 dark:bg-amber-950/20 dark:text-zinc-200 leading-relaxed"
            >
              {project.summary}
            </div>
          )}
        </header>

        {/* Featured Cover Image (Optional: AC-2 handled without empty box if missing) */}
        {project.coverImageUrl && (
          <div
            data-testid="project-cover-container"
            className="relative aspect-video w-full overflow-hidden rounded-2xl border border-zinc-200 shadow-md dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900"
          >
            <img
              src={project.coverImageUrl}
              alt={project.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Impact Metrics Section (Optional: AC-2 only rendered where present) */}
        {hasMetrics && <ProjectImpactMetrics metrics={project.impactMetrics} />}

        {/* Project Detailed Description / Narrative (AC-4: Sanitized) */}
        <section
          aria-label="Project Narrative and Details"
          data-testid="project-description-section"
          className="space-y-3"
        >
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            About This Initiative
          </h2>
          <div
            data-testid="project-description"
            className="prose prose-zinc dark:prose-invert max-w-none text-sm sm:text-base text-zinc-800 dark:text-zinc-200 leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
          />
        </section>

        {/* Photograph Gallery & Lightbox (Optional: AC-2 only rendered where available) */}
        {hasPhotos && <ProjectGallery photos={galleryPhotos} projectTitle={project.title} />}

        {/* Footer Navigation & Attribution */}
        <footer className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <div>
            <span>Lions Club of Balangoda • District 306 Sri Lanka</span>
          </div>
          <div>
            <Link
              href="/projects"
              className="text-blue-900 hover:text-amber-600 dark:text-blue-400 dark:hover:text-amber-300 font-semibold"
            >
              ← Return to All Projects
            </Link>
          </div>
        </footer>
      </div>
    </article>
  );
}
