import React, { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  ClipboardCheck,
  Clock,
  Code2,
  FileText,
  GripVertical,
  Plus,
  Save,
  Search,
  Send,
  Trash2,
  Upload,
  X,
} from "lucide-react";

export interface AssignmentProblemItem {
  id: number;
  title: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  points: number;
  isAdded: boolean;
}

export interface AssignmentData {
  id?: string | number;
  title: string;
  description: string;
  instructions: string;
  course: string;
  module: string;
  topic?: string;
  difficulty?: string;
  problemsCount: number;
  problemsList: AssignmentProblemItem[];
  releaseDate: string;
  startTime?: string;
  deadline: string;
  deadlineTime?: string;
  allowLate: boolean;
  latePenalty: string;
  resources: Array<{ id: number; name: string; size?: string; url?: string }>;
  submissionTypes: string[];
  maxFileSize: string;
  maxAttempts: string;
  totalMarks: number;
  passingMarks: number;
  gradingMode: string;
  targetCohort: string;
  status: "Draft" | "Published" | "Scheduled";
  notifyStudents: boolean;
}

const STEPS = [
  { id: 1, label: "Basic Information" },
  { id: 2, label: "Course Mapping" },
  { id: 3, label: "Problems" },
  { id: 4, label: "Schedule" },
  { id: 5, label: "Resources" },
  { id: 6, label: "Submission" },
  { id: 7, label: "Evaluation" },
  { id: 8, label: "Visibility" },
];

interface AssignmentBuilderProps {
  initialData?: Partial<AssignmentData>;
  onClose: () => void;
  onSaveDraft: (data: AssignmentData) => void;
  onPublish: (data: AssignmentData) => void;
  availableCourses?: string[];
  courses?: any[];
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
  hasError?: boolean;
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
  hasError = false,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
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
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "w-full rounded-2xl border px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between gap-2.5 hover:bg-slate-100/70 dark:hover:bg-white/5 transition-all cursor-pointer shadow-xs select-none",
          hasError
            ? "border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 ring-2 ring-rose-500/20 text-rose-900 dark:text-rose-200"
            : "border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]",
          isOpen && !hasError && "ring-2 ring-indigo-500/20 border-indigo-500 bg-white dark:bg-[#151926] shadow-sm",
          isOpen && hasError && "ring-2 ring-rose-500/30 border-rose-500 bg-white dark:bg-[#151926] shadow-sm",
          disabled && "opacity-50 cursor-not-allowed",
          buttonClassName
        )}
      >
        <span className="truncate text-left">{displayLabel}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200",
            isOpen && "rotate-180 text-indigo-600 dark:text-indigo-400",
            hasError && "text-rose-500"
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-1.5 min-w-[170px] w-full max-h-60 overflow-y-auto rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-1.5 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150",
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

