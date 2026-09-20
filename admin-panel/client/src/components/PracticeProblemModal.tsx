import React, { useState, useEffect } from "react";
import { X, Code2, Sparkles, CheckCircle2, AlertCircle, Plus, Trash2 } from "lucide-react";
import { PracticeProblem } from "../hooks/useLiveAdminData";

interface PracticeProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  problemToEdit?: PracticeProblem | null;
  onSave: (problem: PracticeProblem) => void;
  onToast: (message: string) => void;
}

const TOPIC_SUGGESTIONS = [
  "Arrays",
  "Strings",
  "Sliding Window",
  "Two Pointers",
  "Stack",
  "Queue",
  "Trees",
  "Binary Search Tree",
  "Graphs",
  "Dynamic Programming",
  "Recursion & Backtracking",
  "Heap / Priority Queue",
  "Greedy",
  "Trie",
  "Bit Manipulation",
  "Math & Geometry",
];

export default function PracticeProblemModal({
  isOpen,
  onClose,
  problemToEdit,
  onSave,
  onToast,
}: PracticeProblemModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Arrays");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [status, setStatus] = useState<"Live" | "Draft">("Live");
  const [testCases, setTestCases] = useState<number>(0);
  const [acceptance, setAcceptance] = useState<string>("0.0%");
  const [description, setDescription] = useState("");
  const [sampleInput, setSampleInput] = useState("");
  const [sampleOutput, setSampleOutput] = useState("");
  const [constraints, setConstraints] = useState("");
  const [hints, setHints] = useState<string[]>([""]);
  const [activeTab, setActiveTab] = useState<"details" | "code" | "hints">("details");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [jsStarter, setJsStarter] = useState("");
  const [pyStarter, setPyStarter] = useState("");
  const [cppStarter, setCppStarter] = useState("");

  useEffect(() => {
    if (problemToEdit) {
      setTitle(problemToEdit.title || "");
      setCategory(problemToEdit.category || "Arrays");
      setDifficulty(problemToEdit.difficulty || "Medium");
      setStatus(problemToEdit.status || "Live");
      setTestCases(problemToEdit.testCases || 0);
      setAcceptance(problemToEdit.acceptance || "0.0%");
      setDescription(problemToEdit.description || "");
      setSampleInput(problemToEdit.sampleInput || "");
      setSampleOutput(problemToEdit.sampleOutput || "");
      setConstraints(problemToEdit.constraints || "");
      setHints(
        Array.isArray(problemToEdit.hints) && problemToEdit.hints.length > 0
          ? problemToEdit.hints
          : [""]
      );
      setJsStarter(problemToEdit.starterCode?.javascript || "");
      setPyStarter(problemToEdit.starterCode?.python || "");
      setCppStarter(problemToEdit.starterCode?.cpp || "");
    } else {
      setTitle("");
      setCategory("Arrays");
      setDifficulty("Medium");
      setStatus("Live");
      setTestCases(0);
      setAcceptance("0.0%");
      setDescription("");
      setSampleInput("");
      setSampleOutput("");
      setConstraints("");
      setHints([""]);
      setJsStarter("");
      setPyStarter("");
      setCppStarter("");
    }
  }, [problemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddHint = () => {
    setHints([...hints, ""]);
  };

  const handleRemoveHint = (index: number) => {
    const updated = hints.filter((_, i) => i !== index);
    setHints(updated.length > 0 ? updated : [""]);
  };

  const handleHintChange = (index: number, val: string) => {
    const updated = [...hints];
    updated[index] = val;
    setHints(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      onToast("Please enter a problem title");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      id: problemToEdit?.id,
      title: title.trim(),
      category: category.trim() || "Arrays",
      difficulty,
      status,
      testCases: Number(testCases) || 10,
      acceptance: acceptance.trim() || "75.0%",
      description: description.trim(),
      sampleInput: sampleInput.trim(),
      sampleOutput: sampleOutput.trim(),
      constraints: constraints.trim(),
      hints: hints.filter((h) => h.trim().length > 0),
      starterCode: {
        javascript: jsStarter.trim(),
        python: pyStarter.trim(),
        cpp: cppStarter.trim(),
      },
    };

    try {
      const url = problemToEdit?.id
        ? `http://localhost:4000/api/v1/admin/practice-problems/${problemToEdit.id}`
        : `http://localhost:4000/api/v1/admin/practice-problems`;
      const method = problemToEdit?.id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved = await res.json();
        onSave(saved);
        onToast(
          problemToEdit ? `Problem "${title}" updated!` : `Problem "${title}" published live!`
        );
        onClose();
      } else {
        // Fallback save in local state
        const fallbackId = problemToEdit?.id || `prob-${Date.now()}`;
        const fallbackProblem: PracticeProblem = {
          ...payload,
          id: fallbackId,
          submissions: problemToEdit?.submissions || 0,
        };
        onSave(fallbackProblem);
        onToast(`Saved locally: "${title}"`);
        onClose();
      }
    } catch {
      const fallbackId = problemToEdit?.id || `prob-${Date.now()}`;
      const fallbackProblem: PracticeProblem = {
        ...payload,
        id: fallbackId,
        submissions: problemToEdit?.submissions || 0,
      };
      onSave(fallbackProblem);
      onToast(`Saved problem: "${title}"`);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl my-8 rounded-3xl bg-white dark:bg-[#121620] shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 px-6 py-4 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 shadow-xs">
              <Code2 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                {problemToEdit ? "Edit Practice Problem" : "Create Practice Problem"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {problemToEdit
                  ? "Update problem description, test cases, and difficulty parameters."
                  : "Add a real coding challenge to the platform practice arena."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 dark:border-white/10 bg-white dark:bg-[#121620]">
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "details"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Problem Details & Statement
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "code"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Starter Code Boilerplates
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("hints")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "hints"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Hints & Solutions ({hints.filter((h) => h.trim()).length})
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === "details" && (
            <>
              {/* Problem Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Problem Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Subarray Sum Equals K & Prefix Map"
                  className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-4 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#151926] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-semibold"
                />
              </div>

              {/* Category, Difficulty, Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Category / Topic
                  </label>
                  <input
                    type="text"
                    list="topic-suggestions"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Arrays, Trees"
                    className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                  />
                  <datalist id="topic-suggestions">
                    {TOPIC_SUGGESTIONS.map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                    {(["Easy", "Medium", "Hard"] as const).map((d) => (
                      <button
                        type="button"
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`py-1.5 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                          difficulty === d
                            ? d === "Easy"
                              ? "bg-emerald-500 text-white shadow-xs"
                              : d === "Medium"
                              ? "bg-amber-500 text-white shadow-xs"
                              : "bg-rose-500 text-white shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Publish Status
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                    {(["Live", "Draft"] as const).map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setStatus(s)}
                        className={`py-1.5 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                          status === s
                            ? s === "Live"
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "bg-slate-600 text-white shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Test Cases and Acceptance Rate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Hidden Test Cases Count
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={testCases}
                    onChange={(e) => setTestCases(Number(e.target.value))}
                    className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Estimated Acceptance Rate
                  </label>
                  <input
                    type="text"
                    value={acceptance}
                    onChange={(e) => setAcceptance(e.target.value)}
                    placeholder="e.g. 78.5%"
                    className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none font-semibold"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Problem Description & Instructions (Markdown supported)
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the problem, input format, return format, and examples..."
                  className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] p-4 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#151926] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono leading-relaxed"
                />
              </div>

              {/* Sample Input & Output */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Sample Input
                  </label>
                  <textarea
                    rows={3}
                    value={sampleInput}
                    onChange={(e) => setSampleInput(e.target.value)}
                    placeholder="e.g. nums = [1,1,1], k = 2"
                    className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] p-3 text-xs text-slate-900 dark:text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Sample Output
                  </label>
                  <textarea
                    rows={3}
                    value={sampleOutput}
                    onChange={(e) => setSampleOutput(e.target.value)}
                    placeholder="e.g. 2"
                    className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] p-3 text-xs text-slate-900 dark:text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Constraints */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Constraints & Bounds
                </label>
                <textarea
                  rows={2}
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  placeholder="e.g. 1 <= nums.length <= 2 * 10^4&#10;-1000 <= nums[i] <= 1000"
                  className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] p-3 text-xs text-slate-900 dark:text-white font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </>
          )}

          {activeTab === "code" && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    JavaScript / TypeScript Starter Code
                  </label>
                  <span className="text-[10px] text-slate-400">Node.js ES6</span>
                </div>
                <textarea
                  rows={4}
                  value={jsStarter}
                  onChange={(e) => setJsStarter(e.target.value)}
                  placeholder="function solution(nums, target) {&#10;  // Write your code here&#10;}"
                  className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-900 text-emerald-400 p-4 text-xs font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Python Starter Code
                  </label>
                  <span className="text-[10px] text-slate-400">Python 3.11</span>
                </div>
                <textarea
                  rows={4}
                  value={pyStarter}
                  onChange={(e) => setPyStarter(e.target.value)}
                  placeholder="def solution(nums: list[int], target: int) -> int:&#10;    # Write your code here&#10;    pass"
                  className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-900 text-emerald-400 p-4 text-xs font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    C++ Starter Code
                  </label>
                  <span className="text-[10px] text-slate-400">C++20</span>
                </div>
                <textarea
                  rows={4}
                  value={cppStarter}
                  onChange={(e) => setCppStarter(e.target.value)}
                  placeholder="class Solution {&#10;public:&#10;    int solve(vector<int>& nums, int target) {&#10;        &#10;    }&#10;};"
                  className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-900 text-emerald-400 p-4 text-xs font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {activeTab === "hints" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Progressive Student Hints
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Hints will be unlocked step-by-step for learners during practice.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddHint}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 text-xs font-bold hover:bg-indigo-100 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Hint
                </button>
              </div>

              {hints.map((hint, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="mt-2.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-slate-100 dark:bg-white/5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={hint}
                    onChange={(e) => handleHintChange(idx, e.target.value)}
                    placeholder={`Hint ${idx + 1}: e.g. Think about storing running sums in a map...`}
                    className="flex-1 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                  />
                  {hints.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveHint(idx)}
                      className="mt-1.5 p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200/90 dark:border-white/10 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{isSubmitting ? "Saving..." : problemToEdit ? "Update Problem" : "Publish Problem"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
