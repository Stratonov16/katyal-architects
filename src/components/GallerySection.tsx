"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { thumb } from "@/lib/media";

type Props = {
  images: { image_url: string; is_featured: number }[];
  title: string;
};

export default function GallerySection({ images, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);

  // Fade tiles in as they scroll into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("tile-in");
        });
      },
      { threshold: 0.1 }
    );
    const items = containerRef.current?.querySelectorAll(".gallery-tile");
    items?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const close = useCallback(() => setLightbox(null), []);
  const next = useCallback(
    () => setLightbox((i) => (i === null ? i : (i + 1) % images.length)),
    [images.length]
  );
  const prev = useCallback(
    () => setLightbox((i) => (i === null ? i : (i - 1 + images.length) % images.length)),
    [images.length]
  );

  // Keyboard controls + scroll lock while the lightbox is open
  useEffect(() => {
    if (lightbox === null) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox, close, next, prev]);

  if (!images.length) return null;

  return (
    <>
      {/* Masonry tiles — images keep their natural aspect ratio */}
      <div
        ref={containerRef}
        className="columns-1 sm:columns-2 lg:columns-3 gap-3 md:gap-4 [column-fill:_balance]"
      >
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setLightbox(i)}
            className="gallery-tile group relative block w-full mb-3 md:mb-4 break-inside-avoid overflow-hidden rounded-md cursor-zoom-in"
            aria-label={`Open image ${i + 1}`}
          >
            <img
              src={thumb(img.image_url, { width: 700 })}
              alt={`${title} ${i + 1}`}
              loading="lazy"
              decoding="async"
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
              className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-500 select-none"
            />
            {/* Watermark */}
            <span className="pointer-events-none absolute bottom-2 right-2 text-[8px] md:text-[9px] tracking-[0.15em] uppercase text-white/55 [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
              Katyal Architects
            </span>
          </button>
        ))}
      </div>

      {/* Lightbox — full image, click outside / X / arrows / Esc to control */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={close}
        >
          {/* Close */}
          <button
            onClick={close}
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                aria-label="Previous image"
              >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                aria-label="Next image"
              >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </>
          )}

          {/* The full image */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[lightbox].image_url}
              alt={`${title} ${lightbox + 1}`}
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
              className="max-w-[92vw] max-h-[88vh] w-auto h-auto object-contain rounded select-none"
            />
            {/* Watermark */}
            <span className="pointer-events-none absolute bottom-3 right-3 text-[10px] md:text-xs tracking-[0.2em] uppercase text-white/60 [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]">
              Katyal Architects
            </span>
          </div>

          {images.length > 1 && (
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] tracking-[0.2em] text-white/60 tabular-nums">
              {lightbox + 1} / {images.length}
            </p>
          )}
        </div>
      )}
    </>
  );
}
