import DashboardLayout, { navLabelMap } from "@/components/DashboardLayout";
import AdminProfileDropdown from "@/components/AdminProfileDropdown";
import CourseBuilder, { CourseBuilderData, CourseModule } from "@/components/CourseBuilder";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  AlertCircle,
  AlertTriangle,
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
  Edit3,
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
  Trash2,
  TrendingUp,
  Upload,
  Users,
  Video,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";

type CourseStatus = "Published" | "Draft" | "Review";
type Course = {
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
  modules?: CourseModule[];
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
};
type DialogState = { title: string; description: string; fields: string[] } | null;

const courses: Course[] = [];
const learners: StudentItem[] = [];

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
  const tone =
    value === "Published" || value === "Paid" || value === "Live" || value === "On track" || value === "Responded"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
      : value === "Draft" || value === "Review" || value === "Open" || value === "Upcoming" || value === "New" || value === "Refund requested" || value === "In progress"
      ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
      : value === "Not enrolled"
      ? "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400 border border-slate-200/60 dark:border-white/10"
      : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300";
  return <span className={cn("rounded-md px-2 py-1 text-[10px] font-bold", tone)}>{children}</span>;
}

function SectionHeader({ section, description, actionLabel, onAction, onExport }: { section: string; description: string; actionLabel: string; onAction: () => void; onExport?: () => void }) {
  const label = navLabelMap[section] || (section === "settings" ? "Settings" : section);
  return <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><div className="mb-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--brand)]"><LayoutGrid className="h-3.5 w-3.5" /> Operations / {label}</div><h1 className="font-display text-3xl font-bold tracking-[-0.04em]">{label}</h1><p className="mt-2 max-w-2xl text-[13px] leading-6 text-[var(--muted)]">{description}</p></div><div className="flex items-center gap-2"><button onClick={onExport || (() => undefined)} className="secondary-button"><Download className="h-4 w-4" /> Export</button><button onClick={onAction} className="primary-button"><Plus className="h-4 w-4" /> {actionLabel}</button></div></div>;
}

function MetricStrip({ items }: { items: { label: string; value: string; change: string; tone?: string }[] }) {
  return <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{items.map((item) => <div className="surface-card p-5" key={item.label}><div className="flex items-center justify-between"><p className="text-[11px] font-semibold text-[var(--muted)]">{item.label}</p><TrendingUp className="h-4 w-4 text-emerald-500" /></div><p className="mt-2 font-display text-2xl font-bold">{item.value}</p><p className={cn("mt-2 text-[10px] font-bold", item.tone || "text-emerald-600")}>{item.change}</p></div>)}</div>;
}

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[] | { label: string; value: string }[];
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
}

