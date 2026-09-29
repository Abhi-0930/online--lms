"use client";

import dynamic from "next/dynamic";
import { use, Suspense } from "react";
import { DashboardLayoutSkeleton } from "@/components/DashboardLayoutSkeleton";

const Home = dynamic(() => import("@/components/HomeView"), {
  loading: () => <DashboardLayoutSkeleton />,
  ssr: false,
});

function PracticeProblemSlugContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return <Home page="practice" problemSlug={slug} />;
}

export default function PracticeProblemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<DashboardLayoutSkeleton />}>
      <PracticeProblemSlugContent params={params} />
    </Suspense>
  );
}
