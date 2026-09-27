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

function PracticeContent() {
  const searchParams = useSearchParams();
  const data = searchParams.get("data");
  const q = searchParams.get("q");
  const slugParam = searchParams.get("slug");
  const problemIdParam = searchParams.get("problemId");
  const decoded = decodeDataParam<{ slug?: string; problemId?: string; v?: string }>(data || q);
  const targetSlug = slugParam || problemIdParam || decoded?.slug || decoded?.problemId;

  return <Home page="practice" problemSlug={targetSlug} />;
}

export default function PracticePage() {
  return (
    <Suspense fallback={<DashboardLayoutSkeleton />}>
      <PracticeContent />
    </Suspense>
  );
}


