"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { decodeDataParam } from "@/lib/urlParams";
import { DashboardLayoutSkeleton } from "@/components/DashboardLayoutSkeleton";

const Home = dynamic(() => import("@/components/HomeView"), {
  loading: () => <DashboardLayoutSkeleton />,
  ssr: false,
});

function CoursesContent() {
  const searchParams = useSearchParams();
  const data = searchParams.get("data");
  const q = searchParams.get("q");
  const courseIdParam = searchParams.get("courseId");
  const decoded = decodeDataParam<{ courseId?: string; v?: string }>(data || q);
  const targetCourseId = courseIdParam || decoded?.courseId;

  if (targetCourseId) {
    if (decoded?.v === "checkout") {
      return <Home page="checkout" courseId={targetCourseId} />;
    }
    return <Home page="course-detail" courseId={targetCourseId} />;
  }

  return <Home page="courses" />;
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<DashboardLayoutSkeleton />}>
      <CoursesContent />
    </Suspense>
  );
}


