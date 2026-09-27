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

function LiveSessionContent() {
  const searchParams = useSearchParams();
  const data = searchParams.get("data");
  const q = searchParams.get("q");
  const id = searchParams.get("id");
  const decoded = decodeDataParam<{ id?: string; sessionId?: string }>(data || q);
  const sessionId = id || decoded?.id || decoded?.sessionId || "";

  return <Home page="live-session" sessionId={sessionId} />;
}

export default function LiveSessionAppPage() {
  return (
    <Suspense fallback={<DashboardLayoutSkeleton />}>
      <LiveSessionContent />
    </Suspense>
  );
}


