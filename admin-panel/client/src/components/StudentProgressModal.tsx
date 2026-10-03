import React, { useState, useEffect, useMemo } from "react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  BookOpen,
  GraduationCap,
  PlayCircle,
  FileText,
  Code2,
  CircleHelp,
  Sparkles,
  RotateCcw,
  Save,
  X,
  Clock,
  Layers,
  UserCheck
} from "lucide-react";
import { API_BASE_URL } from "@/lib/apiConfig";
import { Course, StudentItem } from "@/hooks/useLiveAdminData";
import { cn } from "@/lib/utils";

export interface StudentProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentItem | null;
  courses: Course[];
  onProgressSaved?: (studentId: string | number, newProgress: number, courseId: string) => void;
  onToast: (msg: string) => void;
}

export default function StudentProgressModal({
  isOpen,
  onClose,
  student,
  courses,
  onProgressSaved,
  onToast,
}: StudentProgressModalProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [progressData, setProgressData] = useState<any>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Auto-detect enrolled course or first available course
  useEffect(() => {
    if (!isOpen || !student) return;

    let matchedCourseId = "";
    if (student.course && student.course !== "Not enrolled") {
      const match = courses.find(
        (c) =>
          String(c.title).toLowerCase() === student.course.toLowerCase() ||
          student.course.toLowerCase().includes(String(c.title).toLowerCase()) ||
          String(c.title).toLowerCase().includes(student.course.toLowerCase())
      );
      if (match) {
        matchedCourseId = String(match.id);
      }
    }

    if (!matchedCourseId && courses.length > 0) {
      matchedCourseId = String(courses[0].id);
    }

    setSelectedCourseId(matchedCourseId);
  }, [isOpen, student, courses]);

  // Fetch progress whenever student or selectedCourseId changes
  useEffect(() => {
    if (!isOpen || !student || !selectedCourseId) return;

    let isMounted = true;
    const fetchProgress = async () => {
      setIsLoading(true);
      try {
        const studentIdentifier = encodeURIComponent(String(student.id || student.email));
        const courseIdentifier = encodeURIComponent(selectedCourseId);
        const res = await fetch(
          `${API_BASE_URL}/api/v1/admin/students/${studentIdentifier}/courses/${courseIdentifier}/progress`
        );

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setProgressData(data);
            setCompletedIds(new Set(data.completedLessonIds || []));

            // Expand all modules by default
            const expandedMap: Record<string, boolean> = {};
            (data.modules || []).forEach((m: any, idx: number) => {
              expandedMap[m.id || `mod_${idx}`] = true;
            });
            setExpandedModules(expandedMap);
          }
        } else {
          // Construct fallback data from local course
          const localCourse = courses.find((c) => String(c.id) === selectedCourseId);
          if (localCourse && isMounted) {
            const fallbackModules = (localCourse.modules || []).map((m: any, idx: number) => ({
              id: m.id || `mod_${idx}`,
              title: m.title || `Module ${idx + 1}`,
              lessons: (m.topics || []).flatMap((t: any, tIdx: number) =>
                (t.subtopics || [t]).map((s: any, sIdx: number) => ({
                  id: String(s.id || `top_${tIdx}_sub_${sIdx}`),
                  title: s.title || `Lesson ${sIdx + 1}`,
                  type: s.type || "Video",
                  duration: s.duration || "15 mins",
                }))
              ),
            }));

            setProgressData({
              student: { id: student.id, name: student.name, email: student.email },
              course: { id: localCourse.id, title: localCourse.title, subtitle: localCourse.track },
              modules: fallbackModules,
            });
            setCompletedIds(new Set());
          }
        }
      } catch (err) {
        console.error("Failed to load progress details:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProgress();

    return () => {
      isMounted = false;
    };
  }, [isOpen, student, selectedCourseId, courses]);

  // Compute all lesson IDs
  const allLessons = useMemo(() => {
    if (!progressData?.modules) return [];
    const list: any[] = [];
    progressData.modules.forEach((mod: any) => {
      if (Array.isArray(mod.lessons)) {
        mod.lessons.forEach((l: any) => {
          list.push({ ...l, moduleId: mod.id, moduleTitle: mod.title });
        });
      }
    });
    return list;
  }, [progressData]);

  const totalLessonsCount = allLessons.length;
  const completedLessonsCount = allLessons.filter((l) => completedIds.has(l.id)).length;
  const currentProgressPct =
    totalLessonsCount > 0
      ? Math.round((completedLessonsCount / totalLessonsCount) * 100)
      : 0;

  // Toggle single lesson completion
  const handleToggleLesson = (lessonId: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }
      return next;
    });
  };

  // Toggle entire module completion
  const handleToggleModule = (module: any) => {
    const modLessonIds: string[] = (module.lessons || []).map((l: any) => String(l.id));
    const allModCompleted = modLessonIds.every((id) => completedIds.has(id));

    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (allModCompleted) {
        modLessonIds.forEach((id) => next.delete(id));
      } else {
        modLessonIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  // Select All
  const handleSelectAll = () => {
    const allIds = new Set<string>(allLessons.map((l) => l.id));
    setCompletedIds(allIds);
  };

  // Clear All
  const handleClearAll = () => {
    setCompletedIds(new Set());
  };

  // Toggle Module Expand/Collapse
  const toggleModuleAccordion = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  // Save changes to API
  const handleSave = async () => {
    if (!student || !selectedCourseId) return;

    setIsSaving(true);
    try {
      const studentIdentifier = encodeURIComponent(String(student.id || student.email));
      const courseIdentifier = encodeURIComponent(selectedCourseId);

      const res = await fetch(
        `${API_BASE_URL}/api/v1/admin/students/${studentIdentifier}/courses/${courseIdentifier}/progress`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            completedLessonIds: Array.from(completedIds),
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        onToast(`Successfully updated lesson progress for ${student.name} (${data.progressPct}%)`);
        if (onProgressSaved) {
          onProgressSaved(student.id, data.progressPct, selectedCourseId);
        }
        onClose();
      } else {
        const err = await res.json().catch(() => ({}));
        onToast(err.error || "Failed to save progress");
      }
    } catch (err: any) {
      onToast(err.message || "Network error while saving progress");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3.5">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-600/20">
              {student.avatar || student.name.charAt(0)}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {student.name}
                </h3>
                <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/40 px-2 py-0.5 text-[10px] font-extrabold text-indigo-700 dark:text-indigo-300">
                  <UserCheck className="h-2.5 w-2.5" />
                  Learner Checklist
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {student.email} · {student.education || "Student"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Top Control Bar: Course Selector + Live Progress Metric */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-[#121620] flex flex-wrap items-center justify-between gap-4">
          {/* Course Selector Dropdown */}
          <div className="flex items-center gap-2.5 min-w-[240px] flex-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
              Course:
            </span>
            <div className="relative flex-1">
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-2 text-xs font-bold text-slate-800 dark:text-white pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
              >
                {courses.map((c) => (
                  <option key={c.id} value={String(c.id)} className="text-slate-900 bg-white dark:bg-[#121620] dark:text-white">
                    {c.title} ({c.track || "Course"})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Quick Checklist Batch Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSelectAll}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 transition cursor-pointer"
            >
              <Check className="h-3 w-3" />
              <span>Mark All Complete</span>
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:text-rose-600 transition cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset All</span>
            </button>
          </div>
        </div>

        {/* Live Progress Bar Banner */}
        <div className="px-6 py-3.5 bg-indigo-50/60 dark:bg-indigo-950/20 border-b border-indigo-100/80 dark:border-indigo-900/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-2.5 flex-1 max-w-md rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300 rounded-full",
                  currentProgressPct === 100
                    ? "bg-emerald-500"
                    : currentProgressPct > 0
                    ? "bg-indigo-600"
                    : "bg-transparent"
                )}
                style={{ width: `${currentProgressPct}%` }}
              />
            </div>
            <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-300 whitespace-nowrap">
              {currentProgressPct}% Complete
            </span>
          </div>

          <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 shrink-0">
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
              {completedLessonsCount}
            </span>{" "}
            of {totalLessonsCount} lessons ticked
          </div>
        </div>

        {/* Modules & Lessons Checklist Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="h-6 w-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
              <span className="text-xs font-semibold">Loading course curriculum checklist...</span>
            </div>
          ) : !progressData?.modules || progressData.modules.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <BookOpen className="h-8 w-8 mx-auto opacity-30" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                No modules found for this course
              </p>
              <p className="text-[11px] text-slate-400">
                Edit the course in Course Builder to add curriculum modules and lessons.
              </p>
            </div>
          ) : (
            progressData.modules.map((module: any, mIdx: number) => {
              const modId = module.id || `mod_${mIdx}`;
              const isExpanded = expandedModules[modId] !== false;
              const modLessons = module.lessons || [];
              const modCompletedCount = modLessons.filter((l: any) =>
                completedIds.has(String(l.id))
              ).length;
              const isModComplete =
                modLessons.length > 0 && modCompletedCount === modLessons.length;

              return (
                <div
                  key={modId}
                  className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/[0.02] shadow-xs overflow-hidden"
                >
                  {/* Module Header Bar */}
                  <div className="flex items-center justify-between p-3.5 sm:p-4 bg-slate-50/80 dark:bg-white/[0.03] border-b border-slate-100 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => toggleModuleAccordion(modId)}
                      className="flex items-center gap-2.5 text-left flex-1 min-w-0 cursor-pointer"
                    >
                      <span className="grid h-6 w-6 place-items-center rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 shrink-0">
                        {String(mIdx + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {module.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5">
                          {modLessons.length} lessons · {modCompletedCount} completed
                        </p>
                      </div>
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0",
                          isExpanded && "rotate-90"
                        )}
                      />
                    </button>

                    {/* Quick Mark Module Complete Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleModule(module)}
                      className={cn(
                        "ml-3 px-2.5 py-1 rounded-lg text-[10px] font-bold transition shrink-0 cursor-pointer flex items-center gap-1",
                        isModComplete
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          : "bg-slate-200/60 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      )}
                    >
                      {isModComplete ? (
                        <>
                          <Check className="h-3 w-3 stroke-[3]" />
                          <span>Module Done</span>
                        </>
                      ) : (
                        <span>Check Module</span>
                      )}
                    </button>
                  </div>

                  {/* Module Lessons Checklist */}
                  {isExpanded && (
                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                      {modLessons.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400 italic">
                          No lessons inside this module.
                        </div>
                      ) : (
                        modLessons.map((lesson: any, lIdx: number) => {
                          const lessonId = String(lesson.id || `mod_${modId}_les_${lIdx}`);
                          const isDone = completedIds.has(lessonId);

                          return (
                            <div
                              key={lessonId}
                              onClick={() => handleToggleLesson(lessonId)}
                              className={cn(
                                "flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition cursor-pointer select-none",
                                isDone && "bg-emerald-50/20 dark:bg-emerald-950/10"
                              )}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {/* Interactive Checkbox */}
                                <div
                                  className={cn(
                                    "grid h-5 w-5 place-items-center rounded-md border transition shrink-0",
                                    isDone
                                      ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                                      : "border-slate-300 dark:border-white/20 bg-white dark:bg-white/5 hover:border-indigo-400"
                                  )}
                                >
                                  {isDone && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                                </div>

                                {/* Lesson Icon */}
                                <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 shrink-0">
                                  {lesson.type === "Quiz" ? (
                                    <CircleHelp className="h-3.5 w-3.5 text-amber-500" />
                                  ) : lesson.type === "Assignment" ? (
                                    <FileText className="h-3.5 w-3.5 text-violet-500" />
                                  ) : lesson.type === "Code" ? (
                                    <Code2 className="h-3.5 w-3.5 text-emerald-500" />
                                  ) : (
                                    <PlayCircle className="h-3.5 w-3.5 text-indigo-500" />
                                  )}
                                </span>

                                {/* Title */}
                                <div className="min-w-0">
                                  <p
                                    className={cn(
                                      "text-xs font-semibold truncate",
                                      isDone
                                        ? "text-slate-900 dark:text-white"
                                        : "text-slate-700 dark:text-slate-300"
                                    )}
                                  >
                                    {lesson.title}
                                  </p>
                                </div>
                              </div>

                              {/* Duration & Type Meta */}
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                                  <Clock className="h-2.5 w-2.5" />
                                  {lesson.duration || "15 mins"}
                                </span>
                                <span className="rounded-md bg-slate-100 dark:bg-white/5 px-2 py-0.5 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                  {lesson.type || "Video"}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Action Buttons */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/80 dark:bg-white/[0.02]">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Changes will instantly update the learner's dashboard and course progress.
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !selectedCourseId}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2 text-xs font-bold transition shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <div className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Progress ({currentProgressPct}%)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
