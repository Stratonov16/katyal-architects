"use client";

import { useState, useEffect, useRef } from "react";
import AdminHeader from "@/components/AdminHeader";
import Toast from "@/components/Toast";
import { uploadFileWithProgress } from "@/lib/upload";

type TeamMember = {
  id: number;
  name: string;
  role: string;
  photo_url: string;
  order: number;
  status: string;
};

export default function TeamManager({ userRole }: { userRole: string }) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/team")
      .then((r) => r.json())
      .then((d) => { if (d.members) setMembers(d.members); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setName("");
    setRole("");
    setPhoto(null);
    setPhotoPreview("");
    setEditing(null);
    setShowForm(false);
  };

  const handleReorder = async (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= members.length) return;
    const newMembers = [...members];
    [newMembers[index], newMembers[newIndex]] = [newMembers[newIndex], newMembers[index]];
    setMembers(newMembers);

    // Save new order to DB
    await fetch("/api/admin/team/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: newMembers.map((m) => m.id) }),
    });
  };

  const handleEdit = (member: TeamMember) => {
    setName(member.name);
    setRole(member.role);
    setPhotoPreview(member.photo_url || "");
    setEditing(member);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this team member?")) return;
    const res = await fetch(`/api/admin/team?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setMembers(members.filter((m) => m.id !== id));
      setToast({ message: "Deleted", type: "success" });
    } else {
      setToast({ message: "Failed to delete", type: "error" });
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setUploadProgress(0);

    let photoUrl = editing?.photo_url || "";

    // Upload new photo if selected — directly to R2
    if (photo) {
      try {
        const result = await uploadFileWithProgress(photo, "team", (p) => setUploadProgress(p.percent));
        photoUrl = result.url;
      } catch (err) {
        setToast({ message: err instanceof Error ? err.message : "Upload failed", type: "error" });
        setUploading(false);
        return;
      }
    }

    const body = { id: editing?.id, name, role, photo_url: photoUrl };

    const res = await fetch("/api/admin/team", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setUploading(false);

    if (res.ok) {
      setToast({ message: data.message || "Saved!", type: "success" });
      resetForm();
      const reload = await fetch("/api/admin/team");
      const reloadData = await reload.json();
      if (reloadData.members) setMembers(reloadData.members);
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <a href="/admin" className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              ← Dashboard
            </a>
            <h1 className="text-2xl font-light mt-2" style={{ fontFamily: "var(--font-display), serif" }}>
              Team
            </h1>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="text-xs uppercase tracking-[0.2em] border border-[var(--text)] px-6 py-3 rounded-md hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all duration-300"
          >
            + Add Member
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="border border-[var(--border)] rounded-md p-6 mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6">
              {editing ? "Edit Member" : "New Member"}
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-6 items-start">
                {/* Photo */}
                <div
                  className="w-20 h-20 rounded-full bg-[var(--border)] flex-shrink-0 cursor-pointer overflow-hidden flex items-center justify-center hover:opacity-80 transition-opacity"
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
                    onChange={handlePhotoSelect}
                  />
                </div>

                {/* Fields */}
                <div className="flex-1 space-y-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-transparent border-b border-[var(--border)] py-2 text-sm outline-none focus:border-[var(--text)] transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Designation / Role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-transparent border-b border-[var(--border)] py-2 text-sm outline-none focus:border-[var(--text)] transition-colors"
                  />
                </div>
              </div>

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
                  disabled={uploading || !name}
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

        {/* Members list */}
        <div className="space-y-3">
          {members.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-12">No team members yet.</p>
          ) : (
            members.map((member, index) => (
              <div key={member.id} className="border border-[var(--border)] rounded-md p-4 flex items-center gap-4">
                {/* Reorder buttons */}
                {userRole === "super_admin" && (
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleReorder(index, -1)}
                      disabled={index === 0}
                      className="text-[10px] px-1.5 py-0.5 border border-[var(--border)] rounded hover:bg-[var(--text)]/5 disabled:opacity-20 transition-colors"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleReorder(index, 1)}
                      disabled={index === members.length - 1}
                      className="text-[10px] px-1.5 py-0.5 border border-[var(--border)] rounded hover:bg-[var(--text)]/5 disabled:opacity-20 transition-colors"
                    >
                      ↓
                    </button>
                  </div>
                )}
                <div className="w-12 h-12 rounded-full bg-[var(--border)] overflow-hidden flex-shrink-0">
                  {member.photo_url && <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{member.name}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{member.role}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(member)}
                    className="text-[10px] px-3 py-1.5 border border-[var(--border)] rounded hover:bg-[var(--text)]/5 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
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
