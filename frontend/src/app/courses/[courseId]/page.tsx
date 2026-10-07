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
          "Master technical skills and land top engineering roles with PrepPath.";
        const courseUrl = `${baseUrl}/courses/${course.slug || courseId}`;
        return {
          title,
          description,
          alternates: {
            canonical: courseUrl,
          },
          openGraph: {
            title,
            description,
            url: courseUrl,
            images: course.coverImageUrl ? [course.coverImageUrl] : undefined,
          },
          twitter: {
            card: "summary_large_image",
            title,
            description,
            images: course.coverImageUrl ? [course.coverImageUrl] : undefined,
          },
        };
      }
    }
  } catch {
    // Fallback metadata if API is unreachable during build
  }

  return {
    title: "Course Details | PrepPath",
    description: "Explore industry-leading engineering courses on PrepPath.",
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
  return <CourseDetailClient courseId={courseId} />;
}
