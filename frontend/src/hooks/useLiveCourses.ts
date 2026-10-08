"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { API_BASE_URL, WS_BASE_URL } from "@/lib/apiConfig";
import { sharedWs } from "@/lib/sharedWebSocket";

export interface LiveCourseItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  instructor: string;
  instructorRole: string;
  instructorAvatar: string;
  students: string;
  duration: string;
  lessons: string;
  rating: string;
  price: string;
  originalPrice?: string;
  discountPrice?: string;
  hasDiscount?: boolean;
  discountPercentage?: number;
  currency?: string;
  category: string;
  level: string;
  image: string;
  badgeText: string;
  progress: number;
  accent: string;
  rawPrice: number;
  rawOriginalPrice?: number;
  rawDiscountPrice?: number;
  modules?: any[];
  learningOutcomes?: string[];
  prerequisites?: string;
  targetAudience?: string;
  requirements?: string[];
  targetLearners?: string[];
  skillsCovered?: string[];
  tags?: string[];
  certificateAvailable?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  accessType?: string;
  courseVisibility?: string;
  startDate?: string;
  endDate?: string;
}

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=85";

function deduplicateCourses(items: LiveCourseItem[]): LiveCourseItem[] {
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const unique: LiveCourseItem[] = [];

  for (const item of items) {
    if (!item) continue;
    const id = String(item.id || "").trim();
    const slug = String(item.slug || "").trim();

    if (id && seenIds.has(id)) continue;
    if (slug && seenSlugs.has(slug)) continue;

    if (id) seenIds.add(id);
    if (slug) seenSlugs.add(slug);
    unique.push(item);
  }

  return unique;
}

function inferCategory(title: string = "", description: string = ""): string {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes("dsa") || text.includes("data structure") || text.includes("algorithm")) return "DSA";
  if (text.includes("placement") || text.includes("interview sprint")) return "Placement";
  if (text.includes("web") || text.includes("frontend") || text.includes("react") || text.includes("full stack") || text.includes("javascript")) return "Web development";
  if (text.includes("system design") || text.includes("architecture") || text.includes("backend") || text.includes("database")) return "System design";
  return "Development";
}

function parsePriceNumber(val: any): number {
  if (val === undefined || val === null || val === "") return 0;
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  const clean = String(val).replace(/[^0-9.]/g, "");
  return parseFloat(clean) || 0;
}

export function cleanLessonTitle(str: any): string {
  if (!str || typeof str !== "string") return "";
  let cleaned = str.trim();
  // Strip repeated variations of "Lessons & Topics", "Lessons and Topics", "Lessons", etc. with separators
  cleaned = cleaned.replace(/(Lessons?\s*(&|and)?\s*Topics?(\s*[·\-\/:]\s*)*)+/gi, "");
  // Clean up repeated "Topic:\s*Topic:\s*"
  cleaned = cleaned.replace(/^(Topic:\s*)+/i, "Topic: ");
  // Clean leading/trailing delimiters
  cleaned = cleaned.replace(/^([·\-\/:\s]+)/, "").replace(/([·\-\/:\s]+)$/, "").trim();
  return cleaned || str.trim();
}

export function cleanTopicTitle(str: any): string {
  if (!str || typeof str !== "string") return "Topic";
  const cleaned = cleanLessonTitle(str);
  if (!cleaned || cleaned.toLowerCase() === "lessons & topics" || cleaned.toLowerCase() === "lessons and topics" || cleaned.toLowerCase() === "lessons") {
    return "Topic";
  }
  return cleaned;
}

