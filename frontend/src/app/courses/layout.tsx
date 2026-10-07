import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Courses & Placement Learning Tracks | PrepPath",
  description:
    "Explore industry-curated courses in Python, Data Structures & Algorithms, Full Stack Engineering, System Design, and Technical Placements on PrepPath.",
  keywords: [
    "PrepPath Courses",
    "DSA Course",
    "Python Programming Masterclass",
    "Full Stack Web Development",
    "System Design Course",
    "Software Engineering Placement Prep",
    "Coding Interview Masterclass",
  ],
  alternates: {
    canonical: "https://preppath.net/courses",
  },
  openGraph: {
    title: "All Courses & Placement Learning Tracks | PrepPath",
    description:
      "Explore industry-curated courses in Python, DSA, Full Stack, and System Design with structured roadmaps, live mentoring, and career certificates.",
    url: "https://preppath.net/courses",
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
    title: "All Courses & Placement Learning Tracks | PrepPath",
    description:
      "Explore industry-curated courses in Python, DSA, Full Stack, and System Design with structured roadmaps.",
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
        "@id": "https://preppath.net/courses#breadcrumb",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://preppath.net",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Courses",
            item: "https://preppath.net/courses",
          },
        ],
      },
      {
        "@type": "ItemList",
        "@id": "https://preppath.net/courses#itemlist",
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