function formatScheduleDateTime(dateStr: string, timeStr: string) {
  if (!dateStr) return "";
  let formattedDate = dateStr;
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    if (parts[0].length === 2 && parts[2].length === 4) {
      // DD-MM-YYYY format
      const day = parseInt(parts[0], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const year = parts[2];
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
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

export default function AssignmentBuilder({
  initialData,
  onClose,
  onSaveDraft,
  onPublish,
  availableCourses,
  courses,
}: AssignmentBuilderProps) {
  const [localCourses, setLocalCourses] = useState<any[]>(courses || []);

  useEffect(() => {
    if (courses && courses.length > 0) {
      setLocalCourses(courses);
    }
  }, [courses]);

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

  const activeCoursesList = useMemo(() => {
    if (localCourses && localCourses.length > 0) return localCourses;
    if (courses && courses.length > 0) return courses;
    return [];
  }, [localCourses, courses]);

  const courseNames = useMemo(() => {
    if (activeCoursesList && activeCoursesList.length > 0) {
      return activeCoursesList.map((c: any) => c.title || c.name).filter(Boolean);
    }
    if (availableCourses && availableCourses.length > 0) return availableCourses;
    return [];
  }, [activeCoursesList, availableCourses]);

  const [activeStep, setActiveStep] = useState(1);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalDifficulty, setModalDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");

  const initialProblems = initialData?.problemsList || [];
  const [problemsBank, setProblemsBank] = useState<AssignmentProblemItem[]>(initialProblems);
  const [problemSearch, setProblemSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All difficulties");
  const [topicFilter, setTopicFilter] = useState("All topics");

  const [data, setData] = useState<AssignmentData>(() => {
    const initialCourse = initialData?.course || (courseNames.length > 0 ? courseNames[0] : "");
    return {
      id: initialData?.id,
      title: initialData?.title || "",
      description: initialData?.description || "",
      instructions: initialData?.instructions || "",
      course: initialCourse,
      module: initialData?.module || "",
      topic: initialData?.topic || "",
      difficulty: initialData?.difficulty || "Medium",
      problemsCount: initialData?.problemsCount || initialProblems.length,
      problemsList: initialProblems,
      releaseDate: initialData?.releaseDate || new Date().toISOString().split("T")[0],
      startTime: initialData?.startTime || "18:00",
      deadline: initialData?.deadline || "",
      deadlineTime: initialData?.deadlineTime || "23:59",
      allowLate: initialData?.allowLate ?? false,
      latePenalty: initialData?.latePenalty || "10% per day",
      resources: initialData?.resources || [],
      submissionTypes: initialData?.submissionTypes || ["Code Editor / IDE", "ZIP / File upload", "GitHub repository link"],
      maxFileSize: initialData?.maxFileSize || "25 MB",
      maxAttempts: initialData?.maxAttempts || "Unlimited",
      totalMarks: initialData?.totalMarks || (initialProblems.length > 0 ? initialProblems.reduce((acc, p) => acc + p.points, 0) : 100),
      passingMarks: initialData?.passingMarks || 40,
      gradingMode: initialData?.gradingMode || "Automated Test Cases + Manual Code Review",
      targetCohort: initialData?.targetCohort || "All Enrolled Students",
      status: initialData?.status || "Draft",
      notifyStudents: initialData?.notifyStudents ?? true,
    };
  });

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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stepErrorBanner, setStepErrorBanner] = useState<string | null>(null);

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
    setStepErrorBanner(null);
  };

  const validateStep = (stepNumber: number, currentData: AssignmentData = data): { isValid: boolean; errors: Record<string, string>; message?: string } => {
    const newErrors: Record<string, string> = {};
    let message: string | undefined = undefined;

    switch (stepNumber) {
      case 1:
        if (!currentData.title || !currentData.title.trim()) {
          newErrors.title = "Assignment title is required";
        }
        if (!currentData.description || !currentData.description.trim()) {
          newErrors.description = "Assignment description is required";
        }
        if (!currentData.instructions || !currentData.instructions.trim()) {
          newErrors.instructions = "Instructions are required";
        }
        break;

      case 2:
        if (!currentData.course || !currentData.course.trim()) {
          newErrors.course = "Please select a target course";
        }
        if (availableModules.length > 0 && (!currentData.module || !currentData.module.trim())) {
          newErrors.module = "Please select a target module";
        }
        break;

      case 3:
        if (!currentData.problemsList || currentData.problemsList.length === 0) {
          newErrors.problemsList = "Please add at least one problem to the assignment";
          message = "Please add at least one practice problem before proceeding.";
        }
        break;

      case 4:
        if (!currentData.releaseDate || !currentData.releaseDate.trim()) {
          newErrors.releaseDate = "Assignment start date is required";
        }
        if (!currentData.deadline || !currentData.deadline.trim()) {
          newErrors.deadline = "Submission deadline date is required";
        }
        break;

      case 5:
        // Resources: Optional
        break;

      case 6:
        if (!currentData.submissionTypes || currentData.submissionTypes.length === 0) {
          newErrors.submissionTypes = "Please select at least one submission format";
          message = "Please select at least one submission format before proceeding.";
        }
        break;

      case 7:
        if (
          currentData.totalMarks === undefined ||
          currentData.totalMarks === null ||
          isNaN(Number(currentData.totalMarks)) ||
          Number(currentData.totalMarks) <= 0
        ) {
          newErrors.totalMarks = "Total marks must be greater than 0";
        }
        if (
          currentData.passingMarks === undefined ||
          currentData.passingMarks === null ||
          isNaN(Number(currentData.passingMarks)) ||
          Number(currentData.passingMarks) < 0
        ) {
          newErrors.passingMarks = "Passing marks cannot be negative";
        } else if (Number(currentData.passingMarks) > Number(currentData.totalMarks)) {
          newErrors.passingMarks = "Passing marks cannot exceed total marks";
        }
        break;

      case 8:
        if (!currentData.targetCohort || !currentData.targetCohort.trim()) {
          newErrors.targetCohort = "Target cohort is required";
        }
        break;

      default:
        break;
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
      message,
    };
  };

  const handleNextStep = () => {
    const result = validateStep(activeStep, data);
    if (!result.isValid) {
      setErrors(result.errors);
      if (result.message) {
        setStepErrorBanner(result.message);
      } else {
        setStepErrorBanner("Please fill in all required fields marked with * before continuing.");
      }
      return;
    }
    setErrors({});
    setStepErrorBanner(null);
    setActiveStep((s) => Math.min(8, s + 1));
  };

  const handleStepTabClick = (targetStep: number) => {
    if (targetStep === activeStep) return;
    if (targetStep < activeStep) {
      setErrors({});
      setStepErrorBanner(null);
      setActiveStep(targetStep);
      return;
    }

    // Validate preceding steps before jumping forward
    for (let s = 1; s < targetStep; s++) {
      const result = validateStep(s, data);
      if (!result.isValid) {
        setErrors(result.errors);
        if (result.message) {
          setStepErrorBanner(result.message);
        } else {
          setStepErrorBanner(`Please complete step ${s} (${STEPS[s - 1].label}) required fields first.`);
        }
        setActiveStep(s);
        return;
      }
    }

    setErrors({});
    setStepErrorBanner(null);
    setActiveStep(targetStep);
  };

  const handlePublishClick = () => {
    for (let s = 1; s <= 8; s++) {
      const result = validateStep(s, data);
      if (!result.isValid) {
        setErrors(result.errors);
        if (result.message) {
          setStepErrorBanner(result.message);
        } else {
          setStepErrorBanner(`Please complete required fields in step ${s} (${STEPS[s - 1].label}) before publishing.`);
        }
        setActiveStep(s);
        return;
      }
    }

    setErrors({});
    setStepErrorBanner(null);
    onPublish({ ...data, status: "Published" });
  };

  const handleToggleProblem = (id: number) => {
    setProblemsBank((current) => {
      const updated = current.map((p) => (p.id === id ? { ...p, isAdded: !p.isAdded } : p));
      const addedList = updated.filter((p) => p.isAdded);
      setData((prev) => ({
        ...prev,
        problemsList: addedList,
        problemsCount: addedList.length,
        totalMarks: addedList.reduce((acc, p) => acc + p.points, 0) || 100,
      }));
      if (addedList.length > 0) {
        clearError("problemsList");
      }
      return updated;
    });
  };

  const handleAddNewBankProblem = (title: string, category: string, difficulty: "Easy" | "Medium" | "Hard") => {
    const newProb: AssignmentProblemItem = {
      id: Date.now(),
      title,
      category,
      difficulty,
      points: difficulty === "Hard" ? 50 : difficulty === "Medium" ? 30 : 20,
      isAdded: true,
    };
    setProblemsBank((current) => [newProb, ...current]);
    setData((prev) => {
      const addedList = [newProb, ...prev.problemsList];
      return {
        ...prev,
        problemsList: addedList,
        problemsCount: addedList.length,
        totalMarks: addedList.reduce((acc, p) => acc + p.points, 0),
      };
    });
    clearError("problemsList");
    setIsAddModalOpen(false);
  };

  const filteredProblems = useMemo(() => {
    return problemsBank.filter((p) => {
      const matchesSearch =
        !problemSearch.trim() ||
        `${p.title} ${p.category} ${p.difficulty}`.toLowerCase().includes(problemSearch.toLowerCase().trim());
      const matchesDiff = difficultyFilter === "All difficulties" || p.difficulty === difficultyFilter;
      const matchesTopic =
        topicFilter === "All topics" || p.category.toLowerCase().includes(topicFilter.toLowerCase());
      return matchesSearch && matchesDiff && matchesTopic;
    });
  }, [problemsBank, problemSearch, difficultyFilter, topicFilter]);

  const toggleSubmissionType = (type: string) => {
    setData((prev) => {
      const exists = prev.submissionTypes.includes(type);
      const updatedTypes = exists
        ? prev.submissionTypes.filter((t) => t !== type)
        : [...prev.submissionTypes, type];
      if (updatedTypes.length > 0) {
        clearError("submissionTypes");
      }
      return {
        ...prev,
        submissionTypes: updatedTypes,
      };
    });
  };

  const progressPercent = Math.round((activeStep / 8) * 100);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 flex flex-col antialiased">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-[#121620]/95 backdrop-blur-md px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Assignments</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onSaveDraft(data)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 transition cursor-pointer shadow-xs"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save draft</span>
          </button>
          <button
            type="button"
            onClick={handlePublishClick}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition cursor-pointer active:scale-95"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Publish assignment</span>
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

      {/* Main Content Container */}
      <main className="flex-1 mx-auto w-full max-w-[1440px] px-6 py-7">
        {/* Title Area */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-1">
            <span>Assignments</span>
            <span>&gt;</span>
            <span className="text-slate-700 dark:text-slate-300 font-bold">New Assignment</span>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400 mb-1">
            ASSIGNMENT BUILDER
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Create Assignment
            </h1>
            <span className="rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/50 px-2 py-0.5 text-[10px] font-bold">
              Draft
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-3xl">
            Create and publish assignments with practice problems, resources, deadlines, and submission requirements.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Main Section (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Step Tabs Card */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] px-4 py-3 shadow-xs overflow-hidden">
              <div className="flex items-center justify-between gap-1 w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {STEPS.map((step) => {
                  const isActive = activeStep === step.id;
                  const isCompleted = activeStep > step.id;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => handleStepTabClick(step.id)}
                      className={cn(
                        "relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0",
                        isActive
                          ? "text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 dark:border-indigo-400 pb-1"
                          : isCompleted
                          ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                          : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-3.5 w-3.5 stroke-[2.5] text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <span className={cn(
                          "grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold",
                          isActive
                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                            : "bg-slate-100 dark:bg-white/10 text-slate-500"
                        )}>
                          {step.id}
                        </span>
                      )}
                      <span>{step.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Step Form Card */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-6 sm:p-8 shadow-sm">
              {stepErrorBanner && (
                <div className="mb-6 p-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/80 dark:bg-rose-950/30 flex items-center gap-3 text-xs text-rose-800 dark:text-rose-300 font-semibold animate-in fade-in-0 duration-150">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span className="flex-1">{stepErrorBanner}</span>
                  <button
                    type="button"
                    onClick={() => setStepErrorBanner(null)}
                    className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-200 p-1 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Step 1: Basic Information */}
              {activeStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Basic Information
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Start with a clear title, description, and instructions for students.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                      Assignment Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={data.title}
                      onChange={(e) => {
                        setData({ ...data, title: e.target.value });
                        if (errors.title) clearError("title");
                      }}
                      placeholder="Week 1 Assignment"
                      className={cn(
                        "w-full rounded-2xl border bg-slate-50/50 dark:bg-white/[0.02] px-4 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all font-medium",
                        errors.title
                          ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20"
                          : "border-slate-200/90 dark:border-white/10 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#151926] focus:ring-indigo-500/20"
                      )}
                    />
                    {errors.title && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{errors.title}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                      Assignment Description <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      value={data.description}
                      onChange={(e) => {
                        setData({ ...data, description: e.target.value });
                        if (errors.description) clearError("description");
                      }}
                      placeholder="Practice arrays and problem-solving fundamentals."
                      rows={4}
                      className={cn(
                        "w-full rounded-2xl border bg-slate-50/50 dark:bg-white/[0.02] p-4 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all font-medium resize-none",
                        errors.description
                          ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20"
                          : "border-slate-200/90 dark:border-white/10 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#151926] focus:ring-indigo-500/20"
                      )}
                    />
                    {errors.description && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{errors.description}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                      Instructions <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      value={data.instructions}
                      onChange={(e) => {
                        setData({ ...data, instructions: e.target.value });
                        if (errors.instructions) clearError("instructions");
                      }}
                      placeholder="Complete all problems and submit before the deadline."
                      rows={4}
                      className={cn(
                        "w-full rounded-2xl border bg-slate-50/50 dark:bg-white/[0.02] p-4 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all font-medium resize-none",
                        errors.instructions
                          ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20"
                          : "border-slate-200/90 dark:border-white/10 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#151926] focus:ring-indigo-500/20"
                      )}
                    />
                    {errors.instructions && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{errors.instructions}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Course Mapping */}
              {activeStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Course Mapping
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Attach this assignment to a specific course curriculum and module.
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
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
                          setData((prev) => ({ ...prev, course: val, module: modName }));
                          if (errors.course) clearError("course");
                          if (errors.module && modName) clearError("module");
                        }}
                        options={courseNames}
                        placeholder={courseNames.length > 0 ? "Select Target Course" : "No courses available on Admin Panel"}
                        disabled={courseNames.length === 0}
                        hasError={!!errors.course}
                        className="w-full"
                        buttonClassName="w-full py-3.5 px-4 text-xs font-semibold min-h-[48px]"
                        menuClassName="w-full min-w-full"
                      />
                      {errors.course && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>{errors.course}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                        Target Module {availableModules.length > 0 && <span className="text-rose-500">*</span>}
                      </label>
                      <CustomDropdown
                        value={data.module}
                        onChange={(val) => {
                          setData((prev) => ({ ...prev, module: val }));
                          if (errors.module) clearError("module");
                        }}
                        options={availableModules}
                        placeholder={
                          availableModules.length > 0
                            ? "Select Target Module"
                            : data.course
                            ? "No modules found in this course"
                            : "Select a course first"
                        }
                        disabled={availableModules.length === 0}
                        hasError={!!errors.module}
                        className="w-full"
                        buttonClassName="w-full py-3.5 px-4 text-xs font-semibold min-h-[48px]"
                        menuClassName="w-full min-w-full"
                      />
                      {errors.module && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>{errors.module}</span>
                        </div>
                      )}
                      {data.course && availableModules.length === 0 && !errors.module && (
                        <p className="mt-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                          Note: This course currently has no curriculum modules added. You can add modules in Course Builder.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                        Topic / Subtopic (Optional)
                      </label>
                      <input
                        type="text"
                        value={data.topic || ""}
                        onChange={(e) => setData({ ...data, topic: e.target.value })}
                        placeholder="e.g. Two Pointers & Sliding Window"
                        className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-4 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#151926] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                        Difficulty Level
                      </label>
                      <div className="flex gap-2">
                        {(["Beginner", "Medium", "Hard"] as const).map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setData({ ...data, difficulty: lvl })}
                            className={cn(
                              "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                              data.difficulty === lvl
                                ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-indigo-300 shadow-xs"
                                : "border-slate-200/80 bg-slate-50/50 text-slate-600 dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-400"
                            )}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Assignment Problems (Matched to User Screenshot) */}
              {activeStep === 3 && (
                <div className="space-y-5">
                  {/* Step Header with Title & "+ Add existing problem" Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Assignment Problems <span className="text-rose-500">*</span>
                      </h2>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Select and order practice problems. (At least 1 problem required)
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-indigo-500/20 transition active:scale-95 cursor-pointer shrink-0"
                    >
                      <Plus className="h-4 w-4 stroke-[2.5]" />
                      <span>Add existing problem</span>
                    </button>
                  </div>

                  {errors.problemsList && (
                    <div className="p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/30 flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300 font-semibold animate-in fade-in-0">
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                      <span>{errors.problemsList}</span>
                    </div>
                  )}

                  {/* Search and Filters Bar */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                    {/* Search Input */}
                    <div className="relative flex-1 w-full">
                      <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={problemSearch}
                        onChange={(e) => setProblemSearch(e.target.value)}
                        placeholder="Search practice problems"
                        className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#151926] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                      />
                    </div>

                    {/* Difficulties Dropdown */}
                    <CustomDropdown
                      value={difficultyFilter}
                      onChange={setDifficultyFilter}
                      options={["All difficulties", "Easy", "Medium", "Hard"]}
                      className="w-full sm:w-auto shrink-0"
                      buttonClassName="min-w-[145px]"
                      align="right"
                    />

                    {/* Topics Dropdown */}
                    <CustomDropdown
                      value={topicFilter}
                      onChange={setTopicFilter}
                      options={[
                        "All topics",
                        "Array",
                        "HashMap",
                        "Kadane",
                        "Sliding Window",
                        "Trees",
                        "Graphs",
                        "Stack",
                      ]}
                      className="w-full sm:w-auto shrink-0"
                      buttonClassName="min-w-[130px]"
                      align="right"
                    />
                  </div>

                  {/* Problems Cards List */}
                  <div className="space-y-3 pt-2">
                    {filteredProblems.map((prob, idx) => (
                      <div
                        key={prob.id}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl border transition-all",
                          prob.isAdded
                            ? "border-blue-100 bg-[#f8faff] dark:border-white/10 dark:bg-white/[0.02]"
                            : "border-slate-200/80 bg-white dark:border-white/5 dark:bg-white/[0.01]"
                        )}
                      >
                        {/* Left Side: Drag Handle + Number + Title + Subtitle */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* 6-Dots Drag Handle Icon */}
                          <div className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-grab px-1">
                            <GripVertical className="h-4 w-4" />
                          </div>

                          {/* Round Number Badge */}
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 dark:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-300">
                            {idx + 1}
                          </span>

                          {/* Title and Topics */}
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {prob.title}
                            </h4>
                            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {prob.difficulty} · {prob.category}
                            </p>
                          </div>
                        </div>

                        {/* Right Side: Action Button */}
                        <div>
                          {prob.isAdded ? (
                            <button
                              type="button"
                              onClick={() => handleToggleProblem(prob.id)}
                              className="rounded-xl bg-rose-50/80 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 px-4 py-1.5 text-xs font-semibold transition cursor-pointer"
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleProblem(prob.id)}
                              className="rounded-xl bg-indigo-50/80 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 px-4 py-1.5 text-xs font-semibold transition cursor-pointer"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {filteredProblems.length === 0 && (
                      <div className="py-10 text-center text-xs text-slate-400">
                        No practice problems match your search criteria.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Schedule (Matched to User Screenshot) */}
              {activeStep === 4 && (
                <div className="space-y-6">
                  {/* Step Header */}
                  <div>
                    <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Assignment Schedule
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Set the assignment availability window and late submission rules.
                    </p>
                  </div>

                  {/* Date & Time Inputs */}
                  <div className="space-y-4">
                    {/* Row 1: Start Date & Start Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                          Assignment Start Date <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={data.releaseDate}
                            onChange={(e) => {
                              setData({ ...data, releaseDate: e.target.value });
                              if (errors.releaseDate) clearError("releaseDate");
                            }}
                            placeholder="15-09-2026"
                            className={cn(
                              "w-full rounded-2xl border bg-slate-50/50 dark:bg-white/[0.02] pl-4 pr-11 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all font-medium",
                              errors.releaseDate
                                ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20"
                                : "border-slate-200/90 dark:border-white/10 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#151926] focus:ring-indigo-500/20"
                            )}
                          />
                          <Calendar className="pointer-events-none absolute right-4 h-4 w-4 text-slate-400" />
                        </div>
                        {errors.releaseDate && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>{errors.releaseDate}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                          Assignment Start Time
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={data.startTime || "18:00"}
                            onChange={(e) => setData({ ...data, startTime: e.target.value })}
                            placeholder="18:00"
                            className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] pl-4 pr-11 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#151926] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                          />
                          <Clock className="pointer-events-none absolute right-4 h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Submission Deadline & Deadline Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                          Submission Deadline <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={data.deadline}
                            onChange={(e) => {
                              setData({ ...data, deadline: e.target.value });
                              if (errors.deadline) clearError("deadline");
                            }}
                            placeholder="22-09-2026"
                            className={cn(
                              "w-full rounded-2xl border bg-slate-50/50 dark:bg-white/[0.02] pl-4 pr-11 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all font-medium",
                              errors.deadline
                                ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20"
                                : "border-slate-200/90 dark:border-white/10 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#151926] focus:ring-indigo-500/20"
                            )}
                          />
                          <Calendar className="pointer-events-none absolute right-4 h-4 w-4 text-slate-400" />
                        </div>
                        {errors.deadline && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>{errors.deadline}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                          Submission Deadline Time
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={data.deadlineTime || "23:59"}
                            onChange={(e) => setData({ ...data, deadlineTime: e.target.value })}
                            placeholder="23:59"
                            className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] pl-4 pr-11 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#151926] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                          />
                          <Clock className="pointer-events-none absolute right-4 h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Allow late submission pill toggle card */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setData({ ...data, allowLate: !data.allowLate })}
                      className="inline-flex items-center gap-4 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] px-5 py-3 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs hover:border-slate-300 dark:hover:border-white/20 transition cursor-pointer select-none"
                    >
                      <span>Allow late submission</span>
                      <div
                        className={cn(
                          "relative h-5 w-9 rounded-full transition-colors",
                          data.allowLate ? "bg-indigo-600" : "bg-slate-200 dark:bg-white/10"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-xs transition-transform",
                            data.allowLate ? "translate-x-4" : "translate-x-0.5"
                          )}
                        />
                      </div>
                    </button>

                    {data.allowLate && (
                      <div className="mt-3 flex items-center gap-3 p-3.5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/20 max-w-md animate-in fade-in-0 duration-200">
                        <label className="text-xs font-bold text-indigo-950 dark:text-indigo-200 shrink-0">
                          Late penalty rate:
                        </label>
                        <input
                          type="text"
                          value={data.latePenalty}
                          onChange={(e) => setData({ ...data, latePenalty: e.target.value })}
                          placeholder="10% per day"
                          className="w-full rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#151926] px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Row 4: Schedule summary card */}
                  <div className="rounded-2xl border border-slate-200/70 dark:border-white/5 bg-[#f8fafc] dark:bg-white/[0.02] p-5 space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Schedule summary
                    </h4>
                    <div className="space-y-1 text-xs">
                      <p className="text-slate-500 dark:text-slate-400">
                        Starts: <span className="font-bold text-slate-900 dark:text-white">{formatScheduleDateTime(data.releaseDate, data.startTime || "18:00")}</span>
                      </p>
                      <p className="text-slate-500 dark:text-slate-400">
                        Ends: <span className="font-bold text-slate-900 dark:text-white">{formatScheduleDateTime(data.deadline, data.deadlineTime || "23:59")}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Resources */}
              {activeStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Resources & Attachments
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Upload starter code templates, problem statements, and reference guides.
                    </p>
                  </div>

                  <div className="rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/20 dark:bg-indigo-950/20 p-8 text-center cursor-pointer hover:bg-indigo-50/40 transition">
                    <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                      <Upload className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Drop starter code or PDF documents here
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Supports ZIP, PDF, MD, IPYNB, DOCX (Max 50 MB)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Attached Files ({data.resources.length})
                    </p>
                    {data.resources.map((res) => (
                      <div
                        key={res.id}
                        className="flex items-center justify-between p-3 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-indigo-600" />
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{res.name}</p>
                            <p className="text-[10px] text-slate-400">{res.size}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setData({ ...data, resources: data.resources.filter((r) => r.id !== res.id) })}
                          className="text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 6: Submission */}
              {activeStep === 6 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Submission Settings <span className="text-rose-500">*</span>
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Select what format learners can use to submit their work. (At least 1 format required)
                    </p>
                  </div>

                  {errors.submissionTypes && (
                    <div className="p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/30 flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300 font-semibold animate-in fade-in-0">
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                      <span>{errors.submissionTypes}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    {[
                      { id: "Code Editor / IDE", desc: "Built-in online IDE with instant test case execution" },
                      { id: "ZIP / File upload", desc: "Upload zipped solution code, documents or PDF reports" },
                      { id: "GitHub repository link", desc: "Submit public or private GitHub/GitLab repository URL" },
                      { id: "Google Drive link", desc: "Share external drive link for project deliverables" },
                    ].map((opt) => {
                      const isSelected = data.submissionTypes.includes(opt.id);
                      return (
                        <div
                          key={opt.id}
                          onClick={() => toggleSubmissionType(opt.id)}
                          className={cn(
                            "flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer",
                            isSelected
                              ? "border-indigo-600 bg-indigo-50/30 dark:border-indigo-500 dark:bg-indigo-950/20"
                              : "border-slate-200/80 bg-white dark:border-white/5 dark:bg-white/[0.02]"
                          )}
                        >
                          <div
                            className={cn(
                              "grid h-5 w-5 shrink-0 place-items-center rounded-md border mt-0.5 transition-colors",
                              isSelected
                                ? "bg-indigo-600 border-indigo-600 text-white"
                                : "border-slate-300 dark:border-white/20 bg-white dark:bg-transparent"
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{opt.id}</p>
                            <p className="text-[11px] text-slate-400">{opt.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 7: Evaluation */}
              {activeStep === 7 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Evaluation & Grading
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Configure scoring rubrics, auto-grading rules, and passing criteria.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                        Total Marks <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={data.totalMarks}
                        onChange={(e) => {
                          setData({ ...data, totalMarks: Number(e.target.value) });
                          if (errors.totalMarks) clearError("totalMarks");
                        }}
                        className={cn(
                          "w-full rounded-2xl border bg-slate-50/50 dark:bg-white/[0.02] px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none font-bold",
                          errors.totalMarks
                            ? "border-rose-500 focus:border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20"
                            : "border-slate-200/90 dark:border-white/10 focus:border-indigo-500"
                        )}
                      />
                      {errors.totalMarks && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>{errors.totalMarks}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                        Passing Marks
                      </label>
                      <input
                        type="number"
                        value={data.passingMarks}
                        onChange={(e) => {
                          setData({ ...data, passingMarks: Number(e.target.value) });
                          if (errors.passingMarks) clearError("passingMarks");
                        }}
                        className={cn(
                          "w-full rounded-2xl border bg-slate-50/50 dark:bg-white/[0.02] px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none font-bold",
                          errors.passingMarks
                            ? "border-rose-500 focus:border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20"
                            : "border-slate-200/90 dark:border-white/10 focus:border-indigo-500"
                        )}
                      />
                      {errors.passingMarks && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>{errors.passingMarks}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                      Grading Mode
                    </label>
                    <CustomDropdown
                      value={data.gradingMode}
                      onChange={(val) => setData({ ...data, gradingMode: val })}
                      options={[
                        { value: "Automated Test Cases + Manual Code Review", label: "Automated Test Cases + Manual Code Review" },
                        { value: "100% Automated Grading", label: "100% Automated Grading (Instant score on submit)" },
                        { value: "Manual Instructor Review Only", label: "Manual Instructor Review Only" },
                      ]}
                      buttonClassName="py-3"
                    />
                  </div>
                </div>
              )}

              {/* Step 8: Visibility */}
              {activeStep === 8 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Visibility & Publishing
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Control which cohorts have access and configure launch notifications.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                      Target Cohort / Batch <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={data.targetCohort}
                      onChange={(e) => {
                        setData({ ...data, targetCohort: e.target.value });
                        if (errors.targetCohort) clearError("targetCohort");
                      }}
                      placeholder="e.g. All Enrolled Students, Batch 2026-A"
                      className={cn(
                        "w-full rounded-2xl border bg-slate-50/50 dark:bg-white/[0.02] px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none font-medium",
                        errors.targetCohort
                          ? "border-rose-500 focus:border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20"
                          : "border-slate-200/90 dark:border-white/10 focus:border-indigo-500"
                      )}
                    />
                    {errors.targetCohort && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{errors.targetCohort}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Notify enrolled students
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Send push notifications and email alerts immediately when published.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setData({ ...data, notifyStudents: !data.notifyStudents })}
                      className={cn(
                        "relative h-6 w-11 rounded-full transition-colors cursor-pointer",
                        data.notifyStudents ? "bg-indigo-600" : "bg-slate-300 dark:bg-white/10"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                          data.notifyStudents ? "translate-x-6" : "translate-x-1"
                        )}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* Footer Actions inside form container */}
              <div className="mt-8 flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-6">
                <button
                  type="button"
                  onClick={activeStep === 1 ? onClose : () => setActiveStep((s) => Math.max(1, s - 1))}
                  className="rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/5 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition cursor-pointer flex items-center gap-2"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>{activeStep === 1 ? "Cancel" : "Back"}</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(true)}
                    className="rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/5 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition cursor-pointer"
                  >
                    Preview assignment
                  </button>
                  {activeStep < 8 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition cursor-pointer active:scale-95"
                    >
                      <span>Continue</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePublishClick}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition cursor-pointer active:scale-95"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Publish assignment</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar Summary Section (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Card 1: Assignment summary */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Assignment summary
                </h3>
                <span className="text-indigo-600 dark:text-indigo-400">
                  <FileText className="h-4 w-4" />
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Assignment title</p>
                  <p className="mt-0.5 font-bold text-slate-900 dark:text-white">{data.title || "Untitled Assignment"}</p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Course</p>
                  <p className="mt-0.5 font-bold text-slate-900 dark:text-white">{data.course}</p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Module</p>
                  <p className="mt-0.5 font-bold text-slate-900 dark:text-white">{data.module}</p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Problems added</p>
                  <p className="mt-0.5 font-bold text-slate-900 dark:text-white">{data.problemsList.length}</p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Deadline</p>
                  <p className="mt-0.5 font-bold text-slate-900 dark:text-white">
                    {formatScheduleDateTime(data.deadline, data.deadlineTime || "") || data.deadline}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Submission type</p>
                  <p className="mt-0.5 font-bold text-slate-900 dark:text-white">
                    {data.submissionTypes.length > 1 ? "Multiple formats" : data.submissionTypes[0] || "Code Editor"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Total marks</p>
                  <p className="mt-0.5 font-bold text-slate-900 dark:text-white">{data.totalMarks}</p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Status</p>
                  <div className="mt-1">
                    <span className="rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/50 px-2 py-0.5 text-[10px] font-bold">
                      {data.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: CREATION PROGRESS */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-sm space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                CREATION PROGRESS
              </p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Step {activeStep} of 8
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Add New Bank Problem Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#121620] p-6 shadow-2xl border border-slate-100 dark:border-white/10 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Add Practice Problem
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const title = (form.elements.namedItem("title") as HTMLInputElement).value;
                const category = (form.elements.namedItem("category") as HTMLInputElement).value;
                if (title.trim()) {
                  handleAddNewBankProblem(title, category || "Array", modalDifficulty);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Problem Title <span className="text-rose-500">*</span>
                </label>
                <input
                  name="title"
                  required
                  placeholder="e.g. Subarray Sum Equals K"
                  className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Topic / Category
                  </label>
                  <input
                    name="category"
                    placeholder="e.g. Prefix Sum, Hash Table"
                    defaultValue="Array"
                    className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Difficulty
                  </label>
                  <CustomDropdown
                    value={modalDifficulty}
                    onChange={(val) => setModalDifficulty(val as any)}
                    options={["Easy", "Medium", "Hard"]}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200/90 dark:border-white/10 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-xs font-bold text-white cursor-pointer shadow-sm"
                >
                  Add Problem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#121620] p-6 shadow-2xl border border-slate-100 dark:border-white/10 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-indigo-600" />
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  {data.title}
                </h3>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-300">{data.description}</p>
              <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                <p className="font-bold text-indigo-950 dark:text-indigo-200">Instructions:</p>
                <p className="mt-1 text-indigo-900/80 dark:text-indigo-300/80">{data.instructions}</p>
              </div>

              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Problems to complete ({data.problemsList.length}):
                </p>
                <div className="space-y-1.5">
                  {data.problemsList.map((p, idx) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5"
                    >
                      <span className="font-semibold">{idx + 1}. {p.title}</span>
                      <span className="text-[10px] font-bold text-indigo-600">{p.difficulty} · {p.category}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-white/5">
                <span>Course: <strong>{data.course}</strong> · {data.module}</span>
                <span>Due: <strong>{formatScheduleDateTime(data.deadline, data.deadlineTime || "") || data.deadline}</strong></span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="rounded-xl bg-slate-900 dark:bg-white px-5 py-2 text-xs font-bold text-white dark:text-slate-900 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
