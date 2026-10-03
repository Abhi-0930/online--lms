"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { DashboardLayoutSkeleton } from "@/components/DashboardLayoutSkeleton";

const Home = dynamic(() => import("@/components/HomeView"), {
  loading: () => <DashboardLayoutSkeleton />,
  ssr: false,
});

export default function LearnPage() {
  const searchParams = useSearchParams();
  const courseId = searchParams?.get("courseId") || "";
  const lessonId = searchParams?.get("lessonId") || "";

  return <Home page="learn" courseId={courseId} lessonId={lessonId} />;
}


