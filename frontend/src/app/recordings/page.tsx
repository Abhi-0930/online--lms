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

function RecordingsContent() {
  const searchParams = useSearchParams();
  const data = searchParams.get("data");
  const q = searchParams.get("q");
  const id = searchParams.get("id");
  const decoded = decodeDataParam<{ id?: string; recordingId?: string }>(data || q);
  const recordingId = id || decoded?.id || decoded?.recordingId || "";

  return <Home page="recordings" recordingId={recordingId} />;
}

export default function RecordingsAppPage() {
  return (
    <Suspense fallback={<DashboardLayoutSkeleton />}>
      <RecordingsContent />
    </Suspense>
  );
}


