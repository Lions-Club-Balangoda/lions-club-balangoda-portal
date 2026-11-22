import React from 'react';
import Link from 'next/link';

export default function ProjectNotFound() {
  return (
    <div
      data-testid="project-not-found"
      className="min-h-[70vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 font-sans"
    >
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-3xl text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
          🦁
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            404 Error • Project Unavailable
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Project Not Found
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            The community project you are looking for does not exist, may have been unpublished, or
            the URL might be incorrect.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/projects"
            data-testid="return-to-projects-btn"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-blue-900 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow hover:bg-blue-800 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            ← Browse All Projects
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-5 py-2.5 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
