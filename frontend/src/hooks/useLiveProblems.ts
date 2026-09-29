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
const CACHE_KEY = "lms_user_cached_problems_v3";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const DEFAULT_PROBLEMS: PublicProblem[] = [
  {
    id: "520d3d43-c421-4a4b-a9ed-db50c924e9db",
    slug: "two-sum",
    title: "Two Sum",
    category: "Arrays",
    topic: "Arrays",
    difficulty: "Easy",
    acceptance: "84.2%",
    submissions: 450,
    testCases: 5,
    status: "Live",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    sampleInput: "nums = [2,7,11,15], target = 9",
    sampleOutput: "[0,1]",
    constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
    hints: [
      "A brute force approach would search all pairs, taking O(N^2) time. Can we do better using a hash table?",
      "Can we iterate through the array once and check if the complement (target - nums[i]) has already been seen?",
      "Store each number's value and index in a hash map as you traverse."
    ],
    starterCode: {
      python: "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # Write your code here\n        pass\n",
      javascript: "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    // Write your code here\n};\n",
      typescript: "function twoSum(nums: number[], target: number): number[] {\n    // Write your code here\n    return [];\n}\n",
      java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n}\n",
      cpp: "#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n        return {};\n    }\n};\n"
    },
    tags: ["Array", "Hash Table", "Two Pointers", "Optimization"],
    companies: "Google, Meta, Amazon, Microsoft, Apple, Bloomberg, Uber",
    examples: [
      { id: "ex-1", input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
      { id: "ex-2", input: "nums = [3,2,4], target = 6", output: "[1,2]", explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]." },
      { id: "ex-3", input: "nums = [3,3], target = 6", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 6, we return [0, 1]." }
    ],
    editorialApproach: "We can solve this in linear time O(N) using a Hash Map.\n1. Create a hash map `seen` to store mapping of `number -> index`.\n2. Iterate through the array `nums` with index `i`.\n3. Compute `complement = target - nums[i]`.\n4. If `complement` exists in `seen`, return `[seen[complement], i]`.\n5. Otherwise, insert `nums[i]: i` into `seen`.\nThis avoids nested loops and runs in a single pass.",
    editorialAlgorithm: "1. Initialize `seen = {}` (empty map).\n2. For `i, num` in enumerate(nums):\n     complement = target - num\n     if complement in seen:\n         return [seen[complement], i]\n     seen[num] = i\n3. Return empty list if no pair found.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(N)",
    testCasesList: [
      { id: "tc-1", input: "nums = [2,7,11,15], target = 9", output: "[0,1]", isHidden: false },
      { id: "tc-2", input: "nums = [3,2,4], target = 6", output: "[1,2]", isHidden: false }
    ],
    referenceSolution: {
      python: "class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        seen = {}\n        for i, num in enumerate(nums):\n            complement = target - num\n            if complement in seen:\n                return [seen[complement], i]\n            seen[num] = i\n        return []",
      javascript: "var twoSum = function(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n};",
      typescript: "function twoSum(nums: number[], target: number): number[] {\n    const map = new Map<number, number>();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement)!, i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}",
      java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        HashMap<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[]{map.get(complement), i};\n            }\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> seen;\n        for (int i = 0; i < nums.size(); i++) {\n            int comp = target - nums[i];\n            if (seen.count(comp)) {\n                return {seen[comp], i};\n            }\n            seen[nums[i]] = i;\n        }\n        return {};\n    }\n};"
    },
    estimatedSolveTime: "15 minutes",
    visibility: "Public"
  },
  {
    id: "prob-valid-parentheses",
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    category: "Stack & Queue",
    topic: "Stack & Queue",
    difficulty: "Easy",
    acceptance: "88.1%",
    submissions: 380,
    testCases: 4,
    status: "Live",
    description: "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.",
    sampleInput: "s = \"()[]{}\"",
    sampleOutput: "true",
    constraints: "1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.",
    hints: [
      "Use a Stack data structure (LIFO - Last In First Out).",
      "When encountering an opening bracket, push it onto the stack.",
      "When encountering a closing bracket, check if the top of the stack matches its opening pair."
    ],
    tags: ["Stack", "String"],
    companies: "Google, Meta, Amazon, Microsoft, Apple, Netflix"
  },
  {
    id: "prob-best-time-to-buy-and-sell-stock",
    slug: "best-time-to-buy-and-sell-stock",
    title: "Best Time to Buy and Sell Stock",
    category: "Arrays",
    topic: "Arrays",
    difficulty: "Easy",
    acceptance: "81.5%",
    submissions: 340,
    testCases: 4,
    status: "Live",
    description: "You are given an array `prices` where `prices[i]` is the price of a given stock on the `i-th` day. Find the maximum profit you can achieve.",
    sampleInput: "prices = [7,1,5,3,6,4]",
    sampleOutput: "5",
    constraints: "1 <= prices.length <= 10^5\n0 <= prices[i] <= 10^4",
    tags: ["Array", "Dynamic Programming", "Two Pointers"],
    companies: "Amazon, Google, Microsoft, Meta, Goldman Sachs"
  },
  {
    id: "prob-binary-search",
    slug: "binary-search",
    title: "Binary Search",
    category: "Binary Search",
    topic: "Binary Search",
    difficulty: "Easy",
    acceptance: "89.4%",
    submissions: 290,
    testCases: 4,
    status: "Live",
    description: "Given a sorted array of integers `nums` and an integer `target`, search `target` in `nums` in O(log n) time.",
    sampleInput: "nums = [-1,0,3,5,9,12], target = 9",
    sampleOutput: "4",
    constraints: "1 <= nums.length <= 10^4\nAll integers in nums are unique.",
    tags: ["Binary Search", "Array"],
    companies: "Google, Microsoft, Amazon, Apple, Meta"
  },
  {
    id: "prob-reverse-linked-list",
    slug: "reverse-linked-list",
    title: "Reverse Linked List",
    category: "Linked Lists",
    topic: "Linked Lists",
    difficulty: "Easy",
    acceptance: "85.7%",
    submissions: 310,
    testCases: 3,
    status: "Live",
    description: "Given the `head` of a singly linked list, reverse the list, and return the reversed list.",
    sampleInput: "head = [1,2,3,4,5]",
    sampleOutput: "[5,4,3,2,1]",
    constraints: "0 <= Number of nodes <= 5000",
    tags: ["Linked List", "Recursion", "Two Pointers"],
    companies: "Amazon, Microsoft, Google, Meta, Apple"
  },
  {
    id: "prob-longest-substring-without-repeating-characters",
    slug: "longest-substring-without-repeating-characters",
    title: "Longest Substring Without Repeating Characters",
    category: "Sliding Window",
    topic: "Sliding Window",
    difficulty: "Medium",
    acceptance: "64.8%",
    submissions: 410,
    testCases: 4,
    status: "Live",
    description: "Given a string `s`, find the length of the longest substring without repeating characters.",
    sampleInput: "s = \"abcabcbb\"",
    sampleOutput: "3",
    constraints: "0 <= s.length <= 5 * 10^4",
    tags: ["Sliding Window", "Hash Table", "String", "Two Pointers"],
    companies: "Amazon, Google, Microsoft, Meta, Bloomberg, Uber"
  },
  {
    id: "prob-maximum-subarray",
    slug: "maximum-subarray",
    title: "Maximum Subarray",
    category: "Dynamic Programming",
    topic: "Dynamic Programming",
    difficulty: "Medium",
    acceptance: "71.2%",
    submissions: 350,
    testCases: 4,
    status: "Live",
    description: "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
    sampleInput: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
    sampleOutput: "6",
    constraints: "1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4",
    tags: ["Array", "Divide and Conquer", "Dynamic Programming"],
    companies: "Amazon, Apple, Microsoft, Google, LinkedIn"
  },
  {
    id: "prob-container-with-most-water",
    slug: "container-with-most-water",
    title: "Container With Most Water",
    category: "Two Pointers",
    topic: "Two Pointers",
    difficulty: "Medium",
    acceptance: "69.5%",
    submissions: 330,
    testCases: 3,
    status: "Live",
    description: "Find two lines that together with the x-axis form a container, such that the container contains the most water.",
    sampleInput: "height = [1,8,6,2,5,4,8,3,7]",
    sampleOutput: "49",
    constraints: "2 <= height.length <= 10^5\n0 <= height[i] <= 10^4",
    tags: ["Array", "Two Pointers", "Greedy"],
    companies: "Amazon, Google, Adobe, Apple, Meta"
  },
  {
    id: "prob-invert-binary-tree",
    slug: "invert-binary-tree",
    title: "Invert Binary Tree",
    category: "Trees",
    topic: "Trees",
    difficulty: "Easy",
    acceptance: "92.0%",
    submissions: 270,
    testCases: 3,
    status: "Live",
    description: "Given the `root` of a binary tree, invert the tree, and return its root.",
    sampleInput: "root = [4,2,7,1,3,6,9]",
    sampleOutput: "[4,7,2,9,6,3,1]",
    constraints: "0 <= Number of nodes <= 100",
    tags: ["Tree", "Depth-First Search", "Breadth-First Search", "Binary Tree"],
    companies: "Google, Amazon, Microsoft, Apple, Twitter / X"
  },
  {
    id: "prob-number-of-islands",
    slug: "number-of-islands",
    title: "Number of Islands",
    category: "Graphs",
    topic: "Graphs",
    difficulty: "Medium",
    acceptance: "62.4%",
    submissions: 390,
    testCases: 3,
    status: "Live",
    description: "Given an `m x n` 2D binary grid `grid` which represents a map of '1's (land) and '0's (water), return the number of islands.",
    sampleInput: "grid = [[\"1\",\"1\",\"0\"],[\"1\",\"1\",\"0\"],[\"0\",\"0\",\"1\"]]",
    sampleOutput: "2",
    constraints: "1 <= m, n <= 300",
    tags: ["Array", "Depth-First Search", "Breadth-First Search", "Union Find", "Matrix"],
    companies: "Amazon, Google, Microsoft, Meta, Bloomberg"
  },
  {
    id: "prob-trapping-rain-water",
    slug: "trapping-rain-water",
    title: "Trapping Rain Water",
    category: "Two Pointers",
    topic: "Two Pointers",
    difficulty: "Hard",
    acceptance: "58.6%",
    submissions: 260,
    testCases: 3,
    status: "Live",
    description: "Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.",
    sampleInput: "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
    sampleOutput: "6",
    constraints: "1 <= height.length <= 2 * 10^4",
    tags: ["Array", "Two Pointers", "Dynamic Programming", "Stack", "Monotonic Stack"],
    companies: "Google, Amazon, Meta, Microsoft, Apple, Goldman Sachs"
  }
];

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
  if (typeof window === "undefined") return DEFAULT_PROBLEMS;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_PROBLEMS;
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
        res = await fetch(`http://localhost:4000/api/v1/admin/practice-problems?t=${Date.now()}`, {
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
            if (Array.isArray(msg.data?.practiceProblems) && msg.data.practiceProblems.length > 0) {
              const mapped = transformProblemList(msg.data.practiceProblems);
              if (isMountedRef.current) {
                setProblems(mapped);
                try {
                  localStorage.setItem(CACHE_KEY, JSON.stringify(mapped));
                } catch {}
              }
            } else if (
              msg.type === "DATA_UPDATE" ||
              msg.type === "INITIAL_DATA" ||
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
            reconnectTimer = setTimeout(connectWs, 3000);
          }
        };
      } catch {}
    };

    connectWs();

    return () => {
      isMountedRef.current = false;
      window.removeEventListener("focus", handleFocus);
      if (socket) {
        socket.close();
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
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
