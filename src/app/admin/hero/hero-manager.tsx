"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ImageCropper, { CropData } from "@/components/ImageCropper";
import VideoUploader from "@/components/VideoUploader";
import AdminHeader from "@/components/AdminHeader";
import Toast from "@/components/Toast";
import { uploadFileWithProgress } from "@/lib/upload";

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadLabel, setUploadLabel] = useState("");
  const [projectsList, setProjectsList] = useState<{id: number; title: string; slug: string; category: string}[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing slides + projects list from D1
  useEffect(() => {
    async function fetchData() {
      try {
        const [slidesRes, projectsRes] = await Promise.all([
          fetch("/api/admin/hero"),
          fetch("/api/admin/projects"),
        ]);
        if (slidesRes.ok) {
          const data = await slidesRes.json();
          if (data.slides) {
            const existingSlides = data.slides.map((s: { image_url: string; project_title: string; project_link: string }, i: number) => ({
              id: String(i),
              imageUrl: s.image_url,
              projectTitle: s.project_title || "",
              projectLink: s.project_link || "",
              cropData: null,
            }));
            setSlides(existingSlides);
          }
        }
        if (projectsRes.ok) {
          const data = await projectsRes.json();
          if (data.projects) setProjectsList(data.projects);
        }
      } catch {
        // Silent fail
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Upload image/video to R2 with live progress
  const uploadImage = async (file: File): Promise<string | null> => {
    setUploading(true);
    setUploadProgress(0);
    setUploadLabel(file.name);
    try {
      const { url } = await uploadFileWithProgress(file, "hero", (p) => {
        setUploadProgress(p.percent);
      });
      setUploading(false);
      return url;
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Upload failed", type: "error" });
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
      setToast({ message: data.message || "Saved!", type: "success" });
    } catch {
      setToast({ message: "Failed to save. Try again.", type: "error" });
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
            <button
              onClick={handlePublish}
              disabled={slides.length === 0 || saving}
              className="text-xs uppercase tracking-[0.2em] border border-[var(--text)] px-6 py-3 rounded-md hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all duration-300 disabled:opacity-30"
            >
              {saving ? "Saving..." : userRole === "super_admin" ? "Publish" : "Submit for Approval"}
            </button>
          </div>
        </div>

        {/* Uploading progress bar */}
        {uploading && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] truncate pr-4">
                Uploading {uploadLabel}
              </p>
              <p className="text-[10px] tabular-nums text-[var(--text-muted)]">
                {uploadProgress}%
              </p>
            </div>
            <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--text)] transition-all duration-200 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            {uploadProgress === 100 && (
              <p className="text-[9px] text-[var(--text-muted)] mt-1.5">
                Processing on server…
              </p>
            )}
          </div>
        )}

        {/* Live preview */}
        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3">Live Preview</p>
          <div className="relative aspect-[16/7] bg-[var(--border)] rounded-md overflow-hidden">
            {slides.length > 0 ? (
              <>
                {slides[0].imageUrl.endsWith(".mp4") || slides[0].imageUrl.endsWith(".webm") ? (
                  <video src={slides[0].imageUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                ) : (
                  <img
                    src={slides[0].imageUrl}
                    alt="Hero preview"
                    className="w-full h-full object-cover"
                    style={slides[0].cropData ? {
                      objectPosition: `${50 + slides[0].cropData.x / 5}% ${50 + slides[0].cropData.y / 5}%`,
                      transform: `scale(${slides[0].cropData.zoom})`,
                    } : undefined}
                  />
                )}
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
              <div key={slide.id} className="border border-[var(--border)] rounded-md p-3 overflow-hidden">
                {/* Thumbnail — click to re-crop */}
                <div
                  className="relative w-full h-32 rounded overflow-hidden cursor-pointer group mb-3"
                  onClick={() => !slide.imageUrl.endsWith(".mp4") && !slide.imageUrl.endsWith(".webm") && setCroppingSlide(slide.id)}
                >
                  {slide.imageUrl.endsWith(".mp4") || slide.imageUrl.endsWith(".webm") ? (
                    <video src={slide.imageUrl} className="w-full h-full object-cover" muted playsInline />
                  ) : (
                    <img
                      src={slide.imageUrl}
                      alt={`Slide ${index + 1}`}
                      className="w-full h-full object-cover"
                      style={slide.cropData ? {
                        objectPosition: `${50 + slide.cropData.x / 5}% ${50 + slide.cropData.y / 5}%`,
                      } : undefined}
                    />
                  )}
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
                <select
                  value={slide.projectLink}
                  onChange={(e) => {
                    const selected = projectsList.find((p) => `/projects/${p.category}/${p.slug}` === e.target.value);
                    handleLinkChange(slide.id, e.target.value);
                    if (selected) handleTitleChange(slide.id, selected.title);
                  }}
                  className="w-full bg-transparent border-b border-[var(--border)] py-2 text-xs outline-none focus:border-[var(--text)] transition-colors mb-3"
                >
                  <option value="">Link to project</option>
                  {projectsList.map((p) => (
                    <option key={p.slug} value={`/projects/${p.category}/${p.slug}`}>
                      {p.title} ({p.category})
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
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
                  <span className="text-[10px] text-[var(--text-muted)]">Slide {index + 1}</span>
                  <button
                    onClick={() => handleDelete(slide.id)}
                    className="ml-auto text-[10px] px-2 py-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                  >
                    Delete
                  </button>
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

      {/* Toast notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
