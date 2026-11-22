'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useCallback } from 'react';
import type { ProjectGalleryImage } from '../../types/project.ts';

interface ProjectGalleryProps {
  photos?: ProjectGalleryImage[];
  projectTitle: string;
}

export const ProjectGallery: React.FC<ProjectGalleryProps> = ({ photos = [], projectTitle }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const validPhotos = React.useMemo(() => {
    if (!photos || !Array.isArray(photos)) return [];
    return photos.filter((p) => p && p.imageUrl && p.imageUrl.trim().length > 0);
  }, [photos]);

  const numPhotos = validPhotos.length;
  const isOpen = lightboxIndex !== null && lightboxIndex >= 0 && lightboxIndex < numPhotos;
  const currentPhoto = isOpen ? validPhotos[lightboxIndex] : null;

  const handleClose = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const handlePrev = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return null;
      return prev > 0 ? prev - 1 : numPhotos - 1;
    });
  }, [numPhotos]);

  const handleNext = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return null;
      return prev < numPhotos - 1 ? prev + 1 : 0;
    });
  }, [numPhotos]);

  // Keyboard navigation for Lightbox (ESC, Left, Right)
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, handleClose, handlePrev, handleNext]);

  // AC-2: Missing optional data (photos) is handled without empty boxes or errors.
  if (numPhotos === 0) {
    return null;
  }

  return (
    <section
      aria-label="Project Photo Gallery"
      data-testid="project-gallery-section"
      className="w-full max-w-full space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">
            📷
          </span>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Project Photographs & Activity Gallery
          </h2>
        </div>
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {validPhotos.length} {validPhotos.length === 1 ? 'photo' : 'photos'}
        </span>
      </div>

      {/* Responsive Gallery Grid: 1 col on mobile 360px, 2 col on sm, 3 col on lg */}
      <div
        data-testid="project-gallery-grid"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-full min-w-0"
      >
        {validPhotos.map((photo, idx) => {
          const photoCaption = photo.caption || `${projectTitle} activity photo ${idx + 1}`;
          return (
            <figure
              key={photo.id || idx}
              data-testid={`gallery-item-${idx}`}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 w-full min-w-0"
            >
              <button
                type="button"
                onClick={() => setLightboxIndex(idx)}
                aria-label={`View enlarged photo: ${photoCaption}`}
                className="relative aspect-video sm:aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <img
                  src={photo.imageUrl}
                  alt={photoCaption}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                    🔍 View Full
                  </span>
                </div>
              </button>
              {photo.caption && (
                <figcaption className="p-3 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/80">
                  {photo.caption}
                </figcaption>
              )}
            </figure>
          );
        })}
      </div>

      {/* Accessible Lightbox Modal */}
      {isOpen && currentPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged photo preview"
          data-testid="gallery-lightbox"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-6 backdrop-blur-sm animate-in fade-in"
          onClick={handleClose}
        >
          {/* Modal Container */}
          <div
            className="relative flex flex-col max-h-[92vh] max-w-5xl w-full items-center justify-center text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with Counter and Close Button */}
            <div className="flex w-full items-center justify-between pb-3 text-xs sm:text-sm text-zinc-300">
              <span data-testid="lightbox-counter" className="font-medium">
                Photo {(lightboxIndex ?? 0) + 1} of {validPhotos.length}
              </span>
              <button
                type="button"
                data-testid="lightbox-close-btn"
                onClick={handleClose}
                aria-label="Close photo preview"
                className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                ✕
              </button>
            </div>

            {/* Main Image with Navigation Arrows */}
            <div className="relative flex items-center justify-center w-full overflow-hidden rounded-xl bg-zinc-950 max-h-[75vh]">
              <img
                data-testid="lightbox-image"
                src={currentPhoto.imageUrl}
                alt={currentPhoto.caption || `${projectTitle} photo`}
                className="max-h-[75vh] w-auto max-w-full object-contain"
              />

              {validPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    data-testid="lightbox-prev-btn"
                    onClick={handlePrev}
                    aria-label="Previous photograph"
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 sm:p-3 text-white hover:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    ❮
                  </button>
                  <button
                    type="button"
                    data-testid="lightbox-next-btn"
                    onClick={handleNext}
                    aria-label="Next photograph"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 sm:p-3 text-white hover:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    ❯
                  </button>
                </>
              )}
            </div>

            {/* Bottom Caption */}
            {currentPhoto.caption && (
              <p
                data-testid="lightbox-caption"
                className="mt-3 text-center text-xs sm:text-sm text-zinc-300 max-w-2xl px-4"
              >
                {currentPhoto.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
