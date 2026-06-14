export const runtime = "edge";

import Link from "next/link";
import { query } from "@/lib/db";
import Navbar from "@/components/Navbar";

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

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 px-8">
        <div className="max-w-4xl mx-auto py-16">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)] mb-4">Careers</p>
          <h1 className="text-3xl md:text-5xl font-light mb-4" style={{ fontFamily: "var(--font-display), serif" }}>
            Join Our Team
          </h1>
          <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-xl mb-16">
            We&apos;re always looking for passionate architects, designers, and creative minds who share our vision of creating spaces that inspire.
          </p>

          {jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="border border-[var(--border)] rounded-md p-6 hover:bg-[var(--text)]/5 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-light">{job.title}</h2>
                      <div className="flex flex-wrap gap-3 mt-2">
                        {job.department && (
                          <span className="text-[9px] uppercase tracking-[0.1em] px-2 py-1 border border-[var(--border)] rounded">{job.department}</span>
                        )}
                        {job.location && (
                          <span className="text-[9px] uppercase tracking-[0.1em] px-2 py-1 border border-[var(--border)] rounded">{job.location}</span>
                        )}
                        <span className="text-[9px] uppercase tracking-[0.1em] px-2 py-1 border border-[var(--border)] rounded">{job.type}</span>
                      </div>
                    </div>
                    <Link
                      href={`/careers/apply?id=${job.id}&title=${encodeURIComponent(job.title)}`}
                      className="text-[10px] uppercase tracking-[0.2em] border border-[var(--text)] px-5 py-2.5 rounded-md hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all duration-300 text-center"
                    >
                      Apply
                    </Link>
                  </div>
                  {job.description && (
                    <p className="text-sm text-[var(--text-muted)] mt-4 leading-relaxed">{job.description}</p>
                  )}
                  {job.requirements && (
                    <div className="mt-4">
                      <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-2">Requirements</p>
                      <p className="text-sm text-[var(--text-muted)] leading-relaxed">{job.requirements}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-[var(--border)] rounded-md">
              <p className="text-[var(--text-muted)] text-sm">No open positions right now.</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-2">Send your portfolio to ar.shubhamkatyal@gmail.com</p>
            </div>
          )}

          <div className="mt-16 text-center">
            <Link href="/" className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
