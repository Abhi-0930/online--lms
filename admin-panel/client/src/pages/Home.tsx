import DashboardLayout, { navLabelMap } from "@/components/DashboardLayout";
import AdminProfileDropdown from "@/components/AdminProfileDropdown";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Code2,
  Download,
  Ellipsis,
  FileCheck2,
  FileText,
  Filter,
  GraduationCap,
  LayoutGrid,
  LifeBuoy,
  ListChecks,
  Lock,
  MessageSquareText,
  MoreHorizontal,
  PlayCircle,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Upload,
  Users,
  Video,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";

type CourseStatus = "Published" | "Draft" | "Review";
type Course = { id: number; title: string; track: string; instructor: string; students: number; completion: number; revenue: string; status: CourseStatus; color: string; initials: string };
type DialogState = { title: string; description: string; fields: string[] } | null;

const courses: Course[] = [
  { id: 1, title: "Data Structures & Algorithms", track: "Interview prep · 42 modules", instructor: "Arjun Mehta", students: 1842, completion: 78, revenue: "₹18.6L", status: "Published", color: "#dbeafe", initials: "DSA" },
  { id: 2, title: "System Design: Foundations", track: "Placement track · 18 modules", instructor: "Maya Rao", students: 936, completion: 64, revenue: "₹9.2L", status: "Published", color: "#ede9fe", initials: "SD" },
  { id: 3, title: "Python for Problem Solving", track: "Programming · 26 modules", instructor: "Neel Shah", students: 1284, completion: 71, revenue: "₹12.4L", status: "Review", color: "#dcfce7", initials: "PY" },
  { id: 4, title: "Competitive Programming Sprint", track: "Advanced · 12 modules", instructor: "Kavya Iyer", students: 544, completion: 52, revenue: "₹6.7L", status: "Draft", color: "#ffedd5", initials: "CP" },
];

const learners = [
  { id: 1, name: "Aarav Sharma", email: "aarav.sharma@gmail.com", course: "DSA Mastery", progress: 92, activity: "12 min ago", status: "On track", avatar: "AS" },
  { id: 2, name: "Ishita Kapoor", email: "ishita.kapoor@gmail.com", course: "System Design", progress: 76, activity: "34 min ago", status: "On track", avatar: "IK" },
  { id: 3, name: "Rohan Verma", email: "rohan.verma@gmail.com", course: "Python for Problem Solving", progress: 44, activity: "2 hours ago", status: "Needs help", avatar: "RV" },
  { id: 4, name: "Meera Nair", email: "meera.nair@gmail.com", course: "DSA Mastery", progress: 68, activity: "Yesterday", status: "On track", avatar: "MN" },
  { id: 5, name: "Vivaan Joshi", email: "vivaan.joshi@gmail.com", course: "Competitive Programming", progress: 31, activity: "3 days ago", status: "At risk", avatar: "VJ" },
];

const contentItems = [
  { id: 1, title: "Graphs: BFS vs DFS", type: "Video", parent: "DSA · Graphs", owner: "Arjun Mehta", status: "Published", updated: "Today" },
  { id: 2, title: "Recursion patterns worksheet", type: "PDF", parent: "DSA · Recursion", owner: "Maya Rao", status: "Published", updated: "Yesterday" },
  { id: 3, title: "Binary tree traversal challenge", type: "Practice problem", parent: "DSA · Trees", owner: "Neel Shah", status: "Draft", updated: "2 days ago" },
  { id: 4, title: "Week 4 assignment rubric", type: "Assignment", parent: "Placement Prep", owner: "Kavya Iyer", status: "Review", updated: "3 days ago" },
  { id: 5, title: "Complexity analysis cheatsheet", type: "Text", parent: "Foundations", owner: "Arjun Mehta", status: "Published", updated: "4 days ago" },
];

const assessments = [
  { id: 1, title: "Weekly Test · Graphs", type: "Weekly test", questions: 25, attempts: 642, passRate: "78%", status: "Live", date: "Today, 6:00 PM" },
  { id: 2, title: "Mock Placement Test #04", type: "Mock test", questions: 60, attempts: 318, passRate: "64%", status: "Live", date: "Sep 18, 2026" },
  { id: 3, title: "Module 3 · Recursion", type: "Module test", questions: 18, attempts: 904, passRate: "82%", status: "Closed", date: "Sep 10, 2026" },
  { id: 4, title: "Amazon-style coding screen", type: "Placement test", questions: 12, attempts: 146, passRate: "41%", status: "Draft", date: "Not scheduled" },
];

const sessions = [
  { id: 1, title: "Graphs: BFS vs DFS", course: "DSA Mastery", time: "Today · 6:30 PM", attendees: 86, type: "Live class", status: "Upcoming" },
  { id: 2, title: "Mock interview office hours", course: "Placement Prep", time: "Tomorrow · 11:00 AM", attendees: 24, type: "Office hours", status: "Upcoming" },
  { id: 3, title: "Dynamic programming deep dive", course: "DSA Mastery", time: "Wed · 7:00 PM", attendees: 118, type: "Live class", status: "Upcoming" },
  { id: 4, title: "Trees: Traversals", course: "DSA Mastery", time: "Sep 11 · 7:00 PM", attendees: 104, type: "Recording", status: "Completed" },
];

const payments = [
  { id: "INV-2048", student: "Aarav Sharma", course: "DSA Mastery", amount: "₹18,999", date: "Sep 13, 2026", method: "UPI", status: "Paid" },
  { id: "INV-2047", student: "Ishita Kapoor", course: "System Design", amount: "₹12,499", date: "Sep 13, 2026", method: "Card", status: "Paid" },
  { id: "INV-2046", student: "Rohan Verma", course: "Python for Problem Solving", amount: "₹9,999", date: "Sep 12, 2026", method: "Card", status: "Refund requested" },
  { id: "INV-2045", student: "Meera Nair", course: "DSA Mastery", amount: "₹18,999", date: "Sep 12, 2026", method: "Net banking", status: "Paid" },
];

const feedback = [
  { id: 1, student: "Meera Nair", course: "DSA Mastery", rating: 5, category: "Course quality", text: "The graph visualizations made the topic click for me.", date: "Today", status: "New" },
  { id: 2, student: "Rohan Verma", course: "Python for Problem Solving", rating: 3, category: "Pacing", text: "Would love a slower walkthrough for recursion.", date: "Yesterday", status: "Open" },
  { id: 3, student: "Ishita Kapoor", course: "System Design", rating: 5, category: "Instructor", text: "Maya's architecture breakdowns are excellent.", date: "Sep 10", status: "Responded" },
];

