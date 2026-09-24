import { redirect } from "next/navigation";
import Home from "@/components/HomeView";
import { createSecureUrl, decodeDataParam } from "@/lib/urlParams";

export default async function RecordingsAppPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string; q?: string; id?: string }>;
}) {
  const { data, q, id } = await searchParams;
  const decoded = decodeDataParam<{ id?: string; recordingId?: string }>(data || q);
  const recordingId = id || decoded?.id || decoded?.recordingId || "";

  if (!decoded && !id) {
    redirect(createSecureUrl("/recordings", { v: "recordings" }));
  }

  return <Home page="recordings" recordingId={recordingId} />;
}
