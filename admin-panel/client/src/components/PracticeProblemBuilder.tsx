import React, { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  Copy,
  ExternalLink,
  Eye,
  FileCode2,
  FileText,
  HelpCircle,
  Layers,
  Lightbulb,
  Plus,
  RotateCcw,
  Save,
  Send,
  Sparkles,
  Tag,
  Trash2,
  X,
  Zap,
  Activity,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from "lucide-react";
import { PracticeProblem } from "@/hooks/useLiveAdminData";

export interface ProblemExample {
  id: string;
  input: string;
  output: string;
  explanation: string;
}

export interface ProblemTestCase {
  id: string;
  input: string;
  expectedOutput: string;
}

export interface PracticeProblemBuilderData {
  id?: string | number;
  slug?: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  tags: string[];
  companies: string;
  statement: string;
  constraints: string;
  examples: ProblemExample[];
  hints: string[];
  editorialApproach: string;
  editorialAlgorithm: string;
  timeComplexity: string;
  spaceComplexity: string;
  testCasesList: ProblemTestCase[];
  starterCode: {
    python?: string;
    javascript?: string;
    typescript?: string;
    java?: string;
    cpp?: string;
  };
  referenceSolution: {
    python?: string;
    javascript?: string;
    typescript?: string;
    java?: string;
    cpp?: string;
  };
  estimatedSolveTime: string;
  visibility: "Public" | "Private";
  status: "Draft" | "Live";
  acceptanceRate: string;
  submissionsCount: number;
  likesCount: number;
}

interface PracticeProblemBuilderProps {
  initialData?: Partial<PracticeProblem> | null;
  onClose: () => void;
  onSaveDraft: (data: PracticeProblem) => void | Promise<void>;
  onPublish: (data: PracticeProblem) => void | Promise<void>;
  onDelete?: (id: string | number) => void | Promise<void>;
  existingProblems?: PracticeProblem[];
}

const TOPICS = [
  "Arrays",
  "Strings",
  "Hash Map",
  "Two Pointers",
  "Sliding Window",
  "Stack & Queue",
  "Binary Search",
  "Trees",
  "Binary Search Tree",
  "Graphs",
  "Dynamic Programming",
  "Recursion & Backtracking",
  "Heap / Priority Queue",
  "Greedy",
  "Linked Lists",
  "Math & Geometry",
  "Bit Manipulation",
  "Trie",
  "System Design",
];

const ESTIMATED_TIMES = [
  "10 minutes",
  "15 minutes",
  "20 minutes",
  "30 minutes",
  "45 minutes",
  "60 minutes",
];

const DEFAULT_STARTER_CODES: Record<string, string> = {
  python: `class Solution:
    def solve(self, nums: list[int], target: int) -> list[int]:
        # Write your optimal code here
        pass
`,
  javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function solve(nums, target) {
    // Write your optimal code here
}
`,
  typescript: `function solve(nums: number[], target: number): number[] {
    // Write your optimal code here
    return [];
}
`,
  java: `class Solution {
    public int[] solve(int[] nums, int target) {
        // Write your optimal code here
        return new int[]{};
    }
}
`,
  cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> solve(vector<int>& nums, int target) {
        // Write your optimal code here
        return {};
    }
};
`,
};

const DEFAULT_REFERENCE_SOLUTIONS: Record<string, string> = {
  python: `class Solution:
    def solve(self, nums: list[int], target: int) -> list[int]:
        lookup = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in lookup:
                return [lookup[diff], i]
            lookup[num] = i
        return []
`,
  javascript: `function solve(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}
`,
  typescript: `function solve(nums: number[], target: number): number[] {
    const map = new Map<number, number>();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement)!, i];
        }
        map.set(nums[i], i);
    }
    return [];
}
`,
  java: `import java.util.HashMap;
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
  cpp: `#include <vector>
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
};

export default function PracticeProblemBuilder({
  initialData,
  onClose,
  onSaveDraft,
  onPublish,
  onDelete,
  existingProblems = [],
}: PracticeProblemBuilderProps) {
  const isEditing = Boolean(initialData?.id);

  // Tab State
  const [activeTab, setActiveTab] = useState<
    "statement" | "solutions" | "submissions" | "analytics"
  >("statement");

  // Tag Input State
  const [tagInput, setTagInput] = useState("");

  // Solutions Code Language Tab
  const [codeLanguage, setCodeLanguage] = useState<
    "python" | "javascript" | "typescript" | "java" | "cpp"
  >("python");

  // Code Tab Mode (Starter vs Reference)
  const [codeViewMode, setCodeViewMode] = useState<"starter" | "reference">(
    "starter"
  );

  // Delete Confirm Modal State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Helper to parse existing raw problem description/examples if serialized
  const parsedDefaults = useMemo(() => {
    if (!initialData) {
      return {
        title: "",
        difficulty: "Medium" as const,
        topic: "Arrays",
        tags: ["Array", "Hash Table"],
        companies: "Amazon, Google, Microsoft, Meta",
        statement:
          "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
        constraints:
          "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
        examples: [
          {
            id: "ex-1",
            input: "nums = [2,7,11,15], target = 9",
            output: "[0, 1]",
            explanation:
              "Because nums[0] + nums[1] == 9, we return [0, 1].",
          },
          {
            id: "ex-2",
            input: "nums = [3,2,4], target = 6",
            output: "[1, 2]",
            explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
          },
        ],
        hints: [
          "A really brute force way would be to search for all possible pairs of numbers, but would that be too slow?",
          "Can you use a Hash Map to reduce the lookup time to O(1) by storing elements you have visited?",
        ],
        editorialApproach:
          "Explain the core insights and intuition: We can traverse the array once while storing each number's index in a hash map. For each element, we check if `target - nums[i]` has already been seen.",
        editorialAlgorithm:
          "1. Initialize an empty hash map `lookup` mapping value -> index.\n2. Iterate through `nums` with index `i` and value `x`.\n3. Compute `complement = target - x`.\n4. If `complement` exists in `lookup`, return `[lookup[complement], i]`.\n5. Otherwise, insert `lookup[x] = i`.\n6. Return empty list if no pair is found.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(N)",
        testCasesList: [
          {
            id: "tc-1",
            input: "nums = [2,7,11,15]\ntarget = 9",
            expectedOutput: "[0, 1]",
          },
          {
            id: "tc-2",
            input: "nums = [3,2,4]\ntarget = 6",
            expectedOutput: "[1, 2]",
          },
          {
            id: "tc-3",
            input: "nums = [3,3]\ntarget = 6",
            expectedOutput: "[0, 1]",
          },
        ],
        starterCode: { ...DEFAULT_STARTER_CODES },
        referenceSolution: { ...DEFAULT_REFERENCE_SOLUTIONS },
        estimatedSolveTime: "15 minutes",
        visibility: "Public" as const,
        status: "Draft" as const,
        acceptanceRate: "74.8%",
        submissionsCount: 3420,
        likesCount: 474,
      };
    }

    // Process from initialData
    const hintsList = Array.isArray(initialData.hints) && initialData.hints.length > 0
      ? initialData.hints
      : ["Consider optimal data structures to reduce time complexity."];

    const sampleEx: ProblemExample[] = [
      {
        id: "ex-1",
        input: initialData.sampleInput || "nums = [2,7,11,15], target = 9",
        output: initialData.sampleOutput || "[0, 1]",
        explanation: "nums[0] + nums[1] == 9, so return [0, 1].",
      },
    ];

    return {
      title: initialData.title || "",
      difficulty: (initialData.difficulty || "Medium") as "Easy" | "Medium" | "Hard",
      topic: initialData.category || "Arrays",
      tags: ["Array", "Algorithm", initialData.category || "Arrays"],
      companies: "Amazon, Google, Microsoft, Meta",
      statement:
        initialData.description ||
        "Write a clear description with input/output format and constraints for learners of every proficiency level.",
      constraints:
        initialData.constraints ||
        "1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
      examples: sampleEx,
      hints: hintsList,
      editorialApproach:
        "Optimal one-pass hash map algorithm to check complement indices.",
      editorialAlgorithm:
        "Iterate over input elements and store seen entries in a hash map for O(1) lookup.",
      timeComplexity: "O(N)",
      spaceComplexity: "O(N)",
      testCasesList: [
        {
          id: "tc-1",
          input: initialData.sampleInput || "nums = [2,7,11,15]\ntarget = 9",
          expectedOutput: initialData.sampleOutput || "[0, 1]",
        },
      ],
      starterCode: {
        ...DEFAULT_STARTER_CODES,
        ...(initialData.starterCode || {}),
      },
      referenceSolution: { ...DEFAULT_REFERENCE_SOLUTIONS },
      estimatedSolveTime: "15 minutes",
      visibility: "Public" as const,
      status: (initialData.status === "Live" ? "Live" : "Draft") as "Draft" | "Live",
      acceptanceRate: initialData.acceptance || "74.8%",
      submissionsCount: initialData.submissions || 120,
      likesCount: 54,
    };
  }, [initialData]);

  // Main Form Data State
  const [formData, setFormData] = useState<PracticeProblemBuilderData>(parsedDefaults);

  // Sync state if initialData changes
  useEffect(() => {
    setFormData(parsedDefaults);
  }, [parsedDefaults]);

  // Related Problems in same topic from existing list
  const relatedProblems = useMemo(() => {
    const currentTopic = formData.topic.toLowerCase();
    const matches = existingProblems.filter(
      (p) =>
        String(p.id) !== String(initialData?.id) &&
        (p.category?.toLowerCase() === currentTopic ||
          p.difficulty === formData.difficulty)
    );
    if (matches.length > 0) return matches.slice(0, 4);

    // Fallbacks
    return [
      { id: "rel-1", title: "Contains Duplicate", difficulty: "Easy", category: formData.topic },
      { id: "rel-2", title: "Best Time to Buy and Sell Stock", difficulty: "Easy", category: formData.topic },
      { id: "rel-3", title: "Product of Array Except Self", difficulty: "Medium", category: formData.topic },
      { id: "rel-4", title: "Maximum Subarray", difficulty: "Medium", category: formData.topic },
    ];
  }, [existingProblems, initialData?.id, formData.topic, formData.difficulty]);

  // Tag Handlers
  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  // Example Handlers
  const handleAddExample = () => {
    const newEx: ProblemExample = {
      id: `ex-${Date.now()}`,
      input: "nums = [1, 2, 3], target = 4",
      output: "[0, 2]",
      explanation: "Explanation of why this output is correct.",
    };
    setFormData((prev) => ({
      ...prev,
      examples: [...prev.examples, newEx],
    }));
  };

  const handleUpdateExample = (
    id: string,
    field: keyof ProblemExample,
    val: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      examples: prev.examples.map((ex) =>
        ex.id === id ? { ...ex, [field]: val } : ex
      ),
    }));
  };

  const handleDeleteExample = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      examples: prev.examples.filter((ex) => ex.id !== id),
    }));
  };

  // Hint Handlers
  const handleAddHint = () => {
    setFormData((prev) => ({
      ...prev,
      hints: [...prev.hints, ""],
    }));
  };

  const handleUpdateHint = (idx: number, val: string) => {
    setFormData((prev) => {
      const updated = [...prev.hints];
      updated[idx] = val;
      return { ...prev, hints: updated };
    });
  };

  const handleDeleteHint = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      hints: prev.hints.filter((_, i) => i !== idx),
    }));
  };

  // Test Case Handlers
  const handleAddTestCase = () => {
    const newTc: ProblemTestCase = {
      id: `tc-${Date.now()}`,
      input: "nums = [5, 7, 9], target = 12",
      expectedOutput: "[0, 1]",
    };
    setFormData((prev) => ({
      ...prev,
      testCasesList: [...prev.testCasesList, newTc],
    }));
  };

  const handleUpdateTestCase = (
    id: string,
    field: keyof ProblemTestCase,
    val: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      testCasesList: prev.testCasesList.map((tc) =>
        tc.id === id ? { ...tc, [field]: val } : tc
      ),
    }));
  };

  const handleDeleteTestCase = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      testCasesList: prev.testCasesList.filter((tc) => tc.id !== id),
    }));
  };

  // Build Payload to sync with backend & database
  const buildPayload = (status: "Draft" | "Live"): PracticeProblem => {
    const id = initialData?.id || String(Date.now());
    const primarySampleInput =
      formData.examples[0]?.input || formData.testCasesList[0]?.input || "";
    const primarySampleOutput =
      formData.examples[0]?.output ||
      formData.testCasesList[0]?.expectedOutput ||
      "";

    return {
      id,
      title: formData.title.trim() || "Untitled Practice Problem",
      category: formData.topic || "Arrays",
      difficulty: formData.difficulty,
      acceptance: formData.acceptanceRate || "74.8%",
      submissions: formData.submissionsCount || 0,
      testCases: Math.max(formData.testCasesList.length, 10),
      status,
      description: formData.statement,
      sampleInput: primarySampleInput,
      sampleOutput: primarySampleOutput,
      constraints: formData.constraints,
      hints: formData.hints.filter((h) => h.trim().length > 0),
      starterCode: formData.starterCode,
    };
  };

  const handleSaveDraftAction = async () => {
    setIsSaving(true);
    try {
      const payload = buildPayload("Draft");
      await onSaveDraft(payload);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishAction = async () => {
    setIsSaving(true);
    try {
      const payload = buildPayload("Live");
      await onPublish(payload);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAction = async () => {
    if (initialData?.id && onDelete) {
      await onDelete(initialData.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* 1. TOP STICKY HEADER */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-[#121620]/95 backdrop-blur-md px-6 py-3.5 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Practice Problems</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveDraftAction}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 transition cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5 text-slate-500" />
            <span>{isSaving ? "Saving..." : "Save draft"}</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handlePublishAction}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Publish</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200 transition-colors ml-1 cursor-pointer"
            aria-label="Close builder"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* 2. MAIN BUILDER CONTAINER */}
      <main className="flex-1 mx-auto w-full max-w-[1440px] px-6 py-6 space-y-6">
        {/* Title, Breadcrumb & Subtitle */}
        <div className="space-y-1.5">
          {/* Breadcrumbs & Status Tag */}
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <span className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              Practice Problems
            </span>
            <span>/</span>
            <span className="text-slate-600 dark:text-slate-300">
              {formData.topic || "Arrays"}
            </span>
            <span>/</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">
              {formData.title || (isEditing ? "Edit Problem" : "New Problem")}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isEditing ? "Edit Practice Problem" : "Create Practice Problem"}
            </h1>

            {formData.status === "Live" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE / PUBLISHED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                DRAFT IN PROGRESS
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Build a clean, interview-ready practice problem with test cases, hints, and an editorial solution.
          </p>
        </div>

        {/* 3. HORIZONTAL SUBTABS NAVIGATION */}
        <div className="flex items-center gap-1 border-b border-slate-200/80 dark:border-white/10 pb-px">
          {[
            { id: "statement", label: "Problem statement", icon: FileText },
            { id: "solutions", label: "Solutions", icon: Code2 },
            { id: "submissions", label: "Submissions", icon: CheckCircle2 },
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
                  "relative flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer",
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* 4. TAB 1: PROBLEM STATEMENT (MAIN BUILDER VIEW) */}
        {activeTab === "statement" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
            {/* Left Column (8 cols): Main Form */}
            <div className="lg:col-span-8 space-y-6">
              {/* SECTION A: Problem Details */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-sm space-y-5">
                <div className="border-b border-slate-100 dark:border-white/5 pb-3">
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    Problem details
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Define the core identity, topic categorization, and target difficulty.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Problem Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Problem title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="e.g. Two sum"
                      className="w-full rounded-xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#151926] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium transition"
                    />
                  </div>

                  {/* 2-Column Grid: Difficulty & Topic */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Difficulty Pills */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                        Difficulty <span className="text-rose-500">*</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["Easy", "Medium", "Hard"] as const).map((diff) => {
                          const isSelected = formData.difficulty === diff;
                          const activeStyles =
                            diff === "Easy"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                              : diff === "Medium"
                              ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                              : "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800";

                          return (
                            <button
                              key={diff}
                              type="button"
                              onClick={() =>
                                setFormData({ ...formData, difficulty: diff })
                              }
                              className={cn(
                                "py-2 px-3 rounded-xl text-xs font-bold border transition text-center cursor-pointer",
                                isSelected
                                  ? cn(activeStyles, "shadow-xs")
                                  : "border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                              )}
                            >
                              {diff}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Topic Dropdown */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                        Topic <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={formData.topic}
                          onChange={(e) =>
                            setFormData({ ...formData, topic: e.target.value })
                          }
                          className="w-full appearance-none rounded-xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-4 py-2.5 pr-9 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:bg-white dark:focus:bg-[#151926] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium transition cursor-pointer"
                        >
                          {TOPICS.map((top) => (
                            <option
                              key={top}
                              value={top}
                              className="dark:bg-[#121620]"
                            >
                              {top}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Tags
                    </label>
                    <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] min-h-[46px]">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-900/50 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-rose-500 transition cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        placeholder="Add tag and press Enter"
                        className="flex-1 min-w-[140px] bg-transparent border-0 px-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Companies (Optional) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Companies <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.companies}
                      onChange={(e) =>
                        setFormData({ ...formData, companies: e.target.value })
                      }
                      placeholder="Amazon, Google, Microsoft, Meta"
                      className="w-full rounded-xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#151926] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium transition"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION B: Problem Statement */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-sm space-y-5">
                <div className="border-b border-slate-100 dark:border-white/5 pb-3">
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    Problem statement
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Write a clear description with input/output format and constraints for learners of every proficiency level.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Problem Text */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Problem text <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      value={formData.statement}
                      onChange={(e) =>
                        setFormData({ ...formData, statement: e.target.value })
                      }
                      placeholder="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target..."
                      className="w-full rounded-xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] p-4 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#151926] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono leading-relaxed transition resize-y"
                    />
                  </div>

                  {/* Input & Constraints */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Input &amp; constraints
                    </label>
                    <textarea
                      rows={4}
                      value={formData.constraints}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          constraints: e.target.value,
                        })
                      }
                      placeholder="1 <= nums.length <= 10^4&#10;-10^9 <= nums[i] <= 10^9&#10;Only one valid answer exists."
                      className="w-full rounded-xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] p-4 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#151926] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono leading-relaxed transition resize-y"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION C: Examples */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                  <div>
                    <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      Examples
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Show sample input and output pairs with clear explanations.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddExample}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/40 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add example</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.examples.map((example, idx) => (
                    <div
                      key={example.id}
                      className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] p-4 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Example {idx + 1}
                        </span>
                        {formData.examples.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteExample(example.id)}
                            className="text-slate-400 hover:text-rose-500 p-1 transition cursor-pointer"
                            title="Delete example"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      {/* 2-Col Input / Output */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                            Input
                          </label>
                          <textarea
                            rows={2}
                            value={example.input}
                            onChange={(e) =>
                              handleUpdateExample(
                                example.id,
                                "input",
                                e.target.value
                              )
                            }
                            placeholder="nums = [2,7,11,15], target = 9"
                            className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151926] p-2.5 text-xs text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                            Output
                          </label>
                          <textarea
                            rows={2}
                            value={example.output}
                            onChange={(e) =>
                              handleUpdateExample(
                                example.id,
                                "output",
                                e.target.value
                              )
                            }
                            placeholder="[0, 1]"
                            className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151926] p-2.5 text-xs text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Explanation */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                          Explanation
                        </label>
                        <input
                          type="text"
                          value={example.explanation}
                          onChange={(e) =>
                            handleUpdateExample(
                              example.id,
                              "explanation",
                              e.target.value
                            )
                          }
                          placeholder="nums[0] + nums[1] == 9, so return [0, 1]."
                          className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151926] px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION D: Hints */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                  <div>
                    <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      Hints
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Progressive hints to guide learners step by step when they are stuck.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddHint}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/40 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add hint</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.hints.map((hint, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] p-3"
                    >
                      <span className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                        Hint {idx + 1}:
                      </span>
                      <textarea
                        rows={2}
                        value={hint}
                        onChange={(e) => handleUpdateHint(idx, e.target.value)}
                        placeholder="Describe a hint or intuition trigger..."
                        className="flex-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151926] p-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
                      />
                      {formData.hints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteHint(idx)}
                          className="mt-2 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                          title="Delete hint"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION E: Editorial Solution */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-sm space-y-5">
                <div className="border-b border-slate-100 dark:border-white/5 pb-3">
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    Editorial solution
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Official walkthrough, algorithmic breakdown, and computational complexity.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Approach */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Approach
                    </label>
                    <textarea
                      rows={3}
                      value={formData.editorialApproach}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          editorialApproach: e.target.value,
                        })
                      }
                      placeholder="Explain the core insights and why it works..."
                      className="w-full rounded-xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] p-4 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#151926] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium leading-relaxed transition resize-y"
                    />
                  </div>

                  {/* Algorithm explanation */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Algorithm explanation
                    </label>
                    <textarea
                      rows={3}
                      value={formData.editorialAlgorithm}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          editorialAlgorithm: e.target.value,
                        })
                      }
                      placeholder="Describe the step-by-step logic flow and edge cases..."
                      className="w-full rounded-xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] p-4 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#151926] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium leading-relaxed transition resize-y"
                    />
                  </div>

                  {/* 2-Column Complexity Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {/* Time Complexity */}
                    <div className="rounded-xl border border-emerald-200/70 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 tracking-wider">
                          TIME COMPLEXITY
                        </span>
                      </div>
                      <input
                        type="text"
                        value={formData.timeComplexity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            timeComplexity: e.target.value,
                          })
                        }
                        placeholder="O(N)"
                        className="w-full rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-[#121620] px-3 py-2 text-xs font-mono font-bold text-emerald-900 dark:text-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>

                    {/* Space Complexity */}
                    <div className="rounded-xl border border-purple-200/70 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/20 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 text-[10px] font-bold text-purple-800 dark:text-purple-300 tracking-wider">
                          SPACE COMPLEXITY
                        </span>
                      </div>
                      <input
                        type="text"
                        value={formData.spaceComplexity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            spaceComplexity: e.target.value,
                          })
                        }
                        placeholder="O(N)"
                        className="w-full rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-[#121620] px-3 py-2 text-xs font-mono font-bold text-purple-900 dark:text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION F: Test cases */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                  <div>
                    <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      Test cases
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Automated execution test cases to validate student submissions.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTestCase}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/40 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add test case</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.testCasesList.map((tc, idx) => (
                    <div
                      key={tc.id}
                      className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] p-4 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Test Case {idx + 1}
                        </span>
                        {formData.testCasesList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTestCase(tc.id)}
                            className="text-slate-400 hover:text-rose-500 p-1 transition cursor-pointer"
                            title="Delete test case"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      {/* 2-Col Input / Expected Output */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                            Input
                          </label>
                          <textarea
                            rows={2}
                            value={tc.input}
                            onChange={(e) =>
                              handleUpdateTestCase(
                                tc.id,
                                "input",
                                e.target.value
                              )
                            }
                            placeholder="nums = [3,2,4], target = 6"
                            className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151926] p-2.5 text-xs text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                            Expected output
                          </label>
                          <textarea
                            rows={2}
                            value={tc.expectedOutput}
                            onChange={(e) =>
                              handleUpdateTestCase(
                                tc.id,
                                "expectedOutput",
                                e.target.value
                              )
                            }
                            placeholder="[1, 2]"
                            className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151926] p-2.5 text-xs text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (4 cols): Sticky Sidebar */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
              {/* Problem Summary Card */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Flame className="h-4 w-4 text-amber-500" />
                    <span>Problem summary</span>
                  </h3>
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider",
                      formData.difficulty === "Easy"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                        : formData.difficulty === "Medium"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                        : "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300"
                    )}
                  >
                    {formData.difficulty}
                  </span>
                </div>

                <div className="space-y-3.5">
                  {/* Topic display */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      Topic
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                      {formData.topic}
                    </span>
                  </div>

                  {/* Estimated Solve Time */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Estimated solve time
                    </label>
                    <div className="relative">
                      <select
                        value={formData.estimatedSolveTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            estimatedSolveTime: e.target.value,
                          })
                        }
                        className="w-full appearance-none rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-3.5 py-2 pr-8 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium cursor-pointer"
                      >
                        {ESTIMATED_TIMES.map((time) => (
                          <option
                            key={time}
                            value={time}
                            className="dark:bg-[#121620]"
                          >
                            {time}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </div>

                  {/* Visibility */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Visibility
                    </label>
                    <div className="relative">
                      <select
                        value={formData.visibility}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            visibility: e.target.value as any,
                          })
                        }
                        className="w-full appearance-none rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-3.5 py-2 pr-8 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium cursor-pointer"
                      >
                        <option value="Public" className="dark:bg-[#121620]">
                          Public
                        </option>
                        <option value="Private" className="dark:bg-[#121620]">
                          Private / Cohort Only
                        </option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </div>

                  {/* Stats Strip */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-white/5 text-center">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                      <p className="text-[10px] text-slate-400 font-medium">
                        Solve rate
                      </p>
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {formData.acceptanceRate}
                      </p>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                      <p className="text-[10px] text-slate-400 font-medium">
                        Submissions
                      </p>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {formData.submissionsCount > 1000
                          ? `${(formData.submissionsCount / 1000).toFixed(1)}K`
                          : formData.submissionsCount}
                      </p>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                      <p className="text-[10px] text-slate-400 font-medium">
                        Likes
                      </p>
                      <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                        {formData.likesCount}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RELATED PROBLEMS Card */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2.5">
                  <h3 className="font-display text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    RELATED PROBLEMS
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {relatedProblems.length} in topic
                  </span>
                </div>

                <div className="space-y-2">
                  {relatedProblems.map((prob) => (
                    <div
                      key={prob.id}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition border border-transparent hover:border-slate-200/60 dark:hover:border-white/5 group cursor-pointer"
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                          {prob.title}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {prob.category || formData.topic}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded",
                          prob.difficulty === "Easy"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : prob.difficulty === "Medium"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                        )}
                      >
                        {prob.difficulty}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger Zone: Delete Problem */}
              {isEditing && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 px-4 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete problem</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. TAB 2: SOLUTIONS (STARTER CODE & REFERENCE IMPLEMENTATION) */}
        {activeTab === "solutions" && (
          <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-4">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Multi-Language Solutions &amp; Boilerplate
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure the default skeleton starter code students see and provide official reference implementations.
                </p>
              </div>

              {/* Mode Switcher (Starter vs Reference) */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setCodeViewMode("starter")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer",
                    codeViewMode === "starter"
                      ? "bg-white dark:bg-[#151926] text-indigo-600 dark:text-indigo-400 shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  Starter Code
                </button>
                <button
                  type="button"
                  onClick={() => setCodeViewMode("reference")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer",
                    codeViewMode === "reference"
                      ? "bg-white dark:bg-[#151926] text-indigo-600 dark:text-indigo-400 shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  Reference Solution
                </button>
              </div>
            </div>

            {/* Language Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: "python", label: "Python (3.x)" },
                { id: "javascript", label: "JavaScript (Node 18+)" },
                { id: "typescript", label: "TypeScript" },
                { id: "java", label: "Java (OpenJDK 17)" },
                { id: "cpp", label: "C++ (GCC 11)" },
              ].map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setCodeLanguage(lang.id as any)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer whitespace-nowrap",
                    codeLanguage === lang.id
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-700"
                      : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                  )}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Code Area */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono text-[11px] font-semibold">
                  {codeViewMode === "starter"
                    ? `// Starter code for ${codeLanguage}`
                    : `// Reference solution for ${codeLanguage}`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (codeViewMode === "starter") {
                      setFormData((prev) => ({
                        ...prev,
                        starterCode: {
                          ...prev.starterCode,
                          [codeLanguage]: DEFAULT_STARTER_CODES[codeLanguage],
                        },
                      }));
                    } else {
                      setFormData((prev) => ({
                        ...prev,
                        referenceSolution: {
                          ...prev.referenceSolution,
                          [codeLanguage]: DEFAULT_REFERENCE_SOLUTIONS[codeLanguage],
                        },
                      }));
                    }
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset to default template</span>
                </button>
              </div>

              <div className="relative rounded-2xl border border-slate-800 bg-[#0d1117] p-4 text-slate-200 font-mono text-xs">
                <textarea
                  rows={14}
                  value={
                    codeViewMode === "starter"
                      ? formData.starterCode[codeLanguage] || ""
                      : formData.referenceSolution[codeLanguage] || ""
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (codeViewMode === "starter") {
                      setFormData((prev) => ({
                        ...prev,
                        starterCode: {
                          ...prev.starterCode,
                          [codeLanguage]: val,
                        },
                      }));
                    } else {
                      setFormData((prev) => ({
                        ...prev,
                        referenceSolution: {
                          ...prev.referenceSolution,
                          [codeLanguage]: val,
                        },
                      }));
                    }
                  }}
                  className="w-full bg-transparent border-0 text-slate-100 font-mono text-xs leading-relaxed focus:outline-none resize-y"
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        )}

        {/* 6. TAB 3: SUBMISSIONS */}
        {activeTab === "submissions" && (
          <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 dark:border-white/5 pb-3">
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Live Submissions
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time stream of learner attempts, execution runtimes, and verdict status.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5 text-[11px] uppercase tracking-wider text-slate-400">
                    <th className="pb-3 font-semibold">User</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Language</th>
                    <th className="pb-3 font-semibold">Runtime</th>
                    <th className="pb-3 font-semibold">Memory</th>
                    <th className="pb-3 font-semibold text-right">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {[
                    {
                      user: "Alex Rivera",
                      status: "Accepted",
                      lang: "Python",
                      time: "42 ms",
                      mem: "16.2 MB",
                      submitted: "2 mins ago",
                    },
                    {
                      user: "Sarah Jenkins",
                      status: "Accepted",
                      lang: "C++",
                      time: "4 ms",
                      mem: "9.8 MB",
                      submitted: "14 mins ago",
                    },
                    {
                      user: "Devon Miles",
                      status: "Wrong Answer",
                      lang: "JavaScript",
                      time: "68 ms",
                      mem: "44.1 MB",
                      submitted: "1 hour ago",
                    },
                    {
                      user: "Elena Rostova",
                      status: "Time Limit Exceeded",
                      lang: "Java",
                      time: "> 2000 ms",
                      mem: "52.3 MB",
                      submitted: "3 hours ago",
                    },
                  ].map((sub, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                      <td className="py-3 font-bold text-slate-800 dark:text-slate-200">
                        {sub.user}
                      </td>
                      <td className="py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                            sub.status === "Accepted"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                              : sub.status === "Wrong Answer"
                              ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                          )}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-slate-600 dark:text-slate-400">
                        {sub.lang}
                      </td>
                      <td className="py-3 font-mono text-slate-600 dark:text-slate-400">
                        {sub.time}
                      </td>
                      <td className="py-3 font-mono text-slate-600 dark:text-slate-400">
                        {sub.mem}
                      </td>
                      <td className="py-3 text-right text-slate-400">
                        {sub.submitted}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. TAB 4: ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-5 shadow-sm space-y-2">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Overall Solve Rate
              </p>
              <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {formData.acceptanceRate}
              </p>
              <p className="text-[11px] text-slate-500">
                Based on {formData.submissionsCount} verified submissions
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-5 shadow-sm space-y-2">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Avg. Solution Time
              </p>
              <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                12m 40s
              </p>
              <p className="text-[11px] text-slate-500">
                Estimated target: {formData.estimatedSolveTime}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-5 shadow-sm space-y-2">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Popular Language
              </p>
              <p className="text-3xl font-extrabold text-slate-800 dark:text-white">
                Python 3
              </p>
              <p className="text-[11px] text-slate-500">
                54% of all submissions
              </p>
            </div>
          </div>
        )}
      </main>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-900/50">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Delete Practice Problem?
                </h3>
                <p className="text-xs text-slate-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong>"{formData.title || "this problem"}"</strong>? It will be removed from the database and student practice lists.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAction}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/20 transition cursor-pointer"
              >
                Yes, delete problem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