const auditLogs = [
  { action: "Assessment published", entity: "Weekly Test · Graphs", actor: "Ava Patel", time: "12 min ago", tone: "bg-emerald-100 text-emerald-700" },
  { action: "Student added", entity: "Aarav Sharma", actor: "Nisha Singh", time: "34 min ago", tone: "bg-blue-100 text-blue-700" },
  { action: "Payment received", entity: "INV-2048", actor: "System", time: "1 hr ago", tone: "bg-violet-100 text-violet-700" },
  { action: "Lesson updated", entity: "Graphs: BFS vs DFS", actor: "Arjun Mehta", time: "3 hrs ago", tone: "bg-amber-100 text-amber-700" },
  { action: "Announcement posted", entity: "Spring cohort", actor: "Ava Patel", time: "Yesterday", tone: "bg-rose-100 text-rose-700" },
];

const sectionDescriptions: Record<string, string> = {
  courses: "Manage your catalog, instructors, pricing, and completion health.",
  students: "Keep track of learners, cohorts, progress, and engagement signals.",
  content: "Organize modules, lessons, practice problems, and learning resources.",
  assessments: "Build tests, mock interviews, rubrics, and coding evaluations.",
  live: "Coordinate sessions, recordings, attendance, and instructor calendars.",
  payments: "Monitor revenue, invoices, refunds, and payment health.",
  feedback: "Close the loop on learner feedback and instructor quality.",
  reports: "Explore platform performance, retention, completion, and revenue trends.",
  audit: "Review the operational trail across your platform workspace.",
  settings: "Configure branding, notifications, access, certificates, and security.",
};

function useHashRoute() {
  const [section, setSection] = useState(() => window.location.hash.replace("#", "") || "overview");
  useEffect(() => { const update = () => setSection(window.location.hash.replace("#", "") || "overview"); window.addEventListener("hashchange", update); return () => window.removeEventListener("hashchange", update); }, []);
  return section;
}

function StatusBadge({ children }: { children: React.ReactNode }) {
  const value = String(children);
  const tone = value === "Published" || value === "Paid" || value === "Live" || value === "On track" || value === "Responded" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : value === "Draft" || value === "Review" || value === "Open" || value === "Upcoming" || value === "New" || value === "Refund requested" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300";
  return <span className={cn("rounded-md px-2 py-1 text-[10px] font-bold", tone)}>{children}</span>;
}

function SectionHeader({ section, description, actionLabel, onAction, onExport }: { section: string; description: string; actionLabel: string; onAction: () => void; onExport?: () => void }) {
  const label = navLabelMap[section] || (section === "settings" ? "Settings" : section);
  return <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><div className="mb-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--brand)]"><LayoutGrid className="h-3.5 w-3.5" /> Operations / {label}</div><h1 className="font-display text-3xl font-bold tracking-[-0.04em]">{label}</h1><p className="mt-2 max-w-2xl text-[13px] leading-6 text-[var(--muted)]">{description}</p></div><div className="flex items-center gap-2"><button onClick={onExport || (() => undefined)} className="secondary-button"><Download className="h-4 w-4" /> Export</button><button onClick={onAction} className="primary-button"><Plus className="h-4 w-4" /> {actionLabel}</button></div></div>;
}

function MetricStrip({ items }: { items: { label: string; value: string; change: string; tone?: string }[] }) {
  return <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{items.map((item) => <div className="surface-card p-5" key={item.label}><div className="flex items-center justify-between"><p className="text-[11px] font-semibold text-[var(--muted)]">{item.label}</p><TrendingUp className="h-4 w-4 text-emerald-500" /></div><p className="mt-2 font-display text-2xl font-bold">{item.value}</p><p className={cn("mt-2 text-[10px] font-bold", item.tone || "text-emerald-600")}>{item.change}</p></div>)}</div>;
}

function SearchToolbar({ query, setQuery, filter, setFilter, filters }: { query: string; setQuery: (value: string) => void; filter: string; setFilter: (value: string) => void; filters: string[] }) {
  return <div className="flex flex-col gap-2 border-b border-[var(--app-line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div className="relative w-full sm:max-w-xs"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search records" className="input pl-9" /></div><div className="flex items-center gap-2"><Filter className="h-3.5 w-3.5 text-[var(--muted)]" /><select value={filter} onChange={(event) => setFilter(event.target.value)} className="input w-auto min-w-[130px]">{filters.map((item) => <option key={item}>{item}</option>)}</select></div></div>;
}

function DataCard({ children, title, subtitle, toolbar }: { children: React.ReactNode; title: string; subtitle?: string; toolbar?: React.ReactNode }) {
  return <div className="surface-card mt-4 overflow-hidden"><div className="flex flex-col gap-3 border-b border-[var(--app-line)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><h2 className="font-display text-lg font-bold">{title}</h2>{subtitle && <p className="mt-1 text-[11px] text-[var(--muted)]">{subtitle}</p>}</div>{toolbar}</div>{children}</div>;
}

function Dialog({ state, onClose, onSave }: { state: DialogState; onClose: () => void; onSave: (message: string) => void }) {
  const [values, setValues] = useState<Record<string, string>>({});
  if (!state) return null;
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}><form onSubmit={(event) => { event.preventDefault(); onSave(`${state.title} saved successfully`); }} className="w-full max-w-md rounded-2xl border border-white/70 bg-[var(--app-card)] p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Workspace action</p><h2 className="mt-2 font-display text-xl font-bold">{state.title}</h2><p className="mt-1 text-xs leading-5 text-[var(--muted)]">{state.description}</p></div><button type="button" className="icon-button" onClick={onClose}><X className="h-4 w-4" /></button></div><div className="mt-6 space-y-4">{state.fields.map((field) => <label key={field} className="block text-[11px] font-bold">{field}<input required value={values[field] || ""} onChange={(event) => setValues((current) => ({ ...current, [field]: event.target.value }))} placeholder={`Enter ${field.toLowerCase()}`} className="input mt-2" /></label>)}</div><div className="mt-6 flex justify-end gap-2"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button"><Check className="h-4 w-4" /> Save</button></div></form></div>;
}

