'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import type { UserRole } from '../../../../../types/rbac';
import type { NewsType, ContentStatus } from '../../../../../types/news';
import { AdminSidebar } from '../../../../../components/admin/AdminSidebar';
import { AdminHeader } from '../../../../../components/admin/AdminHeader';
import { DeleteConfirmModal, UnpublishConfirmModal } from '../../../../../components/admin/NewsModals';

interface AuthSessionUser {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export default function AdminNewsEditPage() {
  const router = useRouter();
  const params = useParams();
  const newsId = typeof params?.id === 'string' ? params.id : '';

  const [currentUser, setCurrentUser] = useState<AuthSessionUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Form Fields (SCR-09)
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [newsType, setNewsType] = useState<NewsType>('NEWS');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [expireDate, setExpireDate] = useState('');
  const [status, setStatus] = useState<ContentStatus>('DRAFT');

  // Loading & Submission States
  const [isLoadingItem, setIsLoadingItem] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Modals state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [isUnpublishModalOpen, setIsUnpublishModalOpen] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [unpublishError, setUnpublishError] = useState<string | null>(null);

  // Session verification
  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push(`/admin/login?redirect=/admin/news/${newsId}/edit`);
          return;
        }
        const data = await res.json();
        if (data.success && data.user) {
          if (isMounted) setCurrentUser(data.user);
        } else {
          router.push(`/admin/login?redirect=/admin/news/${newsId}/edit`);
        }
      } catch {
        router.push(`/admin/login?redirect=/admin/news/${newsId}/edit`);
      } finally {
        if (isMounted) setIsLoadingAuth(false);
      }
    }
    void checkAuth();
    return () => {
      isMounted = false;
    };
  }, [router, newsId]);

  // Load existing news item
  useEffect(() => {
    if (!currentUser || !newsId) return;
    let isMounted = true;

    async function loadItem() {
      setIsLoadingItem(true);
      setGeneralError(null);
      try {
        const res = await fetch(`/api/admin/news/${newsId}`);
        if (!res.ok) {
          throw new Error('Failed to load news article.');
        }
        const data = await res.json();
        if (isMounted && data.success && data.data) {
          const item = data.data;
          setTitle(item.title || '');
          setSlug(item.slug || '');
          setNewsType(item.newsType || 'NEWS');
          setCoverImageUrl(item.coverImageUrl || '');
          setSummary(item.summary || '');
          setContent(item.content || '');
          setIsPinned(Boolean(item.isPinned));
          setStatus(item.status || 'DRAFT');
          if (item.expireDate) {
            setExpireDate(item.expireDate.split('T')[0]);
          }
        }
      } catch {
        if (isMounted) setGeneralError('Could not load article for editing.');
      } finally {
        if (isMounted) setIsLoadingItem(false);
      }
    }

    void loadItem();
    return () => {
      isMounted = false;
    };
  }, [currentUser, newsId]);

  const handleSignOut = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    router.push('/admin/login');
  };

  // Submit Handler
  const handleSubmit = async (overrideStatus?: ContentStatus) => {
    setFieldErrors({});
    setGeneralError(null);

    const targetStatus = overrideStatus || status;

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

      const res = await fetch(`/api/admin/news/${newsId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push(`/admin/news/${newsId}`);
        router.refresh();
      } else {
        if (data.errors) {
          setFieldErrors(data.errors);
        }
        setGeneralError(data.error || 'Failed to update news article.');
      }
    } catch {
      setGeneralError('Network error while updating news article. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/news/${newsId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/admin/news');
        router.refresh();
      } else {
        setDeleteError(data.error || 'Failed to delete news article.');
      }
    } catch {
      setDeleteError('Network error while deleting news article.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Confirm Unpublish
  const handleConfirmUnpublish = async () => {
    setIsUnpublishing(true);
    setUnpublishError(null);
    try {
      const res = await fetch(`/api/admin/news/${newsId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DRAFT' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('DRAFT');
        setIsUnpublishModalOpen(false);
        router.push(`/admin/news/${newsId}`);
      } else {
        setUnpublishError(data.error || 'Failed to unpublish article.');
      }
    } catch {
      setUnpublishError('Network error while unpublishing article.');
    } finally {
      setIsUnpublishing(false);
    }
  };

  if (isLoadingAuth || isLoadingItem) {
    return (
      <div data-testid="admin-auth-loading" className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Loading article editor...</p>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser?.role === 'ADMIN';

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
          pageTitle="Edit News Article"
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
              <li>
                <Link href={`/admin/news/${newsId}`} className="hover:text-amber-600 transition-colors truncate max-w-xs">
                  {title || 'Article'}
                </Link>
              </li>
              <li>/</li>
              <li className="text-zinc-900 dark:text-white font-bold" aria-current="page">
                Edit
              </li>
            </ol>
          </nav>

          {/* Heading & Meta */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                Edit Article: &ldquo;{title}&rdquo;
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Modify content, update pinning status, publish or unpublish this article.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {status === 'PUBLISHED' ? (
                <button
                  type="button"
                  onClick={() => setIsUnpublishModalOpen(true)}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-colors"
                >
                  Unpublish
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => void handleSubmit('PUBLISHED')}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 transition-colors"
                >
                  Publish Article
                </button>
              )}

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

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

          {/* Form */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSubmit();
              }}
              className="space-y-6"
            >
              {/* Title & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-2">
                  <label htmlFor="edit-title" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                    Article Headline / Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="edit-title"
                    type="text"
                    required
                    maxLength={200}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 border ${
                      fieldErrors.title
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-zinc-200 dark:border-zinc-700 focus:ring-amber-500'
                    } text-zinc-900 dark:text-white focus:outline-none focus:ring-2`}
                  />
                  {fieldErrors.title && (
                    <p className="mt-1 text-xs text-red-600 font-semibold">{fieldErrors.title}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="edit-type" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="edit-type"
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

              {/* Slug & Cover Image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="edit-slug" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                    URL Slug
                  </label>
                  <input
                    id="edit-slug"
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label htmlFor="edit-cover" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                    Featured Header Image (URL)
                  </label>
                  <input
                    id="edit-cover"
                    type="url"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Summary */}
              <div>
                <label htmlFor="edit-summary" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                  Short Summary / Lead Paragraph
                </label>
                <textarea
                  id="edit-summary"
                  rows={2}
                  maxLength={500}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Body Content */}
              <div>
                <label htmlFor="edit-content" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                  Article Body Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="edit-content"
                  rows={8}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-mono bg-zinc-50 dark:bg-zinc-800 border ${
                    fieldErrors.content
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-zinc-200 dark:border-zinc-700 focus:ring-amber-500'
                  } text-zinc-900 dark:text-white focus:outline-none focus:ring-2 leading-relaxed`}
                />
                {fieldErrors.content && (
                  <p className="mt-1 text-xs text-red-600 font-semibold">{fieldErrors.content}</p>
                )}
              </div>

              {/* Pinning & Auto-Unpin */}
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-sm font-bold text-zinc-900 dark:text-white">
                      Pin to Top of Homepage
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      Feature this announcement in the top banner of the public website.
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
                  <label htmlFor="edit-expire" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Auto-Unpin Date (Optional)
                  </label>
                  <input
                    id="edit-expire"
                    type="date"
                    value={expireDate}
                    onChange={(e) => setExpireDate(e.target.value)}
                    className="px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {fieldErrors.expireDate && (
                    <p className="mt-1 text-xs text-red-600 font-semibold">{fieldErrors.expireDate}</p>
                  )}
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <Link
                  href={`/admin/news/${newsId}`}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors w-full sm:w-auto text-center"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  data-testid="save-changes-button"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold text-blue-950 bg-amber-500 hover:bg-amber-400 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-blue-950/30 border-t-blue-950 rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        itemTitle={title}
        itemType="news article"
        isDeleting={isDeleting}
        errorMessage={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeleteError(null);
        }}
      />

      {/* Unpublish Modal */}
      <UnpublishConfirmModal
        isOpen={isUnpublishModalOpen}
        itemTitle={title}
        itemType="news article"
        isUnpublishing={isUnpublishing}
        errorMessage={unpublishError}
        onConfirm={handleConfirmUnpublish}
        onCancel={() => {
          setIsUnpublishModalOpen(false);
          setUnpublishError(null);
        }}
      />
    </div>
  );
}
