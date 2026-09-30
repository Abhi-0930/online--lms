"use client";

export const dynamic = "force-dynamic";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSecureUrl } from "@/lib/urlParams";
import { useAuth } from "@/hooks/useAuth";
import { API_BASE_URL } from "@/lib/apiConfig";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    async function processCallback() {
      const isNewUser = searchParams.get("isNewUser") === "true";
      const errorParam = searchParams.get("error");

      if (errorParam) {
        router.replace(
          createSecureUrl("/login", {
            mode: "login",
            error: errorParam,
          })
        );
        return;
      }

      const tokenParam = searchParams.get("token");
      const sessionTokenParam = searchParams.get("sessionToken");

      if (typeof window !== "undefined") {
        try {
          sessionStorage.removeItem("lms_manual_logout");
          sessionStorage.removeItem("lms_session_revoked");
          if (tokenParam) {
            sessionStorage.setItem("lms_access_token", tokenParam);
            localStorage.setItem("lms_access_token", tokenParam);
          }
          if (sessionTokenParam) {
            sessionStorage.setItem("lms_session_token", sessionTokenParam);
            localStorage.setItem("lms_active_session_token", sessionTokenParam);
          }
        } catch {}
      }

      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (tokenParam) {
          headers["Authorization"] = `Bearer ${tokenParam}`;
        }
        if (sessionTokenParam) {
          headers["X-Session-Token"] = sessionTokenParam;
        }

        const res = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
          method: "GET",
          headers,
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          const user = data?.user;
          const resolvedSessionToken = sessionTokenParam || data?.sessionToken;
          if (user) {
            const resolvedUser = {
              ...user,
              name: user.fullName || user.name,
              fullName: user.fullName || user.name,
            };
            setUser(resolvedUser, resolvedSessionToken, tokenParam);
          }

          if (isNewUser || (user && user.onboarding && !user.onboarding.isCompleted)) {
            router.replace(
              createSecureUrl("/onboarding", {
                step: user?.onboarding?.completedStep || 1,
              })
            );
          } else {
            router.replace(
              createSecureUrl("/dashboard", {
                v: "dashboard",
              })
            );
          }
          return;
        }

        // Fallback: If token exists but /me returned an error, decode JWT and log in
        if (tokenParam) {
          try {
            const base64Payload = tokenParam.split(".")[1];
            if (base64Payload) {
              const decodedStr = atob(base64Payload.replace(/-/g, "+").replace(/_/g, "/"));
              const payload = JSON.parse(decodedStr);
              if (payload?.id || payload?.email) {
                const fallbackName = payload.email ? payload.email.split("@")[0] : "Learner";
                const fallbackUser = {
                  id: payload.id,
                  email: payload.email,
                  name: fallbackName,
                  fullName: fallbackName,
                  role: payload.role || "STUDENT",
                };
                setUser(fallbackUser, sessionTokenParam || payload.sessionToken, tokenParam);
                router.replace(createSecureUrl("/dashboard", { v: "dashboard" }));
                return;
              }
            }
          } catch {}
        }

        // If not authenticated or error, redirect to login
        router.replace(
          createSecureUrl("/login", {
            mode: "login",
            error: "AUTH_FAILED",
          })
        );
      } catch {
        // Network fallback with token
        if (tokenParam) {
          try {
            const base64Payload = tokenParam.split(".")[1];
            if (base64Payload) {
              const decodedStr = atob(base64Payload.replace(/-/g, "+").replace(/_/g, "/"));
              const payload = JSON.parse(decodedStr);
              if (payload?.id || payload?.email) {
                const fallbackName = payload.email ? payload.email.split("@")[0] : "Learner";
                const fallbackUser = {
                  id: payload.id,
                  email: payload.email,
                  name: fallbackName,
                  fullName: fallbackName,
                  role: payload.role || "STUDENT",
                };
                setUser(fallbackUser, sessionTokenParam || payload.sessionToken, tokenParam);
                router.replace(createSecureUrl("/dashboard", { v: "dashboard" }));
                return;
              }
            }
          } catch {}
        }
        router.replace(
          createSecureUrl("/login", {
            mode: "login",
            error: "AUTH_FAILED",
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