function RevenueChart() {
  const points = "0,122 50,105 100,114 150,84 200,92 250,64 300,73 350,43 400,54 450,28 500,34 550,10";
  return <div className="surface-card p-5 sm:p-6"><div className="flex items-start justify-between"><div><p className="text-[12px] font-semibold text-[var(--muted)]">Revenue overview</p><div className="mt-1 flex items-baseline gap-2"><span className="font-display text-2xl font-bold">₹46.8L</span><span className="text-[11px] font-bold text-emerald-600"><ArrowUpRight className="inline h-3.5 w-3.5" /> 18.4%</span></div></div><select className="input w-auto"><option>12 months</option><option>30 days</option></select></div><div className="mt-6 h-[190px]"><svg viewBox="0 0 560 155" className="h-full w-full" preserveAspectRatio="none"><defs><linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" /><stop offset="100%" stopColor="#6366f1" stopOpacity="0" /></linearGradient></defs><g className="chart-grid"><line x1="0" x2="560" y1="12" y2="12" /><line x1="0" x2="560" y1="48" y2="48" /><line x1="0" x2="560" y1="84" y2="84" /><line x1="0" x2="560" y1="120" y2="120" /></g><polyline points={`${points} 550,145 0,145`} fill="url(#revenue-fill)" /><polyline points={points} fill="none" stroke="#6366f1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" vectorEffect="non-scaling-stroke" /><circle cx="550" cy="10" r="4.5" fill="#fff" stroke="#6366f1" strokeWidth="3" /></svg></div><div className="flex justify-between text-[10px] font-semibold text-[var(--muted)]"><span>Oct</span><span>Dec</span><span>Feb</span><span>Apr</span><span>Jun</span><span>Sep</span></div></div>;
}

interface AdminStats {
  totalStudents: number;
  activeStudents: number;
  paidEnrollments: number;
  coursesCount: number;
  recentActivities: Array<{ title: string; detail: string; time: string }>;
}

interface StudentItem {
  id: string | number;
  name: string;
  email: string;
  role: string;
  education: string;
  course: string;
  progress: number;
  activity: string;
  status: string;
  avatar: string;
}

