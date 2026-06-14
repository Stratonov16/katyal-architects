"use client";

import { useRouter } from "next/navigation";
import { AuthUser } from "@/lib/auth";

export default function AdminDashboard({ user }: { user: AuthUser }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const sections = [
    { name: "Projects", href: "/admin/projects", description: "Add, edit, or remove projects" },
    { name: "Team", href: "/admin/team", description: "Manage team members" },
    { name: "Reviews", href: "/admin/reviews", description: "Manage client testimonials" },
    { name: "About", href: "/admin/about", description: "Edit firm description and photo" },
    { name: "Contact", href: "/admin/contact", description: "Update contact information" },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] px-8 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <a href="/" className="text-2xl font-bold tracking-wider hover:opacity-60 transition-opacity" style={{ fontFamily: "var(--font-display), serif" }}>K</a>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)] mt-1">
              {user.role === "super_admin" ? "Super Admin" : "Admin"}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <a href="/" className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              View Site →
            </a>
            <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
            <button
              onClick={handleLogout}
              className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Draft notification for super admin */}
        {user.role === "super_admin" && (
          <div className="mb-8 border border-[var(--review-border)] rounded-md p-4 flex items-center justify-between">
            <p className="text-sm">0 pending drafts to review</p>
            <a href="/admin/drafts" className="text-[10px] uppercase tracking-[0.2em] hover:opacity-60 transition-opacity">
              View Drafts →
            </a>
          </div>
        )}

        {/* Sections grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((section) => (
            <a
              key={section.name}
              href={section.href}
              className="border border-[var(--border)] rounded-md p-6 hover:bg-[var(--text)]/5 transition-all duration-300 group"
            >
              <p className="text-sm uppercase tracking-[0.15em] group-hover:opacity-80 transition-opacity">{section.name}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-2">{section.description}</p>
            </a>
          ))}
        </div>

        {/* Quick stats */}
        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
          <div className="border border-[var(--border)] rounded-md p-4">
            <p className="text-2xl font-light">8</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mt-1">Projects</p>
          </div>
          <div className="border border-[var(--border)] rounded-md p-4">
            <p className="text-2xl font-light">3</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mt-1">Team</p>
          </div>
          <div className="border border-[var(--border)] rounded-md p-4">
            <p className="text-2xl font-light">5</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mt-1">Reviews</p>
          </div>
        </div>
      </div>
    </div>
  );
}
