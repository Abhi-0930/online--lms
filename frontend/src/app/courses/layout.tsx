import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Courses & Learning Tracks",
  description:
    "Master Data Structures & Algorithms, Full Stack Engineering, System Design, AI & Machine Learning, and Cloud Architecture with structured roadmaps and 1:1 mentorship.",
  keywords: [
    "PrepPath Courses",
    "DSA Course",
    "Full Stack Web Development",
    "System Design Course",
    "AI Machine Learning Bootcamp",
    "Cloud Computing AWS",
    "Software Engineering Placement Prep",
  ],
  alternates: {
    canonical: "https://preppath.net/courses",
  },
  openGraph: {
    title: "All Courses & Learning Tracks | PrepPath",
    description:
      "Master DSA, Full Stack, System Design, AI/ML, and Cloud Architecture with curated roadmaps, live sessions, and 1:1 mentorship.",
    url: "https://preppath.net/courses",
    siteName: "PrepPath",
    images: [
      {
        url: "/login-hero.png",
        width: 1200,
        height: 630,
        alt: "PrepPath Courses & Tracks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "All Courses & Learning Tracks | PrepPath",
    description:
      "Master DSA, Full Stack, System Design, AI/ML, and Cloud Architecture with structured roadmaps.",
    images: ["/login-hero.png"],
  },
};

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
