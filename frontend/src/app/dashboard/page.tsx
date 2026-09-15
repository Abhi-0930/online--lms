import { redirect } from "next/navigation";
import Home from "@/components/HomeView";
import { createSecureUrl, decodeDataParam } from "@/lib/urlParams";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string; q?: string }>;
}) {
  const { data, q } = await searchParams;
  const decoded = decodeDataParam(data || q);

  if (!decoded) {
    redirect(createSecureUrl("/dashboard", { v: "dashboard", t: Date.now() }));
  }

  return <Home page="dashboard" />;
}
