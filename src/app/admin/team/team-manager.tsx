"use client";

import { useState, useEffect, useRef } from "react";
import AdminHeader from "@/components/AdminHeader";
import Toast from "@/components/Toast";

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

    let photoUrl = editing?.photo_url || "";

    // Upload new photo if selected
    if (photo) {
      const formData = new FormData();
      formData.append("file", photo);
      formData.append("folder", "team");
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        photoUrl = data.url;
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
            members.map((member) => (
              <div key={member.id} className="border border-[var(--border)] rounded-md p-4 flex items-center gap-4">
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
