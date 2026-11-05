'use client';

import React, { useState, useMemo } from 'react';
import { Project, ServicePillar } from '../../types/project';
import { ProjectCard } from './ProjectCard';
import { filterProjects, getUniqueProjectYears } from '../../lib/projects';

interface ProjectsListProps {
  initialProjects: Project[];
}

const CATEGORIES: { key: ServicePillar | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'All Pillars' },
  { key: 'HEALTHCARE', label: 'Healthcare' },
  { key: 'EDUCATION', label: 'Education' },
  { key: 'ENVIRONMENT', label: 'Environment' },
  { key: 'POVERTY_RELIEF', label: 'Poverty Relief' },
];

export const ProjectsList: React.FC<ProjectsListProps> = ({ initialProjects }) => {
  const [selectedCategory, setSelectedCategory] = useState<ServicePillar | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');

  const availableYears = useMemo(() => getUniqueProjectYears(initialProjects), [initialProjects]);

  // Execute filtering via deterministic business logic
  const filteredProjects = useMemo(() => {
    return filterProjects(initialProjects, {
      category: selectedCategory,
      query: searchQuery,
      year: selectedYear,
      status: 'PUBLISHED',
    });
  }, [initialProjects, selectedCategory, searchQuery, selectedYear]);

  const handleResetFilters = () => {
    setSelectedCategory('ALL');
    setSearchQuery('');
    setSelectedYear('ALL');
  };

  return (
    <div className="w-full">
      {/* Search & Filter Controls Toolbar */}
      <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-zinc-50 p-4 border border-zinc-200 dark:bg-zinc-900/50 dark:border-zinc-800 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Keyword Search Input */}
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">🔍</span>
            <input
              type="text"
              data-testid="project-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by title, location or keyword..."
              className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Year Filter Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="year-select" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Year:
            </label>
            <select
              id="year-select"
              data-testid="project-year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="ALL">All Years</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Service Pillar Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mr-1">Pillars:</span>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                data-testid={`category-filter-${cat.key.toLowerCase()}`}
                onClick={() => setSelectedCategory(cat.key)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-500'
                    : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 dark:hover:bg-zinc-700'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header Counter */}
      <div className="mb-6 flex items-center justify-between">
        <p data-testid="project-results-count" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Showing <span className="font-bold text-zinc-900 dark:text-zinc-100">{filteredProjects.length}</span>{' '}
          community {filteredProjects.length === 1 ? 'project' : 'projects'}
          {selectedCategory !== 'ALL' && ` in ${selectedCategory}`}
          {selectedYear !== 'ALL' && ` (${selectedYear})`}
        </p>

        {(selectedCategory !== 'ALL' || searchQuery || selectedYear !== 'ALL') && (
          <button
            type="button"
            data-testid="reset-filters-btn"
            onClick={handleResetFilters}
            className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div
          data-testid="projects-grid"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div
          data-testid="projects-empty-state"
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900"
        >
          <span className="text-4xl mb-3">🔍</span>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            No projects found
          </h3>
          <p className="max-w-md text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            We couldn&apos;t find any service activities matching your search query or filter. Try adjusting your keywords or clearing the category filter.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            View All Projects
          </button>
        </div>
      )}
    </div>
  );
};

