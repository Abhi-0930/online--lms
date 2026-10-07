import { MetadataRoute } from "next";
import { API_BASE_URL } from "@/lib/apiConfig";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://preppath.net";
  const currentDate = new Date().toISOString();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/practice`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/live-sessions`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/recordings`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/instructors`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dynamically fetch and include all public published course URLs
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/courses`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const courses = data.courses || data;
      if (Array.isArray(courses)) {
        const courseRoutes: MetadataRoute.Sitemap = courses
          .filter((c: any) => c.status !== "Draft" && c.status !== "DRAFT")
          .map((c: any) => ({
            url: `${baseUrl}/courses/${c.slug || c.id}`,
            lastModified: c.updatedAt || currentDate,
            changeFrequency: "weekly" as const,
            priority: 0.85,
          }));

        return [...staticRoutes, ...courseRoutes];
      }
    }
  } catch (err) {
    console.error("Error generating dynamic sitemap course routes:", err);
  }

  return staticRoutes;
}
