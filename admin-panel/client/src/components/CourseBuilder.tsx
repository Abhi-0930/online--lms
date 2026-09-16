import React, { useState, useRef } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface CourseBuilderData {
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

  React.useEffect(() => {
    if (value) {
      const parts = value.split("-");
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        if (!isNaN(y) && !isNaN(m)) {
          setViewYear(y);
          setViewMonth(m);
        }
      }
    }
  }, [value]);

  React.useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutside);
    }
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
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

  return (
    <div ref={datePickerRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
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
          {/* Calendar Header with Navigation */}
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
              title="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-bold text-slate-800">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
              title="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

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

          {/* Footer with Today / Clear shortcuts */}
          <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 text-[11px]">
            <button
              type="button"
              onClick={() => {
                onChange(todayStr);
                setIsOpen(false);
              }}
              className="text-indigo-600 hover:text-indigo-700 font-bold cursor-pointer transition"
            >
              Select Today
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
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
    title: initialData?.title || "",
    subtitle: initialData?.subtitle || "",
    description: initialData?.description || "",
    language: initialData?.language || "English",
    category: initialData?.category || "",
    level: initialData?.level || "",
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
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const removeThumbnail = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData((prev) => ({
      ...prev,
      thumbnail: null,
      thumbnailPreview: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
      if (onContinue) {
        onContinue(formData);
      } else {
        setCurrentStep(3);
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
            ? "Structure your modules, lessons, and content."
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
                              onClick={removeThumbnail}
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
                  Continue →
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
