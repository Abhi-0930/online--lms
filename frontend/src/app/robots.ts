import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.preppath.net";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/courses",
          "/courses/*",
          "/practice",
          "/live-sessions",
          "/recordings",
          "/community",
          "/about",
          "/instructors",
          "/contact",
          "/privacy",
          "/terms",
          "/refund-policy",
          "/login",
          "/register",
          "/llms.txt",
        ],
        disallow: [
          "/dashboard",
          "/dashboard/*",
          "/learn/*",
          "/profile",
          "/progress",
          "/notes",
          "/assignments",
          "/notifications",
          "/onboarding",
          "/checkout",
          "/checkout/*",
          "/auth/*",
          "/api/*",
        ],
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "ClaudeBot",
          "PerplexityBot",
          "Google-Extended",
          "Applebot-Extended",
        ],
        allow: [
          "/",
          "/courses",
          "/courses/*",
          "/practice",
          "/about",
          "/instructors",
          "/community",
          "/llms.txt",
        ],
        disallow: [
          "/dashboard/*",
          "/learn/*",
          "/checkout/*",
          "/api/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
