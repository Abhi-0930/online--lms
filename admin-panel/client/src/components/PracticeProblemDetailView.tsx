import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  Edit3,
  Eye,
  Archive,
  X,
  FileText,
  Code2,
  CheckCircle2,
  BarChart2,
  MessageSquare,
  Plus,
  Trash2,
  Copy,
  Check,
  ChevronRight,
  Clock,
  Sparkles,
  TrendingUp,
  Users,
  ChevronDown,
  ChevronUp,
  Terminal,
  Cpu,
  Layers,
  HelpCircle,
  Filter,
  Send,
  UserCheck,
  Flame,
  Tag,
  Building2,
} from "lucide-react";
import { PracticeProblem } from "@/hooks/useLiveAdminData";
import { cn } from "@/lib/utils";
import CustomConfirmDialog from "@/components/CustomConfirmDialog";
import CustomAlertDialog from "@/components/CustomAlertDialog";
import { CompanyLogo } from "@/components/CompanyLogo";

interface PracticeProblemDetailViewProps {
  problem: PracticeProblem;
  onBack: () => void;
  onEdit: (problem: PracticeProblem) => void;
  onToggleStatus?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
  onDuplicate?: (problem: PracticeProblem) => void;
  onPreviewStudent?: (problem: PracticeProblem) => void;
  existingProblems?: PracticeProblem[];
  onSelectProblem?: (problem: PracticeProblem) => void;
}

