"use client";

import { useEffect, useRef } from "react";

type Props = {
  images: { image_url: string; is_featured: number }[];
  title: string;
};

export default function GallerySection({ images, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.2 }
    );

    const items = containerRef.current?.querySelectorAll(".gallery-image");
    items?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="space-y-4 md:space-y-6">
      {images.map((img, i) => (
        <div key={i} className="gallery-image w-full">
          <img
            src={img.image_url}
            alt={`${title} ${i + 1}`}
            className="w-full h-auto object-cover"
          />
        </div>
      ))}
    </div>
  );
}
