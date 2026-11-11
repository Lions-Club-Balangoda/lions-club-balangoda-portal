'use client';

import React, { useState, useMemo } from 'react';
import type { BoardTerm, ExecutiveMember } from '../../types/board';
import {
  getBoardTermsSorted,
  getDefaultBoardTerm,
  getMembersByTerm,
} from '../../lib/board';
import { BoardMemberCard } from './BoardMemberCard';

interface BoardDirectoryProps {
  terms: BoardTerm[];
  members: ExecutiveMember[];
}

export function BoardDirectory({ terms, members }: BoardDirectoryProps) {
  const sortedTerms = useMemo(() => getBoardTermsSorted(terms), [terms]);
  const defaultTerm = useMemo(() => getDefaultBoardTerm(sortedTerms), [sortedTerms]);

  const [selectedTermId, setSelectedTermId] = useState<string>(
    defaultTerm?.termId || ''
  );

  const selectedTerm = useMemo(
    () => sortedTerms.find((t) => t.termId === selectedTermId) || defaultTerm,
    [sortedTerms, selectedTermId, defaultTerm]
  );

  const termMembers = useMemo(() => {
    if (!selectedTerm) return [];
    return getMembersByTerm(members, selectedTerm.termId);
  }, [members, selectedTerm]);

  if (sortedTerms.length === 0) {
    return (
      <div className="my-12 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center dark:border-zinc-800 dark:bg-zinc-900/40">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Executive Board Records Unavailable
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Verified leadership terms are currently being updated by the club secretariat.
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Executive Committee Directory" className="space-y-8">
      {/* Term Selector Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Select Lionistic Term
          </h2>
        </div>

        <div
          role="tablist"
          aria-label="Lionistic Administrative Terms"
          className="flex flex-wrap gap-2"
        >
          {sortedTerms.map((term) => {
            const isSelected = selectedTerm?.termId === term.termId;
            return (
              <button
                key={term.termId}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedTermId(term.termId)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${
                  isSelected
                    ? 'bg-blue-950 text-amber-400 shadow-sm dark:bg-amber-500 dark:text-blue-950'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-950 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                <span>{term.termId}</span>
                {term.isCurrent && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                      isSelected
                        ? 'bg-amber-400 text-blue-950 dark:bg-blue-950 dark:text-amber-400'
                        : 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300'
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

      {/* Selected Term Banner */}
      {selectedTerm && (
        <div className="rounded-2xl border border-blue-900/15 bg-gradient-to-r from-blue-950 to-blue-900 p-6 sm:p-8 text-white shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  {selectedTerm.isCurrent ? 'Current Executive Committee' : 'Past Executive Committee'}
                </span>
                <span className="text-xs text-blue-200">
                  ({selectedTerm.startDate} – {selectedTerm.endDate})
                </span>
              </div>
              <h3 className="text-2xl font-extrabold tracking-tight text-white">
                {selectedTerm.termLabel}
              </h3>
            </div>

            {selectedTerm.theme && (
              <div className="rounded-xl bg-white/10 px-4 py-2.5 border border-white/15 backdrop-blur-xs">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                  Presidential Theme
                </span>
                <span className="text-sm font-bold text-white italic">
                  &ldquo;{selectedTerm.theme}&rdquo;
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Executive Members Grid */}
      {termMembers.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {termMembers.map((member) => (
            <BoardMemberCard key={member.id} member={member} />
          ))}
        </div>
      ) : (
        <div className="my-12 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/70 p-10 text-center dark:border-zinc-800 dark:bg-zinc-900/30">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
            <span className="text-xl" aria-hidden="true">
              📋
            </span>
          </div>
          <h4 className="mt-4 text-base font-bold text-zinc-900 dark:text-zinc-100">
            Verified Roster Pending for {selectedTerm?.termLabel}
          </h4>
          <p className="mt-1.5 max-w-md mx-auto text-sm text-zinc-600 dark:text-zinc-400">
            Verified officer records for this administrative term have not yet been published by the club secretariat.
          </p>
        </div>
      )}
    </section>
  );
}
