"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";

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

export function useEnrollments() {
  const { user, isAuthenticated } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEnrollments = useCallback(async () => {
    if (!isAuthenticated) {
      setEnrollments([]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/v1/payments/my-enrollments", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setEnrollments(data.enrollments || []);
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
    refreshEnrollments: fetchEnrollments,
  };
}