export function cleanCourseModules(modules: any[]): any[] {
  if (!Array.isArray(modules)) return [];
  return modules.map((mod, mIdx) => {
    const modTitle = cleanLessonTitle(mod.title) || `Module ${mIdx + 1}`;
    if (Array.isArray(mod.topics) && mod.topics.length > 0) {
      const cleanedTopics = mod.topics.map((t: any) => {
        let tTitle = cleanTopicTitle(t.title);
        const cleanedSubtopics = Array.isArray(t.subtopics)
          ? t.subtopics.map((s: any) => ({
              ...s,
              title: cleanLessonTitle(s.title),
              isCompleted: s.isCompleted !== undefined ? Boolean(s.isCompleted) : s.status === "Completed",
              status: s.status || (s.isCompleted ? "Completed" : "Published"),
              isCompletedByInstructor: s.isCompletedByInstructor !== undefined ? Boolean(s.isCompletedByInstructor) : (Boolean(s.isCompleted) || s.status === "Completed" || Boolean(s.videoUrl)),
            }))
          : [];
        return {
          ...t,
          title: tTitle,
          subtopics: cleanedSubtopics,
          isCompleted: t.isCompleted !== undefined ? Boolean(t.isCompleted) : t.status === "Completed",
          status: t.status || (t.isCompleted ? "Completed" : "Published"),
          isCompletedByInstructor: t.isCompletedByInstructor !== undefined ? Boolean(t.isCompletedByInstructor) : (Boolean(t.isCompleted) || t.status === "Completed" || Boolean(t.videoUrl)),
        };
      });
      return {
        ...mod,
        title: modTitle,
        topics: cleanedTopics,
        isCompleted: mod.isCompleted !== undefined ? Boolean(mod.isCompleted) : mod.status === "Completed",
        status: mod.status || (mod.isCompleted ? "Completed" : "Published"),
      };
    }
    if (Array.isArray(mod.lessons) && mod.lessons.length > 0) {
      const cleanedLessons = mod.lessons.map((l: any) => ({
        ...l,
        title: cleanLessonTitle(l.title),
        isCompleted: l.isCompleted !== undefined ? Boolean(l.isCompleted) : l.status === "Completed",
        status: l.status || (l.isCompleted ? "Completed" : "Published"),
        isCompletedByInstructor: l.isCompletedByInstructor !== undefined ? Boolean(l.isCompletedByInstructor) : (Boolean(l.isCompleted) || l.status === "Completed" || Boolean(l.videoUrl)),
      }));
      return {
        ...mod,
        title: modTitle,
        lessons: cleanedLessons,
        isCompleted: mod.isCompleted !== undefined ? Boolean(mod.isCompleted) : mod.status === "Completed",
        status: mod.status || (mod.isCompleted ? "Completed" : "Published"),
      };
    }
    return {
      ...mod,
      title: modTitle,
      isCompleted: mod.isCompleted !== undefined ? Boolean(mod.isCompleted) : mod.status === "Completed",
      status: mod.status || (mod.isCompleted ? "Completed" : "Published"),
    };
  });
}

