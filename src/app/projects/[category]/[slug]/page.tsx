export const runtime = "edge";

import Link from "next/link";
import { query, queryOne } from "@/lib/db";
import Navbar from "@/components/Navbar";
import GallerySection from "@/components/GallerySection";
import Loader from "@/components/Loader";
import { thumb } from "@/lib/media";

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

export async function generateMetadata({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { slug } = await params;
  const project = await queryOne<Project>(`SELECT * FROM projects WHERE slug = ? AND status = 'published'`, [slug]);
  if (!project) return { title: "Project" };
  return {
    title: project.title,
    description: project.description?.slice(0, 160) || `${project.title} — a ${project.category} project by Katyal Architects in ${project.location}.`,
  };
}

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

  const relatedProjects = await query<Project & { featured_image?: string }>(
    `SELECT p.id, p.title, p.slug, p.category,
       (SELECT image_url FROM project_images WHERE project_id = p.id ORDER BY is_featured DESC, "order" ASC LIMIT 1) as featured_image
     FROM projects p WHERE p.category = ? AND p.status = 'published' AND p.slug != ? ORDER BY p.created_at DESC LIMIT 4`,
    [category, slug]
  );

  const featuredImage = images.find((img) => img.is_featured)?.image_url || images[0]?.image_url;

  return (
    <>
      <Loader duration={2000} />
      <Navbar />
      <main className="min-h-screen pt-14">
        {/* Hero image — full width, no text overlay */}
        <div className="w-full h-[60vh] md:h-[75vh]">
          {featuredImage ? (
            <img src={featuredImage} alt={project.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[var(--border)]" />
          )}
        </div>

        {/* Project title — fades in */}
        <div className="max-w-6xl mx-auto px-8 pt-12 pb-8 animate-[fadeUp_0.8s_ease_0.2s_both]">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)] mb-3">
            <Link href={`/projects/${category}`} className="hover:text-[var(--text)] transition-colors">
              {categories.find((c) => c.slug === category)?.name}
            </Link>
          </p>
          <h1 className="text-3xl md:text-5xl font-light" style={{ fontFamily: "var(--font-display), serif" }}>
            {project.title}
          </h1>
        </div>

        {/* Sidebar metadata + Description (ZHA layout) */}
        <div className="max-w-6xl mx-auto px-8 pb-16 animate-[fadeUp_0.8s_ease_0.5s_both]">
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-12 border-t border-[var(--border)] pt-10">
            {/* Left sidebar — metadata */}
            <div className="space-y-6">
              {project.location && (
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-1">Location</p>
                  <p className="text-sm">{project.location}</p>
                </div>
              )}
              {project.year && (
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-1">Year</p>
                  <p className="text-sm">{project.year}</p>
                </div>
              )}
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-1">Category</p>
                <p className="text-sm capitalize">{project.category}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-1">Status</p>
                <p className="text-sm">Completed</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-1">Design</p>
                <p className="text-sm">Katyal Architects</p>
              </div>
            </div>

            {/* Right — description */}
            <div>
              {project.description && (
                <p className="text-base md:text-lg font-light leading-relaxed text-[var(--text-muted)]">
                  {project.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Video */}
        {project.video_url && (
          <div className="max-w-6xl mx-auto px-8 pb-12">
            <div className="aspect-video w-full max-w-4xl mx-auto rounded-md overflow-hidden">
              {project.video_url.endsWith(".mp4") || project.video_url.endsWith(".webm") ? (
                <video src={project.video_url} className="w-full h-full object-cover" controls />
              ) : (
                <iframe
                  src={project.video_url.replace("watch?v=", "embed/")}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        )}

        {/* Image gallery — full width stacked with scroll reveal */}
        {images.length > 0 && (
          <GallerySection images={images} title={project.title} />
        )}

        {/* Spacer before related */}
        <div className="py-8" />

        {/* Related projects */}
        {relatedProjects.length > 0 && (
          <div className="max-w-6xl mx-auto px-8 py-20">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)] mb-8">Related Projects</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProjects.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/projects/${rp.category}/${rp.slug}`}
                  className="group relative aspect-[4/3] rounded-md overflow-hidden"
                >
                  {rp.featured_image ? (
                    <img src={thumb(rp.featured_image, { width: 500 })} alt={rp.title} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="absolute inset-0 bg-[var(--border)] group-hover:scale-105 transition-transform duration-500" />
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
                  <p className="absolute bottom-3 left-3 text-[10px] uppercase tracking-[0.15em] text-white font-light z-10">
                    {rp.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to category */}
        <div className="border-t border-[var(--border)] py-10 text-center">
          <Link href={`/projects/${category}`} className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            ← All {categories.find((c) => c.slug === category)?.name} Projects
          </Link>
        </div>
      </main>
    </>
  );
}
