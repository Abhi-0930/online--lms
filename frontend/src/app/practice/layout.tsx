import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Practice Coding & DSA Problems",
  description:
    "Solve 400+ curated algorithmic coding problems categorized by FAANG patterns (Sliding Window, Two Pointers, Trees, Graphs, Dynamic Programming) with instant in-browser test runner.",
  keywords: [
    "PrepPath Practice",
    "DSA Practice Problems",
    "LeetCode pattern practice",
    "Coding interview questions",
    "Algorithmic challenges",
    "Online code runner",
    "FAANG coding prep",
  ],
  alternates: {
    canonical: "https://www.preppath.net/practice",
  },
  openGraph: {
    title: "Practice Coding & DSA Problems | PrepPath",
    description:
      "Solve 400+ curated algorithmic problems with in-browser multi-language execution, automated test cases, and optimal solution breakdowns.",
    url: "https://www.preppath.net/practice",
    siteName: "PrepPath",
    images: [
      {
        url: "/login-hero.png",
        width: 1200,
        height: 630,
        alt: "PrepPath Practice Problems & Code Runner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Practice Coding & DSA Problems | PrepPath",
    description:
      "Solve 400+ curated algorithmic coding problems categorized by FAANG patterns with instant test runner.",
    images: ["/login-hero.png"],
  },
};

export default function PracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": "https://www.preppath.net/practice#breadcrumb",
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
            name: "Practice",
            item: "https://www.preppath.net/practice",
          },
        ],
      },
      {
        "@type": "ItemList",
        "@id": "https://www.preppath.net/practice#itemlist",
        name: "PrepPath Curated DSA Practice Problems",
        description: "Curated collection of top 400+ algorithmic coding questions for tech placement preparation.",
        numberOfItems: 400,
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
