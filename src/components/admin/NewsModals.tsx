'use client';

import React from 'react';

interface DeleteModalProps {
  isOpen: boolean;
  itemTitle: string;
  itemType?: string;
  isDeleting?: boolean;
  errorMessage?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * SCR-19: Delete Confirmation Modal Pattern (Permanent)
 */
export function DeleteConfirmModal({
  isOpen,
  itemTitle,
  itemType = 'news article',
  isDeleting = false,
  errorMessage = null,
  onConfirm,
  onCancel,
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-6">
          {/* Warning Icon + Header */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
                aria-hidden="true"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <h3
                id="delete-modal-title"
                className="text-lg font-bold text-zinc-900 dark:text-white"
              >
                Permanently Delete {itemType.charAt(0).toUpperCase() + itemType.slice(1)}?
              </h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                Are you sure you want to delete <strong className="font-semibold text-zinc-900 dark:text-white">&ldquo;{itemTitle}&rdquo;</strong>?
              </p>
            </div>
          </div>

          {/* Explanation */}
          <div className="mt-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-800 dark:text-red-300 leading-relaxed">
            This action will permanently delete this {itemType} from the database. <strong>This action cannot be undone.</strong> Public visitors will no longer be able to see or access this content.
          </div>

          {errorMessage && (
            <div className="mt-3 p-3 rounded-xl bg-red-100 text-red-700 text-xs font-medium" role="alert">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-semibold rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            Cancel, Keep Record
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            data-testid="confirm-delete-button"
            className="px-4 py-2 text-sm font-semibold rounded-xl text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              'Yes, Permanently Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

interface UnpublishModalProps {
  isOpen: boolean;
  itemTitle: string;
  itemType?: string;
  isUnpublishing?: boolean;
  errorMessage?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * SCR-20: Unpublish Confirmation Modal Pattern (Reversible)
 */
export function UnpublishConfirmModal({
  isOpen,
  itemTitle,
  itemType = 'news article',
  isUnpublishing = false,
  errorMessage = null,
  onConfirm,
  onCancel,
}: UnpublishModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="unpublish-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
                aria-hidden="true"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </div>
            <div>
              <h3
                id="unpublish-modal-title"
                className="text-lg font-bold text-zinc-900 dark:text-white"
              >
                Unpublish {itemType.charAt(0).toUpperCase() + itemType.slice(1)}?
              </h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                Move <strong className="font-semibold text-zinc-900 dark:text-white">&ldquo;{itemTitle}&rdquo;</strong> back to drafts?
              </p>
            </div>
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            This will immediately remove this {itemType} from the public website. However, <strong>none of your content will be lost</strong>. The item will be safely saved in your CMS drafts, and you can edit or re-publish it at any time.
          </div>

          {errorMessage && (
            <div className="mt-3 p-3 rounded-xl bg-red-100 text-red-700 text-xs font-medium" role="alert">
              {errorMessage}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isUnpublishing}
            className="px-4 py-2 text-sm font-semibold rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            Cancel, Keep Live
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isUnpublishing}
            data-testid="confirm-unpublish-button"
            className="px-4 py-2 text-sm font-semibold rounded-xl text-blue-950 bg-amber-500 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all shadow-sm font-bold disabled:opacity-50 flex items-center gap-2"
          >
            {isUnpublishing ? (
              <>
                <span className="w-4 h-4 border-2 border-blue-950/30 border-t-blue-950 rounded-full animate-spin" />
                Unpublishing...
              </>
            ) : (
              'Yes, Unpublish and Move to Drafts'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
