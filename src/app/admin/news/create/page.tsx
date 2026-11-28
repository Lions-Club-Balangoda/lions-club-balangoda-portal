'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { UserRole } from '../../../../types/rbac';
import type { NewsType } from '../../../../types/news';
import { AdminSidebar } from '../../../../components/admin/AdminSidebar';
import { AdminHeader } from '../../../../components/admin/AdminHeader';

interface AuthSessionUser {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export default function AdminNewsCreatePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthSessionUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Form Fields (SCR-08)
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugCustom, setIsSlugCustom] = useState(false);
  const [newsType, setNewsType] = useState<NewsType>('NEWS');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [expireDate, setExpireDate] = useState('');

  // Submission & Validation States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Auto-generate slug from title unless manually edited
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!isSlugCustom) {
      const generated = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      setSlug(generated);
    }
  };

  // 1. Session verification
  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/admin/login?redirect=/admin/news/create');
          return;
        }
        const data = await res.json();
        if (data.success && data.user) {
          if (isMounted) setCurrentUser(data.user);
        } else {
          router.push('/admin/login?redirect=/admin/news/create');
        }
      } catch {
        router.push('/admin/login?redirect=/admin/news/create');
      } finally {
        if (isMounted) setIsLoadingAuth(false);
      }
    }
    void checkAuth();
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleSignOut = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    router.push('/admin/login');
  };

  // Submit Handler
  const handleSubmit = async (targetStatus: 'DRAFT' | 'PUBLISHED') => {
    setFieldErrors({});
    setGeneralError(null);

    // Client-side quick check
    const errors: Record<string, string> = {};
    if (!title.trim()) {
      errors.title = 'News headline/title is required.';
    } else if (title.trim().length < 5) {
      errors.title = 'Title must be at least 5 characters long.';
    } else if (title.trim().length > 200) {
      errors.title = 'Title must not exceed 200 characters.';
    }

    if (!content.trim()) {
      errors.content = 'Article body content is required.';
    }

    if (expireDate) {
      const parsed = new Date(expireDate);
      if (isNaN(parsed.getTime())) {
        errors.expireDate = 'Invalid auto-unpin expiration date.';
      } else if (parsed.getTime() <= Date.now()) {
        errors.expireDate = 'Auto-unpin date must be set to a future date.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        newsType,
        coverImageUrl: coverImageUrl.trim() || null,
        summary: summary.trim(),
        content,
        isPinned,
        expireDate: expireDate ? new Date(expireDate).toISOString() : null,
        status: targetStatus,
      };

      const res = await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Success redirect
        router.push('/admin/news');
        router.refresh();
      } else {
        if (data.errors) {
          setFieldErrors(data.errors);
        }
        setGeneralError(data.error || 'Failed to save news article.');
      }
    } catch {
      setGeneralError('Network error while saving news article. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingAuth) {
    return (
      <div data-testid="admin-auth-loading" className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Verifying officer session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col md:flex-row">
      <AdminSidebar
        role={currentUser?.role}
        currentPath="/admin/news"
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          user={currentUser}
          pageTitle="Create News Article"
          onToggleMobile={() => setIsMobileNavOpen((prev) => !prev)}
          onSignOut={handleSignOut}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <li>
                <Link href="/admin" className="hover:text-amber-600 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/admin/news" className="hover:text-amber-600 transition-colors">
                  News &amp; Announcements
                </Link>
              </li>
              <li>/</li>
              <li className="text-zinc-900 dark:text-white font-bold" aria-current="page">
                New Article
              </li>
            </ol>
          </nav>

          {/* Page Heading */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              Create New Article or Announcement
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Draft or immediately publish a news release, bulletin, or pinned homepage announcement.
            </p>
          </div>

          {/* Error Banner */}
          {generalError && (
            <div
              role="alert"
              className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 text-sm font-semibold flex items-center justify-between"
            >
              <span>{generalError}</span>
              <button
                type="button"
                onClick={() => setGeneralError(null)}
                className="text-xs font-bold opacity-75 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          )}

          {/* Create Form Container */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSubmit('DRAFT');
              }}
              className="space-y-6"
            >
              {/* Title & News Type Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-2">
                  <label htmlFor="news-title" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                    Article Headline / Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="news-title"
                    type="text"
                    required
                    maxLength={200}
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="e.g. Annual Blood Donation Camp 2026"
                    className={`w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 border ${
                      fieldErrors.title
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-zinc-200 dark:border-zinc-700 focus:ring-amber-500'
                    } text-zinc-900 dark:text-white focus:outline-none focus:ring-2`}
                  />
                  {fieldErrors.title && (
                    <p className="mt-1 text-xs text-red-600 font-semibold" data-testid="error-title">
                      {fieldErrors.title}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-zinc-400">Must be 5 to 200 characters.</p>
                </div>

                <div>
                  <label htmlFor="news-type" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="news-type"
                    value={newsType}
                    onChange={(e) => setNewsType(e.target.value as NewsType)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="NEWS">News Article</option>
                    <option value="ANNOUNCEMENT">Club Announcement</option>
                    <option value="PRESS_RELEASE">Press Release</option>
                  </select>
                </div>
              </div>

              {/* URL Slug & Header Image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="news-slug" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                    URL Slug
                  </label>
                  <input
                    id="news-slug"
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setIsSlugCustom(true);
                    }}
                    placeholder="annual-blood-donation-2026"
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="mt-1 text-[11px] text-zinc-400">Public URL: /news/{slug || '...'}</p>
                </div>

                <div>
                  <label htmlFor="news-cover" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                    Featured Header Image (URL)
                  </label>
                  <input
                    id="news-cover"
                    type="url"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/.../cover.jpg"
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {fieldErrors.coverImageUrl && (
                    <p className="mt-1 text-xs text-red-600 font-semibold">{fieldErrors.coverImageUrl}</p>
                  )}
                </div>
              </div>

              {/* Short Summary */}
              <div>
                <label htmlFor="news-summary" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                  Short Summary / Lead Paragraph
                </label>
                <textarea
                  id="news-summary"
                  rows={2}
                  maxLength={500}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="A concise 1-2 sentence lead paragraph shown on article cards and search results..."
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <div className="flex justify-between mt-1 text-[11px] text-zinc-400">
                  <span>Displayed on homepage carousel &amp; news list</span>
                  <span>{summary.length}/500</span>
                </div>
              </div>

              {/* Body Content (Rich Content / Markdown) */}
              <div>
                <label htmlFor="news-content" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                  Article Body Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="news-content"
                  rows={8}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write the full news announcement content here. Basic HTML formatting tags (<p>, <strong>, <em>, <ul>, <li>) are supported and sanitized against XSS."
                  className={`w-full px-4 py-3 rounded-xl text-sm font-mono bg-zinc-50 dark:bg-zinc-800 border ${
                    fieldErrors.content
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-zinc-200 dark:border-zinc-700 focus:ring-amber-500'
                  } text-zinc-900 dark:text-white focus:outline-none focus:ring-2 leading-relaxed`}
                />
                {fieldErrors.content && (
                  <p className="mt-1 text-xs text-red-600 font-semibold" data-testid="error-content">
                    {fieldErrors.content}
                  </p>
                )}
                <p className="mt-1 text-[11px] text-zinc-400">
                  Stored safely; executable scripts and malicious handlers are stripped automatically (SEC-02, SEC-03).
                </p>
              </div>

              {/* Pinning & Auto-Unpin Section */}
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-sm font-bold text-zinc-900 dark:text-white">
                      Pin to Top of Homepage
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      Gives this article prominent top placement in the homepage announcements carousel.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPinned}
                      onChange={(e) => setIsPinned(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
                  </label>
                </div>

                <div>
                  <label htmlFor="news-expire" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Auto-Unpin Date (Optional)
                  </label>
                  <input
                    id="news-expire"
                    type="date"
                    value={expireDate}
                    onChange={(e) => setExpireDate(e.target.value)}
                    className="px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {fieldErrors.expireDate && (
                    <p className="mt-1 text-xs text-red-600 font-semibold" data-testid="error-expire-date">
                      {fieldErrors.expireDate}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-zinc-400">
                    The article will automatically unpin from the homepage after this date. Must be in the future.
                  </p>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <Link
                  href="/admin/news"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors w-full sm:w-auto text-center"
                >
                  Cancel
                </Link>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => void handleSubmit('DRAFT')}
                    data-testid="save-draft-button"
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-sm font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                  >
                    Save as Draft
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => void handleSubmit('PUBLISHED')}
                    data-testid="publish-now-button"
                    className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-sm font-bold text-blue-950 bg-amber-500 hover:bg-amber-400 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-blue-950/30 border-t-blue-950 rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Publish Now'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
