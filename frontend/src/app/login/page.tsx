import { redirect } from "next/navigation";
import { createSecureUrl } from "@/lib/urlParams";

export default async function LoginRoute({
  searchParams,
}: {
  searchParams: Promise<{ data?: string; q?: string }>;
}) {
  const { data, q } = await searchParams;
  redirect(createSecureUrl("/", { mode: "login", t: Date.now() }));
}
