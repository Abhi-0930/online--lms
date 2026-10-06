"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createSecureUrl } from "@/lib/urlParams";
import { API_BASE_URL } from "@/lib/apiConfig";

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
  setUser: (
    user: User | null | ((prev: User | null) => User | null),
    sessionToken?: string | null,
    accessToken?: string | null
  ) => void;
  logout: () => Promise<void>;
  refresh: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const USER_STORAGE_KEY = "lms_user_profile";
export const ACTIVE_SESSION_STORAGE_KEY = "lms_active_session_token";
export const ACCESS_TOKEN_STORAGE_KEY = "lms_access_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Instant synchronous hydration from tab storage or localStorage on client render
  const [user, setUserState] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      if (sessionStorage.getItem("lms_manual_logout") === "true") return null;
      const tabStored = sessionStorage.getItem("lms_user");
      if (tabStored) {
        const parsed = JSON.parse(tabStored);
        if (parsed && typeof parsed === "object") {
          return parsed;
        }
      }
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
      if (sessionStorage.getItem("lms_manual_logout") === "true") return false;
      if (sessionStorage.getItem("lms_user") || localStorage.getItem(USER_STORAGE_KEY)) return false;
    } catch {}
    return true;
  });

  const isLoggingOutRef = useRef(false);

  const setUser = useCallback(
    (
      newUserOrFn: User | null | ((prev: User | null) => User | null),
      sessionToken?: string | null,
      accessToken?: string | null
    ) => {
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
              if (accessToken) {
                sessionStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
                localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
              }
              try {
                const tokenToSend =
                  sessionToken ||
                  localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY) ||
                  sessionStorage.getItem("lms_session_token");
                if (tokenToSend && "BroadcastChannel" in window) {
                  const bc = new BroadcastChannel("lms_auth_sync");
                  bc.postMessage({ type: "SESSION_SWITCHED", sessionToken: tokenToSend, userId: nextUser.id });
                  bc.close();
                }
              } catch {}
            } else {
              localStorage.removeItem(USER_STORAGE_KEY);
              localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
              localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
              sessionStorage.removeItem("lms_user");
              sessionStorage.removeItem("lms_session_token");
              sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
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
    },
    []
  );

  const inFlightPromiseRef = useRef<Promise<User | null> | null>(null);

  const fetchUser = useCallback(async (): Promise<User | null> => {
    if (inFlightPromiseRef.current) {
      return inFlightPromiseRef.current;
    }

    if (
      isLoggingOutRef.current ||
      (typeof window !== "undefined" && sessionStorage.getItem("lms_manual_logout") === "true")
    ) {
      return null;
    }

    const myToken = typeof window !== "undefined" ? sessionStorage.getItem("lms_session_token") : null;
    const activeToken = typeof window !== "undefined" ? localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY) : null;
    const resolvedSessionToken = myToken || activeToken;
    const accessToken = typeof window !== "undefined"
      ? (sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) || localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY))
      : null;

    // If completely logged out with zero stored credentials, avoid ghost re-authentication
    const hasAnyLocalCreds =
      resolvedSessionToken ||
      accessToken ||
      (typeof window !== "undefined" &&
        (localStorage.getItem(USER_STORAGE_KEY) || sessionStorage.getItem("lms_user")));

    if (!hasAnyLocalCreds) {
      setUserState(null);
      setLoading(false);
      return null;
    }

    if (resolvedSessionToken && typeof window !== "undefined" && !myToken) {
      sessionStorage.setItem("lms_session_token", resolvedSessionToken);
    }

    const promise = (async () => {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (resolvedSessionToken) {
          headers["X-Session-Token"] = resolvedSessionToken;
        }
        if (accessToken) {
          headers["Authorization"] = `Bearer ${accessToken}`;
        }

        const res = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
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

        // If explicitly unauthorized or user deleted
        if (res.status === 401 || res.status === 403) {
          setUserState(null);
          if (typeof window !== "undefined") {
            try {
              sessionStorage.removeItem("lms_session_token");
              sessionStorage.removeItem("lms_user");
              sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
              localStorage.removeItem(USER_STORAGE_KEY);
              localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
              localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
            } catch {}

            const errData = await res.json().catch(() => ({}));
            const wasRevoked = errData?.code === "SESSION_REVOKED" || errData?.code === "USER_DELETED";

            const currentPath = window.location.pathname;
            const isProtected =
              currentPath !== "/" &&
              !currentPath.startsWith("/login") &&
              !currentPath.startsWith("/register") &&
              !currentPath.startsWith("/forgot-password") &&
              !currentPath.startsWith("/auth") &&
              !currentPath.startsWith("/velorah");

            if (isProtected && wasRevoked) {
              window.location.href = createSecureUrl("/login", {
                mode: "login",
                error: errData?.code || "SESSION_REVOKED",
              });
            }
          }
          return null;
        }
        return null;
      } catch {
        // Network offline or temporary timeout: do not kick user out
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
          sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
        }
        setUserState(null);
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          const isProtected =
            currentPath !== "/" &&
            !currentPath.startsWith("/login") &&
            !currentPath.startsWith("/register") &&
            !currentPath.startsWith("/forgot-password") &&
            !currentPath.startsWith("/auth") &&
            !currentPath.startsWith("/velorah");

          if (isProtected) {
            window.location.href = createSecureUrl("/login", { error: "SESSION_REVOKED" });
          }
        }
        return;
      }

      // If active session exists in localStorage, sync to tab storage
      if (!myToken && activeToken) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("lms_session_token", activeToken);
          const storedAccessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
          if (storedAccessToken) {
            sessionStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, storedAccessToken);
          }
          const storedUser = localStorage.getItem(USER_STORAGE_KEY);
          if (storedUser) {
            sessionStorage.setItem("lms_user", storedUser);
          }
        }
      }

      // If truly no session tokens anywhere and no cached user, clear state
      const hasAnyToken = activeToken || myToken || (typeof window !== "undefined" && localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY));
      const hasCachedUser = typeof window !== "undefined" && (localStorage.getItem(USER_STORAGE_KEY) || sessionStorage.getItem("lms_user"));
      if (!hasAnyToken && !hasCachedUser) {
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
              sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
              setUserState(null);
              if (typeof window !== "undefined") {
                const currentPath = window.location.pathname;
                const isProtected =
                  currentPath !== "/" &&
                  !currentPath.startsWith("/login") &&
                  !currentPath.startsWith("/register") &&
                  !currentPath.startsWith("/forgot-password") &&
                  !currentPath.startsWith("/auth") &&
                  !currentPath.startsWith("/velorah");

                if (isProtected) {
                  window.location.href = createSecureUrl("/login", { error: "SESSION_REVOKED" });
                }
              }
            }
          } else if (data?.type === "LOGOUT") {
            sessionStorage.removeItem("lms_session_token");
            sessionStorage.removeItem("lms_user");
            sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
            setUserState(null);
            if (typeof window !== "undefined") {
              window.location.href = "/";
            }
          }
        };
      }
    } catch {}

    const handleFocusCheck = () => {
      handleAuthChange();
    };

    window.addEventListener("focus", handleFocusCheck);
    document.addEventListener("visibilitychange", handleFocusCheck);
    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("lms:auth-change", handleAuthChange);

    return () => {
      if (channel) {
        try {
          channel.close();
        } catch {}
      }
      window.removeEventListener("focus", handleFocusCheck);
      document.removeEventListener("visibilitychange", handleFocusCheck);
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("lms:auth-change", handleAuthChange);
    };
  }, [fetchUser]);

  const logout = useCallback(async () => {
    isLoggingOutRef.current = true;
    inFlightPromiseRef.current = null;

    let tokenToClear: string | null = null;
    let sessionTokenToClear: string | null = null;
    let currentUserId: string | undefined = user?.id;

    if (typeof window !== "undefined") {
      try {
        tokenToClear =
          sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) ||
          localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) ||
          localStorage.getItem("lms_token");
        sessionTokenToClear =
          sessionStorage.getItem("lms_session_token") ||
          localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);

        sessionStorage.setItem("lms_manual_logout", "true");
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
        localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
        localStorage.removeItem("lms_user_profile");
        localStorage.removeItem("lms_active_session_token");
        localStorage.removeItem("lms_access_token");
        localStorage.removeItem("lms_token");
        localStorage.removeItem("lms_user");
        sessionStorage.removeItem(USER_STORAGE_KEY);
        sessionStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
        sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
        sessionStorage.removeItem("lms_user_profile");
        sessionStorage.removeItem("lms_active_session_token");
        sessionStorage.removeItem("lms_access_token");
        sessionStorage.removeItem("lms_session_token");
        sessionStorage.removeItem("lms_user");

        // Clear cookies client-side if accessible
        document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
        document.cookie = "lms_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";

        if ("BroadcastChannel" in window) {
          const bc = new BroadcastChannel("lms_auth_sync");
          bc.postMessage({ type: "LOGOUT" });
          bc.close();
        }
      } catch {}
    }
    setUserState(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (tokenToClear) {
        headers["Authorization"] = `Bearer ${tokenToClear}`;
      }
      if (sessionTokenToClear) {
        headers["X-Session-Token"] = sessionTokenToClear;
      }
      await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          sessionToken: sessionTokenToClear,
          userId: currentUserId,
        }),
        credentials: "include",
      }).catch(() => {});
    } finally {
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  }, [user]);

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
