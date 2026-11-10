import React from 'react';
import type { Metadata } from 'next';
import { ProjectsList } from '../../components/projects/ProjectsList';
import { getPublishedProjects } from '../../lib/projects-repository';
import { Project } from '../../types/project';

export const metadata: Metadata = {
  title: 'Community Projects & Service Archive | Lions Club of Balangoda',
  description:
    'Explore verified humanitarian service projects, eye screening camps, educational book drives, and reforestation initiatives organized by the Lions Club of Balangoda (District 306).',
};

// Force dynamic or short revalidation so fresh data is loaded
export const revalidate = 60;

export default async function ProjectsPage() {
  let initialProjects: Project[] = [];
  let initialError: string | null = null;

  try {
    // Database-backed retrieval via parameterised repository query
    initialProjects = getPublishedProjects();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    console.error('[ProjectsPage] Failed to fetch published projects:', message);
    initialError = 'Unable to load projects at this time.';
  }

  return (
    <div className="min-h-screen bg-zinc-50/70 py-10 px-4 sm:px-6 lg:px-8 font-sans dark:bg-black w-full max-w-full overflow-x-hidden">
      <div className="mx-auto max-w-7xl w-full">
        {/* Page Header */}
        <header className="mb-8 sm:mb-12 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3.5 py-1 text-xs font-semibold text-blue-900 dark:bg-blue-950 dark:text-blue-300 mb-3 border border-blue-200 dark:border-blue-900">
            <span>🦁 Lions Clubs International District 306</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Our Community Service Projects
          </h1>
          <p className="mt-2.5 max-w-3xl text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Preserving our humanitarian service legacy across Balangoda, Medadumbara, and Kaltota.
            Browse verified service activities in healthcare, education, environmental protection,
            and poverty relief.
          </p>
        </header>

        {/* Main Projects List Container */}
        <main className="w-full max-w-full min-w-0">
          <ProjectsList initialProjects={initialProjects} initialError={initialError} />
        </main>
      </div>
    </div>
  );
}
