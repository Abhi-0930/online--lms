import Home from "@/components/HomeView";

export default async function PracticeProblemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await params;
  return <Home page="practice" />;
}
