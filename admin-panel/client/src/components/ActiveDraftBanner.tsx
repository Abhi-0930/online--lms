import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ArrowRight,
  Trash2,
  BookOpen,
  Code2,
  ClipboardCheck,
  Radio,
  Video,
  FileText,
  Clock,
  Layers,
} from "lucide-react";
import {
  DraftType,
  StoredDraft,
  getAllDrafts,
  clearDraft,
  formatTimeAgo,
  DRAFT_LABELS,
  isDraftForSection,
} from "@/lib/draftManager";
import { cn } from "@/lib/utils";

interface ActiveDraftBannerProps {
  currentSection: string;
  onResume: (type: DraftType) => void;
  className?: string;
}

export function getDraftIcon(type: DraftType) {
  switch (type) {
    case "course":
      return BookOpen;
    case "practice_problem":
    case "practice_problem_modal":
      return Code2;
    case "assignment":
      return ClipboardCheck;
    case "schedule_session":
      return Radio;
    case "upload_recording":
      return Video;
    case "add_content":
    default:
      return FileText;
  }
}

export default function ActiveDraftBanner({
  currentSection,
  onResume,
  className,
}: ActiveDraftBannerProps) {
  const [drafts, setDrafts] = useState<StoredDraft[]>(() => getAllDrafts());
  const [selectedType, setSelectedType] = useState<DraftType | null>(null);

  // Synchronize drafts with localStorage changes and custom events
  useEffect(() => {
    const updateDrafts = () => {
      setDrafts(getAllDrafts());
    };

    updateDrafts();
    window.addEventListener("lms:draft-change", updateDrafts);
    window.addEventListener("storage", updateDrafts);

    // Periodic check every 15s to update relative times
    const interval = setInterval(updateDrafts, 15000);

    return () => {
      window.removeEventListener("lms:draft-change", updateDrafts);
      window.removeEventListener("storage", updateDrafts);
      clearInterval(interval);
    };
  }, []);

  if (drafts.length === 0) return null;

  // Find relevant draft for current section, or fallback to first draft or explicitly selected draft
  const matchingSectionDraft = drafts.find((d) => isDraftForSection(d.type, currentSection));

  const activeDraft =
    (selectedType && drafts.find((d) => d.type === selectedType)) ||
    matchingSectionDraft ||
    drafts[0];

  if (!activeDraft) return null;

  const IconComponent = getDraftIcon(activeDraft.type);
  const typeLabel = DRAFT_LABELS[activeDraft.type] || "Application";
  const isSectionDirectMatch = isDraftForSection(activeDraft.type, currentSection);

  const handleDiscard = (type: DraftType, e: React.MouseEvent) => {
    e.stopPropagation();
    clearDraft(type);
    setDrafts(getAllDrafts());
    if (selectedType === type) {
      setSelectedType(null);
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-indigo-200/90 dark:border-indigo-800/40 bg-gradient-to-r from-indigo-50/90 via-violet-50/80 to-purple-50/90 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-[#161329] p-4 sm:p-5 shadow-sm shadow-indigo-100/40 dark:shadow-none transition-all animate-in fade-in-0 slide-in-from-top-2 duration-200",
        className
      )}
    >
      {/* Subtle background glow effect */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-indigo-500/10 blur-2xl" />
      <div className="pointer-events-none absolute -left-12 -bottom-12 h-36 w-36 rounded-full bg-purple-500/10 blur-2xl" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left info area */}
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/25">
            <IconComponent className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#121620]" />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-600/10 dark:bg-indigo-400/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                <Sparkles className="h-2.5 w-2.5" />
                Unsaved Draft
              </span>

              {isSectionDirectMatch && (
                <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                  Current Page
                </span>
              )}

              {activeDraft.step && (
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Step {activeDraft.step}
                </span>
              )}

              <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-400">
                <Clock className="h-3 w-3" />
                Saved {formatTimeAgo(activeDraft.timestamp)}
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              Continue {typeLabel}:{" "}
              <span className="text-indigo-600 dark:text-indigo-300 font-semibold">
                "{activeDraft.title || "Untitled"}"
              </span>
            </h3>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              You have an unfinished {typeLabel.toLowerCase()} in progress. Pick up right where you left off.
            </p>
          </div>
        </div>

        {/* Right CTA buttons */}
        <div className="flex items-center flex-wrap sm:flex-nowrap gap-2.5 shrink-0 self-end lg:self-center">
          <button
            type="button"
            onClick={(e) => handleDiscard(activeDraft.type, e)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-950/30 transition cursor-pointer shadow-xs"
            title="Discard this draft"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Discard</span>
          </button>

          <button
            type="button"
            onClick={() => onResume(activeDraft.type)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/25 transition cursor-pointer active:scale-95"
          >
            <span>Continue filling application</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Multi-draft tabs if more than one draft is present */}
      {drafts.length > 1 && (
        <div className="mt-3.5 pt-3 border-t border-indigo-200/60 dark:border-white/5 flex items-center gap-2 overflow-x-auto [scrollbar-width:none]">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 shrink-0 flex items-center gap-1">
            <Layers className="h-3 w-3" />
            Other drafts:
          </span>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {drafts.map((d) => {
              const isSelected = d.type === activeDraft.type;
              const Icon = getDraftIcon(d.type);
              return (
                <button
                  key={d.type}
                  type="button"
                  onClick={() => setSelectedType(d.type)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer shrink-0",
                    isSelected
                      ? "bg-indigo-600 text-white shadow-xs font-bold"
                      : "bg-white/80 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 border border-slate-200/60 dark:border-white/5"
                  )}
                >
                  <Icon className="h-3 w-3" />
                  <span className="max-w-[120px] truncate">{d.title || DRAFT_LABELS[d.type]}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
