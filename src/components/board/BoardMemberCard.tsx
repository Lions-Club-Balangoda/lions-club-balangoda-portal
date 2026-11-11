import React from 'react';
import Image from 'next/image';
import type { ExecutiveMember } from '../../types/board';
import { formatMemberDisplayName, getMemberInitials, sanitizeMemberText } from '../../lib/board';

interface BoardMemberCardProps {
  member: ExecutiveMember;
}

export function BoardMemberCard({ member }: BoardMemberCardProps) {
  const displayName = formatMemberDisplayName(member);
  const initials = getMemberInitials(member.fullName);
  const cleanBio = sanitizeMemberText(member.bio);
  const hasPhoto = Boolean(member.profileImageUrl && member.profileImageUrl.trim());
  const hasBio = cleanBio.length > 0;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400/80 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      {/* Portrait Area: Image or Clean Monogram Avatar Fallback */}
      <div className="relative flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 px-6 pt-8 pb-6">
        {hasPhoto ? (
          <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-amber-400 shadow-md bg-zinc-800">
            <Image
              src={member.profileImageUrl as string}
              alt={displayName}
              fill
              sizes="112px"
              className="object-cover"
            />
          </div>
        ) : (
          <div
            aria-label={`${displayName} avatar`}
            className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-amber-400/90 bg-amber-500 text-3xl font-extrabold tracking-tight text-blue-950 shadow-md select-none"
          >
            {initials}
          </div>
        )}
      </div>

      {/* Member Details */}
      <div className="flex flex-1 flex-col justify-between p-6 text-center">
        <div className="space-y-2.5">
          {/* Designation Badge */}
          <div>
            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/50">
              {member.designation}
            </span>
          </div>

          {/* Full Name with Lion Title */}
          <h3 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-snug">
            {displayName}
          </h3>

          {/* Optional Bio (omitted gracefully when absent) */}
          {hasBio && (
            <p className="pt-1 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {cleanBio}
            </p>
          )}
        </div>

        {/* Optional Contact Email */}
        {member.contactEmail && (
          <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <a
              href={`mailto:${member.contactEmail}`}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-900 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 rounded-sm break-all"
            >
              <svg
                className="h-3.5 w-3.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
              <span>{member.contactEmail}</span>
            </a>
          </div>
        )}
      </div>
    </article>
  );
}
