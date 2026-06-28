"use client";

import { useState, useEffect, useRef } from "react";
import AdminHeader from "@/components/AdminHeader";
import Toast from "@/components/Toast";
import { uploadFileWithProgress } from "@/lib/upload";

type Review = {
  id: number;
  client_name: string;
  project_name: string;
  quote: string;
  photo_url: string;
  order: number;
  status: string;
};

export default function ReviewsManager({ userRole }: { userRole: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Review | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [clientName, setClientName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [quote, setQuote] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/reviews")
      .then((r) => r.json())
      .then((d) => { if (d.reviews) setReviews(d.reviews); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setClientName("");
    setProjectName("");
    setQuote("");
    setPhoto(null);
    setPhotoPreview("");
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (review: Review) => {
    setClientName(review.client_name);
    setProjectName(review.project_name || "");
    setQuote(review.quote);
    setPhotoPreview(review.photo_url || "");
    setEditing(review);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this review?")) return;
    const res = await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setReviews(reviews.filter((r) => r.id !== id));
      setToast({ message: "Deleted", type: "success" });
    } else {
      setToast({ message: "Failed to delete", type: "error" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setUploadProgress(0);

    let photoUrl = editing?.photo_url || "";

    if (photo) {
      try {
        const result = await uploadFileWithProgress(photo, "reviews", (p) => setUploadProgress(p.percent));
        photoUrl = result.url;
      } catch (err) {
        setToast({ message: err instanceof Error ? err.message : "Upload failed", type: "error" });
        setUploading(false);
        return;
      }
    }

    const body = { id: editing?.id, client_name: clientName, project_name: projectName, quote, photo_url: photoUrl };

    const res = await fetch("/api/admin/reviews", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setUploading(false);

    if (res.ok) {
      setToast({ message: data.message || "Saved!", type: "success" });
      resetForm();
      const reload = await fetch("/api/admin/reviews");
      const reloadData = await reload.json();
      if (reloadData.reviews) setReviews(reloadData.reviews);
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
      <div className="max-w-4xl mx-auto px-8 pt-20 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <a href="/admin" className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              ← Dashboard
            </a>
            <h1 className="text-2xl font-light mt-2" style={{ fontFamily: "var(--font-display), serif" }}>
              Reviews
            </h1>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="text-xs uppercase tracking-[0.2em] border border-[var(--text)] px-6 py-3 rounded-md hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all duration-300"
          >
            + Add Review
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="border border-[var(--border)] rounded-md p-6 mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6">
              {editing ? "Edit Review" : "New Review"}
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-6 items-start">
                <div
                  className="w-14 h-14 rounded-full bg-[var(--border)] flex-shrink-0 cursor-pointer overflow-hidden flex items-center justify-center hover:opacity-80 transition-opacity"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[8px] text-[var(--text-muted)]">Photo</span>
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
                <div className="flex-1 space-y-4">
                  <input
                    type="text"
                    placeholder="Client Name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                    className="w-full bg-transparent border-b border-[var(--border)] py-2 text-sm outline-none focus:border-[var(--text)] transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Project Name (optional)"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full bg-transparent border-b border-[var(--border)] py-2 text-sm outline-none focus:border-[var(--text)] transition-colors"
                  />
                </div>
              </div>
              <textarea
                placeholder="Review / Testimonial quote"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                required
                rows={3}
                className="w-full bg-transparent border border-[var(--border)] rounded-md p-3 text-sm outline-none focus:border-[var(--text)] transition-colors resize-none"
              />
              {uploading && photo && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Uploading photo</p>
                    <p className="text-[10px] tabular-nums text-[var(--text-muted)]">{uploadProgress}%</p>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--text)] transition-all duration-200 ease-out" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={uploading || !clientName || !quote}
                  className="text-xs uppercase tracking-[0.2em] border border-[var(--text)] px-6 py-3 rounded-md hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all duration-300 disabled:opacity-30"
                >
                  {uploading ? "Uploading..." : userRole === "super_admin" ? "Publish" : "Submit Draft"}
                </button>
                <button type="button" onClick={resetForm} className="text-xs uppercase tracking-[0.2em] px-6 py-3 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reviews list */}
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-12">No reviews yet.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border border-[var(--border)] rounded-md p-4">
                <p className="text-sm italic">&ldquo;{review.quote}&rdquo;</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    {review.photo_url && <img src={review.photo_url} alt="" className="w-8 h-8 rounded-full object-cover" />}
                    <div>
                      <p className="text-xs">{review.client_name}</p>
                      {review.project_name && <p className="text-[9px] text-[var(--text-muted)]">{review.project_name}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(review)} className="text-[10px] px-3 py-1.5 border border-[var(--border)] rounded hover:bg-[var(--text)]/5 transition-colors">Edit</button>
                    <button onClick={() => handleDelete(review.id)} className="text-[10px] px-3 py-1.5 text-red-500 hover:bg-red-500/10 rounded transition-colors">Delete</button>
                  </div>
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
