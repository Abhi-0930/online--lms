import React, { useState, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  ExternalLink,
  FileText,
  Film,
  Link2,
  Lock,
  PlayCircle,
  Plus,
  Radio,
  Save,
  Send,
  Sparkles,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";

export interface RecordingResourceItem {
  id: number;
  name: string;
  size: string;
}

export interface RecordingChapterItem {
  id: number;
  timestamp: string;
  title: string;
}

export interface RecordingData {
  id?: string | number;
  title: string;
  instructor: string;
  recordingType: string;
  description: string;
  course: string;
  module: string;
  topic: string;
  targetCohort: string;
  videoFileName?: string;
  videoFileSize?: string;
  videoUrl?: string;
  date: string;
  duration: string;
  sessionTime: string;
  resources: RecordingResourceItem[];
  chapters: RecordingChapterItem[];
  visibility: string;
  accessType: string;
  allowDownload: boolean;
  showInCurriculum: boolean;
  generateAiNotes: boolean;
  enableComments: boolean;
  status: "Published" | "Draft" | "Processing";
  releaseDate: string;
}

const DEFAULT_COURSES = [
  "DSA Placement Program",
  "DSA Mastery",
  "Fullstack Next.js & GraphQL Masterclass",
  "System Design",
  "Placement Prep",
];

const DEFAULT_MODULES: Record<string, string[]> = {
  "DSA Placement Program": ["Dynamic Programming", "Arrays & Strings", "Trees & Graphs", "Greedy & Backtracking"],
  "DSA Mastery": ["Arrays & Pointers", "Hashing", "Linked Lists", "Stacks & Queues"],
  "Fullstack Next.js & GraphQL Masterclass": ["Server Components", "API Routes & Auth", "Prisma & PostgreSQL"],
  "System Design": ["Scalability & Caching", "Rate Limiting", "Message Queues & Kafka"],
  "Placement Prep": ["Resume & Portfolio", "DSA Mock Screens", "System Design Sprints"],
};

interface CustomDropdownProps {
  value: string;
  onChange: (val: string) => void;
  options: Array<{ value: string; label: string } | string>;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  align?: "left" | "right";
  disabled?: boolean;
}

function CustomDropdown({
  value,
  onChange,
  options,
  placeholder,
  className,
  buttonClassName,
  menuClassName,
  align = "left",
  disabled = false,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
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

  const formattedOptions = useMemo(
    () =>
      options.map((opt) =>
        typeof opt === "string" ? { value: opt, label: opt } : opt
      ),
    [options]
  );

  const selectedOption = formattedOptions.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder || value || "Select...";

  return (
    <div ref={containerRef} className={cn("relative inline-block w-full", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between gap-2.5 hover:bg-slate-100/70 dark:hover:bg-white/5 transition-all cursor-pointer shadow-xs select-none",
          isOpen && "ring-2 ring-indigo-500/20 border-indigo-500 bg-white dark:bg-[#151926] shadow-sm",
          disabled && "opacity-50 cursor-not-allowed",
          buttonClassName
        )}
      >
        <span className="truncate text-left">{displayLabel}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200",
            isOpen && "rotate-180 text-indigo-600 dark:text-indigo-400"
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-1.5 min-w-[180px] w-full max-h-60 overflow-y-auto rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-1.5 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150",
            align === "right" ? "right-0" : "left-0",
            menuClassName
          )}
        >
          {formattedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition cursor-pointer select-none",
                  isSelected
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/5"
                )}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-indigo-400 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/30",
        checked ? "bg-indigo-600 dark:bg-indigo-600" : "bg-slate-300 dark:bg-slate-700",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

function formatDisplayDate(dateStr: string) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    if (parts[0].length === 2 && parts[2].length === 4) {
      const day = parseInt(parts[0], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const year = parts[2];
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
      if (months[monthIdx]) {
        return `${day} ${months[monthIdx]} ${year}`;
      }
    }
  }
  return dateStr;
}

interface UploadRecordingBuilderProps {
  initialData?: Partial<RecordingData>;
  onClose: () => void;
  onSaveDraft: (data: RecordingData) => void;
  onPublish: (data: RecordingData) => void;
  availableCourses?: string[];
}

