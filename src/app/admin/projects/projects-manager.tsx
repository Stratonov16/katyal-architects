"use client";

import { useState, useEffect, useRef } from "react";
import AdminHeader from "@/components/AdminHeader";
import Toast from "@/components/Toast";
import VideoUploader from "@/components/VideoUploader";
import { uploadFileWithProgress } from "@/lib/upload";

type Project = {
  id: number;
  title: string;
  slug: string;
  category: string;
  location: string;
  year: number;
  description: string;
  video_url: string;
  status: string;
};

type ExistingImage = {
  id: number;
  image_url: string;
  is_featured: number;
  order: number;
};

type NewImage = {
  file: File;
  preview: string;
};

const CATEGORIES = [
  { name: "Residential", slug: "residential" },
  { name: "Hospitality", slug: "hospitality" },
  { name: "Interiors", slug: "interiors" },
  { name: "Landscape", slug: "landscape" },
  { name: "Commercial", slug: "commercial" },
  { name: "Township", slug: "township" },
];

export default function ProjectsManager({ userRole }: { userRole: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("residential");
  const [location, setLocation] = useState("");
  const [year, setYear] = useState(2026);
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [newImages, setNewImages] = useState<NewImage[]>([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadCurrent, setUploadCurrent] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [showVideoUploader, setShowVideoUploader] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing projects
  useEffect(() => {
    fetch("/api/admin/projects")
      .then((r) => r.json())
      .then((d) => { if (d.projects) setProjects(d.projects); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setTitle("");
    setCategory("residential");
    setLocation("");
    setYear(2026);
    setDescription("");
    setVideoUrl("");
    setExistingImages([]);
    setDeletedImageIds([]);
    setNewImages([]);
    setFeaturedIndex(0);
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = async (project: Project) => {
    setTitle(project.title);
    setCategory(project.category);
    setLocation(project.location);
    setYear(project.year);
    setDescription(project.description || "");
    setVideoUrl(project.video_url || "");
    setEditing(project);
    setShowForm(true);
    setNewImages([]);
    setDeletedImageIds([]);

    // Fetch existing images for this project
    const res = await fetch(`/api/admin/projects?id=${project.id}&images=true`);
    if (res.ok) {
      const data = await res.json();
      if (data.images) {
        setExistingImages(data.images);
        const featIdx = data.images.findIndex((img: ExistingImage) => img.is_featured);
        setFeaturedIndex(featIdx >= 0 ? featIdx : 0);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this project?")) return;
    const res = await fetch(`/api/admin/projects?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setProjects(projects.filter((p) => p.id !== id));
      setToast({ message: "Project deleted", type: "success" });
    } else {
      setToast({ message: "Failed to delete", type: "error" });
    }
  };

  const removeExistingImage = (imgId: number) => {
    setDeletedImageIds([...deletedImageIds, imgId]);
    setExistingImages(existingImages.filter((img) => img.id !== imgId));
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newImages[index].preview);
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewImages([...newImages, ...files]);
    e.target.value = "";
  };

  // Called when a video is chosen via the uploader (MP4 upload, YouTube or Instagram URL)
  const handleVideoSelect = async (video: { type: "upload" | "youtube" | "instagram"; file?: File; youtubeId?: string; youtubeUrl?: string; instagramEmbedUrl?: string }) => {
    setShowVideoUploader(false);
    if (video.type === "youtube" && video.youtubeUrl) {
      setVideoUrl(video.youtubeUrl);
      return;
    }
    if (video.type === "instagram" && video.instagramEmbedUrl) {
      // Store the embeddable URL directly so the project page iframes it as-is.
      setVideoUrl(video.instagramEmbedUrl);
      return;
    }
    if (video.type === "upload" && video.file) {
      setVideoUploading(true);
      setVideoProgress(0);
      try {
        const { url } = await uploadFileWithProgress(video.file, "projects/videos", (p) => setVideoProgress(p.percent));
        setVideoUrl(url);
        setToast({ message: "Video uploaded", type: "success" });
      } catch (err) {
        setToast({ message: err instanceof Error ? err.message : "Video upload failed", type: "error" });
      }
      setVideoUploading(false);
    }
  };

  // Total images count (existing not deleted + new)
  const totalImages = existingImages.length + newImages.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setUploadCurrent(0);
    setUploadTotal(newImages.length);
    setUploadProgress(0);

    // Upload new images first — one at a time, with per-file progress
    const uploadedUrls: string[] = [];
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
    for (let i = 0; i < newImages.length; i++) {
      setUploadCurrent(i + 1);
      setUploadProgress(0);
      try {
        const { url } = await uploadFileWithProgress(
          newImages[i].file,
          `projects/${slug}`,
          (p) => setUploadProgress(p.percent)
        );
        uploadedUrls.push(url);
      } catch (err) {
        setToast({ message: err instanceof Error ? err.message : "Image upload failed", type: "error" });
        setUploading(false);
        return;
      }
    }

    // Determine which is featured
    // featuredIndex is relative to the combined list (existing + new)
    let featuredUrl = "";
    if (featuredIndex < existingImages.length) {
      featuredUrl = existingImages[featuredIndex].image_url;
    } else {
      const newIdx = featuredIndex - existingImages.length;
      if (uploadedUrls[newIdx]) featuredUrl = uploadedUrls[newIdx];
    }

    const body = {
      id: editing?.id,
      title,
      slug,
      category,
      location,
      year,
      description,
      video_url: videoUrl,
      newImages: uploadedUrls,
      deletedImageIds,
      featuredUrl,
    };

    const res = await fetch("/api/admin/projects", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setUploading(false);

    if (res.ok) {
      setToast({ message: data.message || "Saved!", type: "success" });
      resetForm();
      const reload = await fetch("/api/admin/projects");
      const reloadData = await reload.json();
      if (reloadData.projects) setProjects(reloadData.projects);
    } else {
      setToast({ message: data.error || "Failed to save", type: "error" });
    }
  };

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
      <div className="max-w-5xl mx-auto px-8 pt-20 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <a href="/admin" className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              ← Dashboard
            </a>
            <h1 className="text-2xl font-light mt-2" style={{ fontFamily: "var(--font-display), serif" }}>
              Projects
            </h1>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="text-xs uppercase tracking-[0.2em] border border-[var(--text)] px-6 py-3 rounded-md hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all duration-300"
          >
            + Add Project
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="border border-[var(--border)] rounded-md p-6 mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6">
              {editing ? "Edit Project" : "New Project"}
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Project Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors"
              />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors"
                />
                <input
                  type="number"
                  placeholder="Year"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors"
                />
              </div>
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full bg-transparent border border-[var(--border)] rounded-md p-3 text-sm outline-none focus:border-[var(--text)] transition-colors resize-none"
              />
              {/* Video — upload an MP4 or paste a URL */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Video (optional)</p>
                  <button
                    type="button"
                    onClick={() => setShowVideoUploader(true)}
                    className="text-[10px] uppercase tracking-[0.15em] border border-[var(--border)] rounded px-3 py-1.5 hover:border-[var(--text)] transition-colors"
                  >
                    + Upload / YouTube
                  </button>
                </div>

                {videoUploading && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Uploading video</p>
                      <p className="text-[10px] tabular-nums text-[var(--text-muted)]">{videoProgress}%</p>
                    </div>
                    <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--text)] transition-all duration-200 ease-out" style={{ width: `${videoProgress}%` }} />
                    </div>
                  </div>
                )}

                <input
                  type="text"
                  placeholder="…or paste a video URL (YouTube or MP4)"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors"
                />

                {videoUrl && !videoUploading && (
                  <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)]">
                    {videoUrl.endsWith(".mp4") || videoUrl.endsWith(".webm") ? (
                      <video src={videoUrl} className="w-28 aspect-video object-cover rounded bg-black" muted playsInline />
                    ) : (
                      <span className="px-2 py-1 rounded bg-[var(--border)]">YouTube link</span>
                    )}
                    <span className="truncate flex-1">{videoUrl}</span>
                    <button
                      type="button"
                      onClick={() => setVideoUrl("")}
                      className="text-red-500 hover:underline flex-shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Image section */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3">
                  Images ({totalImages}) — click to set featured
                </p>

                {/* Existing images */}
                {existingImages.length > 0 && (
                  <div className="flex gap-2 flex-wrap mb-3">
                    {existingImages.map((img, i) => (
                      <div
                        key={img.id}
                        className={`relative w-20 h-20 rounded overflow-hidden cursor-pointer border-2 ${featuredIndex === i ? "border-green-500" : "border-transparent"}`}
                        onClick={() => setFeaturedIndex(i)}
                      >
                        <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                        {featuredIndex === i && (
                          <div className="absolute top-0 left-0 bg-green-500 text-white text-[7px] px-1">Featured</div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeExistingImage(img.id); }}
                          className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New images */}
                {newImages.length > 0 && (
                  <div className="flex gap-2 flex-wrap mb-3">
                    {newImages.map((img, i) => {
                      const combinedIdx = existingImages.length + i;
                      return (
                        <div
                          key={i}
                          className={`relative w-20 h-20 rounded overflow-hidden cursor-pointer border-2 ${featuredIndex === combinedIdx ? "border-green-500" : "border-transparent"}`}
                          onClick={() => setFeaturedIndex(combinedIdx)}
                        >
                          <img src={img.preview} alt="" className="w-full h-full object-cover" />
                          {featuredIndex === combinedIdx && (
                            <div className="absolute top-0 left-0 bg-green-500 text-white text-[7px] px-1">Featured</div>
                          )}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeNewImage(i); }}
                            className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] hover:bg-red-600"
                          >
                            ✕
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-blue-500/80 text-white text-[7px] text-center">New</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Upload button */}
                <div
                  className="border-2 border-dashed border-[var(--border)] rounded-md p-4 text-center cursor-pointer hover:border-[var(--text)] transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <p className="text-xs text-[var(--text-muted)]">+ Add more images</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>
              </div>

              {/* Upload progress bar */}
              {uploading && uploadTotal > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                      Uploading image {uploadCurrent} of {uploadTotal}
                    </p>
                    <p className="text-[10px] tabular-nums text-[var(--text-muted)]">{uploadProgress}%</p>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--text)] transition-all duration-200 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={uploading || !title}
                  className="text-xs uppercase tracking-[0.2em] border border-[var(--text)] px-6 py-3 rounded-md hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all duration-300 disabled:opacity-30"
                >
                  {uploading ? "Uploading..." : userRole === "super_admin" ? "Publish" : "Submit Draft"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs uppercase tracking-[0.2em] px-6 py-3 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Projects list */}
        <div className="space-y-3">
          {projects.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-12">No projects yet. Click + Add Project to create one.</p>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="border border-[var(--border)] rounded-md p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm">{project.title}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    {project.category} · {project.location} · {project.year}
                    {project.status === "draft" && <span className="ml-2 text-yellow-500">Draft</span>}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(project)}
                    className="text-[10px] px-3 py-1.5 border border-[var(--border)] rounded hover:bg-[var(--text)]/5 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="text-[10px] px-3 py-1.5 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Video uploader modal */}
      {showVideoUploader && (
        <VideoUploader
          onSelect={handleVideoSelect}
          onCancel={() => setShowVideoUploader(false)}
          allowInstagram
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
