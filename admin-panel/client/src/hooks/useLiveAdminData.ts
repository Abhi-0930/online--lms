import { useState, useEffect, useRef } from "react";

export interface AdminStats {
  totalStudents: number;
  activeStudents: number;
  paidEnrollments: number;
  coursesCount: number;
  recentActivities: Array<{
    title: string;
    detail: string;
    time: string;
  }>;
}

export interface StudentItem {
  id: string | number;
  name: string;
  email: string;
  role: string;
  education: string;
  course: string;
  progress: number;
  activity: string;
  lastActiveAt?: string;
  status: string;
  avatar: string;
}

export type CourseStatus = "Published" | "Draft" | "Review";

export interface Course {
  id: number | string;
  title: string;
  track: string;
  instructor: string;
  students: number;
  completion: number;
  revenue: string;
  status: CourseStatus;
  color: string;
  initials: string;

  subtitle?: string;
  description?: string;
  language?: string;
  category?: string;
  level?: string;
  coverImageUrl?: string | null;
  thumbnailPreview?: string | null;
  price?: number | string;
  discountPrice?: number | string;
  currency?: string;
  courseType?: "Paid" | "Free";
  accessType?: "Lifetime Access" | "Fixed Duration" | "Subscription";
  durationCycleMode?: "Date Range" | "Relative Duration";
  startDate?: string;
  endDate?: string;
  durationValue?: string;
  durationUnit?: "Days" | "Weeks" | "Months" | "Years";
  subscriptionCycle?: "Monthly" | "Quarterly" | "Yearly";
  enrollmentLimit?: string;
  courseVisibility?: "Public" | "Private" | "Unlisted";
  modules?: any[];
  instructorName?: string;
  skillsCovered?: string[];
  prerequisites?: string;
  estimatedDuration?: string;
  certificateAvailable?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  targetAudience?: string;
  learningOutcomes?: string[];
  requirements?: string[];
  targetLearners?: string[];
  tags?: string[];
}

export interface ContentItem {
  id: string | number;
  title: string;
  type: string;
  parent: string;
  owner: string;
  status: string;
  updated: string;
}

const CACHE_KEYS = {
  STATS: "lms_admin_cache_stats",
  STUDENTS: "lms_admin_cache_students",
  COURSES: "lms_admin_cache_courses",
  ASSIGNMENTS: "lms_admin_cache_assignments",
  SUBMISSIONS: "lms_admin_cache_submissions",
  CONTENT: "lms_admin_cache_content",
};

function readCache<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return fallback;
}

function writeCache<T>(key: string, data: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

export function useLiveAdminData() {
  const [stats, setStats] = useState<AdminStats>(() =>
    readCache<AdminStats>(CACHE_KEYS.STATS, {
      totalStudents: 0,
      activeStudents: 0,
      paidEnrollments: 0,
      coursesCount: 0,
      recentActivities: [],
    })
  );
  const [students, setStudents] = useState<StudentItem[]>(() =>
    readCache<StudentItem[]>(CACHE_KEYS.STUDENTS, [])
  );
  const [coursesList, setCoursesList] = useState<Course[]>(() =>
    readCache<Course[]>(CACHE_KEYS.COURSES, [])
  );
  const [assignmentsList, setAssignmentsList] = useState<any[]>(() =>
    readCache<any[]>(CACHE_KEYS.ASSIGNMENTS, [])
  );
  const [submissionsList, setSubmissionsList] = useState<any[]>(() =>
    readCache<any[]>(CACHE_KEYS.SUBMISSIONS, [])
  );
  const [contentList, setContentList] = useState<ContentItem[]>(() =>
    readCache<ContentItem[]>(CACHE_KEYS.CONTENT, [])
  );
  const [isLoading, setIsLoading] = useState(() => {
    const cached = readCache<Course[]>(CACHE_KEYS.COURSES, []);
    return cached.length === 0;
  });
  const [isWsConnected, setIsWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const updateCourses = (data: Course[]) => {
    setCoursesList(data);
    writeCache(CACHE_KEYS.COURSES, data);
  };

  const updateStats = (data: AdminStats) => {
    setStats(data);
    writeCache(CACHE_KEYS.STATS, data);
  };

  const updateStudents = (data: StudentItem[]) => {
    setStudents(data);
    writeCache(CACHE_KEYS.STUDENTS, data);
  };

  const updateAssignments = (data: any[]) => {
    setAssignmentsList(data);
    writeCache(CACHE_KEYS.ASSIGNMENTS, data);
  };

  const updateSubmissions = (data: any[]) => {
    setSubmissionsList(data);
    writeCache(CACHE_KEYS.SUBMISSIONS, data);
  };

  const updateContent = (data: ContentItem[]) => {
    setContentList(data);
    writeCache(CACHE_KEYS.CONTENT, data);
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/v1/admin/courses");
      if (res.ok) {
        const data = await res.json();
        updateCourses(data);
      }
    } catch {}
  };

  const fetchInitialSnapshot = async () => {
    try {
      fetchCourses();

      fetch("http://localhost:4000/api/v1/admin/stats")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => d && updateStats(d))
        .catch(() => {});

      fetch("http://localhost:4000/api/v1/admin/students")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => d && updateStudents(d))
        .catch(() => {});

      fetch("http://localhost:4000/api/v1/admin/assignments")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => d && updateAssignments(d))
        .catch(() => {});

      fetch("http://localhost:4000/api/v1/admin/submissions")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => d && updateSubmissions(d))
        .catch(() => {});

      fetch("http://localhost:4000/api/v1/admin/content")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => d && updateContent(d))
        .catch(() => {});
    } catch {
      // Backend offline fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialSnapshot();

    let socket: WebSocket | null = null;
    let reconnectTimer: any = null;
    let isMounted = true;

    const connectWebSocket = () => {
      if (!isMounted) return;

      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = window.location.hostname || "localhost";
        const wsUrl = `${protocol}//${host}:4000/api/v1/admin/ws`;

        socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          if (!isMounted) return;
          setIsWsConnected(true);
          socket?.send(JSON.stringify({ type: "REFRESH" }));
        };

        socket.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const payload = JSON.parse(event.data);
            if (payload.type === "INITIAL_DATA" || payload.type === "DATA_UPDATE") {
              if (payload.data?.stats) {
                updateStats(payload.data.stats);
              }
              if (payload.data?.students) {
                updateStudents(payload.data.students);
              }
              if (payload.data?.courses) {
                updateCourses(payload.data.courses);
              }
              if (payload.data?.assignments) {
                updateAssignments(payload.data.assignments);
              }
              if (payload.data?.submissions) {
                updateSubmissions(payload.data.submissions);
              }
              if (payload.data?.content) {
                updateContent(payload.data.content);
              }
              setIsLoading(false);
            }
          } catch {
            // Ignore non-json frames
          }
        };

        socket.onclose = () => {
          if (!isMounted) return;
          setIsWsConnected(false);
          reconnectTimer = setTimeout(connectWebSocket, 4000);
        };

        socket.onerror = () => {
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.close();
          }
        };
      } catch {
        reconnectTimer = setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();

    return () => {
      isMounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (socket) {
        socket.onclose = null;
        socket.close();
      }
    };
  }, []);

  const refresh = () => {
    fetchCourses();
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "REFRESH" }));
    } else {
      fetchInitialSnapshot();
    }
  };

  return {
    stats,
    students,
    courses: coursesList,
    assignments: assignmentsList,
    submissions: submissionsList,
    content: contentList,
    isLoading,
    isWsConnected,
    refresh,
  };
}
