"use client";

import { useState, useEffect, useRef } from "react";
import AdminHeader from "@/components/AdminHeader";
import Toast from "@/components/Toast";
import { uploadFileWithProgress } from "@/lib/upload";

export default function AboutManager({ userRole }: { userRole: string }) {
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/about")
      .then((r) => r.json())
      .then((d) => {
        if (d.about) {
          setHeadline(d.about.headline || "");
          setDescription(d.about.description || "");
          setPhotoUrl(d.about.photo_url || "");
          setPhotoPreview(d.about.photo_url || "");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setUploadProgress(0);

    let finalPhotoUrl = photoUrl;

    if (photo) {
      try {
        const result = await uploadFileWithProgress(photo, "about", (p) => setUploadProgress(p.percent));
        finalPhotoUrl = result.url;
      } catch (err) {
        setToast({ message: err instanceof Error ? err.message : "Upload failed", type: "error" });
        setSaving(false);
        return;
      }
    }

    const res = await fetch("/api/admin/about", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ headline, description, photo_url: finalPhotoUrl }),
    });

    const data = await res.json();
    setSaving(false);

    if (res.ok) {
      setToast({ message: data.message || "Saved!", type: "success" });
      setPhotoUrl(finalPhotoUrl);
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
      <div className="max-w-3xl mx-auto px-8 pt-20 pb-20">
        <div className="mb-8">
          <a href="/admin" className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            ← Dashboard
          </a>
          <h1 className="text-2xl font-light mt-2" style={{ fontFamily: "var(--font-display), serif" }}>
            About
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo */}
          <div className="flex items-center gap-6">
            <div
              className="w-24 h-24 rounded-full bg-[var(--border)] cursor-pointer overflow-hidden flex items-center justify-center hover:opacity-80 transition-opacity"
              onClick={() => fileInputRef.current?.click()}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[9px] text-[var(--text-muted)]">+ Photo</span>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) { setPhoto(file); setPhotoPreview(URL.createObjectURL(file)); }
                }}
              />
            </div>
            <p className="text-[10px] text-[var(--text-muted)]">Click to upload/change photo</p>
          </div>

          <input
            type="text"
            placeholder="Headline (e.g., We design spaces that inspire...)"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors"
          />

          <textarea
            placeholder="Description / firm philosophy"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full bg-transparent border border-[var(--border)] rounded-md p-3 text-sm outline-none focus:border-[var(--text)] transition-colors resize-none"
          />

          {saving && photo && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Uploading photo</p>
                <p className="text-[10px] tabular-nums text-[var(--text-muted)]">{uploadProgress}%</p>
              </div>
              <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--text)] transition-all duration-200 ease-out" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="text-xs uppercase tracking-[0.2em] border border-[var(--text)] px-6 py-3 rounded-md hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all duration-300 disabled:opacity-30"
          >
            {saving ? "Saving..." : userRole === "super_admin" ? "Publish" : "Submit Draft"}
          </button>
        </form>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
