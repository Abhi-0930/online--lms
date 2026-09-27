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

function CheckoutContent() {
  const searchParams = useSearchParams();
  const data = searchParams.get("data");
  const q = searchParams.get("q");
  const courseIdParam = searchParams.get("courseId");
  const decoded = decodeDataParam<{ courseId?: string; v?: string }>(data || q);

  const targetCourseId = decoded?.courseId || courseIdParam || "dsa-foundations";
  return <Home page="checkout" courseId={targetCourseId} />;
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<DashboardLayoutSkeleton />}>
      <CheckoutContent />
    </Suspense>
  );
}

