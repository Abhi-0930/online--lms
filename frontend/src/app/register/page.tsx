import { redirect } from "next/navigation";
import { createSecureUrl } from "@/lib/urlParams";

export default async function RegisterRoute({
  searchParams,
}: {
  searchParams: Promise<{ data?: string; q?: string; email?: string }>;
}) {
  const { email } = await searchParams;
  redirect(
    createSecureUrl("/", {
      mode: "register",
      ...(email ? { email } : {}),
      t: Date.now(),
    })
  );
}
