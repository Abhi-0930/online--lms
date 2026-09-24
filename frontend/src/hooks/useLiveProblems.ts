"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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

export function useLiveProblems() {
  const [problems, setProblems] = useState<PublicProblem[]>([]);
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
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

  const fetchProblems = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/practice-problems`, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && isMountedRef.current) {
          const mapped: PublicProblem[] = data.map((p: any) => ({
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
          setProblems(mapped);
          setError(null);
        }
      } else {
        if (isMountedRef.current) {
          setError("Failed to fetch practice problems");
        }
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err.message || "Network error fetching practice problems");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [solvedIds]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchProblems();

    // Setup WebSocket live sync with backend
    let socket: WebSocket | null = null;
    let reconnectTimer: any = null;

    const connectWs = () => {
      if (!isMountedRef.current) return;
      try {
        const wsUrl = (
          process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000/ws"
        ).replace(/^http/, "ws");
        socket = new WebSocket(wsUrl);

        socket.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (
              msg.type === "PRACTICE_PROBLEM_CREATED" ||
              msg.type === "PRACTICE_PROBLEM_UPDATED" ||
              msg.type === "PRACTICE_PROBLEM_DELETED" ||
              msg.type === "PRACTICE_PROBLEMS_SYNC"
            ) {
              fetchProblems();
            }
          } catch {}
        };

        socket.onclose = () => {
          if (isMountedRef.current) {
            reconnectTimer = setTimeout(connectWs, 5000);
          }
        };
      } catch {}
    };

    connectWs();

    return () => {
      isMountedRef.current = false;
      if (socket) {
        socket.close();
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
    };
  }, [fetchProblems]);

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
