import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us & Mentors - PrepPath | Next-Gen Computer Science Education",
  description:
    "Learn about PrepPath's mission to empower software engineers with world-class Data Structures, System Design, and AI curriculum taught by industry leaders from Google, Meta, and Amazon.",
  keywords: [
    "About PrepPath",
    "PrepPath Instructors",
    "DSA Mentors",
    "Ex-FAANG Engineers",
    "System Design Course Instructors",
    "Coding Bootcamp Mentors",
    "Software Engineering Career Prep"
  ],
  alternates: {
    canonical: "https://www.preppath.net/about",
  },
  openGraph: {
    title: "About PrepPath - Elite Engineering Mentorship & Programs",
    description:
      "Bridging the gap between university theory and high-scale production engineering. Meet our world-class mentors and explore our learning philosophy.",
    url: "https://www.preppath.net/about",
    siteName: "PrepPath",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About PrepPath - Elite Engineering Mentorship",
    description:
      "Bridging the gap between university theory and high-scale production engineering. Meet our mentors from Google, Meta, and Amazon.",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About PrepPath",
    url: "https://www.preppath.net/about",
    description:
      "PrepPath is a premier computer science and software engineering learning platform delivering live cohorts, DSA problem arenas, and real-world system design mentorship.",
    mainEntity: {
      "@type": "EducationalOrganization",
      name: "PrepPath",
      url: "https://www.preppath.net",
      logo: "https://www.preppath.net/favicon.ico",
      sameAs: [
        "https://twitter.com/preppath",
        "https://linkedin.com/company/preppath",
        "https://instagram.com/preppath"
      ],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Hyderabad",
        addressRegion: "Telangana",
        addressCountry: "India"
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+91-6302160783",
        contactType: "customer support",
        email: "hello@preppath.net"
      }
    }
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
