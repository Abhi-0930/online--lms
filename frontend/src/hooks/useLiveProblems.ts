"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { API_BASE_URL, WS_BASE_URL, getAuthHeaders } from "@/lib/apiConfig";
import { sharedWs } from "@/lib/sharedWebSocket";

export interface PublicProblem {
  id: string | number;
  slug?: string;
  title: string;
  category: string;
  topic?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  acceptance: string;
  submissions: number;
  testCases: number;
  status: "Live" | "Draft";
  description?: string;
  sampleInput?: string;
  sampleOutput?: string;
  constraints?: string;
  hints?: string[];
  starterCode?: Record<string, string>;
  tags?: string[];
  companies?: string;
  examples?: Array<{
    id?: number | string;
    input: string;
    output: string;
    explanation?: string;
  }>;
  editorialApproach?: string;
  editorialAlgorithm?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  testCasesList?: Array<{
    id?: number | string;
    input: string;
    output: string;
    isHidden?: boolean;
    explanation?: string;
  }>;
  referenceSolution?: Record<string, string>;
  estimatedSolveTime?: string;
  visibility?: string;
  solved?: boolean;
  attempts?: number;
}

const SOLVED_KEY = "lms_user_solved_problems";
const CACHE_KEY = "lms_user_cached_problems_v4";

export const DEFAULT_PROBLEMS: PublicProblem[] = [];

// Global memory cache to prevent duplicate fetches across simultaneously mounted components
let memoryCachedProblems: PublicProblem[] = [];

function parseArray(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function parseObject(val: any): Record<string, string> {
  if (!val) return {};
  if (typeof val === "object" && !Array.isArray(val)) return val;
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return {};
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return {};
}

function transformProblemItem(p: any): PublicProblem {
  return {
    ...p,
    id: String(p.id),
    title: p.title || "Untitled Problem",
    category: p.category || p.topic || "General",
    topic: p.topic || p.category || "General",
    difficulty: p.difficulty || "Medium",
    acceptance: p.acceptance || "75%",
    submissions: typeof p.submissions === "number" ? p.submissions : 0,
    testCases: typeof p.testCases === "number" ? p.testCases : 2,
    status: p.status === "Draft" || p.status === "DRAFT" ? "Draft" : "Live",
    tags: parseArray(p.tags),
    companies:
      typeof p.companies === "string"
        ? p.companies
        : Array.isArray(p.companies)
        ? p.companies.join(", ")
        : "",
    examples: parseArray(p.examples),
    hints: parseArray(p.hints),
    starterCode: parseObject(p.starterCode),
    referenceSolution: parseObject(p.referenceSolution),
    testCasesList: parseArray(p.testCasesList),
    description: p.description || "",
    sampleInput: p.sampleInput || "",
    sampleOutput: p.sampleOutput || "",
    constraints: p.constraints || "",
    editorialApproach: p.editorialApproach || "",
    editorialAlgorithm: p.editorialAlgorithm || "",
    timeComplexity: p.timeComplexity || "",
    spaceComplexity: p.spaceComplexity || "",
    estimatedSolveTime: p.estimatedSolveTime || "15 minutes",
    visibility: p.visibility || "Public",
  };
}

function readCachedProblems(): PublicProblem[] {
  if (memoryCachedProblems.length > 0) {
    return memoryCachedProblems;
  }
  if (typeof window === "undefined") return [];
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryCachedProblems = parsed.map(transformProblemItem);
        return memoryCachedProblems;
      }
    }
  } catch {}
  return [];
}

