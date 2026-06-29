import { MetadataRoute } from "next";

// Known AI / LLM training + scraping crawlers we want to keep off the site.
// (robots.txt is a polite request — compliant bots like ClaudeBot/GPTBot
// honor it; the hard block is the Cloudflare "Block AI crawlers" toggle.)
const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "Google-Extended",
  "Applebot-Extended",
  "PerplexityBot",
  "Bytespider",
  "CCBot",
  "Amazonbot",
  "Meta-ExternalAgent",
  "FacebookBot",
  "Diffbot",
  "Omgilibot",
  "cohere-ai",
  "YouBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Normal search engines (Google, Bing, etc.) — full access except admin/api.
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      // AI crawlers — disallow everything.
      {
        userAgent: AI_CRAWLERS,
        disallow: "/",
      },
    ],
    sitemap: "https://katyalarchitects.com/sitemap.xml",
  };
}
