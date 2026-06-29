export const runtime = "edge";

import type { Metadata } from "next";
import Link from "next/link";
import { query } from "@/lib/db";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join Katyal Architects. We're looking for passionate architects, designers, and creative minds.",
};

type Job = {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
};

export default async function CareersPage() {
  const jobs = await query<Job>(
    `SELECT * FROM careers WHERE status = 'published' ORDER BY created_at DESC`
  );

  const perks = [
    { icon: "M12 2l2.09 6.26L20.5 8.5l-5 4.13L17.4 19 12 15.27 6.6 19l1.9-6.37-5-4.13 6.41-.24L12 2z", title: "Real Impact", desc: "Your work shapes spaces people live and grow in." },
    { icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 1 0 0 M23 21v-2a4 4 0 0 0-3-3.87", title: "Learn", desc: "Learn directly from the principal architect, every day." },
    { icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z", title: "Creative Freedom", desc: "Bring bold ideas — we build a culture that backs them." },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-14">
        {/* Hero */}
        <section className="relative overflow-hidden px-8 pt-24 pb-20 text-center">
          {/* Soft golden glow backdrop */}
          <div className="pointer-events-none absolute inset-0 -z-10 flex items-start justify-center">
            <div className="w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-[var(--career-accent)] opacity-[0.07] blur-[120px]" />
          </div>

          <h1 className="career-rise text-4xl md:text-6xl font-light leading-[1.05] mb-6" style={{ fontFamily: "var(--font-display), serif", animationDelay: "0.1s" }}>
            Build a career as<br /><span className="gold-text">considered as our spaces.</span>
          </h1>
          <p className="career-rise text-[var(--text-muted)] text-sm md:text-base leading-relaxed max-w-xl mx-auto" style={{ animationDelay: "0.2s" }}>
            We&apos;re always looking for passionate architects, designers, and creative minds who share our vision of creating spaces that inspire.
          </p>

          {/* Perks */}
          <div className="career-rise grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mt-14 text-left" style={{ animationDelay: "0.32s" }}>
            {perks.map((p) => (
              <div key={p.title} className="perk-tile p-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4 bg-[var(--career-accent)]/10 text-[var(--career-accent)]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={p.icon} />
                  </svg>
                </div>
                <p className="text-sm font-medium mb-1.5">{p.title}</p>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Open roles */}
        <section className="px-8 pb-24">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-10">
              <h2 className="text-2xl font-light" style={{ fontFamily: "var(--font-display), serif" }}>Open Positions</h2>
              <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--career-accent)] border border-[var(--career-accent)]/40 rounded-full px-3 py-1">
                {jobs.length} open
              </span>
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>

            {jobs.length > 0 ? (
              <div className="space-y-5">
                {jobs.map((job, i) => (
                  <div
                    key={job.id}
                    className="career-card career-rise p-6 md:p-8"
                    style={{ animationDelay: `${0.1 + i * 0.08}s` }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-light">{job.title}</h3>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {job.department && (
                            <span className="text-[9px] uppercase tracking-[0.1em] px-2.5 py-1 rounded-full bg-[var(--career-accent)]/10 text-[var(--career-accent)]">{job.department}</span>
                          )}
                          {job.location && (
                            <span className="text-[9px] uppercase tracking-[0.1em] px-2.5 py-1 rounded-full border border-[var(--border)] text-[var(--text-muted)]">{job.location}</span>
                          )}
                          <span className="text-[9px] uppercase tracking-[0.1em] px-2.5 py-1 rounded-full border border-[var(--border)] text-[var(--text-muted)]">{job.type}</span>
                        </div>
                      </div>
                      <Link
                        href={`/careers/apply?id=${job.id}&title=${encodeURIComponent(job.title)}`}
                        className="apply-btn text-[10px] uppercase tracking-[0.2em] font-medium px-6 py-3 rounded-full text-center whitespace-nowrap"
                      >
                        Apply Now →
                      </Link>
                    </div>
                    {job.description && (
                      <p className="text-sm text-[var(--text-muted)] mt-5 leading-relaxed">{job.description}</p>
                    )}
                    {job.requirements && (
                      <div className="mt-5 pt-5 border-t border-[var(--border)]">
                        <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--career-accent)] mb-2">Requirements</p>
                        <p className="text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line">{job.requirements}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="career-card text-center py-16 px-6">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center bg-[var(--career-accent)]/10 text-[var(--career-accent)]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                </div>
                <p className="text-base font-light mb-2">No open positions right now</p>
                <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto">
                  We&apos;re always open to exceptional talent. Send your portfolio to{" "}
                  <a href="mailto:info@katyalarchitects.com" className="text-[var(--career-accent)] hover:underline">info@katyalarchitects.com</a>
                </p>
              </div>
            )}

            <div className="mt-16 text-center">
              <Link href="/" className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                ← Back to Home
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
