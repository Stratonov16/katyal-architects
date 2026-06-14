"use client";

import { useState, useRef, useEffect } from "react";
import ImageCropper, { CropData } from "@/components/ImageCropper";
import VideoUploader from "@/components/VideoUploader";
import AdminHeader from "@/components/AdminHeader";
import { projects } from "@/lib/projects";

type HeroSlide = {
  id: string;
  imageUrl: string;
  projectTitle: string;
  projectLink: string;
  cropData: CropData | null;
};

export default function HeroManager({ userRole }: { userRole: string }) {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [croppingSlide, setCroppingSlide] = useState<string | null>(null);
  const [showVideoUploader, setShowVideoUploader] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing slides from D1
  useEffect(() => {
    async function fetchSlides() {
      try {
        const res = await fetch("/api/admin/hero");
        if (res.ok) {
          const data = await res.json();
          const existingSlides = data.slides.map((s: { image_url: string; project_title: string; project_link: string }, i: number) => ({
            id: String(i),
            imageUrl: s.image_url,
            projectTitle: s.project_title || "",
            projectLink: s.project_link || "",
            cropData: null,
          }));
          setSlides(existingSlides);
        }
      } catch {
        // No existing slides or not connected to DB yet
      }
      setLoading(false);
    }
    fetchSlides();
  }, []);

  // Upload image to R2
  const uploadImage = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "hero");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error || "Upload failed");
        setUploading(false);
        return null;
      }

      const data = await res.json();
      setUploading(false);
      return data.url;
    } catch {
      setMessage("Upload failed");
      setUploading(false);
      return null;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;

      // Upload to R2 first
      const url = await uploadImage(file);
      if (!url) continue;

      const newSlide: HeroSlide = {
        id: Date.now().toString() + Math.random(),
        imageUrl: url,
        projectTitle: "",
        projectLink: "",
        cropData: null,
      };
      setSlides((prev) => [...prev, newSlide]);
      setCroppingSlide(newSlide.id);
    }

    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;

      const url = await uploadImage(file);
      if (!url) continue;

      const newSlide: HeroSlide = {
        id: Date.now().toString() + Math.random(),
        imageUrl: url,
        projectTitle: "",
        projectLink: "",
        cropData: null,
      };
      setSlides((prev) => [...prev, newSlide]);
      setCroppingSlide(newSlide.id);
    }
  };

  const handleCropApply = (id: string, cropData: CropData) => {
    setSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, cropData } : s))
    );
    setCroppingSlide(null);
  };

  const handleDelete = (id: string) => {
    setSlides((prev) => prev.filter((s) => s.id !== id));
  };

  const handleTitleChange = (id: string, title: string) => {
    setSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, projectTitle: title } : s))
    );
  };

  const handleLinkChange = (id: string, link: string) => {
    setSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, projectLink: link } : s))
    );
  };

  const moveSlide = (id: string, direction: -1 | 1) => {
    const index = slides.findIndex((s) => s.id === id);
    if (index < 0) return;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= slides.length) return;
    const newSlides = [...slides];
    [newSlides[index], newSlides[newIndex]] = [newSlides[newIndex], newSlides[index]];
    setSlides(newSlides);
  };

  // Publish — save to D1
  const handlePublish = async () => {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slides: slides.map((s) => ({
            imageUrl: s.imageUrl,
            projectTitle: s.projectTitle,
            projectLink: s.projectLink,
          })),
        }),
      });

      const data = await res.json();
      setMessage(data.message || "Saved!");
    } catch {
      setMessage("Failed to save. Try again.");
    }

    setSaving(false);
  };

  const croppingSlideData = slides.find((s) => s.id === croppingSlide);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <AdminHeader />
        <div className="flex items-center justify-center pt-32">
          <p className="text-sm text-[var(--text-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <AdminHeader />
      <div className="max-w-5xl mx-auto px-8 pt-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <a href="/admin" className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              ← Dashboard
            </a>
            <h1 className="text-2xl font-light mt-2" style={{ fontFamily: "var(--font-display), serif" }}>
              Hero Carousel
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {message && <p className="text-xs text-[var(--text-muted)]">{message}</p>}
            <button
              onClick={handlePublish}
              disabled={slides.length === 0 || saving}
              className="text-xs uppercase tracking-[0.2em] border border-[var(--text)] px-6 py-3 rounded-md hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all duration-300 disabled:opacity-30"
            >
              {saving ? "Saving..." : userRole === "super_admin" ? "Publish" : "Submit for Approval"}
            </button>
          </div>
        </div>

        {/* Uploading indicator */}
        {uploading && (
          <div className="mb-4 text-xs text-[var(--text-muted)] animate-pulse">Uploading image...</div>
        )}

        {/* Live preview */}
        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3">Live Preview</p>
          <div className="relative aspect-[16/7] bg-[var(--border)] rounded-md overflow-hidden">
            {slides.length > 0 ? (
              <>
                <img
                  src={slides[0].imageUrl}
                  alt="Hero preview"
                  className="w-full h-full object-cover"
                  style={slides[0].cropData ? {
                    objectPosition: `${50 + slides[0].cropData.x / 5}% ${50 + slides[0].cropData.y / 5}%`,
                    transform: `scale(${slides[0].cropData.zoom})`,
                  } : undefined}
                />
                <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded">
                  <p className="text-[10px] text-white/70 uppercase tracking-[0.15em]">
                    {slides[0].projectTitle || "Untitled"}
                  </p>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-sm">
                No slides yet — upload images below
              </div>
            )}
          </div>
        </div>

        {/* Upload area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div
            className="border-2 border-dashed border-[var(--border)] rounded-md p-8 text-center cursor-pointer hover:border-[var(--text)] transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <p className="text-sm text-[var(--text-muted)]">Add Image</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-2">Drop or click — JPG, PNG, WebP</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
          <div
            className="border-2 border-dashed border-[var(--border)] rounded-md p-8 text-center cursor-pointer hover:border-[var(--text)] transition-colors"
            onClick={() => setShowVideoUploader(true)}
          >
            <p className="text-sm text-[var(--text-muted)]">Add Video</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-2">Upload MP4 or paste YouTube URL</p>
          </div>
        </div>

        {/* Slides list */}
        {slides.length > 0 && (
          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Slides ({slides.length})
            </p>
            {slides.map((slide, index) => (
              <div key={slide.id} className="border border-[var(--border)] rounded-md p-4">
                <div className="flex gap-4">
                  {/* Thumbnail — click to re-crop */}
                  <div
                    className="relative w-48 h-28 rounded overflow-hidden cursor-pointer flex-shrink-0 group"
                    onClick={() => setCroppingSlide(slide.id)}
                  >
                    <img
                      src={slide.imageUrl}
                      alt={`Slide ${index + 1}`}
                      className="w-full h-full object-cover"
                      style={slide.cropData ? {
                        objectPosition: `${50 + slide.cropData.x / 5}% ${50 + slide.cropData.y / 5}%`,
                      } : undefined}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <p className="text-[9px] text-white opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-[0.1em]">
                        Edit Crop
                      </p>
                    </div>
                    {slide.cropData && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-[8px] text-white">✓</span>
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex-1 space-y-3">
                    <select
                      value={slide.projectLink}
                      onChange={(e) => {
                        const selected = projects.find((p) => `/projects/${p.category}/${p.slug}` === e.target.value);
                        handleLinkChange(slide.id, e.target.value);
                        if (selected) handleTitleChange(slide.id, selected.title);
                      }}
                      className="w-full bg-transparent border-b border-[var(--border)] py-2 text-sm outline-none focus:border-[var(--text)] transition-colors"
                    >
                      <option value="">Link to project</option>
                      {projects.map((p) => (
                        <option key={p.slug} value={`/projects/${p.category}/${p.slug}`}>
                          {p.title} ({p.category})
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => moveSlide(slide.id, -1)}
                        disabled={index === 0}
                        className="text-[10px] px-2 py-1 border border-[var(--border)] rounded hover:bg-[var(--text)]/5 disabled:opacity-30 transition-colors"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveSlide(slide.id, 1)}
                        disabled={index === slides.length - 1}
                        className="text-[10px] px-2 py-1 border border-[var(--border)] rounded hover:bg-[var(--text)]/5 disabled:opacity-30 transition-colors"
                      >
                        ↓
                      </button>
                      <span className="text-[10px] text-[var(--text-muted)] ml-2">Slide {index + 1}</span>
                      <button
                        onClick={() => handleDelete(slide.id)}
                        className="ml-auto text-[10px] px-2 py-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Crop modal */}
      {croppingSlide && croppingSlideData && (
        <ImageCropper
          imageUrl={croppingSlideData.imageUrl}
          type="hero"
          initialCrop={croppingSlideData.cropData || undefined}
          onApply={(cropData) => handleCropApply(croppingSlide, cropData)}
          onCancel={() => setCroppingSlide(null)}
        />
      )}

      {/* Video uploader modal */}
      {showVideoUploader && (
        <VideoUploader
          onSelect={async (video) => {
            let url = "";
            if (video.type === "upload" && video.file) {
              const uploaded = await uploadImage(video.file);
              url = uploaded || "";
            } else if (video.type === "youtube" && video.youtubeId) {
              url = `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`;
            }
            if (url) {
              const newSlide: HeroSlide = {
                id: Date.now().toString() + Math.random(),
                imageUrl: url,
                projectTitle: "",
                projectLink: "",
                cropData: null,
              };
              setSlides((prev) => [...prev, newSlide]);
            }
            setShowVideoUploader(false);
          }}
          onCancel={() => setShowVideoUploader(false)}
        />
      )}
    </div>
  );
}
