import { useEffect, useState, useCallback } from "react";

export interface NavigationState {
  tab: string;
  subtab?: string;
  action?: string;
  id?: string;
  step?: string | number;
  [key: string]: any;
}

/**
 * Reads all query parameters from window.location.search
 * Supports fallback/automatic conversion from legacy hashes
 */
export function getAdminQueryParams(): NavigationState {
  if (typeof window === "undefined") {
    return { tab: "overview" };
  }

  const hash = window.location.hash.replace("#", "").trim();
  const searchParams = new URLSearchParams(window.location.search);
  const path = window.location.pathname.replace(/^\/+|\/+$/g, "").trim();

  let tab = searchParams.get("tab") || searchParams.get("section") || searchParams.get("page");
  let subtab = searchParams.get("subtab");

  if (!tab) {
    if (path && path !== "login" && path !== "404" && !path.startsWith("api/")) {
      tab = path;
    } else if (hash) {
      if (
        hash === "security" ||
        hash === "branding" ||
        hash === "notifications" ||
        hash === "certificates" ||
        hash === "general" ||
        hash === "payments_settings"
      ) {
        tab = "settings";
        subtab = hash === "payments_settings" ? "payments" : hash;
      } else {
        tab = hash;
      }
    }
  }

  if (!tab) {
    tab = "overview";
  }

  const result: NavigationState = {
    tab: tab.toLowerCase(),
    subtab: subtab ? subtab.toLowerCase() : undefined,
    action: searchParams.get("action") || undefined,
    id: searchParams.get("id") || undefined,
    step: searchParams.get("step") || undefined,
  };

  searchParams.forEach((val, key) => {
    if (!(key in result)) {
      result[key] = val;
    }
  });

  return result;
}

/**
 * Navigate to a tab and optional query parameters without page reload
 */
export function navigateAdmin(
  target: string | Partial<NavigationState>,
  options: { replace?: boolean; keepParams?: boolean } = {}
) {
  if (typeof window === "undefined") return;

  const currentParams = new URLSearchParams(options.keepParams ? window.location.search : "");

  if (typeof target === "string") {
    if (target.includes("?")) {
      const [tabPart, queryPart] = target.split("?");
      currentParams.set("tab", tabPart);
      const parsed = new URLSearchParams(queryPart);
      parsed.forEach((v, k) => currentParams.set(k, v));
    } else {
      currentParams.set("tab", target);
    }
  } else {
    if (target.tab) currentParams.set("tab", target.tab);
    if (target.subtab) currentParams.set("subtab", target.subtab);
    else if (!options.keepParams) currentParams.delete("subtab");

    Object.entries(target).forEach(([key, val]) => {
      if (key !== "tab" && key !== "subtab") {
        if (val === undefined || val === null || val === "") {
          currentParams.delete(key);
        } else {
          currentParams.set(key, String(val));
        }
      }
    });
  }

  const newUrl = `${window.location.pathname}?${currentParams.toString()}`;

  if (options.replace) {
    window.history.replaceState(null, "", newUrl);
  } else {
    window.history.pushState(null, "", newUrl);
  }

  window.dispatchEvent(new Event("popstate"));
  window.dispatchEvent(new CustomEvent("admin-navigation", { detail: getAdminQueryParams() }));
}

/**
 * React Hook for reactive query-parameter routing across the LMS Admin Panel
 */
export function useAdminRoute() {
  const [navState, setNavState] = useState<NavigationState>(getAdminQueryParams);

  useEffect(() => {
    const handleUpdate = () => {
      setNavState(getAdminQueryParams());
    };

    window.addEventListener("popstate", handleUpdate);
    window.addEventListener("admin-navigation", handleUpdate);
    window.addEventListener("hashchange", handleUpdate);

    // If a legacy hash URL was accessed, migrate it to query param
    if (window.location.hash) {
      const hash = window.location.hash.replace("#", "").trim();
      if (hash) {
        navigateAdmin(hash, { replace: true });
      }
    }

    return () => {
      window.removeEventListener("popstate", handleUpdate);
      window.removeEventListener("admin-navigation", handleUpdate);
      window.removeEventListener("hashchange", handleUpdate);
    };
  }, []);

  const navigate = useCallback(
    (target: string | Partial<NavigationState>, options?: { replace?: boolean; keepParams?: boolean }) => {
      navigateAdmin(target, options);
    },
    []
  );

  const setQueryParam = useCallback((key: string, value: any) => {
    navigateAdmin({ [key]: value }, { keepParams: true });
  }, []);

  return {
    ...navState,
    tab: navState.tab || "overview",
    subtab: navState.subtab,
    navigate,
    setQueryParam,
    queryParams: navState,
  };
}
