import Home from "@/components/HomeView";
import { decodeDataParam } from "@/lib/urlParams";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string; q?: string; courseId?: string }>;
}) {
  const { data, q, courseId } = await searchParams;
  const decoded = decodeDataParam<{ courseId?: string; v?: string }>(data || q);

  const targetCourseId = decoded?.courseId || courseId || "dsa-foundations";
  return <Home page="checkout" courseId={targetCourseId} />;
}
