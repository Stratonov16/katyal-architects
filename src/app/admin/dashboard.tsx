"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AuthUser } from "@/lib/auth";
import AdminHeader from "@/components/AdminHeader";

export default function AdminDashboard({ user }: { user: AuthUser }) {
  const router = useRouter();
  const [stats, setStats] = useState({ projects: 0, team: 0, reviews: 0, drafts: 0 });
  const [analytics, setAnalytics] = useState<{ totalViews: number; totalVisitors: number; period: string } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/projects").then((r) => r.json()),
      fetch("/api/admin/team").then((r) => r.json()),
      fetch("/api/admin/reviews").then((r) => r.json()),
    ]).then(([p, t, r]) => {
      setStats({
        projects: p.projects?.length || 0,
        team: t.members?.length || 0,
        reviews: r.reviews?.length || 0,
        drafts: 0,
      });
    }).catch(() => {});

    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => { if (d.totalViews !== undefined) setAnalytics(d); })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const sections = [
    { name: "Hero Carousel", href: "/admin/hero", description: "Manage homepage hero images and videos" },
    { name: "Projects", href: "/admin/projects", description: "Add, edit, or remove projects" },
    { name: "Services", href: "/admin/services", description: "Upload cover images for service categories" },
    { name: "Team", href: "/admin/team", description: "Manage team members" },
    { name: "Reviews", href: "/admin/reviews", description: "Manage client testimonials" },
    { name: "About", href: "/admin/about", description: "Edit firm description and photo" },
    { name: "Careers", href: "/admin/careers", description: "Manage job postings" },
    { name: "Contact", href: "/admin/contact", description: "Update contact information" },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <AdminHeader />
      <div className="max-w-4xl mx-auto px-8 pt-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
            {user.role === "super_admin" ? "Super Admin" : "Admin"} Dashboard
          </p>
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
            <p className="text-sm">{stats.drafts} pending drafts to review</p>
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

        {/* Analytics */}
        {analytics && (
          <div className="mt-12 border border-[var(--border)] rounded-md p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Website Traffic</p>
              <p className="text-[9px] text-[var(--text-muted)]">{analytics.period}</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-3xl font-light">{analytics.totalVisitors}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mt-1">Visitors</p>
              </div>
              <div>
                <p className="text-3xl font-light">{analytics.totalViews}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mt-1">Page Views</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick stats */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="border border-[var(--border)] rounded-md p-4">
            <p className="text-2xl font-light">{stats.projects}</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mt-1">Projects</p>
          </div>
          <div className="border border-[var(--border)] rounded-md p-4">
            <p className="text-2xl font-light">{stats.team}</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mt-1">Team</p>
          </div>
          <div className="border border-[var(--border)] rounded-md p-4">
            <p className="text-2xl font-light">{stats.reviews}</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mt-1">Reviews</p>
          </div>
        </div>
      </div>
    </div>
  );
}
