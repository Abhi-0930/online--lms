import { useState, useEffect, useCallback } from "react";

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

const DEFAULT_PROBLEMS: PublicProblem[] = [
  {
    id: "prob-1",
    slug: "two-sum",
    title: "Two Sum & Hash Map Optimizations",
    category: "Arrays",
    topic: "Arrays",
    difficulty: "Easy",
    acceptance: "84.2%",
    submissions: 2420,
    testCases: 15,
    status: "Live",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    solved: false,
    attempts: 0,
  },
  {
    id: "prob-2",
    slug: "valid-parentheses",
    title: "Valid Parentheses & Stack Matching",
    category: "Stack",
    topic: "Stack",
    difficulty: "Easy",
    acceptance: "89.5%",
    submissions: 3120,
    testCases: 12,
    status: "Live",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    solved: false,
    attempts: 0,
  },
  {
    id: "prob-3",
    slug: "longest-substring-without-repeating-characters",
    title: "Longest Substring Without Repeating Characters",
    category: "Sliding Window",
    topic: "Sliding Window",
    difficulty: "Medium",
    acceptance: "62.8%",
    submissions: 1890,
    testCases: 24,
    status: "Live",
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    solved: false,
    attempts: 0,
  },
  {
    id: "prob-4",
    slug: "merge-intervals",
    title: "Merge Intervals",
    category: "Arrays",
    topic: "Arrays",
    difficulty: "Medium",
    acceptance: "58.4%",
    submissions: 1450,
    testCases: 18,
    status: "Live",
    description: "Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals.",
    solved: false,
    attempts: 0,
  },
  {
    id: "prob-5",
    slug: "trapping-rain-water",
    title: "Trapping Rain Water",
    category: "Two Pointers",
    topic: "Two Pointers",
    difficulty: "Hard",
    acceptance: "48.1%",
    submissions: 1140,
    testCases: 32,
    status: "Live",
    description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    solved: false,
    attempts: 0,
  },
  {
    id: "prob-6",
    slug: "lowest-common-ancestor-in-binary-tree",
    title: "Lowest Common Ancestor in Binary Tree",
    category: "Trees",
    topic: "Trees",
    difficulty: "Medium",
    acceptance: "71.4%",
    submissions: 1560,
    testCases: 20,
    status: "Live",
    description: "Given a binary tree, find the lowest common ancestor (LCA) of two given nodes in the tree.",
    solved: false,
    attempts: 0,
  },
];

const CACHE_KEY = "lms_user_cache_practice_problems";
const SOLVED_KEY = "lms_user_solved_problems";

export function useLiveProblems() {
  const [problems, setProblems] = useState<PublicProblem[]>(() => {
    if (typeof window === "undefined") return DEFAULT_PROBLEMS;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {}
    return DEFAULT_PROBLEMS;
  });

  const [solvedIds, setSolvedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const solved = localStorage.getItem(SOLVED_KEY);
      if (solved) return JSON.parse(solved);
    } catch {}
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);

  const fetchProblems = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/v1/practice-problems");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped: PublicProblem[] = data.map((p: any) => ({
            ...p,
            topic: p.category || p.topic || "General",
            solved: solvedIds.includes(String(p.id)) || solvedIds.includes(p.slug || ""),
            attempts: typeof p.attempts === "number" ? p.attempts : Math.floor((p.submissions || 100) / 15),
          }));
          setProblems(mapped);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(mapped));
          } catch {}
        }
      }
    } catch {
      // Offline fallback
    } finally {
      setIsLoading(false);
    }
  }, [solvedIds]);

  useEffect(() => {
    fetchProblems();
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
        String(p.id) === idOrSlug || p.slug === idOrSlug ? { ...p, solved: true } : p
      )
    );
  };

  return {
    problems,
    solvedIds,
    isLoading,
    refresh: fetchProblems,
    markProblemSolved,
  };
}
