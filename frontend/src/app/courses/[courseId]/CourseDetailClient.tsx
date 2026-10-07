"use client";

import dynamic from "next/dynamic";
import { DashboardLayoutSkeleton } from "@/components/DashboardLayoutSkeleton";

const Home = dynamic(() => import("@/components/HomeView"), {
  loading: () => <DashboardLayoutSkeleton />,
  ssr: false,
});

export default function CourseDetailClient({ courseId }: { courseId: string }) {
  return <Home page="course-detail" courseId={courseId} />;
}
