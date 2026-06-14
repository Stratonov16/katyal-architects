export const runtime = "edge";

import Link from "next/link";
import { query, queryOne } from "@/lib/db";
import Navbar from "@/components/Navbar";

const categories = [
  { name: "Residential", slug: "residential" },
  { name: "Hospitality", slug: "hospitality" },
  { name: "Interiors", slug: "interiors" },
  { name: "Landscape", slug: "landscape" },
  { name: "Commercial", slug: "commercial" },
  { name: "Township", slug: "township" },
];

type Project = {
  id: number;
  title: string;
  slug: string;
  category: string;
  description: string;
  location: string;
  year: number;
  video_url: string;
};

type ProjectImage = {
  image_url: string;
  is_featured: number;
};

export default async function ProjectPage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;

  const project = await queryOne<Project>(
    `SELECT * FROM projects WHERE slug = ? AND status = 'published'`,
    [slug]
  );

  if (!project) {
    return (
      <>
        <Navbar />
        <main className="pt-20 px-8 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-[var(--text-muted)]">Project not found.</p>
            <Link href={`/projects/${category}`} className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text)] mt-4 inline-block">
              ← Back to {categories.find((c) => c.slug === category)?.name}
            </Link>
          </div>
        </main>
      </>
    );
  }

  const images = await query<ProjectImage>(
    `SELECT image_url, is_featured FROM project_images WHERE project_id = ? ORDER BY "order" ASC`,
    [project.id]
  );

  const categoryProjects = await query<Project>(
    `SELECT id, title, slug FROM projects WHERE category = ? AND status = 'published' ORDER BY created_at DESC`,
    [category]
  );

  const currentIndex = categoryProjects.findIndex((p) => p.slug === slug);
  const prevProject = categoryProjects[currentIndex - 1];
  const nextProject = categoryProjects[currentIndex + 1];

  const featuredImage = images.find((img) => img.is_featured)?.image_url || images[0]?.image_url;

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen">
        {/* Hero image */}
        <div className="relative w-full h-[60vh] md:h-[75vh]">
          {featuredImage ? (
            <img src={featuredImage} alt={project.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[var(--border)]" />
          )}
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
          {project.description && (
            <p className="text-lg md:text-xl font-light leading-relaxed max-w-2xl">
              {project.description}
            </p>
          )}

          {/* Video */}
          {project.video_url && (
            <div className="mt-12 aspect-video rounded-md overflow-hidden">
              <video src={project.video_url} className="w-full h-full object-cover" controls />
            </div>
          )}

          {/* Image gallery */}
          {images.length > 0 && (
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map((img, i) => (
                <img key={i} src={img.image_url} alt={`${project.title} ${i + 1}`} className="w-full aspect-[4/3] object-cover rounded-md" />
              ))}
            </div>
          )}
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
