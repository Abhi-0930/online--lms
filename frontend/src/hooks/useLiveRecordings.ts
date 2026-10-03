"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { API_BASE_URL, WS_BASE_URL } from "@/lib/apiConfig";
import { sharedWs } from "@/lib/sharedWebSocket";

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

    const unsubscribe = sharedWs.subscribe((payload) => {
      if (payload?.type === "INITIAL_DATA" || payload?.type === "DATA_UPDATE") {
        if (payload.data?.recordings && Array.isArray(payload.data.recordings)) {
          const pub = payload.data.recordings.filter((r: any) => r && r.status !== "Draft");
          setRecordings(pub);
          writeCache(pub);
        } else {
          fetchRecordings();
        }
      }
    });

    return () => {
      isMountedRef.current = false;
      unsubscribe();
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("lms:recordings-updated", handleCustom);
      window.removeEventListener("lms_recordings_updated", handleCustom);
    };
  }, [fetchRecordings]);

  return {
    recordings,
    loading,
    refreshRecordings: fetchRecordings,
  };
}
