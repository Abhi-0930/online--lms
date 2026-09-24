import { redirect } from "next/navigation";
import { createSecureUrl, decodeDataParam } from "@/lib/urlParams";

export default async function SessionsRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string; q?: string; id?: string }>;
}) {
  const { data, q, id } = await searchParams;
  const decoded = decodeDataParam<{ id?: string; sessionId?: string }>(data || q);
  const sessionId = id || decoded?.id || decoded?.sessionId || "";

  redirect(createSecureUrl("/live-session", { id: sessionId || undefined, v: "live-session" }));
}
