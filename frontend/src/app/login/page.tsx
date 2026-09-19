import { redirect } from "next/navigation";
import { createSecureUrl } from "@/lib/urlParams";

export default async function LoginRoute({
  searchParams,
}: {
  searchParams: Promise<{ data?: string; q?: string; error?: string; email?: string }>;
}) {
  const { error, email } = await searchParams;
  redirect(
    createSecureUrl("/", {
      mode: "login",
      ...(error ? { error } : {}),
      ...(email ? { email } : {}),
    })
  );
}
