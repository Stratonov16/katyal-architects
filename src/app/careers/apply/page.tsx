"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import AdminHeader from "@/components/AdminHeader";

export default function ApplyPage() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("id") || "";
  const jobTitle = searchParams.get("title") || "Open Position";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    let resumeUrl = "";

    // Upload resume if provided
    if (resume) {
      const formData = new FormData();
      formData.append("file", resume);
      formData.append("folder", "resumes");
      const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (uploadRes.ok) {
        const data = await uploadRes.json();
        resumeUrl = data.url;
      }
    }

    const res = await fetch("/api/public/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        job_id: jobId,
        job_title: jobTitle,
        name,
        email,
        phone,
        resume_url: resumeUrl,
        cover_letter: coverLetter,
      }),
    });

    setSubmitting(false);

    if (res.ok) {
      setSubmitted(true);
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong. Try again.");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <AdminHeader />
        <div className="flex flex-col items-center justify-center min-h-screen px-6">
          <h2 className="text-2xl font-light mb-4" style={{ fontFamily: "var(--font-display), serif" }}>
            Application Submitted
          </h2>
          <p className="text-sm text-[var(--text-muted)] text-center max-w-sm">
            Thank you for applying for <strong>{jobTitle}</strong>. We&apos;ll review your application and get back to you soon.
          </p>
          <a href="/careers" className="mt-8 text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            ← Back to Careers
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <AdminHeader />
      <div className="max-w-lg mx-auto px-8 pt-24 pb-20">
        <a href="/careers" className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
          ← Back to Careers
        </a>
        <h1 className="text-2xl font-light mt-4 mb-2" style={{ fontFamily: "var(--font-display), serif" }}>
          Apply
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">{jobTitle}</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors"
          />
          <div className="flex items-center border-b border-[var(--border)] focus-within:border-[var(--text)] transition-colors">
            <span className="text-sm text-[var(--text-muted)] pr-2">+91</span>
            <input
              type="tel"
              pattern="[0-9]{10}"
              maxLength={10}
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-full bg-transparent py-3 text-sm outline-none"
            />
          </div>
          <textarea
            placeholder="Cover Letter / Why you're a good fit (optional)"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={4}
            className="w-full bg-transparent border border-[var(--border)] rounded-md p-3 text-sm outline-none focus:border-[var(--text)] transition-colors resize-none"
          />
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-2">Resume / Portfolio (PDF, max 20MB)</p>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResume(e.target.files?.[0] || null)}
              className="text-sm text-[var(--text-muted)]"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={submitting || !name || !email}
              className="text-xs uppercase tracking-[0.3em] border border-[var(--text)] px-8 py-4 rounded-md hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all duration-300 disabled:opacity-30"
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
