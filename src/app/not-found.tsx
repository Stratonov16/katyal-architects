import Link from "next/link";
import AdminHeader from "@/components/AdminHeader";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <AdminHeader />
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        {/* Oreo's photo */}
        <img
          src="https://media.katyalarchitects.com/static/oreo/WhatsApp%20Image%202026-06-15%20at%201.39.13%20AM.jpeg"
          alt="Oreo"
          className="w-48 h-48 rounded-full object-cover mb-8"
        />

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
    </div>
  );
}
