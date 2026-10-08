import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best Tech Placement Courses: DSA, System Design & Full Stack | PrepPath",
  description:
    "Crack top-tier software engineering placements. Learn Data Structures & Algorithms, System Design, and Full Stack SaaS with live cohorts, real-world projects, and verified certificates.",
  keywords: [
    "PrepPath Courses",
    "DSA Course 2026",
    "Data Structures and Algorithms Placement Course",
    "System Design Interview Course India",
    "Full Stack Web Development SaaS",
    "Software Engineering Placement Prep",
    "FAANG Coding Interview Masterclass",
    "LeetCode Pattern Sheet Course",
  ],
  alternates: {
    canonical: "https://www.preppath.net/courses",
  },
  openGraph: {
    title: "Best Tech Placement Courses: DSA, System Design & Full Stack | PrepPath",
    description:
      "Crack top-tier software engineering placements. Learn DSA, System Design, and Full Stack SaaS with live cohorts, real-world projects, and verified certificates.",
    url: "https://www.preppath.net/courses",
    siteName: "PrepPath",
    images: [
      {
        url: "/login-hero.png",
        width: 1200,
        height: 630,
        alt: "PrepPath Courses & Placement Tracks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Tech Placement Courses: DSA, System Design & Full Stack | PrepPath",
    description:
      "Crack top-tier software engineering placements. Learn DSA, System Design, and Full Stack SaaS with live cohorts, real-world projects, and verified certificates.",
    images: ["/login-hero.png"],
  },
};

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": "https://www.preppath.net/courses#breadcrumb",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.preppath.net",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Courses",
            item: "https://www.preppath.net/courses",
          },
        ],
      },
      {
        "@type": "ItemList",
        "@id": "https://www.preppath.net/courses#itemlist",
        name: "PrepPath Courses Catalog",
        description: "Comprehensive software engineering, DSA, and technical placement courses.",
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        numberOfItems: 10,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
