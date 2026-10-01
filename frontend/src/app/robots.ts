import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://preppath.net";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/courses", "/practice", "/live-sessions", "/recordings", "/community", "/login", "/register"],
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
