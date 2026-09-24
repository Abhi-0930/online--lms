"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface LiveSessionItem {
  id: string;
  title: string;
  instructor?: string;
  sessionType?: string;
  category?: string;
  description?: string;
  content?: string;

  courseId?: string | null;
  course?: string;
  module?: string;
  topic?: string;
  targetCohort?: string;
  targetAudience?: string;
  date?: string;
  timezone?: string;
  startTime?: string;
  endTime?: string;
  platform?: string;
  meetingLink?: string;
  passcode?: string;
  hostNotes?: string;
  resources?: any[];
  emailReminders?: boolean;
  inAppNotifications?: boolean;
  reminderSchedule?: string;
  autoRecord?: boolean;
  uploadRecording?: boolean;
  aiNotes?: boolean;
  autoPublishRecording?: boolean;
  trackAttendance?: boolean;
  attendanceMethod?: string;
  attendanceThreshold?: string;
  maxAttendees?: string | number;
  visibility?: string;
  status?: "Scheduled" | "Live" | "Completed" | "Draft" | string;
  attendees?: number;
  createdAt?: string;
  updatedAt?: string;
  sessionData?: any;
}

const CACHE_KEY = "lms_admin_live_sessions";

function readCachedLiveSessions(): LiveSessionItem[] {
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

function writeCachedLiveSessions(items: LiveSessionItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(items));
  } catch {}
}

export function useLiveSessions() {
  const [sessions, setSessions] = useState<LiveSessionItem[]>(() => readCachedLiveSessions());
  const [loading, setLoading] = useState<boolean>(() => readCachedLiveSessions().length === 0);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/v1/live-sessions?_t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
        },
      });

      if (res.ok) {
        const json = await res.json();
        const items = Array.isArray(json) ? json : json?.data || [];
        if (Array.isArray(items) && isMountedRef.current) {
          setSessions(items);
          writeCachedLiveSessions(items);
          setError(null);
        }
      } else {
        if (isMountedRef.current) {
          // Keep cached version
        }
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        // Fallback to cache
        const cached = readCachedLiveSessions();
        if (cached.length > 0) {
          setSessions(cached);
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchSessions();

    // WebSocket real-time connection
    let socket: WebSocket | null = null;
    let reconnectTimer: any = null;
    let pingInterval: any = null;

    const connectWs = () => {
      if (!isMountedRef.current) return;
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = window.location.hostname || "localhost";
        // Connect to unified /api/v1/admin/ws or /ws
        const wsUrl = `${protocol}//${host}:4000/api/v1/admin/ws`;

        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          if (!isMountedRef.current) return;
          socket?.send(JSON.stringify({ type: "REFRESH" }));

          // Keep-alive ping every 25 seconds
          if (pingInterval) clearInterval(pingInterval);
          pingInterval = setInterval(() => {
            if (socket && socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ type: "PING" }));
            }
          }, 25000);
        };

        socket.onmessage = (event) => {
          if (!isMountedRef.current) return;
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === "INITIAL_DATA" || msg.type === "DATA_UPDATE") {
              if (msg.data?.liveSessions && Array.isArray(msg.data.liveSessions)) {
                // Filter out drafts for learner frontend
                const publicSessions = msg.data.liveSessions.filter(
                  (s: any) => s.status !== "Draft"
                );
                setSessions(publicSessions);
                writeCachedLiveSessions(publicSessions);
              } else {
                fetchSessions();
              }
            } else if (
              msg.type === "LIVE_SESSIONS_UPDATED" ||
              msg.type === "LIVE_SESSION_CREATED" ||
              msg.type === "LIVE_SESSION_UPDATED" ||
              msg.type === "LIVE_SESSION_DELETED"
            ) {
              fetchSessions();
            }
          } catch {
            // Ignore non-json frames
          }
        };

        socket.onclose = () => {
          if (pingInterval) clearInterval(pingInterval);
          if (isMountedRef.current) {
            reconnectTimer = setTimeout(connectWs, 3000);
          }
        };

        socket.onerror = () => {
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.close();
          }
        };
      } catch {
        if (isMountedRef.current) {
          reconnectTimer = setTimeout(connectWs, 5000);
        }
      }
    };

    connectWs();

    // Event listeners for intra-window sync
    const handleLocalSync = () => {
      fetchSessions();
    };

    window.addEventListener("storage", handleLocalSync);
    window.addEventListener("lms_live_sessions_updated", handleLocalSync);

    // Periodic background sync fallback
    const pollInterval = setInterval(fetchSessions, 4000);

    return () => {
      isMountedRef.current = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (pingInterval) clearInterval(pingInterval);
      if (pollInterval) clearInterval(pollInterval);
      window.removeEventListener("storage", handleLocalSync);
      window.removeEventListener("lms_live_sessions_updated", handleLocalSync);
      if (socket) {
        socket.onclose = null;
        socket.close();
      }
    };
  }, [fetchSessions]);

  const upcomingSessions = sessions.filter(
    (s) => s.status !== "Completed" && s.status !== "Draft"
  );

  const activeLiveSessions = sessions.filter((s) => s.status === "Live");

  return {
    sessions,
    upcomingSessions,
    activeLiveSessions,
    loading,
    error,
    refreshSessions: fetchSessions,
  };
}
