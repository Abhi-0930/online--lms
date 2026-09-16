import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  X,
  ImagePlus,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
  FileText,
  Calendar,
  Clock,
  CalendarRange,
  Sparkles,
  Info,
  Plus,
  Layers,
  FolderPlus,
  Edit3,
  BookOpen,
  Video,
  FileCheck2,
  HelpCircle,
  Tag,
  ListPlus,
  GraduationCap,
  Sparkle,
  AlertTriangle,
  GripVertical,
  Copy,
  UploadCloud,
  FileUp,
  Loader2,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  extractTextFromDocument,
  parseSyllabusText,
} from "@/lib/syllabusExtractor";

const SAMPLE_SYLLABUS_TEXT = `# Module 1: Introduction to Web Development
## Topic: HTML5 Fundamentals & Semantic Structure
- HTML5 Syntax, Doctype & Head Elements (15 mins) [Video]
- Semantic Layout: Header, Nav, Main, Section, Article (20 mins) [Video]
- Working with Forms, Inputs & Modern Validation (25 mins) [Video]
- HTML5 Semantic Structure Quiz (10 mins) [Quiz]

## Topic: Modern CSS & Flexbox Layouts
- CSS Selectors, Specificity & Box Model (20 mins) [Video]
- Flexbox Architecture & Responsive Alignments (30 mins) [Video]
- CSS Grid Systems & Media Queries (35 mins) [Video]
- Build a Responsive Product Landing Page (45 mins) [Assignment]

# Module 2: JavaScript Core & DOM Mastery
## Topic: JavaScript ES6+ Fundamentals
- Variables, Scope, Arrow Functions & Destructuring (25 mins) [Video]
- Array Methods: Map, Filter, Reduce & Find (30 mins) [Video]
- Promises, Async/Await & Fetch API (35 mins) [Video]
- JavaScript Core Logic Quiz (15 mins) [Quiz]

## Topic: Dynamic DOM Manipulation & Events
- DOM Selectors, Class Manipulation & Styling (20 mins) [Video]
- Event Listeners, Delegation & Bubbling (25 mins) [Video]
- Interactive Task Management App (1 hr) [Assignment]

# Module 3: Advanced Frontend & Backend Integration
## Topic: REST APIs & Asynchronous State
- RESTful Architecture & HTTP Methods (25 mins) [Video]
- Fetching & Rendering Dynamic Data (30 mins) [Video]
- Real-time API Weather Dashboard Project (1.5 hr) [Assignment]`;


export interface Subtopic {
  id: string;
  title: string;
  type?: "Video" | "Article" | "Quiz" | "Assignment";
  duration?: string;
}

export interface Topic {
  id: string;
  title: string;
  description?: string;
  subtopics: Subtopic[];
}

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  topics: Topic[];
}

export interface CourseBuilderData {
  id?: string;
  // Step 1: Basic Information
  title: string;
  subtitle: string;
  description: string;
  language: string;
  category: string;
  level: string;
  thumbnail: File | null;
  thumbnailPreview: string | null;

  // Step 2: Pricing & Access
  courseType: "Paid" | "Free";
  price: string;
  discountPrice: string;
  currency: string;
  accessType: "Lifetime Access" | "Fixed Duration" | "Subscription";
  durationCycleMode?: "Date Range" | "Relative Duration";
  startDate?: string;
  endDate?: string;
  durationValue?: string;
  durationUnit?: "Days" | "Weeks" | "Months" | "Years";
  subscriptionCycle?: "Monthly" | "Quarterly" | "Yearly";
  enrollmentLimit: string;
  courseVisibility: "Public" | "Private" | "Unlisted";

  // Step 3: Course Curriculum
  modules: CourseModule[];

  // Step 4: Additional Details
  instructorName?: string;
  skillsCovered?: string[];
  prerequisites?: string;
  estimatedDuration?: string;
  certificateAvailable?: boolean;
  courseStatus?: "Draft" | "Published" | "Under Review" | "Archived";
  seoTitle?: string;
  seoDescription?: string;
  targetAudience?: string;
  learningOutcomes?: string[];

  requirements?: string[];
  targetLearners?: string[];
  tags?: string[];
}

interface CourseBuilderProps {
  onClose: () => void;
  onSaveDraft?: (data: CourseBuilderData) => void;
  onContinue?: (data: CourseBuilderData) => void;
  initialData?: Partial<CourseBuilderData>;
  initialStep?: number;
}

const CATEGORIES = [
  "Web Development",
  "Data Structures & Algorithms",
  "System Design",
  "Artificial Intelligence & ML",
  "Cloud & DevOps",
  "Mobile Development",
  "Cybersecurity",
  "Database & Backend",
];

const LEVELS = ["Beginner", "Intermediate", "Advanced", "All Levels"];

const LANGUAGES = [
  "English",
  "Hindi",
  "Spanish",
  "French",
  "German",
  "Mandarin",
  "Japanese",
];

const CURRENCIES = ["INR ₹", "USD $", "EUR €", "GBP £"];

const COURSE_STATUSES = ["Draft", "Published", "Under Review", "Archived"];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function calculateDateDiffString(startDateStr?: string, endDateStr?: string): string {
  if (!startDateStr || !endDateStr) return "";
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (isNaN(diffDays)) return "";
  if (diffDays < 0) return "Invalid date range";
  if (diffDays === 0) return "1 day (Same day)";
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
  const months = Math.floor(diffDays / 30);
  const remDays = diffDays % 30;
  if (remDays === 0) return `${months} month${months > 1 ? "s" : ""} (${diffDays} days)`;
  return `${diffDays} days (~${months} mo ${remDays} d)`;
}

