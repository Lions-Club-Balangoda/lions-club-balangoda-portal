'use client';

import React, { useState, useMemo } from 'react';
import type { NewsItem, NewsType } from '../../types/news.ts';
import { NewsCard } from './NewsCard.tsx';
import { filterPublishedNews } from '../../lib/news.ts';

interface NewsListProps {
  initialNews: NewsItem[];
  error?: string;
}

const FILTER_TABS: { label: string; value: NewsType | 'ALL' }[] = [
  { label: 'All Updates', value: 'ALL' },
  { label: 'Announcements', value: 'ANNOUNCEMENT' },
  { label: 'Club News', value: 'NEWS' },
  { label: 'Press Releases', value: 'PRESS_RELEASE' },
];

export function NewsList({ initialNews, error }: NewsListProps) {
  const [selectedType, setSelectedType] = useState<NewsType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNews = useMemo(() => {
    return filterPublishedNews(initialNews, {
      newsType: selectedType,
      query: searchQuery,
    });
  }, [initialNews, selectedType, searchQuery]);

  // Error State Handler
  if (error) {
    return (
      <div
        role="alert"
        className="my-10 rounded-2xl border border-red-200 bg-red-50/70 p-8 text-center dark:border-red-900/50 dark:bg-red-950/30"
      >
        <span className="text-3xl" aria-hidden="true">
          ⚠️
        </span>
        <h3 className="mt-3 text-lg font-bold text-red-900 dark:text-red-300">
          Unable to Load Updates
        </h3>
        <p className="mt-1 text-sm text-red-700 dark:text-red-400">
          We encountered an error loading news items. Please refresh the page or check back shortly.
        </p>
      </div>
    );
  }

  return (
    <section aria-label="News and Announcements Directory" className="space-y-8">
      {/* Controls: Search and Type Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* News Type Tabs */}
        <div
          role="tablist"
          aria-label="Filter by update type"
          className="flex flex-wrap gap-2"
        >
          {FILTER_TABS.map((tab) => {
            const isActive = selectedType === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedType(tab.value)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 cursor-pointer ${
                  isActive
                    ? 'bg-blue-900 text-white shadow-xs dark:bg-amber-500 dark:text-blue-950'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Keyword Search Input */}
        <div className="relative w-full sm:w-72">
          <label htmlFor="news-search" className="sr-only">
            Search news and announcements
          </label>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <input
            id="news-search"
            type="search"
            placeholder="Search news & updates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
      </div>

      {/* Grid of News Cards */}
      {filteredNews.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredNews.map((news) => (
            <NewsCard key={news.id} news={news} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="my-16 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/30">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-zinc-100">
            No News or Announcements Found
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {searchQuery || selectedType !== 'ALL'
              ? 'No updates match your current filter criteria. Try resetting your search or filter.'
              : 'There are currently no published announcements available.'}
          </p>
          {(searchQuery || selectedType !== 'ALL') && (
            <div className="mt-5">
              <button
                type="button"
                onClick={() => {
                  setSelectedType('ALL');
                  setSearchQuery('');
                }}
                className="inline-flex items-center rounded-lg bg-blue-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-800 dark:bg-amber-500 dark:text-blue-950 dark:hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

