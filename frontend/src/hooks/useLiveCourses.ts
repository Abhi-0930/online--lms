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
  category: string;
  level: string;
  image: string;
  badgeText: string;
  progress: number;
  accent: string;
  rawPrice: number;
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
  const numericPrice = Math.round(Number(c.price || 0));
  const formattedPrice = `₹ ${numericPrice.toLocaleString("en-IN")}`;

  const levelStr = c.level
    ? c.level.charAt(0) + c.level.slice(1).toLowerCase().replace(/_/g, " ")
    : "Beginner";

  const moduleCount = c._count?.modules ?? (Array.isArray(c.modules) ? c.modules.length : 0);
  const lessonsStr = moduleCount > 0 ? `${moduleCount} modules` : "Curriculum inside";
  const enrollmentCount = c._count?.enrollments ?? (Array.isArray(c.enrollments) ? c.enrollments.length : 0);
  const studentsStr = enrollmentCount > 0 ? `${enrollmentCount} learners` : "0 learners";

  const category = c.category || inferCategory(c.title, c.description);
  const accent = category === "DSA" ? "blue" : category === "Placement" ? "violet" : category === "Web development" ? "amber" : "emerald";

  return {
    id: c.id,
    slug: c.slug || c.id,
    title: c.title || "Untitled Course",
    subtitle: c.subtitle || c.description?.slice(0, 90) || "",
    description: c.description || "",
    instructor: c.instructor?.fullName || "Abhishek Jujjuvarapu",
    instructorRole: "Full Stack Engineer • Mentor",
    instructorAvatar:
      c.instructor?.avatarUrl ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    students: studentsStr,
    duration: "Self-paced",
    lessons: lessonsStr,
    rating: "4.9",
    price: formattedPrice,
    category,
    level: levelStr,
    image: c.coverImageUrl || DEFAULT_COVER,
    badgeText: c.title || "Course",
    progress: 0,
    accent,
    rawPrice: numericPrice,
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
