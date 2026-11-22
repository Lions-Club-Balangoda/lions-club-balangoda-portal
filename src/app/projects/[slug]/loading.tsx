import React from 'react';

export default function ProjectDetailLoading() {
  return (
    <div
      data-testid="project-detail-loading"
      className="min-h-screen bg-zinc-50/70 dark:bg-black py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans w-full max-w-full overflow-x-hidden"
    >
      <div className="mx-auto max-w-4xl w-full min-w-0 animate-pulse space-y-8">
        {/* Back Link Skeleton */}
        <div className="h-4 w-44 rounded bg-zinc-200 dark:bg-zinc-800" />

        {/* Header Skeletons */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="h-6 w-28 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-6 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-6 w-36 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="h-10 sm:h-14 w-full rounded-xl bg-zinc-300 dark:bg-zinc-700" />
          <div className="h-20 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* Cover Image Skeleton */}
        <div className="aspect-video w-full rounded-2xl bg-zinc-200 dark:bg-zinc-800" />

        {/* Narrative Description Skeletons */}
        <div className="space-y-3">
          <div className="h-5 w-48 rounded bg-zinc-300 dark:bg-zinc-700" />
          <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-5/6 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}
