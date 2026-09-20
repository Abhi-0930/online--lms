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
} from "lucide-react";
import { PracticeProblem } from "@/hooks/useLiveAdminData";
import { cn } from "@/lib/utils";

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

  // Discussion state
  const [newDiscussionOpen, setNewDiscussionOpen] = useState(false);
  const [newDiscussionTitle, setNewDiscussionTitle] = useState("");
  const [newDiscussionBody, setNewDiscussionBody] = useState("");
  const [discussions, setDiscussions] = useState([
    {
      id: "disc-1",
      title: "Why is HashMap required?",
      author: "Abhishek",
      replies: 4,
      status: "Open",
      time: "2 hours ago",
      snippet: "Can we use a sorted two-pointer approach instead of extra memory?",
    },
    {
      id: "disc-2",
      title: "Can we sort the array first?",
      author: "Meera Nair",
      replies: 2,
      status: "Answered",
      time: "1 day ago",
      snippet: "Sorting will lose original indices unless we store index pairs.",
    },
    {
      id: "disc-3",
      title: "What is the best complexity?",
      author: "Rohan Verma",
      replies: 6,
      status: "Open",
      time: "2 days ago",
      snippet: "Optimal is O(n) time and O(n) space using single pass hash map.",
    },
  ]);

  // Submissions state
  const [submissionFilter, setSubmissionFilter] = useState<string>("All");
  const [submissionsList] = useState([
    {
      id: "sub-1",
      student: "Abhishek",
      language: "Python",
      submitted: "15 Sep 2026",
      time: "23 min",
      attempt: "Attempt 2",
      status: "Pending Review",
    },
    {
      id: "sub-2",
      student: "Meera Nair",
      language: "JavaScript",
      submitted: "15 Sep 2026",
      time: "28 min",
      attempt: "Attempt 1",
      status: "Approved",
    },
    {
      id: "sub-3",
      student: "Rohan Verma",
      language: "C++",
      submitted: "14 Sep 2026",
      time: "22 min",
      attempt: "Attempt 2",
      status: "Needs improvement",
    },
    {
      id: "sub-4",
      student: "Ananya Sharma",
      language: "Python",
      submitted: "14 Sep 2026",
      time: "18 min",
      attempt: "Attempt 1",
      status: "Approved",
    },
    {
      id: "sub-5",
      student: "Karthik Iyer",
      language: "Java",
      submitted: "13 Sep 2026",
      time: "31 min",
      attempt: "Attempt 3",
      status: "Pending Review",
    },
  ]);

  // Selected Submission Modal
  const [viewingSubmission, setViewingSubmission] = useState<any | null>(null);

  // Parsing & fallbacks
  const topic = problem.category || "Arrays";
  const difficulty = problem.difficulty || "Easy";
  const isLive = problem.status === "Live";

  // Parse examples if available or use standard default
  const examples = useMemo(() => {
    if (problem.sampleInput && problem.sampleOutput) {
      return [
        {
          id: 1,
          input: problem.sampleInput,
          output: problem.sampleOutput,
          explanation: "The selected values satisfy the problem constraints.",
        },
        {
          id: 2,
          input: "nums = [3, 2, 4], target = 6",
          output: "[1, 2]",
          explanation: "Explanation: The selected values add up to the target.",
        },
      ];
    }
    return [
      {
        id: 1,
        input: "nums = [2, 7, 11, 15], target = 9",
        output: "[0, 1]",
        explanation: "Explanation: The selected values add up to the target.",
      },
      {
        id: 2,
        input: "nums = [3, 2, 4], target = 6",
        output: "[1, 2]",
        explanation: "Explanation: The selected values add up to the target.",
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
      "1 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "Exactly one valid answer exists.",
    ];
  }, [problem.constraints]);

  // Hints
  const hints = useMemo(() => {
    if (problem.hints && problem.hints.length > 0) {
      return problem.hints;
    }
    return [
      "A really brute force way would be to search for all possible pairs of numbers but that would be too slow.",
      "Can you use extra space to keep track of numbers seen so far in O(1) lookup time?",
      "As you iterate through the array, check if target - current_value is already present in the hash map.",
    ];
  }, [problem.hints]);

  // Code solutions
  const editorialCode = useMemo(() => {
    if (problem.starterCode && problem.starterCode[selectedLanguage]) {
      return problem.starterCode[selectedLanguage];
    }
    if (selectedLanguage === "javascript") {
      return `function solve(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`;
    }
    if (selectedLanguage === "cpp") {
      return `#include <vector>
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
};`;
    }
    return `def solve(nums, target):
    seen = {}
    for i, value in enumerate(nums):
        complement = target - value
        if complement in seen:
            return [seen[complement], i]
        seen[value] = i
    return []`;
  }, [problem.starterCode, selectedLanguage]);

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
    return [
      { id: "rel-1", title: "Contains Duplicate", difficulty: "Easy" },
      { id: "rel-2", title: "Best Time to Buy Stock", difficulty: "Easy" },
      { id: "rel-3", title: "Product of Array Except Self", difficulty: "Medium" },
    ];
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

          {/* Tags & Companies pills */}
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

            {/* Topic */}
            <span className="rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-900/50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              {topic}
            </span>

            {/* Interactive Tags */}
            <span className="rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              Hash Map
            </span>
            <span className="rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              Two Pointers
            </span>

            {/* Companies */}
            <span className="rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 px-2.5 py-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              Amazon · Google · Microsoft
            </span>
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
                    <div className="flex items-center gap-2">
                      {["python", "javascript", "cpp"].map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setSelectedLanguage(lang)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition cursor-pointer",
                            selectedLanguage === lang
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                          )}
                        >
                          {lang === "cpp" ? "C++" : lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Use a hash map to store each number's index while scanning the array. For each value, check whether its complement already exists.
                  </p>

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
                        O(n)
                      </p>
                    </div>

                    <div className="rounded-xl border border-indigo-200/70 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 p-3.5">
                      <span className="text-[10px] font-bold text-indigo-800 dark:text-indigo-400 uppercase tracking-wider block">
                        SPACE COMPLEXITY
                      </span>
                      <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300 font-mono mt-1">
                        O(n)
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

                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-white/[0.02]">
                  <span className="text-slate-400 font-medium">Companies asked</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                    Amazon, Google, Microsoft
                  </span>
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
                  alert(`Submission for ${viewingSubmission.student} approved!`);
                  setViewingSubmission(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
              >
                Approve Submission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-2xl space-y-4">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Delete Practice Problem?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">"{problem.title}"</span>? This action cannot be undone and will remove all student submissions and test cases.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDelete) {
                    onDelete(problem.id);
                  }
                  setShowDeleteModal(false);
                  onBack();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer shadow-xs"
              >
                Delete Problem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
