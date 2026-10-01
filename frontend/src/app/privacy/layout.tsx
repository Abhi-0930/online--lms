import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "PrepPath's Privacy Policy describes how we collect, protect, and use your personal information when you use our platform and educational services.",
  alternates: {
    canonical: "https://preppath.net/privacy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
