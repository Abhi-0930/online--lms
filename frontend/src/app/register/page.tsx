import { redirect } from "next/navigation";
import { createSecureUrl } from "@/lib/urlParams";

export default async function RegisterRoute({
  searchParams,
}: {
  searchParams: Promise<{ data?: string; q?: string; email?: string; error?: string }>;
}) {
  const { email, error } = await searchParams;
  redirect(
    createSecureUrl("/", {
      mode: "register",
      ...(error ? { error } : {}),
      ...(email ? { email } : {}),
      t: Date.now(),
    })
  );
}
