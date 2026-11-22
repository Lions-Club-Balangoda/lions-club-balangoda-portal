import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { BoardDirectory } from '../../components/board/BoardDirectory.tsx';
import { getBoardDirectoryData } from '../../lib/board-repository.ts';
import { SEED_BOARD_TERMS, SEED_EXECUTIVE_MEMBERS } from '../../data/mock-board.ts';
import { resolveBoardDirectoryState } from '../../lib/board.ts';
import type { BoardDirectoryViewModel } from '../../types/board.ts';

export const metadata: Metadata = {
  title: 'Executive Board Directory | Lions Club of Balangoda',
  description:
    'Explore the current and past executive leadership committees of the Lions Club of Balangoda (District 306). Filter officers by Lionistic Year.',
};

interface BoardPageProps {
  searchParams?: Promise<{ year?: string | string[] }>;
}

async function BoardDirectoryContent({ searchParams }: BoardPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const rawYear = resolvedSearchParams.year;
  const requestedYear = Array.isArray(rawYear) ? rawYear[0] : rawYear;

  let directoryData: BoardDirectoryViewModel;

  try {
    directoryData = getBoardDirectoryData(requestedYear);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    console.error('[BoardPage] Failed to fetch board directory:', message);
    directoryData = resolveBoardDirectoryState(
      SEED_BOARD_TERMS,
      SEED_EXECUTIVE_MEMBERS,
      requestedYear
    );
  }

  const allMembers = SEED_EXECUTIVE_MEMBERS.filter((m) => m.status === 'ACTIVE');

  return (
    <BoardDirectory
      terms={directoryData.terms}
      initialSelectedTerm={directoryData.selectedTerm}
      initialMembers={directoryData.members}
      allMembers={allMembers}
      isInitialInvalidYear={directoryData.isInvalidYear}
      invalidYearRequested={directoryData.invalidYearRequested}
    />
  );
}

function BoardLoadingSkeleton() {
  return (
    <div className="w-full max-w-full animate-pulse space-y-8" data-testid="board-skeleton">
      <div className="h-24 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-72 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}

export default function BoardPage({ searchParams }: BoardPageProps) {
  return (
    <div className="min-h-screen bg-zinc-50/70 py-10 px-4 sm:px-6 lg:px-8 font-sans dark:bg-black w-full max-w-full overflow-x-hidden">
      <div className="mx-auto max-w-7xl w-full">
        {/* Page Header */}
        <header className="mb-8 sm:mb-12 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3.5 py-1 text-xs font-semibold text-blue-900 dark:bg-blue-950 dark:text-blue-300 mb-3 border border-blue-200 dark:border-blue-900">
            <span>🦁 Lions Clubs International District 306</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Executive Board Directory
          </h1>
          <p className="mt-2.5 max-w-3xl text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Our club is guided by dedicated Lion leaders serving the community with pride,
            transparency, and compassion. Filter our directory by Lionistic Year to view current and
            past executive committees.
          </p>
        </header>

        {/* Main Board Directory Container */}
        <main className="w-full max-w-full min-w-0">
          <Suspense fallback={<BoardLoadingSkeleton />}>
            <BoardDirectoryContent searchParams={searchParams} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
