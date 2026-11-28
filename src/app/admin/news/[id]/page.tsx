'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import type { UserRole } from '../../../../types/rbac';
import type { NewsItem } from '../../../../types/news';
import { AdminSidebar } from '../../../../components/admin/AdminSidebar';
import { AdminHeader } from '../../../../components/admin/AdminHeader';
import { DeleteConfirmModal, UnpublishConfirmModal } from '../../../../components/admin/NewsModals';

interface AuthSessionUser {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export default function AdminNewsDetailPage() {
  const router = useRouter();
  const params = useParams();
  const newsId = typeof params?.id === 'string' ? params.id : '';

  const [currentUser, setCurrentUser] = useState<AuthSessionUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Article state
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
          router.push(`/admin/login?redirect=/admin/news/${newsId}`);
          return;
        }
        const data = await res.json();
        if (data.success && data.user) {
          if (isMounted) setCurrentUser(data.user);
        } else {
          router.push(`/admin/login?redirect=/admin/news/${newsId}`);
        }
      } catch {
        router.push(`/admin/login?redirect=/admin/news/${newsId}`);
      } finally {
        if (isMounted) setIsLoadingAuth(false);
      }
    }
    void checkAuth();
    return () => {
      isMounted = false;
    };
  }, [router, newsId]);

  // Load news item
  useEffect(() => {
    if (!currentUser || !newsId) return;
    let isMounted = true;

    async function loadItem() {
      setIsLoadingNews(true);
      setErrorMessage(null);
      try {
        const res = await fetch(`/api/admin/news/${newsId}`);
        if (!res.ok) {
          if (res.status === 404) {
            setErrorMessage('The requested news article was not found.');
          } else {
            setErrorMessage('Failed to load news article details.');
          }
          return;
        }
        const data = await res.json();
        if (isMounted && data.success && data.data) {
          setNewsItem(data.data);
        }
      } catch {
        if (isMounted) setErrorMessage('Could not connect to the server.');
      } finally {
        if (isMounted) setIsLoadingNews(false);
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

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!newsItem) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/admin/news/${newsItem.id}`, { method: 'DELETE' });
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
    if (!newsItem) return;
    setIsUnpublishing(true);
    setUnpublishError(null);

    try {
      const res = await fetch(`/api/admin/news/${newsItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DRAFT' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNewsItem((prev) => (prev ? { ...prev, status: 'DRAFT' } : null));
        setIsUnpublishModalOpen(false);
      } else {
        setUnpublishError(data.error || 'Failed to unpublish article.');
      }
    } catch {
      setUnpublishError('Network error while unpublishing article.');
    } finally {
      setIsUnpublishing(false);
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
          pageTitle="News Details & Preview"
          onToggleMobile={() => setIsMobileNavOpen((prev) => !prev)}
          onSignOut={handleSignOut}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto">
          {/* Breadcrumbs */}
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
              <li className="text-zinc-900 dark:text-white font-bold truncate max-w-xs" aria-current="page">
                {newsItem?.title || 'Article Detail'}
              </li>
            </ol>
          </nav>

          {isLoadingNews ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
              <p className="text-sm text-zinc-500">Loading article details...</p>
            </div>
          ) : errorMessage || !newsItem ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-red-600 dark:text-red-400 text-sm font-semibold mb-4">
                {errorMessage || 'Article not found.'}
              </p>
              <Link
                href="/admin/news"
                className="px-4 py-2 text-xs font-bold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              >
                ← Back to News List
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-xs">
                <Link
                  href="/admin/news"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  ← Back to News List
                </Link>

                <div className="flex items-center gap-2.5">
                  {/* Public link if published */}
                  {newsItem.status === 'PUBLISHED' && (
                    <Link
                      href={`/news/${newsItem.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 text-xs font-bold rounded-xl text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-900 transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>Public View ↗</span>
                    </Link>
                  )}

                  {/* Unpublish button if published */}
                  {newsItem.status === 'PUBLISHED' ? (
                    <button
                      type="button"
                      onClick={() => setIsUnpublishModalOpen(true)}
                      className="px-3.5 py-1.5 text-xs font-bold rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-colors"
                    >
                      Unpublish
                    </button>
                  ) : null}

                  {/* Edit button */}
                  <Link
                    href={`/admin/news/${newsItem.id}/edit`}
                    className="px-4 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-blue-950 shadow-xs transition-colors"
                  >
                    Edit Article
                  </Link>

                  {/* Delete button (Admin only) */}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="px-3.5 py-1.5 text-xs font-bold rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {/* Pin Banner */}
              {newsItem.isPinned && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📌</span>
                    <span>This announcement is pinned to the top of the public homepage.</span>
                  </div>
                  {newsItem.expireDate && (
                    <span className="text-[11px] opacity-80">
                      Auto-unpins on: {new Date(newsItem.expireDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}

              {/* Article Main Card */}
              <article className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
                {newsItem.coverImageUrl && (
                  <div className="h-64 sm:h-80 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <img
                      src={newsItem.coverImageUrl}
                      alt={newsItem.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6 sm:p-8">
                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-semibold">
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                      {newsItem.newsType === 'PRESS_RELEASE'
                        ? 'Press Release'
                        : newsItem.newsType === 'ANNOUNCEMENT'
                        ? 'Announcement'
                        : 'News Article'}
                    </span>

                    {newsItem.status === 'PUBLISHED' ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                        ● Published
                      </span>
                    ) : newsItem.status === 'DRAFT' ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                        ● Draft
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400">
                        ● Archived
                      </span>
                    )}

                    <span className="text-zinc-400">•</span>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {newsItem.authorName || 'Lions Club Balangoda'}
                    </span>
                    <span className="text-zinc-400">•</span>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {newsItem.publishedAt
                        ? `Published: ${new Date(newsItem.publishedAt).toLocaleDateString()}`
                        : `Created: ${new Date(newsItem.createdAt).toLocaleDateString()}`}
                    </span>
                  </div>

                  {/* Headline */}
                  <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight mb-4">
                    {newsItem.title}
                  </h1>

                  {/* Summary */}
                  {newsItem.summary && (
                    <p className="text-base font-medium text-zinc-600 dark:text-zinc-300 border-l-4 border-amber-500 pl-4 py-1 mb-6">
                      {newsItem.summary}
                    </p>
                  )}

                  {/* Article Content */}
                  <div
                    className="prose dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 text-sm leading-relaxed border-t border-zinc-200 dark:border-zinc-800 pt-6"
                    dangerouslySetInnerHTML={{ __html: newsItem.content }}
                  />
                </div>
              </article>
            </div>
          )}
        </main>
      </div>

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        itemTitle={newsItem?.title || ''}
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
        itemTitle={newsItem?.title || ''}
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
