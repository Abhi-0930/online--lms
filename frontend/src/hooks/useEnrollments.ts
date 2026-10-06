"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { API_BASE_URL, getAuthHeaders } from "@/lib/apiConfig";

export interface EnrollmentItem {
  id: string;
  courseId: string;
  status: string;
  progressPct: number;
  enrolledAt: string;
  course?: {
    id: string;
    slug: string;
    title: string;
    subtitle?: string;
    price: number;
    coverImageUrl?: string;
    level?: string;
  };
}

export const ENROLLMENTS_CACHE_KEY = "lms_user_enrollments_cache_v2";
export const ENROLLMENTS_UPDATED_EVENT = "lms:enrollments-updated";

function loadCachedEnrollments(): EnrollmentItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ENROLLMENTS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function broadcastEnrollmentUpdate(data?: any) {
  if (typeof window === "undefined") return;
  try {
    if (Array.isArray(data)) {
      localStorage.setItem(ENROLLMENTS_CACHE_KEY, JSON.stringify(data));
    } else if (data && typeof data === "object") {
      const current = loadCachedEnrollments();
      let updated = [...current];
      const newEnr = data.enrollment || (data.courseId ? data : null);
      if (newEnr) {
        const item: EnrollmentItem = {
          id: newEnr.id || `enr_${Date.now()}`,
          courseId: newEnr.courseId || newEnr.course?.id,
          status: newEnr.status || "ACTIVE",
          progressPct: newEnr.progressPct ?? 0,
          enrolledAt: newEnr.enrolledAt || new Date().toISOString(),
          course: data.course || newEnr.course,
        };
        const exists = updated.some(
          (e) => e.id === item.id || e.courseId === item.courseId || (item.courseId && e.course?.id === item.courseId)
        );
        if (!exists) {
          updated = [item, ...updated];
        }
        localStorage.setItem(ENROLLMENTS_CACHE_KEY, JSON.stringify(updated));
      }
    }
    window.dispatchEvent(new CustomEvent(ENROLLMENTS_UPDATED_EVENT, { detail: data }));
  } catch {}
}

export function useEnrollments() {
  const { user, isAuthenticated } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>(() => loadCachedEnrollments());
  const [loading, setLoading] = useState(true);

  const fetchEnrollments = useCallback(async () => {
    if (!isAuthenticated) {
      setEnrollments([]);
      setLoading(false);
      try {
        localStorage.removeItem(ENROLLMENTS_CACHE_KEY);
      } catch {}
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/payments/my-enrollments`, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        const list: EnrollmentItem[] = Array.isArray(data.enrollments) ? data.enrollments : [];
        setEnrollments(list);
        try {
          localStorage.setItem(ENROLLMENTS_CACHE_KEY, JSON.stringify(list));
        } catch {}
      }
    } catch {
      // Fallback if offline or server rebooting
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  // Real-time synchronization across all component instances & tabs
  useEffect(() => {
    const handleUpdate = (event?: any) => {
      const detail = event?.detail;
      if (detail) {
        if (Array.isArray(detail)) {
          setEnrollments(detail);
        } else if (detail.enrollment || detail.courseId) {
          const newEnr = detail.enrollment || detail;
          setEnrollments((prev) => {
            const item: EnrollmentItem = {
              id: newEnr.id || `enr_${Date.now()}`,
              courseId: newEnr.courseId || newEnr.course?.id,
              status: newEnr.status || "ACTIVE",
              progressPct: newEnr.progressPct ?? 0,
              enrolledAt: newEnr.enrolledAt || new Date().toISOString(),
              course: detail.course || newEnr.course,
            };
            const exists = prev.some(
              (e) => e.id === item.id || e.courseId === item.courseId || (item.courseId && e.course?.id === item.courseId)
            );
            if (exists) return prev;
            const updated = [item, ...prev];
            try {
              localStorage.setItem(ENROLLMENTS_CACHE_KEY, JSON.stringify(updated));
            } catch {}
            return updated;
          });
        }
      }
      fetchEnrollments();
    };

    window.addEventListener(ENROLLMENTS_UPDATED_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(ENROLLMENTS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [fetchEnrollments]);

  const addEnrollmentOptimistically = useCallback((newEnr: Partial<EnrollmentItem> & { courseId: string; course?: any }) => {
    const item: EnrollmentItem = {
      id: newEnr.id || `enr_${Date.now()}`,
      courseId: newEnr.courseId,
      status: newEnr.status || "ACTIVE",
      progressPct: newEnr.progressPct ?? 0,
      enrolledAt: newEnr.enrolledAt || new Date().toISOString(),
      course: newEnr.course,
    };
    setEnrollments((prev) => {
      const exists = prev.some(
        (e) => e.id === item.id || e.courseId === item.courseId || (item.courseId && e.course?.id === item.courseId)
      );
      if (exists) return prev;
      const updated = [item, ...prev];
      try {
        localStorage.setItem(ENROLLMENTS_CACHE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    broadcastEnrollmentUpdate(item);
  }, []);

  const isEnrolled = useCallback(
    (courseIdentifier: string) => {
      return enrollments.some(
        (e) =>
          e.courseId === courseIdentifier ||
          e.course?.id === courseIdentifier ||
          e.course?.slug === courseIdentifier
      );
    },
    [enrollments]
  );

  return {
    enrollments,
    loading,
    isEnrolled,
    addEnrollmentOptimistically,
    refreshEnrollments: async () => {
      broadcastEnrollmentUpdate();
      return await fetchEnrollments();
    },
  };
}
