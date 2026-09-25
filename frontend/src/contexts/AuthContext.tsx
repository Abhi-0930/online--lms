"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createSecureUrl } from "@/lib/urlParams";

export interface User {
  id?: string;
  name?: string;
  fullName?: string;
  email?: string;
  avatarUrl?: string;
  role?: string;
  educationStatus?: string;
  onboarding?: {
    educationStatus?: string | null;
    targetDomain?: string | null;
    experienceLevel?: string | null;
    primaryGoal?: string | null;
    completedStep?: number;
    isCompleted?: boolean;
  };
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null | ((prev: User | null) => User | null)) => void;
  logout: () => Promise<void>;
  refresh: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const USER_STORAGE_KEY = "lms_user_profile";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Instant synchronous hydration from localStorage on client render
  const [user, setUserState] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          return parsed;
        }
      }
    } catch {
      // ignore JSON parse errors
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) return false;
    } catch {}
    return true;
  });

  const setUser = useCallback((newUserOrFn: User | null | ((prev: User | null) => User | null)) => {
    setUserState((prev) => {
      let nextUser = typeof newUserOrFn === "function" ? newUserOrFn(prev) : newUserOrFn;
      if (nextUser && typeof nextUser === "object") {
        const resolvedName = nextUser.fullName || nextUser.name || "";
        nextUser = {
          ...nextUser,
          name: nextUser.name || resolvedName,
          fullName: nextUser.fullName || resolvedName,
        };
      }
      if (typeof window !== "undefined") {
        try {
          if (nextUser) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
          } else {
            localStorage.removeItem(USER_STORAGE_KEY);
          }
          window.dispatchEvent(new Event("lms:auth-change"));
        } catch {}
      }
      return nextUser;
    });
  }, []);

  const inFlightPromiseRef = useRef<Promise<User | null> | null>(null);

  const fetchUser = useCallback(async (): Promise<User | null> => {
    if (inFlightPromiseRef.current) {
      return inFlightPromiseRef.current;
    }

    const promise = (async () => {
      try {
        const res = await fetch("http://localhost:4000/api/v1/auth/me", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            const resolvedName = data.user.fullName || data.user.name || "";
            const resolvedUser: User = {
              ...data.user,
              name: data.user.name || resolvedName,
              fullName: data.user.fullName || resolvedName,
            };
            setUserState(resolvedUser);
            if (typeof window !== "undefined") {
              try {
                localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(resolvedUser));
              } catch {}
            }
            return resolvedUser;
          }
        }

        // If 401 or unauthenticated response, clear local cache
        if (res.status === 401 || res.status === 403) {
          const errData = await res.json().catch(() => ({}));
          const wasRevoked = errData?.code === "SESSION_REVOKED";
          setUserState(null);
          if (typeof window !== "undefined") {
            try {
              localStorage.removeItem(USER_STORAGE_KEY);
            } catch {}
            if (wasRevoked && window.location.pathname !== "/") {
              window.location.href = createSecureUrl("/", { error: "SESSION_REVOKED" });
            }
          }
        }
        return null;
      } catch {
        // Offline / network failure: keep the currently cached user for graceful resilience
        return null;
      } finally {
        setLoading(false);
        inFlightPromiseRef.current = null;
      }
    })();

    inFlightPromiseRef.current = promise;
    return promise;
  }, []);

  useEffect(() => {
    fetchUser();

    const handleAuthChange = () => {
      try {
        const stored = localStorage.getItem(USER_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === "object") {
            setUserState(parsed);
          }
        } else {
          setUserState(null);
        }
      } catch {}
    };

    // Check session validity periodically and on window focus
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchUser();
      }
    }, 15000);

    const handleFocus = () => {
      fetchUser();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("lms:auth-change", handleAuthChange);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("lms:auth-change", handleAuthChange);
    };
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      await fetch("http://localhost:4000/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
      }).catch(() => {});
    } finally {
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(USER_STORAGE_KEY);
          localStorage.removeItem("lms_token");
          localStorage.removeItem("lms_user");
        } catch {}
      }
      setUserState(null);
      router.push(createSecureUrl("/", { mode: "login" }));
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        setUser,
        logout,
        refresh: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
