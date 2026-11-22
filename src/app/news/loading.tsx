import React from 'react';

export default function NewsLoading() {
  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-black py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-7xl animate-pulse space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-3">
          <div className="h-6 w-48 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-10 w-96 rounded-lg bg-zinc-300 dark:bg-zinc-700" />
          <div className="h-4 w-full max-w-xl rounded-md bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* Filter Bar Skeleton */}
        <div className="flex justify-between items-center py-2">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            ))}
          </div>
          <div className="h-10 w-64 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* Card Grid Skeleton */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 space-y-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="aspect-video w-full rounded-xl bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-6 w-3/4 rounded bg-zinc-300 dark:bg-zinc-700" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-4 w-5/6 rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
