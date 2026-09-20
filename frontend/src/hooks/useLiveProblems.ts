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
  solved?: boolean;
  attempts?: number;
}

const SOLVED_KEY = "lms_user_solved_problems";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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
