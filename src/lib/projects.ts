export type Project = {
  slug: string;
  title: string;
  category: string;
  location: string;
  year: number;
  description: string;
  images: string[];
};

export const projects: Project[] = [
  {
    slug: "smile-luxury-salon",
    title: "Smile Luxury Salon",
    category: "hospitality",
    location: "Hanumangarh Junction",
    year: 2026,
    description: "A luxury salon that redefines the traditional salon experience into a space defined by sophistication and modern design.",
    images: [],
  },
  {
    slug: "modern-residence",
    title: "Modern Residence",
    category: "residential",
    location: "Hanumangarh",
    year: 2025,
    description: "A contemporary home featuring glass railings, geometric cladding, and LED architectural lighting.",
    images: [],
  },
  {
    slug: "heritage-lounge",
    title: "Heritage Lounge",
    category: "interiors",
    location: "Rajasthan",
    year: 2025,
    description: "A Mughal-inspired lounge blending traditional arch patterns with modern luxury finishes.",
    images: [],
  },
  {
    slug: "urban-villa",
    title: "Urban Villa",
    category: "residential",
    location: "Hanumangarh",
    year: 2024,
    description: "A bold residential project balancing minimalist aesthetics with warm living spaces.",
    images: [],
  },
  {
    slug: "boutique-hotel",
    title: "Boutique Hotel",
    category: "hospitality",
    location: "Rajasthan",
    year: 2025,
    description: "An intimate hospitality project where every corner tells a story of craftsmanship and comfort.",
    images: [],
  },
  {
    slug: "garden-retreat",
    title: "Garden Retreat",
    category: "landscape",
    location: "Hanumangarh",
    year: 2024,
    description: "A landscape design connecting indoor living with outdoor serenity through layered greenery and water features.",
    images: [],
  },
  {
    slug: "retail-plaza",
    title: "Retail Plaza",
    category: "commercial",
    location: "Rajasthan",
    year: 2025,
    description: "A commercial space designed to elevate the shopping experience through open layouts and natural light.",
    images: [],
  },
  {
    slug: "green-township",
    title: "Green Township",
    category: "township",
    location: "Hanumangarh",
    year: 2026,
    description: "A master-planned community integrating sustainable design with modern urban living.",
    images: [],
  },
];

export function getProjectsByCategory(category: string): Project[] {
  return projects.filter((p) => p.category === category);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export const categories = [
  { name: "Residential", slug: "residential" },
  { name: "Hospitality", slug: "hospitality" },
  { name: "Interiors", slug: "interiors" },
  { name: "Landscape", slug: "landscape" },
  { name: "Commercial", slug: "commercial" },
  { name: "Township", slug: "township" },
];
