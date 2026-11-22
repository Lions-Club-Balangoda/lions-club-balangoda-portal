'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function ProjectsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error securely server-side
    console.error('[ProjectsErrorBoundary]', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16 font-sans">
      <div className="max-w-md w-full text-center space-y-4 rounded-2xl border border-red-200 bg-red-50/50 p-6 sm:p-8 dark:border-red-900/50 dark:bg-red-950/20 shadow-sm">
        <span className="text-4xl" aria-hidden="true">
          ⚠️
        </span>
        <h2 className="text-lg sm:text-xl font-bold text-red-950 dark:text-red-200">
          Unable to Load Projects
        </h2>
        <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 leading-relaxed">
          An unexpected error occurred while fetching community service projects. Please try again
          later.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-xl bg-red-700 px-4 py-2 text-xs font-bold text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-colors cursor-pointer"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
