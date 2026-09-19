"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSecureUrl } from "@/lib/urlParams";
import { useAuthContext, User, USER_STORAGE_KEY } from "@/contexts/AuthContext";

export type { User };
export { USER_STORAGE_KEY };

export function useAuth(options?: { redirectOnUnauthenticated?: boolean; redirectPath?: string }) {
  const router = useRouter();
  const { user, loading, isAuthenticated, logout, refresh, setUser } = useAuthContext();

  useEffect(() => {
    if (options?.redirectOnUnauthenticated && !loading && !user) {
      router.push(createSecureUrl(options.redirectPath || "/", { mode: "login" }));
    }
  }, [options, loading, user, router]);

  return {
    user,
    loading,
    isAuthenticated,
    logout,
    refresh,
    setUser,
  };
}
