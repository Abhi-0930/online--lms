"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface User {
  id?: string;
  name?: string;
  fullName?: string;
  email?: string;
  avatarUrl?: string;
  role?: string;
  onboarding?: {
    educationStatus?: string | null;
    targetDomain?: string | null;
    experienceLevel?: string | null;
    primaryGoal?: string | null;
    completedStep?: number;
    isCompleted?: boolean;
  };
}

export function useAuth(options?: { redirectOnUnauthenticated?: boolean; redirectPath?: string }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      // Fetch authenticated profile via secure HttpOnly session cookie
      const res = await fetch("http://localhost:4000/api/v1/auth/me", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          setUser(data.user);
          setLoading(false);
          return;
        }
      }

      setUser(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      await fetch("http://localhost:4000/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
      }).catch(() => {});
    } finally {
      // Clean up any remaining legacy localStorage keys
      try {
        localStorage.removeItem("lms_token");
        localStorage.removeItem("lms_user");
      } catch {}

      setUser(null);
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    if (options?.redirectOnUnauthenticated && !loading && !user) {
      router.push(options.redirectPath || "/");
    }
  }, [options, loading, user, router]);

  return {
    user,
    loading,
    isAuthenticated: Boolean(user),
    logout,
    refresh: fetchUser,
  };
}
