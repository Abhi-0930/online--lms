"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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
}

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=85";

const USER_COURSES_CACHE_KEY = "lms_user_cached_courses";

function readCachedCourses(): LiveCourseItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USER_COURSES_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function writeCachedCourses(items: LiveCourseItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USER_COURSES_CACHE_KEY, JSON.stringify(items));
  } catch {}
}

function inferCategory(title: string = "", description: string = ""): string {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes("dsa") || text.includes("data structure") || text.includes("algorithm")) return "DSA";
  if (text.includes("placement") || text.includes("interview sprint")) return "Placement";
  if (text.includes("web") || text.includes("frontend") || text.includes("react") || text.includes("full stack") || text.includes("javascript")) return "Web development";
  if (text.includes("system design") || text.includes("architecture") || text.includes("backend") || text.includes("database")) return "System design";
  return "Development";
}

function transformDbCourse(c: any): LiveCourseItem {
  const origPriceNum = typeof c.price === "number"
    ? c.price
    : (parseFloat(String(c.price || "0").replace(/[^0-9.]/g, "")) || 0);

  const discPriceNum = c.discountPrice !== undefined && c.discountPrice !== null && String(c.discountPrice).trim() !== ""
    ? (typeof c.discountPrice === "number"
        ? c.discountPrice
        : (parseFloat(String(c.discountPrice).replace(/[^0-9.]/g, "")) || 0))
    : 0;

  let rawPrice = origPriceNum;
  let formattedPrice = `₹ ${origPriceNum.toLocaleString("en-IN")}`;
  let originalPriceStr: string | undefined = undefined;
  let hasDiscount = false;
  let discountPercentage = 0;

  if (c.courseType === "Free" || (origPriceNum === 0 && discPriceNum === 0)) {
    rawPrice = 0;
    formattedPrice = "Free";
  } else if (discPriceNum > 0 && discPriceNum < origPriceNum) {
    rawPrice = discPriceNum;
    formattedPrice = `₹ ${discPriceNum.toLocaleString("en-IN")}`;
    originalPriceStr = `₹ ${origPriceNum.toLocaleString("en-IN")}`;
    hasDiscount = true;
    discountPercentage = Math.round(((origPriceNum - discPriceNum) / origPriceNum) * 100);
  } else if (origPriceNum > 0) {
    rawPrice = origPriceNum;
    formattedPrice = `₹ ${origPriceNum.toLocaleString("en-IN")}`;
  }

  const levelStr = c.level
    ? c.level.charAt(0).toUpperCase() + c.level.slice(1).toLowerCase().replace(/_/g, " ")
    : "Beginner";

  const rawModules = Array.isArray(c.modules) ? c.modules : [];
  const modules = rawModules.map((mod: any, mIdx: number) => {
    if (mod.topics && Array.isArray(mod.topics) && mod.topics.length > 0) {
      const allSubtopics = mod.topics.flatMap((t: any) => t.subtopics || []);
      const totalLessons = allSubtopics.length > 0 ? allSubtopics.length : mod.topics.length;
      return {
        id: mod.id || `mod_${mIdx}`,
        title: mod.title || `Module ${mIdx + 1}`,
        description: mod.description || "",
        lessons: totalLessons,
        duration: mod.duration || `${Math.max(15, totalLessons * 15)} mins`,
        complete: 0,
        topics: mod.topics,
      };
    }
    const lessons = Array.isArray(mod.lessons) ? mod.lessons : [];
    return {
      id: mod.id || `mod_${mIdx}`,
      title: mod.title || `Module ${mIdx + 1}`,
      description: mod.description || "",
      lessons: lessons.length || 0,
      duration: mod.duration || `${Math.max(15, (lessons.length || 1) * 15)} mins`,
      complete: 0,
      topics: lessons.length > 0 ? [
        {
          id: `top_${mod.id || mIdx}`,
          title: "Lessons",
          subtopics: lessons.map((l: any) => ({
            id: l.id,
            title: l.title,
            type: l.type ? (l.type.charAt(0).toUpperCase() + l.type.slice(1).toLowerCase()) : "Video",
            duration: l.durationSeconds ? `${Math.round(l.durationSeconds / 60)} mins` : "15 mins",
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
    instructorAvatar:
      c.instructor?.avatarUrl ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    students: studentsStr,
    duration: c.estimatedDuration || (c.durationValue ? `${c.durationValue} ${c.durationUnit || 'Days'}` : "12 Weeks"),
    lessons: lessonsStr,
    rating: "4.9",
    price: formattedPrice,
    originalPrice: originalPriceStr,
    discountPrice: hasDiscount ? `₹ ${discPriceNum.toLocaleString("en-IN")}` : undefined,
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
    rawOriginalPrice: origPriceNum,
    rawDiscountPrice: discPriceNum,
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
  };
}

export function useLiveCourses() {
  const [courses, setCourses] = useState<LiveCourseItem[]>(() => readCachedCourses());
  const [loading, setLoading] = useState(() => readCachedCourses().length === 0);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:4000/api/v1/courses", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : data.courses || [];
        const transformed = rawList.map(transformDbCourse);
        if (isMountedRef.current) {
          setCourses(transformed);
          writeCachedCourses(transformed);
          setError(null);
        }
      } else {
        if (isMountedRef.current) {
          // Keep existing cache
        }
      }
    } catch {
      if (isMountedRef.current) {
        // Backend offline fallback - keep cache
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchCourses();

    let socket: WebSocket | null = null;
    let reconnectTimer: any = null;

    const connectWs = () => {
      if (!isMountedRef.current) return;
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = window.location.hostname || "localhost";
        const wsUrl = `${protocol}//${host}:4000/api/v1/admin/ws`;

        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          socket?.send(JSON.stringify({ type: "REFRESH" }));
        };

        socket.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.type === "INITIAL_DATA" || payload.type === "DATA_UPDATE") {
              fetchCourses();
            }
          } catch {
            // Ignore non-json
          }
        };

        socket.onclose = () => {
          if (!isMountedRef.current) return;
          reconnectTimer = setTimeout(connectWs, 5000);
        };
      } catch {
        reconnectTimer = setTimeout(connectWs, 5000);
      }
    };

    connectWs();

    return () => {
      isMountedRef.current = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (socket) {
        socket.onclose = null;
        socket.close();
      }
    };
  }, [fetchCourses]);

  return {
    courses,
    loading,
    error,
    refreshCourses: fetchCourses,
  };
}
