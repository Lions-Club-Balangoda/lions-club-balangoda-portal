import React from 'react';

export default function NewsDetailLoading() {
  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-black py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-4xl animate-pulse space-y-8">
        <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="space-y-4">
          <div className="h-6 w-40 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-12 w-full rounded-lg bg-zinc-300 dark:bg-zinc-700" />
          <div className="h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-16 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="aspect-video w-full rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}

