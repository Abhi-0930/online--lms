import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us & Learner Support",
  description:
    "Get in touch with PrepPath team for admissions guidance, technical doubt support, enterprise partnerships, or billing inquiries.",
  alternates: {
    canonical: "https://preppath.net/contact",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
