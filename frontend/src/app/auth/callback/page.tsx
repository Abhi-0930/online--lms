"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSecureUrl } from "@/lib/urlParams";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function processCallback() {
      const isNewUser = searchParams.get("isNewUser") === "true";
      const errorParam = searchParams.get("error");

      if (errorParam) {
        router.replace(
          createSecureUrl("/", {
            mode: "login",
            error: errorParam,
            t: Date.now(),
          })
        );
        return;
      }

      try {
        const res = await fetch("http://localhost:4000/api/v1/auth/me", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          const user = data?.user;
          if (user) {
            try {
              localStorage.setItem("lms_user_profile", JSON.stringify(user));
            } catch {}
          }

          if (isNewUser || !user?.onboarding?.isCompleted) {
            router.replace(
              createSecureUrl("/onboarding", {
                step: user?.onboarding?.completedStep || 1,
                t: Date.now(),
              })
            );
          } else {
            router.replace(
              createSecureUrl("/dashboard", {
                v: "dashboard",
                t: Date.now(),
              })
            );
          }
          return;
        }

        // If not authenticated or error, redirect to login
        router.replace(
          createSecureUrl("/", {
            mode: "login",
            error: "AUTH_FAILED",
            t: Date.now(),
          })
        );
      } catch {
        router.replace(
          createSecureUrl("/", {
            mode: "login",
            error: "AUTH_FAILED",
            t: Date.now(),
          })
        );
      }
    }

    processCallback();
  }, [router, searchParams]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-[15px] font-medium text-gray-700">Signing you in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