export function useLiveProblems() {
  const [rawProblems, setRawProblems] = useState<PublicProblem[]>(() => readCachedProblems());
  const [solvedIds, setSolvedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(SOLVED_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => readCachedProblems().length === 0);
  const [error, setError] = useState<string | null>(null);

  const fetchProblems = useCallback(async () => {
    try {
      if (memoryCachedProblems.length === 0) {
        setIsLoading(true);
      }

      const headers = getAuthHeaders();
      let res: Response | null = null;

      try {
        res = await fetch(`${API_BASE_URL}/api/v1/practice-problems?t=${Date.now()}`, {
          cache: "no-store",
          headers,
          credentials: "include",
        });
      } catch {}

      if (!res || !res.ok) {
        try {
          res = await fetch(`${API_BASE_URL}/api/v1/practice?t=${Date.now()}`, {
            cache: "no-store",
            headers,
            credentials: "include",
          });
        } catch {}
      }

      if (!res || !res.ok) {
        try {
          res = await fetch(`${API_BASE_URL}/api/v1/admin/practice-problems?t=${Date.now()}`, {
            cache: "no-store",
            headers,
            credentials: "include",
          });
        } catch {}
      }

      if (res && res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : data.problems || [];
        const mapped = rawList.map(transformProblemItem);
        memoryCachedProblems = mapped;
        setRawProblems(mapped);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(mapped));
        } catch {}
        setError(null);
      }
    } catch (err: any) {
      const fallback = readCachedProblems();
      if (fallback.length > 0) {
        setRawProblems(fallback);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProblems();

    // Auto-refresh when window/tab gains focus
    const handleFocus = () => {
      fetchProblems();
    };
    window.addEventListener("focus", handleFocus);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchProblems();
      }
    };
    window.addEventListener("visibilitychange", handleVisibility);

    // Setup WebSocket live sync with backend
    const unsubscribe = sharedWs.subscribe((msg) => {
      if (Array.isArray(msg?.data?.practiceProblems) && msg.data.practiceProblems.length > 0) {
        const mapped = msg.data.practiceProblems.map(transformProblemItem);
        memoryCachedProblems = mapped;
        setRawProblems(mapped);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(mapped));
        } catch {}
      } else if (
        msg?.type === "DATA_UPDATE" ||
        msg?.type === "INITIAL_DATA" ||
        msg?.type === "PRACTICE_PROBLEM_CREATED" ||
        msg?.type === "PRACTICE_PROBLEM_UPDATED" ||
        msg?.type === "PRACTICE_PROBLEM_DELETED" ||
        msg?.type === "PRACTICE_PROBLEMS_SYNC"
      ) {
        fetchProblems();
      }
    });

    const handleCustomUpdate = () => {
      setRawProblems([...memoryCachedProblems]);
    };
    window.addEventListener("lms:practice-problems-updated", handleCustomUpdate);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("lms:practice-problems-updated", handleCustomUpdate);
      unsubscribe();
    };
  }, [fetchProblems]);

  const problems = useMemo<PublicProblem[]>(() => {
    return rawProblems.map((p) => ({
      ...p,
      solved:
        solvedIds.includes(String(p.id)) ||
        (p.slug ? solvedIds.includes(p.slug) : false),
      attempts:
        typeof p.attempts === "number"
          ? p.attempts
          : Math.floor((p.submissions || 0) / 15),
    }));
  }, [rawProblems, solvedIds]);

  const markProblemSolved = (idOrSlug: string) => {
    setSolvedIds((prev) => {
      const updated = prev.includes(idOrSlug) ? prev : [...prev, idOrSlug];
      try {
        localStorage.setItem(SOLVED_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const todayStr = `${year}-${month}-${day}`;
      const rawActivity = localStorage.getItem("lms_user_real_activity_v2");
      const actMap = rawActivity ? JSON.parse(rawActivity) : {};
      const existing = actMap[todayStr] || {
        date: todayStr,
        activeMinutes: 0,
        problemsSolved: 0,
        lessonsCompleted: 0,
        assignmentsSubmitted: 0,
      };
      actMap[todayStr] = {
        ...existing,
        activeMinutes: existing.activeMinutes + 15,
        problemsSolved: existing.problemsSolved + 1,
      };
      localStorage.setItem("lms_user_real_activity_v2", JSON.stringify(actMap));
      window.dispatchEvent(new CustomEvent("lms:activity-updated"));
    } catch {}
  };

  return {
    problems,
    solvedIds,
    isLoading,
    error,
    refresh: fetchProblems,
    markProblemSolved,
  };
}
