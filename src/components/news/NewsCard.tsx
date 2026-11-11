import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { NewsItem, NewsType } from '../../types/news.ts';
import { formatNewsDate } from '../../lib/news.ts';

interface NewsCardProps {
  news: NewsItem;
}

function getBadgeStyle(type: NewsType): { bg: string; text: string; label: string } {
  switch (type) {
    case 'ANNOUNCEMENT':
      return {
        bg: 'bg-amber-100 dark:bg-amber-950/70 border-amber-300 dark:border-amber-700/60',
        text: 'text-amber-900 dark:text-amber-300',
        label: 'Announcement',
      };
    case 'PRESS_RELEASE':
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700/60',
        text: 'text-emerald-900 dark:text-emerald-300',
        label: 'Press Release',
      };
    case 'NEWS':
    default:
      return {
        bg: 'bg-blue-100 dark:bg-blue-950/70 border-blue-300 dark:border-blue-700/60',
        text: 'text-blue-900 dark:text-blue-300',
        label: 'Club News',
      };
  }
}

export function NewsCard({ news }: NewsCardProps) {
  const badge = getBadgeStyle(news.newsType);
  const formattedDate = formatNewsDate(news.publishedAt);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-amber-400/80 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      {/* Cover Image or Fallback Header */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {news.coverImageUrl ? (
          <Image
            src={news.coverImageUrl}
            alt={news.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-950 to-blue-900 text-amber-400">
            <span className="text-4xl" aria-hidden="true">
              🦁
            </span>
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-tight shadow-xs backdrop-blur-xs ${badge.bg} ${badge.text}`}
          >
            {badge.label}
          </span>
          {news.isPinned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-extrabold text-blue-950 shadow-xs">
              <span aria-hidden="true">📌</span> Pinned
            </span>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div className="space-y-3">
          {/* Publication Date */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <svg
              className="h-3.5 w-3.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>
            <time dateTime={news.publishedAt}>{formattedDate}</time>
          </div>

          {/* Title */}
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 group-hover:text-blue-900 dark:text-zinc-100 dark:group-hover:text-amber-400 sm:text-xl line-clamp-2">
            <Link
              href={`/news/${news.slug}`}
              className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 rounded-sm"
            >
              {news.title}
            </Link>
          </h2>

          {/* Summary Snippet */}
          <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-3 leading-relaxed">
            {news.summary}
          </p>
        </div>

        {/* Read Article Link */}
        <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <Link
            href={`/news/${news.slug}`}
            className="inline-flex items-center gap-1 text-sm font-bold text-blue-900 group-hover:gap-2 transition-all hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
            aria-label={`Read full article: ${news.title}`}
          >
            <span>Read full story</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
