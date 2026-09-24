"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface RecordingResource {
  id: number | string;
  name: string;
  size?: string;
  url?: string;
  type?: string;
}

export interface RecordingChapter {
  id: number | string;
  timestamp: string;
  title: string;
}

export interface LiveRecordingItem {
  id: string;
  title: string;
  instructor: string;
  recordingType: string;
  description: string;
  course: string;
  courseId?: string | null;
  module?: string;
  topic?: string;
  targetCohort?: string;
  videoUrl?: string;
  videoFileName?: string;
  videoFileSize?: string;
  date: string;
  duration: string;
  sessionTime?: string;
  resources: RecordingResource[];
  chapters: RecordingChapter[];
  visibility?: string;
  accessType?: string;
  allowDownload?: boolean;
  showInCurriculum?: boolean;
  generateAiNotes?: boolean;
  enableComments?: boolean;
  status: string;
  views: number;
  createdAt?: string;
  updatedAt?: string;
}

const CACHE_KEY = "lms_user_cached_recordings";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function readCache(): LiveRecordingItem[] {
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

function writeCache(data: LiveRecordingItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {}
}

export function useLiveRecordings() {
  const [recordings, setRecordings] = useState<LiveRecordingItem[]>(() => readCache());
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return readCache().length === 0;
  });
  const isMountedRef = useRef(true);

  const fetchRecordings = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/recordings`, {
        cache: "no-store",
        headers: { "Pragma": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && isMountedRef.current) {
          const published = data.filter((r: any) => r && r.status !== "Draft");
          setRecordings(published);
          writeCache(published);
        }
      }
    } catch {
      // Backend offline fallback
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchRecordings();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === CACHE_KEY) {
        setRecordings(readCache());
      }
    };
    const handleCustom = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setRecordings(e.detail.filter((r: any) => r && r.status !== "Draft"));
      } else {
        fetchRecordings();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("lms:recordings-updated", handleCustom);
    window.addEventListener("lms_recordings_updated", handleCustom);

    // Live WebSocket connection for instant updates
    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;

    const connectWs = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = window.location.hostname || "localhost";
        ws = new WebSocket(`${protocol}//${host}:4000/api/v1/ws`);

        ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.type === "INITIAL_DATA" || payload.type === "DATA_UPDATE") {
              if (payload.data?.recordings && Array.isArray(payload.data.recordings)) {
                const pub = payload.data.recordings.filter((r: any) => r && r.status !== "Draft");
                setRecordings(pub);
                writeCache(pub);
              }
            }
          } catch {}
        };

        ws.onclose = () => {
          if (isMountedRef.current) {
            reconnectTimer = setTimeout(connectWs, 4000);
          }
        };
      } catch {}
    };

    connectWs();

    const pollInterval = setInterval(() => {
      fetchRecordings();
    }, 4000);

    return () => {
      isMountedRef.current = false;
      clearInterval(pollInterval);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("lms:recordings-updated", handleCustom);
      window.removeEventListener("lms_recordings_updated", handleCustom);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
    };
  }, [fetchRecordings]);

  return {
    recordings,
    loading,
    refreshRecordings: fetchRecordings,
  };
}
