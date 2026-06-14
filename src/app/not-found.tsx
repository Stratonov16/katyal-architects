import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[var(--bg)]">
      {/* Oreo's photo placeholder */}
      <div className="w-48 h-48 rounded-full bg-[var(--border)] mb-8" />

      <p className="text-sm text-[var(--text-muted)] mt-4 text-center max-w-sm">
        Oops! Oreo couldn&apos;t find this page. Maybe he buried it in the backyard.
      </p>

      <Link
        href="/"
        className="mt-8 text-xs uppercase tracking-[0.3em] border border-[var(--text)] px-8 py-4 rounded-md hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all duration-300"
      >
        Take Me Home
      </Link>
    </div>
  );
}
