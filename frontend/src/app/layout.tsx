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
  metadataBase: new URL("https://preppath.net"),
  title: {
    default: "PrepPath - Where ambition finds its path",
    template: "%s | PrepPath",
  },
  description:
    "PrepPath is India's premium software engineering and technical placement preparation platform. Structured DSA patterns, system design, mock interviews, and FAANG career roadmaps.",
  keywords: [
    "PrepPath",
    "DSA preparation",
    "software engineer roadmap",
    "placement preparation",
    "coding interview prep",
    "FAANG interview coaching",
    "system design course",
    "full stack developer roadmap",
    "LeetCode patterns",
  ],
  authors: [{ name: "PrepPath Team", url: "https://preppath.net" }],
  creator: "PrepPath",
  publisher: "PrepPath",
  alternates: {
    canonical: "https://preppath.net",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://preppath.net",
    siteName: "PrepPath",
    title: "PrepPath - Where ambition finds its path",
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
    title: "PrepPath - Where ambition finds its path",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: "PrepPath",
              url: "https://preppath.net",
              logo: "https://preppath.net/icon.svg",
              description:
                "Structured software engineering placement preparation, curated DSA patterns, live interactive cohorts, and 1:1 mentorship.",
              sameAs: [
                "https://twitter.com/preppath",
                "https://linkedin.com/company/preppath",
                "https://instagram.com/preppath",
              ],
              offers: {
                "@type": "Offer",
                category: "Education / Technical Placement Preparation",
                availability: "https://schema.org/InStock",
                priceCurrency: "INR",
              },
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
      </head>
      <body className={`${dmSans.variable} ${manrope.variable} ${playfair.variable} font-sans antialiased min-h-screen bg-background text-foreground`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
