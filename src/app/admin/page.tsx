'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { UserRole } from '../../types/rbac';
import { ROLE_DEFINITIONS } from '../../types/rbac';

interface UserSession {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiTestResult, setApiTestResult] = useState<{
    endpoint: string;
    status: number;
    success: boolean;
    data: unknown;
  } | null>(null);

  useEffect(() => {
    // Check if session token exists or check who is authenticated
    fetch('/api/admin/projects/proj_001')
      .then((res) => {
        if (res.status === 401) {
          router.push('/admin/login?redirect=/admin');
        } else {
          // In a full session context, read headers or profile endpoint
          // Defaulting to displayed session representation
          setCurrentUser({
            userId: 'usr_current',
            username: 'officer',
            email: 'officer@balangodalions.org',
            fullName: 'Lions Club Officer',
            role: 'ADMIN',
          });
        }
      })
      .catch(() => {
        router.push('/admin/login');
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  const handleSignOut = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const testApiCall = async (endpoint: string, method = 'GET') => {
    setApiTestResult(null);
    try {
      const res = await fetch(endpoint, { method });
      const data = res.headers.get('content-type')?.includes('application/json')
        ? await res.json()
        : { raw: await res.text() };

      setApiTestResult({
        endpoint,
        status: res.status,
        success: res.ok,
        data,
      });
    } catch (e: unknown) {
      setApiTestResult({
        endpoint,
        status: 500,
        success: false,
        data: { error: e instanceof Error ? e.message : 'Network failure' },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-900 border-t-transparent" />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Verifying security session...</p>
        </div>
      </div>
    );
  }

  const roleInfo = currentUser ? ROLE_DEFINITIONS[currentUser.role] : null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-900 font-bold text-amber-400">
              L
            </span>
            <div>
              <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
                CMS Administration Portal
              </h1>
              <p className="text-xs text-zinc-500">Lions Club of Balangoda (District 306)</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                {currentUser?.fullName}
              </span>
              <span className="text-xs text-zinc-500">{currentUser?.email}</span>
            </div>

            {roleInfo && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
                  currentUser?.role === 'ADMIN'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    currentUser?.role === 'ADMIN' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                />
                {roleInfo.label}
              </span>
            )}

            <button
              onClick={handleSignOut}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome Banner & Role Information */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 p-6 text-white shadow-lg">
          <div className="max-w-3xl">
            <span className="inline-block rounded-md bg-blue-800/80 px-2.5 py-1 text-xs font-semibold text-amber-300 mb-2">
              Role-Based Access Control (RBAC) Active
            </span>
            <h2 className="text-2xl font-bold">Welcome, {currentUser?.fullName}</h2>
            <p className="mt-1 text-sm text-blue-100 leading-relaxed">
              {roleInfo?.description}
            </p>
          </div>
        </div>

        {/* CMS Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">Humanitarian Projects</h3>
            <p className="text-xs text-zinc-500 mb-4">Manage project stories, categories, and cover images.</p>
            <div className="flex gap-2">
              <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700 font-medium">Create</span>
              <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700 font-medium">Edit</span>
              <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700 font-medium">Publish</span>
              <span className="rounded bg-red-50 px-2 py-0.5 text-xs text-red-700 font-medium">Delete (Admin)</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">News & Announcements</h3>
            <p className="text-xs text-zinc-500 mb-4">Publish club press releases and pin urgent announcements.</p>
            <div className="flex gap-2">
              <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700 font-medium">Create</span>
              <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700 font-medium">Edit</span>
              <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700 font-medium">Pin</span>
              <span className="rounded bg-red-50 px-2 py-0.5 text-xs text-red-700 font-medium">Delete (Admin)</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">Volunteer Submissions</h3>
            <p className="text-xs text-zinc-500 mb-4">Review prospective volunteer signups and export data.</p>
            <div className="flex gap-2">
              <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700 font-medium">Review</span>
              <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700 font-medium">Notes</span>
              <span className="rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-700 font-medium">CSV Export (Admin)</span>
            </div>
          </div>
        </div>

        {/* Live RBAC Verification Console */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                Live Server-Side RBAC Enforcement Tester
              </h3>
              <p className="text-xs text-zinc-500">
                Execute requests against server endpoints to verify 401/403 security enforcement.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <button
              onClick={() => testApiCall('/api/admin/projects/proj_001', 'PUT')}
              className="rounded-lg border border-zinc-300 p-3 text-left hover:border-blue-600 hover:bg-blue-50/50 transition dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              <div className="text-xs font-semibold text-blue-900 dark:text-blue-400">PUT /api/admin/projects/1</div>
              <div className="text-xs text-zinc-500 mt-1">Allowed for Admin & Editor</div>
            </button>

            <button
              onClick={() => testApiCall('/api/admin/projects/proj_001', 'DELETE')}
              className="rounded-lg border border-zinc-300 p-3 text-left hover:border-red-600 hover:bg-red-50/50 transition dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              <div className="text-xs font-semibold text-red-700 dark:text-red-400">DELETE /api/admin/projects/1</div>
              <div className="text-xs text-zinc-500 mt-1">Admin Only (403 for Editor)</div>
            </button>

            <button
              onClick={() => testApiCall('/api/admin/submissions/export', 'GET')}
              className="rounded-lg border border-zinc-300 p-3 text-left hover:border-amber-600 hover:bg-amber-50/50 transition dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">GET /submissions/export</div>
              <div className="text-xs text-zinc-500 mt-1">Admin Only (403 for Editor)</div>
            </button>

            <button
              onClick={() => testApiCall('/api/admin/users', 'GET')}
              className="rounded-lg border border-zinc-300 p-3 text-left hover:border-purple-600 hover:bg-purple-50/50 transition dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              <div className="text-xs font-semibold text-purple-700 dark:text-purple-400">GET /api/admin/users</div>
              <div className="text-xs text-zinc-500 mt-1">Admin Only (403 for Editor)</div>
            </button>
          </div>

          {apiTestResult && (
            <div
              className={`rounded-xl p-4 border text-sm font-mono ${
                apiTestResult.status === 200 || apiTestResult.status === 201
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
                  : apiTestResult.status === 403
                    ? 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200'
                    : 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/40 dark:border-red-800 dark:text-red-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-current/20 font-semibold">
                <span>Endpoint: {apiTestResult.endpoint}</span>
                <span>HTTP Status: {apiTestResult.status}</span>
              </div>
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(apiTestResult.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
