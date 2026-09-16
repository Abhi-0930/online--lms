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
  X,
  Search,
} from "lucide-react";

export interface ContentTypeOption {
  id: string;
  title: string;
  description: string;
  tags: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
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
    tags: "Two Sum · Binary Search · Merge Intervals",
    icon: Code2,
    iconBg: "bg-purple-50 dark:bg-purple-950/60",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    id: "assignment",
    title: "Assignment",
    description: "Create student assignments.",
    tags: "Code submission · File upload · GitHub link",
    icon: ClipboardCheck,
    iconBg: "bg-orange-50 dark:bg-orange-950/60",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  {
    id: "assessment",
    title: "Assessment",
    description: "Create quizzes and tests.",
    tags: "Quiz · Weekly test · Module test · Mock test",
    icon: FileCheck2,
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
    tags: "New assignment · Live session · Recording",
    icon: Megaphone,
    iconBg: "bg-pink-50 dark:bg-pink-950/60",
    iconColor: "text-pink-600 dark:text-pink-400",
  },
];

const RECENT_ITEMS = [
  {
    id: "rec_1",
    title: "Binary tree traversal challenge",
    detail: "Practice Problem · 2 days ago",
    status: "Published",
    icon: Code2,
    iconBg: "bg-purple-50 dark:bg-purple-950/60",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    id: "rec_2",
    title: "Recursion patterns worksheet",
    detail: "Notes / PDF · Yesterday",
    status: "Published",
    icon: FileText,
    iconBg: "bg-rose-50 dark:bg-rose-950/60",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
];

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (selectedType: string, typeInfo: ContentTypeOption) => void;
  onOpenCourseBuilder?: () => void;
}

export default function AddContentModal({
  isOpen,
  onClose,
  onContinue,
  onOpenCourseBuilder,
}: AddContentModalProps) {
  const [selectedType, setSelectedType] = useState<string>("resource");
  const [searchQuery, setSearchQuery] = useState("");

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

  if (!isOpen) return null;

  const handleContinue = () => {
    const option = CONTENT_TYPES.find((t) => t.id === selectedType) || CONTENT_TYPES[0];
    if (selectedType === "course" && onOpenCourseBuilder) {
      onClose();
      onOpenCourseBuilder();
      return;
    }
    onContinue(selectedType, option);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
      onClick={onClose}
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
                Add Content
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Select the type of content you want to create.
              </p>
            </div>
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200 transition-colors"
              aria-label="Close drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

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
            <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-2.5">
              Recently created
            </h3>
            <div className="space-y-2">
              {RECENT_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-white dark:bg-white/[0.01] hover:bg-slate-50/60 dark:hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-xl",
                        item.iconBg,
                        item.iconColor
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 px-6 py-4 bg-slate-50/50 dark:bg-white/[0.02] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200/90 dark:border-white/10 px-5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 px-6 py-2 text-xs font-bold text-white transition-all shadow-sm active:scale-95"
          >
            <span>Continue</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
);
}
