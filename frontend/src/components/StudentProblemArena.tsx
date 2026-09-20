"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Code2,
  CheckCircle2,
  FileText,
  Sparkles,
  Share2,
  Bookmark,
  Copy,
  Check,
  Play,
  Send,
  MessageSquare,
  Flame,
  ThumbsUp,
  Cpu,
  Clock,
  ExternalLink,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Terminal,
  User,
  Hash,
  Award,
  CircleCheck,
  XCircle,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import { PublicProblem, useLiveProblems } from "@/hooks/useLiveProblems";
import { toast } from "sonner";

const LANGUAGE_OPTIONS: { id: "python" | "javascript" | "typescript" | "java" | "cpp"; label: string }[] = [
  { id: "python", label: "Python 3" },
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
];

function LanguageCustomDropdown({
  value,
  onChange,
}: {
  value: "python" | "javascript" | "typescript" | "java" | "cpp";
  onChange: (val: "python" | "javascript" | "typescript" | "java" | "cpp") => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeOption =
    LANGUAGE_OPTIONS.find((opt) => opt.id === value) || LANGUAGE_OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/70 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 transition focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-xs"
      >
        <span>{activeOption.label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-150 ${
            isOpen ? "rotate-180 text-indigo-500" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-36 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 py-1 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100">
          {LANGUAGE_OPTIONS.map((opt) => {
            const isSelected = opt.id === value;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs transition cursor-pointer text-left ${
                  isSelected
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface StudentProblemArenaProps {
  problem: PublicProblem;
  onBack: () => void;
  onSelectProblem?: (slugOrId: string) => void;
}

export default function StudentProblemArena({
  problem,
  onBack,
  onSelectProblem,
}: StudentProblemArenaProps) {
  const { problems, markProblemSolved } = useLiveProblems();

  // Navigation index
  const currentIndex = problems.findIndex(
    (p) => String(p.id) === String(problem.id) || p.slug === problem.slug
  );
  const prevProblem = currentIndex > 0 ? problems[currentIndex - 1] : null;
  const nextProblem =
    currentIndex >= 0 && currentIndex < problems.length - 1
      ? problems[currentIndex + 1]
      : null;

  // Active Left Pane Tab
  const [activeTab, setActiveTab] = useState<
    "description" | "editorial" | "solutions" | "submissions" | "discussion"
  >("description");

  // Selected programming language
  const [language, setLanguage] = useState<
    "python" | "javascript" | "typescript" | "java" | "cpp"
  >("python");

  // Code state
  const [code, setCode] = useState<string>("");
  const [showHints, setShowHints] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // User submissions history (persisted in localStorage)
  const [mySubmissions, setMySubmissions] = useState<
    Array<{
      id: string;
      status: "Accepted" | "Wrong Answer";
      runtime: string;
      memory: string;
      language: string;
      timestamp: string;
      codeSnippet: string;
    }>
  >([]);

  // Community discussions
  const [discussions, setDiscussions] = useState<
    Array<{
      id: string;
      title: string;
      author: string;
      avatar: string;
      votes: number;
      replies: number;
      timestamp: string;
      content: string;
      isLiked?: boolean;
    }>
  >([
    {
      id: "disc-1",
      title: "Why One-Pass Hash Map is asymptotically optimal",
      author: "Arjun Mehta",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=60",
      votes: 42,
      replies: 7,
      timestamp: "3 hours ago",
      content:
        "Instead of nested iteration O(n^2), we trade linear auxiliary memory to achieve O(1) lookup on each complement. This gives O(n) total time with a single scan.",
    },
    {
      id: "disc-2",
      title: "Can we solve this in O(1) space if the array is already sorted?",
      author: "Priya Sharma",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=60",
      votes: 28,
      replies: 4,
      timestamp: "1 day ago",
      content:
        "Yes! If the array were sorted, we could use the classic Two Pointer technique (left=0, right=n-1) to find the target sum in O(n) time and O(1) space without a hash map.",
    },
    {
      id: "disc-3",
      title: "Watch out for using the same element twice!",
      author: "Devendra Rao",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&auto=format&fit=crop&q=60",
      votes: 19,
      replies: 2,
      timestamp: "2 days ago",
      content:
        "Make sure to check if `complement in seen` before assigning `seen[num] = i`, or verify that `seen[complement] != i`. Otherwise target=6 with num=3 could return [0, 0].",
    },
  ]);

  const [newDiscussionTitle, setNewDiscussionTitle] = useState("");
  const [newDiscussionBody, setNewDiscussionBody] = useState("");
  const [isPostingDiscussion, setIsPostingDiscussion] = useState(false);

  // Other people's community solutions
  const communitySolutions = useMemo(
    () => [
      {
        id: "sol-1",
        title: "Python 3: Ultra Clean 1-Pass Hash Map (Beats 99.2% Speed)",
        author: "Sarah Chen",
        authorRole: "Software Engineer @ Google",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=60",
        language: "Python",
        votes: 184,
        views: 2400,
        complexity: "Time: O(N) | Space: O(N)",
        tags: ["Hash Table", "One Pass", "Optimal"],
        code: `class Solution:
    def solve(self, nums: list[int], target: int) -> list[int]:
        lookup = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in lookup:
                return [lookup[diff], i]
            lookup[num] = i
        return []`,
        explanation:
          "Maintains a single hash dictionary mapping each element to its zero-based index. For each number, we look up its complement (target - num) in O(1) amortized time.",
      },
      {
        id: "sol-2",
        title: "C++ 20: Fast unordered_map with reserve() for 0ms runtime",
        author: "Vikram Malhotra",
        authorRole: "Competitive Programmer (2200+)",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=60",
        language: "C++",
        votes: 95,
        views: 1350,
        complexity: "Time: O(N) | Space: O(N)",
        tags: ["C++", "Hash Table", "Performance"],
        code: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> solve(vector<int>& nums, int target) {
        unordered_map<int, int> mp;
        mp.reserve(nums.size());
        for (int i = 0; i < (int)nums.size(); ++i) {
            int comp = target - nums[i];
            auto it = mp.find(comp);
            if (it != mp.end()) {
                return {it->second, i};
            }
            mp[nums[i]] = i;
        }
        return {};
    }
};`,
        explanation:
          "Using `mp.reserve()` avoids hash map rehashing overhead during large arrays, guaranteeing steady O(1) insertions.",
      },
      {
        id: "sol-3",
        title: "JavaScript / TypeScript Map Solution with strict typing",
        author: "Alex Rivera",
        authorRole: "Frontend Architect",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=60",
        language: "TypeScript",
        votes: 62,
        views: 890,
        complexity: "Time: O(N) | Space: O(N)",
        tags: ["TypeScript", "Map", "Clean Code"],
        code: `function solve(nums: number[], target: number): number[] {
    const map = new Map<number, number>();
    for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) {
            return [map.get(comp)!, i];
        }
        map.set(nums[i], i);
    }
    return [];
}`,
        explanation:
          "JavaScript `Map` provides predictable insertion order and performance over regular plain objects with numeric keys.",
      },
    ],
    []
  );

  // Default optimal codes per language
  const defaultCodes: Record<string, string> = useMemo(
    () => ({
      python:
        problem.starterCode?.python ||
        `class Solution:
    def solve(self, nums: list[int], target: int) -> list[int]:
        # Hash map to record seen numbers and their indices
        lookup = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in lookup:
                return [lookup[diff], i]
            lookup[num] = i
        return []
`,
      javascript:
        problem.starterCode?.javascript ||
        `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function solve(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (map.has(diff)) {
            return [map.get(diff), i];
        }
        map.set(nums[i], i);
    }
    return [];
}
`,
      typescript:
        problem.starterCode?.typescript ||
        `function solve(nums: number[], target: number): number[] {
    const map = new Map<number, number>();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (map.has(diff)) {
            return [map.get(diff)!, i];
        }
        map.set(nums[i], i);
    }
    return [];
}
`,
      java:
        problem.starterCode?.java ||
        `import java.util.HashMap;
import java.util.Map;

class Solution {
    public int[] solve(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}
`,
      cpp:
        problem.starterCode?.cpp ||
        `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> solve(vector<int>& nums, int target) {
        unordered_map<int, int> lookup;
        for (int i = 0; i < (int)nums.size(); i++) {
            int complement = target - nums[i];
            if (lookup.count(complement)) {
                return {lookup[complement], i};
            }
            lookup[nums[i]] = i;
        }
        return {};
    }
};
`,
    }),
    [problem.starterCode]
  );

  // Initialize and switch code when language or problem changes
  useEffect(() => {
    setCode(defaultCodes[language] || defaultCodes.python);
  }, [language, defaultCodes]);

  // Load user submissions from localStorage
  useEffect(() => {
    try {
      const storageKey = `lms_submissions_${problem.id || problem.slug}`;
      const savedSubs = localStorage.getItem(storageKey);
      if (savedSubs) {
        setMySubmissions(JSON.parse(savedSubs));
      } else if (problem.solved) {
        setMySubmissions([
          {
            id: "sub-init-1",
            status: "Accepted",
            runtime: "38 ms",
            memory: "16.8 MB",
            language: "Python",
            timestamp: "Earlier today",
            codeSnippet: defaultCodes.python,
          },
        ]);
      }
    } catch {}
  }, [problem.id, problem.slug, problem.solved, defaultCodes.python]);

  // Examples parser
  const exampleCases = useMemo(() => {
    return [
      {
        id: 1,
        input: problem.sampleInput || "nums = [2, 7, 11, 15], target = 9",
        output: problem.sampleOutput || "[0, 1]",
        explanation: "nums[0] + nums[1] == 2 + 7 == 9, so return [0, 1].",
      },
      {
        id: 2,
        input: "nums = [3, 2, 4], target = 6",
        output: "[1, 2]",
        explanation: "nums[1] + nums[2] == 2 + 4 == 6, so return [1, 2].",
      },
      {
        id: 3,
        input: "nums = [3, 3], target = 6",
        output: "[0, 1]",
        explanation: "Both elements add up to target.",
      },
    ];
  }, [problem.sampleInput, problem.sampleOutput]);

  // Constraints list
  const constraintsList = useMemo(() => {
    if (problem.constraints) {
      return problem.constraints
        .split("\n")
        .map((c) => c.trim())
        .filter(Boolean);
    }
    return [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ];
  }, [problem.constraints]);

  // Hints
  const hintsList = useMemo(() => {
    if (problem.hints && problem.hints.length > 0) {
      return problem.hints;
    }
    return [
      "A really brute force way would be to search for all possible pairs of numbers but that would be slow O(n^2).",
      "Can we use extra space with a hash table to look up if (target - num) exists in O(1)?",
      "As you iterate through the list, insert each element into the hash table while checking if its complement was already registered.",
    ];
  }, [problem.hints]);

  // Handle Submit Code
  const handleSubmitCode = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const runtime = `${Math.floor(Math.random() * 25) + 28} ms`;
      const memory = `${(Math.random() * 2 + 15.2).toFixed(1)} MB`;

      // Mark solved in global live state
      markProblemSolved(String(problem.id));
      if (problem.slug) markProblemSolved(problem.slug);

      // Add to submission history
      const newSubmission = {
        id: `sub-${Date.now()}`,
        status: "Accepted" as const,
        runtime: `${runtime} (Beats 96.4%)`,
        memory: `${memory} (Beats 91.8%)`,
        language: language.toUpperCase(),
        timestamp: "Just now",
        codeSnippet: code,
      };

      const updatedSubs = [newSubmission, ...mySubmissions];
      setMySubmissions(updatedSubs);
      try {
        localStorage.setItem(
          `lms_submissions_${problem.id || problem.slug}`,
          JSON.stringify(updatedSubs)
        );
      } catch {}

      toast.success("Solution submitted successfully!", {
        description: `Verdict: Accepted | Runtime: ${runtime}`,
      });
    }, 600);
  };

  // Handle Post Discussion
  const handlePostDiscussion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscussionTitle.trim()) return;

    const newDisc = {
      id: `disc-${Date.now()}`,
      title: newDiscussionTitle,
      author: "You (Student)",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=60",
      votes: 1,
      replies: 0,
      timestamp: "Just now",
      content: newDiscussionBody || "Looking for feedback and alternative approaches!",
    };

    setDiscussions([newDisc, ...discussions]);
    setNewDiscussionTitle("");
    setNewDiscussionBody("");
    setIsPostingDiscussion(false);
    toast.success("Discussion posted to the community!");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.info("Code copied to clipboard");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f7fb] dark:bg-[#0b0e17] text-slate-900 dark:text-slate-100 selection:bg-[#3157e8] selection:text-white">


      {/* 1. TOP LEETCODE-STYLE NAVBAR */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-[#131826]/95 backdrop-blur-md px-4 sm:px-6 shadow-2xs">
        {/* Left: Back & Problem Switcher */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Back to Practice Problems</span>
            <span className="sm:hidden">Back</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-white/10" />

          {/* Prev / Next buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={!prevProblem}
              onClick={() => {
                if (prevProblem && onSelectProblem) {
                  onSelectProblem(prevProblem.slug || String(prevProblem.id));
                }
              }}
              title={prevProblem ? `Prev: ${prevProblem.title}` : "No previous problem"}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={!nextProblem}
              onClick={() => {
                if (nextProblem && onSelectProblem) {
                  onSelectProblem(nextProblem.slug || String(nextProblem.id));
                }
              }}
              title={nextProblem ? `Next: ${nextProblem.title}` : "No next problem"}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Current Title & Badges */}
          <div className="flex items-center gap-2 pl-1">
            <span className="font-display text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate max-w-[160px] sm:max-w-[240px] md:max-w-md">
              {problem.title}
            </span>
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                problem.difficulty === "Easy"
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                  : problem.difficulty === "Medium"
                  ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                  : "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
              }`}
            >
              {problem.difficulty}
            </span>
            <span className="hidden md:inline-flex rounded-md bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
              {problem.topic || problem.category}
            </span>
            {problem.solved && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                <Check className="h-3 w-3" />
                <span>Solved</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: Quick Actions (Bookmark) */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setIsBookmarked(!isBookmarked);
              toast.info(isBookmarked ? "Removed from bookmarks" : "Problem saved to bookmarks!");
            }}
            className={`p-2 rounded-xl border border-slate-200 dark:border-white/10 transition cursor-pointer ${
              isBookmarked
                ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10"
            }`}
            title="Bookmark problem"
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
          </button>
        </div>
      </header>

      {/* 2. MAIN 2-COLUMN SPLIT ARENA */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-3 sm:p-4 max-w-[1720px] w-full mx-auto items-stretch">
        {/* ================= LEFT COLUMN: PROBLEM INFO & COMMUNITY (6 or 7 cols) ================= */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121622] shadow-xs overflow-hidden">
          {/* Tabs Navigation Header */}
          <div className="flex items-center gap-1 border-b border-slate-100 dark:border-white/5 px-4 pt-2.5 bg-slate-50/50 dark:bg-white/[0.01] overflow-x-auto custom-scrollbar">
            {[
              { id: "description", label: "Description", icon: FileText },
              { id: "editorial", label: "Editorial", icon: BookOpen },
              { id: "solutions", label: "Solutions", icon: Code2, badge: "3" },
              { id: "submissions", label: "Submissions", icon: CheckCircle2, badge: mySubmissions.length ? String(mySubmissions.length) : undefined },
              { id: "discussion", label: "Discussion", icon: MessageSquare, badge: String(discussions.length) },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "text-[#3157e8] dark:text-[#5d7bff]"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive
                          ? "bg-[#3157e8]/10 text-[#3157e8] dark:bg-[#5d7bff]/20 dark:text-[#5d7bff]"
                          : "bg-slate-200/70 text-slate-600 dark:bg-white/10 dark:text-slate-400"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3157e8] dark:bg-[#5d7bff] rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Left Pane Scrollable Content */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto custom-scrollbar space-y-6">
            {/* ================= TAB 1: DESCRIPTION ================= */}
            {activeTab === "description" && (
              <div className="space-y-6">
                {/* Title & Metadata Pills */}
                <div className="space-y-3">
                  <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {problem.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Difficulty Pill */}
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        problem.difficulty === "Easy"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                          : problem.difficulty === "Medium"
                          ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                          : "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
                      }`}
                    >
                      {problem.difficulty}
                    </span>

                    {/* Topic */}
                    <span className="rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                      {problem.topic || problem.category}
                    </span>

                    {/* Acceptance */}
                    <span className="text-[11px] font-semibold text-slate-400">
                      Acceptance: <span className="text-slate-700 dark:text-slate-300 font-bold">{problem.acceptance || "84.2%"}</span>
                    </span>

                    {/* Solved status */}
                    {problem.solved && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold px-2 py-0.5">
                        <Check className="h-3 w-3" /> Solved
                      </span>
                    )}
                  </div>
                </div>

                {/* Problem Statement Text */}
                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-3 font-sans">
                  <p className="whitespace-pre-line">
                    {problem.description ||
                      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order."}
                  </p>
                </div>

                {/* Examples */}
                <div className="space-y-4">
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                    Examples
                  </h3>
                  <div className="space-y-3">
                    {exampleCases.map((ex, idx) => (
                      <div
                        key={ex.id || idx}
                        className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] p-4 space-y-2 text-xs"
                      >
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          Example {idx + 1}:
                        </p>
                        <div className="space-y-1 font-mono text-[11px]">
                          <div>
                            <span className="font-bold text-slate-500 font-sans mr-2">Input:</span>
                            <span className="text-slate-900 dark:text-slate-100">{ex.input}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-500 font-sans mr-2">Output:</span>
                            <span className="text-slate-900 dark:text-slate-100 font-bold">{ex.output}</span>
                          </div>
                          {ex.explanation && (
                            <div className="pt-1 font-sans text-slate-500 dark:text-slate-400">
                              <span className="font-bold text-slate-600 dark:text-slate-300 mr-2">Explanation:</span>
                              <span>{ex.explanation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Constraints Box */}
                <div className="space-y-2">
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                    Constraints
                  </h3>
                  <div className="rounded-xl border border-indigo-100 dark:border-indigo-950/80 bg-indigo-50/30 dark:bg-indigo-950/20 p-4 space-y-1.5">
                    <ul className="space-y-1 text-xs font-mono text-slate-700 dark:text-slate-300">
                      {constraintsList.map((c, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Hints Accordion */}
                <div className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Hints
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {hintsList.length} hints available to help you think through edge cases
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowHints(!showHints)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#3157e8] dark:text-[#5d7bff] hover:underline cursor-pointer"
                    >
                      <span>{showHints ? "Hide Hints" : "Reveal Hints"}</span>
                      {showHints ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {showHints && (
                    <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-white/5 animate-in fade-in">
                      {hintsList.map((hint, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 rounded-lg bg-white dark:bg-white/5 p-3 border border-slate-200/60 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300"
                        >
                          <span className="font-bold text-[#3157e8] dark:text-[#5d7bff] shrink-0">
                            Hint {idx + 1}:
                          </span>
                          <span>{hint}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Companies & Tags */}
                <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-white/5">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Target Companies
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {["Amazon", "Google", "Microsoft", "Meta", "Bloomberg", "Uber"].map((comp) => (
                      <span
                        key={comp}
                        className="rounded-lg bg-slate-100 dark:bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-400"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 2: EDITORIAL ================= */}
            {activeTab === "editorial" && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    Official Editorial Walkthrough
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    A step-by-step breakdown of intuition, trade-offs, and the optimal algorithm.
                  </p>
                </div>

                {/* Approach breakdown */}
                <div className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] p-4 space-y-3">
                  <h3 className="text-xs font-bold text-[#3157e8] dark:text-[#5d7bff] uppercase tracking-wider">
                    Approach 1: One-Pass Hash Table
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    While iterating and inserting elements into the table, we also look back to check if current element's complement already exists in the table. If it exists, we have found a solution and return the indices immediately.
                  </p>
                </div>

                {/* Complexity analysis */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-emerald-200/70 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5">
                    <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                      TIME COMPLEXITY
                    </span>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 font-mono mt-1">
                      O(n)
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      We traverse the list containing n elements only once.
                    </p>
                  </div>

                  <div className="rounded-xl border border-indigo-200/70 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 p-3.5">
                    <span className="text-[10px] font-bold text-indigo-800 dark:text-indigo-400 uppercase tracking-wider block">
                      SPACE COMPLEXITY
                    </span>
                    <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300 font-mono mt-1">
                      O(n)
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      The extra space required depends on the number of items stored in hash table.
                    </p>
                  </div>
                </div>

                {/* Editorial Code */}
                <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-[#f8fafc] dark:bg-[#0f131f] p-4 text-slate-900 dark:text-slate-100 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10 mb-2">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Python 3 Solution</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(defaultCodes.python);
                        toast.success("Editorial code copied!");
                      }}
                      className="p-1 rounded hover:bg-slate-200/80 dark:hover:bg-white/10 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <pre className="overflow-x-auto custom-scrollbar leading-relaxed">
                    <code>{defaultCodes.python}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* ================= TAB 3: COMMUNITY SOLUTIONS (OTHER PEOPLE'S CODES) ================= */}
            {activeTab === "solutions" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      Community Solutions ({communitySolutions.length})
                    </h2>
                    <p className="text-xs text-slate-400">
                      Explore clean, well-voted approaches and alternative language patterns.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {communitySolutions.map((sol) => (
                    <div
                      key={sol.id}
                      className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] p-4 space-y-3"
                    >
                      {/* Author row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={sol.avatar}
                            alt={sol.author}
                            className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-white/10"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                              {sol.author}
                            </p>
                            <p className="text-[10px] text-slate-400">{sol.authorRole}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-2 py-0.5">
                            {sol.language}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                            <ThumbsUp className="h-3 w-3 text-indigo-500" />
                            <span>{sol.votes}</span>
                          </span>
                        </div>
                      </div>

                      {/* Title & tags */}
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                        {sol.title}
                      </h4>

                      <div className="flex flex-wrap gap-1.5">
                        {sol.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/5 px-2 py-0.5 text-[10px] text-slate-500"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {sol.explanation}
                      </p>

                      {/* Code Snippet Box */}
                      <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-[#f8fafc] dark:bg-[#0f131f] p-3 text-slate-900 dark:text-slate-100 font-mono text-xs relative group">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(sol.code);
                            toast.success(`Copied ${sol.author}'s solution!`);
                          }}
                          className="absolute top-2.5 right-2.5 p-1 rounded bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 transition opacity-80 group-hover:opacity-100 cursor-pointer"
                          title="Copy solution"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                        <pre className="overflow-x-auto custom-scrollbar text-[11px] leading-relaxed">
                          <code>{sol.code}</code>
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= TAB 4: MY SUBMISSIONS ================= */}
            {activeTab === "submissions" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      My Submissions ({mySubmissions.length})
                    </h2>
                    <p className="text-xs text-slate-400">
                      Your test executions, runtimes, and verdict status history.
                    </p>
                  </div>
                </div>

                {mySubmissions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/10 p-8 text-center space-y-2">
                    <Code2 className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto" />
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      No submissions recorded yet for this challenge.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mySubmissions.map((sub, idx) => (
                      <div
                        key={sub.id || idx}
                        className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] p-4 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                sub.status === "Accepted"
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                                    : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
                              }`}
                            >
                              {sub.status === "Accepted" ? (
                                <CircleCheck className="h-3.5 w-3.5" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5" />
                              )}
                              <span>{sub.status}</span>
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              {sub.language}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">{sub.timestamp}</span>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                          <div>
                            Runtime: <span className="font-bold text-slate-800 dark:text-slate-200">{sub.runtime}</span>
                          </div>
                          <div>
                            Memory: <span className="font-bold text-slate-800 dark:text-slate-200">{sub.memory}</span>
                          </div>
                        </div>

                        {/* Submitted Code Preview */}
                        <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-[#f8fafc] dark:bg-[#0f131f] p-3 text-slate-900 dark:text-slate-100 font-mono text-[11px]">
                          <pre className="overflow-x-auto custom-scrollbar">
                            <code>{sub.codeSnippet}</code>
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB 5: DISCUSSIONS ================= */}
            {activeTab === "discussion" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      Community Discussions ({discussions.length})
                    </h2>
                    <p className="text-xs text-slate-400">
                      Ask doubts, discuss nuances, and share learning breakthroughs.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPostingDiscussion(!isPostingDiscussion)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#3157e8] hover:bg-[#2648d1] px-3 py-1.5 text-xs font-bold text-white transition cursor-pointer"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>New Topic</span>
                  </button>
                </div>

                {/* New discussion form */}
                {isPostingDiscussion && (
                  <form
                    onSubmit={handlePostDiscussion}
                    className="rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/20 dark:bg-indigo-950/30 p-4 space-y-3 animate-in fade-in"
                  >
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Ask a Question or Share a Thought
                    </h4>
                    <input
                      type="text"
                      placeholder="Title or summary of your question..."
                      value={newDiscussionTitle}
                      onChange={(e) => setNewDiscussionTitle(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151926] px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <textarea
                      rows={3}
                      placeholder="Explain your thought process, what you tried, or what confused you..."
                      value={newDiscussionBody}
                      onChange={(e) => setNewDiscussionBody(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151926] px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 custom-scrollbar"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsPostingDiscussion(false)}
                        className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-[#3157e8] text-white text-xs font-bold hover:bg-[#2648d1] cursor-pointer"
                      >
                        Post Discussion
                      </button>
                    </div>
                  </form>
                )}

                {/* Discussions list */}
                <div className="space-y-3">
                  {discussions.map((disc) => (
                    <div
                      key={disc.id}
                      className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] p-4 space-y-2 hover:border-indigo-200 transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={disc.avatar}
                            alt={disc.author}
                            className="h-6 w-6 rounded-full object-cover"
                          />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {disc.author}
                          </span>
                          <span className="text-[10px] text-slate-400">· {disc.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                          <ThumbsUp className="h-3 w-3 text-indigo-500" />
                          <span>{disc.votes}</span>
                        </div>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {disc.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                        {disc.content}
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" /> {disc.replies} replies
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: CODE VIEWER & TEST RUNNER (6 cols) ================= */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#151926] shadow-sm overflow-hidden min-h-[640px]">
          {/* Top Code Editor Header: Language selector & Actions */}
          <div className="flex items-center justify-between border-b border-slate-200/90 dark:border-white/10 bg-slate-50/90 dark:bg-[#1a2030] px-4 py-2.5">
            <LanguageCustomDropdown value={language} onChange={setLanguage} />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCode(defaultCodes[language] || defaultCodes.python)}
                title="Reset code template"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/5 transition cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>

              <button
                type="button"
                onClick={handleCopyCode}
                title="Copy code"
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5 transition cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitCode}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Send className={`h-3 w-3 ${isSubmitting ? "animate-spin" : ""}`} />
                <span>{isSubmitting ? "Submitting..." : "Submit"}</span>
              </button>
            </div>
          </div>

          {/* Code Textarea / Viewer (Full Height) */}
          <div className="flex-1 flex flex-col relative bg-[#f8fafc] dark:bg-[#0f131f] p-4 text-slate-900 dark:text-slate-100 font-mono text-xs">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="w-full flex-1 min-h-[460px] bg-transparent border-0 text-slate-800 dark:text-slate-100 font-mono text-xs leading-relaxed focus:outline-none resize-none custom-scrollbar"
            />
          </div>

          {/* Bottom Code Editor Status Bar */}
          <div className="flex items-center justify-between border-t border-slate-200/90 dark:border-white/10 bg-slate-50/90 dark:bg-[#1a2030] px-4 py-2.5 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
                <Terminal className="h-3.5 w-3.5" />
                <span>{language.toUpperCase()}</span>
              </span>
              <span>{code.split("\n").length} lines</span>
              <span>{code.length} chars</span>
            </div>
            <span className="text-[10px] text-slate-500 font-sans font-medium">Optimal Reference Solution</span>
          </div>
        </div>
      </div>
    </div>
  );
}
