"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { DashboardLayoutSkeleton } from "@/components/DashboardLayoutSkeleton";

const Home = dynamic(() => import("@/components/HomeView"), {
  loading: () => <DashboardLayoutSkeleton />,
  ssr: false,
});

export default function PracticeProblemClient({ slug }: { slug: string }) {
  return (
    <Suspense fallback={<DashboardLayoutSkeleton />}>
      <Home page="practice" problemSlug={slug} />
    </Suspense>
  );
}
