import { MetadataRoute } from "next";

// "Answer engine" AI crawlers — these power live recommendations in AI
// assistants (e.g. someone asking ChatGPT/Perplexity "best architect in
// Hanumangarh"). We ALLOW these so the firm can be discovered/recommended.
const AI_ANSWER_CRAWLERS = [
  "GPTBot",          // OpenAI
  "OAI-SearchBot",   // ChatGPT search
  "ChatGPT-User",    // ChatGPT live browsing
  "PerplexityBot",   // Perplexity
  "Perplexity-User",
  "ClaudeBot",       // Anthropic / Claude
  "Claude-Web",
  "anthropic-ai",
];

// Pure training / bulk scraping crawlers — no referral value, just data
// harvesting. We keep these BLOCKED.
const AI_TRAINING_CRAWLERS = [
  "Google-Extended",
  "Applebot-Extended",
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
      // Answer-engine AI crawlers — allowed (so the firm shows up in AI
      // assistant recommendations), but kept out of admin/api.
      {
        userAgent: AI_ANSWER_CRAWLERS,
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      // Training / bulk scrapers — disallow everything.
      {
        userAgent: AI_TRAINING_CRAWLERS,
        disallow: "/",
      },
    ],
    sitemap: "https://katyalarchitects.com/sitemap.xml",
  };
}
