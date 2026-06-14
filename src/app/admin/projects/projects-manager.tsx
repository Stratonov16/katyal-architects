"use client";

import { useState, useEffect, useRef } from "react";
import AdminHeader from "@/components/AdminHeader";
import Toast from "@/components/Toast";

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
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
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
    setImages([]);
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (project: Project) => {
    setTitle(project.title);
    setCategory(project.category);
    setLocation(project.location);
    setYear(project.year);
    setDescription(project.description || "");
    setVideoUrl(project.video_url || "");
    setEditing(project);
    setShowForm(true);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    // Upload images first
    const imageUrls: string[] = [];
    for (const file of images) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `projects/${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        imageUrls.push(data.url);
      }
    }

    // Save project
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
    const body = {
      id: editing?.id,
      title,
      slug,
      category,
      location,
      year,
      description,
      video_url: videoUrl,
      images: imageUrls,
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
      // Reload projects
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
      <div className="max-w-5xl mx-auto px-8 pt-20">
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
              <input
                type="text"
                placeholder="Video URL (optional — YouTube or MP4)"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors"
              />

              {/* Image upload */}
              <div>
                <div
                  className="border-2 border-dashed border-[var(--border)] rounded-md p-6 text-center cursor-pointer hover:border-[var(--text)] transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <p className="text-sm text-[var(--text-muted)]">
                    {images.length > 0 ? `${images.length} images selected` : "Click to add images"}
                  </p>
                  <p className="text-[9px] text-[var(--text-muted)] mt-1">JPG, PNG, WebP — first image becomes featured</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) setImages(Array.from(e.target.files));
                    }}
                  />
                </div>
                {images.length > 0 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto">
                    {images.map((img, i) => (
                      <div key={i} className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden">
                        <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                        {i === 0 && (
                          <div className="absolute top-0 left-0 bg-green-500 text-white text-[7px] px-1">Featured</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

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

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
