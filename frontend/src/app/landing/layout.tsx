import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PrepPath · Master Software Development & Crack FAANG Roles",
  description:
    "Master Data Structures & Algorithms, Full Stack Engineering, AI, Cloud Computing, and System Design through structured curricula, live mentorship, and automated practice arenas.",
  keywords: [
    "LMS",
    "Data Structures",
    "Algorithms",
    "Full Stack Development",
    "System Design",
    "Software Engineering",
    "Coding Interview Preparation",
    "Next.js",
    "FAANG Interviews"
  ],
  openGraph: {
    title: "PrepPath · Master Software Development & Crack FAANG Roles",
    description: "Structured learning paths, 1:1 FAANG mentorship, and production-grade software development.",
    type: "website",
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      {children}
    </div>
  );
}