function transformDbCourse(c: any): LiveCourseItem {
  const p1 = parsePriceNumber(c.price);
  const p2 = parsePriceNumber(c.discountPrice);
  const p3 = parsePriceNumber(c.originalPrice || c.rawOriginalPrice || c.mrp);

  let rawPrice = 0;
  let formattedPrice = "Free";
  let originalPriceStr: string | undefined = undefined;
  let hasDiscount = false;
  let discountPercentage = 0;
  let rawOriginalPrice = 0;
  let rawDiscountPrice = 0;

  if (c.courseType === "Free" || (p1 === 0 && p2 === 0 && p3 === 0)) {
    rawPrice = 0;
    formattedPrice = "Free";
    hasDiscount = false;
  } else {
    // Determine selling price (what user actually pays) and original/MRP price (what is struck through)
    let sellingPrice = 0;
    let originalPrice = 0;

    if (p1 > 0 && p2 > 0 && p1 !== p2) {
      // Both base price and discountPrice are present and different
      originalPrice = Math.max(p1, p2);
      sellingPrice = Math.min(p1, p2);
    } else if (p3 > 0 && p1 > 0 && p3 !== p1) {
      // Explicit originalPrice / MRP provided and different from price
      originalPrice = Math.max(p1, p3);
      sellingPrice = Math.min(p1, p3);
    } else if (p1 > 0) {
      sellingPrice = p1;
      originalPrice = p1;
    } else if (p2 > 0) {
      sellingPrice = p2;
      originalPrice = p2;
    }

    rawPrice = sellingPrice;
    formattedPrice = `₹ ${sellingPrice.toLocaleString("en-IN")}`;

    if (originalPrice > sellingPrice && sellingPrice > 0) {
      hasDiscount = true;
      originalPriceStr = `₹ ${originalPrice.toLocaleString("en-IN")}`;
      discountPercentage = Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);
      rawOriginalPrice = originalPrice;
      rawDiscountPrice = sellingPrice;
    } else {
      rawOriginalPrice = sellingPrice;
      rawDiscountPrice = sellingPrice;
    }
  }

  const levelStr = c.level
    ? c.level.charAt(0).toUpperCase() + c.level.slice(1).toLowerCase().replace(/_/g, " ")
    : "Beginner";

  const rawModules = Array.isArray(c.modules) ? c.modules : [];
  const modules = rawModules.map((mod: any, mIdx: number) => {
    const modTitle = cleanLessonTitle(mod.title) || `Module ${mIdx + 1}`;
    if (mod.topics && Array.isArray(mod.topics) && mod.topics.length > 0) {
      const cleanedTopics = mod.topics.map((top: any) => {
        let tTitle = cleanTopicTitle(top.title);
        const subtopics = Array.isArray(top.subtopics)
          ? top.subtopics.map((sub: any) => ({
              ...sub,
              title: cleanLessonTitle(sub.title),
              isCompleted: sub.isCompleted !== undefined ? Boolean(sub.isCompleted) : sub.status === "Completed",
              status: sub.status || (sub.isCompleted ? "Completed" : "Published"),
              isCompletedByInstructor: sub.isCompletedByInstructor !== undefined ? Boolean(sub.isCompletedByInstructor) : (Boolean(sub.isCompleted) || sub.status === "Completed" || Boolean(sub.videoUrl)),
            }))
          : [];
        return {
          ...top,
          title: tTitle,
          subtopics,
          isCompleted: top.isCompleted !== undefined ? Boolean(top.isCompleted) : top.status === "Completed",
          status: top.status || (top.isCompleted ? "Completed" : "Published"),
          isCompletedByInstructor: top.isCompletedByInstructor !== undefined ? Boolean(top.isCompletedByInstructor) : (Boolean(top.isCompleted) || top.status === "Completed" || Boolean(top.videoUrl)),
        };
      });
      const allSubtopics = cleanedTopics.flatMap((t: any) => t.subtopics || []);
      const totalLessons = allSubtopics.length > 0 ? allSubtopics.length : cleanedTopics.length;
      return {
        ...mod,
        id: mod.id || `mod_${mIdx}`,
        title: modTitle,
        description: mod.description || "",
        lessons: totalLessons,
        duration: mod.duration || `${Math.max(15, totalLessons * 15)} mins`,
        complete: 0,
        isCompleted: mod.isCompleted !== undefined ? Boolean(mod.isCompleted) : mod.status === "Completed",
        status: mod.status || (mod.isCompleted ? "Completed" : "Published"),
        topics: cleanedTopics,
      };
    }
    const lessons = Array.isArray(mod.lessons) ? mod.lessons : [];
    const cleanedLessons = lessons.map((l: any) => ({
      ...l,
      title: cleanLessonTitle(l.title),
      isCompleted: l.isCompleted !== undefined ? Boolean(l.isCompleted) : l.status === "Completed",
      status: l.status || (l.isCompleted ? "Completed" : "Published"),
      isCompletedByInstructor: l.isCompletedByInstructor !== undefined ? Boolean(l.isCompletedByInstructor) : (Boolean(l.isCompleted) || l.status === "Completed" || Boolean(l.videoUrl)),
    }));
    return {
      ...mod,
      id: mod.id || `mod_${mIdx}`,
      title: modTitle,
      description: mod.description || "",
      lessons: cleanedLessons.length || 0,
      duration: mod.duration || `${Math.max(15, (cleanedLessons.length || 1) * 15)} mins`,
      complete: 0,
      isCompleted: mod.isCompleted !== undefined ? Boolean(mod.isCompleted) : mod.status === "Completed",
      status: mod.status || (mod.isCompleted ? "Completed" : "Published"),
      topics: cleanedLessons.length > 0 ? [
        {
          id: `top_${mod.id || mIdx}`,
          title: "Topic",
          subtopics: cleanedLessons.map((l: any) => ({
            ...l,
            id: l.id,
            title: l.title,
            type: l.type ? (l.type.charAt(0).toUpperCase() + l.type.slice(1).toLowerCase()) : "Video",
            duration: l.durationSeconds ? `${Math.round(l.durationSeconds / 60)} mins` : (l.duration || "15 mins"),
            isCompleted: l.isCompleted !== undefined ? Boolean(l.isCompleted) : l.status === "Completed",
            status: l.status || (l.isCompleted ? "Completed" : "Published"),
            isCompletedByInstructor: l.isCompletedByInstructor !== undefined ? Boolean(l.isCompletedByInstructor) : (Boolean(l.isCompleted) || l.status === "Completed" || Boolean(l.videoUrl)),
          })),
        }
      ] : [],
    };
  });

  const totalLessonsCount = modules.reduce((sum: number, m: any) => sum + (m.lessons || 0), 0);
  const lessonsStr = totalLessonsCount > 0
    ? `${modules.length} module${modules.length > 1 ? "s" : ""} · ${totalLessonsCount} lesson${totalLessonsCount > 1 ? "s" : ""}`
    : modules.length > 0
    ? `${modules.length} module${modules.length > 1 ? "s" : ""}`
    : "Curriculum inside";

  const enrollmentCount = c._count?.enrollments ?? (Array.isArray(c.enrollments) ? c.enrollments.length : 0);
  const studentsStr = enrollmentCount > 0 ? `${enrollmentCount} learners` : (c.students ? `${c.students} learners` : "0 learners");

  const category = c.category || inferCategory(c.title, c.description);
  const accent = category === "DSA" ? "blue" : category === "Placement" ? "violet" : category === "Web development" ? "amber" : "emerald";

  const learningOutcomes = Array.isArray(c.learningOutcomes)
    ? c.learningOutcomes.map((s: any) => String(s).trim()).filter(Boolean)
    : [];

  const prerequisites = typeof c.prerequisites === "string"
    ? c.prerequisites
    : (Array.isArray(c.requirements) ? c.requirements.join("\n") : "");

  const requirements = Array.isArray(c.requirements) && c.requirements.length > 0
    ? c.requirements.map((s: any) => String(s).trim()).filter(Boolean)
    : (prerequisites ? prerequisites.split("\n").map(s => s.trim()).filter(Boolean) : []);

  const targetAudience = typeof c.targetAudience === "string"
    ? c.targetAudience
    : (Array.isArray(c.targetLearners) ? c.targetLearners.join(", ") : "");

  const targetLearners = Array.isArray(c.targetLearners) && c.targetLearners.length > 0
    ? c.targetLearners.map((s: any) => String(s).trim()).filter(Boolean)
    : (targetAudience ? targetAudience.split(",").map(s => s.trim()).filter(Boolean) : []);

  const skillsCovered = Array.isArray(c.skillsCovered) && c.skillsCovered.length > 0
    ? c.skillsCovered.map((s: any) => String(s).trim()).filter(Boolean)
    : (Array.isArray(c.tags) ? c.tags.map((s: any) => String(s).trim()).filter(Boolean) : []);

  return {
    id: c.id,
    slug: c.slug || c.id,
    title: c.title || "Untitled Course",
    subtitle: c.subtitle || c.description?.slice(0, 90) || "",
    description: c.description || "",
    instructor: c.instructorName || c.instructor?.fullName || "Platform Admin",
    instructorRole: "Lead Instructor • Mentor",
    instructorAvatar: c.instructor?.avatarUrl || "",
    students: studentsStr,
    duration: c.estimatedDuration || (c.durationValue ? `${c.durationValue} ${c.durationUnit || 'Days'}` : "12 Weeks"),
    lessons: lessonsStr,
    rating: "4.9",
    price: formattedPrice,
    originalPrice: originalPriceStr,
    discountPrice: hasDiscount ? `₹ ${rawDiscountPrice.toLocaleString("en-IN")}` : undefined,
    hasDiscount,
    discountPercentage,
    currency: c.currency || "INR ₹",
    category,
    level: levelStr,
    image: c.coverImageUrl || c.thumbnailPreview || DEFAULT_COVER,
    badgeText: c.title || "Course",
    progress: 0,
    accent,
    rawPrice,
    rawOriginalPrice,
    rawDiscountPrice,
    modules,
    learningOutcomes,
    prerequisites,
    targetAudience,
    requirements,
    targetLearners,
    skillsCovered,
    tags: Array.isArray(c.tags) ? c.tags : [],
    certificateAvailable: c.certificateAvailable !== undefined ? c.certificateAvailable : true,
    seoTitle: c.seoTitle || "",
    seoDescription: c.seoDescription || "",
    accessType: c.accessType || "Lifetime Access",
    courseVisibility: c.courseVisibility || "Public",
    startDate: c.startDate || "",
    endDate: c.endDate || "",
  };
}

