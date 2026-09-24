import React, { useState, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  HelpCircle,
  Link2,
  Lock,
  Plus,
  Radio,
  Save,
  Send,
  Loader2,
  Sparkles,
  Trash2,
  Upload,
  Users,
  Video,
  X,
  BookOpen,
  Code,
  FileCode,
  FolderArchive,
  Globe,
  Search,
  CheckCircle2,
  AlertCircle,
  Layers,
  FileCheck,
} from "lucide-react";
import {
  saveDraft,
  getDraft,
  clearDraft,
  formatTimeAgo,
} from "@/lib/draftManager";

export interface SessionResourceItem {
  id: number | string;
  name: string;
  size?: string;
  type?: string;
  url?: string;
  category?: string;
  parent?: string;
}

const formatRealFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const getFileTypeFromFileName = (fileName: string): string => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf") return "PDF";
  if (["doc", "docx", "txt", "rtf", "md"].includes(ext)) return "Document";
  if (["ppt", "pptx"].includes(ext)) return "Presentation";
  if (["xls", "xlsx", "csv"].includes(ext)) return "Spreadsheet";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "Archive";
  if (["js", "ts", "jsx", "tsx", "py", "java", "cpp", "c", "html", "css", "json", "sql"].includes(ext)) return "Source Code";
  if (["mp4", "mov", "webm", "mkv", "avi"].includes(ext)) return "Video";
  if (["png", "jpg", "jpeg", "svg", "webp"].includes(ext)) return "Image";
  return "File";
};

const getResourceIconInfo = (type?: string, name?: string) => {
  const t = (type || "").toLowerCase();
  const n = (name || "").toLowerCase();

  if (t.includes("assignment") || t.includes("homework")) {
    return {
      icon: BookOpen,
      bgColor: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-100/80 dark:border-emerald-900/50",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40",
      label: "Assignment",
    };
  }
  if (t.includes("problem") || t.includes("dsa") || t.includes("code") || n.endsWith(".js") || n.endsWith(".py") || n.endsWith(".cpp")) {
    return {
      icon: Code,
      bgColor: "bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border-violet-100/80 dark:border-violet-900/50",
      badgeColor: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-900/40",
      label: "Problem / Code",
    };
  }
  if (t.includes("pdf") || n.endsWith(".pdf")) {
    return {
      icon: FileText,
      bgColor: "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-100/80 dark:border-rose-900/50",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/40",
      label: "PDF Document",
    };
  }
  if (t.includes("video") || t.includes("recording") || t.includes("lecture") || n.endsWith(".mp4")) {
    return {
      icon: Video,
      bgColor: "bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border-sky-100/80 dark:border-sky-900/50",
      badgeColor: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/40",
      label: "Video Lesson",
    };
  }
  if (t.includes("link") || t.includes("url") || t.includes("github") || t.includes("drive") || t.includes("figma") || t.includes("notion")) {
    return {
      icon: Globe,
      bgColor: "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border-cyan-100/80 dark:border-cyan-900/50",
      badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-900/40",
      label: "External Link",
    };
  }
  if (t.includes("archive") || t.includes("zip") || n.endsWith(".zip") || n.endsWith(".rar")) {
    return {
      icon: FolderArchive,
      bgColor: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-100/80 dark:border-amber-900/50",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40",
      label: "Archive / Files",
    };
  }
  return {
    icon: FileText,
    bgColor: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-100/80 dark:border-indigo-900/50",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/40",
    label: type || "Resource",
  };
};

export interface LiveSessionData {
  id?: string | number;
  title: string;
  instructor: string;
  sessionType: string;
  description: string;
  course: string;
  module: string;
  topic: string;
  targetCohort: string;
  date: string;
  timezone: string;
  startTime: string;
  endTime: string;
  platform: string;
  meetingLink: string;
  passcode: string;
  hostNotes: string;
  resources: SessionResourceItem[];
  emailReminders: boolean;
  inAppNotifications: boolean;
  reminderSchedule: string;
  autoRecord: boolean;
  uploadRecording: boolean;
  aiNotes: boolean;
  autoPublishRecording: boolean;
  trackAttendance: boolean;
  attendanceMethod: string;
  attendanceThreshold: string;
  maxAttendees: string;
  visibility: string;
  status: "Scheduled" | "Draft" | "Live" | "Completed" | "Upcoming";
  attendees?: number;
}

export interface ContentLibraryItem {
  id: string | number;
  title: string;
  type?: string;
  parent?: string;
  owner?: string;
  status?: string;
  updated?: string;
}

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

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const SHORT_MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function formatDisplayDate(dateStr?: string) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      const y = parts[0];
      const mIdx = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (SHORT_MONTH_NAMES[mIdx]) {
        return `${String(d).padStart(2, "0")} ${SHORT_MONTH_NAMES[mIdx]} ${y}`;
      }
    }
    if (parts[2].length === 4) {
      const d = parseInt(parts[0], 10);
      const mIdx = parseInt(parts[1], 10) - 1;
      const y = parts[2];
      if (SHORT_MONTH_NAMES[mIdx]) {
        return `${String(d).padStart(2, "0")} ${SHORT_MONTH_NAMES[mIdx]} ${y}`;
      }
    }
  }
  return dateStr;
}

