import React from 'react';
import type { Metadata } from 'next';
import { ProjectsList } from '../../components/projects/ProjectsList';
import { SEED_PROJECTS } from '../../data/mock-projects';

export const metadata: Metadata = {
  title: 'Community Projects | Lions Club of Balangoda',
  description:
    'Explore the humanitarian service projects, eye camps, educational drives, and environmental initiatives organized by the Lions Club of Balangoda (District 306).',
};

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-black py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <header className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300 mb-3">
            <span>🦁 Lions Clubs International District 306</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Our Community Service Projects
          </h1>
          <p className="mt-3 max-w-3xl text-base text-zinc-600 dark:text-zinc-400">
            Dedicated to humanitarian service across Balangoda and surrounding rural regions. Browse our verified projects across healthcare, education, environment, and poverty relief.
          </p>
        </header>

        {/* Projects List Vertical Slice */}
        <main>
          <ProjectsList initialProjects={SEED_PROJECTS} />
        </main>
      </div>
    </div>
  );
}

