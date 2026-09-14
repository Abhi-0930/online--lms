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
}

export function useAuth(options?: { redirectOnUnauthenticated?: boolean; redirectPath?: string }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(() => {
    try {
      const stored = localStorage.getItem("lms_user");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(() => {
    localStorage.removeItem("lms_token");
    localStorage.removeItem("lms_user");
    setUser(null);
    router.push("/");
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
