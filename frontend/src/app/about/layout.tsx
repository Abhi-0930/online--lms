import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - PrepPath | Computer Science & Engineering Education",
  description:
    "Learn about PrepPath's mission to empower software engineers with production-grade Data Structures, System Design, and hands-on coding curriculum.",
  keywords: [
    "About PrepPath",
    "PrepPath Story",
    "Computer Science Learning",
    "DSA Problem Solving",
    "Software Engineering Education",
    "Hyderabad EdTech",
  ],
  alternates: {
    canonical: "https://www.preppath.net/about",
  },
  openGraph: {
    title: "About PrepPath - Next-Gen Engineering Education",
    description:
      "Bridging the gap between university theory and high-scale production engineering. Discover our founding vision and learning methodology.",
    url: "https://www.preppath.net/about",
    siteName: "PrepPath",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About PrepPath - Next-Gen Engineering Education",
    description:
      "Bridging the gap between university theory and high-scale production engineering. Discover our founding vision and learning methodology.",
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
      logo: "https://www.preppath.net/icon.svg",
      sameAs: [
        "https://x.com/PrepPath",
        "https://www.linkedin.com/company/prepppath",
        "https://www.instagram.com/preppath.nett?stkn=d3M4bGZwdGU2dGI4",
      ],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Hyderabad",
        addressRegion: "Telangana",
        addressCountry: "India",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+91-6302160783",
        contactType: "customer support",
        email: "hello@preppath.net",
      },
    },
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
