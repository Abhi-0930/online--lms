import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy",
  description:
    "Learn about PrepPath's transparent refund policy, money-back eligibility criteria, and cancellation guidelines for all courses and cohorts.",
  alternates: {
    canonical: "https://www.preppath.net/refund-policy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RefundPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
