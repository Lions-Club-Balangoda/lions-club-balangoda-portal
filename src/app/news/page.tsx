import React from 'react';
import type { Metadata } from 'next';
import { NewsList } from '../../components/news/NewsList.tsx';
import { getPublishedNewsFromDb } from '../../lib/news-repository.ts';

export const metadata: Metadata = {
  title: 'News & Announcements | Lions Club of Balangoda',
  description:
    'Stay updated with official news, press releases, and upcoming community activities from the Lions Club of Balangoda (District 306).',
};

export default function NewsPage() {
  const publishedNews = getPublishedNewsFromDb();

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-black py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <header className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-900 dark:bg-blue-950 dark:text-blue-300 mb-3">
            <span>🦁 Lions Clubs International District 306</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            News & Announcements
          </h1>
          <p className="mt-3 max-w-3xl text-base text-zinc-600 dark:text-zinc-400">
            Read the latest updates, event briefings, and humanitarian impact reports directly from
            the Lions Club of Balangoda secretariat.
          </p>
        </header>

        {/* Public News Directory Slice */}
        <main>
          <NewsList initialNews={publishedNews} />
        </main>
      </div>
    </div>
  );
}
