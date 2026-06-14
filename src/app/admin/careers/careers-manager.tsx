"use client";

import { useState, useEffect } from "react";
import AdminHeader from "@/components/AdminHeader";
import Toast from "@/components/Toast";

type Job = {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
  status: string;
};

type Application = {
  id: number;
  job_title: string;
  name: string;
  email: string;
  phone: string;
  resume_url: string;
  cover_letter: string;
  is_read: number;
  created_at: string;
};

export default function CareersManager({ userRole }: { userRole: string }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("Full-time");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/careers")
      .then((r) => r.json())
      .then((d) => {
        if (d.jobs) setJobs(d.jobs);
        if (d.applications) setApplications(d.applications);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setTitle("");
    setDepartment("");
    setLocation("");
    setType("Full-time");
    setDescription("");
    setRequirements("");
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (job: Job) => {
    setTitle(job.title);
    setDepartment(job.department || "");
    setLocation(job.location || "");
    setType(job.type || "Full-time");
    setDescription(job.description || "");
    setRequirements(job.requirements || "");
    setEditing(job);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this job posting?")) return;
    const res = await fetch(`/api/admin/careers?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setJobs(jobs.filter((j) => j.id !== id));
      setToast({ message: "Deleted", type: "success" });
    } else {
      setToast({ message: "Failed to delete", type: "error" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const body = { id: editing?.id, title, department, location, type, description, requirements };

    const res = await fetch("/api/admin/careers", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setSaving(false);

    if (res.ok) {
      setToast({ message: data.message || "Saved!", type: "success" });
      resetForm();
      const reload = await fetch("/api/admin/careers");
      const reloadData = await reload.json();
      if (reloadData.jobs) setJobs(reloadData.jobs);
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
              Careers
            </h1>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="text-xs uppercase tracking-[0.2em] border border-[var(--text)] px-6 py-3 rounded-md hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all duration-300"
          >
            + Add Job
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="border border-[var(--border)] rounded-md p-6 mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6">
              {editing ? "Edit Job" : "New Job Posting"}
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Job Title (e.g., Senior Architect)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Department (e.g., Design)"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors"
                />
                <input
                  type="text"
                  placeholder="Location (e.g., Hanumangarh)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors"
                />
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors"
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Internship</option>
                  <option>Contract</option>
                  <option>Freelance</option>
                </select>
              </div>
              <textarea
                placeholder="Job Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-transparent border border-[var(--border)] rounded-md p-3 text-sm outline-none focus:border-[var(--text)] transition-colors resize-none"
              />
              <textarea
                placeholder="Requirements (skills, experience, qualifications)"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows={3}
                className="w-full bg-transparent border border-[var(--border)] rounded-md p-3 text-sm outline-none focus:border-[var(--text)] transition-colors resize-none"
              />
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving || !title}
                  className="text-xs uppercase tracking-[0.2em] border border-[var(--text)] px-6 py-3 rounded-md hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all duration-300 disabled:opacity-30"
                >
                  {saving ? "Saving..." : userRole === "super_admin" ? "Publish" : "Submit Draft"}
                </button>
                <button type="button" onClick={resetForm} className="text-xs uppercase tracking-[0.2em] px-6 py-3 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Jobs list */}
        <div className="space-y-3">
          {jobs.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-12">No job postings yet.</p>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="border border-[var(--border)] rounded-md p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm">{job.title}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    {job.department} · {job.location} · {job.type}
                    {job.status === "draft" && <span className="ml-2 text-yellow-500">Draft</span>}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(job)} className="text-[10px] px-3 py-1.5 border border-[var(--border)] rounded hover:bg-[var(--text)]/5 transition-colors">Edit</button>
                  <button onClick={() => handleDelete(job.id)} className="text-[10px] px-3 py-1.5 text-red-500 hover:bg-red-500/10 rounded transition-colors">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Applications */}
        {applications.length > 0 && (
          <div className="mt-12">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4">
              Applications ({applications.filter((a) => !a.is_read).length} new)
            </p>
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className={`border rounded-md p-4 ${app.is_read ? "border-[var(--border)] opacity-60" : "border-[var(--review-border)]"}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm">{app.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">{app.email} · {app.phone}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">Applied for: {app.job_title}</p>
                      {app.cover_letter && (
                        <p className="text-xs text-[var(--text-muted)] mt-2 italic">&ldquo;{app.cover_letter.slice(0, 150)}{app.cover_letter.length > 150 ? "..." : ""}&rdquo;</p>
                      )}
                      {app.resume_url && (
                        <a href={app.resume_url} target="_blank" className="text-[9px] uppercase tracking-[0.1em] text-[#c9a84c] mt-2 inline-block hover:opacity-70">
                          View Resume ↗
                        </a>
                      )}
                      <p className="text-[9px] text-[var(--text-muted)] mt-2">{app.created_at}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
