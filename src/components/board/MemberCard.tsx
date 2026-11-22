'use client';

import React, { useState } from 'react';
import type { ExecutiveMember } from '../../types/board.ts';

interface MemberCardProps {
  member: ExecutiveMember;
}

export const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const [imageError, setImageError] = useState(false);

  // Compute initials fallback
  const initials = member.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

  const displayName = member.lionTitle ? `${member.lionTitle} ${member.fullName}` : member.fullName;

  return (
    <article
      data-testid={`member-card-${member.memberId}`}
      className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90"
    >
      {/* Officer Avatar / Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
        {member.profileImageUrl && !imageError ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={member.profileImageUrl}
            alt={displayName}
            loading="lazy"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div
            data-testid="member-initials-fallback"
            className="flex h-full w-full items-center justify-center bg-blue-900/10 text-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
          >
            <div className="flex flex-col items-center">
              <span className="text-3xl font-extrabold tracking-wider">{initials || 'LC'}</span>
              <span className="mt-1 text-[11px] font-medium uppercase tracking-widest text-zinc-500">
                Lions Balangoda
              </span>
            </div>
          </div>
        )}

        {/* Designation Badge */}
        <div className="absolute bottom-3 left-3 right-3 flex">
          <span className="inline-block max-w-full truncate rounded-lg bg-blue-900/90 backdrop-blur-sm px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm dark:bg-blue-600/90">
            {member.designation}
          </span>
        </div>
      </div>

      {/* Officer Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {displayName}
        </h3>

        {member.bio && (
          <p className="mt-2.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
            {member.bio}
          </p>
        )}

        {/* Contact Links */}
        <div className="mt-auto pt-4 flex flex-col gap-1.5 border-t border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-600 dark:text-zinc-400">
          {member.contactEmail && (
            <a
              href={`mailto:${member.contactEmail}`}
              className="inline-flex items-center gap-2 truncate text-blue-800 hover:underline dark:text-blue-400"
              title={`Email ${member.fullName}`}
            >
              <svg
                className="h-3.5 w-3.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="truncate">{member.contactEmail}</span>
            </a>
          )}

          {member.contactPhone && (
            <a
              href={`tel:${member.contactPhone}`}
              className="inline-flex items-center gap-2 truncate text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              title={`Call ${member.fullName}`}
            >
              <svg
                className="h-3.5 w-3.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span>{member.contactPhone}</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
};
