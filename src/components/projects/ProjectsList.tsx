'use client';

import React, { useState, useMemo } from 'react';
import { Project, ServicePillar } from '../../types/project';
import { ProjectCard } from './ProjectCard';

interface ProjectsListProps {
  initialProjects?: Project[];
  initialError?: string | null;
}

const CATEGORIES: { key: ServicePillar | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'All Pillars' },
  { key: 'HEALTHCARE', label: 'Healthcare' },
  { key: 'EDUCATION', label: 'Education' },
  { key: 'ENVIRONMENT', label: 'Environment' },
  { key: 'POVERTY_RELIEF', label: 'Poverty Relief' },
];

export const ProjectsList: React.FC<ProjectsListProps> = ({
  initialProjects = [],
  initialError = null,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ServicePillar | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');

  // Extract unique sorted years from projects
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    initialProjects.forEach((p) => {
      if (p.eventDate) {
        const year = p.eventDate.substring(0, 4);
        if (/^\d{4}$/.test(year)) {
          years.add(year);
        }
      }
    });
    return Array.from(years).sort().reverse();
  }, [initialProjects]);

  // Filter projects by category, search query, and year
  const filteredProjects = useMemo(() => {
    return initialProjects.filter((project) => {
      // Security defense: strictly ignore non-published items if any ever reached UI
      if (project.status && project.status !== 'PUBLISHED') {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL' && project.category !== selectedCategory) {
        return false;
      }

      // Year filter
      if (selectedYear !== 'ALL' && !project.eventDate.startsWith(selectedYear)) {
        return false;
      }

      // Keyword query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = project.title.toLowerCase().includes(q);
        const matchSummary = project.summary?.toLowerCase().includes(q) ?? false;
        const matchLocation = project.location?.toLowerCase().includes(q) ?? false;

        if (!matchTitle && !matchSummary && !matchLocation) {
          return false;
        }
      }

      return true;
    });
  }, [initialProjects, selectedCategory, selectedYear, searchQuery]);

  const handleResetFilters = () => {
    setSelectedCategory('ALL');
    setSearchQuery('');
    setSelectedYear('ALL');
  };

  // 1. API Failure / Error State
  // Acceptance criterion: Given the API fails, friendly error message shown and no stack trace or SQL exposed.
  if (initialError) {
    return (
      <div
        data-testid="projects-error-state"
        className="w-full max-w-full rounded-2xl border border-red-200 bg-red-50/70 p-6 sm:p-8 text-center dark:border-red-900/50 dark:bg-red-950/20"
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl text-red-600 dark:bg-red-900/50">
          ⚠️
        </div>
        <h3 className="text-lg font-bold text-red-900 dark:text-red-200">
          Unable to Load Community Projects
        </h3>
        <p className="mt-2 text-sm text-red-700 dark:text-red-300 max-w-md mx-auto">
          We are currently experiencing a technical issue retrieving service project records. Please check back shortly or refresh your browser.
        </p>
        <div className="mt-5">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/40"
          >
            <span>🔄</span> Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // 2. Global Empty State (No published projects exist in database)
  // Acceptance criterion: Given no projects exist, then a clear empty-state message is shown.
  if (initialProjects.length === 0) {
    return (
      <div
        data-testid="projects-empty-state"
        className="w-full max-w-full rounded-2xl border border-dashed border-zinc-300 bg-white p-8 sm:p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/60"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl dark:bg-blue-950">
          🦁
        </div>
        <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          No Community Projects Published Yet
        </h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
          The Lions Club of Balangoda is currently compiling and preparing the service archives for this Lionistic year. Please visit again soon or contact our club secretary to learn about ongoing volunteer opportunities.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full min-w-0">
      {/* Search & Filter Controls Toolbar */}
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 sm:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Keyword Search Input */}
          <div className="relative flex-1 min-w-0">
            <span
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
              aria-hidden="true"
            >
              🔍
            </span>
            <input
              type="text"
              data-testid="project-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, location or keyword..."
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Year Filter Dropdown */}
          {availableYears.length > 0 && (
            <div className="flex items-center gap-2">
              <label htmlFor="year-select" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Year:
              </label>
              <select
                id="year-select"
                data-testid="project-year-filter"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="rounded-xl border border-zinc-300 bg-zinc-50/50 py-2.5 px-3 text-sm text-zinc-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="ALL">All Years</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Pillar Category Filter Tabs (horizontal scroll without breaking viewport on mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                data-testid={`filter-btn-${cat.key.toLowerCase()}`}
                onClick={() => setSelectedCategory(cat.key)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-900 text-white shadow-sm dark:bg-blue-600'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtered Results State */}
      {filteredProjects.length === 0 ? (
        <div
          data-testid="no-search-results"
          className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/60"
        >
          <p className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
            No community projects matched your filter criteria.
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Try adjusting your search query or selecting &quot;All Pillars&quot;.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-4 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Responsive Grid: single column on mobile, 2 col on tablet, 3 col on desktop */
        <div
          data-testid="projects-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-full min-w-0"
        >
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};
