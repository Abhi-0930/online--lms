import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Interactive Cohorts & Workshops",
  description:
    "Join weekly live interactive cohort sessions, live coding breakdowns, system design teardowns, and doubt-clearing workshops led by senior FAANG tech leads.",
  keywords: [
    "Live coding workshops",
    "Live tech sessions",
    "System design masterclass",
    "DSA live cohort",
    "PrepPath Live Sessions",
  ],
  alternates: {
    canonical: "https://www.preppath.net/live-sessions",
  },
  openGraph: {
    title: "Live Interactive Cohorts & Workshops | PrepPath",
    description:
      "Join weekly live interactive cohort sessions led by senior engineers and industry mentors.",
    url: "https://www.preppath.net/live-sessions",
    siteName: "PrepPath",
  },
};

export default function LiveSessionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
