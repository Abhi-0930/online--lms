"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { API_BASE_URL, WS_BASE_URL } from "@/lib/apiConfig";
import { sharedWs } from "@/lib/sharedWebSocket";

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

const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const isLocal =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".lan") ||
      /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname);
    if (isLocal) {
      return `http://${hostname}:4000`;
    }
  }
  return API_BASE_URL || "http://localhost:4000";
};

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() =>
    readCachedAnnouncements()
  );
  const [loading, setLoading] = useState<boolean>(() => readCachedAnnouncements().length === 0);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const urls = [
        `${baseUrl}/api/v1/announcements?_t=${Date.now()}`,
        `/api/v1/announcements?_t=${Date.now()}`,
        `${baseUrl}/api/v1/admin/announcements?_t=${Date.now()}`,
        `http://localhost:4000/api/v1/announcements?_t=${Date.now()}`,
      ];

      let fetchedData: any = null;
      for (const url of urls) {
        try {
          const res = await fetch(url, {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              "Pragma": "no-cache",
            },
          });
          if (res.ok) {
            fetchedData = await res.json();
            if (Array.isArray(fetchedData) || (fetchedData && Array.isArray(fetchedData.data))) {
              break;
            }
          }
        } catch {}
      }

      if (fetchedData) {
        const items = Array.isArray(fetchedData) ? fetchedData : fetchedData?.data || [];
        if (Array.isArray(items) && isMountedRef.current) {
          const liveItems = items.filter((a: any) => a && a.status !== "Draft");
          setAnnouncements(liveItems);
          writeCachedAnnouncements(liveItems);
          setError(null);
        }
      } else {
        if (isMountedRef.current) {
          const cached = readCachedAnnouncements();
          if (cached.length > 0) {
            setAnnouncements(cached);
          }
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

    // Fast interval polling every 3 seconds to catch new announcements in real-time
    const interval = setInterval(() => {
      fetchAnnouncements();
    }, 3000);

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        bc = new BroadcastChannel("lms_announcements_channel");
        bc.onmessage = () => {
          fetchAnnouncements();
        };
      }
    } catch {}

    const unsubscribe = sharedWs.subscribe((msg) => {
      if (
        msg?.type === "INITIAL_DATA" ||
        msg?.type === "DATA_UPDATE" ||
        msg?.type === "ANNOUNCEMENTS_UPDATED" ||
        msg?.type === "ANNOUNCEMENT_CREATED" ||
        msg?.type === "ANNOUNCEMENT_DELETED" ||
        msg?.type === "LIVE_SESSIONS_UPDATED"
      ) {
        if (msg.data?.announcements && Array.isArray(msg.data.announcements)) {
          const publicAnnouncements = msg.data.announcements.filter(
            (a: any) => a.status !== "Draft"
          );
          setAnnouncements(publicAnnouncements);
          writeCachedAnnouncements(publicAnnouncements);
        } else {
          fetchAnnouncements();
        }
      }
    });

    const handleLocalSync = () => {
      fetchAnnouncements();
    };

    window.addEventListener("focus", handleLocalSync);
    window.addEventListener("storage", handleLocalSync);
    window.addEventListener("lms_announcements_updated", handleLocalSync);
    window.addEventListener("lms_live_sessions_updated", handleLocalSync);

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
      if (bc) {
        try {
          bc.close();
        } catch {}
      }
      unsubscribe();
      window.removeEventListener("focus", handleLocalSync);
      window.removeEventListener("storage", handleLocalSync);
      window.removeEventListener("lms_announcements_updated", handleLocalSync);
      window.removeEventListener("lms_live_sessions_updated", handleLocalSync);
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