// Module-level in-memory RAM cache and single-flight promise deduplication
let memoryCoursesCache: LiveCourseItem[] | null = null;
let memoryCoursesCacheTimestamp = 0;
let activeCoursesFetchPromise: Promise<LiveCourseItem[]> | null = null;
const MEMORY_CACHE_TTL_MS = 60 * 1000; // 60 seconds soft TTL
const memorySubscribers = new Set<(courses: LiveCourseItem[]) => void>();

export function invalidateCoursesMemoryCache(): void {
  memoryCoursesCache = null;
  memoryCoursesCacheTimestamp = 0;
  activeCoursesFetchPromise = null;
}

export function broadcastCoursesUpdate(): void {
  invalidateCoursesMemoryCache();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lms:courses-updated"));
  }
}

async function fetchCoursesGlobal(force = false): Promise<LiveCourseItem[]> {
  const now = Date.now();
  if (!force && memoryCoursesCache && memoryCoursesCache.length > 0 && (now - memoryCoursesCacheTimestamp < MEMORY_CACHE_TTL_MS)) {
    return memoryCoursesCache;
  }

  if (activeCoursesFetchPromise) {
    return activeCoursesFetchPromise;
  }

  activeCoursesFetchPromise = (async () => {
    try {
      const url = force 
        ? `${API_BASE_URL}/api/v1/courses?_t=${Date.now()}`
        : `${API_BASE_URL}/api/v1/courses`;
        
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : data.courses || [];
        const transformed = deduplicateCourses(rawList.map(transformDbCourse));
        memoryCoursesCache = transformed;
        memoryCoursesCacheTimestamp = Date.now();
        // Synchronously notify all active hook subscribers
        memorySubscribers.forEach((subscriber) => {
          try {
            subscriber(transformed);
          } catch {}
        });
        return transformed;
      } else {
        console.warn("Failed to fetch courses, status:", res.status);
        return memoryCoursesCache || [];
      }
    } catch (err: any) {
      console.error("Error fetching courses from API:", err);
      return memoryCoursesCache || [];
    } finally {
      activeCoursesFetchPromise = null;
    }
  })();

  return activeCoursesFetchPromise;
}