function CustomDatePicker({
  value,
  onChange,
  placeholder = "Select session date",
  className,
  disabled = false,
}: {
  value?: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"days" | "months" | "years">("days");
  const containerRef = useRef<HTMLDivElement>(null);

  const parseDate = (val?: string) => {
    if (val) {
      const parts = val.split("-");
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          const d = parseInt(parts[2], 10);
          if (!isNaN(y) && !isNaN(m) && !isNaN(d)) return { y, m, d, normalized: val };
        } else if (parts[2].length === 4) {
          const d = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          const y = parseInt(parts[2], 10);
          const normalized = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          if (!isNaN(y) && !isNaN(m) && !isNaN(d)) return { y, m, d, normalized };
        }
      }
    }
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();
    return {
      y,
      m,
      d,
      normalized: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    };
  };

  const parsed = parseDate(value);
  const [viewYear, setViewYear] = useState<number>(parsed.y);
  const [viewMonth, setViewMonth] = useState<number>(parsed.m);
  const [yearPageStart, setYearPageStart] = useState<number>(() => Math.floor(parsed.y / 12) * 12);

  useEffect(() => {
    if (value) {
      const p = parseDate(value);
      setViewYear(p.y);
      setViewMonth(p.m);
      setYearPageStart(Math.floor(p.y / 12) * 12);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setViewMode("days");
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setViewMode("days");
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

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMode === "days") {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear((prev) => {
          const nextY = prev - 1;
          setYearPageStart(Math.floor(nextY / 12) * 12);
          return nextY;
        });
      } else {
        setViewMonth((prev) => prev - 1);
      }
    } else if (viewMode === "months") {
      setViewYear((prev) => {
        const nextY = prev - 1;
        setYearPageStart(Math.floor(nextY / 12) * 12);
        return nextY;
      });
    } else if (viewMode === "years") {
      setYearPageStart((prev) => prev - 12);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMode === "days") {
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear((prev) => {
          const nextY = prev + 1;
          setYearPageStart(Math.floor(nextY / 12) * 12);
          return nextY;
        });
      } else {
        setViewMonth((prev) => prev + 1);
      }
    } else if (viewMode === "months") {
      setViewYear((prev) => {
        const nextY = prev + 1;
        setYearPageStart(Math.floor(nextY / 12) * 12);
        return nextY;
      });
    } else if (viewMode === "years") {
      setYearPageStart((prev) => prev + 12);
    }
  };

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: Array<{
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
    }> = [];

    // Prev month padding
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
      });
    }

    // Next month padding to fill grid
    const totalCells = days.length <= 35 ? 35 : 42;
    const remaining = totalCells - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [viewYear, viewMonth]);

  const todayObj = new Date();
  const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, "0")}-${String(todayObj.getDate()).padStart(2, "0")}`;
  const normalizedValue = value ? parseDate(value).normalized : "";

  const handleSelectPreset = (daysFromToday: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysFromToday);
    const dateStr = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}-${String(target.getDate()).padStart(2, "0")}`;
    onChange(dateStr);
    setViewYear(target.getFullYear());
    setViewMonth(target.getMonth());
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative inline-block w-full", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setIsOpen((prev) => !prev);
          setViewMode("days");
        }}
        className={cn(
          "w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between gap-2.5 hover:bg-slate-100/70 dark:hover:bg-white/5 transition-all cursor-pointer shadow-xs select-none",
          isOpen && "ring-2 ring-indigo-500/20 border-indigo-500 bg-white dark:bg-[#151926] shadow-sm",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className="flex items-center gap-2.5 truncate">
          <Calendar className={cn("h-4 w-4 shrink-0 transition-colors", value ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400")} />
          <span className={cn("truncate", value ? "text-slate-900 dark:text-white font-bold" : "text-slate-400")}>
            {value ? formatDisplayDate(value) : placeholder}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200",
            isOpen && "rotate-180 text-indigo-600 dark:text-indigo-400"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-[310px] rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-4 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 select-none">
          {/* Calendar Header with Navigation and Clickable Selectors */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-white/5">
            <button
              type="button"
              onClick={handlePrev}
              className="flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200/90 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer shrink-0"
              title="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Middle Selectors */}
            <div className="flex items-center gap-1.5">
              {viewMode === "days" && (
                <>
                  <button
                    type="button"
                    onClick={() => setViewMode("months")}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-800 dark:text-white hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-300 transition cursor-pointer"
                  >
                    <span>{MONTH_NAMES[viewMonth]}</span>
                    <ChevronDown className="h-3 w-3 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setYearPageStart(Math.floor(viewYear / 12) * 12);
                      setViewMode("years");
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-800 dark:text-white hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-300 transition cursor-pointer"
                  >
                    <span>{viewYear}</span>
                    <ChevronDown className="h-3 w-3 text-slate-400" />
                  </button>
                </>
              )}

              {viewMode === "months" && (
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">Select Month</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setYearPageStart(Math.floor(viewYear / 12) * 12);
                      setViewMode("years");
                    }}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition cursor-pointer"
                  >
                    {viewYear}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
              )}

              {viewMode === "years" && (
                <span className="text-xs font-bold text-slate-800 dark:text-white">
                  {yearPageStart} – {yearPageStart + 11}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200/90 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer shrink-0"
              title="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* VIEW 1: Days Grid */}
          {viewMode === "days" && (
            <>
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                {WEEK_DAYS.map((wd) => (
                  <span key={wd} className="text-[10px] font-extrabold text-slate-400 uppercase py-0.5">
                    {wd}
                  </span>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {calendarDays.map((d, i) => {
                  const isCurrentSelected = d.dateStr === normalizedValue;
                  const isToday = d.dateStr === todayStr;

                  return (
                    <button
                      key={`${d.dateStr}-${i}`}
                      type="button"
                      onClick={() => {
                        onChange(d.dateStr);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "h-8 w-8 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer select-none",
                        isCurrentSelected
                          ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30 ring-2 ring-indigo-500/20"
                          : d.isCurrentMonth
                          ? isToday
                            ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold ring-1 ring-indigo-300 dark:ring-indigo-700"
                            : "text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/5"
                          : "text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                      )}
                    >
                      {d.dayNum}
                    </button>
                  );
                })}
              </div>

              {/* Quick Presets */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSelectPreset(0)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 transition cursor-pointer"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset(1)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 transition cursor-pointer"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset(7)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 transition cursor-pointer"
                >
                  In 1 Week
                </button>
              </div>
            </>
          )}

          {/* VIEW 2: Months Grid */}
          {viewMode === "months" && (
            <div className="grid grid-cols-3 gap-2 py-1">
              {MONTH_NAMES.map((mName, mIdx) => {
                const isSelectedMonth = parsed.m === mIdx && parsed.y === viewYear;
                return (
                  <button
                    key={mName}
                    type="button"
                    onClick={() => {
                      setViewMonth(mIdx);
                      setViewMode("days");
                    }}
                    className={cn(
                      "py-2 px-1 rounded-xl text-xs font-semibold transition cursor-pointer text-center",
                      isSelectedMonth
                        ? "bg-indigo-600 text-white font-bold shadow-sm"
                        : "text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-300"
                    )}
                  >
                    {mName.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          )}

          {/* VIEW 3: Years Grid */}
          {viewMode === "years" && (
            <div className="grid grid-cols-3 gap-2 py-1">
              {Array.from({ length: 12 }).map((_, idx) => {
                const yr = yearPageStart + idx;
                const isSelectedYr = parsed.y === yr;
                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => {
                      setViewYear(yr);
                      setViewMode("months");
                    }}
                    className={cn(
                      "py-2 px-1 rounded-xl text-xs font-semibold transition cursor-pointer text-center",
                      isSelectedYr
                        ? "bg-indigo-600 text-white font-bold shadow-sm"
                        : "text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-300"
                    )}
                  >
                    {yr}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatScheduleDateTime(dateStr: string, timeStr: string) {
  if (!dateStr) return "";
  let formattedDate = dateStr;
  const parts = dateStr.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (months[monthIdx]) {
        formattedDate = `${day} ${months[monthIdx]} ${year}`;
      }
    } else if (parts[2].length === 4) {
      const day = parseInt(parts[0], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const year = parts[2];
      if (months[monthIdx]) {
        formattedDate = `${day} ${months[monthIdx]} ${year}`;
      }
    }
  }

  let formattedTime = timeStr || "";
  if (timeStr && timeStr.includes(":")) {
    const [h, m] = timeStr.split(":");
    const hours = parseInt(h, 10);
    const suffix = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    formattedTime = `${hour12}:${m} ${suffix}`;
  }

  return formattedTime ? `${formattedDate}, ${formattedTime}` : formattedDate;
}

function calculateDurationHours(startStr: string, endStr: string): string {
  if (!startStr || !endStr || !startStr.includes(":") || !endStr.includes(":")) return "2 hours";
  const [sh, sm] = startStr.split(":").map(Number);
  const [eh, em] = endStr.split(":").map(Number);
  let totalMin = (eh * 60 + em) - (sh * 60 + sm);
  if (totalMin < 0) totalMin += 24 * 60;
  if (totalMin === 0) return "0 mins";
  const hrs = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs} ${hrs === 1 ? "hour" : "hours"}`;
  return `${mins} mins`;
}

interface ScheduleSessionBuilderProps {
  initialData?: Partial<LiveSessionData>;
  onClose: () => void;
  onSaveDraft: (data: LiveSessionData) => Promise<void> | void;
  onSchedule: (data: LiveSessionData) => Promise<void> | void;
  availableCourses?: string[];
  courses?: any[];
  contentItems?: ContentLibraryItem[];
  instructors?: any[];
}

export default function ScheduleSessionBuilder({
  initialData,
  onClose,
  onSaveDraft,
  onSchedule,
  availableCourses,
  courses,
  contentItems = [],
  instructors = [],
}: ScheduleSessionBuilderProps) {
  const [localCourses, setLocalCourses] = useState<any[]>(courses || []);
  const [localInstructors, setLocalInstructors] = useState<any[]>(instructors || []);
  const [localContent, setLocalContent] = useState<ContentLibraryItem[]>(contentItems || []);
  const [localAssignments, setLocalAssignments] = useState<any[]>([]);
  const [localProblems, setLocalProblems] = useState<any[]>([]);
  const [localLiveSessions, setLocalLiveSessions] = useState<any[]>([]);
  const [isLoadingPlatformResources, setIsLoadingPlatformResources] = useState<boolean>(false);

  useEffect(() => {
    if (courses && courses.length > 0) {
      setLocalCourses(courses);
    }
  }, [courses]);

  useEffect(() => {
    if (instructors && instructors.length > 0) {
      setLocalInstructors(instructors);
    }
  }, [instructors]);

  useEffect(() => {
    if (contentItems && contentItems.length > 0) {
      setLocalContent(contentItems);
    }
  }, [contentItems]);

  useEffect(() => {
    if (!courses || courses.length === 0) {
      fetch("http://localhost:4000/api/v1/admin/courses")
        .then((r) => (r.ok ? r.json() : []))
        .then((apiData) => {
          if (Array.isArray(apiData) && apiData.length > 0) {
            setLocalCourses(apiData);
          }
        })
        .catch(() => {});
    }
  }, [courses]);

  useEffect(() => {
    if (!instructors || instructors.length === 0) {
      fetch("http://localhost:4000/api/v1/admin/instructors")
        .then((r) => (r.ok ? r.json() : []))
        .then((apiData) => {
          if (Array.isArray(apiData) && apiData.length > 0) {
            setLocalInstructors(apiData);
          }
        })
        .catch(() => {});
    }
  }, [instructors]);

  const fetchRealPlatformResources = () => {
    setIsLoadingPlatformResources(true);
    Promise.allSettled([
      fetch("http://localhost:4000/api/v1/admin/content").then((r) => (r.ok ? r.json() : [])),
      fetch("http://localhost:4000/api/v1/admin/assignments").then((r) => (r.ok ? r.json() : [])),
      fetch("http://localhost:4000/api/v1/admin/practice-problems").then((r) => (r.ok ? r.json() : [])),
      fetch("http://localhost:4000/api/v1/live-sessions").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([contentRes, assignRes, probRes, sessionsRes]) => {
        if (contentRes.status === "fulfilled" && Array.isArray(contentRes.value) && contentRes.value.length > 0) {
          setLocalContent(contentRes.value);
        }
        if (assignRes.status === "fulfilled" && Array.isArray(assignRes.value)) {
          setLocalAssignments(assignRes.value);
        }
        if (probRes.status === "fulfilled" && Array.isArray(probRes.value)) {
          setLocalProblems(probRes.value);
        }
        if (sessionsRes.status === "fulfilled" && Array.isArray(sessionsRes.value)) {
          setLocalLiveSessions(sessionsRes.value);
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsLoadingPlatformResources(false);
      });
  };

  useEffect(() => {
    fetchRealPlatformResources();
  }, []);

  const activeCoursesList = useMemo(() => {
    if (localCourses && localCourses.length > 0) return localCourses;
    if (courses && courses.length > 0) return courses;
    return [];
  }, [localCourses, courses]);

  const activeInstructorsList = useMemo(() => {
    if (localInstructors && localInstructors.length > 0) return localInstructors;
    if (instructors && instructors.length > 0) return instructors;
    return [];
  }, [localInstructors, instructors]);

  const availablePlatformResources = useMemo(() => {
    const list: Array<{
      id: string | number;
      name: string;
      category: "lesson" | "assignment" | "problem" | "file";
      type: string;
      size: string;
      course?: string;
      parent?: string;
      raw?: any;
    }> = [];

    const seenIds = new Set<string>();
    const seenNames = new Set<string>();

    const addUniqueItem = (item: {
      id: string | number;
      name: string;
      category: "lesson" | "assignment" | "problem" | "file";
      type: string;
      size: string;
      course?: string;
      parent?: string;
      raw?: any;
    }) => {
      const cleanName = item.name?.trim();
      if (!cleanName) return;

      const normName = cleanName.toLowerCase();
      const idStr = String(item.id);
      const catKey = `${item.category}:::${normName}`;

      // Prevent duplicate by exact ID, or duplicate name within category, or duplicate globally if same name
      if (seenIds.has(idStr) || seenNames.has(catKey) || seenNames.has(normName)) {
        return;
      }

      seenIds.add(idStr);
      seenNames.add(catKey);
      seenNames.add(normName);
      list.push({ ...item, name: cleanName });
    };

    // 1. Lessons & Modules from active courses
    for (const course of activeCoursesList) {
      const courseTitle = (course.title || course.name || "Course").trim();
      if (Array.isArray(course.modules)) {
        for (const mod of course.modules) {
          const modTitle = typeof mod === "string" ? mod.trim() : (mod.title || mod.name || "Module").trim();
          if (mod && typeof mod === "object" && Array.isArray(mod.topics)) {
            for (const top of mod.topics) {
              const topTitle = (top.title || "Lesson").trim();
              if (Array.isArray(top.subtopics) && top.subtopics.length > 0) {
                for (const sub of top.subtopics) {
                  const subTitle = (sub.title || topTitle).trim();
                  addUniqueItem({
                    id: sub.id ? `sub_${sub.id}` : `sub_${courseTitle}_${modTitle}_${subTitle}`,
                    name: subTitle,
                    category: "lesson",
                    type: sub.type || "Video Lesson",
                    size: `${courseTitle} · ${modTitle}`,
                    course: courseTitle,
                    parent: modTitle,
                  });
                }
              } else {
                addUniqueItem({
                  id: top.id ? `top_${top.id}` : `top_${courseTitle}_${modTitle}_${topTitle}`,
                  name: topTitle,
                  category: "lesson",
                  type: top.type || "Course Lesson",
                  size: `${courseTitle} · ${modTitle}`,
                  course: courseTitle,
                  parent: modTitle,
                });
              }
            }
          }
        }
      }
    }

    // 2. Real Content Library items from DB
    if (localContent && localContent.length > 0) {
      for (const item of localContent) {
        const isPdf = item.type?.toUpperCase().includes("PDF");
        const isVideo = item.type?.toUpperCase().includes("VIDEO");
        const isAssign = item.type?.toUpperCase().includes("ASSIGNMENT");
        const isProb = item.type?.toUpperCase().includes("PROBLEM");
        const cat = isAssign ? "assignment" : isProb ? "problem" : isPdf ? "file" : isVideo ? "lesson" : "file";
        addUniqueItem({
          id: item.id || `content_${item.title}`,
          name: item.title,
          category: cat,
          type: item.type || "Content Resource",
          size: item.parent ? `${item.parent}` : "Platform Library",
          course: item.parent?.split(" · ")[0] || "",
          parent: item.parent || "Content Library",
        });
      }
    }

    // 3. Real Assignments from DB
    if (localAssignments && localAssignments.length > 0) {
      for (const assign of localAssignments) {
        addUniqueItem({
          id: assign.id ? `assign_${assign.id}` : `assign_${assign.title}`,
          name: assign.title,
          category: "assignment",
          type: "Assignment",
          size: `${assign.totalPoints || 100} Marks · ${assign.dueDate ? `Due ${assign.dueDate}` : "Course Task"}`,
          course: assign.course || "",
          parent: assign.course || "Platform Assignment",
          raw: assign,
        });
      }
    }

    // 4. Real Practice Problems from DB
    if (localProblems && localProblems.length > 0) {
      for (const prob of localProblems) {
        addUniqueItem({
          id: prob.id ? `prob_${prob.id}` : `prob_${prob.title}`,
          name: prob.title,
          category: "problem",
          type: `Problem (${prob.difficulty || "Medium"})`,
          size: `${prob.category || "DSA"} · ${prob.acceptance || "75%"} Acceptance`,
          parent: prob.category || "Practice Problem",
          raw: prob,
        });
      }
    }

    // 5. Existing Live Sessions & Recordings
    if (localLiveSessions && localLiveSessions.length > 0) {
      for (const sess of localLiveSessions) {
        addUniqueItem({
          id: sess.id ? `sess_${sess.id}` : `sess_${sess.title}`,
          name: sess.title,
          category: "lesson",
          type: `Live Class (${sess.platform || "Online"})`,
          size: `${sess.course || "General"} · ${sess.date || "Scheduled"}`,
          course: sess.course || "",
          parent: sess.course || "Live Sessions",
          raw: sess,
        });
      }
    }

    return list;
  }, [activeCoursesList, localContent, localAssignments, localProblems, localLiveSessions]);

  const courseNames = useMemo(() => {
    if (activeCoursesList && activeCoursesList.length > 0) {
      return activeCoursesList.map((c: any) => c.title || c.name).filter(Boolean);
    }
    if (availableCourses && availableCourses.length > 0) return availableCourses;
    return [];
  }, [activeCoursesList, availableCourses]);

  const instructorOptions = useMemo(() => {
    if (activeInstructorsList && activeInstructorsList.length > 0) {
      const seen = new Set<string>();
      const opts: Array<{ value: string; label: string }> = [];

      for (const inst of activeInstructorsList) {
        const rawName = (inst.fullName || inst.name || inst.email || "Abhishek J").trim();
        // Remove existing "(Admin)" or "(Instructor)" or trailing "Admin" duplicates
        const cleanName = rawName
          .replace(/\s*\((Admin|Instructor|Staff)\)\s*/gi, "")
          .replace(/\s+Admin$/i, "")
          .trim();

        const roleLabel = inst.role === "INSTRUCTOR" ? "Instructor" : "Admin";
        const finalName = cleanName || rawName;
        const displayLabel = `${finalName} (${roleLabel})`;

        if (!seen.has(finalName.toLowerCase())) {
          seen.add(finalName.toLowerCase());
          opts.push({
            value: finalName,
            label: displayLabel,
          });
        }
      }
      if (opts.length > 0) return opts;
    }
    return [{ value: "Abhishek J", label: "Abhishek J (Admin)" }];
  }, [activeInstructorsList]);

  // Check if a saved local draft exists (only if not editing an existing session by id)
  const existingDraft = useMemo(() => {
    if (initialData?.id) return null;
    return getDraft<LiveSessionData>("schedule_session");
  }, [initialData?.id]);

  const [isRestoredFromDraft, setIsRestoredFromDraft] = useState<boolean>(() => {
    if (initialData?.id) return false;
    return Boolean(
      existingDraft?.data &&
        (existingDraft.data.title || existingDraft.data.description || existingDraft.data.meetingLink)
    );
  });

  const [lastSavedTime, setLastSavedTime] = useState<number | null>(() => {
    if (initialData?.id) return null;
    return existingDraft?.timestamp || null;
  });

  const [data, setData] = useState<LiveSessionData>(() => {
    const initialCourse = initialData?.course || existingDraft?.data?.course || (courseNames.length > 0 ? courseNames[0] : "");
    if (initialData) {
      return {
        id: initialData?.id,
        title: initialData?.title || "",
        instructor: initialData?.instructor || "Platform Admin",
        sessionType: initialData?.sessionType || "Live Class",
        description: initialData?.description || "",
        course: initialCourse,
        module: initialData?.module || "",
        topic: initialData?.topic || "",
        targetCohort: initialData?.targetCohort || "All Enrolled Students",
        date: initialData?.date || new Date().toISOString().split("T")[0],
        timezone: initialData?.timezone || "IST (UTC+5:30) - Asia/Kolkata",
        startTime: initialData?.startTime || "18:00",
        endTime: initialData?.endTime || "19:30",
        platform: initialData?.platform || "Google Meet",
        meetingLink: initialData?.meetingLink || "",
        passcode: initialData?.passcode || "",
        hostNotes: initialData?.hostNotes || "",
        resources: initialData?.resources || [],
        emailReminders: initialData?.emailReminders ?? true,
        inAppNotifications: initialData?.inAppNotifications ?? true,
        reminderSchedule: initialData?.reminderSchedule || "30 minutes before",
        autoRecord: initialData?.autoRecord ?? true,
        uploadRecording: initialData?.uploadRecording ?? true,
        aiNotes: initialData?.aiNotes ?? true,
        autoPublishRecording: initialData?.autoPublishRecording ?? false,
        trackAttendance: initialData?.trackAttendance ?? true,
        attendanceMethod: initialData?.attendanceMethod || "Automatic on join (min 15 mins)",
        attendanceThreshold: initialData?.attendanceThreshold || "75%",
        maxAttendees: initialData?.maxAttendees || "250",
        visibility: initialData?.visibility || "All enrolled students",
        status: initialData?.status || "Scheduled",
      };
    }
    if (existingDraft?.data) {
      return {
        ...existingDraft.data,
        course: existingDraft.data.course || initialCourse,
      };
    }
    return {
      title: "",
      instructor: "Platform Admin",
      sessionType: "Live Class",
      description: "",
      course: initialCourse,
      module: "",
      topic: "",
      targetCohort: "All Enrolled Students",
      date: new Date().toISOString().split("T")[0],
      timezone: "IST (UTC+5:30) - Asia/Kolkata",
      startTime: "18:00",
      endTime: "19:30",
      platform: "Google Meet",
      meetingLink: "",
      passcode: "",
      hostNotes: "",
      resources: [],
      emailReminders: true,
      inAppNotifications: true,
      reminderSchedule: "30 minutes before",
      autoRecord: true,
      uploadRecording: true,
      aiNotes: true,
      autoPublishRecording: false,
      trackAttendance: true,
      attendanceMethod: "Automatic on join (min 15 mins)",
      attendanceThreshold: "75%",
      maxAttendees: "250",
      visibility: "All enrolled students",
      status: "Scheduled",
    };
  });

  // Re-sync form state when editing a different or existing session
  useEffect(() => {
    if (initialData) {
      setData({
        id: initialData.id,
        title: initialData.title || "",
        instructor: initialData.instructor || "Platform Admin",
        sessionType: initialData.sessionType || "Live Class",
        description: initialData.description || "",
        course: initialData.course || "",
        module: initialData.module || "",
        topic: initialData.topic || "",
        targetCohort: initialData.targetCohort || "All Enrolled Students",
        date: initialData.date || new Date().toISOString().split("T")[0],
        timezone: initialData.timezone || "IST (UTC+5:30) - Asia/Kolkata",
        startTime: initialData.startTime || "18:00",
        endTime: initialData.endTime || "19:30",
        platform: initialData.platform || "Google Meet",
        meetingLink: initialData.meetingLink || "",
        passcode: initialData.passcode || "",
        hostNotes: initialData.hostNotes || "",
        resources: initialData.resources || [],
        emailReminders: initialData.emailReminders ?? true,
        inAppNotifications: initialData.inAppNotifications ?? true,
        reminderSchedule: initialData.reminderSchedule || "30 minutes before",
        autoRecord: initialData.autoRecord ?? true,
        uploadRecording: initialData.uploadRecording ?? true,
        aiNotes: initialData.aiNotes ?? true,
        autoPublishRecording: initialData.autoPublishRecording ?? false,
        trackAttendance: initialData.trackAttendance ?? true,
        attendanceMethod: initialData.attendanceMethod || "Automatic on join (min 15 mins)",
        attendanceThreshold: initialData.attendanceThreshold || "75%",
        maxAttendees: initialData.maxAttendees || "250",
        visibility: initialData.visibility || "All enrolled students",
        status: initialData.status || "Scheduled",
      });
    }
  }, [initialData]);

  // Auto-save form state to local draft when creating a new session
  useEffect(() => {
    if (data.id) return; // Do not overwrite drafts when editing an established session
    const hasData = Boolean(
      data.title.trim() ||
        data.description.trim() ||
        data.meetingLink.trim()
    );
    if (!hasData) return;

    const timer = setTimeout(() => {
      saveDraft("schedule_session", data, {
        title: data.title || "Untitled Live Session",
      });
      setLastSavedTime(Date.now());
    }, 400);

    return () => clearTimeout(timer);
  }, [data]);

  // Auto-sync valid instructor from real DB list if unset or dummy default
  useEffect(() => {
    if (instructorOptions.length > 0) {
      const validValues = instructorOptions.map((o) => o.value);
      if (
        !data.instructor ||
        data.instructor === "Platform Admin" ||
        data.instructor === "Ankit Sharma" ||
        !validValues.includes(data.instructor)
      ) {
        if (!initialData?.instructor || initialData.instructor === "Platform Admin") {
          setData((prev) => ({
            ...prev,
            instructor: validValues[0] || prev.instructor,
          }));
        }
      }
    }
  }, [instructorOptions, initialData]);

  const handleDiscardDraft = () => {
    clearDraft("schedule_session");
    const defaultInst = instructorOptions[0]?.value || "Abhishek J";
    setData({
      title: "",
      instructor: defaultInst,
      sessionType: "Live Class",
      description: "",
      course: courseNames[0] || "",
      module: "",
      topic: "",
      targetCohort: "All Enrolled Students",
      date: new Date().toISOString().split("T")[0],
      timezone: "IST (UTC+5:30) - Asia/Kolkata",
      startTime: "18:00",
      endTime: "19:30",
      platform: "Google Meet",
      meetingLink: "",
      passcode: "",
      hostNotes: "",
      resources: [],
      emailReminders: true,
      inAppNotifications: true,
      reminderSchedule: "30 minutes before",
      autoRecord: true,
      uploadRecording: true,
      aiNotes: true,
      autoPublishRecording: false,
      trackAttendance: true,
      attendanceMethod: "Automatic on join (min 15 mins)",
      attendanceThreshold: "75%",
      maxAttendees: "250",
      visibility: "All enrolled students",
      status: "Scheduled",
    });
    setIsRestoredFromDraft(false);
    setLastSavedTime(null);
  };

  const [copiedLink, setCopiedLink] = useState(false);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [attachSearch, setAttachSearch] = useState("");
  const [attachCategoryFilter, setAttachCategoryFilter] = useState<"all" | "lesson" | "assignment" | "problem" | "file">("all");
  const [attachCourseFilter, setAttachCourseFilter] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCourseObj = useMemo(() => {
    return activeCoursesList.find(
      (c: any) =>
        (c.title && c.title === data.course) ||
        (c.name && c.name === data.course) ||
        (c.id && String(c.id) === String(data.course))
    );
  }, [activeCoursesList, data.course]);

  const availableModules = useMemo(() => {
    if (selectedCourseObj?.modules && Array.isArray(selectedCourseObj.modules) && selectedCourseObj.modules.length > 0) {
      return selectedCourseObj.modules
        .map((m: any) => {
          if (typeof m === "string") return m;
          return m?.title || m?.name || (m?.id ? `Module ${m.id}` : "");
        })
        .filter(Boolean);
    }
    return [];
  }, [selectedCourseObj]);

  useEffect(() => {
    if (courseNames.length > 0) {
      if (!data.course || !courseNames.includes(data.course)) {
        const firstCourse = courseNames[0];
        const matched = activeCoursesList.find(
          (c: any) => c.title === firstCourse || c.name === firstCourse || String(c.id) === String(firstCourse)
        );
        const mods = (matched?.modules || [])
          .map((m: any) => (typeof m === "string" ? m : (m?.title || m?.name || "")))
          .filter(Boolean);
        setData((prev) => ({
          ...prev,
          course: firstCourse,
          module: prev.module && mods.includes(prev.module) ? prev.module : (mods[0] || ""),
        }));
      }
    }
  }, [courseNames, activeCoursesList]);

  useEffect(() => {
    if (availableModules.length > 0) {
      if (!data.module || !availableModules.includes(data.module)) {
        setData((prev) => ({ ...prev, module: availableModules[0] }));
      }
    } else if (selectedCourseObj) {
      if (data.module) {
        setData((prev) => ({ ...prev, module: "" }));
      }
    }
  }, [availableModules, selectedCourseObj]);

  const durationStr = useMemo(() => calculateDurationHours(data.startTime, data.endTime), [data.startTime, data.endTime]);

  const handleCopyLink = () => {
    if (data.meetingLink) {
      navigator.clipboard?.writeText(data.meetingLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const [isScheduling, setIsScheduling] = useState(false);

  const handleScheduleClick = async () => {
    if (isScheduling) return;
    try {
      setIsScheduling(true);
      clearDraft("schedule_session");
      await onSchedule({ ...data, status: "Scheduled" });
    } catch (err) {
      console.error("Failed to schedule session:", err);
      setIsScheduling(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newItems: SessionResourceItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const sizeStr = formatRealFileSize(file.size);
        const fileType = getFileTypeFromFileName(file.name);
        const objectUrl = URL.createObjectURL(file);

        newItems.push({
          id: `file_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          size: sizeStr,
          type: fileType,
          url: objectUrl,
          category: "file",
        });
      }

      setData((prev) => ({
        ...prev,
        resources: [...prev.resources, ...newItems],
      }));
      e.target.value = "";
    }
  };

  const handleAttachExisting = (item: {
    id?: string | number;
    name: string;
    size?: string;
    type?: string;
    url?: string;
    category?: string;
    parent?: string;
  }) => {
    const normName = item.name.trim().toLowerCase();
    const isAlreadyAttached = data.resources.some(
      (r) => r.name.trim().toLowerCase() === normName || String(r.id) === String(item.id)
    );
    if (!isAlreadyAttached) {
      setData((prev) => ({
        ...prev,
        resources: [
          ...prev.resources,
          {
            id: item.id || `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: item.name.trim(),
            size: item.size || "Platform Resource",
            type: item.type || "Resource",
            url: item.url,
            category: item.category,
            parent: item.parent,
          },
        ],
      }));
    }
  };


  const handleRemoveResource = (id: number | string) => {
    setData((prev) => ({
      ...prev,
      resources: prev.resources.filter((r) => r.id !== id),
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
            <span>Back to Live Sessions</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              clearDraft("schedule_session");
              onSaveDraft({ ...data, status: "Draft" });
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 transition cursor-pointer shadow-xs"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save draft</span>
          </button>
          <button
            type="button"
            disabled={isScheduling}
            onClick={handleScheduleClick}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition cursor-pointer active:scale-95",
              isScheduling && "opacity-80 cursor-not-allowed pointer-events-none"
            )}
          >
            {isScheduling ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Scheduling session...</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Schedule session</span>
              </>
            )}
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

      {/* Main Form Container */}
      <main className="flex-1 mx-auto w-full max-w-[1440px] px-6 py-7">
        {/* Restored Draft Notification Banner */}
        {isRestoredFromDraft && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200/80 bg-indigo-50/80 dark:border-indigo-900/40 dark:bg-indigo-950/30 px-5 py-3.5 shadow-sm animate-in fade-in-0 duration-200">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Restored from auto-saved draft
                  {lastSavedTime && (
                    <span className="ml-2 text-[11px] font-normal text-slate-500 dark:text-slate-400">
                      ({formatTimeAgo(lastSavedTime)})
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Your previous progress has been automatically restored. You can continue editing or start fresh.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="rounded-xl border border-slate-200/80 bg-white dark:border-white/10 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer shadow-xs"
              >
                Start fresh
              </button>
              <button
                type="button"
                onClick={() => setIsRestoredFromDraft(false)}
                className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition cursor-pointer shadow-xs"
              >
                Continue draft
              </button>
            </div>
          </div>
        )}

        {/* Title & Banner */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wider">
            <span>LIVE SESSIONS</span>
            <span>/</span>
            <span className="text-indigo-600 dark:text-indigo-400">SCHEDULE SESSION</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Schedule Session
            </h1>
            <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-900/50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
              Interactive Live Class
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Create and schedule a live interactive session for your students and cohort.
          </p>
        </div>

        {/* 2-Column Grid (8 cols Left Form, 4 cols Right Summary) */}
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
                    Set the primary title, designated instructor, and learning objectives.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Session Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={data.title}
                    onChange={(e) => setData({ ...data, title: e.target.value })}
                    placeholder="e.g. Dynamic Programming Masterclass"
                    className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-4 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#151926] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Instructor / Host <span className="text-rose-500">*</span>
                    </label>
                    <CustomDropdown
                      value={data.instructor}
                      onChange={(val) => setData({ ...data, instructor: val })}
                      options={instructorOptions}
                      placeholder={instructorOptions.length > 0 ? "Select Instructor / Host" : "Loading database admins..."}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Session Type
                    </label>
                    <CustomDropdown
                      value={data.sessionType}
                      onChange={(val) => setData({ ...data, sessionType: val })}
                      options={["Live Class", "Office Hours", "Doubt Clearing", "Mock Interview", "Hands-on Workshop"]}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Session Description
                  </label>
                  <textarea
                    rows={3}
                    value={data.description}
                    onChange={(e) => setData({ ...data, description: e.target.value })}
                    placeholder="What will learners achieve in this session?"
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
                    Link this session to an active curriculum track and target cohort.
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
                      const matched = activeCoursesList.find(
                        (c: any) => c.title === val || c.name === val || String(c.id) === String(val)
                      );
                      const mods = (matched?.modules || [])
                        .map((m: any) => (typeof m === "string" ? m : (m?.title || m?.name || "")))
                        .filter(Boolean);
                      const modName = mods.length > 0 ? mods[0] : "";
                      setData({ ...data, course: val, module: modName });
                    }}
                    options={courseNames}
                    placeholder={courseNames.length > 0 ? "Select Target Course" : "No courses available on Admin Panel"}
                    disabled={courseNames.length === 0}
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
                    placeholder={
                      availableModules.length > 0
                        ? "Select Target Module"
                        : data.course
                        ? "No modules found in this course"
                        : "Select a course first"
                    }
                    disabled={availableModules.length === 0}
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
                    placeholder="e.g. Memoization & Tabulation"
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
                    placeholder="e.g. Spring 2026 Batch"
                    className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Scheduling */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-100/80 dark:border-indigo-900/50 shrink-0">
                  03
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    Scheduling
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Set the session calendar date, timing window, and timezone.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Session Date <span className="text-rose-500">*</span>
                    </label>
                    <CustomDatePicker
                      value={data.date}
                      onChange={(val) => setData({ ...data, date: val })}
                      placeholder="Select Session Date"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Timezone
                    </label>
                    <CustomDropdown
                      value={data.timezone}
                      onChange={(val) => setData({ ...data, timezone: val })}
                      options={[
                        "IST (UTC+5:30) - Asia/Kolkata",
                        "UTC (GMT+0:00) - Universal Time",
                        "EST (UTC-5:00) - Eastern Time",
                        "PST (UTC-8:00) - Pacific Time",
                        "SGT (UTC+8:00) - Singapore",
                      ]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Start Time <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={data.startTime}
                        onChange={(e) => setData({ ...data, startTime: e.target.value })}
                        placeholder="18:00"
                        className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] pl-4 pr-11 py-3 text-xs text-slate-900 dark:text-white focus:outline-none font-medium"
                      />
                      <Clock className="pointer-events-none absolute right-4 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      End Time <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={data.endTime}
                        onChange={(e) => setData({ ...data, endTime: e.target.value })}
                        placeholder="20:00"
                        className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] pl-4 pr-11 py-3 text-xs text-slate-900 dark:text-white focus:outline-none font-medium"
                      />
                      <Clock className="pointer-events-none absolute right-4 h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Highlighted Schedule Banner */}
                <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white shadow-xs shrink-0">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Scheduled for {formatScheduleDateTime(data.date, data.startTime)} – {formatScheduleDateTime(data.date, data.endTime).split(", ")[1] || data.endTime}
                      </p>
                      <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium mt-0.5">
                        Duration: {durationStr} · {data.timezone.split(" - ")[0]}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Meeting Platform */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-100/80 dark:border-indigo-900/50 shrink-0">
                  04
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    Meeting Platform
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure the video conference provider and attendee join URL.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Meeting Platform <span className="text-rose-500">*</span>
                    </label>
                    <CustomDropdown
                      value={data.platform}
                      onChange={(val) => setData({ ...data, platform: val })}
                      options={["Google Meet", "Zoom Meetings", "Microsoft Teams", "Custom WebRTC / In-App Video"]}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Passcode / PIN (Optional)
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={data.passcode}
                        onChange={(e) => setData({ ...data, passcode: e.target.value })}
                        placeholder="e.g. dsa2026"
                        className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] pl-4 pr-10 py-3 text-xs text-slate-900 dark:text-white focus:outline-none"
                      />
                      <Lock className="pointer-events-none absolute right-4 h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Meeting Link / URL <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="url"
                      value={data.meetingLink}
                      onChange={(e) => setData({ ...data, meetingLink: e.target.value })}
                      placeholder="https://meet.google.com/xyz-abcd-efg"
                      className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] pl-4 pr-24 py-3 text-xs text-slate-900 dark:text-white focus:outline-none font-medium text-indigo-600 dark:text-indigo-400"
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
                        title="Copy link"
                      >
                        {copiedLink ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                      <a
                        href={data.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
                        title="Open link"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Host Notes / Instructor instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={data.hostNotes}
                    onChange={(e) => setData({ ...data, hostNotes: e.target.value })}
                    placeholder="Private instructor checklist before going live"
                    className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Session Resources */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-100/80 dark:border-indigo-900/50 shrink-0">
                    05
                  </div>
                  <div>
                    <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      Session Resources
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Attach real database learning materials, assignments, problems, or files before students join.
                    </p>
                  </div>
                </div>
                {data.resources.length > 0 && (
                  <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-900/50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                    {data.resources.length} {data.resources.length === 1 ? "Resource" : "Resources"} Attached
                  </span>
                )}
              </div>

              {/* Hidden File Input for Real Upload */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.docx,.doc,.pptx,.ppt,.zip,.rar,.txt,.md,.py,.cpp,.java,.js,.ts,.json,.png,.jpg"
              />

                {/* 2-Column Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Card 1: Attach existing platform resource */}
                  <button
                    type="button"
                    onClick={() => setShowAttachModal(true)}
                    className="group text-left rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-4 hover:border-indigo-500 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2.5 border border-indigo-100/80 dark:border-indigo-900/50">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                        Attach Platform Resource
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        Lessons, assignments, practice problems & library PDFs.
                      </p>
                    </div>
                    <span className="mt-3 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-1 group-hover:underline">
                      Browse library ({availablePlatformResources.length}) →
                    </span>
                  </button>

                  {/* Card 2: Upload real local files */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="group text-left rounded-2xl border-2 border-dashed border-indigo-200/80 dark:border-indigo-800/60 bg-indigo-50/20 dark:bg-indigo-950/20 p-4 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2.5 border border-indigo-100/80 dark:border-indigo-900/50">
                        <Upload className="h-4 w-4" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                        Upload Local Files
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        PDFs, slides, code zip, notes (auto-computes real file size).
                      </p>
                    </div>
                    <span className="mt-3 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-1 group-hover:underline">
                      Select files →
                    </span>
                  </button>
                </div>

                {/* Attached Resources List */}
                <div className="space-y-2.5 pt-1">
                  {data.resources.length === 0 ? (
                    <div className="text-center py-7 px-4 text-xs text-slate-400 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50/30 dark:bg-white/[0.01]">
                      <div className="w-10 h-10 mx-auto rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center mb-2">
                        <FileText className="h-5 w-5" />
                      </div>
                      <p className="font-bold text-slate-700 dark:text-slate-300">No session resources attached yet</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm mx-auto">
                        Attach real course lessons, platform assignments, practice problems, or upload local files.
                      </p>
                    </div>
                  ) : (
                    data.resources.map((res) => {
                      const iconInfo = getResourceIconInfo(res.type, res.name);
                      const IconComponent = iconInfo.icon;
                      return (
                        <div
                          key={res.id}
                          className="flex items-center justify-between px-4 py-3.5 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] shadow-2xs hover:border-slate-300 dark:hover:border-white/20 transition-all group"
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-3">
                            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border", iconInfo.bgColor)}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {res.name}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 flex-wrap">
                                <span className={cn("rounded-md border px-1.5 py-0.2 text-[9px] font-bold", iconInfo.badgeColor)}>
                                  {res.type || iconInfo.label}
                                </span>
                                {res.size && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate max-w-[280px]">{res.size}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {res.url && (
                              <a
                                href={res.url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
                                title="Open / Preview Resource"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveResource(res.id)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-2.5 py-1.5 rounded-xl transition cursor-pointer"
                              title="Remove resource"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            {/* Section 6: Notifications & Reminders */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-100/80 dark:border-indigo-900/50 shrink-0">
                  06
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    Notifications & Reminders
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure automated alerts to maximize student live turnout.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email reminders */}
                  <div
                    onClick={() => setData((prev) => ({ ...prev, emailReminders: !prev.emailReminders }))}
                    className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] hover:border-indigo-300 dark:hover:border-indigo-800 transition-all cursor-pointer select-none"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Email reminders
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Send calendar invite & email alert
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={data.emailReminders}
                      onChange={(checked) => setData((prev) => ({ ...prev, emailReminders: checked }))}
                      ariaLabel="Toggle email reminders"
                    />
                  </div>

                  {/* In-app notification */}
                  <div
                    onClick={() => setData((prev) => ({ ...prev, inAppNotifications: !prev.inAppNotifications }))}
                    className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] hover:border-indigo-300 dark:hover:border-indigo-800 transition-all cursor-pointer select-none"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        In-app notification
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Banner & push notification
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={data.inAppNotifications}
                      onChange={(checked) => setData((prev) => ({ ...prev, inAppNotifications: checked }))}
                      ariaLabel="Toggle in-app notifications"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Reminder Trigger Window
                  </label>
                  <CustomDropdown
                    value={data.reminderSchedule}
                    onChange={(val) => setData({ ...data, reminderSchedule: val })}
                    options={[
                      "15 minutes before",
                      "30 minutes before",
                      "1 hour before",
                      "1 day before",
                      "1 hour + 15 mins before",
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Section 7: Recording Settings */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-100/80 dark:border-indigo-900/50 shrink-0">
                  07
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    Recording Settings
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Manage cloud recording, automated transcription, and replay publishing.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  { key: "autoRecord", label: "Automatically record session", desc: "Start recording when instructor joins" },
                  { key: "uploadRecording", label: "Upload recording after class", desc: "Save full HD replay to cloud storage" },
                  { key: "aiNotes", label: "Generate AI transcript & notes", desc: "Create summary key takeaways" },
                  { key: "autoPublishRecording", label: "Auto-publish to curriculum", desc: "Make visible in module lessons instantly" },
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

            {/* Section 8: Attendance & Settings */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-100/80 dark:border-indigo-900/50 shrink-0">
                  08
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    Attendance & Capacity
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Set verification thresholds and seat limits.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div
                  onClick={() => setData((prev) => ({ ...prev, trackAttendance: !prev.trackAttendance }))}
                  className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between cursor-pointer hover:border-slate-300 dark:hover:border-white/20 transition select-none"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Track attendance</p>
                    <p className="text-[11px] text-slate-400">Log join timestamps and calculate percentage watched</p>
                  </div>
                  <ToggleSwitch
                    checked={data.trackAttendance}
                    onChange={(checked) => setData((prev) => ({ ...prev, trackAttendance: checked }))}
                    ariaLabel="Toggle track attendance"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Attendance Method
                    </label>
                    <CustomDropdown
                      value={data.attendanceMethod}
                      onChange={(val) => setData({ ...data, attendanceMethod: val })}
                      options={[
                        "Automatic on join (min 15 mins)",
                        "Manual instructor roll call",
                        "Live Poll / Quiz participation",
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Minimum Attendance Threshold
                    </label>
                    <input
                      type="text"
                      value={data.attendanceThreshold}
                      onChange={(e) => setData({ ...data, attendanceThreshold: e.target.value })}
                      placeholder="e.g. 75%"
                      className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Maximum Capacity / Attendee Limit
                  </label>
                  <input
                    type="text"
                    value={data.maxAttendees}
                    onChange={(e) => setData({ ...data, maxAttendees: e.target.value })}
                    placeholder="e.g. 250 or Unlimited"
                    className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 9: Visibility & Status */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-100/80 dark:border-indigo-900/50 shrink-0">
                  09
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    Visibility & Launch Status
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Control learner discovery and publication state.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Cohort Visibility
                  </label>
                  <CustomDropdown
                    value={data.visibility}
                    onChange={(val) => setData({ ...data, visibility: val })}
                    options={["All enrolled students", "Specific cohort only", "Public / Free Open Webinar"]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Session Status
                  </label>
                  <CustomDropdown
                    value={data.status}
                    onChange={(val) => setData({ ...data, status: val as any })}
                    options={["Scheduled", "Draft", "Live"]}
                  />
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
                  disabled={isScheduling}
                  onClick={handleScheduleClick}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition cursor-pointer active:scale-95",
                    isScheduling && "opacity-80 cursor-not-allowed pointer-events-none"
                  )}
                >
                  {isScheduling ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Scheduling session...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Schedule session</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Summary Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Card 1: Session summary */}
            <div className="sticky top-20 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Session summary
                </h3>
                <span className="text-indigo-600 dark:text-indigo-400">
                  <Video className="h-4 w-4" />
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Session title</p>
                  <p className="mt-0.5 font-bold text-slate-900 dark:text-white">{data.title || "Untitled Session"}</p>
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
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Date & Time</p>
                  <p className="mt-0.5 font-bold text-slate-900 dark:text-white">
                    {formatScheduleDateTime(data.date, data.startTime)} – {formatScheduleDateTime(data.date, data.endTime).split(", ")[1] || data.endTime}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Meeting Platform</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/50 px-2 py-0.5 text-[10px] font-bold">
                      {data.platform}
                    </span>
                    <span className="text-[10px] text-slate-400">({durationStr})</span>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Attendance rule</p>
                  <p className="mt-0.5 font-bold text-slate-900 dark:text-white">
                    {data.trackAttendance ? `Tracked (${data.attendanceThreshold} min)` : "No tracking"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Resources</p>
                  <p className="mt-0.5 font-bold text-slate-900 dark:text-white">
                    {data.resources.length > 0
                      ? `${data.resources.length} attached`
                      : "None attached"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Reminders</p>
                  <p className="mt-0.5 font-bold text-slate-900 dark:text-white">
                    {data.emailReminders ? "Email + In-App" : "In-App only"} ({data.reminderSchedule})
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Status</p>
                  <div className="mt-1">
                    <span
                      className={cn(
                        "rounded-md border px-2 py-0.5 text-[10px] font-bold",
                        data.status === "Scheduled"
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
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Course & Module mapped</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Calendar schedule & time</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Video platform link ready</span>
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-2",
                      data.resources.length > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"
                    )}
                  >
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {data.resources.length > 0
                        ? `Session resources (${data.resources.length} active)`
                        : "Session resources (optional)"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Attendance policy active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Attach Platform Resource Modal */}
      {showAttachModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100/80 dark:border-indigo-900/50">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Attach Platform Resource
                  </h3>
                  <p className="text-xs text-slate-400">
                    Select real database lessons, platform assignments, problems, or library PDFs.
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

            {/* Platform Library Content */}
            <div className="space-y-3 flex-1 overflow-hidden flex flex-col min-h-0">
                {/* Search Bar & Course Filter */}
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={attachSearch}
                      onChange={(e) => setAttachSearch(e.target.value)}
                      placeholder="Search lessons, assignments, problems, PDFs..."
                      className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] pl-9 pr-8 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
                    />
                    <Search className="pointer-events-none absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
                    {attachSearch && (
                      <button
                        type="button"
                        onClick={() => setAttachSearch("")}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {courseNames.length > 0 && (
                    <div className="w-full sm:w-48 shrink-0">
                      <CustomDropdown
                        value={attachCourseFilter}
                        onChange={(val) => setAttachCourseFilter(val)}
                        options={[
                          { value: "all", label: "All Courses" },
                          ...courseNames.map((c) => ({ value: c, label: c })),
                        ]}
                      />
                    </div>
                  )}
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                  {[
                    { key: "all", label: "All", count: availablePlatformResources.length },
                    { key: "lesson", label: "Lessons", count: availablePlatformResources.filter((r) => r.category === "lesson").length },
                    { key: "assignment", label: "Assignments", count: availablePlatformResources.filter((r) => r.category === "assignment").length },
                    { key: "problem", label: "Problems", count: availablePlatformResources.filter((r) => r.category === "problem").length },
                    { key: "file", label: "PDFs & Files", count: availablePlatformResources.filter((r) => r.category === "file").length },
                  ].map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setAttachCategoryFilter(cat.key as any)}
                      className={cn(
                        "px-3 py-1 rounded-xl font-semibold transition cursor-pointer shrink-0 text-xs flex items-center gap-1.5",
                        attachCategoryFilter === cat.key
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"
                      )}
                    >
                      <span>{cat.label}</span>
                      <span className={cn(
                        "rounded-full px-1.5 py-0.2 text-[10px]",
                        attachCategoryFilter === cat.key
                          ? "bg-white/20 dark:bg-black/20"
                          : "bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400"
                      )}>
                        {cat.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px] max-h-[340px]">
                  {availablePlatformResources
                    .filter((item) => {
                      if (attachCategoryFilter !== "all" && item.category !== attachCategoryFilter) {
                        return false;
                      }
                      if (attachCourseFilter !== "all" && item.course && item.course !== attachCourseFilter) {
                        return false;
                      }
                      if (attachSearch.trim()) {
                        const q = attachSearch.toLowerCase();
                        const matchName = item.name.toLowerCase().includes(q);
                        const matchType = (item.type || "").toLowerCase().includes(q);
                        const matchParent = (item.parent || "").toLowerCase().includes(q);
                        const matchCourse = (item.course || "").toLowerCase().includes(q);
                        return matchName || matchType || matchParent || matchCourse;
                      }
                      return true;
                    })
                    .map((item) => {
                      const isAttached = data.resources.some(
                        (r) => r.name.trim().toLowerCase() === item.name.trim().toLowerCase() || String(r.id) === String(item.id)
                      );
                      const iconInfo = getResourceIconInfo(item.type, item.name);
                      const IconComponent = iconInfo.icon;

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] hover:border-indigo-300 dark:hover:border-indigo-800 transition"
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border", iconInfo.bgColor)}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {item.name}
                              </p>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5 flex-wrap">
                                <span className={cn("rounded px-1.5 py-0.2 font-bold", iconInfo.badgeColor)}>
                                  {item.type}
                                </span>
                                {item.size && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate max-w-[260px]">{item.size}</span>
                                  </>
                                )}
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
                                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs active:scale-95"
                            )}
                          >
                            {isAttached ? "Attached ✓" : "+ Attach"}
                          </button>
                        </div>
                      );
                    })}

                  {availablePlatformResources.length === 0 && (
                    <div className="py-12 text-center text-xs text-slate-400">
                      <FileText className="h-6 w-6 mx-auto mb-2 opacity-40" />
                      {isLoadingPlatformResources
                        ? "Loading platform resources from database..."
                        : "No resources found in Content Library. Add lessons, notes, or assignments to the library first."}
                    </div>
                  )}

                  {availablePlatformResources.length > 0 &&
                    availablePlatformResources.filter((item) => {
                      if (attachCategoryFilter !== "all" && item.category !== attachCategoryFilter) return false;
                      if (attachCourseFilter !== "all" && item.course && item.course !== attachCourseFilter) return false;
                      if (attachSearch.trim()) {
                        const q = attachSearch.toLowerCase();
                        return (
                          item.name.toLowerCase().includes(q) ||
                          (item.type || "").toLowerCase().includes(q) ||
                          (item.parent || "").toLowerCase().includes(q)
                        );
                      }
                      return true;
                    }).length === 0 && (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No resources match your search criteria.
                      </div>
                    )}
                </div>
              </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
              <span className="text-xs text-slate-400 font-medium">
                {data.resources.length} {data.resources.length === 1 ? "resource" : "resources"} currently attached
              </span>

              <div className="flex items-center gap-2">
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
        </div>
      )}
    </div>
  );
}
