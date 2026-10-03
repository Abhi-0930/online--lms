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

function LearnContent() {
  const searchParams = useSearchParams();
  const data = searchParams.get("data");
  const q = searchParams.get("q");
  const courseIdParam = searchParams.get("courseId");
  const lessonIdParam = searchParams.get("lessonId");

  const decoded = decodeDataParam<{ courseId?: string; lessonId?: string }>(data || q);
  const courseId = courseIdParam || decoded?.courseId || "";
  const lessonId = lessonIdParam || decoded?.lessonId || "";

  return <Home page="learn" courseId={courseId} lessonId={lessonId} />;
}

export default function LearnPage() {
  return (
    <Suspense fallback={<DashboardLayoutSkeleton />}>
      <LearnContent />
    </Suspense>
  );
}


