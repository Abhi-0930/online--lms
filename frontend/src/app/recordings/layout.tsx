import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lecture Recordings & Video Archives",
  description:
    "Access on-demand high-bitrate video recordings of all live lectures, deep-dive architectural workshops, and solution walkthroughs with chapter bookmarks.",
  keywords: [
    "Course recordings",
    "Lecture archives",
    "PrepPath recordings",
    "On-demand coding classes",
  ],
  alternates: {
    canonical: "https://preppath.net/recordings",
  },
  openGraph: {
    title: "Lecture Recordings & Video Archives | PrepPath",
    description:
      "Access on-demand high-bitrate video recordings with chapter timestamps and downloadable notes.",
    url: "https://preppath.net/recordings",
    siteName: "PrepPath",
  },
};

export default function RecordingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
