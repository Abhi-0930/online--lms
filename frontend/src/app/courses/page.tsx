import { redirect } from "next/navigation";
import Home from "@/components/HomeView";
import { createSecureUrl, decodeDataParam } from "@/lib/urlParams";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string; q?: string }>;
}) {
  const { data, q } = await searchParams;
  const decoded = decodeDataParam<{ courseId?: string; v?: string }>(data || q);

  if (!decoded) {
    redirect(createSecureUrl("/courses", { v: "courses", t: Date.now() }));
  }

  if (decoded?.courseId) {
    return <Home page="course-detail" courseId={decoded.courseId} />;
  }

  return <Home page="courses" />;
}
