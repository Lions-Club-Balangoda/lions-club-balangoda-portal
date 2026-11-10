import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPublishedNewsBySlugFromDb } from '../../../lib/news-repository.ts';
import { formatNewsDate } from '../../../lib/news.ts';

interface NewsDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: NewsDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const news = getPublishedNewsBySlugFromDb(slug);

  if (!news || news.status !== 'PUBLISHED') {
    return {
      title: 'Article Not Found | Lions Club of Balangoda',
    };
  }

  return {
    title: `${news.title} | Lions Club of Balangoda`,
    description: news.summary,
  };
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = await params;
  const news = getPublishedNewsBySlugFromDb(slug);

  // Strict AC-2 security: If article does not exist or is DRAFT/UNPUBLISHED, 404 immediately
  if (!news || news.status !== 'PUBLISHED') {
    notFound();
  }

  const formattedDate = formatNewsDate(news.publishedAt);

  return (
    <article className="min-h-screen bg-zinc-50/60 dark:bg-black py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Navigation Breadcrumb / Back Link */}
        <div>
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-900 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 rounded-sm"
          >
            <span aria-hidden="true">←</span>
            <span>Back to All Updates</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300">
              {news.newsType}
            </span>
            {news.isPinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-blue-950">
                <span aria-hidden="true">📌</span> Pinned
              </span>
            )}
            <span className="text-xs text-zinc-500 dark:text-zinc-400">•</span>
            <time
              dateTime={news.publishedAt}
              className="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
            >
              {formattedDate}
            </time>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl lg:text-5xl leading-tight">
            {news.title}
          </h1>

          {news.authorName && (
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Published by <span className="text-zinc-900 dark:text-zinc-200 font-semibold">{news.authorName}</span>
            </p>
          )}

          {/* Lead Summary */}
          <div className="rounded-xl border-l-4 border-amber-500 bg-amber-50/60 p-4 text-base font-medium text-zinc-800 dark:bg-amber-950/20 dark:text-zinc-200">
            {news.summary}
          </div>
        </header>

        {/* Featured Cover Image */}
        {news.coverImageUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-zinc-200/80 shadow-md dark:border-zinc-800">
            <Image
              src={news.coverImageUrl}
              alt={news.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
            />
          </div>
        )}

        {/* Article Body Content (Sanitized) */}
        <div
          className="prose prose-zinc dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: news.content }}
        />

        {/* Footer Attribution */}
        <footer className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <div>
            <span>Lions Clubs International District 306 • Balangoda Secretariat</span>
          </div>
          <div>
            <Link
              href="/news"
              className="text-blue-900 hover:text-amber-600 dark:text-amber-400 font-bold"
            >
              ← Return to News Directory
            </Link>
          </div>
        </footer>
      </div>
    </article>
  );
}