export function UploadRecordingBuilder({
  initialData,
  onClose,
  onSaveDraft,
  onPublish,
  availableCourses = DEFAULT_COURSES,
}: UploadRecordingBuilderProps) {
  const [data, setData] = useState<RecordingData>({
    title: initialData?.title || "Dynamic Programming Masterclass · Week 4",
    instructor: initialData?.instructor || "Ankit Sharma",
    recordingType: initialData?.recordingType || "Live Session Recording",
    description:
      initialData?.description ||
      "Complete recording of the live interactive session on 1D and 2D dynamic programming, state transition recurrence, and optimal substructure analysis.",
    course: initialData?.course || availableCourses[0] || "DSA Placement Program",
    module: initialData?.module || "Dynamic Programming",
    topic: initialData?.topic || "1D & 2D Memoization Patterns",
    targetCohort: initialData?.targetCohort || "All Enrolled Students",
    videoFileName: initialData?.videoFileName || "DP_Masterclass_Recording_1080p.mp4",
    videoFileSize: initialData?.videoFileSize || "1.42 GB",
    videoUrl: initialData?.videoUrl || "",
    date: initialData?.date || "24-09-2026",
    duration: initialData?.duration || "01:45:00",
    sessionTime: initialData?.sessionTime || "18:00 - 20:00 IST",
    resources: initialData?.resources || [
      { id: 1, name: "Arrays Notes.pdf", size: "2.4 MB" },
      { id: 2, name: "Week 1 Assignment", size: "1.1 MB" },
      { id: 3, name: "Two Sum Practice Problem", size: "45 KB" },
    ],
    chapters: initialData?.chapters || [
      { id: 1, timestamp: "00:00", title: "Introduction & Warm-up" },
      { id: 2, timestamp: "15:30", title: "Top-Down Memoization Table Walkthrough" },
      { id: 3, timestamp: "48:15", title: "Interview Hard DP Problem Analysis" },
    ],
    visibility: initialData?.visibility || "All enrolled students",
    accessType: initialData?.accessType || "Full Access",
    allowDownload: initialData?.allowDownload ?? false,
    showInCurriculum: initialData?.showInCurriculum ?? true,
    generateAiNotes: initialData?.generateAiNotes ?? true,
    enableComments: initialData?.enableComments ?? true,
    status: initialData?.status || "Published",
    releaseDate: initialData?.releaseDate || "24-09-2026",
  });

  const [showAttachModal, setShowAttachModal] = useState(false);
  const [attachSearch, setAttachSearch] = useState("");
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableModules = DEFAULT_MODULES[data.course] || ["Dynamic Programming", "Arrays", "Trees", "Graphs"];

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const sizeStr =
        file.size > 1024 * 1024 * 1024
          ? `${(file.size / (1024 * 1024 * 1024)).toFixed(2)} GB`
          : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      setData((prev) => ({
        ...prev,
        videoFileName: file.name,
        videoFileSize: sizeStr,
      }));
      e.target.value = "";
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const sizeStr =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;

      setData((prev) => ({
        ...prev,
        resources: [
          ...prev.resources,
          { id: Date.now(), name: file.name, size: sizeStr },
        ],
      }));
      e.target.value = "";
    }
  };

  const handleAttachExisting = (item: { name: string; size: string }) => {
    if (!data.resources.some((r) => r.name.toLowerCase() === item.name.toLowerCase())) {
      setData((prev) => ({
        ...prev,
        resources: [
          ...prev.resources,
          { id: Date.now(), name: item.name, size: item.size },
        ],
      }));
    }
    setShowAttachModal(false);
  };

  const handleRemoveResource = (id: number) => {
    setData((prev) => ({
      ...prev,
      resources: prev.resources.filter((r) => r.id !== id),
    }));
  };

  const handleAddChapter = () => {
    const newId = Date.now();
    setData((prev) => ({
      ...prev,
      chapters: [
        ...prev.chapters,
        { id: newId, timestamp: "00:00", title: "New Chapter Segment" },
      ],
    }));
  };

  const handleUpdateChapter = (id: number, field: "timestamp" | "title", val: string) => {
    setData((prev) => ({
      ...prev,
      chapters: prev.chapters.map((ch) => (ch.id === id ? { ...ch, [field]: val } : ch)),
    }));
  };

  const handleRemoveChapter = (id: number) => {
    setData((prev) => ({
      ...prev,
      chapters: prev.chapters.filter((ch) => ch.id !== id),
    }));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 flex flex-col antialiased">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-[#121620]/95 backdrop-blur-md px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to recordings</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onSaveDraft({ ...data, status: "Draft" })}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 transition cursor-pointer shadow-xs"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save draft</span>
          </button>
          <button
            type="button"
            onClick={() => onPublish({ ...data, status: "Published" })}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition cursor-pointer active:scale-95"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Publish recording</span>
          </button>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200 transition-colors ml-1 cursor-pointer"
            aria-label="Close builder"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-[1440px] px-6 py-7">
        {/* Title & Banner */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wider">
            <span>RECORDINGS</span>
            <span>/</span>
            <span className="text-indigo-600 dark:text-indigo-400">UPLOAD RECORDING</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Upload Recording
            </h1>
            <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-900/50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
              Class Archive
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Upload and publish recorded live sessions, masterclasses, or tutorials for your learners.
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          {/* Left Form (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Section 1: Basic Information */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-100/80 dark:border-indigo-900/50 shrink-0">
                  01
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    Basic Information
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Set the recording headline, instructor, and overview summary.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Recording Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={data.title}
                      onChange={(e) => setData({ ...data, title: e.target.value })}
                      placeholder="e.g. Dynamic Programming Masterclass"
                      className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-4 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#151926] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Instructor / Host <span className="text-rose-500">*</span>
                    </label>
                    <CustomDropdown
                      value={data.instructor}
                      onChange={(val) => setData({ ...data, instructor: val })}
                      options={["Ankit Sharma", "Abhishek Kumar", "Siddharth Rao", "Guest Industry Speaker"]}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Recording Type
                  </label>
                  <CustomDropdown
                    value={data.recordingType}
                    onChange={(val) => setData({ ...data, recordingType: val })}
                    options={[
                      "Live Session Recording",
                      "Workshop Recording",
                      "Tutorial / Walkthrough",
                      "Guest Lecture",
                      "Doubt Clearing Archive",
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Description & Overview
                  </label>
                  <textarea
                    rows={3}
                    value={data.description}
                    onChange={(e) => setData({ ...data, description: e.target.value })}
                    placeholder="What is covered in this recording? Key takeaways and concepts."
                    className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-4 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#151926] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Course Mapping */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-100/80 dark:border-indigo-900/50 shrink-0">
                  02
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    Course Mapping
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Link this recording to its curriculum module and student cohort.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Target Course <span className="text-rose-500">*</span>
                  </label>
                  <CustomDropdown
                    value={data.course}
                    onChange={(val) => {
                      const mods = DEFAULT_MODULES[val] || ["General"];
                      setData({ ...data, course: val, module: mods[0] || "" });
                    }}
                    options={availableCourses}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Target Module <span className="text-rose-500">*</span>
                  </label>
                  <CustomDropdown
                    value={data.module}
                    onChange={(val) => setData({ ...data, module: val })}
                    options={availableModules}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Topic / Subtopic
                  </label>
                  <input
                    type="text"
                    value={data.topic}
                    onChange={(e) => setData({ ...data, topic: e.target.value })}
                    placeholder="e.g. 1D & 2D Memoization Patterns"
                    className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Target Cohort / Batch
                  </label>
                  <input
                    type="text"
                    value={data.targetCohort}
                    onChange={(e) => setData({ ...data, targetCohort: e.target.value })}
                    placeholder="e.g. All Enrolled Students"
                    className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Video Source / Upload */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-100/80 dark:border-indigo-900/50 shrink-0">
                  03
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    Video Source
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Upload your high-definition video recording file.
                  </p>
                </div>
              </div>

              {/* Hidden Video Input */}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/mov,video/webm,video/mkv,.mp4,.mov,.webm,.mkv"
                className="hidden"
                onChange={handleVideoUpload}
              />

              <div className="space-y-4">
                {/* Drag and Drop Box */}
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="rounded-3xl border-2 border-dashed border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/20 dark:bg-indigo-950/20 p-8 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/30 transition-all select-none"
                >
                  <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 shadow-xs">
                    <Upload className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Drag and drop your recording here
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports MP4, MOV, WEBM, MKV (Up to 5 GB)
                  </p>
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 text-white px-4 py-2 text-xs font-bold hover:bg-indigo-700 shadow-xs transition"
                  >
                    <Film className="h-3.5 w-3.5" />
                    <span>Browse video file</span>
                  </button>
                </div>

                {/* Uploaded Video File Preview Card */}
                {data.videoFileName && (
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/30">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <PlayCircle className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {data.videoFileName}
                        </p>
                        <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                          {data.videoFileSize} · Ready for transcoding
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setData({ ...data, videoFileName: undefined, videoFileSize: undefined })}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 p-1.5 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Session Details & Timing */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-100/80 dark:border-indigo-900/50 shrink-0">
                  04
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    Session Details & Timing
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Original live broadcast date and calculated playback duration.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Original Live Date <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={data.date}
                      onChange={(e) => setData({ ...data, date: e.target.value })}
                      placeholder="24-09-2026"
                      className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] pl-4 pr-11 py-3 text-xs text-slate-900 dark:text-white focus:outline-none font-medium"
                    />
                    <Calendar className="pointer-events-none absolute right-4 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Playback Duration <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={data.duration}
                      onChange={(e) => setData({ ...data, duration: e.target.value })}
                      placeholder="01:45:00"
                      className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] pl-4 pr-11 py-3 text-xs text-slate-900 dark:text-white focus:outline-none font-medium"
                    />
                    <Clock className="pointer-events-none absolute right-4 h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Attached Resources */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-100/80 dark:border-indigo-900/50 shrink-0">
                    05
                  </div>
                  <div>
                    <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      Attached Resources
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Accompanying notes, assignments, code solutions, and cheat sheets.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAttachModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Resource</span>
                </button>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.docx,.doc,.pptx,.zip,.rar,.txt,.md"
              />

              <div className="space-y-3 pt-1">
                {data.resources.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
                    No resources attached. Click "+ Add Resource" above to attach lecture materials.
                  </div>
                ) : (
                  data.resources.map((res) => (
                    <div
                      key={res.id}
                      className="flex items-center justify-between px-5 py-4 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] shadow-2xs hover:border-slate-300 dark:hover:border-white/20 transition-all"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-4">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100/80 dark:border-indigo-900/50 shrink-0">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {res.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveResource(res.id)}
                        className="text-sm font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:underline transition cursor-pointer shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Section 6: Chapters & Timestamps */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-100/80 dark:border-indigo-900/50 shrink-0">
                    06
                  </div>
                  <div>
                    <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      Chapters & Timestamps
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Enable fast seeking and video index chapters for learners.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddChapter}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Chapter</span>
                </button>
              </div>

              <div className="space-y-3">
                {data.chapters.map((ch, idx) => (
                  <div
                    key={ch.id}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01]"
                  >
                    <span className="text-xs font-bold text-slate-400 w-6 text-center">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={ch.timestamp}
                      onChange={(e) => handleUpdateChapter(ch.id, "timestamp", e.target.value)}
                      placeholder="00:00"
                      className="w-24 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] px-3 py-2 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={ch.title}
                      onChange={(e) => handleUpdateChapter(ch.id, "title", e.target.value)}
                      placeholder="Chapter title"
                      className="flex-1 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] px-3 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveChapter(ch.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                      title="Remove chapter"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 7: Visibility & Access */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-100/80 dark:border-indigo-900/50 shrink-0">
                  07
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    Visibility & Access
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Manage enrollment requirements, downloadable content, and discussion permissions.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Learner Visibility
                  </label>
                  <CustomDropdown
                    value={data.visibility}
                    onChange={(val) => setData({ ...data, visibility: val })}
                    options={["All enrolled students", "Public / Open Preview", "Restricted to Batch"]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Access Permission
                  </label>
                  <CustomDropdown
                    value={data.accessType}
                    onChange={(val) => setData({ ...data, accessType: val })}
                    options={["Full Access", "Course Enrollment Required", "Free Trial Allowed"]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {[
                  { key: "allowDownload", label: "Allow video download", desc: "Permit offline MP4 saving" },
                  { key: "showInCurriculum", label: "Show in curriculum", desc: "List inside course module lessons" },
                  { key: "generateAiNotes", label: "Generate AI notes", desc: "Create transcript & takeaways" },
                  { key: "enableComments", label: "Enable comments & Q&A", desc: "Allow learners to ask questions" },
                ].map((item) => {
                  const val = (data as any)[item.key] as boolean;
                  return (
                    <div
                      key={item.key}
                      onClick={() => setData({ ...data, [item.key]: !val })}
                      className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] flex items-center justify-between cursor-pointer hover:border-slate-300 dark:hover:border-white/20 transition select-none"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</p>
                        <p className="text-[10px] text-slate-400">{item.desc}</p>
                      </div>
                      <ToggleSwitch
                        checked={val}
                        onChange={(checked) => setData({ ...data, [item.key]: checked })}
                        ariaLabel={item.label}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 8: Status Management */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-100/80 dark:border-indigo-900/50 shrink-0">
                  08
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    Status Management
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Control publishing state and release schedule.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Publication Status
                  </label>
                  <CustomDropdown
                    value={data.status}
                    onChange={(val) => setData({ ...data, status: val as any })}
                    options={["Published", "Draft", "Processing"]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Release Date
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={data.releaseDate}
                      onChange={(e) => setData({ ...data, releaseDate: e.target.value })}
                      placeholder="24-09-2026"
                      className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] pl-4 pr-11 py-3 text-xs text-slate-900 dark:text-white focus:outline-none font-medium"
                    />
                    <Calendar className="pointer-events-none absolute right-4 h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="flex items-center justify-between border-t border-slate-200/70 dark:border-white/10 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/5 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onSaveDraft({ ...data, status: "Draft" })}
                  className="rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/5 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition cursor-pointer"
                >
                  Save draft
                </button>
                <button
                  type="button"
                  onClick={() => onPublish({ ...data, status: "Published" })}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition cursor-pointer active:scale-95"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Publish recording</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Summary Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="sticky top-20 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Recording summary
                </h3>
                <span className="text-indigo-600 dark:text-indigo-400">
                  <Film className="h-4 w-4" />
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Recording title</p>
                  <p className="mt-0.5 font-bold text-slate-900 dark:text-white">{data.title || "Untitled Recording"}</p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Instructor / Host</p>
                  <p className="mt-0.5 font-bold text-slate-900 dark:text-white">{data.instructor}</p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Course & Module</p>
                  <p className="mt-0.5 font-bold text-slate-900 dark:text-white">
                    {data.course} · {data.module}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Playback Duration</p>
                  <p className="mt-0.5 font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                    {data.duration}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Recorded Date</p>
                  <p className="mt-0.5 font-bold text-slate-900 dark:text-white">
                    {formatDisplayDate(data.date)}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Video Source</p>
                  <p className="mt-0.5 font-bold text-slate-900 dark:text-white truncate">
                    {data.videoFileName || "No file uploaded"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Resources & Chapters</p>
                  <p className="mt-0.5 font-bold text-slate-900 dark:text-white">
                    {data.resources.length} resources · {data.chapters.length} chapters
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Status</p>
                  <div className="mt-1">
                    <span
                      className={cn(
                        "rounded-md border px-2 py-0.5 text-[10px] font-bold",
                        data.status === "Published"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400"
                      )}
                    >
                      {data.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Readiness Checklist */}
              <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Readiness Checklist
                </p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Title & Instructor</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Video source ready</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Course & Module mapped</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Chapters & timestamps</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Access rules configured</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Attach Existing Resource Modal */}
      {showAttachModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100/80 dark:border-indigo-900/50">
                  <Link2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Attach Resource
                  </h3>
                  <p className="text-xs text-slate-400">
                    Select from library materials, assignments, or previous class notes.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAttachModal(false)}
                className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={attachSearch}
                onChange={(e) => setAttachSearch(e.target.value)}
                placeholder="Search notes, assignments, problems..."
                className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] pl-4 pr-10 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
              {attachSearch && (
                <button
                  type="button"
                  onClick={() => setAttachSearch("")}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {[
                { id: 101, name: "Arrays Notes.pdf", type: "PDF Notes", size: "2.4 MB" },
                { id: 102, name: "Week 1 Assignment", type: "Assignment", size: "1.1 MB" },
                { id: 103, name: "Two Sum Practice Problem", type: "Practice Problem", size: "45 KB" },
                { id: 104, name: "Dynamic Programming CheatSheet.pdf", type: "PDF Notes", size: "3.2 MB" },
                { id: 105, name: "Binary Trees & BST Masterclass.pdf", type: "PDF Notes", size: "4.1 MB" },
                { id: 106, name: "LRU Cache Design Challenge", type: "Practice Problem", size: "68 KB" },
                { id: 107, name: "System Design Sprint Deck.pptx", type: "Presentation", size: "12.8 MB" },
                { id: 108, name: "Graph Traversal Starter Code.zip", type: "Code Archive", size: "5.4 MB" },
              ]
                .filter((item) =>
                  item.name.toLowerCase().includes(attachSearch.toLowerCase()) ||
                  item.type.toLowerCase().includes(attachSearch.toLowerCase())
                )
                .map((item) => {
                  const isAttached = data.resources.some(
                    (r) => r.name.toLowerCase() === item.name.toLowerCase()
                  );
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] hover:border-indigo-300 dark:hover:border-indigo-800 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100/80 dark:border-indigo-900/50 shrink-0">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                              {item.type}
                            </span>
                            <span>•</span>
                            <span>{item.size}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isAttached}
                        onClick={() => handleAttachExisting(item)}
                        className={cn(
                          "rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer shrink-0",
                          isAttached
                            ? "bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500 cursor-not-allowed"
                            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs"
                        )}
                      >
                        {isAttached ? "Attached ✓" : "Attach"}
                      </button>
                    </div>
                  );
                })}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setShowAttachModal(false)}
                className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadRecordingBuilder;
