import { redirect } from "next/navigation";
import Home from "@/components/HomeView";
import { createSecureUrl, decodeDataParam } from "@/lib/urlParams";

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string; q?: string }>;
}) {
  const { data, q } = await searchParams;
  const decoded = decodeDataParam<{ slug?: string; problemId?: string; v?: string }>(data || q);

  if (!decoded) {
    redirect(createSecureUrl("/practice", { v: "practice" }));
  }

  return <Home page="practice" problemSlug={decoded?.slug || decoded?.problemId} />;
}
