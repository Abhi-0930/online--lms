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
  setUser: (user: User | null | ((prev: User | null) => User | null), sessionToken?: string | null) => void;
  logout: () => Promise<void>;
  refresh: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const USER_STORAGE_KEY = "lms_user_profile";
export const ACTIVE_SESSION_STORAGE_KEY = "lms_active_session_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Instant synchronous hydration from tab storage or localStorage on client render
  const [user, setUserState] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const myTabToken = sessionStorage.getItem("lms_session_token");
      const activeToken = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
      if (myTabToken && activeToken && myTabToken !== activeToken) {
        return null;
      }

      const tabStored = sessionStorage.getItem("lms_user");
      if (tabStored) {
        const parsed = JSON.parse(tabStored);
        if (parsed && typeof parsed === "object") return parsed;
      }
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") return parsed;
      }
    } catch {
      // ignore JSON parse errors
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      if (sessionStorage.getItem("lms_user") || localStorage.getItem(USER_STORAGE_KEY)) return false;
    } catch {}
    return true;
  });

  const isLoggingOutRef = useRef(false);

  const setUser = useCallback((newUserOrFn: User | null | ((prev: User | null) => User | null), sessionToken?: string | null) => {
    isLoggingOutRef.current = false;
    inFlightPromiseRef.current = null;
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem("lms_manual_logout");
      } catch {}
    }
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
            sessionStorage.setItem("lms_user", JSON.stringify(nextUser));
            if (sessionToken) {
              sessionStorage.setItem("lms_session_token", sessionToken);
              localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, sessionToken);
            }
            try {
              const tokenToSend = sessionToken || localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY) || sessionStorage.getItem("lms_session_token");
              if (tokenToSend && "BroadcastChannel" in window) {
                const bc = new BroadcastChannel("lms_auth_sync");
                bc.postMessage({ type: "SESSION_SWITCHED", sessionToken: tokenToSend, userId: nextUser.id });
                bc.close();
              }
            } catch {}
          } else {
            localStorage.removeItem(USER_STORAGE_KEY);
            localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
            sessionStorage.removeItem("lms_user");
            sessionStorage.removeItem("lms_session_token");
            try {
              if ("BroadcastChannel" in window) {
                const bc = new BroadcastChannel("lms_auth_sync");
                bc.postMessage({ type: "LOGOUT" });
                bc.close();
              }
            } catch {}
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

    if (isLoggingOutRef.current || (typeof window !== "undefined" && sessionStorage.getItem("lms_manual_logout") === "true")) {
      return null;
    }

    const promise = (async () => {
      try {
        const myToken = typeof window !== "undefined" ? sessionStorage.getItem("lms_session_token") : null;
        const activeToken = typeof window !== "undefined" ? localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY) : null;

        if (myToken && activeToken && myToken !== activeToken) {
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("lms_session_token");
            sessionStorage.removeItem("lms_user");
          }
          setUserState(null);
          if (typeof window !== "undefined" && window.location.pathname !== "/") {
            window.location.href = createSecureUrl("/", { mode: "login", error: "SESSION_REVOKED" });
          }
          return null;
        }

        const tabSessionToken = typeof window !== "undefined" ? sessionStorage.getItem("lms_session_token") : null;
        const hadActiveSession = Boolean(tabSessionToken);
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (tabSessionToken) {
          headers["X-Session-Token"] = tabSessionToken;
        }

        const res = await fetch("http://localhost:4000/api/v1/auth/me", {
          method: "GET",
          headers,
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
                sessionStorage.setItem("lms_user", JSON.stringify(resolvedUser));
                if (data.sessionToken) {
                  sessionStorage.setItem("lms_session_token", data.sessionToken);
                  localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, data.sessionToken);
                }
              } catch {}
            }
            return resolvedUser;
          }
        }

        // If 401 or unauthenticated response
        if (res.status === 401 || res.status === 403) {
          const isManualLogout = isLoggingOutRef.current || (typeof window !== "undefined" && sessionStorage.getItem("lms_manual_logout") === "true");
          if (isManualLogout) {
            return null;
          }

          const errData = await res.json().catch(() => ({}));
          const wasRevoked = errData?.code === "SESSION_REVOKED";

          setUserState(null);
          if (typeof window !== "undefined") {
            try {
              sessionStorage.removeItem("lms_session_token");
              sessionStorage.removeItem("lms_user");
              localStorage.removeItem(USER_STORAGE_KEY);
              localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
            } catch {}

            // ONLY redirect if the backend explicitly informed us that the session was revoked
            // AND we had an active session and are on an internal route and not manual logout
            if (wasRevoked && hadActiveSession && window.location.pathname !== "/") {
              window.location.href = createSecureUrl("/", {
                mode: "login",
                error: "SESSION_REVOKED",
              });
            } else if (window.location.pathname !== "/" && !window.location.pathname.startsWith("/auth")) {
              router.replace(createSecureUrl("/", { mode: "login" }));
            }
          }
          return null;
        }
        return null;
      } catch {
        return null;
      } finally {
        setLoading(false);
        inFlightPromiseRef.current = null;
      }
    })();

    inFlightPromiseRef.current = promise;
    return promise;
  }, [router]);

  useEffect(() => {
    fetchUser();

    const handleAuthChange = () => {
      const myToken = typeof window !== "undefined" ? sessionStorage.getItem("lms_session_token") : null;
      const activeToken = typeof window !== "undefined" ? localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY) : null;

      if (myToken && activeToken && myToken !== activeToken) {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("lms_session_token");
          sessionStorage.removeItem("lms_user");
        }
        setUserState(null);
        if (typeof window !== "undefined") {
          window.location.href = createSecureUrl("/", { mode: "login", error: "SESSION_REVOKED" });
        }
        return;
      }

      if (typeof window !== "undefined" && !localStorage.getItem(USER_STORAGE_KEY)) {
        sessionStorage.removeItem("lms_session_token");
        sessionStorage.removeItem("lms_user");
        setUserState(null);
        return;
      }

      fetchUser().catch(() => {});
    };

    // BroadcastChannel for instant zero-latency cross-tab communication
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        channel = new BroadcastChannel("lms_auth_sync");
        channel.onmessage = (event) => {
          const data = event.data;
          if (data?.type === "SESSION_SWITCHED") {
            const myToken = sessionStorage.getItem("lms_session_token");
            const newActiveToken = data.sessionToken;
            if (myToken && newActiveToken && myToken !== newActiveToken) {
              sessionStorage.removeItem("lms_session_token");
              sessionStorage.removeItem("lms_user");
              setUserState(null);
              if (typeof window !== "undefined") {
                window.location.href = createSecureUrl("/", { mode: "login", error: "SESSION_REVOKED" });
              }
            }
          } else if (data?.type === "LOGOUT") {
            sessionStorage.removeItem("lms_session_token");
            sessionStorage.removeItem("lms_user");
            setUserState(null);
            if (typeof window !== "undefined") {
              window.location.href = createSecureUrl("/", { mode: "login" });
            }
          }
        };
      }
    } catch {}

    // Heartbeat to check active session validity every 1.5 seconds across browsers/devices
    const interval = setInterval(() => {
      const hasSession = typeof window !== "undefined" && (
        sessionStorage.getItem("lms_session_token") ||
        localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY)
      );
      if (hasSession) {
        fetchUser().catch(() => {});
      }
    }, 1500);

    const handleInteraction = () => {
      const hasSession = typeof window !== "undefined" && (
        sessionStorage.getItem("lms_session_token") ||
        localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY)
      );
      if (hasSession) {
        handleAuthChange();
        fetchUser().catch(() => {});
      }
    };

    let lastInteraction = 0;
    const handleThrottledInteraction = () => {
      const now = Date.now();
      if (now - lastInteraction > 1000) {
        lastInteraction = now;
        handleInteraction();
      }
    };

    window.addEventListener("focus", handleInteraction);
    document.addEventListener("visibilitychange", handleInteraction);
    window.addEventListener("click", handleInteraction);
    window.addEventListener("mousemove", handleThrottledInteraction, { passive: true });
    window.addEventListener("keydown", handleThrottledInteraction, { passive: true });
    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("lms:auth-change", handleAuthChange);

    return () => {
      clearInterval(interval);
      if (channel) {
        try {
          channel.close();
        } catch {}
      }
      window.removeEventListener("focus", handleInteraction);
      document.removeEventListener("visibilitychange", handleInteraction);
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("mousemove", handleThrottledInteraction);
      window.removeEventListener("keydown", handleThrottledInteraction);
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("lms:auth-change", handleAuthChange);
    };
  }, [fetchUser]);

  const logout = useCallback(async () => {
    isLoggingOutRef.current = true;
    inFlightPromiseRef.current = null;
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("lms_manual_logout", "true");
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
        localStorage.removeItem("lms_token");
        localStorage.removeItem("lms_user");
        sessionStorage.removeItem("lms_session_token");
        sessionStorage.removeItem("lms_user");
        if ("BroadcastChannel" in window) {
          const bc = new BroadcastChannel("lms_auth_sync");
          bc.postMessage({ type: "LOGOUT" });
          bc.close();
        }
      } catch {}
    }
    setUserState(null);

    try {
      await fetch("http://localhost:4000/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
      }).catch(() => {});
    } finally {
      if (typeof window !== "undefined") {
        window.location.href = createSecureUrl("/", { mode: "login" });
      }
    }
  }, []);

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
