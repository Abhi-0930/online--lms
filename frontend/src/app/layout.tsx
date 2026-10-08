import type { Metadata } from "next";
import Script from "next/script";
import { DM_Sans, Manrope, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-display",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.preppath.net"),
  title: {
    default: "PrepPath - Premier Engineering Placement, DSA & System Design Platform",
    template: "%s | PrepPath",
  },
  description:
    "Ace FAANG & top tech campus placements with PrepPath. Structured DSA patterns, System Design, Full-Stack engineering, live mentor cohorts, mock interviews, and career roadmaps.",
  keywords: [
    "PrepPath",
    "DSA preparation",
    "software engineer roadmap",
    "campus placement preparation 2026",
    "coding interview preparation",
    "FAANG interview coaching",
    "system design course India",
    "full stack developer roadmap",
    "LeetCode patterns masterclass",
    "data structures and algorithms placement course",
  ],
  authors: [{ name: "PrepPath Team", url: "https://www.preppath.net" }],
  creator: "PrepPath",
  publisher: "PrepPath",
  alternates: {
    canonical: "https://www.preppath.net",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.preppath.net",
    siteName: "PrepPath",
    title: "PrepPath - Premier Engineering Placement & DSA Platform",
    description:
      "Structured technical placement preparation, curated DSA patterns, live interactive cohorts, and 1:1 mentorship from top tech engineers.",
    images: [
      {
        url: "/login-hero.png",
        width: 1200,
        height: 630,
        alt: "PrepPath - Engineering Placement & DSA Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PrepPath - Premier Engineering Placement & DSA Platform",
    description:
      "Structured technical placement preparation, curated DSA patterns, live interactive cohorts, and mentorship.",
    images: ["/login-hero.png"],
    creator: "@preppath",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://checkout.razorpay.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.razorpay.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.razorpay.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
        <link rel="dns-prefetch" href="https://api.razorpay.com" />
        <link rel="dns-prefetch" href="https://cdn.razorpay.com" />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      </head>
      <body className={`${dmSans.variable} ${manrope.variable} ${playfair.variable} font-sans antialiased min-h-screen bg-background text-foreground`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "EducationalOrganization",
                  "@id": "https://www.preppath.net/#organization",
                  name: "PrepPath",
                  url: "https://www.preppath.net",
                  logo: "https://www.preppath.net/icon.svg",
                  description:
                    "Structured software engineering placement preparation, curated DSA patterns, live interactive cohorts, and 1:1 mentorship.",
                  sameAs: [
                    "https://x.com/PrepPath",
                    "https://www.linkedin.com/company/prepppath",
                    "https://www.instagram.com/preppath.nett?stkn=d3M4bGZwdGU2dGI4",
                  ],
                  offers: {
                    "@type": "Offer",
                    category: "Education / Technical Placement Preparation",
                    availability: "https://schema.org/InStock",
                    priceCurrency: "INR",
                  },
                },
                {
                  "@type": "WebSite",
                  "@id": "https://www.preppath.net/#website",
                  url: "https://www.preppath.net",
                  name: "PrepPath",
                  description:
                    "India's premier software engineering and technical placement preparation platform.",
                  publisher: {
                    "@id": "https://www.preppath.net/#organization",
                  },
                  potentialAction: {
                    "@type": "SearchAction",
                    target: {
                      "@type": "EntryPoint",
                      urlTemplate: "https://www.preppath.net/courses?search={search_term_string}",
                    },
                    "query-input": "required name=search_term_string",
                  },
                },
                {
                  "@type": "Course",
                  "@id": "https://www.preppath.net/courses#dsa",
                  name: "Data Structures & Algorithms Masterclass",
                  description:
                    "Master algorithmic problem solving, LeetCode patterns, trees, graphs, and dynamic programming for top-tier tech placements.",
                  provider: {
                    "@type": "Organization",
                    name: "PrepPath",
                    sameAs: "https://www.preppath.net",
                  },
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: "4.9",
                    bestRating: "5",
                    ratingCount: "1280",
                    reviewCount: "1280",
                  },
                  offers: {
                    "@type": "Offer",
                    category: "Paid",
                    price: "999",
                    priceCurrency: "INR",
                    availability: "https://schema.org/InStock",
                    url: "https://www.preppath.net/courses",
                  },
                  hasCourseInstance: {
                    "@type": "CourseInstance",
                    courseMode: "Online",
                    courseWorkload: "PT16W",
                  },
                },
                {
                  "@type": "Course",
                  "@id": "https://www.preppath.net/courses#fullstack",
                  name: "Full Stack & Distributed SaaS Engineering",
                  description:
                    "Modern full-stack web architecture with Next.js 15, TypeScript, React 19, Node.js, PostgreSQL, Prisma, and Docker microservices.",
                  provider: {
                    "@type": "Organization",
                    name: "PrepPath",
                    sameAs: "https://www.preppath.net",
                  },
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: "4.9",
                    bestRating: "5",
                    ratingCount: "940",
                    reviewCount: "940",
                  },
                  offers: {
                    "@type": "Offer",
                    category: "Paid",
                    price: "1499",
                    priceCurrency: "INR",
                    availability: "https://schema.org/InStock",
                    url: "https://www.preppath.net/courses",
                  },
                  hasCourseInstance: {
                    "@type": "CourseInstance",
                    courseMode: "Online",
                    courseWorkload: "PT20W",
                  },
                },
                {
                  "@type": "Course",
                  "@id": "https://www.preppath.net/courses#aiml",
                  name: "Generative AI & Autonomous Agent Systems",
                  description:
                    "From foundational ML to LLM fine-tuning, RAG pipelines, vector databases, and production PyTorch deployments.",
                  provider: {
                    "@type": "Organization",
                    name: "PrepPath",
                    sameAs: "https://www.preppath.net",
                  },
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: "4.9",
                    bestRating: "5",
                    ratingCount: "620",
                    reviewCount: "620",
                  },
                  offers: {
                    "@type": "Offer",
                    category: "Paid",
                    price: "1999",
                    priceCurrency: "INR",
                    availability: "https://schema.org/InStock",
                    url: "https://www.preppath.net/courses",
                  },
                  hasCourseInstance: {
                    "@type": "CourseInstance",
                    courseMode: "Online",
                    courseWorkload: "PT16W",
                  },
                },
                {
                  "@type": "BreadcrumbList",
                  "@id": "https://www.preppath.net/#breadcrumbs",
                  itemListElement: [
                    {
                      "@type": "ListItem",
                      position: 1,
                      name: "Home",
                      item: "https://www.preppath.net",
                    },
                    {
                      "@type": "ListItem",
                      position: 2,
                      name: "Courses",
                      item: "https://www.preppath.net/courses",
                    },
                    {
                      "@type": "ListItem",
                      position: 3,
                      name: "Practice",
                      item: "https://www.preppath.net/practice",
                    },
                  ],
                },
                {
                  "@type": "FAQPage",
                  "@id": "https://www.preppath.net/#faq",
                  mainEntity: [
                    {
                      "@type": "Question",
                      name: "Are the sessions live or recorded?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes. Programs include live sessions, and recordings are provided for revision and flexible learning.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Do I need prior experience to join?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "No. We offer learning paths suitable for beginners, intermediate learners, and professionals.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Are assignments and projects included?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes. Every program includes hands-on assignments, coding challenges, and real-world projects.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is mentorship included?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes. Learners receive guidance through mentorship, doubt-solving sessions, and project reviews.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Will I receive a certificate?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes. A certificate of completion is provided after successfully meeting the course requirements.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Do you provide placement support?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "We help with resume building, mock interviews, portfolio development, and interview preparation.",
                      },
                    },
                  ],
                },
              ],
            }),
          }}
        />
        {/* Google Analytics (gtag.js) */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-2NCL44VRC2"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-2NCL44VRC2', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
