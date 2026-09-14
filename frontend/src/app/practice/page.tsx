import Home from "@/components/HomeView";
import { decodeDataParam } from "@/lib/urlParams";

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string; q?: string }>;
}) {
  const { data, q } = await searchParams;
  const decoded = decodeDataParam<{ slug?: string; problemId?: string }>(data || q);

  return <Home page="practice" problemSlug={decoded?.slug || decoded?.problemId} />;
}