function useLiveAdminData() {
  const [stats, setStats] = useState<AdminStats>({
    totalStudents: 0,
    activeStudents: 0,
    paidEnrollments: 0,
    coursesCount: 4,
    recentActivities: [],
  });
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchInitialSnapshot = async () => {
    try {
      const [statsRes, studentsRes] = await Promise.all([
        fetch("http://localhost:4000/api/v1/admin/stats"),
        fetch("http://localhost:4000/api/v1/admin/students"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(studentsData);
      }
    } catch {
      // Backend offline fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Immediate initial snapshot load
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
          // Request snapshot confirmation
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
              setIsLoading(false);
            }
          } catch {
            // Ignore non-json frames
          }
        };

        socket.onclose = () => {
          if (!isMounted) return;
          setIsWsConnected(false);
          // Exponential / 4s reconnect backoff without polling HTTP
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

  return { stats, students, isLoading, isWsConnected, refresh };
}

function Overview({ onAction, onToast }: { onAction: (state: DialogState) => void; onToast: (message: string) => void }) {
  const { adminUser } = useAdminAuth();
  const { stats, isWsConnected } = useLiveAdminData();
  const displayName = adminUser?.name || "Abhishek";
  const [query, setQuery] = useState("");
  const filtered = courses.filter((course) => `${course.title} ${course.instructor}`.toLowerCase().includes(query.toLowerCase()));

  const studentCount = stats.totalStudents;
  // Active students set to same number as total students per user request
  const activeStudentCount = stats.activeStudents;

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9">
      <div className="mb-7 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-300">
            <span className={`h-1.5 w-1.5 rounded-full ${isWsConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
            {isWsConnected ? "Live WebSocket Connected" : "Connecting Live Stream"} · Sunday, September 13, 2026
          </div>
          <h1 className="font-display text-3xl font-bold tracking-[-0.04em] sm:text-[36px]">
            Good morning, {displayName}<span className="text-[var(--brand)]">.</span>
          </h1>
          <p className="mt-2 max-w-xl text-[13px] leading-6 text-[var(--muted)]">
            Here’s the pulse of your learning platform. Real user activity and registrations synced from your backend.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onToast("Report export queued")} className="secondary-button">
            <Download className="h-4 w-4" /> Export report
          </button>
          <button onClick={() => onAction({ title: "Create a new course", description: "Start with the course basics and add the curriculum in the builder.", fields: ["Course title", "Instructor"] })} className="primary-button">
            <Plus className="h-4 w-4" /> Create new
          </button>
        </div>
      </div>

      <MetricStrip
        items={[
          { label: "Total students", value: studentCount.toLocaleString(), change: studentCount > 0 ? `↗ ${studentCount} registered` : "0 registered users" },
          { label: "Active students", value: activeStudentCount.toLocaleString(), change: activeStudentCount > 0 ? `↗ ${activeStudentCount} active` : "0 active learners" },
          { label: "Paid enrollments", value: stats.paidEnrollments.toLocaleString(), change: stats.paidEnrollments > 0 ? `↗ ${stats.paidEnrollments} paid` : "0 enrollments" },
          { label: "Practice problems solved", value: "0", change: "Tracking enabled", tone: "text-slate-500" },
        ]}
      />

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.75fr)]">
        <RevenueChart />
        <div className="surface-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] font-semibold text-[var(--muted)]">Live activity</p>
              <h3 className="mt-1 font-display text-lg font-bold">What’s happening</h3>
            </div>
            <Bell className="h-4 w-4 text-[var(--muted)]" />
          </div>
          <div className="mt-5 space-y-4">
            {stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((act) => (
                <div className="flex items-start gap-3" key={`${act.title}-${act.time}`}>
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold truncate">{act.title}</p>
                    <p className="text-[11px] text-[var(--muted)] truncate">{act.detail}</p>
                  </div>
                  <span className="text-[10px] text-[var(--muted)] shrink-0">{act.time}</span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-[var(--muted)]">
                <Users className="h-6 w-6 mx-auto mb-2 opacity-40 text-[var(--brand)]" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">No recent activity yet</p>
                <p className="mt-1 text-[11px]">Real platform events will appear here as students register.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.65fr)]">
        <DataCard title="Top performing courses" subtitle="Live catalog health and completion signals" toolbar={<div className="relative w-full sm:w-64"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)]" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="input pl-9" placeholder="Search courses" /></div>}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-[var(--app-line)] text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                  <th className="px-5 py-3 sm:px-6">Course</th>
                  <th className="px-4 py-3">Students</th>
                  <th className="px-4 py-3">Completion</th>
                  <th className="px-4 py-3">Revenue</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((course) => (
                  <tr key={course.id} className="border-b border-[var(--app-line)] last:border-0 hover:bg-[var(--subtle-bg)]">
                    <td className="px-5 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-xl text-[10px] font-extrabold text-slate-700" style={{ backgroundColor: course.color }}>{course.initials}</div>
                        <div>
                          <p className="text-[12px] font-bold">{course.title}</p>
                          <p className="text-[10px] text-[var(--muted)]">{course.track} · {course.instructor}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[12px] font-semibold">{course.students.toLocaleString()}</td>
                    <td className="px-4 py-4 text-[11px] font-bold">{course.completion}%</td>
                    <td className="px-4 py-4 text-[12px] font-bold">{course.revenue}</td>
                    <td className="px-4 py-4"><StatusBadge>{course.status}</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataCard>

        <DataCard title="Attention needed" subtitle="Items that need a decision today">
          <div className="space-y-2 p-5 sm:p-6">
            {[
              { title: "Review curriculum drafts", detail: "Content team queue", icon: BookOpen },
              { title: "Instructor session sync", detail: "Live calendar updates", icon: Video },
              { title: "Payment gateways health", detail: "Razorpay connected", icon: CircleDollarSign },
            ].map(({ title, detail, icon: Icon }) => (
              <button onClick={() => onToast(`${title} opened`)} className="flex w-full items-center gap-3 rounded-xl border border-[var(--app-line)] p-3 text-left hover:bg-[var(--subtle-bg)]" key={title}>
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex-1">
                  <span className="block text-[11px] font-bold">{title}</span>
                  <span className="block text-[10px] text-[var(--muted)]">{detail}</span>
                </span>
                <ChevronRight className="h-4 w-4 text-[var(--muted)]" />
              </button>
            ))}
          </div>
        </DataCard>
      </div>
    </div>
  );
}

function CoursesView({ onAction, onToast }: { onAction: (state: DialogState) => void; onToast: (message: string) => void }) {
  const [query, setQuery] = useState(""); const [filter, setFilter] = useState("All"); const [rows, setRows] = useState(courses);
  const filtered = rows.filter((course) => (filter === "All" || course.status === filter) && `${course.title} ${course.instructor}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9"><SectionHeader section="courses" description={sectionDescriptions.courses} actionLabel="Create course" onAction={() => onAction({ title: "Create a new course", description: "Create the course shell, then continue to the curriculum builder.", fields: ["Course title", "Instructor", "Price"] })} onExport={() => onToast("Course catalog exported") } /><MetricStrip items={[{ label: "Published courses", value: "18", change: "+3 this quarter" }, { label: "In review", value: "8", change: "Needs content review", tone: "text-amber-600" }, { label: "Avg. completion", value: "71.4%", change: "+5.2% vs last month" }, { label: "Catalog revenue", value: "₹46.8L", change: "+18.4% vs last month" }]} /><DataCard title="Course catalog" subtitle={`${filtered.length} of ${rows.length} courses shown`} toolbar={<SearchToolbar query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} filters={["All", "Published", "Review", "Draft"]} />}><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left"><thead><tr className="border-b border-[var(--app-line)] text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]"><th className="px-5 py-3 sm:px-6">Course</th><th className="px-4 py-3">Instructor</th><th className="px-4 py-3">Students</th><th className="px-4 py-3">Completion</th><th className="px-4 py-3">Revenue</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr></thead><tbody>{filtered.map((course) => <tr key={course.id} className="border-b border-[var(--app-line)] last:border-0 hover:bg-[var(--subtle-bg)]"><td className="px-5 py-4 sm:px-6"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl text-[10px] font-extrabold text-slate-700" style={{ backgroundColor: course.color }}>{course.initials}</div><div><p className="text-[12px] font-bold">{course.title}</p><p className="text-[10px] text-[var(--muted)]">{course.track}</p></div></div></td><td className="px-4 py-4 text-[11px] font-semibold">{course.instructor}</td><td className="px-4 py-4 text-[12px] font-bold">{course.students.toLocaleString()}</td><td className="px-4 py-4"><div className="flex items-center gap-2"><div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${course.completion}%` }} /></div><span className="text-[11px] font-bold">{course.completion}%</span></div></td><td className="px-4 py-4 text-[12px] font-bold">{course.revenue}</td><td className="px-4 py-4"><StatusBadge>{course.status}</StatusBadge></td><td className="px-4 py-4"><button onClick={() => setRows((current) => current.map((item) => item.id === course.id ? { ...item, status: item.status === "Published" ? "Draft" : "Published" } : item))} className="icon-button" title="Toggle publish status"><Ellipsis className="h-4 w-4" /></button></td></tr>)}</tbody></table>{filtered.length === 0 && <p className="p-10 text-center text-xs text-[var(--muted)]">No courses match your filters.</p>}</div></DataCard></div>;
}

function StudentsView({ onAction, onToast }: { onAction: (state: DialogState) => void; onToast: (message: string) => void }) {
  const { students, stats, isLoading } = useLiveAdminData();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = students.filter((learner) => {
    const matchesFilter = filter === "All" || learner.status === filter;
    const matchesSearch = `${learner.name} ${learner.email} ${learner.course} ${learner.education}`.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalLearners = stats.totalStudents;
  const activeLearners = stats.activeStudents;

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9">
      <SectionHeader
        section="students"
        description={sectionDescriptions.students}
        actionLabel="Add student"
        onAction={() => onAction({ title: "Add a student", description: "Invite a learner into a course or cohort.", fields: ["Full name", "Email", "Course"] })}
        onExport={() => onToast("Learner directory exported")}
      />

      <MetricStrip
        items={[
          { label: "Total learners", value: totalLearners.toLocaleString(), change: totalLearners > 0 ? `↗ ${totalLearners} registered` : "0 registered users" },
          { label: "Active now", value: activeLearners.toLocaleString(), change: activeLearners > 0 ? `↗ ${activeLearners} active` : "0 active" },
          { label: "Enrolled courses", value: stats.paidEnrollments.toString(), change: "Tracked live" },
          { label: "Avg. progress", value: students.length > 0 ? `${Math.round(students.reduce((a, b) => a + b.progress, 0) / students.length)}%` : "0%", change: "Based on onboarding" },
        ]}
      />

      <DataCard
        title="Learner directory"
        subtitle={students.length > 0 ? `${filtered.length} of ${students.length} learners registered` : "0 learners currently registered"}
        toolbar={<SearchToolbar query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} filters={["All", "On track", "In progress"]} />}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left">
            <thead>
              <tr className="border-b border-[var(--app-line)] text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                <th className="px-5 py-3 sm:px-6">Learner</th>
                <th className="px-4 py-3">Role / Education</th>
                <th className="px-4 py-3">Course / Track</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">Last active</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((learner) => (
                <tr key={learner.id} className="border-b border-[var(--app-line)] last:border-0 hover:bg-[var(--subtle-bg)]">
                  <td className="px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-100 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                        {learner.avatar}
                      </span>
                      <div>
                        <p className="text-[12px] font-bold">{learner.name}</p>
                        <p className="text-[10px] text-[var(--muted)]">{learner.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-[11px]">
                      {learner.education}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[11px] font-semibold">{learner.course}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${learner.progress}%` }} />
                      </div>
                      <span className="text-[11px] font-bold">{learner.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[11px] text-[var(--muted)]">{learner.activity}</td>
                  <td className="px-4 py-4">
                    <StatusBadge>{learner.status}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-xs text-[var(--muted)]">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-30 text-[var(--brand)]" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No registered learners found</p>
              <p className="mt-1 text-[11px]">When users sign up on the platform, their profiles and education status will appear here live.</p>
            </div>
          )}
        </div>
      </DataCard>
    </div>
  );
}

function ContentView({ onAction, onToast }: { onAction: (state: DialogState) => void; onToast: (message: string) => void }) {
  const [query, setQuery] = useState(""); const [filter, setFilter] = useState("All"); const [rows, setRows] = useState(contentItems);
  const filtered = rows.filter((item) => (filter === "All" || item.type === filter) && `${item.title} ${item.parent} ${item.owner}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9"><SectionHeader section="content" description={sectionDescriptions.content} actionLabel="Add content" onAction={() => onAction({ title: "Add learning content", description: "Create a resource and attach it to the right place in the learning path.", fields: ["Content title", "Content type", "Attach to"] })} onExport={() => onToast("Content inventory exported") } /><MetricStrip items={[{ label: "Published resources", value: "428", change: "+24 this month" }, { label: "Practice problems", value: "1,284", change: "+86 this month" }, { label: "Drafts", value: "36", change: "12 need review", tone: "text-amber-600" }, { label: "Storage used", value: "68%", change: "2.4 TB available" }]} /><DataCard title="Content library" subtitle="Modules, lessons, videos, files, and practice resources" toolbar={<SearchToolbar query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} filters={["All", "Video", "PDF", "Assignment", "Practice problem", "Text"]} />}><div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left"><thead><tr className="border-b border-[var(--app-line)] text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]"><th className="px-5 py-3 sm:px-6">Content</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">Owner</th><th className="px-4 py-3">Updated</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr></thead><tbody>{filtered.map((item) => <tr key={item.id} className="border-b border-[var(--app-line)] last:border-0 hover:bg-[var(--subtle-bg)]"><td className="px-5 py-4 sm:px-6"><div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">{item.type === "Video" ? <PlayCircle className="h-4 w-4" /> : item.type === "Practice problem" ? <Code2 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}</span><p className="text-[12px] font-bold">{item.title}</p></div></td><td className="px-4 py-4 text-[11px] font-semibold">{item.type}</td><td className="px-4 py-4 text-[11px] text-[var(--muted)]">{item.parent}</td><td className="px-4 py-4 text-[11px] font-semibold">{item.owner}</td><td className="px-4 py-4 text-[11px] text-[var(--muted)]">{item.updated}</td><td className="px-4 py-4"><StatusBadge>{item.status}</StatusBadge></td><td className="px-4 py-4"><button onClick={() => setRows((current) => current.map((row) => row.id === item.id ? { ...row, status: row.status === "Published" ? "Draft" : "Published" } : row))} className="icon-button"><MoreHorizontal className="h-4 w-4" /></button></td></tr>)}</tbody></table></div></DataCard></div>;
}

function AssessmentsView({ onAction, onToast }: { onAction: (state: DialogState) => void; onToast: (message: string) => void }) {
  const [filter, setFilter] = useState("All"); const [rows, setRows] = useState(assessments); const filtered = rows.filter((item) => filter === "All" || item.status === filter);
  return <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9"><SectionHeader section="assessments" description={sectionDescriptions.assessments} actionLabel="Create assessment" onAction={() => onAction({ title: "Create an assessment", description: "Choose questions, scoring, timing, and visibility controls.", fields: ["Assessment title", "Assessment type", "Duration"] })} onExport={() => onToast("Assessment report exported") } /><MetricStrip items={[{ label: "Live assessments", value: "18", change: "+3 this week" }, { label: "Avg. pass rate", value: "74.8%", change: "+6.1%" }, { label: "Total attempts", value: "8,420", change: "+14.8%" }, { label: "Pending reviews", value: "128", change: "Due today", tone: "text-amber-600" }]} /><DataCard title="Assessment center" subtitle="Tests, mock exams, coding screens, and question banks" toolbar={<div className="flex items-center gap-2"><Filter className="h-3.5 w-3.5 text-[var(--muted)]" /><select className="input w-auto" value={filter} onChange={(event) => setFilter(event.target.value)}><option>All</option><option>Live</option><option>Closed</option><option>Draft</option></select></div>}><div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left"><thead><tr className="border-b border-[var(--app-line)] text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]"><th className="px-5 py-3 sm:px-6">Assessment</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Questions</th><th className="px-4 py-3">Attempts</th><th className="px-4 py-3">Pass rate</th><th className="px-4 py-3">Schedule</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr></thead><tbody>{filtered.map((item) => <tr key={item.id} className="border-b border-[var(--app-line)] last:border-0 hover:bg-[var(--subtle-bg)]"><td className="px-5 py-4 sm:px-6"><p className="text-[12px] font-bold">{item.title}</p><p className="text-[10px] text-[var(--muted)]">Question bank · MCQ + coding</p></td><td className="px-4 py-4 text-[11px] font-semibold">{item.type}</td><td className="px-4 py-4 text-[12px] font-bold">{item.questions}</td><td className="px-4 py-4 text-[12px] font-bold">{item.attempts}</td><td className="px-4 py-4 text-[12px] font-bold">{item.passRate}</td><td className="px-4 py-4 text-[11px] text-[var(--muted)]">{item.date}</td><td className="px-4 py-4"><StatusBadge>{item.status}</StatusBadge></td><td className="px-4 py-4"><button onClick={() => setRows((current) => current.map((row) => row.id === item.id ? { ...row, status: row.status === "Live" ? "Closed" : "Live" } : row))} className="text-[10px] font-bold text-[var(--brand)]">{item.status === "Live" ? "Close" : "Publish"}</button></td></tr>)}</tbody></table></div></DataCard></div>;
}

function LiveView({ onAction, onToast }: { onAction: (state: DialogState) => void; onToast: (message: string) => void }) {
  const [filter, setFilter] = useState("All"); const [rows, setRows] = useState(sessions); const filtered = rows.filter((item) => filter === "All" || item.status === filter);
  return <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9"><SectionHeader section="live" description={sectionDescriptions.live} actionLabel="Schedule session" onAction={() => onAction({ title: "Schedule a live session", description: "Set the instructor, timing, meeting link, and attendance rules.", fields: ["Session title", "Date and time", "Instructor", "Meeting link"] })} onExport={() => onToast("Session calendar exported") } /><MetricStrip items={[{ label: "Upcoming sessions", value: "18", change: "+5 this week" }, { label: "Registered learners", value: "1,248", change: "+18.4%" }, { label: "Avg. attendance", value: "86%", change: "+3.2%" }, { label: "Recordings pending", value: "4", change: "Upload after class", tone: "text-amber-600" }]} /><DataCard title="Session calendar" subtitle="Live classes, office hours, and recorded sessions" toolbar={<div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[var(--muted)]" /><select value={filter} onChange={(event) => setFilter(event.target.value)} className="input w-auto"><option>All</option><option>Upcoming</option><option>Completed</option></select></div>}><div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((session) => <div className="rounded-2xl border border-[var(--app-line)] p-4" key={session.id}><div className="flex items-start justify-between"><span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300"><Video className="h-4 w-4" /></span><StatusBadge>{session.status}</StatusBadge></div><h3 className="mt-4 text-[13px] font-bold">{session.title}</h3><p className="mt-1 text-[11px] text-[var(--muted)]">{session.course}</p><div className="mt-4 flex items-center justify-between text-[10px] font-semibold"><span className="inline-flex items-center gap-1.5 text-[var(--muted)]"><Clock3 className="h-3.5 w-3.5" />{session.time}</span><span>{session.attendees} registered</span></div><div className="mt-4 flex gap-2"><button onClick={() => onToast(`${session.title} opened`)} className="secondary-button flex-1 justify-center">Open</button><button onClick={() => setRows((current) => current.map((row) => row.id === session.id ? { ...row, status: row.status === "Upcoming" ? "Completed" : "Upcoming" } : row))} className="primary-button flex-1 justify-center">{session.status === "Upcoming" ? "Complete" : "Reopen"}</button></div></div>)}</div></DataCard></div>;
}

function PaymentsView({ onAction, onToast }: { onAction: (state: DialogState) => void; onToast: (message: string) => void }) {
  const [query, setQuery] = useState(""); const [filter, setFilter] = useState("All"); const [rows, setRows] = useState(payments); const filtered = rows.filter((item) => (filter === "All" || item.status === filter) && `${item.id} ${item.student} ${item.course}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9"><SectionHeader section="payments" description={sectionDescriptions.payments} actionLabel="Generate invoice" onAction={() => onAction({ title: "Generate an invoice", description: "Create and send a new invoice to a learner.", fields: ["Student", "Course", "Amount"] })} onExport={() => onToast("Transactions exported") } /><MetricStrip items={[{ label: "This month", value: "₹8.4L", change: "+22.6% vs last month" }, { label: "Total revenue", value: "₹46.8L", change: "+18.4%" }, { label: "Pending payouts", value: "₹1.2L", change: "14 items", tone: "text-amber-600" }, { label: "Refund requests", value: "3", change: "Needs review", tone: "text-rose-600" }]} /><DataCard title="Transactions" subtitle="Invoices, payment methods, and refund workflow" toolbar={<SearchToolbar query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} filters={["All", "Paid", "Refund requested"]} />}><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left"><thead><tr className="border-b border-[var(--app-line)] text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]"><th className="px-5 py-3 sm:px-6">Invoice</th><th className="px-4 py-3">Student</th><th className="px-4 py-3">Course</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr></thead><tbody>{filtered.map((item) => <tr key={item.id} className="border-b border-[var(--app-line)] last:border-0 hover:bg-[var(--subtle-bg)]"><td className="px-5 py-4 text-[11px] font-bold sm:px-6">{item.id}</td><td className="px-4 py-4 text-[11px] font-semibold">{item.student}</td><td className="px-4 py-4 text-[11px] text-[var(--muted)]">{item.course}</td><td className="px-4 py-4 text-[12px] font-bold">{item.amount}</td><td className="px-4 py-4 text-[11px] text-[var(--muted)]">{item.date}</td><td className="px-4 py-4 text-[11px]">{item.method}</td><td className="px-4 py-4"><StatusBadge>{item.status}</StatusBadge></td><td className="px-4 py-4"><button onClick={() => setRows((current) => current.map((row) => row.id === item.id ? { ...row, status: row.status === "Paid" ? "Refund requested" : "Paid" } : row))} className="text-[10px] font-bold text-[var(--brand)]">{item.status === "Paid" ? "Refund" : "Approve"}</button></td></tr>)}</tbody></table></div></DataCard></div>;
}

function FeedbackView({ onAction, onToast }: { onAction: (state: DialogState) => void; onToast: (message: string) => void }) {
  const [rows, setRows] = useState(feedback); const [filter, setFilter] = useState("All"); const filtered = rows.filter((item) => filter === "All" || item.status === filter);
  return <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9"><SectionHeader section="feedback" description={sectionDescriptions.feedback} actionLabel="Review queue" onAction={() => onToast("Showing feedback that needs a response")} onExport={() => onToast("Feedback report exported") } /><MetricStrip items={[{ label: "Average rating", value: "4.8 / 5", change: "+0.3 this month" }, { label: "New feedback", value: "18", change: "Needs response", tone: "text-amber-600" }, { label: "Response rate", value: "92%", change: "+4.1%" }, { label: "Flagged items", value: "3", change: "Needs moderation", tone: "text-rose-600" }]} /><DataCard title="Feedback inbox" subtitle="Respond to learners and track instructor quality" toolbar={<div className="flex items-center gap-2"><MessageSquareText className="h-4 w-4 text-[var(--muted)]" /><select value={filter} onChange={(event) => setFilter(event.target.value)} className="input w-auto"><option>All</option><option>New</option><option>Open</option><option>Responded</option></select></div>}><div className="divide-y divide-[var(--app-line)]">{filtered.map((item) => <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:px-6" key={item.id}><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300"><Star className="h-4 w-4 fill-current" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-[12px] font-bold">{item.student}</p><span className="text-[10px] text-[var(--muted)]">· {item.course}</span><span className="text-[10px] font-bold text-amber-600">{item.rating}.0</span></div><p className="mt-2 text-[12px] leading-5">{item.text}</p><p className="mt-2 text-[10px] text-[var(--muted)]">{item.category} · {item.date}</p></div><div className="flex items-center gap-2"><StatusBadge>{item.status}</StatusBadge><button onClick={() => setRows((current) => current.map((row) => row.id === item.id ? { ...row, status: row.status === "Responded" ? "Open" : "Responded" } : row))} className="secondary-button">{item.status === "Responded" ? "Reopen" : "Respond"}</button></div></div>)}</div></DataCard></div>;
}

function ReportsView({ onToast }: { onToast: (message: string) => void }) {
  return <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9"><SectionHeader section="reports" description={sectionDescriptions.reports} actionLabel="Build report" onAction={() => onToast("Report builder opened")} onExport={() => onToast("Analytics exported as CSV")} /><MetricStrip items={[{ label: "Engagement rate", value: "71.8%", change: "+8.4%" }, { label: "Course completion", value: "68.2%", change: "+5.2%" }, { label: "Learner retention", value: "84.6%", change: "+2.1%" }, { label: "Placement rate", value: "76.4%", change: "+11.8%" }]} /><div className="mt-4 grid gap-4 lg:grid-cols-2"><div className="surface-card p-5 sm:p-6"><div className="flex items-start justify-between"><div><p className="text-[12px] font-semibold text-[var(--muted)]">Learning engagement</p><h2 className="mt-1 font-display text-lg font-bold">Weekly active learners</h2></div><select className="input w-auto"><option>Last 30 days</option><option>Last 90 days</option></select></div><div className="mt-7 h-56 flex items-end gap-2">{[46, 61, 52, 74, 68, 86, 78, 91, 72, 84, 88, 95].map((height, index) => <div key={index} className="group flex flex-1 flex-col justify-end gap-2"><div className="w-full rounded-t-lg bg-indigo-200 transition-all group-hover:bg-indigo-500 dark:bg-indigo-900/60" style={{ height: `${height}%` }} /><span className="text-center text-[9px] text-[var(--muted)]">W{index + 1}</span></div>)}</div></div><div className="surface-card p-5 sm:p-6"><div className="flex items-start justify-between"><div><p className="text-[12px] font-semibold text-[var(--muted)]">Course completion</p><h2 className="mt-1 font-display text-lg font-bold">Where learners drop off</h2></div><BarChart3 className="h-5 w-5 text-[var(--brand)]" /></div><div className="mt-6 space-y-5">{[{ label: "DSA Mastery", value: 78, color: "bg-indigo-500" }, { label: "System Design", value: 64, color: "bg-violet-500" }, { label: "Python for Problem Solving", value: 71, color: "bg-emerald-500" }, { label: "Competitive Programming", value: 52, color: "bg-amber-500" }].map((item) => <div key={item.label}><div className="flex justify-between text-[11px] font-bold"><span>{item.label}</span><span>{item.value}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"><div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.value}%` }} /></div></div>)}</div></div></div><DataCard title="Saved reports" subtitle="Reusable exports for your leadership and instructor teams" toolbar={<button onClick={() => onToast("New report template created")} className="secondary-button"><Plus className="h-4 w-4" /> Add template</button>}><div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6">{["Monthly executive pulse", "Placement readiness", "Instructor performance"].map((report) => <button onClick={() => onToast(`${report} generated`)} className="rounded-xl border border-[var(--app-line)] p-4 text-left hover:bg-[var(--subtle-bg)]" key={report}><BarChart3 className="h-4 w-4 text-[var(--brand)]" /><p className="mt-4 text-[12px] font-bold">{report}</p><p className="mt-1 text-[10px] text-[var(--muted)]">Run report · CSV / PDF</p></button>)}</div></DataCard></div>;
}

function AuditView({ onToast }: { onToast: (message: string) => void }) {
  const [query, setQuery] = useState(""); const filtered = auditLogs.filter((item) => `${item.action} ${item.entity} ${item.actor}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9"><SectionHeader section="audit" description={sectionDescriptions.audit} actionLabel="Export logs" onAction={() => onToast("Audit logs exported")} /><MetricStrip items={[{ label: "Events today", value: "1,284", change: "+14.2%" }, { label: "Admin actions", value: "326", change: "Across 8 admins" }, { label: "System events", value: "958", change: "All services" }, { label: "Security alerts", value: "0", change: "No action needed" }]} /><DataCard title="Audit trail" subtitle="Every important platform action, with actor and entity context" toolbar={<div className="relative w-full sm:w-72"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)]" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="input pl-9" placeholder="Search audit events" /></div>}><div className="divide-y divide-[var(--app-line)]">{filtered.map((item) => <div className="flex items-center gap-4 p-5 sm:px-6" key={`${item.action}-${item.entity}`}><div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", item.tone)}><ShieldCheck className="h-4 w-4" /></div><div className="flex-1"><p className="text-[12px] font-bold">{item.action}</p><p className="mt-1 text-[11px] text-[var(--muted)]">{item.entity} · by {item.actor}</p></div><span className="text-[10px] font-semibold text-[var(--muted)]">{item.time}</span><ChevronRight className="h-4 w-4 text-[var(--muted)]" /></div>)}</div></DataCard></div>;
}

function SettingsView({ onToast }: { onToast: (message: string) => void }) {
  const [saved, setSaved] = useState(false); const [toggles, setToggles] = useState({ emails: true, twoFactor: true, certificates: false });
  const toggle = (key: keyof typeof toggles) => setToggles((current) => ({ ...current, [key]: !current[key] }));
  return <div className="mx-auto max-w-[1100px] px-5 py-7 sm:px-8 sm:py-9"><SectionHeader section="settings" description={sectionDescriptions.settings} actionLabel="Save changes" onAction={() => { setSaved(true); onToast("Settings saved successfully"); }} /><div className="mt-7 grid gap-4 lg:grid-cols-[220px_1fr]"><div className="surface-card h-fit p-2"><button className="flex w-full items-center gap-3 rounded-xl bg-[var(--nav-active)] px-3 py-2.5 text-left text-[12px] font-bold text-[var(--brand)]"><Settings className="h-4 w-4" /> General</button>{["Branding", "Notifications", "Security", "Certificates", "Payments"].map((item) => <button key={item} onClick={() => onToast(`${item} settings selected`)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[12px] font-semibold text-[var(--muted)] hover:bg-[var(--subtle-bg)]"><ChevronRight className="h-3.5 w-3.5" /> {item}</button>)}</div><div className="space-y-4"><div className="surface-card p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-display text-lg font-bold">Platform profile</h2><p className="mt-1 text-[11px] text-[var(--muted)]">The details learners see across your LMS.</p></div><GraduationCap className="h-5 w-5 text-[var(--brand)]" /></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-[11px] font-bold">Platform name<input defaultValue="LearnHub" className="input mt-2" /></label><label className="text-[11px] font-bold">Support email<input defaultValue="abhishek.j3094@gmail.com" className="input mt-2" /></label><label className="text-[11px] font-bold sm:col-span-2">Default learner welcome message<textarea defaultValue="Welcome to LearnHub — your complete learning and career launchpad." className="input mt-2 min-h-[88px] py-2" /></label></div></div><div className="surface-card p-5 sm:p-6"><div><h2 className="font-display text-lg font-bold">Workspace controls</h2><p className="mt-1 text-[11px] text-[var(--muted)]">Control operational notifications and account protections.</p></div><div className="mt-5 divide-y divide-[var(--app-line)]">{[{ key: "emails" as const, title: "Admin email notifications", detail: "Receive alerts for payments, feedback, and reviews." }, { key: "twoFactor" as const, title: "Two-factor authentication", detail: "Require a second step for every admin login." }, { key: "certificates" as const, title: "Auto-issue certificates", detail: "Issue certificates when learners complete a course." }].map((item) => <div className="flex items-center justify-between gap-4 py-4" key={item.key}><div><p className="text-[12px] font-bold">{item.title}</p><p className="mt-1 text-[11px] text-[var(--muted)]">{item.detail}</p></div><button onClick={() => toggle(item.key)} aria-pressed={toggles[item.key]} className={cn("relative h-6 w-11 rounded-full transition-colors", toggles[item.key] ? "bg-[var(--brand)]" : "bg-slate-200 dark:bg-white/10")}><span className={cn("absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform", toggles[item.key] ? "translate-x-6" : "translate-x-1")} /></button></div>)}</div>{saved && <p className="mt-3 text-[11px] font-bold text-emerald-600">All changes are synced.</p>}</div></div></div></div>;
}

export default function Home() {
  const { adminUser } = useAdminAuth();
  const section = useHashRoute();
  const [dialog, setDialog] = useState<DialogState>(null); const [toast, setToast] = useState<string | null>(null);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(null), 3200); return () => window.clearTimeout(timer); }, [toast]);
  useEffect(() => { setDialog(null); setToast(null); }, [section]);
  const onAction = (state: DialogState) => setDialog(state); const onToast = (message: string) => setToast(message);
  const content = section === "overview" ? <Overview onAction={onAction} onToast={onToast} /> : section === "courses" ? <CoursesView onAction={onAction} onToast={onToast} /> : section === "students" ? <StudentsView onAction={onAction} onToast={onToast} /> : section === "content" ? <ContentView onAction={onAction} onToast={onToast} /> : section === "assessments" ? <AssessmentsView onAction={onAction} onToast={onToast} /> : section === "live" ? <LiveView onAction={onAction} onToast={onToast} /> : section === "payments" ? <PaymentsView onAction={onAction} onToast={onToast} /> : section === "feedback" ? <FeedbackView onAction={onAction} onToast={onToast} /> : section === "reports" ? <ReportsView onToast={onToast} /> : section === "audit" ? <AuditView onToast={onToast} /> : <SettingsView onToast={onToast} />;
  return <DashboardLayout><div className="relative"><div className="flex items-center gap-3 border-b border-[var(--app-line)] bg-[var(--app-bg)] px-5 py-3 sm:px-8"><div className="relative flex min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 h-4 w-4 text-[var(--muted)]" /><input placeholder="Search courses, students, or actions..." className="h-9 w-full max-w-xl rounded-xl border border-transparent bg-[var(--subtle-bg)] pl-9 pr-3 text-xs font-medium outline-none transition focus:border-indigo-200 focus:bg-[var(--app-card)]" /></div><button className="icon-button" aria-label="Notifications"><Bell className="h-[17px] w-[17px]" /><span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-[var(--app-bg)]" /></button><AdminProfileDropdown variant="topbar" align="end" /></div>{content}{dialog && <Dialog state={dialog} onClose={() => setDialog(null)} onSave={(message) => { setDialog(null); onToast(message); }} />}{toast && <div className="fixed bottom-5 right-5 z-[80] flex max-w-sm items-center gap-3 rounded-xl bg-slate-950 px-4 py-3 text-xs font-semibold text-white shadow-2xl"><span className="grid h-6 w-6 place-items-center rounded-lg bg-emerald-500"><Check className="h-3.5 w-3.5" /></span>{toast}</div>}</div></DashboardLayout>;
}
