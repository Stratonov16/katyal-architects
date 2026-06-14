import { MetadataRoute } from "next";

const SITE_URL = "https://katyal-architects.pages.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const categories = ["residential", "hospitality", "interiors", "landscape", "commercial", "township"];

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/careers`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...categories.map((cat) => ({
      url: `${SITE_URL}/projects/${cat}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
