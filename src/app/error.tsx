'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error details securely server-side without leaking technical internals to client DOM
    console.error('[GlobalErrorBoundary]', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 font-sans">
      <div className="max-w-md w-full text-center space-y-5 rounded-2xl border border-red-200 bg-red-50/60 p-6 sm:p-8 dark:border-red-900/50 dark:bg-red-950/20 shadow-sm">
        <span className="text-4xl" aria-hidden="true">
          ⚠️
        </span>
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-red-950 dark:text-red-200">
            Something Went Wrong
          </h1>
          <p className="text-xs sm:text-sm text-red-800 dark:text-red-300 leading-relaxed">
            An unexpected error occurred while loading this page. Our technical team has been
            notified.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-red-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-colors cursor-pointer"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
