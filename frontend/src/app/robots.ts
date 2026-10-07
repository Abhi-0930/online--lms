import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://preppath.net";

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
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
