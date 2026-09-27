"use client";

import dynamic from "next/dynamic";
import { DashboardLayoutSkeleton } from "@/components/DashboardLayoutSkeleton";

const Home = dynamic(() => import("@/components/HomeView"), {
  loading: () => <DashboardLayoutSkeleton />,
  ssr: false,
});

export default function AssignmentsPage() {
  return <Home page="assignments" />;
}


