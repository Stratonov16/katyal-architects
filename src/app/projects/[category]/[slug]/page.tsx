export const runtime = "edge";

import Link from "next/link";
import { getProjectBySlug, getProjectsByCategory, projects, categories } from "@/lib/projects";
import Navbar from "@/components/Navbar";

export default async function ProjectPage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;
  const project = getProjectBySlug(slug);
  const categoryProjects = getProjectsByCategory(category);
  const currentIndex = categoryProjects.findIndex((p) => p.slug === slug);
  const prevProject = categoryProjects[currentIndex - 1];
  const nextProject = categoryProjects[currentIndex + 1];

  if (!project) {
    return (
      <>
        <Navbar />
        <main className="pt-20 px-8 min-h-screen flex items-center justify-center">
          <p className="text-[var(--text-muted)]">Project not found.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen">
        {/* Hero image */}
        <div className="relative w-full h-[60vh] md:h-[75vh] bg-[var(--border)]">
          {/* Project image will go here */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 bg-gradient-to-t from-black/70 to-transparent">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/60 mb-2">
              <Link href={`/projects/${category}`} className="hover:text-white transition-colors">
                {categories.find((c) => c.slug === category)?.name}
              </Link>
            </p>
            <h1 className="text-3xl md:text-5xl font-light uppercase tracking-[0.1em] text-white">
              {project.title}
            </h1>
          </div>
        </div>

        {/* Project info */}
        <div className="max-w-4xl mx-auto px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 border-b border-[var(--border)] pb-12">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-1">Location</p>
              <p className="text-sm">{project.location}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-1">Year</p>
              <p className="text-sm">{project.year}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-1">Category</p>
              <p className="text-sm capitalize">{project.category}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-1">Status</p>
              <p className="text-sm">Completed</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl font-light leading-relaxed max-w-2xl">
            {project.description}
          </p>

          {/* Image gallery placeholder */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/3] bg-[var(--border)] rounded-md" />
            ))}
          </div>
        </div>

        {/* Prev / Next navigation */}
        <div className="border-t border-[var(--border)] grid grid-cols-2">
          {prevProject ? (
            <Link
              href={`/projects/${category}/${prevProject.slug}`}
              className="p-8 md:p-12 hover:bg-[var(--border)]/30 transition-colors group"
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-2">← Previous</p>
              <p className="text-sm md:text-base uppercase tracking-[0.1em] group-hover:opacity-70 transition-opacity">{prevProject.title}</p>
            </Link>
          ) : (
            <div className="p-8 md:p-12">
              <Link href={`/projects/${category}`} className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                ← All {categories.find((c) => c.slug === category)?.name}
              </Link>
            </div>
          )}
          {nextProject ? (
            <Link
              href={`/projects/${category}/${nextProject.slug}`}
              className="p-8 md:p-12 text-right hover:bg-[var(--border)]/30 transition-colors border-l border-[var(--border)] group"
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-2">Next →</p>
              <p className="text-sm md:text-base uppercase tracking-[0.1em] group-hover:opacity-70 transition-opacity">{nextProject.title}</p>
            </Link>
          ) : (
            <div className="p-8 md:p-12 text-right border-l border-[var(--border)]">
              <Link href={`/projects/${category}`} className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                All {categories.find((c) => c.slug === category)?.name} →
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