export default function PracticeProblemDetailView({
  problem,
  onBack,
  onEdit,
  onToggleStatus,
  onDelete,
  onDuplicate,
  onPreviewStudent,
  existingProblems = [],
  onSelectProblem,
}: PracticeProblemDetailViewProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "submissions" | "discussion" | "analytics"
  >("overview");
  const [showHints, setShowHints] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("python");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customAlert, setCustomAlert] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant?: "danger" | "warning" | "info" | "success";
  }>({
    isOpen: false,
    title: "",
    message: "",
    variant: "info",
  });

  // Discussion state
  const [newDiscussionOpen, setNewDiscussionOpen] = useState(false);
  const [newDiscussionTitle, setNewDiscussionTitle] = useState("");
  const [newDiscussionBody, setNewDiscussionBody] = useState("");
  const [discussions, setDiscussions] = useState<Array<{
    id: string;
    title: string;
    author: string;
    replies: number;
    status: string;
    time: string;
    snippet: string;
  }>>([]);

  // Submissions state
  const [submissionFilter, setSubmissionFilter] = useState<string>("All");
  const [submissionsList] = useState<Array<{
    id: string;
    student: string;
    language: string;
    submitted: string;
    time: string;
    attempt: string;
    status: string;
  }>>([]);

  // Selected Submission Modal
  const [viewingSubmission, setViewingSubmission] = useState<any | null>(null);

  // Parsing & fallbacks
  const topic = problem.category || "General";
  const difficulty = problem.difficulty || "Easy";
  const isLive = problem.status === "Live";

  // Helper to extract examples from description if not provided in array
  const parseExamplesFromDesc = (desc?: string) => {
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
          explanation: (explMatch ? explMatch[1] : "").trim() || "Sample test case execution.",
        });
        idx++;
      }
    }
    return results;
  };

  // Parse examples if available
  const examples = useMemo(() => {
    if (Array.isArray(problem.examples) && problem.examples.length > 0) {
      const filtered = problem.examples.filter((ex: any) => ex && (ex.input || ex.output));
      if (filtered.length > 0) {
        return filtered.map((ex: any, idx: number) => ({
          id: ex.id || idx + 1,
          input: ex.input || "N/A",
          output: ex.output || "N/A",
          explanation: ex.explanation || "Sample test case execution.",
        }));
      }
    }
    const fromDesc = parseExamplesFromDesc(problem.description);
    if (fromDesc.length > 0) return fromDesc;

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
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
    ];
  }, [problem.examples, problem.sampleInput, problem.sampleOutput, problem.description, problem.title]);

  // Companies list
  const companiesList = useMemo(() => {
    if (typeof problem.companies === "string" && problem.companies.trim()) {
      const parsed = problem.companies
        .replace(/[\[\]"']/g, "")
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      if (parsed.length > 0) return parsed;
    }
    if (Array.isArray(problem.companies) && (problem.companies as any).length > 0) {
      return problem.companies as any as string[];
    }
    return ["Google", "Meta", "Amazon", "Microsoft", "Adobe"];
  }, [problem.companies]);

  // Tags list
  const tagsList = useMemo(() => {
    if (Array.isArray(problem.tags) && problem.tags.length > 0) {
      return problem.tags.filter(Boolean);
    }
    const set = new Set<string>();
    const cat = problem.category || "General";
    if (cat && cat !== "General") set.add(cat);

    const tLower = (problem.title || "").toLowerCase();
    const cLower = cat.toLowerCase();

    if (tLower.includes("sum") || cLower.includes("hash") || cLower.includes("array")) {
      set.add("Array");
      set.add("Hash Table");
      set.add("Two Pointers");
    } else if (tLower.includes("stack") || cLower.includes("stack") || tLower.includes("parentheses")) {
      set.add("Stack");
      set.add("String");
      set.add("Data Structures");
    } else if (tLower.includes("stock") || cLower.includes("dynamic") || tLower.includes("subarray")) {
      set.add("Array");
      set.add("Dynamic Programming");
      set.add("Greedy");
    } else if (tLower.includes("list") || cLower.includes("linked")) {
      set.add("Linked List");
      set.add("Two Pointers");
      set.add("Recursion");
    } else if (tLower.includes("string") || cLower.includes("window")) {
      set.add("String");
      set.add("Sliding Window");
      set.add("Hash Table");
    } else {
      set.add("Array");
      set.add("Algorithms");
      set.add("Data Structures");
    }
    if (problem.difficulty) set.add(problem.difficulty);
    return Array.from(set);
  }, [problem.tags, problem.category, problem.title, problem.difficulty]);

  // Constraints list
  const constraintsList = useMemo(() => {
    if (problem.constraints) {
      return problem.constraints
        .split("\n")
        .map((c) => c.trim())
        .filter(Boolean);
    }
    return [
      "1 <= n <= 10^5",
      "-10^9 <= element <= 10^9",
      "Optimal time complexity is required.",
    ];
  }, [problem.constraints]);

  // Hints
  const hints = useMemo(() => {
    if (problem.hints && problem.hints.length > 0) {
      return problem.hints;
    }
    return [
      `Analyze the key invariant properties of ${problem.title}.`,
      "Consider using auxiliary data structures to reduce time complexity to linear time.",
      "Pay attention to edge cases like empty inputs or boundary values.",
    ];
  }, [problem.hints, problem.title]);

  // Default code solutions
  const defaultCodes: Record<string, string> = useMemo(() => {
    const fnName = problem.title
      ? problem.title.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, "") || "solve"
      : "solve";
    return {
      python: `class Solution:\n    def ${fnName}(self, *args, **kwargs):\n        # Optimal Python 3 solution for ${problem.title}\n        # Time: ${problem.timeComplexity || "O(n)"} | Space: ${problem.spaceComplexity || "O(n)"}\n        pass\n`,
      javascript: `/**\n * Solution for ${problem.title}\n * Time: ${problem.timeComplexity || "O(n)"} | Space: ${problem.spaceComplexity || "O(n)"}\n */\nfunction ${fnName}(...args) {\n    // Optimal JavaScript solution\n    return [];\n}\n`,
      typescript: `function ${fnName}(...args: any[]): any {\n    // Optimal TypeScript solution for ${problem.title}\n    return [];\n}\n`,
      java: `class Solution {\n    public Object ${fnName}() {\n        // Optimal Java solution for ${problem.title}\n        return null;\n    }\n}\n`,
      cpp: `#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    void ${fnName}() {\n        // Optimal C++ solution for ${problem.title}\n    }\n};\n`,
    };
  }, [problem.title, problem.timeComplexity, problem.spaceComplexity]);

  // Code solutions (prefer referenceSolution, fallback to starterCode, then defaultCodes)
  const editorialCode = useMemo(() => {
    const isValidForLang = (c: string | undefined, lang: string) => {
      if (!c || !c.trim()) return false;
      const t = c.trim();
      if (lang !== "python" && t.startsWith("def ")) return false;
      return true;
    };

    if (isValidForLang(problem.referenceSolution?.[selectedLanguage], selectedLanguage)) {
      return problem.referenceSolution![selectedLanguage];
    }
    if (isValidForLang(problem.starterCode?.[selectedLanguage], selectedLanguage)) {
      return problem.starterCode![selectedLanguage];
    }
    return defaultCodes[selectedLanguage] || defaultCodes.python;
  }, [problem.referenceSolution, problem.starterCode, selectedLanguage, defaultCodes]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(editorialCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleAddDiscussion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscussionTitle.trim()) return;
    const item = {
      id: `disc-${Date.now()}`,
      title: newDiscussionTitle,
      author: "Admin (You)",
      replies: 0,
      status: "Open",
      time: "Just now",
      snippet: newDiscussionBody || "No additional description provided.",
    };
    setDiscussions([item, ...discussions]);
    setNewDiscussionTitle("");
    setNewDiscussionBody("");
    setNewDiscussionOpen(false);
  };

  // Related problems
  const relatedProblems = useMemo(() => {
    if (existingProblems.length > 0) {
      return existingProblems
        .filter((p) => p.id !== problem.id)
        .slice(0, 3);
    }
    return [];
  }, [existingProblems, problem.id]);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-[#121620]/95 backdrop-blur-md px-6 py-3.5 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Practice Problems</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Edit Problem Button */}
          <button
            type="button"
            onClick={() => onEdit(problem)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/5 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 transition cursor-pointer shadow-xs"
          >
            <Edit3 className="h-3.5 w-3.5 text-indigo-500" />
            <span>Edit problem</span>
          </button>

          {/* Preview Student View */}
          <button
            type="button"
            onClick={() => {
              if (onPreviewStudent) {
                onPreviewStudent(problem);
              } else {
                window.open("http://localhost:3000/#practice", "_blank");
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/5 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 transition cursor-pointer shadow-xs"
          >
            <Eye className="h-3.5 w-3.5 text-slate-500" />
            <span>Preview student view</span>
          </button>

          {/* Archive / Toggle Status */}
          <button
            type="button"
            onClick={() => onToggleStatus && onToggleStatus(problem.id)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/5 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 transition cursor-pointer shadow-xs"
            title={isLive ? "Move to Draft / Archive" : "Publish to Live"}
          >
            <Archive className="h-3.5 w-3.5 text-slate-500" />
            <span>{isLive ? "Archive" : "Publish"}</span>
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onBack}
            className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200 transition-colors ml-1 cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* 2. MAIN CONTAINER */}
      <main className="flex-1 mx-auto w-full max-w-[1440px] px-6 py-6 space-y-6">
        {/* Breadcrumbs & Title Section */}
        <div className="space-y-2">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <span
              onClick={onBack}
              className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition"
            >
              Practice Problems
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />
            <span className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition">
              {topic}
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />
            <span className="text-slate-600 dark:text-slate-300 font-semibold truncate max-w-xs">
              {problem.title}
            </span>
          </div>

          {/* Subtitle tag */}
          <p className="text-[10px] font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
            PROBLEM MANAGEMENT
          </p>

          {/* Big Header Title & Status */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {problem.title}
            </h1>

            {isLive ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/50 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Published
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/50 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Draft
              </span>
            )}
          </div>

          {/* Difficulty & Category */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {/* Difficulty */}
            <span
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-bold",
                difficulty === "Easy"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                  : difficulty === "Medium"
                  ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                  : "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
              )}
            >
              {difficulty}
            </span>

            {/* Topic / Category */}
            <span className="rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-900/50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              {topic}
            </span>

            {/* Target Companies */}
            {companiesList.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 ml-1">
                {companiesList.map((comp) => (
                  <span
                    key={comp}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs"
                  >
                    <CompanyLogo name={comp} size="xs" />
                    <span>{comp}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. TOP 5 METRIC STAT CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-4 shadow-2xs">
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              Total views
            </p>
            <p className="text-xl font-bold font-display text-slate-900 dark:text-white mt-1">
              1,248
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-4 shadow-2xs">
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              Attempts
            </p>
            <p className="text-xl font-bold font-display text-slate-900 dark:text-white mt-1">
              856
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-4 shadow-2xs">
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              Submissions
            </p>
            <p className="text-xl font-bold font-display text-slate-900 dark:text-white mt-1">
              {(problem.submissions || 642).toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-4 shadow-2xs">
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              Success rate
            </p>
            <p className="text-xl font-bold font-display text-emerald-600 dark:text-emerald-400 mt-1">
              {problem.acceptance || "74%"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-4 shadow-2xs col-span-2 sm:col-span-1">
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              Average time
            </p>
            <p className="text-xl font-bold font-display text-indigo-600 dark:text-indigo-400 mt-1">
              22 min
            </p>
          </div>
        </div>

        {/* 4. MAIN 2-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* Left Column (8 cols): Main Content with Tabs */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-sm space-y-6">
            {/* Horizontal Subtabs */}
            <div className="flex items-center gap-1 border-b border-slate-100 dark:border-white/5 pb-2">
              {[
                { id: "overview", label: "Overview", icon: FileText },
                { id: "submissions", label: "Submissions", icon: CheckCircle2 },
                { id: "discussion", label: "Discussion", icon: MessageSquare },
                { id: "analytics", label: "Analytics", icon: BarChart2 },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "relative flex items-center gap-2 px-4 py-2 text-xs font-bold transition-colors cursor-pointer",
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                    {isActive && (
                      <span className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-7">
                {/* A. Problem Statement */}
                <div className="space-y-3">
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    Problem Statement
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {problem.description ||
                      "Given an array of integers nums and a target integer, return the indices of the two numbers such that they add up to the target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice."}
                  </p>

                  {/* Input Constraints Container */}
                  <div className="rounded-xl border border-indigo-100 dark:border-indigo-950/80 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 space-y-2 mt-4">
                    <p className="text-[11px] font-bold tracking-wider text-indigo-700 dark:text-indigo-400 uppercase">
                      Input Constraints
                    </p>
                    <ul className="space-y-1.5 text-xs font-mono text-slate-700 dark:text-slate-300">
                      {constraintsList.map((c, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* B. Examples */}
                <div className="space-y-3">
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    Examples
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {examples.map((ex, idx) => (
                      <div
                        key={ex.id || idx}
                        className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] p-4 space-y-2.5"
                      >
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Example {idx + 1}
                        </span>
                        <div className="space-y-1.5 text-xs font-mono">
                          <div>
                            <span className="text-[11px] font-semibold text-slate-400 block font-sans">
                              Input:
                            </span>
                            <span className="text-slate-800 dark:text-slate-200 bg-white dark:bg-black/20 px-2 py-1 rounded border border-slate-200/60 dark:border-white/5 block">
                              {ex.input}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-slate-400 block font-sans">
                              Output:
                            </span>
                            <span className="text-slate-800 dark:text-slate-200 bg-white dark:bg-black/20 px-2 py-1 rounded border border-slate-200/60 dark:border-white/5 block">
                              {ex.output}
                            </span>
                          </div>
                        </div>
                        {ex.explanation && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                            {ex.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* C. Hints Accordion */}
                <div className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                        Hints
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {hints.length} hints available for students
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowHints(!showHints)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      <span>{showHints ? "Hide Hints" : "Show Hints"}</span>
                      {showHints ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  {showHints && (
                    <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-white/5 animate-in fade-in">
                      {hints.map((hint, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 rounded-lg bg-white dark:bg-white/5 p-3 border border-slate-200/60 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300"
                        >
                          <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                            Hint {idx + 1}:
                          </span>
                          <span>{hint}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* D. Editorial Solution */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      Editorial Solution
                    </h2>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { id: "python", label: "Python 3" },
                        { id: "javascript", label: "JavaScript" },
                        { id: "typescript", label: "TypeScript" },
                        { id: "java", label: "Java" },
                        { id: "cpp", label: "C++" },
                      ].map((lang) => (
                        <button
                          key={lang.id}
                          onClick={() => setSelectedLanguage(lang.id)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer",
                            selectedLanguage === lang.id
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                          )}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed">
                    {problem.editorialApproach ||
                      "Use an optimal approach to solve the problem with minimum time and space complexity."}
                  </p>

                  {/* Algorithm Step-by-Step if present */}
                  {problem.editorialAlgorithm && (
                    <div className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] p-4 space-y-2">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Step-by-Step Algorithm
                      </h3>
                      <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-mono text-[11px] bg-white dark:bg-black/20 p-3 rounded-lg border border-slate-200/60 dark:border-white/5">
                        {problem.editorialAlgorithm}
                      </div>
                    </div>
                  )}

                  {/* Dark Code Block */}
                  <div className="relative rounded-xl border border-slate-800 bg-[#0a0d14] p-4 text-slate-200 font-mono text-xs shadow-inner">
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
                      title="Copy code"
                    >
                      {copiedCode ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <pre className="overflow-x-auto custom-scrollbar leading-relaxed">
                      <code>{editorialCode}</code>
                    </pre>
                  </div>

                  {/* Complexity Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="rounded-xl border border-emerald-200/70 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5">
                      <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                        TIME COMPLEXITY
                      </span>
                      <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 font-mono mt-1">
                        {problem.timeComplexity || "O(n)"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-indigo-200/70 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 p-3.5">
                      <span className="text-[10px] font-bold text-indigo-800 dark:text-indigo-400 uppercase tracking-wider block">
                        SPACE COMPLEXITY
                      </span>
                      <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300 font-mono mt-1">
                        {problem.spaceComplexity || "O(n)"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* E. Related Problems */}
                <div className="space-y-3 pt-2">
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    Related Problems
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {relatedProblems.map((rel) => (
                      <div
                        key={rel.id}
                        onClick={() => {
                          if (onSelectProblem && "category" in rel) {
                            onSelectProblem(rel as PracticeProblem);
                          }
                        }}
                        className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] p-3.5 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 hover:border-indigo-200 transition cursor-pointer group"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                            {rel.title}
                          </p>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {rel.difficulty || "Easy"}
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition group-hover:translate-x-0.5" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SUBMISSIONS */}
            {activeTab === "submissions" && (
              <div className="space-y-6">
                {/* 4 Summary Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] p-3.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Total submissions
                    </p>
                    <p className="text-xl font-bold font-display text-slate-900 dark:text-white mt-1">
                      642
                    </p>
                  </div>
                  <div className="rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20 p-3.5">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                      Pending review
                    </p>
                    <p className="text-xl font-bold font-display text-amber-600 dark:text-amber-400 mt-1">
                      86
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20 p-3.5">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                      Approved
                    </p>
                    <p className="text-xl font-bold font-display text-emerald-600 dark:text-emerald-400 mt-1">
                      472
                    </p>
                  </div>
                  <div className="rounded-xl border border-purple-200/60 dark:border-purple-900/40 bg-purple-50/30 dark:bg-purple-950/20 p-3.5">
                    <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                      Needs improvement
                    </p>
                    <p className="text-xl font-bold font-display text-purple-600 dark:text-purple-400 mt-1">
                      84
                    </p>
                  </div>
                </div>

                {/* Submissions Table */}
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-white/5 text-[10px] uppercase tracking-wider text-slate-400">
                        <th className="pb-3 font-semibold">STUDENT</th>
                        <th className="pb-3 font-semibold">LANGUAGE</th>
                        <th className="pb-3 font-semibold">SUBMITTED</th>
                        <th className="pb-3 font-semibold">TIME</th>
                        <th className="pb-3 font-semibold">ATTEMPT</th>
                        <th className="pb-3 font-semibold">STATUS</th>
                        <th className="pb-3 font-semibold text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {submissionsList.map((sub) => (
                        <tr
                          key={sub.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition"
                        >
                          <td className="py-3.5 font-bold text-slate-800 dark:text-slate-200">
                            {sub.student}
                          </td>
                          <td className="py-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                            {sub.language}
                          </td>
                          <td className="py-3.5 text-slate-500 dark:text-slate-400">
                            {sub.submitted}
                          </td>
                          <td className="py-3.5 font-semibold text-slate-700 dark:text-slate-300">
                            {sub.time}
                          </td>
                          <td className="py-3.5 text-slate-500 dark:text-slate-400">
                            {sub.attempt}
                          </td>
                          <td className="py-3.5">
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-0.5 text-[10px] font-bold",
                                sub.status === "Approved"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                                  : sub.status === "Pending Review"
                                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                                  : "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300"
                              )}
                            >
                              {sub.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => setViewingSubmission(sub)}
                              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: DISCUSSION */}
            {activeTab === "discussion" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                  <div>
                    <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      Discussion
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Help students understand the problem without giving away the solution.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewDiscussionOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>New discussion</span>
                  </button>
                </div>

                {/* 3 Metric Cards */}
                <div className="grid grid-cols-3 gap-3.5">
                  <div className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] p-3.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Total discussions
                    </p>
                    <p className="text-xl font-bold font-display text-slate-900 dark:text-white mt-1">
                      {discussions.length}
                    </p>
                  </div>
                  <div className="rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20 p-3.5">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                      Open discussions
                    </p>
                    <p className="text-xl font-bold font-display text-amber-600 dark:text-amber-400 mt-1">
                      {discussions.filter((d) => d.status === "Open").length}
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20 p-3.5">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                      Resolved
                    </p>
                    <p className="text-xl font-bold font-display text-emerald-600 dark:text-emerald-400 mt-1">
                      {discussions.filter((d) => d.status === "Answered").length}
                    </p>
                  </div>
                </div>

                {/* New Discussion Modal / Form */}
                {newDiscussionOpen && (
                  <form
                    onSubmit={handleAddDiscussion}
                    className="rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/20 dark:bg-indigo-950/30 p-4 space-y-3 animate-in fade-in"
                  >
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      Start a new discussion thread
                    </h3>
                    <input
                      type="text"
                      placeholder="Title / Question..."
                      value={newDiscussionTitle}
                      onChange={(e) => setNewDiscussionTitle(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151926] px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <textarea
                      rows={2}
                      placeholder="Details or clarification context..."
                      value={newDiscussionBody}
                      onChange={(e) => setNewDiscussionBody(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151926] px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 custom-scrollbar"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setNewDiscussionOpen(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                      >
                        Post Discussion
                      </button>
                    </div>
                  </form>
                )}

                {/* Discussion Thread Cards */}
                <div className="space-y-3">
                  {discussions.map((disc) => (
                    <div
                      key={disc.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] p-4 hover:border-indigo-200 transition cursor-pointer"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 transition">
                            {disc.title}
                          </p>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {disc.author} · {disc.replies} replies · {disc.time}
                        </p>
                      </div>

                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-bold",
                          disc.status === "Answered"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                            : "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                        )}
                      >
                        {disc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: ANALYTICS */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                {/* 6 Analytics Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  <div className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Total views
                    </p>
                    <p className="text-xl font-bold font-display text-slate-900 dark:text-white mt-1">
                      1,248
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Total attempts
                    </p>
                    <p className="text-xl font-bold font-display text-slate-900 dark:text-white mt-1">
                      856
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Total submissions
                    </p>
                    <p className="text-xl font-bold font-display text-slate-900 dark:text-white mt-1">
                      642
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Success rate
                    </p>
                    <p className="text-xl font-bold font-display text-emerald-600 dark:text-emerald-400 mt-1">
                      74%
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Average time
                    </p>
                    <p className="text-xl font-bold font-display text-indigo-600 dark:text-indigo-400 mt-1">
                      22 min
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Discussion count
                    </p>
                    <p className="text-xl font-bold font-display text-purple-600 dark:text-purple-400 mt-1">
                      24
                    </p>
                  </div>
                </div>

                {/* Attempts Trend Chart Card */}
                <div className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-indigo-600" />
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                        Attempts trend
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-400">Past 10 days</span>
                  </div>

                  {/* Histogram Chart Bars */}
                  <div className="h-36 flex items-end justify-between gap-2.5 pt-4 px-2">
                    {[
                      { day: "Day 1", val: 30, height: "30%" },
                      { day: "Day 2", val: 45, height: "45%" },
                      { day: "Day 3", val: 40, height: "40%" },
                      { day: "Day 4", val: 65, height: "65%" },
                      { day: "Day 5", val: 55, height: "55%" },
                      { day: "Day 6", val: 80, height: "80%" },
                      { day: "Day 7", val: 75, height: "75%" },
                      { day: "Day 8", val: 92, height: "92%" },
                      { day: "Day 9", val: 85, height: "85%" },
                      { day: "Day 10", val: 100, height: "100%" },
                    ].map((bar, i) => (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center gap-1 group relative"
                      >
                        <div
                          style={{ height: bar.height }}
                          className="w-full rounded-t-md bg-indigo-400/80 dark:bg-indigo-500/70 group-hover:bg-indigo-600 transition-all cursor-pointer"
                        />
                        <span className="text-[9px] text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200">
                          {bar.day}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column (4 cols): Problem Summary & Quick Actions */}
          <div className="lg:col-span-4 space-y-6">
            {/* Card 1: Problem Summary */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                  Problem summary
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-white/[0.02]">
                  <span className="text-slate-400 font-medium">Difficulty</span>
                  <span
                    className={cn(
                      "font-bold",
                      difficulty === "Easy"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : difficulty === "Medium"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-rose-600 dark:text-rose-400"
                    )}
                  >
                    {difficulty}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-white/[0.02]">
                  <span className="text-slate-400 font-medium">Topic</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {topic}
                  </span>
                </div>

                <div className="py-2 border-b border-slate-50 dark:border-white/[0.02] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Companies asked</span>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                      {companiesList.length} companies
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {companiesList.map((comp) => (
                      <span
                        key={comp}
                        className="inline-flex items-center gap-1 rounded-md bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200 shadow-2xs"
                      >
                        <CompanyLogo name={comp} size="xs" />
                        <span>{comp}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-white/[0.02]">
                  <span className="text-slate-400 font-medium">Views</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    1,248
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-white/[0.02]">
                  <span className="text-slate-400 font-medium">Attempts</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    856
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-white/[0.02]">
                  <span className="text-slate-400 font-medium">Submissions</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {(problem.submissions || 642).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 font-medium">Success rate</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {problem.acceptance || "74%"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: QUICK ACTIONS */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-sm space-y-3">
              <p className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                QUICK ACTIONS
              </p>

              {/* Edit Problem Button */}
              <button
                type="button"
                onClick={() => onEdit(problem)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition cursor-pointer active:scale-[0.98]"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit problem</span>
              </button>

              {/* View all submissions */}
              <button
                type="button"
                onClick={() => setActiveTab("submissions")}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 transition cursor-pointer shadow-2xs"
              >
                <span>View all submissions</span>
              </button>

              {/* Create similar problem */}
              <button
                type="button"
                onClick={() => {
                  if (onDuplicate) {
                    onDuplicate(problem);
                  } else {
                    onEdit({
                      ...problem,
                      id: undefined as any,
                      title: `${problem.title} (Copy)`,
                      status: "Draft",
                    });
                  }
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 transition cursor-pointer shadow-2xs"
              >
                <span>Create similar problem</span>
              </button>

              {/* Delete problem */}
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200/80 dark:border-rose-950/60 bg-rose-50/50 dark:bg-rose-950/20 px-4 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100/70 transition cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete problem</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* SUBMISSION REVIEW MODAL */}
      {viewingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Submission Details - {viewingSubmission.student}
                </h3>
                <p className="text-xs text-slate-400">
                  {viewingSubmission.language} · {viewingSubmission.attempt} · Time: {viewingSubmission.time}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingSubmission(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Verdict</span>
                <span className="rounded-full bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5">
                  10 / 10 Test Cases Passed
                </span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#0d1117] p-3 text-slate-200 font-mono text-xs">
                <pre className="overflow-x-auto custom-scrollbar">
                  <code>{editorialCode}</code>
                </pre>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setViewingSubmission(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const studentName = viewingSubmission.student;
                  const lang = viewingSubmission.language;
                  setViewingSubmission(null);
                  setCustomAlert({
                    isOpen: true,
                    title: "Submission Approved",
                    message: `Submission by ${studentName} (${lang}) has been successfully approved and recorded in the database.`,
                    variant: "success",
                  });
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer shadow-xs"
              >
                Approve Submission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <CustomConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          if (onDelete) {
            onDelete(problem.id);
          }
          setShowDeleteModal(false);
          onBack();
        }}
        title="Delete Practice Problem?"
        description="Are you sure you want to delete this problem? This action cannot be undone and will permanently remove all student submissions and test cases."
        targetName={problem.title}
        confirmText="Delete problem"
        cancelText="Cancel"
        variant="destructive"
      />

      {/* CUSTOM ALERT DIALOG */}
      <CustomAlertDialog
        isOpen={customAlert.isOpen}
        onClose={() => setCustomAlert((prev) => ({ ...prev, isOpen: false }))}
        title={customAlert.title}
        message={customAlert.message}
        variant={customAlert.variant}
      />
    </div>
  );
}
