import { redirect } from "next/navigation";
import Home from "@/components/HomeView";
import { createSecureUrl, decodeDataParam } from "@/lib/urlParams";

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string; q?: string }>;
}) {
  const { data, q } = await searchParams;
  const decoded = decodeDataParam(data || q);

  if (!decoded) {
    redirect(createSecureUrl("/learn", { v: "learn", t: Date.now() }));
  }

  return <Home page="learn" />;
}
