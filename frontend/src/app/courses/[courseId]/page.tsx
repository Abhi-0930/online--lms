import { redirect } from "next/navigation";
import { createSecureUrl } from "@/lib/urlParams";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const secureUrl = createSecureUrl("/courses", { courseId: courseId || "dsa-foundations" });
  redirect(secureUrl);
}
