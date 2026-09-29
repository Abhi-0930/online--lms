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

export function broadcastEnrollmentUpdate(enrollments?: EnrollmentItem[]) {
  if (typeof window === "undefined") return;
  try {
    if (enrollments && Array.isArray(enrollments)) {
      localStorage.setItem(ENROLLMENTS_CACHE_KEY, JSON.stringify(enrollments));
    }
    window.dispatchEvent(new CustomEvent(ENROLLMENTS_UPDATED_EVENT, { detail: enrollments }));
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
    const handleUpdate = () => {
      fetchEnrollments();
    };

    window.addEventListener(ENROLLMENTS_UPDATED_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(ENROLLMENTS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [fetchEnrollments]);

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
    refreshEnrollments: () => {
      broadcastEnrollmentUpdate();
      return fetchEnrollments();
    },
  };
}
