import { redirect } from "next/navigation";
import { createSecureUrl } from "@/lib/urlParams";

export default async function PracticeProblemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const secureUrl = createSecureUrl("/practice", { slug: slug || "two-sum" });
  redirect(secureUrl);
}
