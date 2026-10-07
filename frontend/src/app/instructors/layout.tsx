import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meet Our Lead Instructors & Engineering Mentors | PrepPath",
  description:
    "Learn from active software engineers and technical leaders with real-world production experience across DSA, System Design, Cloud, DevOps, and Full-Stack Engineering.",
  keywords: [
    "PrepPath Instructors",
    "Abhishek Jujjuvarapu",
    "Bharath Beerappa",
    "DSA Mentors",
    "FAANG Interview Coaches",
    "Software Engineering Mentorship",
    "System Design Instructors",
  ],
  alternates: {
    canonical: "https://preppath.net/instructors",
  },
  openGraph: {
    title: "Meet Our Lead Instructors & Engineering Mentors | PrepPath",
    description:
      "Active industry practitioners and technical leaders mentoring the next generation of top-tier software engineers.",
    url: "https://preppath.net/instructors",
    siteName: "PrepPath",
    images: [
      {
        url: "/login-hero.png",
        width: 1200,
        height: 630,
        alt: "PrepPath Instructors & Mentors",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Meet Our Lead Instructors & Engineering Mentors | PrepPath",
    description:
      "Active industry practitioners and technical leaders mentoring the next generation of engineers.",
    images: ["/login-hero.png"],
  },
};

export default function InstructorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": "https://preppath.net/instructors#breadcrumb",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://preppath.net",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Instructors",
            item: "https://preppath.net/instructors",
          },
        ],
      },
      {
        "@type": "ProfilePage",
        "@id": "https://preppath.net/instructors#profilepage",
        name: "PrepPath Instructors & Faculty",
        url: "https://preppath.net/instructors",
        description:
          "Meet the industry mentors and software engineering faculty at PrepPath delivering live masterclasses and 1:1 career guidance.",
        mainEntity: [
          {
            "@type": "Person",
            "@id": "https://preppath.net/instructors#abhishek",
            name: "Abhishek Jujjuvarapu",
            jobTitle: "Founder & Lead Instructor",
            worksFor: {
              "@type": "EducationalOrganization",
              name: "PrepPath",
              url: "https://preppath.net",
            },
            description:
              "Software engineer, cybersecurity professional, and educator dedicated to helping students master problem-solving, software development, and interview preparation.",
            image: "https://preppath.net/instructors/abhishek.png",
            knowsAbout: [
              "Software Engineering",
              "Data Structures & Algorithms",
              "Full-Stack Development",
              "System Design",
              "Cybersecurity",
              "AI Applications",
              "Technical Interview Preparation",
            ],
            sameAs: [
              "https://www.linkedin.com/company/prepppath",
              "https://x.com/PrepPath",
            ],
          },
          {
            "@type": "Person",
            "@id": "https://preppath.net/instructors#bharath",
            name: "Bharath Beerappa",
            jobTitle: "Senior Technical Mentor & Instructor",
            worksFor: {
              "@type": "EducationalOrganization",
              name: "PrepPath",
              url: "https://preppath.net",
            },
            description:
              "Technology leader and engineering mentor with 5+ years of experience across software engineering, cloud computing, DevOps, AI/ML, blockchain, and modern application architecture.",
            image: "https://preppath.net/instructors/bharat.png",
            knowsAbout: [
              "Cloud Computing & AWS",
              "DevOps & Platform Engineering",
              "Artificial Intelligence & Machine Learning",
              "Blockchain Development",
              "Distributed Systems",
              "Data Engineering",
            ],
            sameAs: [
              "https://www.linkedin.com/company/prepppath",
            ],
          },
        ],
      },
    ],
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
