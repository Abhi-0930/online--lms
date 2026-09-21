"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface LiveAssignmentItem {
  id: string;
  title: string;
  description: string;
  instructions: string;
  course: string;
  courseId: string | null;
  module: string;
  topic: string;
  difficulty: string;
  problemsCount: number;
  problemsList: any[];
  dueDate: string;
  releaseDate: string;
  allowLate: boolean;
  resources: any[];
  submissionTypes: string[];
  totalMarks: number;
  passingMarks: number;
  status: string;
  userSubmission?: {
    id: string;
    status: string;
    score: number | null;
    maxScore: number;
    submittedAt: string;
    content?: string;
    githubUrl?: string;
    fileUrl?: string;
  } | null;
}

export interface UserSubmissionItem {
  id: string;
  assignmentId: string;
  assignment?: {
    id: string;
    title: string;
    courseName?: string;
    totalMarks?: number;
  };
  content?: string;
  fileUrl?: string;
  githubUrl?: string;
  status: string;
  score?: number | null;
  maxScore?: number;
  feedback?: string;
  submittedAt: string;
}

const DEFAULT_ASSIGNMENTS: LiveAssignmentItem[] = [];

const CACHE_KEY = "lms_user_cached_assignments";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function readCached(): LiveAssignmentItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function writeCached(items: LiveAssignmentItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(items));
  } catch {}
}

export function useAssignments() {
  const [assignments, setAssignments] = useState<LiveAssignmentItem[]>(() => readCached());
  const [submissions, setSubmissions] = useState<UserSubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const fetchAssignmentsData = useCallback(async () => {
    try {
      const [asgRes, subRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/assignments`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }),
        fetch(`${API_BASE_URL}/api/v1/assignments/my-submissions`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }),
      ]);

      if (asgRes.ok) {
        const data = await asgRes.json();
        const list = Array.isArray(data) ? data : data.assignments || [];
        if (isMountedRef.current) {
          setAssignments(list);
          writeCached(list);
          setError(null);
        }
      }

      if (subRes.ok) {
        const subData = await subRes.json();
        const subList = Array.isArray(subData) ? subData : subData.submissions || [];
        if (isMountedRef.current) {
          setSubmissions(subList);
        }
      }
    } catch {
      // Keep cached / default assignments
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const submitAssignment = async (
    assignmentId: string,
    data: { content?: string; fileUrl?: string; githubUrl?: string; userId?: string }
  ) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/assignments/${assignmentId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        // Optimistically update assignment status in state
        setAssignments((prev) =>
          prev.map((a) =>
            a.id === assignmentId
              ? {
                  ...a,
                  userSubmission: {
                    id: `SUB-${Date.now()}`,
                    status: "PENDING",
                    score: null,
                    maxScore: a.totalMarks || 100,
                    submittedAt: new Date().toISOString(),
                    content: data.content,
                    githubUrl: data.githubUrl,
                    fileUrl: data.fileUrl,
                  },
                }
              : a
          )
        );
        await fetchAssignmentsData();
        return { success: true };
      }
      const errJson = await res.json().catch(() => ({}));
      return { success: false, error: errJson.error || "Submission failed" };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error submitting assignment" };
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    fetchAssignmentsData();

    let socket: WebSocket | null = null;
    let reconnectTimer: any = null;

    const connectWs = () => {
      if (!isMountedRef.current) return;
      try {
        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsHost = window.location.hostname || "localhost";
        const wsUrl = `${wsProtocol}//${wsHost}:4000/api/v1/admin/ws`;

        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          socket?.send(JSON.stringify({ type: "REFRESH" }));
        };

        socket.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.type === "INITIAL_DATA" || payload.type === "DATA_UPDATE") {
              fetchAssignmentsData();
            }
          } catch {
            // Ignore
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
  }, [fetchAssignmentsData]);

  return {
    assignments,
    submissions,
    loading,
    error,
    refreshAssignments: fetchAssignmentsData,
    submitAssignment,
  };
}
