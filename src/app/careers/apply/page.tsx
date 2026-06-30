"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { uploadFileWithProgress } from "@/lib/upload";

function ApplyForm() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("id") || "";
  const jobTitle = searchParams.get("title") || "Open Position";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    let resumeUrl = "";

    if (resume) {
      try {
        setUploadProgress(0);
        const { url } = await uploadFileWithProgress(resume, "resumes", (p) => setUploadProgress(p.percent));
        resumeUrl = url;
      } catch {
        setError("Could not upload your resume. Please try again.");
        setSubmitting(false);
        return;
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
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
          {/* Golden check */}
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-[var(--career-accent)]/10 text-[var(--career-accent)] career-rise">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-light mb-3 career-rise" style={{ fontFamily: "var(--font-display), serif", animationDelay: "0.1s" }}>
            Application Submitted
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-sm leading-relaxed career-rise" style={{ animationDelay: "0.2s" }}>
            Thank you for applying for <span className="text-[var(--text)]">{jobTitle}</span>. We&apos;ll review your application and get back to you soon.
          </p>
          <Link href="/careers" className="mt-8 text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors career-rise" style={{ animationDelay: "0.3s" }}>
            ← Back to Careers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />
      <div className="relative overflow-hidden">
        {/* Soft golden glow */}
        <div className="pointer-events-none absolute top-0 inset-x-0 -z-10 flex justify-center">
          <div className="w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] rounded-full bg-[var(--career-accent)] opacity-[0.06] blur-[120px]" />
        </div>

        <div className="max-w-lg mx-auto px-8 pt-28 pb-20">
          <Link href="/careers" className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors career-rise">
            ← Back to Careers
          </Link>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--career-accent)] mt-6 mb-2 career-rise" style={{ animationDelay: "0.05s" }}>
            Application
          </p>
          <h1 className="text-3xl md:text-4xl font-light mb-1 career-rise" style={{ fontFamily: "var(--font-display), serif", animationDelay: "0.1s" }}>
            Apply for
          </h1>
          <p className="text-lg gold-text font-light mb-8 career-rise" style={{ animationDelay: "0.15s" }}>{jobTitle}</p>

          <form onSubmit={handleSubmit} className="space-y-5 career-rise" style={{ animationDelay: "0.2s" }}>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--career-accent)] transition-colors"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--career-accent)] transition-colors"
            />
            <div className="flex items-center border-b border-[var(--border)] focus-within:border-[var(--career-accent)] transition-colors">
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
              className="w-full bg-transparent border border-[var(--border)] rounded-md p-3 text-sm outline-none focus:border-[var(--career-accent)] transition-colors resize-none"
            />

            {/* Resume upload */}
            <label className="block border border-dashed border-[var(--border)] rounded-md p-5 cursor-pointer hover:border-[var(--career-accent)] transition-colors">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-2">Resume / Portfolio (PDF, max 20MB)</p>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-[var(--career-accent)]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                </span>
                <span className={resume ? "text-[var(--text)]" : "text-[var(--text-muted)]"}>
                  {resume ? resume.name : "Click to choose a file"}
                </span>
              </div>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResume(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>

            {submitting && resume && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Uploading resume</p>
                  <p className="text-[10px] tabular-nums text-[var(--text-muted)]">{uploadProgress}%</p>
                </div>
                <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--career-accent)] transition-all duration-200 ease-out" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            {error && <p className="text-xs text-red-500">{error}</p>}

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={submitting || !name || !email}
                className="apply-btn text-xs uppercase tracking-[0.3em] font-medium px-10 py-4 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting…" : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]"><Navbar /><div className="flex items-center justify-center pt-32"><p className="text-sm text-[var(--text-muted)]">Loading…</p></div></div>}>
      <ApplyForm />
    </Suspense>
  );
}
