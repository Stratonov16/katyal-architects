export const runtime = "edge";

import Link from "next/link";
import { query } from "@/lib/db";
import Navbar from "@/components/Navbar";
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
  location: string;
  year: number;
  featured_image?: string;
};

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const info = categories.find((c) => c.slug === category);
  const name = info?.name || category;
  return {
    title: `${name} Projects`,
    description: `Explore ${name.toLowerCase()} architecture and interior design projects by Katyal Architects in Hanumangarh, Rajasthan.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const categoryInfo = categories.find((c) => c.slug === category);

  const categoryProjects = await query<Project>(
    `SELECT p.*, (SELECT image_url FROM project_images WHERE project_id = p.id AND is_featured = 1 LIMIT 1) as featured_image
     FROM projects p WHERE p.category = ? AND p.status = 'published' ORDER BY p.created_at DESC`,
    [category]
  );

  return (
    <>
      <Loader duration={700} />
      <Navbar />
      <main className="pt-20 px-8 min-h-screen">
        <Link href="/#projects" className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
          ← Back
        </Link>

        <div className="max-w-5xl mx-auto mt-12 mb-16 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)] mb-4">Projects</p>
          <h1 className="text-4xl md:text-6xl font-light uppercase tracking-[0.1em]">
            {categoryInfo?.name || category}
          </h1>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 pb-24">
          {categoryProjects.length > 0 ? (
            categoryProjects.map((project) => (
              <Link
                key={project.slug}
                href={`/projects/${category}/${project.slug}`}
                className="group relative aspect-[4/3] rounded-md overflow-hidden"
              >
                {project.featured_image ? (
                  <img src={thumb(project.featured_image, { width: 800 })} alt={project.title} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 bg-[var(--border)] group-hover:scale-105 transition-transform duration-500" />
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-sm uppercase tracking-[0.15em] text-white font-light">{project.title}</p>
                  <p className="text-[10px] text-white/60 mt-1">{project.location} · {project.year}</p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-[var(--text-muted)] text-sm col-span-2 text-center">Projects coming soon.</p>
          )}
        </div>
      </main>
    </>
  );
}
