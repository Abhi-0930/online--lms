import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Community & Peer Network",
  description:
    "Connect with ambitious software engineers, participate in peer mock interviews, collaborate on open-source projects, and get instant doubt assistance.",
  keywords: [
    "PrepPath Community",
    "Developer community",
    "Peer mock interviews",
    "Tech discussion forum",
    "Coding doubts",
  ],
  alternates: {
    canonical: "https://www.preppath.net/community",
  },
  openGraph: {
    title: "Student Community & Peer Network | PrepPath",
    description:
      "Connect with ambitious software engineers, peer mock partners, and mentors.",
    url: "https://www.preppath.net/community",
    siteName: "PrepPath",
  },
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
