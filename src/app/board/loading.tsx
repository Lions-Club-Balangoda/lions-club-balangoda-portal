import React from 'react';

export default function BoardLoading() {
  return (
    <div className="min-h-screen bg-zinc-50/70 py-10 px-4 sm:px-6 lg:px-8 font-sans dark:bg-black w-full max-w-full overflow-x-hidden">
      <div className="mx-auto max-w-7xl w-full">
        {/* Header Skeleton */}
        <div className="mb-8 sm:mb-12 animate-pulse space-y-3">
          <div className="h-6 w-48 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-10 w-96 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-full max-w-2xl rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* Directory Skeleton */}
        <div className="w-full max-w-full animate-pulse space-y-8">
          <div className="h-24 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
