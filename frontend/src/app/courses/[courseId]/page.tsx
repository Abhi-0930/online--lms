import Home from "@/components/HomeView";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <Home page="course-detail" courseId={courseId || "dsa-foundations"} />;
}
