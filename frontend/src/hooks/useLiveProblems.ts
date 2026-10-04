"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { API_BASE_URL, WS_BASE_URL } from "@/lib/apiConfig";
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
const CACHE_KEY = "lms_user_cached_problems_v3";

export const DEFAULT_PROBLEMS: PublicProblem[] = [];

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

function readCachedProblems(): PublicProblem[] {
  if (typeof window === "undefined") return [];
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [];
}

export function useLiveProblems() {
  const [problems, setProblems] = useState<PublicProblem[]>(() => readCachedProblems());
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Load user solve history
  useEffect(() => {
    try {
      const solved = localStorage.getItem(SOLVED_KEY);
      if (solved) {
        setSolvedIds(JSON.parse(solved));
      }
    } catch {}
  }, []);

  const transformProblemList = useCallback((data: any[]): PublicProblem[] => {
    return data.map((p: any) => ({
      ...p,
      id: String(p.id),
      topic: p.category || p.topic || "General",
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
      solved:
        solvedIds.includes(String(p.id)) ||
        (p.slug && solvedIds.includes(p.slug)),
      attempts:
        typeof p.attempts === "number"
          ? p.attempts
          : Math.floor((p.submissions || 0) / 15),
    }));
  }, [solvedIds]);

  const fetchProblems = useCallback(async () => {
    try {
      let res = await fetch(`${API_BASE_URL}/api/v1/practice-problems?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });

      if (!res.ok) {
        res = await fetch(`${API_BASE_URL}/api/v1/admin/practice-problems?t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
        });
      }

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0 && isMountedRef.current) {
          const mapped = transformProblemList(data);
          setProblems(mapped);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(mapped));
          } catch {}
          setError(null);
        }
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        // Fallback to cache or defaults
        const fallback = readCachedProblems();
        if (fallback.length > 0) {
          setProblems(fallback);
        }
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [transformProblemList]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchProblems();

    // Auto-refresh when tab gains focus
    const handleFocus = () => {
      fetchProblems();
    };
    window.addEventListener("focus", handleFocus);
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        fetchProblems();
      }
    });

    // Setup WebSocket live sync with backend
    const unsubscribe = sharedWs.subscribe((msg) => {
      if (Array.isArray(msg?.data?.practiceProblems) && msg.data.practiceProblems.length > 0) {
        const mapped = transformProblemList(msg.data.practiceProblems);
        if (isMountedRef.current) {
          setProblems(mapped);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(mapped));
          } catch {}
        }
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

    return () => {
      isMountedRef.current = false;
      window.removeEventListener("focus", handleFocus);
      unsubscribe();
    };
  }, [fetchProblems, transformProblemList]);

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

    setProblems((prev) =>
      prev.map((p) =>
        String(p.id) === idOrSlug || p.slug === idOrSlug
          ? { ...p, solved: true }
          : p
      )
    );
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
