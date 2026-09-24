"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";

export interface DailyActivityRecord {
  date: string; // "YYYY-MM-DD"
  activeMinutes: number;
  activeSeconds?: number;
  problemsSolved: number;
  lessonsCompleted: number;
  assignmentsSubmitted: number;
  lastActiveTimestamp?: number;
}

export interface ActivityBarItem {
  key: string;
  label: string;
  shortLabel: string;
  fullDate: string;
  minutes: number;
  seconds: number;
  formattedTime: string;
  heightPercent: number;
  isToday: boolean;
  problemsSolved: number;
  lessonsCompleted: number;
  assignmentsSubmitted: number;
}

export interface WeekDayStatus {
  dayLetter: string;
  dayName: string;
  date: string;
  isActive: boolean;
  isToday: boolean;
  isFuture: boolean;
  minutes: number;
}

export const REAL_ACTIVITY_STORAGE_KEY = "lms_user_real_activity_v2";
export const TODAY_SECONDS_KEY = "lms_user_today_active_seconds_v2";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function getLocalDateString(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatMinutes(mins: number, secs = 0): string {
  const totalSeconds = Math.max(0, mins * 60 + secs);
  if (totalSeconds <= 0) return "0m";
  if (totalSeconds < 60) return `${totalSeconds}s`;

  const totalMins = Math.floor(totalSeconds / 60);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;

  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function loadStoredActivity(): Record<string, DailyActivityRecord> {
  if (typeof window === "undefined") return {};
  try {
    // Purge obsolete mock storage key if present from previous test builds
    localStorage.removeItem("lms_user_activity_history");

    const raw = localStorage.getItem(REAL_ACTIVITY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch {}
  return {};
}

export function useUserActivity() {
  const { isAuthenticated } = useAuth();
  const [activityMap, setActivityMap] = useState<Record<string, DailyActivityRecord>>(() => loadStoredActivity());
  const [liveSecondsToday, setLiveSecondsToday] = useState<number>(0);
  const isMountedRef = useRef(true);
  const lastInteractionRef = useRef<number>(Date.now());

  // Load today's real seconds on mount & purge any stale mock history
  useEffect(() => {
    if (typeof window === "undefined") return;
    const todayStr = getLocalDateString();
    try {
      localStorage.removeItem("lms_user_activity_history");

      const savedSecs = localStorage.getItem(`${TODAY_SECONDS_KEY}_${todayStr}`);
      if (savedSecs) {
        const parsed = parseInt(savedSecs, 10);
        if (!isNaN(parsed) && parsed > 0) {
          setLiveSecondsToday(parsed);
        }
      }
    } catch {}
  }, []);

  // Sync state when localStorage changes across windows/tabs
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const updated = loadStoredActivity();
        setActivityMap(updated);
      } catch {}
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("lms:activity-updated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("lms:activity-updated", handleStorageChange);
    };
  }, []);

  // Fetch real backend activity logs if authenticated
  const fetchBackendActivity = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/progress/activity`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.dailyMap && typeof data.dailyMap === "object" && isMountedRef.current) {
          setActivityMap((prev) => {
            const merged = { ...prev };
            for (const [dateKey, val] of Object.entries(data.dailyMap as Record<string, any>)) {
              merged[dateKey] = {
                date: dateKey,
                activeMinutes: Math.max(merged[dateKey]?.activeMinutes || 0, val.minutes || 0),
                activeSeconds: Math.max(merged[dateKey]?.activeSeconds || 0, (val.minutes || 0) * 60),
                problemsSolved: Math.max(merged[dateKey]?.problemsSolved || 0, val.problems || 0),
                lessonsCompleted: Math.max(merged[dateKey]?.lessonsCompleted || 0, val.lessons || 0),
                assignmentsSubmitted: Math.max(merged[dateKey]?.assignmentsSubmitted || 0, val.submissions || 0),
              };
            }
            try {
              localStorage.setItem(REAL_ACTIVITY_STORAGE_KEY, JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      }
    } catch {}
  }, [isAuthenticated]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchBackendActivity();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchBackendActivity]);

  // Track real user presence and activity (mouse, key, scroll, touch)
  useEffect(() => {
    const onUserInteraction = () => {
      lastInteractionRef.current = Date.now();
    };

    window.addEventListener("mousemove", onUserInteraction, { passive: true });
    window.addEventListener("keydown", onUserInteraction, { passive: true });
    window.addEventListener("scroll", onUserInteraction, { passive: true });
    window.addEventListener("click", onUserInteraction, { passive: true });
    window.addEventListener("touchstart", onUserInteraction, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onUserInteraction);
      window.removeEventListener("keydown", onUserInteraction);
      window.removeEventListener("scroll", onUserInteraction);
      window.removeEventListener("click", onUserInteraction);
      window.removeEventListener("touchstart", onUserInteraction);
    };
  }, []);

  // 1-second real-time precision heartbeat ticker
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document === "undefined") return;

      const isVisible = document.visibilityState === "visible";
      const isFocused = document.hasFocus ? document.hasFocus() : true;
      const isIdle = Date.now() - lastInteractionRef.current > 180000; // 3 minutes idle pause

      if (isVisible && isFocused && !isIdle) {
        const todayStr = getLocalDateString();

        setLiveSecondsToday((prevSec) => {
          const nextSec = prevSec + 1;
          const nextMin = Math.floor(nextSec / 60);

          // Save exact seconds to localStorage every 5 seconds
          if (nextSec % 5 === 0) {
            try {
              localStorage.setItem(`${TODAY_SECONDS_KEY}_${todayStr}`, nextSec.toString());

              setActivityMap((prevMap) => {
                const existing = prevMap[todayStr] || {
                  date: todayStr,
                  activeMinutes: 0,
                  activeSeconds: 0,
                  problemsSolved: 0,
                  lessonsCompleted: 0,
                  assignmentsSubmitted: 0,
                };

                const updated: DailyActivityRecord = {
                  ...existing,
                  activeMinutes: Math.max(existing.activeMinutes, nextMin),
                  activeSeconds: nextSec,
                  lastActiveTimestamp: Date.now(),
                };

                const nextMap = { ...prevMap, [todayStr]: updated };
                localStorage.setItem(REAL_ACTIVITY_STORAGE_KEY, JSON.stringify(nextMap));
                return nextMap;
              });
            } catch {}
          }

          // Sync with backend every 60 seconds of continuous active presence
          if (nextSec % 60 === 0 && isAuthenticated) {
            fetch(`${API_BASE_URL}/api/v1/progress/activity`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                action: "ACTIVE_SESSION_PRESENCE",
                metadata: { durationMinutes: 1 },
              }),
            }).catch(() => {});
          }

          return nextSec;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Log active study time directly
  const logStudyTime = useCallback(
    (minutes: number, reason = "STUDY_SESSION") => {
      const todayStr = getLocalDateString();
      const addedSeconds = minutes * 60;

      setLiveSecondsToday((prev) => {
        const nextSec = prev + addedSeconds;
        try {
          localStorage.setItem(`${TODAY_SECONDS_KEY}_${todayStr}`, nextSec.toString());
        } catch {}
        return nextSec;
      });

      setActivityMap((prev) => {
        const existing = prev[todayStr] || {
          date: todayStr,
          activeMinutes: 0,
          activeSeconds: 0,
          problemsSolved: 0,
          lessonsCompleted: 0,
          assignmentsSubmitted: 0,
        };

        const updated: DailyActivityRecord = {
          ...existing,
          activeMinutes: existing.activeMinutes + minutes,
          activeSeconds: (existing.activeSeconds || 0) + addedSeconds,
          lastActiveTimestamp: Date.now(),
        };

        const nextMap = { ...prev, [todayStr]: updated };
        try {
          localStorage.setItem(REAL_ACTIVITY_STORAGE_KEY, JSON.stringify(nextMap));
          window.dispatchEvent(new CustomEvent("lms:activity-updated"));
        } catch {}
        return nextMap;
      });

      if (isAuthenticated) {
        fetch(`${API_BASE_URL}/api/v1/progress/activity`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            action: reason,
            metadata: { durationMinutes: minutes },
          }),
        }).catch(() => {});
      }
    },
    [isAuthenticated]
  );

  // Record problem solved
  const recordProblemSolved = useCallback(
    (problemId?: string, difficulty?: string) => {
      const todayStr = getLocalDateString();
      const addedMinutes = 15;
      const addedSeconds = addedMinutes * 60;

      setLiveSecondsToday((prev) => {
        const next = prev + addedSeconds;
        try {
          localStorage.setItem(`${TODAY_SECONDS_KEY}_${todayStr}`, next.toString());
        } catch {}
        return next;
      });

      setActivityMap((prev) => {
        const existing = prev[todayStr] || {
          date: todayStr,
          activeMinutes: 0,
          activeSeconds: 0,
          problemsSolved: 0,
          lessonsCompleted: 0,
          assignmentsSubmitted: 0,
        };

        const updated: DailyActivityRecord = {
          ...existing,
          activeMinutes: existing.activeMinutes + addedMinutes,
          activeSeconds: (existing.activeSeconds || 0) + addedSeconds,
          problemsSolved: existing.problemsSolved + 1,
          lastActiveTimestamp: Date.now(),
        };

        const nextMap = { ...prev, [todayStr]: updated };
        try {
          localStorage.setItem(REAL_ACTIVITY_STORAGE_KEY, JSON.stringify(nextMap));
          window.dispatchEvent(new CustomEvent("lms:activity-updated"));
        } catch {}
        return nextMap;
      });

      if (isAuthenticated) {
        fetch(`${API_BASE_URL}/api/v1/progress/activity`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            action: "PROBLEM_SOLVED",
            metadata: { problemId, difficulty, durationMinutes: addedMinutes },
          }),
        }).catch(() => {});
      }
    },
    [isAuthenticated]
  );

  // Record lesson completed
  const recordLessonCompleted = useCallback(
    (lessonId?: string, durationSeconds?: number) => {
      const todayStr = getLocalDateString();
      const addedMinutes = durationSeconds ? Math.ceil(durationSeconds / 60) : 20;
      const addedSeconds = durationSeconds || addedMinutes * 60;

      setLiveSecondsToday((prev) => {
        const next = prev + addedSeconds;
        try {
          localStorage.setItem(`${TODAY_SECONDS_KEY}_${todayStr}`, next.toString());
        } catch {}
        return next;
      });

      setActivityMap((prev) => {
        const existing = prev[todayStr] || {
          date: todayStr,
          activeMinutes: 0,
          activeSeconds: 0,
          problemsSolved: 0,
          lessonsCompleted: 0,
          assignmentsSubmitted: 0,
        };

        const updated: DailyActivityRecord = {
          ...existing,
          activeMinutes: existing.activeMinutes + addedMinutes,
          activeSeconds: (existing.activeSeconds || 0) + addedSeconds,
          lessonsCompleted: existing.lessonsCompleted + 1,
          lastActiveTimestamp: Date.now(),
        };

        const nextMap = { ...prev, [todayStr]: updated };
        try {
          localStorage.setItem(REAL_ACTIVITY_STORAGE_KEY, JSON.stringify(nextMap));
          window.dispatchEvent(new CustomEvent("lms:activity-updated"));
        } catch {}
        return nextMap;
      });

      if (isAuthenticated) {
        fetch(`${API_BASE_URL}/api/v1/progress/activity`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            action: "LESSON_COMPLETE",
            metadata: { lessonId, durationMinutes: addedMinutes },
          }),
        }).catch(() => {});
      }
    },
    [isAuthenticated]
  );

  // Calculate completely real Activity Bars for any given timeframe
  const getActivityBars = useCallback(
    (timeframe: string): { bars: ActivityBarItem[]; totalMinutes: number; totalSeconds: number; growthPct: string } => {
      const today = new Date();
      const todayStr = getLocalDateString(today);
      let daysCount = 14;

      if (timeframe === "Last 7 days") daysCount = 7;
      else if (timeframe === "Last 14 days") daysCount = 14;
      else if (timeframe === "Last 30 days") daysCount = 30;
      else if (timeframe === "This quarter") daysCount = 90;

      const rawDays: { dateStr: string; dateObj: Date; record: DailyActivityRecord }[] = [];

      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = getLocalDateString(d);
        const isToday = dateStr === todayStr;

        const storedRec = activityMap[dateStr];
        const record: DailyActivityRecord = storedRec
          ? {
              ...storedRec,
              activeMinutes: isToday ? Math.max(storedRec.activeMinutes, Math.floor(liveSecondsToday / 60)) : storedRec.activeMinutes,
              activeSeconds: isToday ? Math.max(storedRec.activeSeconds || 0, liveSecondsToday) : storedRec.activeSeconds || storedRec.activeMinutes * 60,
            }
          : {
              date: dateStr,
              activeMinutes: isToday ? Math.floor(liveSecondsToday / 60) : 0,
              activeSeconds: isToday ? liveSecondsToday : 0,
              problemsSolved: 0,
              lessonsCompleted: 0,
              assignmentsSubmitted: 0,
            };

        rawDays.push({ dateStr, dateObj: d, record });
      }

      let items: {
        key: string;
        label: string;
        shortLabel: string;
        fullDate: string;
        minutes: number;
        seconds: number;
        isToday: boolean;
        problemsSolved: number;
        lessonsCompleted: number;
        assignmentsSubmitted: number;
      }[] = [];

      if (timeframe === "This quarter") {
        const weeksCount = 12;
        const daysPerWeek = Math.ceil(daysCount / weeksCount);
        for (let w = 0; w < weeksCount; w++) {
          const chunk = rawDays.slice(w * daysPerWeek, (w + 1) * daysPerWeek);
          const totalMins = chunk.reduce((acc, c) => acc + c.record.activeMinutes, 0);
          const totalSecs = chunk.reduce((acc, c) => acc + (c.record.activeSeconds || c.record.activeMinutes * 60), 0);
          const totalProblems = chunk.reduce((acc, c) => acc + c.record.problemsSolved, 0);
          const totalLessons = chunk.reduce((acc, c) => acc + c.record.lessonsCompleted, 0);
          const totalAssignments = chunk.reduce((acc, c) => acc + c.record.assignmentsSubmitted, 0);
          const containsToday = chunk.some((c) => c.dateStr === todayStr);

          items.push({
            key: `W${w + 1}`,
            label: `Week ${w + 1}`,
            shortLabel: `W${w + 1}`,
            fullDate: chunk[0] ? `Week of ${chunk[0].dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : `Week ${w + 1}`,
            minutes: totalMins,
            seconds: totalSecs,
            isToday: containsToday,
            problemsSolved: totalProblems,
            lessonsCompleted: totalLessons,
            assignmentsSubmitted: totalAssignments,
          });
        }
      } else {
        items = rawDays.map((item, idx) => {
          const weekday = item.dateObj.toLocaleDateString("en-US", { weekday: "short" });
          const dayNum = item.dateObj.getDate();
          const monthShort = item.dateObj.toLocaleDateString("en-US", { month: "short" });
          const isToday = item.dateStr === todayStr;

          let label = `${weekday} ${dayNum}`;
          let shortLabel = `${weekday}`;

          if (timeframe === "Last 7 days") {
            label = `${weekday} ${dayNum}`;
            shortLabel = weekday;
          } else if (timeframe === "Last 14 days") {
            label = `${monthShort} ${dayNum}`;
            shortLabel = idx % 2 === 0 ? `${monthShort} ${dayNum}` : "";
          } else if (timeframe === "Last 30 days") {
            label = `${monthShort} ${dayNum}`;
            shortLabel = idx % 4 === 0 ? `${monthShort} ${dayNum}` : "";
          }

          return {
            key: item.dateStr,
            label,
            shortLabel,
            fullDate: item.dateObj.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            minutes: item.record.activeMinutes,
            seconds: item.record.activeSeconds || item.record.activeMinutes * 60,
            isToday,
            problemsSolved: item.record.problemsSolved,
            lessonsCompleted: item.record.lessonsCompleted,
            assignmentsSubmitted: item.record.assignmentsSubmitted,
          };
        });
      }

      const totalMinutes = items.reduce((acc, item) => acc + item.minutes, 0);
      const totalSeconds = items.reduce((acc, item) => acc + item.seconds, 0);
      const maxSeconds = Math.max(...items.map((i) => i.seconds), 60);

      const bars: ActivityBarItem[] = items.map((item) => {
        let heightPercent = 0;
        if (item.seconds > 0) {
          heightPercent = Math.min(100, Math.max(14, Math.round((item.seconds / maxSeconds) * 92 + 8)));
        } else {
          heightPercent = 5;
        }

        return {
          ...item,
          formattedTime: formatMinutes(item.minutes, item.seconds % 60),
          heightPercent,
        };
      });

      // Growth vs preceding calendar period
      let prevTotalMins = 0;
      for (let i = daysCount * 2 - 1; i >= daysCount; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = getLocalDateString(d);
        const rec = activityMap[dateStr];
        if (rec) prevTotalMins += rec.activeMinutes;
      }

      let growthPct = "0%";
      if (prevTotalMins > 0) {
        const diff = Math.round(((totalMinutes - prevTotalMins) / prevTotalMins) * 100);
        growthPct = diff >= 0 ? `+${diff}%` : `${diff}%`;
      } else if (totalMinutes > 0 || totalSeconds > 0) {
        growthPct = "+100%";
      } else {
        growthPct = "0%";
      }

      return { bars, totalMinutes, totalSeconds, growthPct };
    },
    [activityMap, liveSecondsToday]
  );

  // Calculate real active streak and week breakdown
  const getStreakData = useCallback(() => {
    const today = new Date();
    const todayStr = getLocalDateString(today);

    // Only active today if actual tracked seconds > 0 or recorded minutes > 0
    const todayActive = liveSecondsToday > 0 || (activityMap[todayStr]?.activeMinutes || 0) > 0;
    
    let streak = 0;
    let checkDate = new Date(today);

    if (todayActive) {
      streak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getLocalDateString(yesterday);
      if ((activityMap[yesterdayStr]?.activeMinutes || 0) > 0) {
        streak = 1;
        checkDate = yesterday;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    if (streak > 0) {
      while (true) {
        const dateStr = getLocalDateString(checkDate);
        const rec = activityMap[dateStr];
        if (rec && rec.activeMinutes > 0) {
          streak += 1;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Days of current calendar week (Monday to Sunday)
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    const weekDaysLetters = ["M", "T", "W", "T", "F", "S", "S"];
    const weekDaysNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const weekDaysStatus: WeekDayStatus[] = [];

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);
      const dateStr = getLocalDateString(dayDate);
      const isToday = dateStr === todayStr;
      const isFuture = dayDate > today && !isToday;
      const rec = activityMap[dateStr];
      const mins = isToday ? Math.max(rec?.activeMinutes || 0, Math.floor(liveSecondsToday / 60)) : rec?.activeMinutes || 0;
      const isActive = mins > 0 || (isToday && liveSecondsToday > 0);

      weekDaysStatus.push({
        dayLetter: weekDaysLetters[i],
        dayName: weekDaysNames[i],
        date: dateStr,
        isActive,
        isToday,
        isFuture,
        minutes: mins,
      });
    }

    return {
      streak: todayActive ? streak : (streak > 0 ? streak : 0),
      weekDaysStatus,
      isTodayActive: todayActive,
      liveSecondsToday,
    };
  }, [activityMap, liveSecondsToday]);

  return {
    activityMap,
    liveSecondsToday,
    logStudyTime,
    recordProblemSolved,
    recordLessonCompleted,
    getActivityBars,
    getStreakData,
    formatMinutes,
    refreshActivity: fetchBackendActivity,
  };
}