function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts;
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function BuilderDropdown({
  value,
  onChange,
  options,
  placeholder = "Select",
  error,
  className,
}: {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  error?: boolean;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutside);
    }
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen]);

  const displayLabel = value || placeholder;
  const isSelected = !!value;

  return (
    <div ref={dropdownRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3 text-left text-xs sm:text-[13px] font-medium transition-all duration-150 select-none shadow-xs cursor-pointer",
          isOpen
            ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs"
            : error
            ? "border-rose-400 bg-rose-50/20"
            : "border-slate-200 hover:border-slate-300 text-slate-900"
        )}
      >
        <span
          className={cn(
            "truncate",
            isSelected ? "text-slate-800 font-semibold" : "text-slate-400"
          )}
        >
          {displayLabel}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2",
            isOpen && "rotate-180 text-indigo-600"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="space-y-0.5">
            {options.map((opt) => {
              const active = opt === value;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs sm:text-[13px] font-medium transition-colors cursor-pointer",
                    active
                      ? "bg-indigo-50 font-bold text-indigo-700"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <span className="truncate">{opt}</span>
                  {active && (
                    <Check className="h-4 w-4 shrink-0 text-indigo-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CustomDatePicker({
  value,
  onChange,
  placeholder = "Select date",
  minDate,
  maxDate,
  error,
  className,
}: {
  value?: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  error?: boolean;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"days" | "months" | "years">("days");
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Initialize view year & month from selected value or current date
  const parseYearMonth = () => {
    if (value) {
      const parts = value.split("-");
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        if (!isNaN(y) && !isNaN(m)) {
          return { y, m };
        }
      }
    }
    const today = new Date();
    return { y: today.getFullYear(), m: today.getMonth() };
  };

  const initial = parseYearMonth();
  const [viewYear, setViewYear] = useState<number>(initial.y);
  const [viewMonth, setViewMonth] = useState<number>(initial.m);
  const [yearPageStart, setYearPageStart] = useState<number>(
    () => Math.floor(initial.y / 12) * 12
  );

  React.useEffect(() => {
    if (value) {
      const parts = value.split("-");
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        if (!isNaN(y) && !isNaN(m)) {
          setViewYear(y);
          setViewMonth(m);
          setYearPageStart(Math.floor(y / 12) * 12);
        }
      }
    }
  }, [value]);

  React.useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setViewMode("days");
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutside);
    }
    return () => document.removeEventListener("mousedown", handleOutside);
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

  const calendarDays = React.useMemo(() => {
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

  const todayStr = new Date().toISOString().split("T")[0];
  const isSelected = !!value;

  const currentSelectedYear = value ? parseInt(value.split("-")[0], 10) : null;
  const currentSelectedMonth = value ? parseInt(value.split("-")[1], 10) - 1 : null;

  return (
    <div ref={datePickerRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setViewMode("days");
        }}
        className={cn(
          "flex w-full items-center justify-between rounded-xl border bg-white px-3.5 py-2.5 text-left text-xs sm:text-[13px] font-medium transition-all duration-150 select-none shadow-xs cursor-pointer",
          isOpen
            ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs"
            : error
            ? "border-rose-400 bg-rose-50/20"
            : "border-slate-200 hover:border-slate-300 text-slate-800"
        )}
      >
        <span className="flex items-center gap-2 truncate">
          <Calendar
            className={cn(
              "h-4 w-4 shrink-0 transition-colors",
              isSelected ? "text-indigo-600" : "text-slate-400"
            )}
          />
          <span
            className={cn(
              "truncate",
              isSelected ? "text-slate-800 font-semibold" : "text-slate-400"
            )}
          >
            {isSelected ? formatDisplayDate(value) : placeholder}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ml-1.5",
            isOpen && "rotate-180 text-indigo-600"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-72 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-100 select-none">
          {/* Calendar Header with Navigation and Clickable Month & Year Selectors */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
            <button
              type="button"
              onClick={handlePrev}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer shrink-0"
              title="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Middle Title with Clickable Selectors */}
            <div className="flex items-center gap-1">
              {viewMode === "days" && (
                <>
                  <button
                    type="button"
                    onClick={() => setViewMode("months")}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold text-slate-800 hover:bg-indigo-50 hover:text-indigo-600 transition cursor-pointer"
                    title="Click to select month"
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
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold text-slate-800 hover:bg-indigo-50 hover:text-indigo-600 transition cursor-pointer"
                    title="Click to select year"
                  >
                    <span>{viewYear}</span>
                    <ChevronDown className="h-3 w-3 text-slate-400" />
                  </button>
                </>
              )}

              {viewMode === "months" && (
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-800">Month</span>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setYearPageStart(Math.floor(viewYear / 12) * 12);
                      setViewMode("years");
                    }}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                  >
                    {viewYear}
                    <ChevronDown className="h-3 w-3 text-indigo-400" />
                  </button>
                </div>
              )}

              {viewMode === "years" && (
                <span className="text-xs font-bold text-slate-800">
                  {yearPageStart} – {yearPageStart + 11}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer shrink-0"
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
                  <span
                    key={wd}
                    className="text-[10px] font-bold text-slate-400 uppercase py-0.5"
                  >
                    {wd}
                  </span>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {calendarDays.map((d) => {
                  const isCurrentSelected = d.dateStr === value;
                  const isToday = d.dateStr === todayStr;
                  const isDisabled = Boolean(
                    (minDate && d.dateStr < minDate) ||
                    (maxDate && d.dateStr > maxDate)
                  );

                  return (
                    <button
                      key={d.dateStr}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => {
                        onChange(d.dateStr);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "flex h-7 w-7 mx-auto items-center justify-center rounded-lg text-xs font-medium transition-all duration-100 cursor-pointer",
                        isCurrentSelected
                          ? "bg-indigo-600 text-white font-bold shadow-xs hover:bg-indigo-700"
                          : isToday
                          ? "border border-indigo-300 text-indigo-700 font-semibold bg-indigo-50/50 hover:bg-indigo-100"
                          : d.isCurrentMonth
                          ? "text-slate-700 hover:bg-slate-100"
                          : "text-slate-300 hover:bg-slate-50",
                        isDisabled &&
                          "opacity-25 cursor-not-allowed hover:bg-transparent text-slate-300 pointer-events-none"
                      )}
                    >
                      {d.dayNum}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* VIEW 2: Month Selector Grid */}
          {viewMode === "months" && (
            <div className="grid grid-cols-3 gap-2 py-1">
              {MONTH_NAMES.map((mName, mIdx) => {
                const isSelectedMonth =
                  currentSelectedYear === viewYear && currentSelectedMonth === mIdx;
                const isCurrentViewingMonth = viewMonth === mIdx;

                return (
                  <button
                    key={mName}
                    type="button"
                    onClick={() => {
                      setViewMonth(mIdx);
                      setViewMode("days");
                    }}
                    className={cn(
                      "py-2 px-2 rounded-xl text-xs font-semibold transition cursor-pointer text-center",
                      isSelectedMonth
                        ? "bg-indigo-600 text-white font-bold shadow-xs"
                        : isCurrentViewingMonth
                        ? "border border-indigo-300 bg-indigo-50 text-indigo-700 font-bold"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    {mName.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          )}

          {/* VIEW 3: Year Selector Grid */}
          {viewMode === "years" && (
            <div className="grid grid-cols-3 gap-2 py-1">
              {Array.from({ length: 12 }, (_, i) => yearPageStart + i).map((yr) => {
                const isSelectedYr = currentSelectedYear === yr;
                const isCurrentViewingYr = viewYear === yr;
                const isActualCurrentYr = new Date().getFullYear() === yr;

                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => {
                      setViewYear(yr);
                      setViewMode("days");
                    }}
                    className={cn(
                      "py-2 px-2 rounded-xl text-xs font-semibold transition cursor-pointer text-center",
                      isSelectedYr
                        ? "bg-indigo-600 text-white font-bold shadow-xs"
                        : isCurrentViewingYr
                        ? "border border-indigo-300 bg-indigo-50 text-indigo-700 font-bold"
                        : isActualCurrentYr
                        ? "border border-slate-300 text-indigo-600 font-bold hover:bg-slate-100"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    {yr}
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer with Today / Clear / View mode reset shortcuts */}
          <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 text-[11px]">
            {viewMode !== "days" ? (
              <button
                type="button"
                onClick={() => setViewMode("days")}
                className="text-indigo-600 hover:text-indigo-700 font-bold cursor-pointer transition"
              >
                ← Back to Calendar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  setViewYear(today.getFullYear());
                  setViewMonth(today.getMonth());
                  setYearPageStart(Math.floor(today.getFullYear() / 12) * 12);
                  onChange(todayStr);
                  setIsOpen(false);
                }}
                className="text-indigo-600 hover:text-indigo-700 font-bold cursor-pointer transition"
              >
                Select Today
              </button>
            )}
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                  setViewMode("days");
                }}
                className="text-slate-400 hover:text-slate-600 font-medium cursor-pointer transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CourseBuilder({
  onClose,
  onSaveDraft,
  onContinue,
  initialData,
  initialStep = 1,
}: CourseBuilderProps) {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [formData, setFormData] = useState<CourseBuilderData>({
    id: initialData?.id || undefined,
    title: initialData?.title || "",
    subtitle: initialData?.subtitle || "",
    description: initialData?.description || "",
    language: initialData?.language || "English",
    category: initialData?.category || "Development",
    level: initialData?.level || "Beginner",
    thumbnail: initialData?.thumbnail || null,
    thumbnailPreview: initialData?.thumbnailPreview || null,

    courseType: initialData?.courseType || "Paid",
    price: initialData?.price || "18,999",
    discountPrice: initialData?.discountPrice || "14,999",
    currency: initialData?.currency || "INR ₹",
    accessType: initialData?.accessType || "Lifetime Access",
    durationCycleMode: initialData?.durationCycleMode || "Date Range",
    startDate: initialData?.startDate || new Date().toISOString().split("T")[0],
    endDate:
      initialData?.endDate ||
      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    durationValue: initialData?.durationValue || "90",
    durationUnit: initialData?.durationUnit || "Days",
    subscriptionCycle: initialData?.subscriptionCycle || "Monthly",
    enrollmentLimit: initialData?.enrollmentLimit || "Unlimited",
    courseVisibility: initialData?.courseVisibility || "Public",
    modules: initialData?.modules || [],
    instructorName:
      initialData?.instructorName ||
      (initialData as any)?.instructor ||
      "",
    skillsCovered:
      initialData?.skillsCovered || initialData?.tags || [],
    prerequisites:
      initialData?.prerequisites ||
      (Array.isArray(initialData?.requirements)
        ? initialData.requirements.join("\n")
        : initialData?.requirements || ""),
    estimatedDuration: initialData?.estimatedDuration || "12 Weeks",
    certificateAvailable:
      initialData?.certificateAvailable !== undefined
        ? initialData.certificateAvailable
        : true,
    courseStatus: initialData?.courseStatus || "Draft",
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    targetAudience:
      initialData?.targetAudience ||
      (Array.isArray(initialData?.targetLearners)
        ? initialData.targetLearners.join(", ")
        : initialData?.targetLearners ||
          ""),
    learningOutcomes: initialData?.learningOutcomes || [],
    requirements: initialData?.requirements || [""],
    targetLearners: initialData?.targetLearners || [""],
    tags: initialData?.tags || [],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        title: initialData.title || "",
        subtitle: initialData.subtitle || "",
        description: initialData.description || "",
        language: initialData.language || "English",
        category: initialData.category || "Development",
        level: initialData.level || "Beginner",
        thumbnail: initialData.thumbnail || null,
        thumbnailPreview: initialData.thumbnailPreview || null,
        courseType: initialData.courseType || "Paid",
        price: initialData.price || "18,999",
        discountPrice: initialData.discountPrice || "14,999",
        currency: initialData.currency || "INR ₹",
        accessType: initialData.accessType || "Lifetime Access",
        durationCycleMode: initialData.durationCycleMode || "Date Range",
        startDate: initialData.startDate || new Date().toISOString().split("T")[0],
        endDate:
          initialData.endDate ||
          new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        durationValue: initialData.durationValue || "90",
        durationUnit: initialData.durationUnit || "Days",
        subscriptionCycle: initialData.subscriptionCycle || "Monthly",
        enrollmentLimit: initialData.enrollmentLimit || "Unlimited",
        courseVisibility: initialData.courseVisibility || "Public",
        modules: initialData.modules || [],
        instructorName:
          initialData.instructorName ||
          (initialData as any)?.instructor ||
          "",
        skillsCovered:
          initialData.skillsCovered || initialData.tags || [],
        prerequisites:
          initialData.prerequisites ||
          (Array.isArray(initialData.requirements)
            ? initialData.requirements.join("\n")
            : initialData.requirements || ""),
        estimatedDuration: initialData.estimatedDuration || "12 Weeks",
        certificateAvailable:
          initialData.certificateAvailable !== undefined
            ? initialData.certificateAvailable
            : true,
        courseStatus: initialData.courseStatus || "Draft",
        seoTitle: initialData.seoTitle || "",
        seoDescription: initialData.seoDescription || "",
        targetAudience:
          initialData.targetAudience ||
          (Array.isArray(initialData.targetLearners)
            ? initialData.targetLearners.join(", ")
            : initialData.targetLearners ||
              ""),
        learningOutcomes: initialData.learningOutcomes || [],
        requirements: initialData.requirements || [""],
        targetLearners: initialData.targetLearners || [""],
        tags: initialData.tags || [],
      });
      setCurrentStep(1);
    }
  }, [initialData]);

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Curriculum modal state
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");

  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState<string | null>(null);
  const [topicTitle, setTopicTitle] = useState("");

  const [isSubtopicModalOpen, setIsSubtopicModalOpen] = useState(false);
  const [targetTopicId, setTargetTopicId] = useState<string | null>(null);
  const [editingSubtopicId, setEditingSubtopicId] = useState<string | null>(null);
  const [subtopicTitle, setSubtopicTitle] = useState("");
  const [subtopicType, setSubtopicType] = useState<"Video" | "Article" | "Quiz" | "Assignment">("Video");
  const [subtopicDuration, setSubtopicDuration] = useState("");

  // Step 4 state helpers
  const [skillInput, setSkillInput] = useState("");
  const [outcomeInput, setOutcomeInput] = useState("");
  const [newTagInput, setNewTagInput] = useState("");

  // Module expansion state (all expanded by default)
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const toggleModuleExpand = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: prev[modId] === undefined ? false : !prev[modId],
    }));
  };

  const handleDuplicateModule = (mod: CourseModule) => {
    const newMod: CourseModule = {
      id: "mod_" + Date.now(),
      title: `${mod.title} (Copy)`,
      description: mod.description,
      topics: mod.topics.map((t, idx) => ({
        ...t,
        id: "top_" + Date.now() + "_" + idx,
        subtopics: t.subtopics.map((s, sIdx) => ({
          ...s,
          id: "sub_" + Date.now() + "_" + sIdx,
        })),
      })),
    };
    setFormData((prev) => ({
      ...prev,
      modules: [...prev.modules, newMod],
    }));
    setExpandedModules((prev) => ({ ...prev, [newMod.id]: true }));
  };

  // Inline topic inputs per module
  const [topicInputs, setTopicInputs] = useState<Record<string, string>>({});

  const handleInlineAddTopic = (modId: string) => {
    const text = (topicInputs[modId] || "").trim();
    if (!text) {
      openAddTopic(modId);
      return;
    }
    const newTopic: Topic = {
      id: "top_" + Date.now(),
      title: text,
      subtopics: [],
    };
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === modId ? { ...m, topics: [...m.topics, newTopic] } : m
      ),
    }));
    setTopicInputs((prev) => ({ ...prev, [modId]: "" }));
  };

  // Auto-extraction from document / text state (Pure JS, no Python)
  const [isExtractModalOpen, setIsExtractModalOpen] = useState(false);
  const [extractTab, setExtractTab] = useState<"upload" | "paste">("upload");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractSuccessMsg, setExtractSuccessMsg] = useState<string | null>(null);
  const [uploadedDocFile, setUploadedDocFile] = useState<File | null>(null);
  const [pastedRawText, setPastedRawText] = useState("");
  const [extractedPreviewModules, setExtractedPreviewModules] = useState<CourseModule[]>([]);
  const [extractMergeMode, setExtractMergeMode] = useState<"replace" | "append">("replace");
  const docFileInputRef = useRef<HTMLInputElement>(null);

  const handleDocFileSelect = async (file: File) => {
    if (!file) return;
    setUploadedDocFile(file);
    setExtractError(null);
    setExtractSuccessMsg(null);
    setIsExtracting(true);

    try {
      const rawText = await extractTextFromDocument(file);
      if (!rawText || !rawText.trim()) {
        throw new Error(
          "Could not extract readable text from this document. Please ensure the document is not an image-only scan."
        );
      }
      const parsed = parseSyllabusText(rawText);
      if (parsed.length === 0) {
        throw new Error(
          "No modules or topics could be identified from the document text. Try pasting the text directly in the Paste Text tab."
        );
      }
      setExtractedPreviewModules(parsed);
      const totalT = parsed.reduce((acc, m) => acc + m.topics.length, 0);
      const totalS = parsed.reduce(
        (acc, m) =>
          acc + m.topics.reduce((tAcc, t) => tAcc + t.subtopics.length, 0),
        0
      );
      setExtractSuccessMsg(
        `Successfully extracted ${parsed.length} Module(s), ${totalT} Topic(s), and ${totalS} Subtopic(s)!`
      );
    } catch (err: any) {
      console.error("Document extraction error:", err);
      setExtractError(
        err.message ||
          "Failed to parse document. Please check the file format or try pasting text."
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const handleParsePastedText = () => {
    if (!pastedRawText.trim()) {
      setExtractError("Please paste some syllabus or curriculum text first.");
      return;
    }
    setExtractError(null);
    setExtractSuccessMsg(null);
    try {
      const parsed = parseSyllabusText(pastedRawText);
      if (parsed.length === 0) {
        throw new Error(
          "No modules could be identified from the text. Check the formatting or click 'Load Sample Template'."
        );
      }
      setExtractedPreviewModules(parsed);
      const totalT = parsed.reduce((acc, m) => acc + m.topics.length, 0);
      const totalS = parsed.reduce(
        (acc, m) =>
          acc + m.topics.reduce((tAcc, t) => tAcc + t.subtopics.length, 0),
        0
      );
      setExtractSuccessMsg(
        `Successfully extracted ${parsed.length} Module(s), ${totalT} Topic(s), and ${totalS} Subtopic(s)!`
      );
    } catch (err: any) {
      setExtractError(err.message || "Failed to parse text.");
    }
  };

  const handleApplyExtractedCurriculum = () => {
    if (extractedPreviewModules.length === 0) return;

    if (extractMergeMode === "replace") {
      setFormData((prev) => ({
        ...prev,
        modules: extractedPreviewModules,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        modules: [...prev.modules, ...extractedPreviewModules],
      }));
    }

    // Automatically expand all newly added modules
    const newExp: Record<string, boolean> = { ...expandedModules };
    extractedPreviewModules.forEach((m) => {
      newExp[m.id] = true;
    });
    setExpandedModules(newExp);

    // Reset and close
    setIsExtractModalOpen(false);
    setExtractedPreviewModules([]);
    setUploadedDocFile(null);
    setPastedRawText("");
    setExtractSuccessMsg(null);
    setExtractError(null);
  };


  const totalModulesCount = formData.modules?.length || 0;
  const totalTopicsCount =
    formData.modules?.reduce((acc, m) => acc + (m.topics?.length || 0), 0) || 0;
  const totalSubtopicsCount =
    formData.modules?.reduce(
      (acc, m) =>
        acc +
        (m.topics?.reduce((tAcc, t) => tAcc + (t.subtopics?.length || 0), 0) || 0),
      0
    ) || 0;

  const openAddModule = () => {
    setEditingModuleId(null);
    setModuleTitle("");
    setModuleDescription("");
    setIsModuleModalOpen(true);
  };

  const openEditModule = (mod: CourseModule) => {
    setEditingModuleId(mod.id);
    setModuleTitle(mod.title);
    setModuleDescription(mod.description || "");
    setIsModuleModalOpen(true);
  };

  const handleSaveModule = () => {
    if (!moduleTitle.trim()) return;
    if (editingModuleId) {
      setFormData((prev) => ({
        ...prev,
        modules: prev.modules.map((m) =>
          m.id === editingModuleId
            ? { ...m, title: moduleTitle.trim(), description: moduleDescription.trim() }
            : m
        ),
      }));
    } else {
      const newMod: CourseModule = {
        id: "mod_" + Date.now(),
        title: moduleTitle.trim(),
        description: moduleDescription.trim(),
        topics: [],
      };
      setFormData((prev) => ({
        ...prev,
        modules: [...prev.modules, newMod],
      }));
    }
    setIsModuleModalOpen(false);
  };

  // Delete confirmation alert state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    title: string;
    targetName: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    targetName: "",
    message: "",
    onConfirm: () => {},
  });

  const promptDeleteModule = (mod: CourseModule) => {
    setDeleteConfirm({
      isOpen: true,
      title: "Delete Module?",
      targetName: mod.title,
      message:
        "Are you sure you want to delete this module? All topics and subtopics inside it will also be permanently removed.",
      onConfirm: () => {
        setFormData((prev) => ({
          ...prev,
          modules: prev.modules.filter((m) => m.id !== mod.id),
        }));
        setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const openAddTopic = (modId: string) => {
    setTargetModuleId(modId);
    setTopicTitle("");
    setIsTopicModalOpen(true);
  };

  const handleSaveTopic = () => {
    if (!targetModuleId || !topicTitle.trim()) return;
    const newTopic: Topic = {
      id: "top_" + Date.now(),
      title: topicTitle.trim(),
      subtopics: [],
    };
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === targetModuleId
          ? { ...m, topics: [...m.topics, newTopic] }
          : m
      ),
    }));
    setIsTopicModalOpen(false);
  };

  const promptDeleteTopic = (modId: string, topic: Topic) => {
    setDeleteConfirm({
      isOpen: true,
      title: "Delete Topic?",
      targetName: topic.title,
      message:
        "Are you sure you want to delete this topic? All subtopics and lessons inside it will also be removed.",
      onConfirm: () => {
        setFormData((prev) => ({
          ...prev,
          modules: prev.modules.map((m) =>
            m.id === modId
              ? { ...m, topics: m.topics.filter((t) => t.id !== topic.id) }
              : m
          ),
        }));
        setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const openAddSubtopic = (modId: string, topicId: string) => {
    setTargetModuleId(modId);
    setTargetTopicId(topicId);
    setEditingSubtopicId(null);
    setSubtopicTitle("");
    setSubtopicType("Video");
    setSubtopicDuration("");
    setIsSubtopicModalOpen(true);
  };

  const openEditSubtopic = (modId: string, topicId: string, sub: Subtopic) => {
    setTargetModuleId(modId);
    setTargetTopicId(topicId);
    setEditingSubtopicId(sub.id);
    setSubtopicTitle(sub.title);
    setSubtopicType(sub.type || "Video");
    setSubtopicDuration(sub.duration || "");
    setIsSubtopicModalOpen(true);
  };

  const handleSaveSubtopic = () => {
    if (!targetModuleId || !targetTopicId || !subtopicTitle.trim()) return;

    if (editingSubtopicId) {
      setFormData((prev) => ({
        ...prev,
        modules: prev.modules.map((m) =>
          m.id === targetModuleId
            ? {
                ...m,
                topics: m.topics.map((t) =>
                  t.id === targetTopicId
                    ? {
                        ...t,
                        subtopics: t.subtopics.map((s) =>
                          s.id === editingSubtopicId
                            ? {
                                ...s,
                                title: subtopicTitle.trim(),
                                type: subtopicType,
                                duration: subtopicDuration.trim() || undefined,
                              }
                            : s
                        ),
                      }
                    : t
                ),
              }
            : m
        ),
      }));
    } else {
      const newSub: Subtopic = {
        id: "sub_" + Date.now(),
        title: subtopicTitle.trim(),
        type: subtopicType,
        duration: subtopicDuration.trim() || undefined,
      };
      setFormData((prev) => ({
        ...prev,
        modules: prev.modules.map((m) =>
          m.id === targetModuleId
            ? {
                ...m,
                topics: m.topics.map((t) =>
                  t.id === targetTopicId
                    ? { ...t, subtopics: [...t.subtopics, newSub] }
                    : t
                ),
              }
            : m
        ),
      }));
    }
    setIsSubtopicModalOpen(false);
  };

  const promptDeleteSubtopic = (modId: string, topicId: string, sub: Subtopic) => {
    setDeleteConfirm({
      isOpen: true,
      title: "Delete Subtopic?",
      targetName: sub.title,
      message: `Are you sure you want to delete this ${sub.type || "subtopic"} lesson from the curriculum?`,
      onConfirm: () => {
        setFormData((prev) => ({
          ...prev,
          modules: prev.modules.map((m) =>
            m.id === modId
              ? {
                  ...m,
                  topics: m.topics.map((t) =>
                    t.id === topicId
                      ? { ...t, subtopics: t.subtopics.filter((s) => s.id !== sub.id) }
                      : t
                  ),
                }
              : m
          ),
        }));
        setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Step 4 Helper Functions
  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    const rawSkills = skillInput
      .split(/[,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (rawSkills.length === 0) return;

    setFormData((prev) => {
      const existing = prev.skillsCovered || [];
      const newSkills = rawSkills.filter((s) => !existing.includes(s));
      return {
        ...prev,
        skillsCovered: [...existing, ...newSkills],
        tags: [...(prev.tags || []), ...newSkills],
      };
    });
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skillsCovered: prev.skillsCovered?.filter((s) => s !== skillToRemove) || [],
      tags: prev.tags?.filter((t) => t !== skillToRemove) || [],
    }));
  };

  const handleAddLearningOutcome = () => {
    if (!outcomeInput.trim()) return;
    const outcome = outcomeInput.trim();
    setFormData((prev) => ({
      ...prev,
      learningOutcomes: [...(prev.learningOutcomes || []), outcome],
    }));
    setOutcomeInput("");
  };

  const handleRemoveLearningOutcome = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      learningOutcomes: prev.learningOutcomes?.filter((_, i) => i !== index) || [],
    }));
  };
  const handleAddRequirement = () => {
    setFormData((prev) => ({
      ...prev,
      requirements: [...(prev.requirements || []), ""],
    }));
  };

  const handleUpdateRequirement = (index: number, val: string) => {
    setFormData((prev) => {
      const reqs = [...(prev.requirements || [])];
      reqs[index] = val;
      return { ...prev, requirements: reqs };
    });
  };

  const handleRemoveRequirement = (index: number) => {
    setFormData((prev) => {
      const reqs = [...(prev.requirements || [])];
      reqs.splice(index, 1);
      return { ...prev, requirements: reqs.length ? reqs : [""] };
    });
  };

  const handleAddLearner = () => {
    setFormData((prev) => ({
      ...prev,
      targetLearners: [...(prev.targetLearners || []), ""],
    }));
  };

  const handleUpdateLearner = (index: number, val: string) => {
    setFormData((prev) => {
      const list = [...(prev.targetLearners || [])];
      list[index] = val;
      return { ...prev, targetLearners: list };
    });
  };

  const handleRemoveLearner = (index: number) => {
    setFormData((prev) => {
      const list = [...(prev.targetLearners || [])];
      list.splice(index, 1);
      return { ...prev, targetLearners: list.length ? list : [""] };
    });
  };

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const tag = newTagInput.trim();
    if (!formData.tags?.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tag],
      }));
    }
    setNewTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tagToRemove) || [],
    }));
  };

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should not exceed 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        thumbnail: file,
        thumbnailPreview: reader.result as string,
      }));
      setErrors((prev) => ({ ...prev, thumbnail: false }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const promptRemoveThumbnail = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm({
      isOpen: true,
      title: "Remove Thumbnail?",
      targetName: formData.thumbnail?.name || "Course Thumbnail",
      message: "Are you sure you want to remove the current course thumbnail image?",
      onConfirm: () => {
        setFormData((prev) => ({
          ...prev,
          thumbnail: null,
          thumbnailPreview: null,
        }));
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const validateStep1 = () => {
    const newErrors: Record<string, boolean> = {};
    if (!formData.title.trim()) newErrors.title = true;
    if (!formData.description.trim()) newErrors.description = true;
    if (!formData.category) newErrors.category = true;
    if (!formData.level) newErrors.level = true;
    if (!formData.language) newErrors.language = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, boolean> = {};
    if (formData.courseType === "Paid" && !formData.price.trim()) {
      newErrors.price = true;
    }
    if (formData.accessType === "Fixed Duration") {
      if (formData.durationCycleMode === "Date Range") {
        if (!formData.startDate) newErrors.startDate = true;
        if (!formData.endDate) newErrors.endDate = true;
        if (
          formData.startDate &&
          formData.endDate &&
          formData.endDate < formData.startDate
        ) {
          newErrors.endDateOrder = true;
        }
      } else {
        if (!formData.durationValue || parseInt(formData.durationValue, 10) <= 0) {
          newErrors.durationValue = true;
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    if (onSaveDraft) {
      await onSaveDraft(formData);
    }
    setIsSaving(false);
  };

  const handleContinue = () => {
    if (currentStep === 1) {
      const isValid = validateStep1();
      if (!isValid) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      const isValid = validateStep2();
      if (!isValid) return;
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (onContinue) {
        onContinue(formData);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const steps = [
    { number: 1, label: "Basic Information" },
    { number: 2, label: "Pricing & Access" },
    { number: 3, label: "Course Curriculum" },
    { number: 4, label: "Additional Details" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-16">
      {/* Top Navigation Header */}
      <div className="mx-auto max-w-[1100px] px-6 pt-6 pb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 text-xs sm:text-[13px] font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to courses
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition cursor-pointer"
          title="Close course builder"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Course Builder Header */}
      <div className="mx-auto max-w-[1100px] px-6 mt-3">
        <p className="text-[11px] font-bold tracking-[0.14em] text-indigo-600 uppercase">
          COURSE BUILDER
        </p>
        <h1 className="font-display text-2xl sm:text-[32px] font-extrabold text-slate-900 tracking-tight mt-1">
          {currentStep === 1
            ? "Basic Information"
            : currentStep === 2
            ? "Pricing & Access"
            : currentStep === 3
            ? "Course Curriculum"
            : "Additional Details"}
        </h1>
        <p className="text-xs sm:text-[13px] text-slate-500 mt-1">
          {currentStep === 1
            ? "Add the core information about your course."
            : currentStep === 2
            ? "Configure pricing and course accessibility."
            : currentStep === 3
            ? "Create the structure of your course."
            : "Add requirements, targeted learners, and course tags."}
        </p>
      </div>

      {/* Stepper Progress Bar with Connector Lines */}
      <div className="mx-auto max-w-[1100px] px-6 mt-8">
        <div className="grid grid-cols-4 gap-2 sm:gap-4 relative">
          {steps.map((step, index) => {
            const isActive = step.number === currentStep;
            const isCompleted = step.number < currentStep;

            return (
              <div
                key={step.number}
                className="flex flex-col items-start select-none relative"
              >
                <div className="flex items-center w-full">
                  <div
                    onClick={() => {
                      if (step.number < currentStep) {
                        setCurrentStep(step.number);
                      }
                    }}
                    className={cn(
                      "flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-xs font-bold transition-all z-10 shrink-0",
                      isCompleted
                        ? "bg-emerald-500 text-white cursor-pointer"
                        : isActive
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/25"
                        : "text-slate-400 font-semibold"
                    )}
                  >
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.number}
                  </div>

                  {/* Connecting Line to next step */}
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-[2px] mx-2 transition-colors",
                        isCompleted
                          ? "bg-emerald-500"
                          : "bg-slate-200"
                      )}
                    />
                  )}
                </div>

                <span
                  className={cn(
                    "mt-2 text-[11px] sm:text-xs tracking-tight",
                    isActive
                      ? "font-bold text-slate-900"
                      : isCompleted
                      ? "font-medium text-slate-600"
                      : "font-medium text-slate-400"
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Form Card */}
      <div className="mx-auto max-w-[1100px] px-6 mt-7">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleContinue();
            }}
          >
            {/* STEP 1: Basic Information */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 animate-in fade-in-50 duration-200">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Course Title */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800">
                      Course Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, title: e.target.value }));
                        if (errors.title) setErrors((prev) => ({ ...prev, title: false }));
                      }}
                      placeholder="e.g. Data Structures & Algorithms"
                      className={cn(
                        "mt-2 w-full rounded-xl border bg-white px-4 py-3 text-xs sm:text-[13px] font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-xs",
                        errors.title
                          ? "border-rose-400 bg-rose-50/20"
                          : "border-slate-200 hover:border-slate-300"
                      )}
                    />
                    {errors.title && (
                      <p className="mt-1 text-[11px] font-semibold text-rose-500">
                        Course title is required.
                      </p>
                    )}
                  </div>

                  {/* Short Description */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800">
                      Short Description <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }));
                        if (errors.description)
                          setErrors((prev) => ({ ...prev, description: false }));
                      }}
                      placeholder="What will learners achieve by the end of this course?"
                      className={cn(
                        "mt-2 w-full rounded-xl border bg-white px-4 py-3 text-xs sm:text-[13px] font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition shadow-xs",
                        errors.description
                          ? "border-rose-400 bg-rose-50/20"
                          : "border-slate-200 hover:border-slate-300"
                      )}
                    />
                    {errors.description && (
                      <p className="mt-1 text-[11px] font-semibold text-rose-500">
                        Short description is required.
                      </p>
                    )}
                  </div>

                  {/* Course Language */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-2">
                      Course Language <span className="text-rose-500">*</span>
                    </label>
                    <BuilderDropdown
                      value={formData.language}
                      onChange={(val) => {
                        setFormData((prev) => ({ ...prev, language: val }));
                        if (errors.language)
                          setErrors((prev) => ({ ...prev, language: false }));
                      }}
                      options={LANGUAGES}
                      placeholder="Select language"
                      error={errors.language}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Course Subtitle */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800">
                      Course Subtitle
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          subtitle: e.target.value,
                        }))
                      }
                      placeholder="A practical path from fundamentals to interviews"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs sm:text-[13px] font-medium placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-xs"
                    />
                  </div>

                  {/* Side-by-side Dropdowns: Category & Level */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-2">
                        Course Category <span className="text-rose-500">*</span>
                      </label>
                      <BuilderDropdown
                        value={formData.category}
                        onChange={(val) => {
                          setFormData((prev) => ({ ...prev, category: val }));
                          if (errors.category)
                            setErrors((prev) => ({ ...prev, category: false }));
                        }}
                        options={CATEGORIES}
                        placeholder="Select category"
                        error={errors.category}
                      />
                      {errors.category && (
                        <p className="mt-1 text-[11px] font-semibold text-rose-500">
                          Category required.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-2">
                        Course Level <span className="text-rose-500">*</span>
                      </label>
                      <BuilderDropdown
                        value={formData.level}
                        onChange={(val) => {
                          setFormData((prev) => ({ ...prev, level: val }));
                          if (errors.level)
                            setErrors((prev) => ({ ...prev, level: false }));
                        }}
                        options={LEVELS}
                        placeholder="Select level"
                        error={errors.level}
                      />
                      {errors.level && (
                        <p className="mt-1 text-[11px] font-semibold text-rose-500">
                          Level required.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Course Thumbnail */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs sm:text-[13px] font-bold text-slate-800">
                        Course Thumbnail <span className="text-rose-500">*</span>
                        <span className="ml-2 font-normal text-[11px] text-slate-400">
                          PNG, JPG or WEBP · Max 5 MB
                        </span>
                      </label>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(e.target.files[0]);
                        }
                      }}
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                    />

                    {formData.thumbnailPreview ? (
                      <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-3 flex items-center gap-4">
                        <img
                          src={formData.thumbnailPreview}
                          alt="Course Thumbnail Preview"
                          className="h-20 w-32 object-cover rounded-xl border border-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {formData.thumbnail?.name || "course-thumbnail.png"}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {formData.thumbnail
                              ? `${(formData.thumbnail.size / (1024 * 1024)).toFixed(
                                  2
                                )} MB`
                              : "Thumbnail uploaded"}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                            >
                              Replace file
                            </button>
                            <button
                              type="button"
                              onClick={promptRemoveThumbnail}
                              className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                          "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-7 px-4 text-center cursor-pointer transition-all duration-150 select-none",
                          isDragging
                            ? "border-indigo-500 bg-indigo-50/50"
                            : "border-indigo-200/80 bg-indigo-50/15 hover:bg-indigo-50/35 hover:border-indigo-300"
                        )}
                      >
                        <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100/60 text-indigo-600">
                          <ImagePlus className="h-5 w-5" />
                        </div>
                        <p className="text-xs sm:text-[13px] font-semibold text-slate-700">
                          Drag and drop or{" "}
                          <span className="font-bold text-indigo-600 hover:underline">
                            browse files
                          </span>
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          Recommended 1280 × 720 px
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Pricing & Access */}
            {currentStep === 2 && (
              <div className="space-y-7 animate-in fade-in-50 duration-200">
                {/* Row 1: Course Type (Left) & Price, Discount Price, Currency (Right) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-start">
                  {/* Left Column: Course Type Cards */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-2">
                      Course Type
                    </label>
                    <div className="grid grid-cols-2 gap-3.5">
                      {/* Free Card */}
                      <div
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            courseType: "Free",
                          }))
                        }
                        className={cn(
                          "rounded-2xl p-4 transition-all duration-150 cursor-pointer select-none",
                          formData.courseType === "Free"
                            ? "border-2 border-indigo-400/90 bg-indigo-50/20 shadow-xs"
                            : "border border-slate-200 bg-white hover:border-slate-300"
                        )}
                      >
                        <p
                          className={cn(
                            "text-xs sm:text-[13px] font-bold",
                            formData.courseType === "Free"
                              ? "text-indigo-700"
                              : "text-slate-800"
                          )}
                        >
                          Free
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400 leading-tight">
                          Open access for every learner
                        </p>
                      </div>

                      {/* Paid Card */}
                      <div
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            courseType: "Paid",
                          }))
                        }
                        className={cn(
                          "rounded-2xl p-4 transition-all duration-150 cursor-pointer select-none",
                          formData.courseType === "Paid"
                            ? "border-2 border-indigo-400/90 bg-indigo-50/20 shadow-xs"
                            : "border border-slate-200 bg-white hover:border-slate-300"
                        )}
                      >
                        <p
                          className={cn(
                            "text-xs sm:text-[13px] font-bold",
                            formData.courseType === "Paid"
                              ? "text-indigo-700"
                              : "text-slate-800"
                          )}
                        >
                          Paid
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400 leading-tight">
                          Charge for course access
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Price *, Discount Price, Currency */}
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Price */}
                      <div>
                        <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-2">
                          Price <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          disabled={formData.courseType === "Free"}
                          value={
                            formData.courseType === "Free"
                              ? "0"
                              : formData.price
                          }
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              price: e.target.value,
                            }));
                            if (errors.price)
                              setErrors((prev) => ({ ...prev, price: false }));
                          }}
                          placeholder="18,999"
                          className={cn(
                            "w-full rounded-xl border bg-white px-3.5 py-3 text-xs sm:text-[13px] font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-xs",
                            errors.price
                              ? "border-rose-400 bg-rose-50/20"
                              : "border-slate-200 hover:border-slate-300",
                            formData.courseType === "Free" &&
                              "bg-slate-50 text-slate-400 cursor-not-allowed"
                          )}
                        />
                      </div>

                      {/* Discount Price */}
                      <div>
                        <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-2">
                          Discount Price
                        </label>
                        <input
                          type="text"
                          disabled={formData.courseType === "Free"}
                          value={
                            formData.courseType === "Free"
                              ? ""
                              : formData.discountPrice
                          }
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              discountPrice: e.target.value,
                            }))
                          }
                          placeholder="14,999"
                          className={cn(
                            "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-xs sm:text-[13px] font-medium placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-xs",
                            formData.courseType === "Free" &&
                              "bg-slate-50 text-slate-400 cursor-not-allowed"
                          )}
                        />
                      </div>

                      {/* Currency */}
                      <div>
                        <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-2">
                          Currency
                        </label>
                        <BuilderDropdown
                          value={formData.currency}
                          onChange={(val) =>
                            setFormData((prev) => ({
                              ...prev,
                              currency: val,
                            }))
                          }
                          options={CURRENCIES}
                          placeholder="INR ₹"
                        />
                      </div>
                    </div>
                    {errors.price && (
                      <p className="mt-1 text-[11px] font-semibold text-rose-500">
                        Price is required for paid courses.
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 2: Access Type (Left) & Enrollment Limit (Right) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-start">
                  {/* Left Column: Access Type Button Group */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-2">
                      Access Type
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {(
                        [
                          "Lifetime Access",
                          "Fixed Duration",
                          "Subscription",
                        ] as const
                      ).map((type) => {
                        const isSelected = formData.accessType === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                accessType: type,
                              }))
                            }
                            className={cn(
                              "rounded-xl px-4 py-2.5 text-xs sm:text-[13px] font-medium transition-all duration-150 cursor-pointer select-none",
                              isSelected
                                ? "border-2 border-indigo-400/90 bg-indigo-50/20 font-bold text-indigo-700 shadow-xs"
                                : "border border-slate-200 bg-white hover:border-slate-300 text-slate-600"
                            )}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Enrollment Limit */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-2">
                      Enrollment Limit{" "}
                      <span className="font-normal text-[11px] text-slate-400 ml-1">
                        Optional
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formData.enrollmentLimit}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          enrollmentLimit: e.target.value,
                        }))
                      }
                      placeholder="Unlimited"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs sm:text-[13px] font-medium placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-xs"
                    />
                  </div>
                </div>

                {/* Fixed Duration Cycle Configuration Card */}
                {formData.accessType === "Fixed Duration" && (
                  <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50/60 p-5 sm:p-6 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200 space-y-5">
                    {/* Header / Mode Selection */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-indigo-100/70">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
                            <CalendarRange className="h-4 w-4" />
                          </span>
                          <div>
                            <h4 className="text-xs sm:text-[14px] font-bold text-slate-900">
                              Duration Cycle & Access Window
                            </h4>
                            <p className="text-[11px] sm:text-xs text-slate-500">
                              Define when learner access begins and when it automatically expires.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Cycle Mode Switcher */}
                      <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl shadow-xs self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              durationCycleMode: "Date Range",
                            }))
                          }
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer select-none",
                            formData.durationCycleMode === "Date Range"
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                          )}
                        >
                          Calendar Dates (Start & End)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              durationCycleMode: "Relative Duration",
                            }))
                          }
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer select-none",
                            formData.durationCycleMode === "Relative Duration"
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                          )}
                        >
                          Duration from Enrollment
                        </button>
                      </div>
                    </div>

                    {formData.durationCycleMode === "Date Range" ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Start Date */}
                          <div>
                            <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                              Access Start Date <span className="text-rose-500">*</span>
                            </label>
                            <CustomDatePicker
                              value={formData.startDate}
                              placeholder="Select start date"
                              error={errors.startDate}
                              onChange={(newStart) => {
                                setFormData((prev) => {
                                  let newEnd = prev.endDate;
                                  if (newEnd && newEnd < newStart) {
                                    const d = new Date(newStart);
                                    d.setDate(d.getDate() + 30);
                                    newEnd = d.toISOString().split("T")[0];
                                  }
                                  return {
                                    ...prev,
                                    startDate: newStart,
                                    endDate: newEnd,
                                  };
                                });
                                if (errors.startDate || errors.endDateOrder) {
                                  setErrors((prev) => ({
                                    ...prev,
                                    startDate: false,
                                    endDateOrder: false,
                                  }));
                                }
                              }}
                            />
                            <p className="text-[11px] text-slate-400 mt-1">
                              When learners can begin accessing course lessons and materials
                            </p>
                            {errors.startDate && (
                              <p className="text-[11px] font-semibold text-rose-500 mt-1">
                                Start date is required
                              </p>
                            )}
                          </div>

                          {/* End Date */}
                          <div>
                            <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-rose-500" />
                              Access End Date (Expiry) <span className="text-rose-500">*</span>
                            </label>
                            <CustomDatePicker
                              value={formData.endDate}
                              minDate={formData.startDate}
                              placeholder="Select expiry date"
                              error={errors.endDate || errors.endDateOrder}
                              onChange={(newEnd) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  endDate: newEnd,
                                }));
                                if (errors.endDate || errors.endDateOrder) {
                                  setErrors((prev) => ({
                                    ...prev,
                                    endDate: false,
                                    endDateOrder: false,
                                  }));
                                }
                              }}
                            />
                            <p className="text-[11px] text-slate-400 mt-1">
                              When access is automatically revoked for this duration cycle
                            </p>
                            {errors.endDate && (
                              <p className="text-[11px] font-semibold text-rose-500 mt-1">
                                End date is required
                              </p>
                            )}
                            {errors.endDateOrder && (
                              <p className="text-[11px] font-semibold text-rose-500 mt-1">
                                End date must be on or after start date
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Quick presets */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className="text-[11px] font-semibold text-slate-500">
                            Quick Duration Presets:
                          </span>
                          {[
                            { label: "+30 Days", days: 30 },
                            { label: "+60 Days", days: 60 },
                            { label: "+90 Days", days: 90 },
                            { label: "+180 Days (6 mo)", days: 180 },
                            { label: "+365 Days (1 yr)", days: 365 },
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => {
                                const base = formData.startDate
                                  ? new Date(formData.startDate)
                                  : new Date();
                                base.setDate(base.getDate() + preset.days);
                                setFormData((prev) => ({
                                  ...prev,
                                  startDate:
                                    prev.startDate ||
                                    new Date().toISOString().split("T")[0],
                                  endDate: base.toISOString().split("T")[0],
                                }));
                                setErrors((prev) => ({
                                  ...prev,
                                  endDate: false,
                                  endDateOrder: false,
                                }));
                              }}
                              className="rounded-lg border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40 hover:text-indigo-600 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition cursor-pointer shadow-2xs"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>

                        {/* Summary banner */}
                        {formData.startDate && formData.endDate && (
                          <div className="flex items-center gap-2.5 rounded-xl bg-indigo-50/80 border border-indigo-100/90 px-3.5 py-2.5 text-xs text-indigo-950 font-medium">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-200/80 text-indigo-700 text-[11px] font-bold">
                              ✓
                            </span>
                            <span>
                              <strong>Access Cycle:</strong>{" "}
                              {calculateDateDiffString(
                                formData.startDate,
                                formData.endDate
                              )}{" "}
                              (Starts {formatDisplayDate(formData.startDate)} • Ends{" "}
                              {formatDisplayDate(formData.endDate)})
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Relative Duration from Enrollment */
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                          {/* Duration Count & Unit */}
                          <div>
                            <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-indigo-600" />
                              Access Duration Period <span className="text-rose-500">*</span>
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="1"
                                value={formData.durationValue}
                                onChange={(e) => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    durationValue: e.target.value,
                                  }));
                                  if (errors.durationValue)
                                    setErrors((prev) => ({
                                      ...prev,
                                      durationValue: false,
                                    }));
                                }}
                                placeholder="90"
                                className={cn(
                                  "w-28 rounded-xl border bg-white px-3.5 py-2.5 text-xs sm:text-[13px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-xs",
                                  errors.durationValue
                                    ? "border-rose-400 bg-rose-50/20"
                                    : "border-slate-200 hover:border-slate-300"
                                )}
                              />
                              <BuilderDropdown
                                value={formData.durationUnit || "Days"}
                                onChange={(val) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    durationUnit: val as any,
                                  }))
                                }
                                options={["Days", "Weeks", "Months", "Years"]}
                                className="w-36"
                              />
                            </div>
                            {errors.durationValue && (
                              <p className="text-[11px] font-semibold text-rose-500 mt-1">
                                Please enter a valid duration number
                              </p>
                            )}
                          </div>

                          {/* Optional Available From Date */}
                          <div>
                            <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-slate-500" />
                              Course Available From{" "}
                              <span className="text-slate-400 font-normal text-[11px]">
                                (Optional)
                              </span>
                            </label>
                            <CustomDatePicker
                              value={formData.startDate}
                              placeholder="Immediately upon enrollment"
                              onChange={(val) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  startDate: val,
                                }))
                              }
                            />
                            <p className="text-[11px] text-slate-400 mt-1">
                              Leave empty to grant access immediately upon student enrollment
                            </p>
                          </div>
                        </div>

                        {/* Popular cycle presets */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className="text-[11px] font-semibold text-slate-500">
                            Popular Cycles:
                          </span>
                          {[
                            { label: "30 Days", val: "30", unit: "Days" as const },
                            { label: "60 Days", val: "60", unit: "Days" as const },
                            { label: "90 Days (3 mo)", val: "90", unit: "Days" as const },
                            { label: "6 Months", val: "6", unit: "Months" as const },
                            { label: "1 Year", val: "1", unit: "Years" as const },
                          ].map((chip) => (
                            <button
                              key={chip.label}
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  durationValue: chip.val,
                                  durationUnit: chip.unit,
                                }));
                                setErrors((prev) => ({
                                  ...prev,
                                  durationValue: false,
                                }));
                              }}
                              className={cn(
                                "rounded-lg border px-2.5 py-1 text-[11px] font-medium transition cursor-pointer shadow-2xs",
                                formData.durationValue === chip.val &&
                                  formData.durationUnit === chip.unit
                                  ? "border-indigo-400 bg-indigo-50 text-indigo-700 font-bold"
                                  : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40 text-slate-600"
                              )}
                            >
                              {chip.label}
                            </button>
                          ))}
                        </div>

                        {/* Summary banner */}
                        <div className="flex items-center gap-2.5 rounded-xl bg-indigo-50/80 border border-indigo-100/90 px-3.5 py-2.5 text-xs text-indigo-950 font-medium">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-200/80 text-indigo-700 text-[11px] font-bold">
                            ✓
                          </span>
                          <span>
                            Learners receive access for{" "}
                            <strong>
                              {formData.durationValue || 0}{" "}
                              {formData.durationUnit?.toLowerCase()}
                            </strong>{" "}
                            starting from their individual enrollment date.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Subscription Billing Cycle Card */}
                {formData.accessType === "Subscription" && (
                  <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50/60 p-5 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200 space-y-3">
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800">
                      Billing & Renewal Cycle
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {(["Monthly", "Quarterly", "Yearly"] as const).map((cycle) => (
                        <button
                          key={cycle}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              subscriptionCycle: cycle,
                            }))
                          }
                          className={cn(
                            "rounded-xl px-4 py-2 text-xs sm:text-[13px] font-medium transition cursor-pointer select-none",
                            formData.subscriptionCycle === cycle
                              ? "border-2 border-indigo-500 bg-indigo-50/80 text-indigo-700 font-bold shadow-xs"
                              : "border border-slate-200 bg-white hover:border-slate-300 text-slate-600"
                          )}
                        >
                          {cycle}{" "}
                          <span className="text-[11px] opacity-75 font-normal">
                            (Renews every{" "}
                            {cycle === "Monthly"
                              ? "month"
                              : cycle === "Quarterly"
                              ? "3 months"
                              : "year"}
                            )
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Row 3: Course Visibility */}
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-2">
                    Course Visibility
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {(["Public", "Private", "Unlisted"] as const).map(
                      (vis) => {
                        const isSelected = formData.courseVisibility === vis;
                        return (
                          <button
                            key={vis}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                courseVisibility: vis,
                              }))
                            }
                            className={cn(
                              "rounded-xl px-5 py-2.5 text-xs sm:text-[13px] font-medium transition-all duration-150 cursor-pointer select-none",
                              isSelected
                                ? "border-2 border-indigo-400/90 bg-indigo-50/20 font-bold text-indigo-700 shadow-xs"
                                : "border border-slate-200 bg-white hover:border-slate-300 text-slate-600"
                            )}
                          >
                            {vis}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Course Curriculum */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in-50 duration-200">
                {/* Header Row: Description & Create Module Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <p className="text-xs sm:text-[13px] text-slate-500 max-w-xl leading-relaxed">
                    Create the structure of your course with modules, topics, and subtopics manually or automatically extract them from a PDF or Word syllabus in pure JavaScript.
                  </p>
                  <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setExtractError(null);
                        setExtractSuccessMsg(null);
                        setIsExtractModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100/90 text-indigo-700 px-3.5 py-2.5 text-xs sm:text-[13px] font-bold shadow-2xs transition cursor-pointer"
                      title="Upload PDF, DOCX, or paste syllabus text to automatically generate modules and topics"
                    >
                      <Sparkles className="h-4 w-4 text-indigo-600" />
                      Auto-extract from Document
                    </button>
                    <button
                      type="button"
                      onClick={openAddModule}
                      className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-xs sm:text-[13px] font-semibold text-white shadow-xs transition cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Create module
                    </button>
                  </div>
                </div>

                {/* Empty State vs Modules List */}
                {formData.modules.length === 0 ? (
                  <div className="rounded-2xl sm:rounded-3xl border border-dashed border-slate-200 bg-slate-50/40 py-16 sm:py-20 px-6 flex flex-col items-center justify-center text-center">
                    {/* Styled Icon Badge matching screenshot */}
                    <div className="flex h-10 w-14 items-center justify-center rounded-xl bg-indigo-100/80 text-indigo-600 mb-4 shadow-2xs">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600/90 text-white rounded-md text-[11px] font-black tracking-widest">
                        <span>!</span>
                        <span className="w-2.5 h-0.5 bg-white rounded-full inline-block"></span>
                      </div>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      No modules added yet
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm">
                      Create your first module to start building the course structure, or extract it automatically from a PDF / Word document.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={openAddModule}
                        className="inline-flex items-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-xs sm:text-[13px] font-semibold shadow-md shadow-indigo-500/20 transition cursor-pointer"
                      >
                        <Plus className="h-4 w-4" /> Add first module
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setExtractError(null);
                          setExtractSuccessMsg(null);
                          setIsExtractModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 px-5 py-2.5 text-xs sm:text-[13px] font-bold shadow-xs transition cursor-pointer"
                      >
                        <Sparkles className="h-4 w-4 text-indigo-600" />
                        Upload PDF / Word Syllabus
                      </button>

                    </div>
                  </div>
                ) : (

                  <div className="space-y-4">
                    {formData.modules.map((mod, modIdx) => {
                      const isExpanded = expandedModules[mod.id] !== false;

                      return (
                        <div
                          key={mod.id}
                          className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden transition-all"
                        >
                          {/* Module Header Bar */}
                          <div className="flex items-center justify-between p-4 sm:p-5 bg-white">
                            <div className="flex items-center gap-2 min-w-0">
                              <GripVertical className="h-4 w-4 text-slate-300 shrink-0 cursor-grab" />
                              <button
                                type="button"
                                onClick={() => toggleModuleExpand(mod.id)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition cursor-pointer shrink-0"
                                title={isExpanded ? "Collapse module" : "Expand module"}
                              >
                                <ChevronDown
                                  className={cn(
                                    "h-4 w-4 transition-transform duration-200 text-slate-600",
                                    !isExpanded && "-rotate-90"
                                  )}
                                />
                              </button>
                              <div className="truncate">
                                <h4 className="text-xs sm:text-[13.5px] font-bold text-slate-900 truncate">
                                  Module {modIdx + 1} · {mod.title}
                                </h4>
                                <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                                  {mod.topics.length} {mod.topics.length === 1 ? "topics" : "topics"}
                                </p>
                              </div>
                            </div>

                            {/* Module Header Actions */}
                            <div className="flex items-center gap-1 shrink-0 ml-2">
                              <button
                                type="button"
                                onClick={() => handleDuplicateModule(mod)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                                title="Duplicate module"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditModule(mod)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                                title="Edit module title"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => promptDeleteModule(mod)}
                                className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                                title="Delete module"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Module Body Content (when expanded) */}
                          {isExpanded && (
                            <div className="px-5 pb-5 pt-1 bg-white space-y-3">
                              <p className="text-xs text-slate-400 font-normal">
                                Add topics to shape this module.
                              </p>

                              {/* Topics List */}
                              {mod.topics.map((topic, topicIdx) => (
                                <div
                                  key={topic.id}
                                  className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden"
                                >
                                  {/* Topic Header Row */}
                                  <div className="px-5 py-3.5 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 truncate">
                                      <span className="text-xs sm:text-[13px] font-bold text-slate-400 shrink-0">
                                        {topicIdx + 1}
                                      </span>
                                      <span className="text-xs sm:text-[13.5px] font-bold text-slate-900 truncate">
                                        {topic.title}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="text-xs text-slate-400 font-normal">
                                        {topic.subtopics?.length || 0} subtopics
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => openAddSubtopic(mod.id, topic.id)}
                                        className="flex items-center gap-1 rounded-lg border border-indigo-100 bg-indigo-50/60 hover:bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 transition cursor-pointer"
                                      >
                                        <Plus className="h-3 w-3" /> Subtopic
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => promptDeleteTopic(mod.id, topic)}
                                        className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                                        title="Delete topic"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Subtopics List inside Topic */}
                                  {topic.subtopics && topic.subtopics.length > 0 && (
                                    <div className="px-5 pb-3.5 pt-1 space-y-1.5 border-t border-slate-100/80 bg-slate-50/30">
                                      {topic.subtopics.map((sub) => {
                                        const subType = sub.type || "Video";
                                        return (
                                          <div
                                            key={sub.id}
                                            className="flex items-center justify-between gap-2 rounded-xl bg-white border border-slate-150 px-3.5 py-2 text-xs shadow-2xs hover:border-slate-300 transition"
                                          >
                                            <div className="flex items-center gap-2 truncate">
                                              <span
                                                className={cn(
                                                  "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 uppercase tracking-wider",
                                                  subType === "Video"
                                                    ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                                                    : subType === "Article"
                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                                    : subType === "Quiz"
                                                    ? "bg-purple-50 text-purple-700 border border-purple-200/60"
                                                    : "bg-amber-50 text-amber-700 border border-amber-200/60"
                                                )}
                                              >
                                                {subType === "Video" && <Video className="h-2.5 w-2.5" />}
                                                {subType === "Article" && <FileText className="h-2.5 w-2.5" />}
                                                {subType === "Quiz" && <HelpCircle className="h-2.5 w-2.5" />}
                                                {subType === "Assignment" && <FileCheck2 className="h-2.5 w-2.5" />}
                                                {subType}
                                              </span>
                                              <span className="font-medium text-slate-700 truncate">
                                                {sub.title}
                                              </span>
                                              {sub.duration && (
                                                <span className="text-[10px] text-slate-400 shrink-0">
                                                  • {sub.duration}
                                                </span>
                                              )}
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                              <button
                                                type="button"
                                                onClick={() => openEditSubtopic(mod.id, topic.id, sub)}
                                                className="rounded p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                                                title="Edit subtopic"
                                              >
                                                <Edit3 className="h-3 w-3" />
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => promptDeleteSubtopic(mod.id, topic.id, sub)}
                                                className="rounded p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                                title="Delete subtopic"
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              ))}

                              {/* Inline Add Topic Input Row */}
                              <div className="flex items-center gap-3 pt-1">
                                <input
                                  type="text"
                                  value={topicInputs[mod.id] || ""}
                                  onChange={(e) =>
                                    setTopicInputs((prev) => ({
                                      ...prev,
                                      [mod.id]: e.target.value,
                                    }))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleInlineAddTopic(mod.id);
                                    }
                                  }}
                                  placeholder="Add a topic and press Enter"
                                  className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs sm:text-[13px] font-medium placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleInlineAddTopic(mod.id)}
                                  className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 px-5 py-3 text-xs sm:text-[13px] font-bold text-slate-800 transition cursor-pointer shadow-2xs shrink-0"
                                >
                                  <Plus className="h-4 w-4 text-slate-600" /> Topic
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={openAddModule}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-white hover:bg-slate-50 hover:border-indigo-300 py-3.5 text-xs sm:text-[13px] font-semibold text-slate-600 hover:text-indigo-600 transition cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Add another module
                    </button>
                  </div>
                )}

                {/* Bottom 3 Summary Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5">
                    <p className="text-[11px] sm:text-xs font-semibold text-slate-400">Modules</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{totalModulesCount}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5">
                    <p className="text-[11px] sm:text-xs font-semibold text-slate-400">Topics</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{totalTopicsCount}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5">
                    <p className="text-[11px] sm:text-xs font-semibold text-slate-400">Subtopics</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{totalSubtopicsCount}</p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Additional Details */}
            {currentStep === 4 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 animate-in fade-in-50 duration-200">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Instructor Name */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-2">
                      Instructor Name
                    </label>
                    <input
                      type="text"
                      value={formData.instructorName || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          instructorName: e.target.value,
                        }))
                      }
                      placeholder="e.g. Platform Admin, Dr. Jane Doe"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs sm:text-[13px] font-medium placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs"
                    />
                  </div>

                  {/* Skills Covered */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-2">
                      Skills Covered <span className="font-normal text-[11px] text-slate-400 ml-1">Type and press Enter or comma</span>
                    </label>
                    <div className="min-h-[110px] rounded-2xl border border-slate-200 bg-white p-3.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition hover:border-slate-300">
                      <div className="flex flex-wrap items-center gap-2 mb-2.5">
                        {formData.skillsCovered && formData.skillsCovered.length > 0 ? (
                          formData.skillsCovered.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 select-none shadow-2xs"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(skill)}
                                className="text-indigo-400 hover:text-indigo-700 cursor-pointer ml-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 py-1 select-none">
                            No skills added yet. Type below and press Enter to add skills.
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === ",") {
                              e.preventDefault();
                              handleAddSkill();
                            }
                          }}
                          placeholder="Add a skill (e.g. React, Node.js, Python, System Design)..."
                          className="w-full bg-transparent text-xs sm:text-[13px] font-medium placeholder:text-slate-400 focus:outline-none"
                        />
                        {skillInput.trim() && (
                          <button
                            type="button"
                            onClick={handleAddSkill}
                            className="shrink-0 rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-indigo-700 transition"
                          >
                            + Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Prerequisites */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-2">
                      Prerequisites
                    </label>
                    <textarea
                      rows={4}
                      value={formData.prerequisites || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, prerequisites: e.target.value }))
                      }
                      placeholder={"e.g. Basic programming concepts\nFamiliarity with web technologies"}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs sm:text-[13px] font-medium placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-y"
                    />
                  </div>

                  {/* Estimated Duration */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-2">
                      Estimated Duration
                    </label>
                    <input
                      type="text"
                      value={formData.estimatedDuration || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, estimatedDuration: e.target.value }))
                      }
                      placeholder="e.g. 12 Weeks"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs sm:text-[13px] font-medium placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>

                  {/* Certificate available Toggle Card */}
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4">
                    <span className="text-xs sm:text-[13px] font-bold text-slate-800">
                      Certificate available
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={formData.certificateAvailable}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          certificateAvailable: !prev.certificateAvailable,
                        }))
                      }
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                        formData.certificateAvailable ? "bg-indigo-600" : "bg-slate-200"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                          formData.certificateAvailable ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Course Status */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-2">
                      Course Status
                    </label>
                    <BuilderDropdown
                      value={formData.courseStatus || "Draft"}
                      onChange={(val) =>
                        setFormData((prev) => ({
                          ...prev,
                          courseStatus: val as "Draft" | "Published" | "Under Review" | "Archived",
                        }))
                      }
                      options={COURSE_STATUSES}
                    />
                  </div>

                  {/* SEO Title */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-2">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      value={formData.seoTitle || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, seoTitle: e.target.value }))
                      }
                      placeholder="Course title · Skillforge"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs sm:text-[13px] font-medium placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>

                  {/* SEO Description */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-2">
                      SEO Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.seoDescription || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, seoDescription: e.target.value }))
                      }
                      placeholder="A concise description for search engines"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs sm:text-[13px] font-medium placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-y"
                    />
                  </div>

                  {/* Target Audience */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-2">
                      Target Audience
                    </label>
                    <textarea
                      rows={3}
                      value={formData.targetAudience || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, targetAudience: e.target.value }))
                      }
                      placeholder="College students, freshers, working professionals"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs sm:text-[13px] font-medium placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-y"
                    />
                  </div>

                  {/* Learning Outcomes */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-2">
                      Learning Outcomes
                    </label>
                    <div className="space-y-2.5">
                      {formData.learningOutcomes?.map((outcome, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-2xl bg-slate-50/90 border border-slate-100 px-4 py-3 text-xs sm:text-[13px] font-medium text-slate-800 transition"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span className="truncate">{outcome}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveLearningOutcome(idx)}
                            className="text-slate-400 hover:text-slate-600 transition cursor-pointer p-0.5 shrink-0"
                            title="Remove outcome"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}

                      {/* Add Outcome Input Row */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={outcomeInput}
                          onChange={(e) => setOutcomeInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddLearningOutcome();
                            }
                          }}
                          placeholder="Add learning outcome"
                          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs sm:text-[13px] font-medium placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                        <button
                          type="button"
                          onClick={handleAddLearningOutcome}
                          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition cursor-pointer shrink-0 shadow-2xs"
                          title="Add outcome"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Card Footer Actions */}
            <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Left group */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <FileText className="h-4 w-4 text-slate-500" />
                  {isSaving ? "Saving..." : "Save draft"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-xs"
                >
                  Cancel
                </button>
              </div>

              {/* Right group */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className={cn(
                    "rounded-xl border px-4 py-2.5 text-xs sm:text-[13px] font-semibold transition cursor-pointer",
                    currentStep === 1
                      ? "border-slate-200 bg-slate-50/60 text-slate-400 cursor-not-allowed"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-xs"
                  )}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-xs sm:text-[13px] font-bold text-white shadow-sm shadow-indigo-500/20 transition cursor-pointer"
                >
                  {currentStep === 4 ? (
                    <>
                      <Check className="h-4 w-4 mr-0.5" /> Create course
                    </>
                  ) : (
                    "Continue →"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL 1: Create / Edit Module */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingModuleId ? "Edit Module" : "Create New Module"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModuleModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                  Module Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  placeholder="e.g. Introduction & Foundations"
                  autoFocus
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-[13px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                  Description <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={moduleDescription}
                  onChange={(e) => setModuleDescription(e.target.value)}
                  placeholder="Brief summary of what this module covers..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-[13px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition shadow-xs"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModuleModalOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs sm:text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModule}
                disabled={!moduleTitle.trim()}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs sm:text-[13px] font-bold text-white shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {editingModuleId ? "Update Module" : "Save Module"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Topic */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Add Topic to Module
              </h3>
              <button
                type="button"
                onClick={() => setIsTopicModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                  Topic Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  placeholder="e.g. Asymptotic Notation & Complexity"
                  autoFocus
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-[13px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-xs"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsTopicModalOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs sm:text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTopic}
                disabled={!topicTitle.trim()}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs sm:text-[13px] font-bold text-white shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                Add Topic
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Add / Edit Subtopic */}
      {isSubtopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingSubtopicId ? "Edit Subtopic" : "Add Subtopic / Lesson"}
              </h3>
              <button
                type="button"
                onClick={() => setIsSubtopicModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                  Subtopic Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={subtopicTitle}
                  onChange={(e) => setSubtopicTitle(e.target.value)}
                  placeholder="e.g. Big-O, Big-Theta, Big-Omega with Examples"
                  autoFocus
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-[13px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                  Content Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["Video", "Article", "Quiz", "Assignment"] as const).map((type) => {
                    const isSel = subtopicType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSubtopicType(type)}
                        className={cn(
                          "flex items-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition cursor-pointer select-none",
                          isSel
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-2xs"
                            : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                        )}
                      >
                        {type === "Video" && <Video className="h-3.5 w-3.5 text-blue-600" />}
                        {type === "Article" && <FileText className="h-3.5 w-3.5 text-emerald-600" />}
                        {type === "Quiz" && <HelpCircle className="h-3.5 w-3.5 text-purple-600" />}
                        {type === "Assignment" && <FileCheck2 className="h-3.5 w-3.5 text-amber-600" />}
                        <span>{type}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-1.5">
                  Duration / Length <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={subtopicDuration}
                  onChange={(e) => setSubtopicDuration(e.target.value)}
                  placeholder="e.g. 15 mins, 5 pages, 10 questions"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-[13px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-xs"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSubtopicModalOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs sm:text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSubtopic}
                disabled={!subtopicTitle.trim()}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs sm:text-[13px] font-bold text-white shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {editingSubtopicId ? "Save Changes" : "Add Subtopic"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Delete Confirmation Alert Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 border border-rose-100 text-rose-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">
                    {deleteConfirm.title}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {deleteConfirm.targetName && (
                  <div className="mt-2.5 rounded-xl bg-slate-50 border border-slate-200/80 px-3 py-2 text-xs font-semibold text-slate-800 break-words flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0"></span>
                    <span className="truncate">{deleteConfirm.targetName}</span>
                  </div>
                )}

                <p className="mt-2.5 text-xs sm:text-[13px] text-slate-500 leading-relaxed">
                  {deleteConfirm.message}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteConfirm.onConfirm}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2.5 text-xs sm:text-[13px] font-bold text-white shadow-sm shadow-rose-500/20 transition cursor-pointer"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Document Syllabus Extractor (Pure JS) */}
      {isExtractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50/60 via-white to-purple-50/40">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm shadow-indigo-500/20">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    Auto-extract Curriculum from Document
                    <span className="rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 border border-emerald-200">
                      Pure JavaScript
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Extract structured modules, topics, and subtopics from PDF, Word, or plain text without Python.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExtractModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Tab Selector */}
              <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => {
                    setExtractTab("upload");
                    setExtractError(null);
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-[13px] font-bold transition cursor-pointer select-none",
                    extractTab === "upload"
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <UploadCloud className="h-4 w-4" />
                  Upload Document (.pdf, .docx, .txt)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExtractTab("paste");
                    setExtractError(null);
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-[13px] font-bold transition cursor-pointer select-none",
                    extractTab === "paste"
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <FileText className="h-4 w-4" />
                  Paste Syllabus Text
                </button>
              </div>

              {/* TAB 1: Upload Document */}
              {extractTab === "upload" && (
                <div className="space-y-4">
                  <input
                    ref={docFileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.txt,.md"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleDocFileSelect(file);
                    }}
                  />

                  {/* Dropzone */}
                  <div
                    onClick={() => docFileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleDocFileSelect(file);
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition cursor-pointer",
                      isExtracting
                        ? "border-indigo-400 bg-indigo-50/40"
                        : uploadedDocFile
                        ? "border-emerald-300 bg-emerald-50/20 hover:border-emerald-400"
                        : "border-slate-200 bg-slate-50/50 hover:border-indigo-400 hover:bg-indigo-50/20"
                    )}
                  >
                    {isExtracting ? (
                      <div className="flex flex-col items-center py-4">
                        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-3" />
                        <p className="text-sm font-bold text-slate-800">
                          Extracting text with pure JavaScript...
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Analyzing chapters, topics, lessons, and durations
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 mb-3 shadow-2xs">
                          <FileUp className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-bold text-slate-800">
                          {uploadedDocFile
                            ? uploadedDocFile.name
                            : "Click to upload or drag & drop syllabus document"}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Supports PDF (.pdf), Microsoft Word (.docx, .doc), Plain Text (.txt), and Markdown (.md)
                        </p>
                        <div className="flex items-center gap-2 mt-4">
                          <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-600">
                            .PDF
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-600">
                            .DOCX
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-600">
                            .TXT
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-600">
                            .MD
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {uploadedDocFile && !isExtracting && (
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200/80 px-4 py-2.5">
                      <div className="flex items-center gap-2.5 truncate">
                        <FileText className="h-4 w-4 text-indigo-600 shrink-0" />
                        <span className="text-xs font-semibold text-slate-800 truncate">
                          {uploadedDocFile.name}
                        </span>
                        <span className="text-[11px] text-slate-400 shrink-0">
                          ({(uploadedDocFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => docFileInputRef.current?.click()}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer shrink-0"
                      >
                        Change Document
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Paste Text */}
              {extractTab === "paste" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      Paste Syllabus or Outline Text
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPastedRawText(SAMPLE_SYLLABUS_TEXT)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                      >
                        ✨ Load Sample Template
                      </button>
                      {pastedRawText && (
                        <button
                          type="button"
                          onClick={() => setPastedRawText("")}
                          className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  <textarea
                    rows={8}
                    value={pastedRawText}
                    onChange={(e) => setPastedRawText(e.target.value)}
                    placeholder={`# Module 1: Course Overview\n## Topic: Getting Started\n- Lesson 1: Introduction (15 mins) [Video]\n- Lesson 2: Installation Guide (20 mins) [Video]\n- Lesson 3: Setup Quiz (10 mins) [Quiz]`}
                    className="w-full rounded-2xl border border-slate-200 bg-white p-4 font-mono text-xs text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition leading-relaxed resize-y"
                  />

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleParsePastedText}
                      disabled={!pastedRawText.trim()}
                      className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="h-4 w-4" /> Parse Syllabus Text
                    </button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {extractError && (
                <div className="flex items-start gap-3 rounded-2xl bg-rose-50 border border-rose-100 p-4 text-xs text-rose-800 animate-in fade-in duration-150">
                  <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Extraction Note:</strong> {extractError}
                  </div>
                </div>
              )}

              {/* Success Message */}
              {extractSuccessMsg && (
                <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-xs text-emerald-800 animate-in fade-in duration-150">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{extractSuccessMsg}</span>
                </div>
              )}

              {/* PREVIEW of Extracted Modules */}
              {extractedPreviewModules.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 flex items-center gap-2">
                      <span>✨ Extracted Hierarchy Preview</span>
                      <span className="text-slate-400 font-normal">
                        ({extractedPreviewModules.length} Modules,{" "}
                        {extractedPreviewModules.reduce(
                          (acc, m) => acc + m.topics.length,
                          0
                        )}{" "}
                        Topics,{" "}
                        {extractedPreviewModules.reduce(
                          (acc, m) =>
                            acc +
                            m.topics.reduce(
                              (tAcc, t) => tAcc + t.subtopics.length,
                              0
                            ),
                          0
                        )}{" "}
                        Subtopics)
                      </span>
                    </h4>

                    {/* Merge Mode Toggle */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setExtractMergeMode("replace")}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer select-none",
                          extractMergeMode === "replace"
                            ? "bg-white text-indigo-700 shadow-2xs"
                            : "text-slate-600 hover:text-slate-900"
                        )}
                      >
                        Replace Curriculum
                      </button>
                      <button
                        type="button"
                        onClick={() => setExtractMergeMode("append")}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer select-none",
                          extractMergeMode === "append"
                            ? "bg-white text-indigo-700 shadow-2xs"
                            : "text-slate-600 hover:text-slate-900"
                        )}
                      >
                        Append to Existing
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Preview List */}
                  <div className="max-h-64 overflow-y-auto space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3">
                    {extractedPreviewModules.map((mod, modIdx) => (
                      <div
                        key={mod.id}
                        className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs sm:text-[13px] font-bold text-slate-900">
                            {mod.title}
                          </h5>
                          <span className="text-[11px] font-medium text-slate-400">
                            {mod.topics.length} topic{mod.topics.length === 1 ? "" : "s"}
                          </span>
                        </div>

                        <div className="space-y-2 pl-2 border-l-2 border-indigo-100">
                          {mod.topics.map((topic, tIdx) => (
                            <div key={topic.id} className="space-y-1">
                              <p className="text-xs font-semibold text-slate-700">
                                {tIdx + 1}. {topic.title}
                              </p>
                              <div className="flex flex-wrap gap-1.5 pl-2">
                                {topic.subtopics.map((sub) => {
                                  const subType = sub.type || "Video";
                                  return (
                                    <span
                                      key={sub.id}
                                      className="inline-flex items-center gap-1 rounded-md bg-slate-50 border border-slate-200/80 px-2 py-0.5 text-[10.5px] text-slate-700"
                                    >
                                      <span
                                        className={cn(
                                          "px-1 py-0.2 rounded text-[9px] font-bold uppercase",
                                          subType === "Video"
                                            ? "bg-blue-100 text-blue-700"
                                            : subType === "Article"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : subType === "Quiz"
                                            ? "bg-purple-100 text-purple-700"
                                            : "bg-amber-100 text-amber-700"
                                        )}
                                      >
                                        {subType}
                                      </span>
                                      <span className="truncate max-w-[200px]">
                                        {sub.title}
                                      </span>
                                      {sub.duration && (
                                        <span className="text-slate-400 text-[10px]">
                                          ({sub.duration})
                                        </span>
                                      )}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setIsExtractModalOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyExtractedCurriculum}
                disabled={extractedPreviewModules.length === 0}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 text-xs sm:text-[13px] font-bold text-white shadow-md shadow-indigo-500/20 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Check className="h-4 w-4" />
                Apply to Course Curriculum
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

