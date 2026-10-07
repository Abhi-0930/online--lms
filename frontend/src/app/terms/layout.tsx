import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Review the Terms and Conditions governing your access and use of PrepPath's technical courses, mentorship, and learning platform.",
  alternates: {
    canonical: "https://www.preppath.net/terms",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
