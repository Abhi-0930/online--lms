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

export function useLiveAdminData() {
  const [stats, setStats] = useState<AdminStats>({
    totalStudents: 0,
    activeStudents: 0,
    paidEnrollments: 0,
    coursesCount: 0,
    recentActivities: [],
  });
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [assignmentsList, setAssignmentsList] = useState<any[]>([]);
  const [submissionsList, setSubmissionsList] = useState<any[]>([]);
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchInitialSnapshot = async () => {
    try {
      const [statsRes, studentsRes, coursesRes, assignmentsRes, submissionsRes, contentRes] = await Promise.all([
        fetch("http://localhost:4000/api/v1/admin/stats"),
        fetch("http://localhost:4000/api/v1/admin/students"),
        fetch("http://localhost:4000/api/v1/admin/courses"),
        fetch("http://localhost:4000/api/v1/admin/assignments"),
        fetch("http://localhost:4000/api/v1/admin/submissions"),
        fetch("http://localhost:4000/api/v1/admin/content"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(studentsData);
      }
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCoursesList(coursesData);
      }
      if (assignmentsRes.ok) {
        const assignmentsData = await assignmentsRes.json();
        setAssignmentsList(assignmentsData);
      }
      if (submissionsRes.ok) {
        const submissionsData = await submissionsRes.json();
        setSubmissionsList(submissionsData);
      }
      if (contentRes.ok) {
        const contentData = await contentRes.json();
        setContentList(contentData);
      }
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
                setStats(payload.data.stats);
              }
              if (payload.data?.students) {
                setStudents(payload.data.students);
              }
              if (payload.data?.courses) {
                setCoursesList(payload.data.courses);
              }
              if (payload.data?.assignments) {
                setAssignmentsList(payload.data.assignments);
              }
              if (payload.data?.submissions) {
                setSubmissionsList(payload.data.submissions);
              }
              if (payload.data?.content) {
                setContentList(payload.data.content);
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
