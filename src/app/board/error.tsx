'use client';

import React, { useEffect } from 'react';

export default function BoardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[BoardErrorBoundary]', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-4 rounded-2xl border border-red-200 bg-red-50/50 p-8 dark:border-red-900/50 dark:bg-red-950/20">
        <span className="text-4xl" aria-hidden="true">
          ⚠️
        </span>
        <h2 className="text-xl font-bold text-red-950 dark:text-red-200">
          Unable to Load Board Directory
        </h2>
        <p className="text-sm text-red-700 dark:text-red-300">
          An unexpected error occurred while retrieving the executive committee records. Please try
          again.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center rounded-lg bg-red-700 px-4 py-2 text-xs font-bold text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
