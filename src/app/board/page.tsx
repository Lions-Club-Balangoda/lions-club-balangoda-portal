import React from 'react';
import type { Metadata } from 'next';
import { BoardDirectory } from '../../components/board/BoardDirectory';
import { getBoardDirectoryFromDb } from '../../lib/board-repository';

export const metadata: Metadata = {
  title: 'Executive Board Directory | Lions Club of Balangoda',
  description:
    'Meet the current and past executive committee officers leading humanitarian service initiatives at the Lions Club of Balangoda (District 306).',
};

export default function BoardPage() {
  const { terms, members } = getBoardDirectoryFromDb();

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-black py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <header className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-900 dark:bg-blue-950 dark:text-blue-300 mb-3">
            <span>🦁 Lions Clubs International District 306</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Executive Committee Directory
          </h1>
          <p className="mt-3 max-w-3xl text-base text-zinc-600 dark:text-zinc-400">
            Meet the dedicated Lions officers serving Balangoda across current and past Lionistic administrative years.
          </p>
        </header>

        {/* Directory Component */}
        <BoardDirectory terms={terms} members={members} />
      </div>
    </div>
  );
}
