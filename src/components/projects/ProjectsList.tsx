'use client';

import React, { useState, useMemo } from 'react';
import { Project, ServicePillar } from '../../types/project';
import { ProjectCard } from './ProjectCard';
import { sanitizeSearchQuery } from '../../lib/projects';

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

  // Filter projects by category, search query across title and summary, and year
  const filteredProjects = useMemo(() => {
    const sanitized = sanitizeSearchQuery(searchQuery).toLowerCase().trim();

    return initialProjects.filter((project) => {
      // 1. Privacy defense: strictly ignore non-published items
      if (project.status && project.status !== 'PUBLISHED') {
        return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'ALL' && project.category !== selectedCategory) {
        return false;
      }

      // 3. Year filter
      if (selectedYear !== 'ALL' && !project.eventDate.startsWith(selectedYear)) {
        return false;
      }

      // 4. Keyword search across title and summary (and location)
      if (sanitized.length > 0) {
        const matchTitle = project.title.toLowerCase().includes(sanitized);
        const matchSummary = project.summary?.toLowerCase().includes(sanitized) ?? false;
        const matchLocation = project.location?.toLowerCase().includes(sanitized) ?? false;

        if (!matchTitle && !matchSummary && !matchLocation) {
          return false;
        }
      }

      return true;
    });
  }, [initialProjects, selectedCategory, selectedYear, searchQuery]);

  const handleClearSearchOnly = () => {
    setSearchQuery('');
  };

  const handleResetAllFilters = () => {
    setSelectedCategory('ALL');
    setSearchQuery('');
    setSelectedYear('ALL');
  };

  // 1. API Failure / Error State
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
          We are currently experiencing a technical issue retrieving service project records. Please
          check back shortly or refresh your browser.
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
          The Lions Club of Balangoda is currently compiling and preparing the service archives for
          this Lionistic year. Please visit again soon or contact our club secretary to learn about
          ongoing volunteer opportunities.
        </p>
      </div>
    );
  }

  const isSearchActive = searchQuery.trim().length > 0;
  const isFilterActive = selectedCategory !== 'ALL' || selectedYear !== 'ALL' || isSearchActive;

  return (
    <div className="w-full max-w-full min-w-0">
      {/* Search & Filter Controls Toolbar - 360px mobile safe */}
      <div className="mb-6 sm:mb-8 flex flex-col gap-3.5 sm:gap-4 rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Keyword Search Input */}
          <div className="relative flex-1 min-w-0">
            <span
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 select-none text-sm"
              aria-hidden="true"
            >
              🔍
            </span>
            <input
              type="text"
              data-testid="project-search-input"
              aria-label="Search published projects by title or summary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or summary..."
              className="w-full box-border rounded-xl border border-zinc-300 bg-zinc-50/50 py-2.5 pl-9 pr-8 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400"
            />
            {searchQuery && (
              <button
                type="button"
                data-testid="input-clear-icon"
                onClick={handleClearSearchOnly}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200 transition-colors"
                aria-label="Clear search text"
              >
                ✕
              </button>
            )}
          </div>

          {/* Year Filter Dropdown */}
          {availableYears.length > 0 && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <label
                htmlFor="year-select"
                className="text-xs font-semibold text-zinc-500 uppercase tracking-wider"
              >
                Year:
              </label>
              <select
                id="year-select"
                data-testid="project-year-filter"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="rounded-xl border border-zinc-300 bg-zinc-50/50 py-2 px-3 text-sm text-zinc-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
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

        {/* Pillar Category Filter Tabs (horizontal scroll on mobile 360px without page overflow) */}
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

      {/* Filter / Search Status Indicator Bar */}
      {isFilterActive && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400 px-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span>Filtered by:</span>
            {isSearchActive && (
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 font-medium text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900">
                Keyword: &quot;{searchQuery}&quot;
                <button
                  type="button"
                  onClick={handleClearSearchOnly}
                  className="hover:text-blue-900 dark:hover:text-blue-100 ml-0.5"
                  aria-label="Remove keyword filter"
                >
                  ✕
                </button>
              </span>
            )}
            {selectedCategory !== 'ALL' && (
              <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 font-medium text-zinc-700 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700">
                {CATEGORIES.find((c) => c.key === selectedCategory)?.label}
                <button
                  type="button"
                  onClick={() => setSelectedCategory('ALL')}
                  className="hover:text-zinc-900 dark:hover:text-zinc-100 ml-0.5"
                  aria-label="Remove category filter"
                >
                  ✕
                </button>
              </span>
            )}
            {selectedYear !== 'ALL' && (
              <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 font-medium text-zinc-700 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700">
                Year: {selectedYear}
                <button
                  type="button"
                  onClick={() => setSelectedYear('ALL')}
                  className="hover:text-zinc-900 dark:hover:text-zinc-100 ml-0.5"
                  aria-label="Remove year filter"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
          <button
            type="button"
            data-testid="reset-all-filters-btn"
            onClick={handleResetAllFilters}
            className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            Reset All
          </button>
        </div>
      )}

      {/* Filtered Results State */}
      {filteredProjects.length === 0 ? (
        <div
          data-testid="no-search-results"
          className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 sm:p-10 text-center dark:border-zinc-800 dark:bg-zinc-900/60 w-full box-border"
        >
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-2xl dark:bg-zinc-800">
            🔍
          </div>
          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {isSearchActive
              ? `No published projects found matching "${searchQuery}"`
              : 'No community projects matched your filter criteria'}
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            Try checking for spelling mistakes, searching with broader keywords, or clearing your
            active filters to see all community service activities.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            {isSearchActive && (
              <button
                type="button"
                data-testid="clear-search-btn"
                onClick={handleClearSearchOnly}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                Clear Search
              </button>
            )}
            <button
              type="button"
              data-testid="reset-filters-btn"
              onClick={handleResetAllFilters}
              className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      ) : (
        /* Responsive Grid: single column on mobile 360px, 2 col on tablet, 3 col on desktop */
        <div
          data-testid="projects-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full max-w-full min-w-0"
        >
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};
