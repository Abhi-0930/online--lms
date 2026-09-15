"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createSecureUrl } from "@/lib/urlParams";

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    const email = searchParams.get("email");
    const isNewUser = searchParams.get("isNewUser");

    if (error === "ACCOUNT_NOT_FOUND") {
      toast.error("No account found with this Google account. Please create an account first.");
      router.push(createSecureUrl("/", { mode: "register", error: "ACCOUNT_NOT_FOUND", ...(email ? { email } : {}), t: Date.now() }));
      return;
    }

    if (error) {
      toast.error("Google authentication failed. Please try again.");
      router.push(createSecureUrl("/", { mode: "login", t: Date.now() }));
      return;
    }

    // Auth token is securely delivered via HttpOnly cookie
    toast.success(isNewUser === "true" ? "Welcome! Account created successfully." : "Signed in with Google successfully!");
    if (isNewUser === "true") {
      router.push(createSecureUrl("/onboarding", { step: 1 }));
    } else {
      router.push(createSecureUrl("/dashboard", { v: "dashboard", t: Date.now() }));
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
