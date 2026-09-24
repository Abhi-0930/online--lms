import { redirect } from "next/navigation";
import { createSecureUrl } from "@/lib/urlParams";

export default async function CommunityPage() {
  redirect(createSecureUrl("/dashboard", { v: "dashboard" }));
}
