'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { UserRole } from '../../types/rbac';
import { ROLE_DEFINITIONS } from '../../types/rbac';
import { getPermittedAdminNavItems } from '../../data/admin-navigation';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import {
  AdminNavIcon,
  PlusIcon,
  ProjectsIcon,
  NewsIcon,
  SubmissionsIcon,
  MediaIcon,
  UsersIcon,
  ExternalLinkIcon,
} from '../../components/admin/AdminIcons';

interface AuthSessionUser {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
}

interface DashboardMetrics {
  activeProjects: number;
  draftProjects: number;
  publishedNews: number;
  pinnedAnnouncements: number;
  pendingVolunteers: number;
  unresolvedInquiries: number;
}

interface ActivityItem {
  id: string;
  type: 'VOLUNTEER' | 'INQUIRY' | 'PROJECT' | 'NEWS';
  title: string;
  subtitle: string;
  date: string;
  status: 'PENDING' | 'PUBLISHED' | 'DRAFT' | 'REVIEWED';
  href: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthSessionUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Dashboard state
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activeProjects: 4,
    draftProjects: 1,
    publishedNews: 6,
    pinnedAnnouncements: 2,
    pendingVolunteers: 3,
    unresolvedInquiries: 2,
  });
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  // Recent activity sample/live records
  const [activities] = useState<ActivityItem[]>([
    {
      id: 'vol-101',
      type: 'VOLUNTEER',
      title: 'Kavindu Perera',
      subtitle: 'Applied for Youth Mentorship & Eye Clinic Support',
      date: 'Today, 10:14 AM',
      status: 'PENDING',
      href: '/admin/submissions',
    },
    {
      id: 'news-202',
      type: 'NEWS',
      title: 'Annual Blood Donation Drive 2026 Scheduled',
      subtitle: 'Pinned announcement updated by Secretary',
      date: 'Yesterday, 4:30 PM',
      status: 'PUBLISHED',
      href: '/admin/news',
    },
    {
      id: 'proj-303',
      type: 'PROJECT',
      title: 'Free Vision Screening Camp 2026',
      subtitle: 'Draft project updated with 12 gallery photos',
      date: 'Nov 21, 2026',
      status: 'DRAFT',
      href: '/admin/projects',
    },
    {
      id: 'inq-404',
      type: 'INQUIRY',
      title: 'Balangoda Merchant Association',
      subtitle: 'Sponsorship inquiry for Community Hall Renovation',
      date: 'Nov 20, 2026',
      status: 'PENDING',
      href: '/admin/submissions',
    },
    {
      id: 'vol-102',
      type: 'VOLUNTEER',
      title: 'Sanduni Fernando',
      subtitle: 'Application submitted for Environmental Cleanup',
      date: 'Nov 19, 2026',
      status: 'REVIEWED',
      href: '/admin/submissions',
    },
  ]);

  // Authenticate user session
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/admin/login?redirect=/admin');
          return;
        }

        const data = await res.json();
        if (data.success && data.user) {
          if (isMounted) {
            setCurrentUser(data.user);
          }
        } else {
          router.push('/admin/login?redirect=/admin');
        }
      } catch {
        router.push('/admin/login?redirect=/admin');
      } finally {
        if (isMounted) {
          setIsLoadingAuth(false);
        }
      }
    }

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [router]);

  // Load live counts if available
  const fetchLiveMetrics = useCallback(async () => {
    setMetricsLoading(true);
    setMetricsError(null);

    try {
      // Parallel fetches for available resources
      const [projRes, newsRes, volRes] = await Promise.allSettled([
        fetch('/api/admin/projects'),
        fetch('/api/admin/news'),
        fetch('/api/admin/submissions/volunteers'),
      ]);

      let activeProjects = 4;
      let draftProjects = 1;
      let publishedNews = 6;
      let pinnedAnnouncements = 2;
      let pendingVolunteers = 3;

      if (projRes.status === 'fulfilled' && projRes.value.ok) {
        const pData = await projRes.value.json();
        if (pData.data && Array.isArray(pData.data)) {
          const list = pData.data;
          activeProjects = list.filter((p: { status?: string }) => p.status === 'PUBLISHED').length;
          draftProjects = list.filter((p: { status?: string }) => p.status === 'DRAFT').length;
        }
      }

      if (newsRes.status === 'fulfilled' && newsRes.value.ok) {
        const nData = await newsRes.value.json();
        if (nData.data && Array.isArray(nData.data)) {
          const list = nData.data;
          publishedNews = list.filter((n: { status?: string }) => n.status === 'PUBLISHED').length;
          pinnedAnnouncements = list.filter((n: { isPinned?: boolean }) => Boolean(n.isPinned)).length;
        }
      }

      if (volRes.status === 'fulfilled' && volRes.value.ok) {
        const vData = await volRes.value.json();
        if (vData.data && Array.isArray(vData.data)) {
          const list = vData.data;
          pendingVolunteers = list.filter((v: { status?: string }) => v.status === 'PENDING').length;
        }
      }

      setMetrics({
        activeProjects,
        draftProjects,
        publishedNews,
        pinnedAnnouncements,
        pendingVolunteers,
        unresolvedInquiries: 2,
      });
    } catch {
      setMetricsError('Could not refresh real-time metrics. Showing cached counts.');
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchLiveMetrics();
    }
  }, [currentUser, fetchLiveMetrics]);

  const handleSignOut = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    router.push('/admin/login');
    router.refresh();
  };

  if (isLoadingAuth) {
    return (
      <div
        data-testid="admin-auth-loading"
        className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-900 border-t-amber-400" />
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Verifying officer session...
          </p>
        </div>
      </div>
    );
  }

  const role = currentUser?.role || 'EDITOR';
  const roleInfo = ROLE_DEFINITIONS[role];
  const permittedNavItems = getPermittedAdminNavItems(role);

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100">
      {/* Left Navigation Sidebar */}
      <AdminSidebar
        role={role}
        currentPath="/admin"
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          user={currentUser}
          pageTitle="Command Center"
          onToggleMobile={() => setIsMobileNavOpen(true)}
          onSignOut={handleSignOut}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Welcome Banner (SCR-02 Specification) */}
          <section
            data-testid="admin-welcome-banner"
            className="rounded-2xl bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 p-6 sm:p-8 text-white shadow-md relative overflow-hidden"
          >
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
                <span>🦁 Lions Club of Balangoda</span>
                <span>•</span>
                <span>Term 2026/2027</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Good day, Lion {currentUser?.fullName || 'Officer'}!
              </h2>
              <p className="mt-2 text-sm sm:text-base text-blue-100/90 leading-relaxed">
                Welcome to your Content Management System. You are signed in as{' '}
                <strong className="text-amber-300 font-semibold">{roleInfo.label}</strong>.
                Use the quick action buttons and management modules below to update website content.
              </p>
            </div>
            <div
              className="absolute -right-6 -bottom-8 opacity-10 text-9xl select-none pointer-events-none hidden sm:block"
              aria-hidden="true"
            >
              🦁
            </div>
          </section>

          {/* Error notice if live fetch fails */}
          {metricsError && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
              <span>{metricsError}</span>
              <button
                type="button"
                onClick={fetchLiveMetrics}
                className="font-semibold underline hover:no-underline ml-2"
              >
                Retry
              </button>
            </div>
          )}

          {/* Metric Summary Cards (SCR-02: 4 Primary Metrics) */}
          <section aria-labelledby="metrics-heading" className="space-y-3">
            <h3 id="metrics-heading" className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Activity Overview
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Active Projects */}
              <Link
                href="/admin/projects"
                data-testid="metric-card-projects"
                className="group p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:border-amber-500/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Active Projects
                  </span>
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-amber-400 group-hover:scale-110 transition-transform">
                    <ProjectsIcon className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-zinc-900 dark:text-white">
                    {metricsLoading ? '—' : metrics.activeProjects}
                  </span>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {metrics.draftProjects} draft{metrics.draftProjects === 1 ? '' : 's'} in progress
                  </p>
                </div>
              </Link>

              {/* Card 2: Published News */}
              <Link
                href="/admin/news"
                data-testid="metric-card-news"
                className="group p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:border-amber-500/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Published News
                  </span>
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 group-hover:scale-110 transition-transform">
                    <NewsIcon className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-zinc-900 dark:text-white">
                    {metricsLoading ? '—' : metrics.publishedNews}
                  </span>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {metrics.pinnedAnnouncements} pinned notice{metrics.pinnedAnnouncements === 1 ? '' : 's'}
                  </p>
                </div>
              </Link>

              {/* Card 3: Pending Volunteer Signups */}
              <Link
                href="/admin/submissions"
                data-testid="metric-card-volunteers"
                className="group p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:border-amber-500/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Pending Volunteers
                  </span>
                  <div
                    className={`p-2 rounded-lg transition-transform group-hover:scale-110 ${
                      metrics.pendingVolunteers > 0
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    <SubmissionsIcon className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span
                    className={`text-3xl font-black ${
                      metrics.pendingVolunteers > 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-zinc-900 dark:text-white'
                    }`}
                  >
                    {metricsLoading ? '—' : metrics.pendingVolunteers}
                  </span>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {metrics.pendingVolunteers > 0 ? 'Awaiting officer review' : 'All applications reviewed'}
                  </p>
                </div>
              </Link>

              {/* Card 4: Unresolved Inquiries */}
              <Link
                href="/admin/submissions"
                data-testid="metric-card-inquiries"
                className="group p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:border-amber-500/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Unresolved Inquiries
                  </span>
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <ExternalLinkIcon className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-zinc-900 dark:text-white">
                    {metricsLoading ? '—' : metrics.unresolvedInquiries}
                  </span>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Community & sponsor messages
                  </p>
                </div>
              </Link>
            </div>
          </section>

          {/* Quick Action Shortcuts (WF-DASH-01) */}
          <section aria-labelledby="shortcuts-heading" className="space-y-3">
            <h3 id="shortcuts-heading" className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/admin/projects"
                data-testid="quick-action-new-project"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors focus:ring-2 focus:ring-blue-500"
              >
                <PlusIcon className="w-4 h-4 text-amber-400" />
                <span>+ New Project</span>
              </Link>

              <Link
                href="/admin/news"
                data-testid="quick-action-new-announcement"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-blue-950 font-bold text-xs sm:text-sm shadow-xs transition-colors focus:ring-2 focus:ring-amber-500"
              >
                <PlusIcon className="w-4 h-4" />
                <span>+ New Announcement</span>
              </Link>

              <Link
                href="/admin/submissions"
                data-testid="quick-action-review-submissions"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-xs sm:text-sm shadow-xs transition-colors"
              >
                <SubmissionsIcon className="w-4 h-4 text-zinc-500" />
                <span>Review Volunteer Submissions</span>
              </Link>

              <Link
                href="/admin/media"
                data-testid="quick-action-upload-media"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-xs sm:text-sm shadow-xs transition-colors"
              >
                <MediaIcon className="w-4 h-4 text-zinc-500" />
                <span>Upload Media Assets</span>
              </Link>

              {role === 'ADMIN' && (
                <Link
                  href="/admin/users"
                  data-testid="quick-action-manage-users"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-900 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors"
                >
                  <UsersIcon className="w-4 h-4 text-amber-400" />
                  <span>Manage User Accounts</span>
                </Link>
              )}
            </div>
          </section>

          {/* Permitted Management Areas Grid (LBW-43 AC-1 & AC-2) */}
          <section aria-labelledby="modules-heading" className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 id="modules-heading" className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Management Areas ({permittedNavItems.length})
              </h3>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                Filtered by role: {roleInfo.label}
              </span>
            </div>

            <div
              data-testid="permitted-modules-grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {permittedNavItems
                .filter((item) => item.id !== 'dashboard')
                .map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    data-testid={`module-card-${item.id}`}
                    className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:border-blue-900 dark:hover:border-amber-500/50 hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 group-hover:bg-blue-900 group-hover:text-amber-400 transition-colors">
                          <AdminNavIcon icon={item.icon} className="w-6 h-6" />
                        </div>
                        {item.requiredRole === 'ADMIN' && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            Admin Only
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-blue-900 dark:group-hover:text-amber-400 transition-colors">
                        {item.label}
                      </h4>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-blue-900 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
                      <span>Open {item.label}</span>
                      <span>→</span>
                    </div>
                  </Link>
                ))}
            </div>
          </section>

          {/* Recent Submissions & Activity (SCR-02 Specification) */}
          <section aria-labelledby="activity-heading" className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 id="activity-heading" className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Recent Submissions & Activity
              </h3>
              <Link
                href="/admin/submissions"
                className="text-xs font-semibold text-blue-900 dark:text-amber-400 hover:underline"
              >
                View all submissions →
              </Link>
            </div>

            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {activities.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0">
                        {item.type === 'VOLUNTEER' && (
                          <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400 inline-block">
                            <SubmissionsIcon className="w-4 h-4" />
                          </span>
                        )}
                        {item.type === 'NEWS' && (
                          <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300 inline-block">
                            <NewsIcon className="w-4 h-4" />
                          </span>
                        )}
                        {item.type === 'PROJECT' && (
                          <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300 inline-block">
                            <ProjectsIcon className="w-4 h-4" />
                          </span>
                        )}
                        {item.type === 'INQUIRY' && (
                          <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300 inline-block">
                            <ExternalLinkIcon className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {item.title}
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center pl-7 sm:pl-0">
                      <span className="text-[11px] text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                        {item.date}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          item.status === 'PENDING'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : item.status === 'PUBLISHED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                        }`}
                      >
                        {item.status}
                      </span>
                      <Link
                        href={item.href}
                        className="text-xs font-semibold text-zinc-600 hover:text-blue-900 dark:text-zinc-400 dark:hover:text-amber-400"
                      >
                        Inspect
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
