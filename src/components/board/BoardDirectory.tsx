'use client';

import React, { useState, useTransition, useMemo } from 'react';
import type { BoardTerm, ExecutiveMember } from '../../types/board.ts';
import { YearSelector } from './YearSelector.tsx';
import { MemberCard } from './MemberCard.tsx';

export interface BoardDirectoryProps {
  terms: BoardTerm[];
  initialSelectedTerm?: BoardTerm | null;
  initialMembers?: ExecutiveMember[];
  members?: ExecutiveMember[];
  allMembers?: ExecutiveMember[];
  isInitialInvalidYear?: boolean;
  invalidYearRequested?: string | null;
}

export function BoardDirectory({
  terms,
  initialSelectedTerm,
  initialMembers,
  members,
  allMembers,
  isInitialInvalidYear = false,
  invalidYearRequested = null,
}: BoardDirectoryProps) {
  // Support both prop conventions
  const effectiveInitialMembers = useMemo(
    () => initialMembers || members || [],
    [initialMembers, members]
  );
  const effectiveAllMembers = useMemo(
    () => allMembers || members || effectiveInitialMembers,
    [allMembers, members, effectiveInitialMembers]
  );

  const currentTermDefault = useMemo(() => {
    return initialSelectedTerm || terms.find((t) => t.isCurrent) || terms[0] || null;
  }, [terms, initialSelectedTerm]);

  const [selectedYear, setSelectedYear] = useState<string>(
    currentTermDefault?.termId || (terms[0]?.termId ?? '')
  );
  const [showInvalidAlert, setShowInvalidAlert] = useState<boolean>(isInitialInvalidYear);
  const [isPending, startTransition] = useTransition();

  // Find currently active term object
  const activeTerm = useMemo(() => {
    return terms.find((t) => t.termId === selectedYear) || currentTermDefault;
  }, [terms, selectedYear, currentTermDefault]);

  // Compute active members to display
  const displayedMembers = useMemo(() => {
    if (effectiveAllMembers.length > 0 && selectedYear) {
      return effectiveAllMembers
        .filter((m) => m.termId === selectedYear && m.status === 'ACTIVE')
        .sort((a, b) => a.displayOrder - b.displayOrder);
    }
    if (activeTerm?.termId === selectedYear) {
      return effectiveInitialMembers;
    }
    return effectiveInitialMembers;
  }, [effectiveAllMembers, selectedYear, activeTerm, effectiveInitialMembers]);

  const handleSelectYear = (year: string) => {
    startTransition(() => {
      setSelectedYear(year);
      setShowInvalidAlert(false);

      // Deep-linking URL synchronization
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        const currentTerm = terms.find((t) => t.isCurrent);
        if (currentTerm && currentTerm.termId === year) {
          url.searchParams.delete('year');
        } else {
          url.searchParams.set('year', year);
        }
        window.history.pushState({}, '', url.toString());
      }
    });
  };

  const handleDismissAlert = () => {
    setShowInvalidAlert(false);
  };

  return (
    <div className="w-full max-w-full min-w-0" data-testid="board-directory">
      {/* Friendly Notice for Invalid Year in URL (Acceptance Criterion 3) */}
      {showInvalidAlert && invalidYearRequested && (
        <div
          role="alert"
          data-testid="invalid-year-alert"
          className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 sm:p-5 text-amber-900 shadow-sm dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0" aria-hidden="true">
              ℹ️
            </span>
            <div>
              <p className="font-bold text-sm sm:text-base">
                Lionistic Year &quot;{invalidYearRequested}&quot; Not Found
              </p>
              <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 mt-0.5">
                No active committee records exist for that term. Showing the current Executive Board
                ({activeTerm?.termId || 'current term'}) instead.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismissAlert}
            className="self-end sm:self-center shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-200/80 hover:bg-amber-300 dark:bg-amber-900/60 dark:text-amber-100 dark:hover:bg-amber-900 transition"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Directory Filter Bar & Term Header */}
      <div className="mb-8 rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Active Term Title & Theme */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {activeTerm?.termLabel || `Lionistic Year ${selectedYear}`}
              </h2>
              {activeTerm?.isCurrent && (
                <span
                  data-testid="current-term-badge"
                  className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                >
                  Current Board
                </span>
              )}
            </div>

            {activeTerm?.theme && (
              <p
                data-testid="term-theme"
                className="mt-1 text-sm sm:text-base font-medium text-blue-900 dark:text-blue-300"
              >
                <span className="font-semibold text-zinc-500 dark:text-zinc-400">Theme: </span>
                &ldquo;{activeTerm.theme}&rdquo;
              </p>
            )}
          </div>

          {/* Accessible Year Selector (Mobile Dropdown + Desktop Tabs) */}
          <div className="shrink-0 w-full sm:w-auto">
            <YearSelector
              terms={terms}
              selectedYear={selectedYear}
              onSelectYear={handleSelectYear}
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      {/* Executive Members Grid */}
      {displayedMembers && displayedMembers.length > 0 ? (
        <section
          aria-label={`Executive Committee Members for ${activeTerm?.termLabel || selectedYear}`}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          data-testid="members-grid"
        >
          {displayedMembers.map((member) => (
            <MemberCard key={member.id || member.memberId} member={member} />
          ))}
        </section>
      ) : (
        <div
          data-testid="empty-members-state"
          className="rounded-2xl border border-zinc-200 bg-white p-8 sm:p-12 text-center dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-2xl text-zinc-500 dark:bg-zinc-800">
            👥
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            No Directory Records Found
          </h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
            No executive member records are available for the selected lionistic term.
          </p>
        </div>
      )}
    </div>
  );
}