export function useLiveCourses() {
  const [courses, setCourses] = useState<LiveCourseItem[]>(() => memoryCoursesCache || []);
  const [loading, setLoading] = useState<boolean>(() => !memoryCoursesCache || memoryCoursesCache.length === 0);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  // Clear legacy local storage keys if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("lms_user_cached_courses");
        localStorage.removeItem("lms_user_cached_courses_v2");
        localStorage.removeItem("lms_user_cached_courses_v3");
      } catch {}
    }
  }, []);

  const runFetch = useCallback(async (force = false) => {
    if (!memoryCoursesCache || memoryCoursesCache.length === 0 || force) {
      if (!memoryCoursesCache || memoryCoursesCache.length === 0) {
        setLoading(true);
      }
    }
    try {
      const result = await fetchCoursesGlobal(force);
      if (isMountedRef.current) {
        setCourses(result);
        setError(null);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err.message || "Failed to load courses");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    const subscriber = (updated: LiveCourseItem[]) => {
      if (isMountedRef.current) {
        setCourses(updated);
        setLoading(false);
      }
    };
    memorySubscribers.add(subscriber);

    // Initial load / background revalidation
    runFetch(false);

    const handleCoursesUpdate = () => {
      invalidateCoursesMemoryCache();
      runFetch(true);
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "lms_course_change_signal") {
        invalidateCoursesMemoryCache();
        runFetch(true);
      }
    };

    const handleVisibilityChange = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        runFetch(false);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("lms:courses-updated", handleCoursesUpdate);
      window.addEventListener("lms:enrollments-updated", handleCoursesUpdate);
      window.addEventListener("focus", handleCoursesUpdate);
      window.addEventListener("storage", handleStorage);
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    const unsubscribe = sharedWs.subscribe((payload) => {
      if (payload?.type === "INITIAL_DATA" || payload?.type === "DATA_UPDATE" || payload?.type === "COURSES_UPDATE") {
        invalidateCoursesMemoryCache();
        runFetch(true);
      }
    });

    return () => {
      isMountedRef.current = false;
      memorySubscribers.delete(subscriber);
      unsubscribe();
      if (typeof window !== "undefined") {
        window.removeEventListener("lms:courses-updated", handleCoursesUpdate);
        window.removeEventListener("lms:enrollments-updated", handleCoursesUpdate);
        window.removeEventListener("focus", handleCoursesUpdate);
        window.removeEventListener("storage", handleStorage);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
    };
  }, [runFetch]);

  return {
    courses,
    loading,
    error,
    refreshCourses: () => runFetch(true),
  };
}