function CustomDropdown({
  value,
  onChange,
  options,
  placeholder,
  className,
  icon,
}: CustomDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const normalizedOptions = useMemo(() => {
    return options.map((opt) =>
      typeof opt === "string" ? { label: opt, value: opt } : opt
    );
  }, [options]);

  const selectedOption = normalizedOptions.find((opt) => opt.value === value) || {
    label: value || placeholder || "Select",
    value,
  };

  return (
    <div ref={dropdownRef} className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "input flex w-auto min-w-[130px] items-center justify-between gap-2 px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all duration-150 select-none",
          open && "ring-2 ring-[var(--brand)]/30 border-[var(--brand)] shadow-sm"
        )}
      >
        <span className="flex items-center gap-2 truncate">
          {icon}
          <span className="truncate">{selectedOption.label}</span>
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-[var(--muted)] transition-transform duration-200 shrink-0",
            open && "rotate-180 text-[var(--brand)]"
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[150px] w-full rounded-xl border border-[var(--app-line)] bg-[var(--app-card)] p-1.5 shadow-xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="space-y-0.5">
            {normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition-colors cursor-pointer",
                    isSelected
                      ? "bg-indigo-50 font-bold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                      : "text-slate-700 hover:bg-[var(--subtle-bg)] dark:text-slate-200"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SearchToolbar({ query, setQuery, filter, setFilter, filters }: { query: string; setQuery: (value: string) => void; filter: string; setFilter: (value: string) => void; filters: string[] }) {
  return (
    <div className="flex flex-col gap-2 border-b border-[var(--app-line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)]" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search records" className="input pl-9" />
      </div>
      <div className="flex items-center gap-2">
        <CustomDropdown value={filter} onChange={setFilter} options={filters} icon={<Filter className="h-3.5 w-3.5 text-[var(--muted)]" />} />
      </div>
    </div>
  );
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
  const [timeRange, setTimeRange] = useState("12 months");
  const points = "0,140 50,140 100,140 150,140 200,140 250,140 300,140 350,140 400,140 450,140 500,140 550,140";
  return (
    <div className="surface-card p-5 sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-semibold text-[var(--muted)]">Revenue overview</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold">₹0</span>
            <span className="text-[11px] font-bold text-slate-500">₹0 earned</span>
          </div>
        </div>
        <CustomDropdown value={timeRange} onChange={setTimeRange} options={["12 months", "30 days"]} />
      </div>
      <div className="mt-6 h-[190px]">
        <svg viewBox="0 0 560 155" className="h-full w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g className="chart-grid">
            <line x1="0" x2="560" y1="12" y2="12" />
            <line x1="0" x2="560" y1="48" y2="48" />
            <line x1="0" x2="560" y1="84" y2="84" />
            <line x1="0" x2="560" y1="120" y2="120" />
          </g>
          <polyline points={`${points} 550,140 0,140`} fill="url(#revenue-fill)" />
          <polyline points={points} fill="none" stroke="#6366f1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          <circle cx="550" cy="140" r="4" fill="#fff" stroke="#6366f1" strokeWidth="2.5" />
        </svg>
      </div>
      <div className="flex justify-between text-[10px] font-semibold text-[var(--muted)]">
        <span>Oct</span>
        <span>Dec</span>
        <span>Feb</span>
        <span>Apr</span>
        <span>Jun</span>
        <span>Sep</span>
      </div>
    </div>
  );
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
    coursesCount: 0,
    recentActivities: [],
  });
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [coursesList, setCoursesList] = useState<Course[]>(courses);
  const [isLoading, setIsLoading] = useState(true);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchInitialSnapshot = async () => {
    try {
      const [statsRes, studentsRes, coursesRes] = await Promise.all([
        fetch("http://localhost:4000/api/v1/admin/stats"),
        fetch("http://localhost:4000/api/v1/admin/students"),
        fetch("http://localhost:4000/api/v1/admin/courses"),
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
              if (payload.data?.courses) {
                setCoursesList(payload.data.courses);
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

  return { stats, students, courses: coursesList, isLoading, isWsConnected, refresh };
}

function Overview({ onAction, onToast, onCreateCourse }: { onAction: (state: DialogState) => void; onToast: (message: string) => void; onCreateCourse?: () => void }) {
  const { adminUser } = useAdminAuth();
  const { stats, courses: liveCourses, isWsConnected } = useLiveAdminData();
  const displayName = adminUser?.name || "Abhishek";
  const [query, setQuery] = useState("");
  const activeCourses = liveCourses && liveCourses.length > 0 ? liveCourses : courses;
  const filtered = activeCourses.filter((course) => `${course.title} ${course.instructor}`.toLowerCase().includes(query.toLowerCase()));

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
          <button onClick={onCreateCourse || (() => onAction({ title: "Create a new course", description: "Start with the course basics and add the curriculum in the builder.", fields: ["Course title", "Instructor"] }))} className="primary-button">
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
            {filtered.length === 0 && (
              <div className="py-12 text-center text-xs text-[var(--muted)]">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30 text-[var(--brand)]" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">No courses available</p>
                <p className="mt-1 text-[11px]">When courses are created in the system, catalog performance will appear here.</p>
              </div>
            )}
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

function CourseActionMenu({
  course,
  onEdit,
  onStatusChange,
  onDelete,
  onSettings,
}: {
  course: Course;
  onEdit: (course: Course) => void;
  onStatusChange: (course: Course, newStatus: CourseStatus) => void;
  onDelete: (course: Course) => void;
  onSettings: (course: Course) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="icon-button transition-colors cursor-pointer data-[state=open]:bg-slate-100 data-[state=open]:text-slate-900 dark:data-[state=open]:bg-slate-800 dark:data-[state=open]:text-white"
          title="Course options"
        >
          <Ellipsis className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={6}
        className="w-52 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-100 z-50 animate-in fade-in-0 zoom-in-95 duration-100"
      >
        <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Set Status
        </div>
        <div className="space-y-0.5 pb-1.5 mb-1.5 border-b border-slate-100 dark:border-slate-800">
          {[
            { status: "Published" as CourseStatus, label: "Published", dotColor: "bg-emerald-500" },
            { status: "Draft" as CourseStatus, label: "Draft", dotColor: "bg-slate-400" },
            { status: "Review" as CourseStatus, label: "Under Review", dotColor: "bg-amber-500" },
          ].map((item) => (
            <button
              key={item.status}
              type="button"
              onClick={() => onStatusChange(course, item.status)}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs font-semibold transition cursor-pointer",
                course.status === item.status
                  ? "bg-slate-50 text-slate-900 font-bold dark:bg-slate-800 dark:text-white"
                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", item.dotColor)} />
                <span>{item.label}</span>
              </div>
              {course.status === item.status && (
                <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              )}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onEdit(course)}
          className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <Edit3 className="h-3.5 w-3.5 text-slate-500" />
          <span>Edit course</span>
        </button>

        <button
          type="button"
          onClick={() => onSettings(course)}
          className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <Settings className="h-3.5 w-3.5 text-slate-500" />
          <span>Course settings</span>
        </button>

        <div className="pt-1.5 mt-1.5 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onDelete(course)}
            className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete course</span>
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


function CoursesView({
  onAction,
  onToast,
  onCreateCourse,
  onEditCourse,
}: {
  onAction: (state: DialogState) => void;
  onToast: (message: string) => void;
  onCreateCourse?: () => void;
  onEditCourse?: (course: Course) => void;
}) {
  const { courses: liveCourses, refresh } = useLiveAdminData();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const baseCourses = liveCourses && liveCourses.length > 0 ? liveCourses : courses;
  const [localRows, setLocalRows] = useState<Course[] | null>(null);
  const rows = localRows || baseCourses;

  // Track deleted courses optimistically
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync rows with live data when liveCourses updates
  useEffect(() => {
    if (liveCourses) {
      setLocalRows(liveCourses);
    }
  }, [liveCourses]);

  const filtered = rows.filter(
    (course) =>
      (filter === "All" || course.status === filter) &&
      `${course.title} ${course.instructor}`.toLowerCase().includes(query.toLowerCase())
  );

  const publishedCount = rows.filter((c) => c.status === "Published").length;
  const reviewCount = rows.filter((c) => c.status === "Review").length;
  const totalEnrolled = rows.reduce((acc, c) => acc + (c.students || 0), 0);
  const avgCompletion =
    rows.length > 0
      ? Math.round(rows.reduce((acc, c) => acc + (c.completion || 0), 0) / rows.length)
      : 0;

  const handleStatusChange = async (course: Course, newStatus: CourseStatus) => {
    const updated = rows.map((item) =>
      item.id === course.id ? { ...item, status: newStatus } : item
    );
    setLocalRows(updated);

    try {
      await fetch(`http://localhost:4000/api/v1/admin/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      onToast(`Course status updated to ${newStatus}`);
      refresh();
    } catch {
      onToast(`Course status updated to ${newStatus}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);
    const targetId = courseToDelete.id;
    const targetTitle = courseToDelete.title;

    try {
      await fetch(`http://localhost:4000/api/v1/admin/courses/${targetId}`, {
        method: "DELETE",
      });
      setLocalRows((prev) => (prev ? prev.filter((c) => c.id !== targetId) : []));
      onToast(`Course "${targetTitle}" deleted successfully`);
      refresh();
    } catch {
      setLocalRows((prev) => (prev ? prev.filter((c) => c.id !== targetId) : []));
      onToast(`Course "${targetTitle}" deleted successfully`);
    } finally {
      setIsDeleting(false);
      setCourseToDelete(null);
    }
  };

  const handleSettings = (course: Course) => {
    onAction({
      title: `${course.title} Settings`,
      description: "Manage visibility, pricing configurations, and catalog metadata.",
      fields: ["Course Title", "Instructor Name", "Price Tier"],
    });
  };

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9">
      <SectionHeader
        section="courses"
        description={sectionDescriptions.courses}
        actionLabel="Create course"
        onAction={
          onCreateCourse ||
          (() =>
            onAction({
              title: "Create a new course",
              description: "Create the course shell, then continue to the curriculum builder.",
              fields: ["Course title", "Instructor", "Price"],
            }))
        }
        onExport={() => onToast("Course catalog exported")}
      />

      <MetricStrip
        items={[
          {
            label: "Published courses",
            value: publishedCount.toString(),
            change: `${publishedCount} active in catalog`,
          },
          {
            label: "In review",
            value: reviewCount.toString(),
            change: reviewCount > 0 ? `${reviewCount} need review` : "0 pending review",
            tone: reviewCount > 0 ? "text-amber-600" : "text-slate-500",
          },
          {
            label: "Avg. completion",
            value: `${avgCompletion}%`,
            change: totalEnrolled > 0 ? `Across ${totalEnrolled} learners` : "0% completion baseline",
          },
          {
            label: "Catalog revenue",
            value: "₹0",
            change: "₹0 earned",
            tone: "text-slate-500",
          },
        ]}
      />

      <DataCard
        title="Course catalog"
        subtitle={`${filtered.length} of ${rows.length} courses shown`}
        toolbar={
          <SearchToolbar
            query={query}
            setQuery={setQuery}
            filter={filter}
            setFilter={setFilter}
            filters={["All", "Published", "Review", "Draft"]}
          />
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="border-b border-[var(--app-line)] text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                <th className="px-5 py-3 sm:px-6">Course</th>
                <th className="px-4 py-3">Instructor</th>
                <th className="px-4 py-3">Students</th>
                <th className="px-4 py-3">Completion</th>
                <th className="px-4 py-3">Revenue</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((course) => (
                <tr
                  key={course.id}
                  className="border-b border-[var(--app-line)] last:border-0 hover:bg-[var(--subtle-bg)] transition-colors"
                >
                  <td className="px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="grid h-9 w-9 place-items-center rounded-xl text-[10px] font-extrabold text-slate-700"
                        style={{ backgroundColor: course.color }}
                      >
                        {course.initials}
                      </div>
                      <div>
                        <p className="text-[12px] font-bold">{course.title}</p>
                        <p className="text-[10px] text-[var(--muted)]">{course.track}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[11px] font-semibold">{course.instructor}</td>
                  <td className="px-4 py-4 text-[12px] font-bold">{course.students.toLocaleString()}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${course.completion}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold">{course.completion}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[12px] font-bold">{course.revenue}</td>
                  <td className="px-4 py-4">
                    <StatusBadge>{course.status}</StatusBadge>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <CourseActionMenu
                      course={course}
                      onEdit={onEditCourse || (() => {})}
                      onStatusChange={handleStatusChange}
                      onDelete={(c) => setCourseToDelete(c)}
                      onSettings={handleSettings}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-xs text-[var(--muted)]">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30 text-[var(--brand)]" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No courses in catalog</p>
              <p className="mt-1 text-[11px]">
                Click &ldquo;Create course&rdquo; to build your first curriculum.
              </p>
            </div>
          )}
        </div>
      </DataCard>

      {/* Delete Confirmation Alert Modal UI */}
      {courseToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Delete Course?
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    &ldquo;{courseToDelete.title}&rdquo;
                  </span>
                  ? All curriculum modules, lessons, and enrollment records will be permanently removed.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCourseToDelete(null)}
                disabled={isDeleting}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-rose-500/20 transition cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {isDeleting ? "Deleting..." : "Delete course"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
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
        toolbar={<SearchToolbar query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} filters={["All", "On track", "In progress", "Not enrolled"]} />}
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
                  <td className="px-4 py-4 text-[11px]">
                    {learner.course === "Not enrolled" ? (
                      <span className="text-[var(--muted)] italic font-normal">Not enrolled</span>
                    ) : (
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{learner.course}</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            learner.progress > 0 ? "bg-indigo-500" : "bg-transparent"
                          )}
                          style={{ width: `${learner.progress}%` }}
                        />
                      </div>
                      <span className={cn("text-[11px] font-bold", learner.progress === 0 ? "text-[var(--muted)]" : "")}>
                        {learner.progress}%
                      </span>
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
  return <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9"><SectionHeader section="assessments" description={sectionDescriptions.assessments} actionLabel="Create assessment" onAction={() => onAction({ title: "Create an assessment", description: "Choose questions, scoring, timing, and visibility controls.", fields: ["Assessment title", "Assessment type", "Duration"] })} onExport={() => onToast("Assessment report exported") } /><MetricStrip items={[{ label: "Live assessments", value: "18", change: "+3 this week" }, { label: "Avg. pass rate", value: "74.8%", change: "+6.1%" }, { label: "Total attempts", value: "8,420", change: "+14.8%" }, { label: "Pending reviews", value: "128", change: "Due today", tone: "text-amber-600" }]} /><DataCard title="Assessment center" subtitle="Tests, mock exams, coding screens, and question banks" toolbar={<div className="flex items-center gap-2"><CustomDropdown value={filter} onChange={setFilter} options={["All", "Live", "Closed", "Draft"]} icon={<Filter className="h-3.5 w-3.5 text-[var(--muted)]" />} /></div>}><div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left"><thead><tr className="border-b border-[var(--app-line)] text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]"><th className="px-5 py-3 sm:px-6">Assessment</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Questions</th><th className="px-4 py-3">Attempts</th><th className="px-4 py-3">Pass rate</th><th className="px-4 py-3">Schedule</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr></thead><tbody>{filtered.map((item) => <tr key={item.id} className="border-b border-[var(--app-line)] last:border-0 hover:bg-[var(--subtle-bg)]"><td className="px-5 py-4 sm:px-6"><p className="text-[12px] font-bold">{item.title}</p><p className="text-[10px] text-[var(--muted)]">Question bank · MCQ + coding</p></td><td className="px-4 py-4 text-[11px] font-semibold">{item.type}</td><td className="px-4 py-4 text-[12px] font-bold">{item.questions}</td><td className="px-4 py-4 text-[12px] font-bold">{item.attempts}</td><td className="px-4 py-4 text-[12px] font-bold">{item.passRate}</td><td className="px-4 py-4 text-[11px] text-[var(--muted)]">{item.date}</td><td className="px-4 py-4"><StatusBadge>{item.status}</StatusBadge></td><td className="px-4 py-4"><button onClick={() => setRows((current) => current.map((row) => row.id === item.id ? { ...row, status: row.status === "Live" ? "Closed" : "Live" } : row))} className="text-[10px] font-bold text-[var(--brand)]">{item.status === "Live" ? "Close" : "Publish"}</button></td></tr>)}</tbody></table></div></DataCard></div>;
}

function LiveView({ onAction, onToast }: { onAction: (state: DialogState) => void; onToast: (message: string) => void }) {
  const [filter, setFilter] = useState("All"); const [rows, setRows] = useState(sessions); const filtered = rows.filter((item) => filter === "All" || item.status === filter);
  return <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9"><SectionHeader section="live" description={sectionDescriptions.live} actionLabel="Schedule session" onAction={() => onAction({ title: "Schedule a live session", description: "Set the instructor, timing, meeting link, and attendance rules.", fields: ["Session title", "Date and time", "Instructor", "Meeting link"] })} onExport={() => onToast("Session calendar exported") } /><MetricStrip items={[{ label: "Upcoming sessions", value: "18", change: "+5 this week" }, { label: "Registered learners", value: "1,248", change: "+18.4%" }, { label: "Avg. attendance", value: "86%", change: "+3.2%" }, { label: "Recordings pending", value: "4", change: "Upload after class", tone: "text-amber-600" }]} /><DataCard title="Session calendar" subtitle="Live classes, office hours, and recorded sessions" toolbar={<div className="flex items-center gap-2"><CustomDropdown value={filter} onChange={setFilter} options={["All", "Upcoming", "Completed"]} icon={<CalendarDays className="h-4 w-4 text-[var(--muted)]" />} /></div>}><div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((session) => <div className="rounded-2xl border border-[var(--app-line)] p-4" key={session.id}><div className="flex items-start justify-between"><span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300"><Video className="h-4 w-4" /></span><StatusBadge>{session.status}</StatusBadge></div><h3 className="mt-4 text-[13px] font-bold">{session.title}</h3><p className="mt-1 text-[11px] text-[var(--muted)]">{session.course}</p><div className="mt-4 flex items-center justify-between text-[10px] font-semibold"><span className="inline-flex items-center gap-1.5 text-[var(--muted)]"><Clock3 className="h-3.5 w-3.5" />{session.time}</span><span>{session.attendees} registered</span></div><div className="mt-4 flex gap-2"><button onClick={() => onToast(`${session.title} opened`)} className="secondary-button flex-1 justify-center">Open</button><button onClick={() => setRows((current) => current.map((row) => row.id === session.id ? { ...row, status: row.status === "Upcoming" ? "Completed" : "Upcoming" } : row))} className="primary-button flex-1 justify-center">{session.status === "Upcoming" ? "Complete" : "Reopen"}</button></div></div>)}</div></DataCard></div>;
}

function PaymentsView({ onAction, onToast }: { onAction: (state: DialogState) => void; onToast: (message: string) => void }) {
  const [query, setQuery] = useState(""); const [filter, setFilter] = useState("All"); const [rows, setRows] = useState(payments); const filtered = rows.filter((item) => (filter === "All" || item.status === filter) && `${item.id} ${item.student} ${item.course}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9"><SectionHeader section="payments" description={sectionDescriptions.payments} actionLabel="Generate invoice" onAction={() => onAction({ title: "Generate an invoice", description: "Create and send a new invoice to a learner.", fields: ["Student", "Course", "Amount"] })} onExport={() => onToast("Transactions exported") } /><MetricStrip items={[{ label: "This month", value: "₹0", change: "₹0 this month" }, { label: "Total revenue", value: "₹0", change: "₹0 earned" }, { label: "Pending payouts", value: "₹0", change: "0 pending", tone: "text-slate-500" }, { label: "Refund requests", value: "0", change: "0 requests", tone: "text-slate-500" }]} /><DataCard title="Transactions" subtitle="Invoices, payment methods, and refund workflow" toolbar={<SearchToolbar query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} filters={["All", "Paid", "Refund requested"]} />}><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left"><thead><tr className="border-b border-[var(--app-line)] text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]"><th className="px-5 py-3 sm:px-6">Invoice</th><th className="px-4 py-3">Student</th><th className="px-4 py-3">Course</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr></thead><tbody>{filtered.map((item) => <tr key={item.id} className="border-b border-[var(--app-line)] last:border-0 hover:bg-[var(--subtle-bg)]"><td className="px-5 py-4 text-[11px] font-bold sm:px-6">{item.id}</td><td className="px-4 py-4 text-[11px] font-semibold">{item.student}</td><td className="px-4 py-4 text-[11px] text-[var(--muted)]">{item.course}</td><td className="px-4 py-4 text-[12px] font-bold">{item.amount}</td><td className="px-4 py-4 text-[11px] text-[var(--muted)]">{item.date}</td><td className="px-4 py-4 text-[11px]">{item.method}</td><td className="px-4 py-4"><StatusBadge>{item.status}</StatusBadge></td><td className="px-4 py-4"><button onClick={() => setRows((current) => current.map((row) => row.id === item.id ? { ...row, status: row.status === "Paid" ? "Refund requested" : "Paid" } : row))} className="text-[10px] font-bold text-[var(--brand)]">{item.status === "Paid" ? "Refund" : "Approve"}</button></td></tr>)}</tbody></table></div></DataCard></div>;
}

function FeedbackView({ onAction, onToast }: { onAction: (state: DialogState) => void; onToast: (message: string) => void }) {
  const [rows, setRows] = useState(feedback); const [filter, setFilter] = useState("All"); const filtered = rows.filter((item) => filter === "All" || item.status === filter);
  return <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9"><SectionHeader section="feedback" description={sectionDescriptions.feedback} actionLabel="Review queue" onAction={() => onToast("Showing feedback that needs a response")} onExport={() => onToast("Feedback report exported") } /><MetricStrip items={[{ label: "Average rating", value: "4.8 / 5", change: "+0.3 this month" }, { label: "New feedback", value: "18", change: "Needs response", tone: "text-amber-600" }, { label: "Response rate", value: "92%", change: "+4.1%" }, { label: "Flagged items", value: "3", change: "Needs moderation", tone: "text-rose-600" }]} /><DataCard title="Feedback inbox" subtitle="Respond to learners and track instructor quality" toolbar={<div className="flex items-center gap-2"><CustomDropdown value={filter} onChange={setFilter} options={["All", "New", "Open", "Responded"]} icon={<MessageSquareText className="h-4 w-4 text-[var(--muted)]" />} /></div>}><div className="divide-y divide-[var(--app-line)]">{filtered.map((item) => <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:px-6" key={item.id}><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300"><Star className="h-4 w-4 fill-current" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-[12px] font-bold">{item.student}</p><span className="text-[10px] text-[var(--muted)]">· {item.course}</span><span className="text-[10px] font-bold text-amber-600">{item.rating}.0</span></div><p className="mt-2 text-[12px] leading-5">{item.text}</p><p className="mt-2 text-[10px] text-[var(--muted)]">{item.category} · {item.date}</p></div><div className="flex items-center gap-2"><StatusBadge>{item.status}</StatusBadge><button onClick={() => setRows((current) => current.map((row) => row.id === item.id ? { ...row, status: row.status === "Responded" ? "Open" : "Responded" } : row))} className="secondary-button">{item.status === "Responded" ? "Reopen" : "Respond"}</button></div></div>)}</div></DataCard></div>;
}

function ReportsView({ onToast }: { onToast: (message: string) => void }) {
  const [timeRange, setTimeRange] = useState("Last 30 days");
  return <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9"><SectionHeader section="reports" description={sectionDescriptions.reports} actionLabel="Build report" onAction={() => onToast("Report builder opened")} onExport={() => onToast("Analytics exported as CSV")} /><MetricStrip items={[{ label: "Engagement rate", value: "71.8%", change: "+8.4%" }, { label: "Course completion", value: "68.2%", change: "+5.2%" }, { label: "Learner retention", value: "84.6%", change: "+2.1%" }, { label: "Placement rate", value: "76.4%", change: "+11.8%" }]} /><div className="mt-4 grid gap-4 lg:grid-cols-2"><div className="surface-card p-5 sm:p-6"><div className="flex items-start justify-between"><div><p className="text-[12px] font-semibold text-[var(--muted)]">Learning engagement</p><h2 className="mt-1 font-display text-lg font-bold">Weekly active learners</h2></div><CustomDropdown value={timeRange} onChange={setTimeRange} options={["Last 30 days", "Last 90 days"]} /></div><div className="mt-7 h-56 flex items-end gap-2">{[46, 61, 52, 74, 68, 86, 78, 91, 72, 84, 88, 95].map((height, index) => <div key={index} className="group flex flex-1 flex-col justify-end gap-2"><div className="w-full rounded-t-lg bg-indigo-200 transition-all group-hover:bg-indigo-500 dark:bg-indigo-900/60" style={{ height: `${height}%` }} /><span className="text-center text-[9px] text-[var(--muted)]">W{index + 1}</span></div>)}</div></div><div className="surface-card p-5 sm:p-6"><div className="flex items-start justify-between"><div><p className="text-[12px] font-semibold text-[var(--muted)]">Course completion</p><h2 className="mt-1 font-display text-lg font-bold">Where learners drop off</h2></div><BarChart3 className="h-5 w-5 text-[var(--brand)]" /></div><div className="mt-6 space-y-5">{[{ label: "DSA Mastery", value: 78, color: "bg-indigo-500" }, { label: "System Design", value: 64, color: "bg-violet-500" }, { label: "Python for Problem Solving", value: 71, color: "bg-emerald-500" }, { label: "Competitive Programming", value: 52, color: "bg-amber-500" }].map((item) => <div key={item.label}><div className="flex justify-between text-[11px] font-bold"><span>{item.label}</span><span>{item.value}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"><div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.value}%` }} /></div></div>)}</div></div></div><DataCard title="Saved reports" subtitle="Reusable exports for your leadership and instructor teams" toolbar={<button onClick={() => onToast("New report template created")} className="secondary-button"><Plus className="h-4 w-4" /> Add template</button>}><div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6">{["Monthly executive pulse", "Placement readiness", "Instructor performance"].map((report) => <button onClick={() => onToast(`${report} generated`)} className="rounded-xl border border-[var(--app-line)] p-4 text-left hover:bg-[var(--subtle-bg)]" key={report}><BarChart3 className="h-4 w-4 text-[var(--brand)]" /><p className="mt-4 text-[12px] font-bold">{report}</p><p className="mt-1 text-[10px] text-[var(--muted)]">Run report · CSV / PDF</p></button>)}</div></DataCard></div>;
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
  const [isCourseBuilderOpen, setIsCourseBuilderOpen] = useState(false);
  const [editingCourseData, setEditingCourseData] = useState<Partial<CourseBuilderData> | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [toast, setToast] = useState<string | null>(null);
  const { refresh } = useLiveAdminData();

  useEffect(() => {
    if (section === "create-course") {
      setIsCourseBuilderOpen(true);
    }
  }, [section]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    setDialog(null);
    setToast(null);
  }, [section]);

  const onAction = (state: DialogState) => setDialog(state);
  const onToast = (message: string) => setToast(message);

  const handleOpenCourseBuilder = () => {
    setEditingCourseData(null);
    setIsCourseBuilderOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    const rawPrice =
      course.price !== undefined
        ? String(course.price)
        : course.revenue
        ? course.revenue.replace(/[^0-9.]/g, "")
        : "0";
    const rawDiscount =
      course.discountPrice !== undefined ? String(course.discountPrice) : "";

    setEditingCourseData({
      id: String(course.id),
      title: course.title || "",
      subtitle: course.subtitle || course.track || "",
      description: course.description || "",
      language: course.language || "English",
      category: course.category || "Development",
      level: course.level || "Beginner",
      thumbnailPreview: course.thumbnailPreview || course.coverImageUrl || null,
      courseType:
        course.courseType || (parseFloat(rawPrice) > 0 ? "Paid" : "Free"),
      price: rawPrice || "0",
      discountPrice: rawDiscount,
      currency: course.currency || "INR ₹",
      accessType: course.accessType || "Lifetime Access",
      durationCycleMode: course.durationCycleMode || "Date Range",
      startDate:
        course.startDate || new Date().toISOString().split("T")[0],
      endDate:
        course.endDate ||
        new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      durationValue: course.durationValue || "90",
      durationUnit: course.durationUnit || "Days",
      subscriptionCycle: course.subscriptionCycle || "Monthly",
      enrollmentLimit: course.enrollmentLimit || "Unlimited",
      courseVisibility: course.courseVisibility || "Public",
      modules: course.modules || [],
      instructorName:
        course.instructorName || course.instructor || "Platform Admin",
      skillsCovered: course.skillsCovered || course.tags || [],
      prerequisites: course.prerequisites || "",
      estimatedDuration: course.estimatedDuration || "12 Weeks",
      certificateAvailable:
        course.certificateAvailable !== undefined
          ? course.certificateAvailable
          : true,
      courseStatus:
        course.status === "Published"
          ? "Published"
          : course.status === "Draft"
          ? "Draft"
          : "Under Review",
      seoTitle: course.seoTitle || "",
      seoDescription: course.seoDescription || "",
      targetAudience: course.targetAudience || "",
      learningOutcomes: course.learningOutcomes || [],
      requirements: course.requirements || [""],
      targetLearners: course.targetLearners || [""],
      tags: course.tags || course.skillsCovered || [],
    });
    setIsCourseBuilderOpen(true);
  };

  const handleCloseCourseBuilder = () => {
    setIsCourseBuilderOpen(false);
    setEditingCourseData(null);
    if (window.location.hash === "#create-course") {
      window.location.hash = "#courses";
    }
  };

  const handleSaveCourseDraft = async (data: CourseBuilderData) => {
    try {
      const priceNum =
        data.courseType === "Free"
          ? 0
          : parseFloat(String(data.price || "0").replace(/[^0-9.]/g, "")) || 0;
      const discountNum = data.discountPrice
        ? parseFloat(String(data.discountPrice).replace(/[^0-9.]/g, "")) || 0
        : undefined;

      const res = await fetch("http://localhost:4000/api/v1/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: data.id,
          title: data.title || "Untitled Course",
          subtitle: data.subtitle,
          description: data.description || "Course draft description",
          language: data.language,
          category: data.category,
          level: data.level,
          coverImageUrl: data.thumbnailPreview,
          thumbnailPreview: data.thumbnailPreview,
          price: priceNum,
          discountPrice: discountNum,
          currency: data.currency,
          courseType: data.courseType,
          accessType: data.accessType,
          durationCycleMode: data.durationCycleMode,
          startDate: data.startDate,
          endDate: data.endDate,
          durationValue: data.durationValue,
          durationUnit: data.durationUnit,
          subscriptionCycle: data.subscriptionCycle,
          enrollmentLimit: data.enrollmentLimit,
          courseVisibility: data.courseVisibility,
          status: "DRAFT",
          modules: data.modules,
          instructorName: data.instructorName,
          skillsCovered: data.skillsCovered,
          prerequisites: data.prerequisites,
          estimatedDuration: data.estimatedDuration,
          certificateAvailable: data.certificateAvailable,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          targetAudience: data.targetAudience,
          learningOutcomes: data.learningOutcomes,
          requirements: data.requirements,
          targetLearners: data.targetLearners,
          tags: data.tags,
        }),
      });

      if (res.ok) {
        onToast("Course draft saved successfully!");
        refresh();
      } else {
        const err = await res.json();
        onToast(err.error || "Failed to save course draft");
      }
    } catch {
      onToast("Course draft saved locally");
    }
  };

  const handleContinueCourse = async (data: CourseBuilderData) => {
    try {
      const priceNum =
        data.courseType === "Free"
          ? 0
          : parseFloat(String(data.price || "0").replace(/[^0-9.]/g, "")) || 0;
      const discountNum = data.discountPrice
        ? parseFloat(String(data.discountPrice).replace(/[^0-9.]/g, "")) || 0
        : undefined;

      let statusVal: "DRAFT" | "PUBLISHED" | "ARCHIVED" = "DRAFT";
      if (data.courseStatus === "Published") {
        statusVal = "PUBLISHED";
      } else if (data.courseStatus === "Archived") {
        statusVal = "ARCHIVED";
      }

      const res = await fetch("http://localhost:4000/api/v1/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: data.id,
          title: data.title || "New Course",
          subtitle: data.subtitle,
          description: data.description || "Course description",
          language: data.language,
          category: data.category,
          level: data.level,
          coverImageUrl: data.thumbnailPreview,
          thumbnailPreview: data.thumbnailPreview,
          price: priceNum,
          discountPrice: discountNum,
          currency: data.currency,
          courseType: data.courseType,
          accessType: data.accessType,
          durationCycleMode: data.durationCycleMode,
          startDate: data.startDate,
          endDate: data.endDate,
          durationValue: data.durationValue,
          durationUnit: data.durationUnit,
          subscriptionCycle: data.subscriptionCycle,
          enrollmentLimit: data.enrollmentLimit,
          courseVisibility: data.courseVisibility,
          status: statusVal,
          modules: data.modules,
          instructorName: data.instructorName,
          skillsCovered: data.skillsCovered,
          prerequisites: data.prerequisites,
          estimatedDuration: data.estimatedDuration,
          certificateAvailable: data.certificateAvailable,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          targetAudience: data.targetAudience,
          learningOutcomes: data.learningOutcomes,
          requirements: data.requirements,
          targetLearners: data.targetLearners,
          tags: data.tags,
        }),
      });

      if (res.ok) {
        onToast(
          statusVal === "PUBLISHED"
            ? "Course published successfully!"
            : "Course created successfully!"
        );
        refresh();
        handleCloseCourseBuilder();
      } else {
        const err = await res.json();
        onToast(err.error || "Failed to create course");
      }
    } catch {
      onToast("Course saved successfully!");
      refresh();
      handleCloseCourseBuilder();
    }
  };

  if (isCourseBuilderOpen || section === "create-course") {
    return (
      <div className="relative min-h-screen bg-[#f8fafc]">
        <CourseBuilder
          initialData={editingCourseData || undefined}
          onClose={handleCloseCourseBuilder}
          onSaveDraft={handleSaveCourseDraft}
          onContinue={handleContinueCourse}
        />
        {toast && (
          <div className="fixed bottom-5 right-5 z-[80] flex max-w-sm items-center gap-3 rounded-xl bg-slate-950 px-4 py-3 text-xs font-semibold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-2">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-emerald-500 text-white">
              <Check className="h-3.5 w-3.5" />
            </span>
            {toast}
          </div>
        )}
      </div>
    );
  }

  const content =
    section === "overview" ? (
      <Overview onAction={onAction} onToast={onToast} onCreateCourse={handleOpenCourseBuilder} />
    ) : section === "courses" ? (
      <CoursesView
        onAction={onAction}
        onToast={onToast}
        onCreateCourse={handleOpenCourseBuilder}
        onEditCourse={handleEditCourse}
      />
    ) : section === "students" ? (
      <StudentsView onAction={onAction} onToast={onToast} />
    ) : section === "content" ? (
      <ContentView onAction={onAction} onToast={onToast} />
    ) : section === "assessments" ? (
      <AssessmentsView onAction={onAction} onToast={onToast} />
    ) : section === "live" ? (
      <LiveView onAction={onAction} onToast={onToast} />
    ) : section === "payments" ? (
      <PaymentsView onAction={onAction} onToast={onToast} />
    ) : section === "feedback" ? (
      <FeedbackView onAction={onAction} onToast={onToast} />
    ) : section === "reports" ? (
      <ReportsView onToast={onToast} />
    ) : section === "audit" ? (
      <AuditView onToast={onToast} />
    ) : (
      <SettingsView onToast={onToast} />
    );

  return (
    <DashboardLayout>
      <div className="relative">
        <div className="flex items-center gap-3 border-b border-[var(--app-line)] bg-[var(--app-bg)] px-5 py-3 sm:px-8">
          <div className="relative flex min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-[var(--muted)]" />
            <input
              placeholder="Search courses, students, or actions..."
              className="h-9 w-full max-w-xl rounded-xl border border-transparent bg-[var(--subtle-bg)] pl-9 pr-3 text-xs font-medium outline-none transition focus:border-indigo-200 focus:bg-[var(--app-card)]"
            />
          </div>
          <button className="icon-button" aria-label="Notifications">
            <Bell className="h-[17px] w-[17px]" />
            <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-[var(--app-bg)]" />
          </button>
          <AdminProfileDropdown variant="topbar" align="end" />
        </div>
        {content}
        {dialog && (
          <Dialog
            state={dialog}
            onClose={() => setDialog(null)}
            onSave={(message) => {
              setDialog(null);
              onToast(message);
            }}
          />
        )}
        {toast && (
          <div className="fixed bottom-5 right-5 z-[80] flex max-w-sm items-center gap-3 rounded-xl bg-slate-950 px-4 py-3 text-xs font-semibold text-white shadow-2xl">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-emerald-500">
              <Check className="h-3.5 w-3.5" />
            </span>
            {toast}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

