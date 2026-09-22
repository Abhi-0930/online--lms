import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  FolderPlus,
  PlayCircle,
  FileText,
  Code2,
  ClipboardCheck,
  FileCheck2,
  FolderArchive,
  Megaphone,
  Check,
  ArrowRight,
  ArrowLeft,
  X,
  Search,
  ChevronDown,
  Upload,
  Sparkles,
} from "lucide-react";
import {
  saveDraft,
  getDraft,
  clearDraft,
  formatTimeAgo,
} from "@/lib/draftManager";

export interface ContentTypeOption {
  id: string;
  title: string;
  description: string;
  tags: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

export interface CreatedContentPayload {
  title: string;
  type: string;
  parent: string;
  description: string;
}

const CONTENT_TYPES: ContentTypeOption[] = [
  {
    id: "course",
    title: "Course",
    description: "Create a new course and curriculum structure.",
    tags: "DSA Placement Program · Full Stack Development",
    icon: BookOpen,
    iconBg: "bg-indigo-50 dark:bg-indigo-950/60",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
  {
    id: "module",
    title: "Module",
    description: "Create a new module inside a course.",
    tags: "Arrays · Strings · Trees · Graphs",
    icon: FolderPlus,
    iconBg: "bg-amber-50 dark:bg-amber-950/60",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "lesson",
    title: "Lesson",
    description: "Create lesson content for students.",
    tags: "Video lesson · Text lesson · External resource",
    icon: PlayCircle,
    iconBg: "bg-emerald-50 dark:bg-emerald-950/60",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "notes_pdf",
    title: "Notes / PDF",
    description: "Upload notes and learning documents.",
    tags: "PDF · DOCX · PPT · ZIP",
    icon: FileText,
    iconBg: "bg-rose-50 dark:bg-rose-950/60",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    id: "practice_problem",
    title: "Practice Problem",
    description: "Create coding practice problems.",
    tags: "Algorithm · Data Structure · Interview Pattern",
    icon: Code2,
    iconBg: "bg-purple-50 dark:bg-purple-950/60",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    id: "assignment",
    title: "Assignment",
    description: "Create student assignments and projects.",
    tags: "Code submission · File upload · GitHub link",
    icon: ClipboardCheck,
    iconBg: "bg-sky-50 dark:bg-sky-950/60",
    iconColor: "text-sky-600 dark:text-sky-400",
  },
  {
    id: "resource",
    title: "Resource",
    description: "Upload reusable learning resources.",
    tags: "Resume template · Roadmap · Cheatsheet",
    icon: FolderArchive,
    iconBg: "bg-teal-50 dark:bg-teal-950/60",
    iconColor: "text-teal-600 dark:text-teal-400",
  },
  {
    id: "announcement",
    title: "Announcement",
    description: "Post platform announcements.",
    tags: "Platform news · Live session · Recording",
    icon: Megaphone,
    iconBg: "bg-pink-50 dark:bg-pink-950/60",
    iconColor: "text-pink-600 dark:text-pink-400",
  },
];

const DEFAULT_COURSES: string[] = [];

export interface RecentContentItem {
  id: string | number;
  title: string;
  type?: string;
  parent?: string;
  detail?: string;
  status?: string;
  updated?: string;
}

export function getContentTypeMeta(type: string = "") {
  const t = type.toLowerCase();
  if (t.includes("module")) {
    return {
      icon: FolderPlus,
      iconBg: "bg-amber-50 dark:bg-amber-950/60",
      iconColor: "text-amber-600 dark:text-amber-400",
    };
  }
  if (t.includes("video") || t.includes("lesson")) {
    return {
      icon: PlayCircle,
      iconBg: "bg-emerald-50 dark:bg-emerald-950/60",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    };
  }
  if (t.includes("pdf") || t.includes("note") || t.includes("worksheet")) {
    return {
      icon: FileText,
      iconBg: "bg-rose-50 dark:bg-rose-950/60",
      iconColor: "text-rose-600 dark:text-rose-400",
    };
  }
  if (t.includes("practice") || t.includes("problem") || t.includes("code")) {
    return {
      icon: Code2,
      iconBg: "bg-purple-50 dark:bg-purple-950/60",
      iconColor: "text-purple-600 dark:text-purple-400",
    };
  }
  if (t.includes("assignment") || t.includes("homework") || t.includes("project") || t.includes("assessment")) {
    return {
      icon: ClipboardCheck,
      iconBg: "bg-sky-50 dark:bg-sky-950/60",
      iconColor: "text-sky-600 dark:text-sky-400",
    };
  }
  if (t.includes("resource") || t.includes("template") || t.includes("cheatsheet") || t.includes("roadmap")) {
    return {
      icon: FolderArchive,
      iconBg: "bg-teal-50 dark:bg-teal-950/60",
      iconColor: "text-teal-600 dark:text-teal-400",
    };
  }
  if (t.includes("announcement")) {
    return {
      icon: Megaphone,
      iconBg: "bg-pink-50 dark:bg-pink-950/60",
      iconColor: "text-pink-600 dark:text-pink-400",
    };
  }
  return {
    icon: BookOpen,
    iconBg: "bg-indigo-50 dark:bg-indigo-950/60",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  };
}

function getTitlePlaceholder(typeId: string): string {
  switch (typeId) {
    case "module":
      return "e.g. Arrays";
    case "lesson":
      return "e.g. Video lesson";
    case "notes_pdf":
      return "e.g. Recursion & Backtracking Worksheet";
    case "practice_problem":
      return "e.g. Binary Search Algorithm";
    case "assignment":
    case "assessment":
      return "e.g. Fullstack JWT Auth Project";
    case "resource":
      return "e.g. Resume Template - FAANG Ready";
    case "announcement":
      return "e.g. Weekly Live Q&A Session";
    default:
      return "e.g. Arrays";
  }
}

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (
    selectedType: string,
    typeInfo: ContentTypeOption,
    details?: CreatedContentPayload
  ) => void;
  onOpenCourseBuilder?: () => void;
  onOpenPracticeProblemBuilder?: () => void;
  availableCourses?: string[];
  recentItems?: RecentContentItem[];
}

export default function AddContentModal({
  isOpen,
  onClose,
  onContinue,
  onOpenCourseBuilder,
  onOpenPracticeProblemBuilder,
  availableCourses = DEFAULT_COURSES,
  recentItems = [],
}: AddContentModalProps) {
  const [step, setStep] = useState<"select_type" | "create_form">("select_type");
  const [selectedType, setSelectedType] = useState<string>("module");
  const [searchQuery, setSearchQuery] = useState("");

  // Step 2 Form States
  const [formTitle, setFormTitle] = useState("");
  const [formContentType, setFormContentType] = useState<string>("module");
  const [formAttachTo, setFormAttachTo] = useState<string>(availableCourses[0] || "General Library");
  const [formDescription, setFormDescription] = useState("");
  const [isRestoredDraft, setIsRestoredDraft] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(null);

  React.useEffect(() => {
    if (availableCourses.length > 0 && (!formAttachTo || formAttachTo === "General Library" || !availableCourses.includes(formAttachTo))) {
      setFormAttachTo(availableCourses[0]);
    }
  }, [availableCourses]);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Restore draft if available when opening modal
  React.useEffect(() => {
    if (isOpen) {
      const draft = getDraft<any>("add_content");
      if (draft?.data && (draft.data.formTitle || draft.data.formDescription || draft.data.step === "create_form")) {
        setStep(draft.data.step || "create_form");
        setSelectedType(draft.data.selectedType || "module");
        setFormContentType(draft.data.formContentType || "module");
        setFormTitle(draft.data.formTitle || "");
        setFormAttachTo(draft.data.formAttachTo || availableCourses[0] || "General Library");
        setFormDescription(draft.data.formDescription || "");
        setUploadedFileName(draft.data.uploadedFileName || "");
        setIsRestoredDraft(true);
        setLastSavedTime(draft.timestamp);
      } else {
        setIsRestoredDraft(false);
        setLastSavedTime(null);
      }
    }
  }, [isOpen]);

  // Auto-save form state to draft
  React.useEffect(() => {
    if (!isOpen) return;
    const hasData = Boolean(formTitle.trim() || formDescription.trim() || uploadedFileName);
    if (!hasData) return;

    const timer = setTimeout(() => {
      saveDraft(
        "add_content",
        {
          step,
          selectedType,
          formContentType,
          formAttachTo,
          formTitle,
          formDescription,
          uploadedFileName,
        },
        { title: formTitle || `New Content Item` }
      );
      setLastSavedTime(Date.now());
    }, 400);

    return () => clearTimeout(timer);
  }, [isOpen, step, selectedType, formContentType, formAttachTo, formTitle, formDescription, uploadedFileName]);

  const handleDiscardDraft = () => {
    clearDraft("add_content");
    setFormTitle("");
    setFormDescription("");
    setUploadedFileName("");
    setIsRestoredDraft(false);
    setLastSavedTime(null);
    setStep("select_type");
  };

  const filteredTypes = useMemo(() => {
    if (!searchQuery.trim()) return CONTENT_TYPES;
    const q = searchQuery.toLowerCase().trim();
    return CONTENT_TYPES.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const currentTypeOption = useMemo(() => {
    return (
      CONTENT_TYPES.find((t) => t.id === (step === "create_form" ? formContentType : selectedType)) ||
      CONTENT_TYPES[0]
    );
  }, [selectedType, formContentType, step]);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep("select_type");
    setFormTitle("");
    setFormDescription("");
    setUploadedFileName("");
    onClose();
  };

  const handleProceedToForm = () => {
    const option = CONTENT_TYPES.find((t) => t.id === selectedType) || CONTENT_TYPES[0];
    if (selectedType === "course" && onOpenCourseBuilder) {
      handleClose();
      onOpenCourseBuilder();
      return;
    }
    if (selectedType === "practice_problem" && onOpenPracticeProblemBuilder) {
      handleClose();
      onOpenPracticeProblemBuilder();
      return;
    }
    setFormContentType(selectedType);
    setFormTitle("");
    setFormDescription("");
    setUploadedFileName("");
    setStep("create_form");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFileName(e.target.files[0].name);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFileName(e.dataTransfer.files[0].name);
    }
  };

  const handleFinalSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    clearDraft("add_content");
    const typeOption = CONTENT_TYPES.find((t) => t.id === formContentType) || currentTypeOption;
    const finalTitle = formTitle.trim() || `${typeOption.title} - ${formAttachTo}`;

    onContinue(formContentType, typeOption, {
      title: finalTitle,
      type: typeOption.title,
      parent: formAttachTo,
      description: formDescription.trim(),
    });

    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
      onClick={handleClose}
    >
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
        <div
          className="relative flex flex-col w-screen max-w-[620px] h-full bg-white dark:bg-[#121620] shadow-2xl border-l border-slate-200/90 dark:border-white/10 transition-transform duration-300 ease-in-out animate-in slide-in-from-right"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 dark:border-white/5 px-6 pt-6 pb-4 shrink-0">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400 mb-1">
                Content Workspace
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {step === "create_form" ? `Create ${currentTypeOption.title}` : "Add Content"}
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {step === "create_form"
                  ? "Add the details and publish when you are ready."
                  : "Select the type of content you want to create."}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200 transition-colors"
              aria-label="Close drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Step 1: Choose Content Type */}
          {step === "select_type" && (
            <>
              {/* Search Bar */}
              <div className="px-6 pt-4 pb-2 shrink-0">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search content type"
                    className="w-full rounded-xl border border-slate-200/90 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] pl-10 pr-9 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#151926] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable Content Body */}
              <div className="flex-1 overflow-y-auto px-6 py-3 space-y-5">
                {/* Section: Choose a content type */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      Choose a content type
                    </h3>
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                      {filteredTypes.length} types
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3.5">
                    Start with a lightweight workflow. You can add learning assets later.
                  </p>

                  {/* Grid of 9 types */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredTypes.map((type) => {
                      const isSelected = selectedType === type.id;
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setSelectedType(type.id)}
                          className={cn(
                            "group relative flex flex-col justify-between p-4 rounded-2xl text-left transition-all",
                            isSelected
                              ? "border-2 border-indigo-600 bg-indigo-50/30 dark:border-indigo-500 dark:bg-indigo-950/20 shadow-sm"
                              : "border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50/50 dark:hover:bg-white/[0.04]"
                          )}
                        >
                          {isSelected && (
                            <div className="absolute top-3.5 right-3.5 h-5 w-5 rounded-full bg-indigo-600 dark:bg-indigo-500 grid place-items-center text-white shadow-sm animate-in zoom-in-75 duration-150">
                              <Check className="h-3 w-3 stroke-[3]" />
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                                  type.iconBg,
                                  type.iconColor
                                )}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                {type.title}
                              </h4>
                            </div>

                            <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                              {type.description}
                            </p>
                          </div>

                          <p className="mt-3 text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate">
                            {type.tags}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {filteredTypes.length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No content types matching &ldquo;{searchQuery}&rdquo;
                    </div>
                  )}
                </div>

                {/* Section: Recently created */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      Recently created
                    </h3>
                    {recentItems.length > 0 && (
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                        {recentItems.length} items
                      </span>
                    )}
                  </div>
                  {recentItems.length > 0 ? (
                    <div className="space-y-2">
                      {recentItems.slice(0, 5).map((item) => {
                        const meta = getContentTypeMeta(item.type || item.detail || "");
                        const Icon = meta.icon;
                        const detailText =
                          item.detail ||
                          `${item.type || "Content"} · ${item.parent ? `${item.parent} · ` : ""}${
                            item.updated || "Recently"
                          }`;
                        const statusText = item.status || "Published";

                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-white dark:bg-white/[0.01] hover:bg-slate-50/60 dark:hover:bg-white/[0.03] transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={cn(
                                  "grid h-8 w-8 shrink-0 place-items-center rounded-xl",
                                  meta.iconBg,
                                  meta.iconColor
                                )}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {item.title}
                                </p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                                  {detailText}
                                </p>
                              </div>
                            </div>
                            <span
                              className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ml-2",
                                statusText === "Published"
                                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                                  : statusText === "Draft"
                                  ? "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/10"
                                  : "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40"
                              )}
                            >
                              {statusText}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-xs text-slate-400">
                      No recently created items yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 px-6 py-4 bg-slate-50/50 dark:bg-white/[0.02] shrink-0">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-xl border border-slate-200/90 dark:border-white/10 px-5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProceedToForm}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 px-6 py-2 text-xs font-bold text-white transition-all shadow-sm active:scale-95"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          )}

          {/* Step 2: Create Details Form */}
          {step === "create_form" && (
            <form onSubmit={handleFinalSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                {/* Restored Draft Alert Banner */}
                {isRestoredDraft && (
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-indigo-200/90 bg-indigo-50/80 dark:border-indigo-900/40 dark:bg-indigo-950/30 px-4 py-2.5 shadow-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        Draft Restored {lastSavedTime && `(${formatTimeAgo(lastSavedTime)})`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleDiscardDraft}
                      className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                    >
                      Start fresh
                    </button>
                  </div>
                )}

                {/* Back to content types selector */}
                <button
                  type="button"
                  onClick={() => setStep("select_type")}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Change content type</span>
                </button>

                {/* Title Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    {currentTypeOption.title} title
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder={getTitlePlaceholder(formContentType)}
                    className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03] px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#151926] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    autoFocus
                  />
                </div>

                {/* Two Column Row: Content type & Attach to */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Content type Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Content type
                    </label>
                    <div className="relative">
                      <select
                        value={formContentType}
                        onChange={(e) => setFormContentType(e.target.value)}
                        className="w-full appearance-none rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03] px-4 py-2.5 pr-9 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:bg-white dark:focus:bg-[#151926] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                      >
                        {CONTENT_TYPES.filter((t) => t.id !== "course").map((t) => (
                          <option
                            key={t.id}
                            value={t.id}
                            className="bg-white dark:bg-[#151926] text-slate-900 dark:text-white"
                          >
                            {t.title}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  {/* Attach to Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Attach to
                    </label>
                    <div className="relative">
                      <select
                        value={formAttachTo}
                        onChange={(e) => setFormAttachTo(e.target.value)}
                        className="w-full appearance-none rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03] px-4 py-2.5 pr-9 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:bg-white dark:focus:bg-[#151926] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                      >
                        {availableCourses.length > 0 ? (
                          availableCourses.map((c) => (
                            <option
                              key={c}
                              value={c}
                              className="bg-white dark:bg-[#151926] text-slate-900 dark:text-white"
                            >
                              {c}
                            </option>
                          ))
                        ) : (
                          <option
                            value="General Library"
                            className="bg-white dark:bg-[#151926] text-slate-900 dark:text-white"
                          >
                            General Library
                          </option>
                        )}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Description Textarea */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Add a short description for learners"
                    className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03] p-4 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#151926] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all min-h-[120px] resize-y"
                  />
                </div>

                {/* Upload or link resource (shown for Lesson and other asset types) */}
                {formContentType !== "module" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Upload or link resource
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      className={cn(
                        "relative flex flex-col items-center justify-center rounded-2xl border p-7 text-center transition-all cursor-pointer",
                        isDragging
                          ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30"
                          : "border-indigo-100/90 dark:border-white/10 bg-indigo-50/20 dark:bg-white/[0.02] hover:border-indigo-300 dark:hover:border-white/20 hover:bg-indigo-50/40"
                      )}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <div className="mb-2 grid h-8 w-8 place-items-center text-indigo-600 dark:text-indigo-400">
                        <Upload className="h-5 w-5 stroke-[2]" />
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {uploadedFileName || "Drop a file or browse"}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                        PDF, DOCX, PPT, ZIP, or external link
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Pinned Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 px-6 py-4 bg-slate-50/50 dark:bg-white/[0.02] shrink-0">
                <button
                  type="button"
                  onClick={() => setStep("select_type")}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 dark:border-white/10 px-5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 px-6 py-2 text-xs font-bold text-white transition-all shadow-sm active:scale-95"
                >
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                  <span>Create {currentTypeOption.title}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
