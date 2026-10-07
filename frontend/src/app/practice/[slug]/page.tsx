import type { Metadata } from "next";
import PracticeProblemClient from "./PracticeProblemClient";
import { API_BASE_URL } from "@/lib/apiConfig";

function formatSlugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = "https://www.preppath.net";
  const defaultTitle = formatSlugToTitle(slug);

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/practice/problems`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const problems = Array.isArray(data) ? data : data.problems || [];
      const problem = problems.find(
        (p: any) =>
          p.slug === slug ||
          p.id === slug ||
          p.title?.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase()
      );

      if (problem && problem.title) {
        const title = `${problem.title} - DSA Practice Problem | PrepPath`;
        const description =
          problem.description?.slice(0, 160) ||
          `Solve ${problem.title} coding challenge on PrepPath with automated test runner, Python/Java/C++ support, and optimal complexity analysis.`;
        const problemUrl = `${baseUrl}/practice/${slug}`;

        return {
          title,
          description,
          keywords: [
            problem.title,
            `${problem.title} solution`,
            `${problem.category || "DSA"} problem`,
            `${problem.difficulty || "Easy"} LeetCode problem`,
            "PrepPath Practice Arena",
            "Coding Interview Prep",
          ],
          alternates: {
            canonical: problemUrl,
          },
          openGraph: {
            type: "article",
            title,
            description,
            url: problemUrl,
            images: [
              {
                url: "/login-hero.png",
                width: 1200,
                height: 630,
                alt: problem.title,
              },
            ],
            siteName: "PrepPath",
          },
          twitter: {
            card: "summary_large_image",
            title,
            description,
            images: ["/login-hero.png"],
          },
        };
      }
    }
  } catch {
    // Fallback if API fails
  }

  return {
    title: `${defaultTitle} - Practice Problem | PrepPath`,
    description: `Solve the ${defaultTitle} coding challenge on PrepPath's in-browser DSA practice arena.`,
    alternates: {
      canonical: `${baseUrl}/practice/${slug}`,
    },
  };
}

export default async function PracticeProblemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const baseUrl = "https://www.preppath.net";
  const defaultTitle = formatSlugToTitle(slug);

  let problem: any = null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/practice/problems`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const problems = Array.isArray(data) ? data : data.problems || [];
      problem = problems.find(
        (p: any) =>
          p.slug === slug ||
          p.id === slug ||
          p.title?.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase()
      );
    }
  } catch {
    // Graceful fallback
  }

  const problemTitle = problem?.title || defaultTitle;
  const problemDesc =
    problem?.description ||
    `Solve the ${problemTitle} algorithmic coding challenge on PrepPath.`;
  const problemUrl = `${baseUrl}/practice/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${problemUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: baseUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Practice Arena",
            item: `${baseUrl}/practice`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: problemTitle,
            item: problemUrl,
          },
        ],
      },
      {
        "@type": "TechArticle",
        "@id": `${problemUrl}#article`,
        headline: `${problemTitle} - Algorithmic Coding Challenge`,
        description: problemDesc,
        url: problemUrl,
        inLanguage: "en",
        proficiencyLevel: problem?.difficulty || "Beginner",
        articleSection: problem?.category || "Data Structures & Algorithms",
        publisher: {
          "@type": "EducationalOrganization",
          name: "PrepPath",
          url: baseUrl,
          logo: `${baseUrl}/icon.svg`,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="sr-only" aria-hidden="true">
        <h1>{problemTitle}</h1>
        <p>{problemDesc}</p>
        <p>Category: {problem?.category || "Data Structures & Algorithms"}</p>
        <p>Difficulty: {problem?.difficulty || "Easy"}</p>
      </div>
      <PracticeProblemClient slug={slug} />
    </>
  );
}
