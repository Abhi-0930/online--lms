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
  createdAt?: string;
  updatedAt?: string;
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

export interface PracticeProblem {
  id: string | number;
  slug?: string;
  title: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  acceptance: string;
  submissions: number;
  testCases: number;
  status: "Live" | "Draft";
  description?: string;
  sampleInput?: string;
  sampleOutput?: string;
  constraints?: string;
  hints?: string[];
  starterCode?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

const CACHE_KEYS = {
  STATS: "lms_admin_cache_stats",
  STUDENTS: "lms_admin_cache_students",
  COURSES: "lms_admin_cache_courses",
  ASSIGNMENTS: "lms_admin_cache_assignments",
  SUBMISSIONS: "lms_admin_cache_submissions",
  CONTENT: "lms_admin_cache_content",
  PRACTICE_PROBLEMS: "lms_admin_cache_practice_problems",
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
  const [practiceProblemsList, setPracticeProblemsList] = useState<PracticeProblem[]>(() =>
    readCache<PracticeProblem[]>(CACHE_KEYS.PRACTICE_PROBLEMS, [])
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

  const upsertCourse = (course: any) => {
    if (!course || !course.id) return;
    setCoursesList((prev) => {
      const idx = prev.findIndex((c) => String(c.id) === String(course.id));
      let updated: Course[];
      const priceStr = course.price !== undefined ? String(course.price) : "0";
      const formatted: Course = {
        id: String(course.id),
        title: course.title || "Untitled Course",
        subtitle: course.subtitle || "",
        description: course.description || "",
        language: course.language || "English",
        category: course.category || "Development",
        level: course.level || "Beginner",
        thumbnailPreview: course.thumbnailPreview || course.coverImageUrl || null,
        coverImageUrl: course.coverImageUrl || course.thumbnailPreview || null,
        price: priceStr,
        discountPrice: course.discountPrice !== undefined && course.discountPrice !== null ? String(course.discountPrice) : "",
        currency: course.currency || "INR ₹",
        courseType: course.courseType || (Number(priceStr) > 0 ? "Paid" : "Free"),
        accessType: course.accessType || "Lifetime Access",
        durationCycleMode: course.durationCycleMode || "Date Range",
        startDate: course.startDate || "",
        endDate: course.endDate || "",
        durationValue: course.durationValue || "90",
        durationUnit: course.durationUnit || "Days",
        subscriptionCycle: course.subscriptionCycle || "Monthly",
        enrollmentLimit: course.enrollmentLimit || "Unlimited",
        courseVisibility: course.courseVisibility || "Public",
        modules: course.modules || [],
        track: course.subtitle || course.track || "General track",
        instructor: course.instructor?.fullName || course.instructorName || course.instructor || "Platform Admin",
        instructorName: course.instructor?.fullName || course.instructorName || course.instructor || "Platform Admin",
        students: course.students !== undefined ? course.students : 0,
        completion: course.completion !== undefined ? course.completion : 0,
        revenue: course.revenue || (Number(priceStr) > 0 ? `₹${priceStr}` : "₹0"),
        status:
          course.status === "PUBLISHED" || course.status === "Published"
            ? "Published"
            : course.status === "DRAFT" || course.status === "Draft"
            ? "Draft"
            : "Review",
        skillsCovered: course.skillsCovered || course.tags || [],
        prerequisites: course.prerequisites || "",
        estimatedDuration: course.estimatedDuration || "12 Weeks",
        certificateAvailable: course.certificateAvailable !== undefined ? course.certificateAvailable : true,
        seoTitle: course.seoTitle || "",
        seoDescription: course.seoDescription || "",
        targetAudience: course.targetAudience || "",
        learningOutcomes: course.learningOutcomes || [],
        requirements: course.requirements || [],
        targetLearners: course.targetLearners || [],
        tags: course.tags || course.skillsCovered || [],
        color: course.color || "#dbeafe",
        initials: (course.title || "COU").slice(0, 3).toUpperCase(),
        createdAt: course.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = { ...updated[idx], ...formatted };
      } else {
        updated = [formatted, ...prev];
      }
      writeCache(CACHE_KEYS.COURSES, updated);
      return updated;
    });
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

  const updatePracticeProblems = (data: PracticeProblem[]) => {
    setPracticeProblemsList(data);
    writeCache(CACHE_KEYS.PRACTICE_PROBLEMS, data);
  };

  const upsertPracticeProblem = (prob: any) => {
    if (!prob || !prob.id) return;
    setPracticeProblemsList((prev) => {
      const idx = prev.findIndex((p) => String(p.id) === String(prob.id));
      let updated: PracticeProblem[];
      const formatted: PracticeProblem = {
        id: String(prob.id),
        slug: prob.slug || (prob.title ? prob.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : `prob-${prob.id}`),
        title: prob.title || "Untitled Problem",
        category: prob.category || "Arrays",
        difficulty: prob.difficulty || "Medium",
        acceptance: prob.acceptance || "75.0%",
        submissions: typeof prob.submissions === "number" ? prob.submissions : 0,
        testCases: typeof prob.testCases === "number" ? prob.testCases : 10,
        status: prob.status === "Draft" || prob.status === "DRAFT" ? "Draft" : "Live",
        description: prob.description || "",
        sampleInput: prob.sampleInput || "",
        sampleOutput: prob.sampleOutput || "",
        constraints: prob.constraints || "",
        hints: Array.isArray(prob.hints) ? prob.hints : [],
        starterCode: prob.starterCode || {},
        createdAt: prob.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = { ...updated[idx], ...formatted };
      } else {
        updated = [formatted, ...prev];
      }
      writeCache(CACHE_KEYS.PRACTICE_PROBLEMS, updated);
      return updated;
    });
  };

  const deletePracticeProblem = async (id: string | number) => {
    setPracticeProblemsList((prev) => {
      const updated = prev.filter((p) => String(p.id) !== String(id));
      writeCache(CACHE_KEYS.PRACTICE_PROBLEMS, updated);
      return updated;
    });

    try {
      await fetch(`http://localhost:4000/api/v1/admin/practice-problems/${id}`, {
        method: "DELETE",
      });
    } catch {}
  };

  const toggleProblemStatus = async (id: string | number) => {
    const target = practiceProblemsList.find((p) => String(p.id) === String(id));
    if (!target) return;
    const newStatus = target.status === "Live" ? "Draft" : "Live";
    
    upsertPracticeProblem({ ...target, status: newStatus });

    try {
      await fetch(`http://localhost:4000/api/v1/admin/practice-problems/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {}
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

  const fetchPracticeProblems = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/v1/admin/practice-problems");
      if (res.ok) {
        const data = await res.json();
        updatePracticeProblems(data);
      }
    } catch {}
  };

  const fetchInitialSnapshot = async () => {
    try {
      fetchCourses();
      fetchPracticeProblems();

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
              if (payload.data?.practiceProblems) {
                updatePracticeProblems(payload.data.practiceProblems);
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

  const refresh = async () => {
    await Promise.all([fetchCourses(), fetchPracticeProblems()]);
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
    practiceProblems: practiceProblemsList,
    isLoading,
    isWsConnected,
    refresh,
    upsertCourse,
    setCourses: updateCourses,
    upsertPracticeProblem,
    deletePracticeProblem,
    toggleProblemStatus,
    setPracticeProblems: updatePracticeProblems,
  };
}

