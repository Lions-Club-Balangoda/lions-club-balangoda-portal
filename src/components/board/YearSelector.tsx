'use client';

import React from 'react';
import type { BoardTerm } from '../../types/board.ts';

interface YearSelectorProps {
  terms: BoardTerm[];
  selectedYear: string;
  onSelectYear: (year: string) => void;
  disabled?: boolean;
}

/**
 * Accessible Year Selector Component
 *
 * Acceptance Criteria Handled:
 * 1. A year selector lists only years that have board records.
 * 2. Empty years are not offered.
 * 3. Selection works by keyboard and on mobile (native picker + accessible pills).
 */
export const YearSelector: React.FC<YearSelectorProps> = ({
  terms,
  selectedYear,
  onSelectYear,
  disabled = false,
}) => {
  if (!terms || terms.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-full" data-testid="year-selector-container">
      {/* Mobile-first Accessible Dropdown (< sm breakpoint) */}
      <div className="sm:hidden w-full">
        <label
          htmlFor="lionistic-year-dropdown"
          className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5"
        >
          Select Lionistic Year:
        </label>
        <div className="relative">
          <select
            id="lionistic-year-dropdown"
            data-testid="year-selector-dropdown"
            aria-label="Filter board directory by Lionistic Year"
            value={selectedYear}
            disabled={disabled}
            onChange={(e) => onSelectYear(e.target.value)}
            className="w-full appearance-none rounded-xl border border-zinc-300 bg-white py-3 pl-4 pr-10 text-sm font-semibold text-zinc-900 shadow-sm transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 disabled:opacity-50"
          >
            {terms.map((term) => (
              <option key={term.termId} value={term.termId}>
                {term.termLabel} {term.isCurrent ? '(Current)' : ''}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500">
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Desktop / Tablet Accessible Pill Tabs (>= sm breakpoint) */}
      <div
        className="hidden sm:flex sm:items-center sm:gap-2 sm:flex-wrap"
        role="tablist"
        aria-label="Lionistic Years"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mr-1">
          Lionistic Year:
        </span>
        {terms.map((term) => {
          const isSelected = term.termId === selectedYear;
          return (
            <button
              key={term.termId}
              type="button"
              role="tab"
              aria-selected={isSelected}
              tabIndex={0}
              data-testid={`year-tab-${term.termId}`}
              disabled={disabled}
              onClick={() => onSelectYear(term.termId)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectYear(term.termId);
                }
              }}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 ${
                isSelected
                  ? 'bg-blue-900 text-white shadow-sm ring-1 ring-blue-900 dark:bg-blue-600 dark:text-white'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-white'
              }`}
            >
              <span>{term.termId}</span>
              {term.isCurrent && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    isSelected
                      ? 'bg-amber-400 text-zinc-950'
                      : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  Current
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
