'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { UserRole } from '../../../types/rbac';
import type { NewsItem } from '../../../types/news';
import { AdminSidebar } from '../../../components/admin/AdminSidebar';
import { AdminHeader } from '../../../components/admin/AdminHeader';
import { PlusIcon } from '../../../components/admin/AdminIcons';
import { DeleteConfirmModal, UnpublishConfirmModal } from '../../../components/admin/NewsModals';

interface AuthSessionUser {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export default function AdminNewsListPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthSessionUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // News state
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'ALL' | 'NEWS' | 'ANNOUNCEMENT' | 'PRESS_RELEASE' | 'DRAFT' | 'PUBLISHED'>('ALL');

  // Modals state
  const [deleteTarget, setDeleteTarget] = useState<NewsItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [unpublishTarget, setUnpublishTarget] = useState<NewsItem | null>(null);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [unpublishError, setUnpublishError] = useState<string | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Session verification
  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/admin/login?redirect=/admin/news');
          return;
        }
        const data = await res.json();
        if (data.success && data.user) {
          if (isMounted) setCurrentUser(data.user);
        } else {
          router.push('/admin/login?redirect=/admin/news');
        }
      } catch {
        router.push('/admin/login?redirect=/admin/news');
      } finally {
        if (isMounted) setIsLoadingAuth(false);
      }
    }
    void checkAuth();
    return () => {
      isMounted = false;
    };
  }, [router]);

  // 2. Fetch admin news items
  useEffect(() => {
    if (!currentUser) return;
    let isMounted = true;

    async function loadNews() {
      setIsLoadingNews(true);
      setNewsError(null);
      try {
        const res = await fetch('/api/admin/news');
        if (!res.ok) {
          throw new Error('Failed to load news records');
        }
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.data)) {
          setNewsList(data.data);
        }
      } catch {
        if (isMounted) setNewsError('Could not load news records. Please check server connection.');
      } finally {
        if (isMounted) setIsLoadingNews(false);
      }
    }

    void loadNews();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    router.push('/admin/login');
  };

  // Toggle Pinned status
  const handleTogglePin = async (item: NewsItem) => {
    const newPinned = !item.isPinned;
    try {
      const res = await fetch(`/api/admin/news/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: newPinned }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNewsList((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isPinned: newPinned } : n))
        );
        showToast(
          newPinned
            ? `Pinned "${item.title}" to the top of homepage.`
            : `Unpinned "${item.title}".`
        );
      } else {
        showToast(data.error || 'Failed to update pin status', 'error');
      }
    } catch {
      showToast('Network error updating pin status', 'error');
    }
  };

  // Publish / Quick Publish
  const handlePublish = async (item: NewsItem) => {
    try {
      const res = await fetch(`/api/admin/news/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PUBLISHED' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNewsList((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, status: 'PUBLISHED' } : n))
        );
        showToast(`"${item.title}" is now published and live!`);
      } else {
        showToast(data.error || 'Failed to publish article', 'error');
      }
    } catch {
      showToast('Network error while publishing article', 'error');
    }
  };

  // Unpublish (Confirmation action)
  const handleConfirmUnpublish = async () => {
    if (!unpublishTarget) return;
    setIsUnpublishing(true);
    setUnpublishError(null);

    try {
      const res = await fetch(`/api/admin/news/${unpublishTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DRAFT' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNewsList((prev) =>
          prev.map((n) => (n.id === unpublishTarget.id ? { ...n, status: 'DRAFT' } : n))
        );
        showToast(`"${unpublishTarget.title}" has been unpublished and moved to Drafts.`);
        setUnpublishTarget(null);
      } else {
        setUnpublishError(data.error || 'Could not unpublish. Please check your connection.');
      }
    } catch {
      setUnpublishError('Could not unpublish. Please check your connection.');
    } finally {
      setIsUnpublishing(false);
    }
  };

  // Delete (Confirmation action)
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/admin/news/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNewsList((prev) => prev.filter((n) => n.id !== deleteTarget.id));
        showToast(`"${deleteTarget.title}" was permanently deleted.`);
        setDeleteTarget(null);
      } else {
        setDeleteError(data.error || 'Could not delete record. A server error occurred.');
      }
    } catch {
      setDeleteError('Could not delete record. A server error occurred.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered news items
  const filteredNews = newsList.filter((item) => {
    // 1. Tab filter
    if (selectedTab === 'NEWS' && item.newsType !== 'NEWS') return false;
    if (selectedTab === 'ANNOUNCEMENT' && item.newsType !== 'ANNOUNCEMENT') return false;
    if (selectedTab === 'PRESS_RELEASE' && item.newsType !== 'PRESS_RELEASE') return false;
    if (selectedTab === 'DRAFT' && item.status !== 'DRAFT') return false;
    if (selectedTab === 'PUBLISHED' && item.status !== 'PUBLISHED') return false;

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSummary = item.summary ? item.summary.toLowerCase().includes(q) : false;
      if (!matchTitle && !matchSummary) return false;
    }

    return true;
  });

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
      {/* Sidebar */}
      <AdminSidebar
        role={currentUser?.role}
        currentPath="/admin/news"
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          user={currentUser}
          pageTitle="Club News & Announcements"
          onToggleMobile={() => setIsMobileNavOpen((prev) => !prev)}
          onSignOut={handleSignOut}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Header & New Article CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                Club News & Announcements
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Manage club news, press releases, and priority announcements shown on the public portal.
              </p>
            </div>

            <Link
              href="/admin/news/create"
              data-testid="create-news-button"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 shrink-0"
            >
              <PlusIcon className="w-5 h-5 stroke-[2.5]" />
              <span>+ New Article</span>
            </Link>
          </div>

          {/* Toast Notification Banner */}
          {toastMessage && (
            <div
              role="alert"
              data-testid="news-toast-banner"
              className={`mb-6 p-4 rounded-xl flex items-center justify-between gap-3 text-sm font-semibold shadow-md animate-in slide-in-from-top-2 ${
                toastMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}
            >
              <span>{toastMessage.text}</span>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="text-xs font-bold opacity-70 hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          )}

          {/* Filter Bar: Tabs & Search */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 mb-6 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {(
                [
                  { id: 'ALL', label: 'All Items' },
                  { id: 'NEWS', label: 'News' },
                  { id: 'ANNOUNCEMENT', label: 'Announcements' },
                  { id: 'PRESS_RELEASE', label: 'Press Releases' },
                  { id: 'PUBLISHED', label: 'Published' },
                  { id: 'DRAFT', label: 'Drafts' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedTab === tab.id
                      ? 'bg-blue-950 text-white dark:bg-amber-500 dark:text-blue-950'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Keyword Search */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3.5 py-2 pl-9 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
            {isLoadingNews ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
                <p className="text-sm text-zinc-500">Loading articles...</p>
              </div>
            ) : newsError ? (
              <div className="p-8 text-center">
                <p className="text-red-600 dark:text-red-400 text-sm font-semibold mb-3">{newsError}</p>
                <button
                  type="button"
                  onClick={() => router.refresh()}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  Retry Loading
                </button>
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="py-16 px-4 text-center" data-testid="news-empty-state">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3 text-xl">
                  📰
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">No news records found</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1 mb-5">
                  {searchQuery || selectedTab !== 'ALL'
                    ? 'No news articles match your current search and filter settings.'
                    : 'Start publishing community updates, announcements, and press releases for club activities.'}
                </p>
                <Link
                  href="/admin/news/create"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold text-xs shadow-xs"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>+ Create First Article</span>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm" data-testid="news-admin-table">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">Article</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">Pin Status</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {filteredNews.map((item) => (
                      <tr
                        key={item.id}
                        data-testid={`news-row-${item.id}`}
                        className="hover:bg-zinc-50/75 dark:hover:bg-zinc-800/40 transition-colors"
                      >
                        {/* Article Title & Cover Thumbnail */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0 overflow-hidden border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-xs text-zinc-400 font-bold">
                              {item.coverImageUrl ? (
                                <img
                                  src={item.coverImageUrl}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>📰</span>
                              )}
                            </div>
                            <div className="min-w-0 max-w-xs sm:max-w-md">
                              <Link
                                href={`/admin/news/${item.id}`}
                                className="font-bold text-zinc-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 truncate block text-sm"
                              >
                                {item.title}
                              </Link>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                                {item.summary || 'No summary provided'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Type Badge */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                            {item.newsType === 'PRESS_RELEASE'
                              ? 'Press Release'
                              : item.newsType === 'ANNOUNCEMENT'
                              ? 'Announcement'
                              : 'News'}
                          </span>
                        </td>

                        {/* Pin Status Toggle */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleTogglePin(item)}
                            title={item.isPinned ? 'Click to unpin' : 'Click to pin to homepage'}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              item.isPinned
                                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 ring-1 ring-amber-300 dark:ring-amber-800'
                                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            }`}
                          >
                            <span>📌</span>
                            <span>{item.isPinned ? 'Pinned' : 'Normal'}</span>
                          </button>
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {item.status === 'PUBLISHED' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                              ● Published
                            </span>
                          ) : item.status === 'DRAFT' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                              ● Draft
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400">
                              ● Archived
                            </span>
                          )}
                        </td>

                        {/* Published Date */}
                        <td className="py-4 px-4 whitespace-nowrap text-xs text-zinc-500 dark:text-zinc-400">
                          {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'Unpublished'}
                        </td>

                        {/* Row Actions */}
                        <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            {/* View */}
                            <Link
                              href={`/admin/news/${item.id}`}
                              className="px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                              View
                            </Link>

                            {/* Edit */}
                            <Link
                              href={`/admin/news/${item.id}/edit`}
                              className="px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                            >
                              Edit
                            </Link>

                            {/* Publish / Unpublish Toggle */}
                            {item.status === 'PUBLISHED' ? (
                              <button
                                type="button"
                                onClick={() => setUnpublishTarget(item)}
                                className="px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                              >
                                Unpublish
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handlePublish(item)}
                                className="px-2.5 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                              >
                                Publish
                              </button>
                            )}

                            {/* Delete (Strictly Admin only) */}
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(item)}
                                className="px-2.5 py-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* SCR-19: Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        itemTitle={deleteTarget?.title || ''}
        itemType="news article"
        isDeleting={isDeleting}
        errorMessage={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
      />

      {/* SCR-20: Unpublish Confirmation Modal */}
      <UnpublishConfirmModal
        isOpen={Boolean(unpublishTarget)}
        itemTitle={unpublishTarget?.title || ''}
        itemType="news article"
        isUnpublishing={isUnpublishing}
        errorMessage={unpublishError}
        onConfirm={handleConfirmUnpublish}
        onCancel={() => {
          setUnpublishTarget(null);
          setUnpublishError(null);
        }}
      />
    </div>
  );
}
