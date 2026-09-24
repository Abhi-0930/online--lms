"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface AnnouncementItem {
  id: string;
  title: string;
  content?: string;
  body?: string;
  description?: string;
  category?: string;
  targetAudience?: string;
  publishedAt?: string;
  date?: string;
  isPinned?: boolean;
  status?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  meetingLink?: string;
  platform?: string;
  instructor?: string;
  sessionId?: string;
  sessionData?: any;
  course?: string;
  module?: string;
  topic?: string;
  startTime?: string;
  endTime?: string;
  timezone?: string;
  hostNotes?: string;
  passcode?: string;
  resources?: any[];
  sessionType?: string;
}

const CACHE_KEY = "lms_admin_announcements";

function readCachedAnnouncements(): AnnouncementItem[] {
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

function writeCachedAnnouncements(items: AnnouncementItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(items));
  } catch {}
}

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() =>
    readCachedAnnouncements()
  );
  const [loading, setLoading] = useState<boolean>(() => readCachedAnnouncements().length === 0);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/v1/announcements?_t=${Date.now()}`, {
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
          setAnnouncements(items);
          writeCachedAnnouncements(items);
          setError(null);
        }
      } else {
        if (isMountedRef.current) {
          // Keep cached
        }
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        const cached = readCachedAnnouncements();
        if (cached.length > 0) {
          setAnnouncements(cached);
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
    fetchAnnouncements();

    // WebSocket real-time connection
    let socket: WebSocket | null = null;
    let reconnectTimer: any = null;
    let pingInterval: any = null;

    const connectWs = () => {
      if (!isMountedRef.current) return;
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = window.location.hostname || "localhost";
        const wsUrl = `${protocol}//${host}:4000/api/v1/admin/ws`;

        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          if (!isMountedRef.current) return;
          socket?.send(JSON.stringify({ type: "REFRESH" }));

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
              if (msg.data?.announcements && Array.isArray(msg.data.announcements)) {
                const publicAnnouncements = msg.data.announcements.filter(
                  (a: any) => a.status !== "Draft"
                );
                setAnnouncements(publicAnnouncements);
                writeCachedAnnouncements(publicAnnouncements);
              } else {
                fetchAnnouncements();
              }
            } else if (
              msg.type === "ANNOUNCEMENTS_UPDATED" ||
              msg.type === "ANNOUNCEMENT_CREATED" ||
              msg.type === "ANNOUNCEMENT_DELETED" ||
              msg.type === "LIVE_SESSIONS_UPDATED"
            ) {
              fetchAnnouncements();
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

    const handleLocalSync = () => {
      fetchAnnouncements();
    };

    window.addEventListener("storage", handleLocalSync);
    window.addEventListener("lms_announcements_updated", handleLocalSync);
    window.addEventListener("lms_live_sessions_updated", handleLocalSync);

    const pollInterval = setInterval(fetchAnnouncements, 4000);

    return () => {
      isMountedRef.current = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (pingInterval) clearInterval(pingInterval);
      if (pollInterval) clearInterval(pollInterval);
      window.removeEventListener("storage", handleLocalSync);
      window.removeEventListener("lms_announcements_updated", handleLocalSync);
      window.removeEventListener("lms_live_sessions_updated", handleLocalSync);
      if (socket) {
        socket.onclose = null;
        socket.close();
      }
    };
  }, [fetchAnnouncements]);

  const unreadCount = announcements.length;

  return {
    announcements,
    unreadCount,
    loading,
    error,
    refreshAnnouncements: fetchAnnouncements,
  };
}
