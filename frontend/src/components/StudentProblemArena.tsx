"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { API_BASE_URL, getAuthHeaders } from "@/lib/apiConfig";
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
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  BookOpen,
  Tag,
  Building2,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import { PublicProblem, useLiveProblems } from "@/hooks/useLiveProblems";
import { useAuth } from "@/hooks/useAuth";
import { resolveDisplayName, resolveEducationStatus } from "@/lib/nameUtils";
import { toast } from "sonner";
import { CompanyLogo } from "@/components/CompanyLogo";
import { cn } from "@/lib/utils";

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

function parseCompaniesList(val: any, category?: string, title?: string): string[] {
  let list: string[] = [];
  if (Array.isArray(val)) {
    list = val.map((c) => String(c).trim()).filter(Boolean);
  } else if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          list = parsed.map((c) => String(c).trim()).filter(Boolean);
        }
      } catch {}
      if (list.length === 0) {
        list = trimmed
          .replace(/[\[\]"']/g, "")
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);
      }
    }
  }

  if (list.length > 0) return list;

  // Rich defaults for existing problems
  return ["Google", "Meta", "Amazon", "Microsoft", "Adobe"];
}

function parseCodeObject(val: any): Record<string, string> {
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

function parseExamplesFromDescription(desc?: string): Array<{ id: number; input: string; output: string; explanation?: string }> {
  if (!desc) return [];
  const results: Array<{ id: number; input: string; output: string; explanation?: string }> = [];

  const exRegex = /(?:Example\s*(\d+)[:\s]*)([\s\S]*?)(?=(?:Example\s*\d+[:\s]*|Constraints|$))/gi;
  let match;
  let idx = 1;
  while ((match = exRegex.exec(desc)) !== null) {
    const block = match[2];
    const inputMatch = /Input:\s*([\s\S]*?)(?=Output:|$)/i.exec(block);
    const outputMatch = /Output:\s*([\s\S]*?)(?=Explanation:|$)/i.exec(block);
    const explMatch = /Explanation:\s*([\s\S]*?)$/i.exec(block);

    if (inputMatch || outputMatch) {
      results.push({
        id: idx,
        input: (inputMatch ? inputMatch[1] : "").trim() || "N/A",
        output: (outputMatch ? outputMatch[1] : "").trim() || "N/A",
        explanation: (explMatch ? explMatch[1] : "").trim() || undefined,
      });
      idx++;
    }
  }
  return results;
}

function parseExamplesList(
  examplesVal: any,
  sampleInput?: string,
  sampleOutput?: string,
  title?: string,
  description?: string
): Array<{ id: number | string; input: string; output: string; explanation?: string }> {
  let list: any[] = [];
  if (Array.isArray(examplesVal)) {
    list = examplesVal;
  } else if (typeof examplesVal === "string" && examplesVal.trim()) {
    try {
      const parsed = JSON.parse(examplesVal);
      if (Array.isArray(parsed)) {
        list = parsed;
      }
    } catch {}
  }

  const valid = list.filter((ex) => ex && typeof ex === "object" && (ex.input || ex.output));
  if (valid.length > 0) {
    return valid.map((ex, idx) => ({
      id: ex.id || idx + 1,
      input: ex.input || "N/A",
      output: ex.output || "N/A",
      explanation: ex.explanation || "",
    }));
  }

  // Try extracting from description text
  const fromDesc = parseExamplesFromDescription(description);
  if (fromDesc.length > 0) {
    return fromDesc;
  }

  if (sampleInput || sampleOutput) {
    return [
      {
        id: 1,
        input: sampleInput || "N/A",
        output: sampleOutput || "N/A",
        explanation: `Sample test case for ${title || "this problem"}.`,
      },
    ];
  }

  return [
    {
      id: 1,
      input: "nums = [2, 7, 11, 15], target = 9",
      output: "[0, 1]",
      explanation: `Standard sample execution for ${title || "this problem"}.`,
    },
  ];
}

function parseTagsList(tagsVal: any, category?: string, topic?: string, difficulty?: string, title?: string): string[] {
  const raw = parseArray(tagsVal);
  if (raw.length > 0) return raw;

  const set = new Set<string>();
  const cat = category || topic || "General";
  if (cat && cat !== "General") set.add(cat);

  const tLower = (title || "").toLowerCase();
  const cLower = (cat || "").toLowerCase();

  if (tLower.includes("sum") || cLower.includes("hash") || cLower.includes("array")) {
    set.add("Array");
    set.add("Hash Table");
    set.add("Two Pointers");
  } else if (tLower.includes("tree") || cLower.includes("tree")) {
    set.add("Tree");
    set.add("Binary Tree");
    set.add("DFS");
  } else if (tLower.includes("graph") || cLower.includes("graph")) {
    set.add("Graph");
    set.add("BFS");
    set.add("DFS");
  } else if (tLower.includes("string") || cLower.includes("string") || tLower.includes("palindrome")) {
    set.add("String");
    set.add("Two Pointers");
    set.add("Sliding Window");
  } else if (tLower.includes("list") || cLower.includes("linked")) {
    set.add("Linked List");
    set.add("Two Pointers");
  } else if (tLower.includes("dp") || cLower.includes("dynamic")) {
    set.add("Dynamic Programming");
    set.add("Array");
  } else {
    set.add("Array");
    set.add("Algorithms");
    set.add("Data Structures");
  }

  if (difficulty) set.add(difficulty);
  return Array.from(set);
}

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
  const { user } = useAuth();
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
      status: "Accepted" | "Pending Review" | "Needs Improvement" | "Rejected" | "Wrong Answer";
      runtime: string;
      memory: string;
      language: string;
      timestamp: string;
      codeSnippet: string;
      feedback?: string;
    }>
  >([]);

  // Community discussions interface & state
  interface PracticeDiscussionItem {
    id: string;
    problemId?: string;
    problemSlug?: string;
    title: string;
    content: string;
    snippet?: string;
    author: string;
    authorRole?: string;
    authorEmail?: string;
    avatar?: string;
    authorAvatar?: string;
    authorDesignation?: string;
    votes: number;
    replies: number;
    replyList?: Array<{
      id: string;
      author: string;
      authorRole?: string;
      avatar?: string;
      content: string;
      createdAt?: string;
    }>;
    status?: string;
    isLiked?: boolean;
    likedBy?: string[];
    timestamp?: string;
    createdAt?: string;
  }

  const [discussions, setDiscussions] = useState<PracticeDiscussionItem[]>([]);
  const [newDiscussionTitle, setNewDiscussionTitle] = useState("");
  const [newDiscussionBody, setNewDiscussionBody] = useState("");
  const [isPostingDiscussion, setIsPostingDiscussion] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<string>("");
  const [likedDiscussions, setLikedDiscussions] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem("lms_user_liked_discussions");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Parse structured data safely
  const refSolutions = useMemo(() => {
    return parseCodeObject(problem.referenceSolution);
  }, [problem.referenceSolution]);

  const starterCodes = useMemo(() => {
    return parseCodeObject(problem.starterCode);
  }, [problem.starterCode]);

  // Derived editorial metadata with rich fallbacks for existing problems
  const editorialApproach = useMemo(() => {
    if (problem.editorialApproach && problem.editorialApproach.trim()) {
      return problem.editorialApproach;
    }
    return `To solve "${problem.title}", analyze the fundamental problem constraints and identify the key invariants. By choosing optimal data structures (such as hash lookups, two pointers, or dynamic state tables), we can traverse the problem space in optimal linear time while keeping auxiliary memory minimal.`;
  }, [problem.editorialApproach, problem.title]);

  const editorialAlgorithm = useMemo(() => {
    if (problem.editorialAlgorithm && problem.editorialAlgorithm.trim()) {
      return problem.editorialAlgorithm;
    }
    return `1. Initialize the required state variables and auxiliary lookup containers.\n2. Iterate through the primary input elements sequentially.\n3. Check invariant conditions at each step and update the state.\n4. Return the computed result or optimal solution configuration.`;
  }, [problem.editorialAlgorithm]);

  const timeComplexity = useMemo(() => {
    return problem.timeComplexity && problem.timeComplexity.trim() ? problem.timeComplexity : "O(n)";
  }, [problem.timeComplexity]);

  const spaceComplexity = useMemo(() => {
    return problem.spaceComplexity && problem.spaceComplexity.trim() ? problem.spaceComplexity : "O(n)";
  }, [problem.spaceComplexity]);

  // Default starter codes per language from API problem object
  const defaultCodes: Record<string, string> = useMemo(() => {
    const fnName = problem.title
      ? problem.title.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, "") || "solve"
      : "solve";
    return {
      python:
        starterCodes.python ||
        refSolutions.python ||
        `class Solution:\n    def ${fnName}(self, *args, **kwargs):\n        # Optimal Python 3 solution for ${problem.title}\n        # Time: ${timeComplexity} | Space: ${spaceComplexity}\n        pass\n`,
      javascript:
        starterCodes.javascript ||
        refSolutions.javascript ||
        `/**\n * Solution for ${problem.title}\n * Time: ${timeComplexity} | Space: ${spaceComplexity}\n */\nfunction ${fnName}(...args) {\n    // Optimal JavaScript solution\n    return [];\n}\n`,
      typescript:
        starterCodes.typescript ||
        refSolutions.typescript ||
        `function ${fnName}(...args: any[]): any {\n    // Optimal TypeScript solution for ${problem.title}\n    // Time: ${timeComplexity} | Space: ${spaceComplexity}\n    return [];\n}\n`,
      java:
        starterCodes.java ||
        refSolutions.java ||
        `class Solution {\n    public Object ${fnName}() {\n        // Optimal Java solution for ${problem.title}\n        // Time: ${timeComplexity} | Space: ${spaceComplexity}\n        return null;\n    }\n}\n`,
      cpp:
        starterCodes.cpp ||
        refSolutions.cpp ||
        `#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    void ${fnName}() {\n        // Optimal C++ solution for ${problem.title}\n        // Time: ${timeComplexity} | Space: ${spaceComplexity}\n    }\n};\n`,
    };
  }, [starterCodes, refSolutions, problem.title, timeComplexity, spaceComplexity]);

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
      } else {
        setMySubmissions([]);
      }
    } catch {}
  }, [problem.id, problem.slug]);

  // Examples parser from API problem
  const exampleCases = useMemo(() => {
    return parseExamplesList(
      problem.examples,
      problem.sampleInput,
      problem.sampleOutput,
      problem.title,
      problem.description
    );
  }, [problem.examples, problem.sampleInput, problem.sampleOutput, problem.title, problem.description]);

  // Companies list from API problem
  const companiesList = useMemo(() => {
    return parseCompaniesList(problem.companies, problem.category, problem.title);
  }, [problem.companies, problem.category, problem.title]);

  // Tags list from API problem
  const tagsList = useMemo(() => {
    return parseTagsList(
      problem.tags,
      problem.category,
      problem.topic,
      problem.difficulty,
      problem.title
    );
  }, [problem.tags, problem.category, problem.topic, problem.difficulty, problem.title]);

  // Editorial Language State
  const [editorialLanguage, setEditorialLanguage] = useState<
    "python" | "javascript" | "typescript" | "java" | "cpp"
  >("python");

  // Editorial Code memo
  const editorialCode = useMemo(() => {
    if (refSolutions[editorialLanguage] && refSolutions[editorialLanguage].trim()) {
      return refSolutions[editorialLanguage];
    }
    if (starterCodes[editorialLanguage] && starterCodes[editorialLanguage].trim()) {
      return starterCodes[editorialLanguage];
    }
    if (refSolutions.python && refSolutions.python.trim()) {
      return refSolutions.python;
    }
    return defaultCodes[editorialLanguage] || defaultCodes.python;
  }, [refSolutions, starterCodes, editorialLanguage, defaultCodes]);

  // Multi-Language Community Solutions Tab
  const [solutionFilter, setSolutionFilter] = useState<string>("All");

  const getLanguageBadgeColor = (lang: string): string => {
    const l = (lang || "").toLowerCase();
    if (l.includes("python")) {
      return "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-900/50";
    }
    if (l.includes("javascript") || l === "js") {
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-900/50";
    }
    if (l.includes("typescript") || l === "ts") {
      return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50";
    }
    if (l.includes("java") && !l.includes("script")) {
      return "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border-orange-200 dark:border-orange-900/50";
    }
    if (l.includes("c++") || l.includes("cpp")) {
      return "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-900/50";
    }
    return "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300 border-slate-200 dark:border-white/10";
  };

  interface CommunitySolution {
    id: string;
    problemId: string;
    languageKey: "python" | "javascript" | "typescript" | "java" | "cpp";
    language: string;
    badgeColor: string;
    title: string;
    author: string;
    authorDesignation: string;
    avatar?: string;
    votes: number;
    views: number;
    runtime?: string;
    memory?: string;
    complexity: string;
    tags: string[];
    code: string;
    explanation: string;
    submittedAt: string;
  }

  const [communitySolutions, setCommunitySolutions] = useState<CommunitySolution[]>([]);

  useEffect(() => {
    let isCancelled = false;

    const fetchSubmissionsFromApi = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (user?.id) queryParams.set("userId", String(user.id));
        if (user?.email) queryParams.set("userEmail", String(user.email));

        const res = await fetch(
          `${API_BASE_URL}/api/v1/practice-problems/${problem.id || problem.slug}/submissions${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && !isCancelled) {
            // Map backend approved submissions to CommunitySolutions
            const mapped: CommunitySolution[] = data
              .filter(
                (sub: any) =>
                  !String(sub.id).startsWith("peer-") &&
                  (sub.status || "Approved").toLowerCase() === "approved"
              )
              .map((sub: any) => {
                const langLower = (sub.language || "python").toLowerCase();
                const validKey: "python" | "javascript" | "typescript" | "java" | "cpp" =
                  langLower.includes("type")
                    ? "typescript"
                    : langLower.includes("java") && !langLower.includes("script")
                    ? "java"
                    : langLower.includes("c++") || langLower.includes("cpp")
                    ? "cpp"
                    : langLower.includes("script") || langLower === "js"
                    ? "javascript"
                    : "python";

                return {
                  id: String(sub.id),
                  problemId: String(sub.problemId || problem.id || problem.slug),
                  languageKey: validKey,
                  language: sub.language || (validKey === "python" ? "Python 3" : validKey.toUpperCase()),
                  badgeColor: getLanguageBadgeColor(sub.language || validKey),
                  title: `${sub.language || "Code"}: ${sub.student || sub.authorName || "Learner"}'s Solution`,
                  author: sub.student || sub.authorName || "Learner",
                  authorDesignation: sub.designation || sub.authorDesignation || "Student",
                  avatar: sub.avatar || sub.authorAvatar || undefined,
                  votes: Number(sub.votes) || 0,
                  views: Number(sub.views) || 1,
                  runtime: sub.runtime || sub.time || "32 ms",
                  memory: sub.memory || "16.4 MB",
                  complexity: `Time: ${timeComplexity} | Space: ${spaceComplexity}`,
                  tags: ["Community", (sub.language || validKey).toUpperCase(), "Approved"],
                  code: sub.code || "",
                  explanation: `Approved community submission by ${sub.student || sub.authorName || "Learner"}.`,
                  submittedAt: sub.submitted || (sub.submittedAt ? "Recently" : "Just now"),
                };
              });

            setCommunitySolutions(mapped);

            // Synchronize and track all personal student submissions (preserves full submission history)
            const userSubmissionsFromBackend = data.filter((sub: any) => {
              const matchesEmail =
                user?.email &&
                sub.studentEmail &&
                sub.studentEmail.toLowerCase() === user.email.toLowerCase();
              const matchesId = user?.id && sub.userId && String(sub.userId) === String(user.id);
              return matchesEmail || matchesId;
            });

            if (userSubmissionsFromBackend.length > 0) {
              const mappedUserSubs = userSubmissionsFromBackend.map((sub: any) => {
                const rawStatus = (sub.status || "").toLowerCase();
                let normalizedStatus: "Accepted" | "Pending Review" | "Needs Improvement" | "Rejected" | "Wrong Answer" = "Pending Review";
                if (rawStatus.includes("approved") || rawStatus.includes("accepted")) {
                  normalizedStatus = "Accepted";
                } else if (rawStatus.includes("improve") || rawStatus.includes("needs")) {
                  normalizedStatus = "Needs Improvement";
                } else if (rawStatus.includes("reject") || rawStatus.includes("wrong")) {
                  normalizedStatus = "Rejected";
                } else {
                  normalizedStatus = "Pending Review";
                }

                return {
                  id: String(sub.id),
                  status: normalizedStatus,
                  runtime: sub.runtime || sub.time || "32 ms",
                  memory: sub.memory || "16.4 MB",
                  language: (sub.language || "Python").toUpperCase(),
                  timestamp: sub.submitted || (sub.submittedAt ? "Recently" : "Just now"),
                  codeSnippet: sub.code || "",
                  feedback: sub.feedback || sub.reviewNotes || "",
                };
              });

              setMySubmissions((prev) => {
                const backendIds = new Set(mappedUserSubs.map((s) => s.id));
                const pendingLocal = prev.filter(
                  (p) => !backendIds.has(p.id) && String(p.id).startsWith("local-")
                );
                const combined = [...mappedUserSubs, ...pendingLocal];
                try {
                  localStorage.setItem(
                    `lms_submissions_${problem.id || problem.slug}`,
                    JSON.stringify(combined)
                  );
                } catch {}
                return combined;
              });
            } else {
              // Fallback sync for offline/local submissions by exact ID
              setMySubmissions((prev) => {
                let changed = false;
                const updated = prev.map((mySub) => {
                  const match = data.find((sub: any) => String(sub.id) === String(mySub.id));
                  if (match) {
                    const rawStatus = (match.status || "").toLowerCase();
                    let normalizedStatus: "Accepted" | "Pending Review" | "Needs Improvement" | "Rejected" | "Wrong Answer" = "Pending Review";
                    if (rawStatus.includes("approved") || rawStatus.includes("accepted")) {
                      normalizedStatus = "Accepted";
                    } else if (rawStatus.includes("improve") || rawStatus.includes("needs")) {
                      normalizedStatus = "Needs Improvement";
                    } else if (rawStatus.includes("reject") || rawStatus.includes("wrong")) {
                      normalizedStatus = "Rejected";
                    } else {
                      normalizedStatus = "Pending Review";
                    }

                    const feedback = match.feedback || match.reviewNotes || "";
                    if (mySub.status !== normalizedStatus || (mySub.feedback || "") !== feedback) {
                      changed = true;
                      return {
                        ...mySub,
                        status: normalizedStatus,
                        feedback,
                        runtime: match.runtime || mySub.runtime,
                        memory: match.memory || mySub.memory,
                      };
                    }
                  }
                  return mySub;
                });

                if (changed) {
                  try {
                    localStorage.setItem(
                      `lms_submissions_${problem.id || problem.slug}`,
                      JSON.stringify(updated)
                    );
                  } catch {}
                  return updated;
                }
                return prev;
              });
            }
            return;
          }
        }
      } catch {}

      // Local storage fallback (only approved)
      try {
        const storageKey = `lms_community_solutions_${problem.id || problem.slug}`;
        const saved = localStorage.getItem(storageKey);
        if (saved && !isCancelled) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const realOnly = parsed.filter(
              (s: any) =>
                !String(s.id).startsWith("peer-") &&
                (s.status || "Approved").toLowerCase() === "approved"
            );
            setCommunitySolutions(realOnly);
            return;
          }
        }
      } catch {}

      if (!isCancelled) {
        setCommunitySolutions([]);
      }
    };

    const fetchDiscussionsFromApi = async () => {
      try {
        const userEmail = user?.email ? encodeURIComponent(user.email) : "";
        const userId = user?.id || "";
        const res = await fetch(
          `${API_BASE_URL}/api/v1/practice-problems/${problem.id || problem.slug}/discussions?userEmail=${userEmail}&userId=${userId}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && !isCancelled) {
            setDiscussions(data);
            return;
          }
        }
      } catch {}
    };

    fetchSubmissionsFromApi();
    fetchDiscussionsFromApi();

    const handleFocus = () => {
      fetchSubmissionsFromApi();
      fetchDiscussionsFromApi();
    };
    window.addEventListener("focus", handleFocus);
    const interval = setInterval(() => {
      fetchSubmissionsFromApi();
      fetchDiscussionsFromApi();
    }, 4000);

    return () => {
      isCancelled = true;
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, [problem.id, problem.slug, user?.email, user?.id, timeComplexity, spaceComplexity]);

  const [likedSolutions, setLikedSolutions] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem("lms_user_liked_solutions");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleToggleLike = (solutionId: string) => {
    const isCurrentlyLiked = !!likedSolutions[solutionId];
    const newLikedState = !isCurrentlyLiked;
    const updatedLikes = { ...likedSolutions, [solutionId]: newLikedState };
    setLikedSolutions(updatedLikes);

    try {
      localStorage.setItem("lms_user_liked_solutions", JSON.stringify(updatedLikes));
    } catch {}

    setCommunitySolutions((prev) => {
      const updated = prev.map((s) => {
        if (s.id === solutionId) {
          const delta = newLikedState ? 1 : -1;
          return {
            ...s,
            votes: Math.max(0, (Number(s.votes) || 0) + delta),
          };
        }
        return s;
      });

      try {
        const storageKey = `lms_community_solutions_${problem.id || problem.slug}`;
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}

      return updated;
    });

    if (newLikedState) {
      toast.success("Upvoted solution!");
    } else {
      toast.success("Upvote removed");
    }
  };

  // Dynamic ranking: Solutions with highest likes appear first at the top
  const sortedSolutions = useMemo(() => {
    const list = [...communitySolutions].sort((a, b) => {
      const vA = Number(a.votes) || 0;
      const vB = Number(b.votes) || 0;
      if (vB !== vA) return vB - vA; // highest likes first
      return (b.id || "").localeCompare(a.id || "");
    });

    if (solutionFilter === "All") return list;
    return list.filter(
      (s) =>
        s.language.toLowerCase().includes(solutionFilter.toLowerCase()) ||
        s.languageKey.toLowerCase() === solutionFilter.toLowerCase()
    );
  }, [communitySolutions, solutionFilter]);

  // Constraints list from API problem
  const constraintsList = useMemo(() => {
    if (problem.constraints) {
      return problem.constraints
        .split("\n")
        .map((c) => c.trim())
        .filter(Boolean);
    }
    return [];
  }, [problem.constraints]);

  // Hints from API problem
  const hintsList = useMemo(() => {
    return parseArray(problem.hints);
  }, [problem.hints]);

  // Test cases parsed from API problem
  const testCasesParsed = useMemo(() => {
    return parseArray(problem.testCasesList);
  }, [problem.testCasesList]);

  // Available interactive test cases (combining testCasesList or examples)
  const interactiveTestCases = useMemo(() => {
    if (testCasesParsed.length > 0) {
      const visible = testCasesParsed.filter(
        (tc: any) => tc && !tc.isHidden && (tc.input || tc.output)
      );
      if (visible.length > 0) {
        return visible.map((tc: any, idx: number) => ({
          id: tc.id || idx + 1,
          input: tc.input || "",
          output: tc.output || "",
          explanation: tc.explanation || "",
        }));
      }
    }
    if (exampleCases.length > 0) {
      return exampleCases;
    }
    if (problem.sampleInput || problem.sampleOutput) {
      return [
        {
          id: 1,
          input: problem.sampleInput || "N/A",
          output: problem.sampleOutput || "N/A",
          explanation: `Sample test case for ${problem.title}.`,
        },
      ];
    }
    return [
      {
        id: 1,
        input: "nums = [2, 7, 11, 15]\ntarget = 9",
        output: "[0, 1]",
        explanation: "Primary test case",
      },
    ];
  }, [testCasesParsed, exampleCases, problem.sampleInput, problem.sampleOutput, problem.title]);

  // Handle Submit Code
  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    const runtime = `${Math.floor(Math.random() * 25) + 28} ms`;
    const memory = `${(Math.random() * 2 + 15.2).toFixed(1)} MB`;

    // Submitter profile info
    const authorName = resolveDisplayName(user);
    const rawEdu = resolveEducationStatus(user);
    const formattedDesignation = rawEdu.toLowerCase().includes("professional")
      ? "Working Professional"
      : rawEdu.toLowerCase().includes("year")
      ? `${rawEdu} student`
      : rawEdu;

    const subId = `sub-${Date.now()}`;

    // POST to backend API with Pending Review status for admin approval
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/practice-problems/${problem.id || problem.slug}/submissions`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          credentials: "include",
          body: JSON.stringify({
            id: subId,
            student: authorName,
            authorName: authorName,
            userId: user?.id,
            email: user?.email,
            studentEmail: user?.email,
            avatar: user?.avatarUrl,
            authorAvatar: user?.avatarUrl,
            designation: formattedDesignation,
            authorDesignation: formattedDesignation,
            language: language === "python" ? "Python" : language.toUpperCase(),
            code: code,
            runtime: runtime,
            memory: memory,
            status: "Pending Review",
          }),
        }
      );

      let finalId = subId;
      let finalStatus: "Pending Review" | "Accepted" = "Pending Review";
      if (res.ok) {
        const savedSub = await res.json();
        if (savedSub?.id) finalId = String(savedSub.id);
        if ((savedSub?.status || "").toLowerCase() === "approved") {
          finalStatus = "Accepted";
        }
      }

      // Add to personal submission history without removing prior attempts
      setMySubmissions((prev) => {
        const withoutExactSameId = prev.filter((s) => s.id !== subId && s.id !== finalId);
        const newSubmission = {
          id: finalId,
          status: finalStatus,
          runtime: `${runtime}`,
          memory: `${memory}`,
          language: language.toUpperCase(),
          timestamp: "Just now",
          codeSnippet: code,
        };
        const updatedSubs = [newSubmission, ...withoutExactSameId];
        try {
          localStorage.setItem(
            `lms_submissions_${problem.id || problem.slug}`,
            JSON.stringify(updatedSubs)
          );
        } catch {}
        return updatedSubs;
      });
    } catch (err) {
      console.error("Failed to persist submission to API:", err);
      // Fallback local addition
      const newSubmission = {
        id: subId,
        status: "Pending Review" as const,
        runtime: `${runtime}`,
        memory: `${memory}`,
        language: language.toUpperCase(),
        timestamp: "Just now",
        codeSnippet: code,
      };
      setMySubmissions((prev) => {
        const withoutExactSameId = prev.filter((s) => s.id !== subId);
        const updatedSubs = [newSubmission, ...withoutExactSameId];
        try {
          localStorage.setItem(
            `lms_submissions_${problem.id || problem.slug}`,
            JSON.stringify(updatedSubs)
          );
        } catch {}
        return updatedSubs;
      });
    }

    setIsSubmitting(false);
    toast.success("Solution submitted for review!", {
      description: "Your code has been sent to the instructor/admin for review. Once approved, it will be published to the Community Solutions tab.",
    });
  };

  // Handle Post Discussion
  const handlePostDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscussionTitle.trim()) return;

    const authorName = resolveDisplayName(user);
    const rawEdu = resolveEducationStatus(user);
    const formattedDesignation = rawEdu.toLowerCase().includes("professional")
      ? "Working Professional"
      : rawEdu.toLowerCase().includes("year")
      ? `${rawEdu} student`
      : rawEdu;

    const payload = {
      title: newDiscussionTitle.trim(),
      content: newDiscussionBody.trim() || "Looking for feedback and alternative approaches!",
      authorName: authorName,
      author: authorName,
      email: user?.email,
      studentEmail: user?.email,
      avatar: user?.avatarUrl,
      authorAvatar: user?.avatarUrl,
      designation: formattedDesignation,
      authorDesignation: formattedDesignation,
      userId: user?.id,
      status: "Pending Review",
    };

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/practice-problems/${problem.id || problem.slug}/discussions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (res.ok) {
        const created = await res.json();
        setDiscussions((prev) => [created, ...prev.filter((d) => d.id !== created.id)]);
      }
    } catch (err) {
      console.error("Failed to post discussion:", err);
    }

    setNewDiscussionTitle("");
    setNewDiscussionBody("");
    setIsPostingDiscussion(false);
    toast.success("Discussion submitted for moderation!", {
      description: "Your question has been sent to the instructor for review. Once approved, it will be published to the Community Discussions tab.",
    });
  };

  const handleToggleLikeDiscussion = async (discussionId: string) => {
    const isCurrentlyLiked = !!likedDiscussions[discussionId];
    const newLikedState = !isCurrentlyLiked;
    const delta = newLikedState ? 1 : -1;
    const updatedLikes = { ...likedDiscussions, [discussionId]: newLikedState };
    setLikedDiscussions(updatedLikes);

    try {
      localStorage.setItem("lms_user_liked_discussions", JSON.stringify(updatedLikes));
    } catch {}

    setDiscussions((prev) =>
      prev.map((d) => {
        if (d.id === discussionId) {
          return {
            ...d,
            votes: Math.max(0, (Number(d.votes) || 0) + delta),
            isLiked: newLikedState,
          };
        }
        return d;
      })
    );

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/practice-problems/discussions/${discussionId}/like`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({
          delta,
          userEmail: user?.email,
          userId: user?.id,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        if (typeof updated.votes === "number") {
          setDiscussions((prev) =>
            prev.map((d) => (d.id === discussionId ? { ...d, votes: updated.votes, isLiked: updated.isLiked } : d))
          );
        }
      }
    } catch {}

    if (newLikedState) {
      toast.success("Upvoted discussion!");
    } else {
      toast.success("Upvote removed");
    }
  };

  const handleSendDiscussionReply = async (discussionId: string) => {
    if (!replyContent.trim()) return;

    const authorName = resolveDisplayName(user);
    const payload = {
      content: replyContent.trim(),
      authorName,
      author: authorName,
      authorEmail: user?.email,
      email: user?.email,
      avatar: user?.avatarUrl,
      authorRole: "student",
    };

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/practice-problems/discussions/${discussionId}/replies`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );
      if (res.ok) {
        const updated = await res.json();
        setDiscussions((prev) =>
          prev.map((d) => (d.id === discussionId ? { ...d, ...updated } : d))
        );
        toast.success("Reply posted!");
      }
    } catch (err) {
      console.error("Failed to post reply:", err);
    }

    setReplyContent("");
    setReplyingToId(null);
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
            {problem.estimatedSolveTime && (
              <span className="hidden lg:inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                <Clock className="h-3 w-3 text-slate-400" />
                <span>{problem.estimatedSolveTime}</span>
              </span>
            )}
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
          <div className="flex items-center gap-1 border-b border-slate-100 dark:border-white/5 px-4 pt-2.5 bg-slate-50/50 dark:bg-white/[0.01] overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {[
              { id: "description", label: "Description", icon: FileText },
              { id: "editorial", label: "Editorial", icon: BookOpen },
              { id: "solutions", label: "Solutions", icon: Code2, badge: String(communitySolutions.length) },
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
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden space-y-6">
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
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                      Examples ({exampleCases.length})
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {exampleCases.map((ex, idx) => (
                      <div
                        key={ex.id || idx}
                        className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] p-4 space-y-2 text-xs"
                      >
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          Example {idx + 1}:
                        </p>
                        <div className="space-y-1.5 font-mono text-[11px]">
                          <div>
                            <span className="font-bold text-slate-500 font-sans mr-2">Input:</span>
                            <span className="text-slate-900 dark:text-slate-100 whitespace-pre-line">{ex.input}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-500 font-sans mr-2">Output:</span>
                            <span className="text-slate-900 dark:text-slate-100 font-bold whitespace-pre-line">{ex.output}</span>
                          </div>
                          {ex.explanation && (
                            <div className="pt-1.5 font-sans text-slate-600 dark:text-slate-400 bg-white/70 dark:bg-white/[0.03] p-2.5 rounded-lg border border-slate-200/50 dark:border-white/5">
                              <span className="font-bold text-slate-700 dark:text-slate-300 mr-2">Explanation:</span>
                              <span className="leading-relaxed">{ex.explanation}</span>
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

                {/* DEDICATED SECTION 1: Topic Tags */}
                {tagsList.length > 0 && (
                  <div className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="grid h-6 w-6 place-items-center rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                          <Tag className="h-3.5 w-3.5" />
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          Topic Tags
                        </h4>
                      </div>
                      <span className="rounded-full bg-indigo-100/80 dark:bg-indigo-950/80 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                        {tagsList.length} {tagsList.length === 1 ? "tag" : "tags"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {tagsList.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/40 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/80 dark:hover:bg-indigo-950/70 transition-colors shadow-2xs"
                        >
                          <span className="text-indigo-400 dark:text-indigo-500 font-normal">#</span>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* DEDICATED SECTION 2: Target Companies */}
                {companiesList.length > 0 && (
                  <div className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="grid h-6 w-6 place-items-center rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                          <Building2 className="h-3.5 w-3.5" />
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          Target Companies
                        </h4>
                      </div>
                      <span className="rounded-full bg-slate-200/70 dark:bg-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        {companiesList.length} companies
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {companiesList.map((comp, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-white/10 transition"
                        >
                          <CompanyLogo name={comp} size="xs" />
                          <span>{comp}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
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
                    A step-by-step breakdown of intuition, trade-offs, and the optimal algorithm across all supported languages.
                  </p>
                </div>

                {/* Approach breakdown */}
                <div className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] p-4 space-y-3">
                  <h3 className="text-xs font-bold text-[#3157e8] dark:text-[#5d7bff] uppercase tracking-wider">
                    Optimal Solution Approach
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {problem.editorialApproach ||
                      "While iterating and inserting elements into the table, we also look back to check if current element's complement already exists in the table. If it exists, we have found a solution and return the indices immediately."}
                  </p>
                </div>

                {/* Algorithm Step-by-Step breakdown if present */}
                {problem.editorialAlgorithm && (
                  <div className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] p-4 space-y-2.5">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Step-by-Step Algorithm
                    </h3>
                    <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-mono text-[11px] bg-white dark:bg-black/20 p-3 rounded-lg border border-slate-200/60 dark:border-white/5">
                      {problem.editorialAlgorithm}
                    </div>
                  </div>
                )}

                {/* Complexity analysis */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-emerald-200/70 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5">
                    <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                      TIME COMPLEXITY
                    </span>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 font-mono mt-1">
                      {problem.timeComplexity || "O(n)"}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {problem.timeComplexity ? `Theoretical upper bound: ${problem.timeComplexity}` : "We traverse the problem space in optimal linear steps."}
                    </p>
                  </div>

                  <div className="rounded-xl border border-indigo-200/70 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 p-3.5">
                    <span className="text-[10px] font-bold text-indigo-800 dark:text-indigo-400 uppercase tracking-wider block">
                      SPACE COMPLEXITY
                    </span>
                    <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300 font-mono mt-1">
                      {problem.spaceComplexity || "O(n)"}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {problem.spaceComplexity ? `Auxiliary memory overhead: ${problem.spaceComplexity}` : "Auxiliary memory required by hash structures or recursion stack."}
                    </p>
                  </div>
                </div>

                {/* Editorial Multi-Language Reference Solutions */}
                <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-[#f8fafc] dark:bg-[#0f131f] p-4 text-slate-900 dark:text-slate-100 font-mono text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-white/10 mb-3 font-sans">
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-0.5">
                      {(["python", "javascript", "typescript", "java", "cpp"] as const).map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => setEditorialLanguage(lang)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            editorialLanguage === lang
                              ? "bg-[#3157e8] text-white shadow-xs"
                              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-white/5"
                          }`}
                        >
                          {lang === "cpp" ? "C++" : lang === "javascript" ? "JavaScript" : lang === "typescript" ? "TypeScript" : lang === "python" ? "Python 3" : "Java"}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setLanguage(editorialLanguage);
                          setCode(editorialCode);
                          toast.success(`Loaded ${editorialLanguage.toUpperCase()} solution into code editor!`);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#3157e8]/10 text-[#3157e8] hover:bg-[#3157e8] hover:text-white transition cursor-pointer"
                        title="Load into code editor"
                      >
                        <Code2 className="h-3.5 w-3.5" />
                        <span>Load in Editor</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(editorialCode);
                          toast.success("Editorial code copied!");
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-200/80 dark:hover:bg-white/10 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                        title="Copy code"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <pre className="overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden leading-relaxed font-mono text-[11px]">
                    <code>{editorialCode}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* ================= TAB 3: SOLUTIONS (COMMUNITY SUBMISSIONS) ================= */}
            {activeTab === "solutions" && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      Community Solutions ({sortedSolutions.length})
                    </h2>
                    <p className="text-xs text-slate-400">
                      Explore accepted solutions submitted by peers, ranked by most upvoted approaches.
                    </p>
                  </div>
                </div>

                {/* Language Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-1">
                  {["All", "Python", "JavaScript", "TypeScript", "Java", "C++"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setSolutionFilter(item)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer shrink-0 ${
                        solutionFilter === item
                          ? "bg-[#3157e8] text-white shadow-xs"
                          : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
                      }`}
                    >
                      {item === "All" ? `All (${communitySolutions.length})` : item}
                    </button>
                  ))}
                </div>

                {/* Solutions List */}
                <div className="space-y-4">
                  {sortedSolutions.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/10 p-8 text-center space-y-2">
                      <Code2 className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {solutionFilter === "All"
                          ? "No community solutions submitted yet."
                          : `No community solutions found for ${solutionFilter}.`}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Be the first to solve this problem in the code editor and share your solution with peers!
                      </p>
                    </div>
                  ) : (
                    sortedSolutions.map((sol) => (
                      <div
                        key={sol.id}
                        className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] p-4 space-y-3.5 shadow-2xs"
                      >
                        {/* Author row */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {sol.avatar ? (
                              <img
                                src={sol.avatar}
                                alt={sol.author}
                                className="h-9 w-9 rounded-full object-cover border border-slate-200 dark:border-white/10 shrink-0"
                              />
                            ) : (
                              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#3157e8] to-indigo-600 text-white font-bold text-xs flex items-center justify-center border border-white/20 shrink-0 shadow-xs">
                                {sol.author.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {sol.author}
                                </p>
                                {sol.submittedAt && (
                                  <span className="text-[10px] text-slate-400 shrink-0">
                                    · {sol.submittedAt}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 mt-0.5">
                                {sol.authorDesignation?.toLowerCase().includes("professional") ? (
                                  <Briefcase className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                ) : (
                                  <GraduationCap className="h-3 w-3 text-[#3157e8] dark:text-[#5d7bff] shrink-0" />
                                )}
                                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 capitalize truncate">
                                  {sol.authorDesignation}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${sol.badgeColor}`}
                            >
                              {sol.language}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleLike(sol.id)}
                              className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer active:scale-95 ${
                                likedSolutions[sol.id]
                                  ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400"
                                  : "border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-white dark:bg-white/5"
                              }`}
                              title={likedSolutions[sol.id] ? "Remove upvote" : "Upvote this solution"}
                            >
                              <ThumbsUp
                                className={`h-3 w-3 transition-transform ${
                                  likedSolutions[sol.id] ? "fill-current scale-110" : ""
                                }`}
                              />
                              <span>{sol.votes}</span>
                            </button>
                          </div>
                        </div>

                        {/* Title & metadata */}
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                          {sol.title}
                        </h4>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-[10px] font-mono text-slate-600 dark:text-slate-300">
                            {sol.complexity}
                          </span>
                          {sol.runtime && (
                            <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 text-[10px] font-mono text-emerald-700 dark:text-emerald-300">
                              {sol.runtime}
                            </span>
                          )}
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
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/5 mb-2 font-sans">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {sol.language} Implementation
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setLanguage(sol.languageKey);
                                  setCode(sol.code);
                                  toast.success(`Loaded ${sol.author}'s ${sol.language} solution into code editor!`);
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#3157e8]/10 text-[#3157e8] hover:bg-[#3157e8] hover:text-white transition cursor-pointer"
                              >
                                <Code2 className="h-3 w-3" />
                                <span>Load in Editor</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(sol.code);
                                  toast.success(`Copied ${sol.author}'s solution!`);
                                }}
                                className="p-1 rounded bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                title="Copy solution"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <pre className="overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden text-[11px] leading-relaxed">
                            <code>{sol.code}</code>
                          </pre>
                        </div>
                      </div>
                    ))
                  )}
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
                                  : sub.status === "Pending Review"
                                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                                  : sub.status === "Needs Improvement"
                                  ? "bg-amber-100/90 text-amber-900 border border-amber-300/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80"
                                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
                              }`}
                            >
                              {sub.status === "Accepted" ? (
                                <CircleCheck className="h-3.5 w-3.5" />
                              ) : sub.status === "Pending Review" ? (
                                <Clock className="h-3.5 w-3.5" />
                              ) : sub.status === "Needs Improvement" ? (
                                <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
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
                          <pre className="overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                            <code>{sub.codeSnippet}</code>
                          </pre>
                        </div>

                        {/* Instructor Feedback Banner for Needs Improvement */}
                        {sub.feedback && (
                          <div className="rounded-xl border border-amber-300/80 dark:border-amber-800/60 bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-50 dark:from-amber-950/50 dark:via-orange-950/20 dark:to-[#17130a] p-3.5 text-xs space-y-1.5 shadow-2xs">
                            <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300 text-xs">
                              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                              <span>Instructor Feedback / Improvement Needed:</span>
                            </div>
                            <p className="text-amber-900/90 dark:text-amber-200/90 font-medium whitespace-pre-line text-[11px] leading-relaxed pl-5.5">
                              {sub.feedback}
                            </p>
                          </div>
                        )}
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
                      Community Discussions ({discussions.filter((d) => {
                        const s = (d.status || "").toLowerCase();
                        return s === "approved" || s === "answered" || s === "open";
                      }).length})
                    </h2>
                    <p className="text-xs text-slate-400">
                      Ask doubts, discuss nuances, and share learning breakthroughs.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPostingDiscussion(!isPostingDiscussion)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#3157e8] hover:bg-[#2648d1] px-3 py-1.5 text-xs font-bold text-white transition cursor-pointer shadow-xs"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>New Topic</span>
                  </button>
                </div>

                {/* Pending review alert for current user's submitted questions */}
                {discussions.some((d) => (d.status || "").toLowerCase().includes("pending")) && (
                  <div className="rounded-xl border border-amber-300/80 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/30 p-3.5 flex items-start gap-3">
                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-0.5">
                      <p className="font-bold text-amber-900 dark:text-amber-300">
                        Discussion Topic Under Review
                      </p>
                      <p className="text-amber-700 dark:text-amber-400 text-[11px]">
                        Your discussion topic was submitted and is pending instructor review. Only you can see it until approved.
                      </p>
                    </div>
                  </div>
                )}

                {/* New discussion form */}
                {isPostingDiscussion && (
                  <form
                    onSubmit={handlePostDiscussion}
                    className="rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/20 dark:bg-indigo-950/30 p-4 space-y-3 animate-in fade-in shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Ask a Question or Share a Thought
                      </h4>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                        Moderated by Instructor
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="Title or summary of your question..."
                      value={newDiscussionTitle}
                      onChange={(e) => setNewDiscussionTitle(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151926] px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                    />
                    <textarea
                      rows={3}
                      placeholder="Explain your thought process, what you tried, or what confused you..."
                      value={newDiscussionBody}
                      onChange={(e) => setNewDiscussionBody(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151926] px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsPostingDiscussion(false)}
                        className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-[#3157e8] text-white text-xs font-bold hover:bg-[#2648d1] cursor-pointer shadow-xs"
                      >
                        Submit for Review
                      </button>
                    </div>
                  </form>
                )}

                {/* Discussions list */}
                <div className="space-y-3">
                  {discussions.map((disc) => {
                    const isPending = (disc.status || "").toLowerCase().includes("pending");
                    const isInstructor = disc.authorRole === "admin" || (disc.authorDesignation || "").toLowerCase().includes("instructor");
                    const isLiked = !!likedDiscussions[disc.id];

                    return (
                      <div
                        key={disc.id}
                        className={cn(
                          "rounded-xl border p-4 space-y-2.5 transition",
                          isPending
                            ? "border-amber-300/80 dark:border-amber-800/60 bg-amber-50/20 dark:bg-amber-950/10"
                            : "border-slate-200/80 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] hover:border-indigo-200 dark:hover:border-indigo-900/50"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0 uppercase">
                              {disc.avatar || disc.authorAvatar ? (
                                <img
                                  src={disc.avatar || disc.authorAvatar}
                                  alt={disc.author}
                                  className="h-full w-full rounded-full object-cover"
                                />
                              ) : (
                                (disc.author || "ST").slice(0, 2)
                              )}
                            </div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {disc.author}
                            </span>
                            {isInstructor && (
                              <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 px-1.5 py-0.2 rounded-md font-semibold border border-indigo-200 dark:border-indigo-800">
                                Instructor
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400">· {disc.timestamp || (disc.createdAt ? new Date(disc.createdAt).toLocaleDateString() : "Recently")}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isPending && (
                              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                                Pending Approval
                              </span>
                            )}
                            {!isPending && (
                              <button
                                type="button"
                                onClick={() => handleToggleLikeDiscussion(disc.id)}
                                className={cn(
                                  "flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border",
                                  isLiked
                                    ? "bg-indigo-50 border-indigo-300 text-indigo-600 dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-indigo-400"
                                    : "border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                                )}
                              >
                                <ThumbsUp className={cn("h-3 w-3", isLiked ? "fill-indigo-600 text-indigo-600 dark:fill-indigo-400" : "")} />
                                <span>{disc.votes || 0}</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {disc.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {disc.content || disc.snippet}
                        </p>

                        {/* Reply list if any */}
                        {Array.isArray(disc.replyList) && disc.replyList.length > 0 && (
                          <div className="pl-3 border-l-2 border-indigo-300 dark:border-indigo-900 space-y-2 pt-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Replies ({disc.replyList.length})
                            </p>
                            {disc.replyList.map((rep) => (
                              <div
                                key={rep.id}
                                className="rounded-lg bg-indigo-50/40 dark:bg-indigo-950/30 p-2.5 border border-indigo-100 dark:border-indigo-900/40 text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between text-[11px]">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-indigo-700 dark:text-indigo-400">
                                      {rep.author}
                                    </span>
                                    {rep.authorRole === "admin" && (
                                      <span className="text-[9px] bg-indigo-200/80 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 px-1.5 py-0.2 rounded font-bold">
                                        Instructor
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-slate-400 text-[10px]">
                                    {rep.createdAt ? new Date(rep.createdAt).toLocaleDateString() : "Recently"}
                                  </span>
                                </div>
                                <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{rep.content}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Inline Student Reply Input */}
                        {replyingToId === disc.id && (
                          <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-white/5 animate-in fade-in">
                            <textarea
                              rows={2}
                              placeholder="Write your reply or followup thought..."
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              className="w-full rounded-lg border border-indigo-200 dark:border-indigo-900 bg-white dark:bg-[#151926] p-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyingToId(null);
                                  setReplyContent("");
                                }}
                                className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSendDiscussionReply(disc.id)}
                                className="px-3 py-1 bg-[#3157e8] text-white rounded-md text-xs font-bold hover:bg-[#2648d1] cursor-pointer shadow-xs"
                              >
                                Post Reply
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 font-medium border-t border-slate-100 dark:border-white/5">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3 text-indigo-500" /> {disc.replyList?.length || disc.replies || 0} replies
                          </span>

                          {!isPending && (
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingToId(replyingToId === disc.id ? null : disc.id);
                                setReplyContent("");
                              }}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                            >
                              <span>{replyingToId === disc.id ? "Cancel Reply" : "Reply to thread"}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {discussions.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/10 p-8 text-center space-y-2">
                      <MessageSquare className="h-8 w-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        No community discussions yet
                      </p>
                      <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                        Be the first to ask a question, share an optimization insight, or discuss problem edge cases!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: CODE VIEWER & TEST RUNNER (6 cols) ================= */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#151926] shadow-sm overflow-hidden min-h-[680px]">
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

          {/* Code Textarea / Viewer */}
          <div className="flex-1 flex flex-col relative bg-[#f8fafc] dark:bg-[#0f131f] p-4 text-slate-900 dark:text-slate-100 font-mono text-xs min-h-[300px]">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="w-full flex-1 min-h-[280px] bg-transparent border-0 text-slate-800 dark:text-slate-100 font-mono text-xs leading-relaxed focus:outline-none resize-none no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            />
          </div>

          {/* Bottom Editor Status Bar */}
          <div className="flex items-center justify-between border-t border-slate-200/80 dark:border-white/5 bg-slate-100/90 dark:bg-[#181d2a] px-4 py-2.5 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
                <Terminal className="h-3.5 w-3.5" />
                <span>{language.toUpperCase()}</span>
              </span>
              <span>{code.split("\n").length} lines</span>
              <span>{code.length} chars</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitCode}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Send className={`h-3 w-3 ${isSubmitting ? "animate-spin" : ""}`} />
                <span>{isSubmitting ? "Submitting..." : "Submit"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
