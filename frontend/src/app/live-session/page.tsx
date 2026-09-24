import { redirect } from "next/navigation";
import Home from "@/components/HomeView";
import { createSecureUrl, decodeDataParam } from "@/lib/urlParams";

export default async function LiveSessionAppPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string; q?: string; id?: string }>;
}) {
  const { data, q, id } = await searchParams;
  const decoded = decodeDataParam<{ id?: string; sessionId?: string }>(data || q);
  const sessionId = id || decoded?.id || decoded?.sessionId || "";

  if (!decoded && !id) {
    redirect(createSecureUrl("/live-session", { v: "live-session" }));
  }

  return <Home page="live-session" sessionId={sessionId} />;
}
