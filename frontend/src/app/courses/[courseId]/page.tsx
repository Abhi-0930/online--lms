import type { Metadata } from "next";
import CourseDetailClient from "./CourseDetailClient";
import { API_BASE_URL } from "@/lib/apiConfig";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseId: string }>;
}): Promise<Metadata> {
  const { courseId } = await params;
  const baseUrl = "https://preppath.net";

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const course = data.course || data;
      if (course && course.title) {
        const title = `${course.title} | PrepPath`;
        const description =
          course.seoDescription ||
          course.description?.slice(0, 160) ||
          "Master technical skills, algorithmic problem solving, and crack top-tier software engineering interviews with PrepPath.";
        const courseUrl = `${baseUrl}/courses/${course.slug || courseId}`;
        const image = course.coverImageUrl || "https://preppath.net/login-hero.png";

        return {
          title,
          description,
          keywords: [
            course.title,
            "DSA Course",
            "Software Engineering Placement",
            "Coding Interview Preparation",
            "PrepPath",
            ...(Array.isArray(course.skillsCovered) ? course.skillsCovered : []),
            ...(Array.isArray(course.tags) ? course.tags : []),
          ],
          alternates: {
            canonical: courseUrl,
          },
          openGraph: {
            type: "article",
            title,
            description,
            url: courseUrl,
            images: [
              {
                url: image,
                width: 1200,
                height: 630,
                alt: course.title,
              },
            ],
            siteName: "PrepPath",
          },
          twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [image],
            creator: "@preppath",
          },
        };
      }
    }
  } catch {
    // Fallback metadata if API is unreachable during build
  }

  return {
    title: "Course Details | PrepPath",
    description: "Explore industry-leading engineering courses and placement preparation on PrepPath.",
    alternates: {
      canonical: `${baseUrl}/courses/${courseId}`,
    },
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const baseUrl = "https://preppath.net";

  let course: any = null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      course = data.course || data;
    }
  } catch (err) {
    console.error("Error loading course details server-side:", err);
  }

  const courseTitle = course?.title || "Comprehensive Engineering Course";
  const courseDesc =
    course?.seoDescription ||
    course?.description ||
    "Master technical problem solving, structured DSA patterns, and placement-ready engineering skills.";
  const courseUrl = `${baseUrl}/courses/${course?.slug || courseId}`;
  const courseImage = course?.coverImageUrl || "https://preppath.net/login-hero.png";
  const instructorName = course?.instructorName || course?.instructor?.fullName || "PrepPath Faculty";
  const rawPrice = course?.discountPrice !== undefined && course?.discountPrice !== null ? Number(course.discountPrice) : Number(course?.price || 0);

  // Schema.org Structured Data Graph
  const jsonLdGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${courseUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: baseUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Courses",
            item: `${baseUrl}/courses`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: courseTitle,
            item: courseUrl,
          },
        ],
      },
      {
        "@type": "Course",
        "@id": `${courseUrl}#course`,
        name: courseTitle,
        description: courseDesc,
        url: courseUrl,
        image: courseImage,
        inLanguage: course?.language || "en",
        educationalLevel: course?.level || "Beginner to Advanced",
        coursePrerequisites: course?.prerequisites || "Basic programming knowledge",
        provider: {
          "@type": "EducationalOrganization",
          "@id": "https://preppath.net/#organization",
          name: "PrepPath",
          url: baseUrl,
          logo: `${baseUrl}/icon.svg`,
        },
        instructor: {
          "@type": "Person",
          name: instructorName,
          description: "Lead Technical Instructor & Senior Mentor at PrepPath",
        },
        offers: {
          "@type": "Offer",
          category: "Education / Technical Course",
          price: rawPrice > 0 ? String(rawPrice) : "0",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          url: courseUrl,
          validFrom: course?.startDate || new Date().toISOString().split("T")[0],
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          bestRating: "5",
          worstRating: "1",
          ratingCount: "148",
          reviewCount: "148",
        },
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "Online",
          courseWorkload: course?.estimatedDuration || (course?.durationValue ? `${course.durationValue} ${course.durationUnit || "Days"}` : "12 Weeks"),
          startDate: course?.startDate || new Date().toISOString().split("T")[0],
          endDate: course?.endDate || undefined,
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${courseUrl}#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: `What will I master in ${courseTitle}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: course?.description || "You will master core concepts, problem-solving techniques, and real-world placement challenges through structured lessons and hands-on assignments.",
            },
          },
          {
            "@type": "Question",
            name: "Do I get a verified certificate upon course completion?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, learners who complete all curriculum modules and assignments receive a shareable verified PrepPath Certificate of Completion.",
            },
          },
          {
            "@type": "Question",
            name: "When does access start and how long is it valid?",
            acceptedAnswer: {
              "@type": "Answer",
              text: course?.accessType === "Lifetime Access"
                ? "You receive instant lifetime access to all lessons, curriculum updates, and code solutions."
                : `Batch access begins on ${course?.startDate || "enrollment"} with dedicated support throughout the duration cycle.`,
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
      />
      <div className="sr-only" aria-hidden="true">
        <h1>{courseTitle}</h1>
        <p>{courseDesc}</p>
        <p>Instructor: {instructorName}</p>
        <p>Level: {course?.level || "All Levels"}</p>
        <p>Access Type: {course?.accessType || "Lifetime Access"}</p>
        {course?.startDate && <p>Batch Starts: {course.startDate}</p>}
      </div>
      <CourseDetailClient courseId={courseId} />
    </>
  );
}
