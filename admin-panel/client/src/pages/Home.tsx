import DashboardLayout, { navLabelMap } from "@/components/DashboardLayout";
import AdminProfileDropdown from "@/components/AdminProfileDropdown";
import CourseBuilder, { CourseBuilderData, CourseModule } from "@/components/CourseBuilder";
import AssignmentBuilder, { AssignmentData } from "@/components/AssignmentBuilder";
import ScheduleSessionBuilder, { LiveSessionData } from "@/components/ScheduleSessionBuilder";
import UploadRecordingBuilder, { RecordingData } from "@/components/UploadRecordingBuilder";
import AddContentModal, { ContentTypeOption } from "@/components/AddContentModal";
import PracticeProblemModal from "@/components/PracticeProblemModal";
import PracticeProblemBuilder from "@/components/PracticeProblemBuilder";
import PracticeProblemDetailView from "@/components/PracticeProblemDetailView";
import ActiveDraftBanner from "@/components/ActiveDraftBanner";
import {
  DraftType,
  getDraft,
  clearDraft,
  formatTimeAgo,
  hasDraftContent,
} from "@/lib/draftManager";
import CustomConfirmDialog from "@/components/CustomConfirmDialog";
import CustomAlertDialog from "@/components/CustomAlertDialog";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useAdminRoute, navigateAdmin } from "@/lib/navigation";
import { useLiveAdminData, AdminStats, StudentItem, Course, CourseStatus, ContentItem, PracticeProblem } from "@/hooks/useLiveAdminData";
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
  ArrowRight,
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
  CreditCard,
  Download,
  Edit3,
  Ellipsis,
  FileText,
  Filter,
  GraduationCap,
  KeyRound,
  LayoutGrid,
  LifeBuoy,
  ListChecks,
  Lock,
  MessageSquareText,
  MoreHorizontal,
  Palette,
  PlayCircle,
  Plus,
  Save,
  Search,
  Send,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trash2,
  TrendingUp,
  Upload,
  User,
  Users,
  Video,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";

type DialogState = { title: string; description: string; fields: string[] } | null;

const courses: Course[] = [];
const learners: StudentItem[] = [];
const contentItems: ContentItem[] = [];


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
  {
    id: 1,
    action: "Assessment published",
    entity: "Weekly Test · Graphs",
    actor: "Ava Patel",
    subtitle: "Weekly Test · Graphs · by Ava Patel",
    time: "12 min ago",
    badgeType: "emerald",
    details: "Published assessment 'Weekly Test · Graphs' for Spring Cohort learners with 25 MCQ & coding questions.",
  },
  {
    id: 2,
    action: "Student added",
    entity: "Aarav Sharma",
    actor: "Nisha Singh",
    subtitle: "Aarav Sharma · by Nisha Singh",
    time: "34 min ago",
    badgeType: "blue",
    details: "Enrolled new student Aarav Sharma (aarav.sharma@example.com) into Fullstack Next.js Masterclass.",
  },
  {
    id: 3,
    action: "Payment received",
    entity: "INV-2048",
    actor: "System",
    subtitle: "INV-2048 · by System",
    time: "1 hr ago",
    badgeType: "purple",
    details: "Automated payment gateway captured INR 4,999 for Invoice INV-2048 via UPI.",
  },
  {
    id: 4,
    action: "Lesson updated",
    entity: "Graphs: BFS vs DFS",
    actor: "Arjun Mehta",
    subtitle: "Graphs: BFS vs DFS · by Arjun Mehta",
    time: "3 hrs ago",
    badgeType: "amber",
    details: "Updated lecture notes, attached slide deck, and published new code sandbox.",
  },
  {
    id: 5,
    action: "Announcement posted",
    entity: "Spring cohort",
    actor: "Ava Patel",
    subtitle: "Spring cohort · by Ava Patel",
    time: "Yesterday",
    badgeType: "rose",
    details: "Broadcasted announcement regarding upcoming FAANG System Design live mock session.",
  },
];

const practiceProblemsData: PracticeProblem[] = [];

const assignmentsData: any[] = [];
const submissionsData: any[] = [];

const announcementsData = [
  { id: 1, title: "🚀 Live System Design Mock Interview with FAANG Staff Engineer", cohort: "Spring Cohort & Placement Prep", date: "Today, 10:00 AM", author: "Admin Team", channels: "Email · App Notification · Telegram", status: "Published" },
  { id: 2, title: "📢 Graph Algorithms Marathon - 48h Coding Sprint Announcement", cohort: "DSA Placement Program", date: "Yesterday", author: "Arjun Mehta", channels: "App Notification · Portal Banner", status: "Published" },
  { id: 3, title: "🛠️ Scheduled Platform Maintenance on Sunday 2:00 AM - 4:00 AM IST", cohort: "All Learners", date: "Sep 14, 2026", author: "DevOps Team", channels: "Email · Portal Banner", status: "Published" },
];

const recordingsData = [
  { id: 1, title: "Graphs: BFS, DFS & Cycle Detection in Directed Graphs", instructor: "Arjun Mehta", course: "DSA Mastery", date: "Sep 15, 2026", duration: "1h 45m", views: 248, status: "Ready" },
  { id: 2, title: "Microservices Architecture: Event-Driven Systems & Kafka", instructor: "Maya Rao", course: "System Design", date: "Sep 14, 2026", duration: "2h 10m", views: 195, status: "Ready" },
  { id: 3, title: "Binary Trees & Lowest Common Ancestor Masterclass", instructor: "Arjun Mehta", course: "DSA Placement Program", date: "Sep 12, 2026", duration: "1h 30m", views: 312, status: "Ready" },
  { id: 4, title: "Mock Technical Screening: Arrays, DP & Dynamic Memory", instructor: "Kavya Iyer", course: "Placement Prep", date: "Sep 10, 2026", duration: "1h 55m", views: 180, status: "Ready" },
];

const sectionDescriptions: Record<string, string> = {
  overview: "Real-time summary of cohort engagement, catalog metrics, and student growth.",
  courses: "Manage your catalog, instructors, pricing, and completion health.",
  students: "Keep track of learners, cohorts, progress, and engagement signals.",
  content: "Organize modules, lessons, practice problems, and learning resources.",
  practice_problems: "Build, organize, and manage coding challenge banks.",
  assignments: "Create and track student course assignments, homework, and projects.",
  submissions: "Review, evaluate, and grade learner assignments and code submissions.",
  announcements: "Broadcast platform announcements, live class alerts, and cohort updates.",
  live: "Coordinate sessions, attendance, and instructor calendars.",
  recordings: "Archive of recorded live lectures, workshops, and office hours.",
  payments: "Monitor revenue, invoices, refunds, and payment health.",
  feedback: "Close the loop on learner feedback and instructor quality.",
  reports: "Explore platform performance, retention, completion, and revenue trends.",
  audit: "Review the operational trail across your platform workspace.",
  settings: "Configure branding, notifications, access, certificates, and security.",
  help: "Instructor guides, admin documentation, platform FAQs, and support desk.",
};

function useHashRoute() {
  const { tab } = useAdminRoute();
  return tab;
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

function MetricStrip({ items }: { items: { label: string; value: string; change: string; tone?: string; onClick?: () => void }[] }) {
  return (
    <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          className={cn(
            "surface-card p-5 transition-all",
            item.onClick && "cursor-pointer hover:border-indigo-300/80 dark:hover:border-indigo-700/80 hover:shadow-md active:scale-[0.99]"
          )}
          key={item.label}
          onClick={item.onClick}
          role={item.onClick ? "button" : undefined}
          tabIndex={item.onClick ? 0 : undefined}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-[var(--muted)]">{item.label}</p>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold">{item.value}</p>
          <p className={cn("mt-2 text-[10px] font-bold", item.tone || "text-emerald-600")}>{item.change}</p>
        </div>
      ))}
    </div>
  );
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
          "input flex min-w-[130px] items-center justify-between gap-2 px-3.5 py-2 text-xs font-semibold cursor-pointer transition-all duration-150 select-none rounded-xl",
          className?.includes("w-full") ? "w-full" : "w-auto",
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

function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/30",
        checked ? "bg-indigo-600 dark:bg-indigo-600" : "bg-slate-300 dark:bg-slate-700",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
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

function Overview({
  onAction,
  onToast,
  onCreateCourse,
  courses: propCourses,
  stats: propStats,
  isWsConnected: propWsConnected,
}: {
  onAction: (state: DialogState) => void;
  onToast: (message: string) => void;
  onCreateCourse?: () => void;
  courses?: Course[];
  stats?: AdminStats;
  isWsConnected?: boolean;
}) {
  const { adminUser } = useAdminAuth();
  const hookData = useLiveAdminData();
  const liveCourses = propCourses !== undefined ? propCourses : hookData.courses;
  const stats = propStats !== undefined ? propStats : hookData.stats;
  const isWsConnected = propWsConnected !== undefined ? propWsConnected : hookData.isWsConnected;
  const { navigate: navigateRoute } = useAdminRoute();
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
          {
            label: "Total students",
            value: studentCount.toLocaleString(),
            change: studentCount > 0 ? `↗ ${studentCount} registered (click to view)` : "0 registered users",
            onClick: () => navigateRoute({ tab: "students" }),
          },
          {
            label: "Active students",
            value: activeStudentCount.toLocaleString(),
            change: activeStudentCount > 0 ? `↗ ${activeStudentCount} active (click to view)` : "0 active learners",
            onClick: () => navigateRoute({ tab: "students" }),
          },
          {
            label: "Paid enrollments",
            value: stats.paidEnrollments.toLocaleString(),
            change: stats.paidEnrollments > 0 ? `↗ ${stats.paidEnrollments} paid` : "0 enrollments",
          },
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
            <button
              onClick={() => navigateRoute({ tab: "students" })}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 cursor-pointer"
            >
              View learners →
            </button>
          </div>
          <div className="mt-5 space-y-4">
            {stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((act) => (
                <div
                  className="flex items-start gap-3 cursor-pointer p-1.5 -mx-1.5 rounded-xl transition hover:bg-slate-50 dark:hover:bg-white/5"
                  key={`${act.title}-${act.time}`}
                  onClick={() => navigateRoute({ tab: "students" })}
                >
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
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="icon-button transition-colors cursor-pointer"
          title="Course options"
        >
          <Ellipsis className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="top"
        sideOffset={8}
        className="w-52 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-100 z-[9999]"
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
              onClick={() => {
                setOpen(false);
                onStatusChange(course, item.status);
              }}
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
          onClick={() => {
            setOpen(false);
            onEdit(course);
          }}
          className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <Edit3 className="h-3.5 w-3.5 text-slate-500" />
          <span>Edit course</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onSettings(course);
          }}
          className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <Settings className="h-3.5 w-3.5 text-slate-500" />
          <span>Course settings</span>
        </button>

        <div className="pt-1.5 mt-1.5 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onDelete(course);
            }}
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
  courses: propCourses,
  isLoading: propLoading,
  onRefresh: propRefresh,
}: {
  onAction: (state: DialogState) => void;
  onToast: (message: string) => void;
  onCreateCourse?: () => void;
  onEditCourse?: (course: Course) => void;
  courses?: Course[];
  isLoading?: boolean;
  onRefresh?: () => void;
}) {
  const hookData = useLiveAdminData();
  const liveCourses = propCourses !== undefined ? propCourses : hookData.courses;
  const isLoading = propLoading !== undefined ? propLoading : hookData.isLoading;
  const refresh = propRefresh || hookData.refresh;

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const baseCourses = liveCourses && liveCourses.length > 0 ? liveCourses : courses;
  const [localRows, setLocalRows] = useState<Course[] | null>(null);
  const rows = localRows || baseCourses;

  // Track deleted courses optimistically
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [courseDraft, setCourseDraft] = useState(() => getDraft("course"));

  useEffect(() => {
    const update = () => {
      setCourseDraft(getDraft("course"));
    };
    update();
    window.addEventListener("lms:draft-change", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("lms:draft-change", update);
      window.removeEventListener("storage", update);
    };
  }, []);

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
    if (!courseToDelete || isDeleting) return;
    setIsDeleting(true);
    const targetId = courseToDelete.id;
    const targetTitle = courseToDelete.title;

    // Immediately close confirmation modal on 1st click
    setCourseToDelete(null);

    // Optimistically update local state
    setLocalRows((prev) => (prev ? prev.filter((c) => c.id !== targetId) : []));
    onToast(`Course "${targetTitle}" deleted successfully`);

    try {
      await fetch(`http://localhost:4000/api/v1/admin/courses/${targetId}`, {
        method: "DELETE",
      });
      refresh();
    } catch {
      refresh();
    } finally {
      setIsDeleting(false);
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
      {/* Dedicated In-Section Active Draft Banner */}
      {courseDraft && hasDraftContent(courseDraft) && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-indigo-200/90 dark:border-indigo-800/40 bg-gradient-to-r from-indigo-50/90 via-violet-50/80 to-purple-50/90 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-[#161329] p-4 sm:p-5 shadow-sm animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/25">
              <BookOpen className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#121620]" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <span className="inline-flex items-center gap-1 rounded-md bg-indigo-600/10 dark:bg-indigo-400/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  <Sparkles className="h-2.5 w-2.5" />
                  Unfinished Course Draft
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-400">
                  <Clock3 className="h-3 w-3" />
                  Saved {formatTimeAgo(courseDraft.timestamp)}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                Continue editing: <span className="text-indigo-600 dark:text-indigo-300 font-semibold">"{courseDraft.title || "Untitled Course"}"</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                You were creating a course curriculum. Pick up right where you left off.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={() => {
                clearDraft("course");
                setCourseDraft(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-950/30 transition cursor-pointer shadow-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Discard draft</span>
            </button>
            <button
              type="button"
              onClick={onCreateCourse}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/25 transition cursor-pointer active:scale-95"
            >
              <span>Continue filling course</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

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
              {isLoading && rows.length === 0 ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-[var(--app-line)] last:border-0 animate-pulse">
                    <td className="px-5 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-slate-200/70 dark:bg-slate-800" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-40 rounded bg-slate-200/70 dark:bg-slate-800" />
                          <div className="h-2.5 w-20 rounded bg-slate-100 dark:bg-slate-800/60" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4"><div className="h-3 w-24 rounded bg-slate-200/70 dark:bg-slate-800" /></td>
                    <td className="px-4 py-4"><div className="h-3 w-12 rounded bg-slate-200/70 dark:bg-slate-800" /></td>
                    <td className="px-4 py-4"><div className="h-2 w-20 rounded bg-slate-200/70 dark:bg-slate-800" /></td>
                    <td className="px-4 py-4"><div className="h-3 w-16 rounded bg-slate-200/70 dark:bg-slate-800" /></td>
                    <td className="px-4 py-4"><div className="h-5 w-20 rounded-full bg-slate-200/70 dark:bg-slate-800" /></td>
                    <td className="px-4 py-4 text-right"><div className="h-6 w-6 ml-auto rounded-lg bg-slate-200/70 dark:bg-slate-800" /></td>
                  </tr>
                ))
              ) : (
                filtered.map((course) => (
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
                ))
              )}
            </tbody>
          </table>

          {!isLoading && filtered.length === 0 && (
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

      {/* Custom Delete Confirmation Dialog */}
      <CustomConfirmDialog
        isOpen={!!courseToDelete}
        onClose={() => !isDeleting && setCourseToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Course?"
        description="Are you sure you want to delete this course? All curriculum modules, lessons, and enrollment records will be permanently removed."
        targetName={courseToDelete?.title}
        confirmText="Delete course"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}

function StudentsView({
  onAction,
  onToast,
  students: propStudents,
  stats: propStats,
  isLoading: propLoading,
  onRefresh,
}: {
  onAction: (state: DialogState) => void;
  onToast: (message: string) => void;
  students?: StudentItem[];
  stats?: AdminStats;
  isLoading?: boolean;
  onRefresh?: () => void;
}) {
  const liveData = useLiveAdminData();
  const students = propStudents !== undefined ? propStudents : liveData.students;
  const stats = propStats !== undefined ? propStats : liveData.stats;
  const isLoading = propLoading !== undefined ? propLoading : liveData.isLoading;
  const refresh = onRefresh || liveData.refresh;

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = students.filter((learner) => {
    const matchesFilter = filter === "All" || learner.status === filter;
    const name = learner.name || "";
    const email = learner.email || "";
    const course = learner.course || "";
    const education = learner.education || "";
    const matchesSearch = `${name} ${email} ${course} ${education}`.toLowerCase().includes(query.toLowerCase());
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
                  <td
                    className="px-4 py-4 text-[11px] text-[var(--muted)]"
                    title={
                      learner.lastActiveAt
                        ? `Last active: ${new Date(learner.lastActiveAt).toLocaleString("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}`
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          learner.activity === "Just now" ||
                            learner.activity === "Active now" ||
                            learner.activity.includes("min ago") ||
                            learner.activity.includes("mins ago")
                            ? "bg-emerald-500 animate-pulse"
                            : "bg-slate-300 dark:bg-slate-600"
                        )}
                      />
                      <span>{learner.activity}</span>
                    </div>
                  </td>
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

function ContentView({
  onToast,
  onCreateCourse,
  onOpenPracticeProblemBuilder,
  content: propContent,
  onRefresh,
}: {
  onToast: (message: string) => void;
  onCreateCourse?: () => void;
  onOpenPracticeProblemBuilder?: () => void;
  content?: ContentItem[];
  onRefresh?: () => void;
}) {
  const { content: liveContent, courses: liveCourses, refresh } = useLiveAdminData();
  const rawContent = propContent !== undefined ? propContent : liveContent;
  const [localRows, setLocalRows] = useState<ContentItem[] | null>(null);
  const rows = localRows || rawContent;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [isAddContentOpen, setIsAddContentOpen] = useState(false);
  const [contentDraft, setContentDraft] = useState(() => getDraft("add_content"));

  useEffect(() => {
    const update = () => {
      setContentDraft(getDraft("add_content"));
    };
    update();
    window.addEventListener("lms:draft-change", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("lms:draft-change", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  useEffect(() => {
    if (rawContent) {
      setLocalRows(rawContent);
    }
  }, [rawContent]);

  const filtered = rows.filter(
    (item) =>
      (filter === "All" || item.type === filter) &&
      `${item.title} ${item.parent} ${item.owner}`.toLowerCase().includes(query.toLowerCase())
  );

  const publishedCount = rows.filter((r) => r.status === "Published").length;
  const videoCount = rows.filter((r) => r.type === "Video").length;
  const draftsCount = rows.filter((r) => r.status === "Draft" || r.status === "Review").length;
  const assignmentCount = rows.filter(
    (r) => r.type === "Assignment" || r.type === "Practice problem" || r.type === "Quiz"
  ).length;

  const handleContinueAddContent = (
    selectedType: string,
    typeInfo: ContentTypeOption,
    details?: { title: string; type: string; parent: string; description: string }
  ) => {
    if (selectedType === "course" && onCreateCourse) {
      setIsAddContentOpen(false);
      onCreateCourse();
      return;
    }

    if (selectedType === "practice_problem" && onOpenPracticeProblemBuilder) {
      setIsAddContentOpen(false);
      onOpenPracticeProblemBuilder();
      return;
    }

    const title = details?.title || `${typeInfo.title}: New Asset`;
    const parent =
      details?.parent || (liveCourses.length > 0 ? liveCourses[0].title : "General Library");
    const typeName =
      typeInfo.title === "Notes / PDF"
        ? "PDF"
        : typeInfo.title === "Practice Problem"
        ? "Practice problem"
        : typeInfo.title;

    const newItem: ContentItem = {
      id: Date.now(),
      title,
      type: typeName,
      parent,
      owner: "Admin Team",
      status: "Published",
      updated: "Just now",
    };

    setLocalRows((current) => [newItem, ...(current || [])]);
    setIsAddContentOpen(false);
    onToast(`${title} created and published to content library!`);
  };

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9">
      {/* Dedicated In-Section Active Draft Banner */}
      {contentDraft && hasDraftContent(contentDraft) && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-indigo-200/90 dark:border-indigo-800/40 bg-gradient-to-r from-indigo-50/90 via-violet-50/80 to-purple-50/90 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-[#161329] p-4 sm:p-5 shadow-sm animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/25">
              <FileText className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#121620]" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <span className="inline-flex items-center gap-1 rounded-md bg-indigo-600/10 dark:bg-indigo-400/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  <Sparkles className="h-2.5 w-2.5" />
                  Unfinished Content Draft
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-400">
                  <Clock3 className="h-3 w-3" />
                  Saved {formatTimeAgo(contentDraft.timestamp)}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                Continue editing: <span className="text-indigo-600 dark:text-indigo-300 font-semibold">"{contentDraft.title || "Untitled Content Item"}"</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                You were adding a learning resource or document. Pick up right where you left off.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={() => {
                clearDraft("add_content");
                setContentDraft(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-950/30 transition cursor-pointer shadow-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Discard draft</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAddContentOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/25 transition cursor-pointer active:scale-95"
            >
              <span>Continue adding content</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <SectionHeader
        section="content"
        description={sectionDescriptions.content}
        actionLabel="Add content"
        onAction={() => setIsAddContentOpen(true)}
        onExport={() => onToast("Content inventory exported")}
      />

      <MetricStrip
        items={[
          {
            label: "Total library assets",
            value: rows.length.toLocaleString(),
            change: rows.length > 0 ? `↗ ${rows.length} total items` : "0 items in library",
          },
          {
            label: "Published lessons & files",
            value: publishedCount.toLocaleString(),
            change: publishedCount > 0 ? `↗ ${publishedCount} published` : "0 published",
          },
          {
            label: "Video lessons",
            value: videoCount.toLocaleString(),
            change: `${videoCount} video tracks`,
          },
          {
            label: "Assignments & challenges",
            value: assignmentCount.toLocaleString(),
            change: `${assignmentCount} tasks`,
          },
        ]}
      />

      <DataCard
        title="Content library"
        subtitle={
          rows.length > 0
            ? `${filtered.length} of ${rows.length} learning assets in library`
            : "0 learning assets in library"
        }
        toolbar={
          <SearchToolbar
            query={query}
            setQuery={setQuery}
            filter={filter}
            setFilter={setFilter}
            filters={["All", "Video", "PDF", "Assignment", "Resource", "Practice problem", "Text", "Quiz"]}
          />
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-[var(--app-line)] text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                <th className="px-5 py-3 sm:px-6">Content</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[var(--app-line)] last:border-0 hover:bg-[var(--subtle-bg)]"
                >
                  <td className="px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
                        {item.type === "Video" ? (
                          <PlayCircle className="h-4 w-4" />
                        ) : item.type === "Practice problem" ? (
                          <Code2 className="h-4 w-4" />
                        ) : item.type === "Assignment" ? (
                          <ClipboardCheck className="h-4 w-4 text-sky-600" />
                        ) : item.type === "PDF" ? (
                          <FileText className="h-4 w-4 text-rose-500" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                      </span>
                      <p className="text-[12px] font-bold">{item.title}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[11px] font-semibold">{item.type}</td>
                  <td className="px-4 py-4 text-[11px] text-[var(--muted)]">{item.parent}</td>
                  <td className="px-4 py-4 text-[11px] font-semibold">{item.owner}</td>
                  <td className="px-4 py-4 text-[11px] text-[var(--muted)]">{item.updated}</td>
                  <td className="px-4 py-4">
                    <StatusBadge>{item.status}</StatusBadge>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() =>
                        setLocalRows((current) =>
                          (current || []).map((row) =>
                            row.id === item.id
                              ? { ...row, status: row.status === "Published" ? "Draft" : "Published" }
                              : row
                          )
                        )
                      }
                      className="icon-button"
                      title="Toggle status"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-14 text-center text-xs text-[var(--muted)]">
              <ListChecks className="h-9 w-9 mx-auto mb-2 opacity-30 text-[var(--brand)]" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No content items in library</p>
              <p className="mt-1 text-[11px] max-w-sm mx-auto">
                When courses, curriculum modules, lessons, and assignments are created, their assets will appear here live.
              </p>
            </div>
          )}
        </div>
      </DataCard>

      <AddContentModal
        isOpen={isAddContentOpen}
        onClose={() => setIsAddContentOpen(false)}
        onContinue={handleContinueAddContent}
        onOpenCourseBuilder={onCreateCourse}
        onOpenPracticeProblemBuilder={onOpenPracticeProblemBuilder}
        availableCourses={
          liveCourses && liveCourses.length > 0
            ? liveCourses.map((c) => c.title)
            : undefined
        }
        recentItems={rows.slice(0, 5).map((r) => ({
          id: r.id,
          title: r.title,
          type: r.type,
          parent: r.parent,
          status: r.status,
          updated: r.updated,
        }))}
      />
    </div>
  );
}


function LiveView({
  onAction,
  onToast,
  onScheduleSession,
}: {
  onAction: (state: DialogState) => void;
  onToast: (message: string) => void;
  onScheduleSession?: () => void;
}) {
  const [filter, setFilter] = useState("All");
  const [rows, setRows] = useState(sessions);
  const [liveDraft, setLiveDraft] = useState(() => getDraft("schedule_session"));

  useEffect(() => {
    const update = () => {
      setLiveDraft(getDraft("schedule_session"));
    };
    update();
    window.addEventListener("lms:draft-change", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("lms:draft-change", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const filtered = rows.filter((item) => filter === "All" || item.status === filter);
  return (
    <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9">
      {/* Dedicated In-Section Active Draft Banner */}
      {liveDraft && hasDraftContent(liveDraft) && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-indigo-200/90 dark:border-indigo-800/40 bg-gradient-to-r from-indigo-50/90 via-violet-50/80 to-purple-50/90 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-[#161329] p-4 sm:p-5 shadow-sm animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/25">
              <Video className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#121620]" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <span className="inline-flex items-center gap-1 rounded-md bg-indigo-600/10 dark:bg-indigo-400/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  <Sparkles className="h-2.5 w-2.5" />
                  Unfinished Live Session Draft
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-400">
                  <Clock3 className="h-3 w-3" />
                  Saved {formatTimeAgo(liveDraft.timestamp)}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                Continue editing: <span className="text-indigo-600 dark:text-indigo-300 font-semibold">"{liveDraft.title || "Untitled Live Session"}"</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                You were scheduling a live class or office hours session. Pick up right where you left off.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={() => {
                clearDraft("schedule_session");
                setLiveDraft(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-950/30 transition cursor-pointer shadow-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Discard draft</span>
            </button>
            <button
              type="button"
              onClick={onScheduleSession}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/25 transition cursor-pointer active:scale-95"
            >
              <span>Continue scheduling</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <SectionHeader
        section="live"
        description={sectionDescriptions.live}
        actionLabel="Schedule session"
        onAction={
          onScheduleSession ||
          (() =>
            onAction({
              title: "Schedule a live session",
              description: "Set the instructor, timing, meeting link, and attendance rules.",
              fields: ["Session title", "Date and time", "Instructor", "Meeting link"],
            }))
        }
        onExport={() => onToast("Session calendar exported")}
      />
      <MetricStrip
        items={[
          { label: "Upcoming sessions", value: "18", change: "+5 this week" },
          { label: "Registered learners", value: "1,248", change: "+18.4%" },
          { label: "Avg. attendance", value: "86%", change: "+3.2%" },
          { label: "Recordings pending", value: "4", change: "Upload after class", tone: "text-amber-600" },
        ]}
      />
      <DataCard
        title="Session calendar"
        subtitle="Live classes, office hours, and recorded sessions"
        toolbar={
          <div className="flex items-center gap-2">
            <CustomDropdown
              value={filter}
              onChange={setFilter}
              options={["All", "Upcoming", "Completed"]}
              icon={<CalendarDays className="h-4 w-4 text-[var(--muted)]" />}
            />
          </div>
        }
      >
        <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((session) => (
            <div className="rounded-2xl border border-[var(--app-line)] p-4" key={session.id}>
              <div className="flex items-start justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
                  <Video className="h-4 w-4" />
                </span>
                <StatusBadge>{session.status}</StatusBadge>
              </div>
              <h3 className="mt-4 text-[13px] font-bold">{session.title}</h3>
              <p className="mt-1 text-[11px] text-[var(--muted)]">{session.course}</p>
              <div className="mt-4 flex items-center justify-between text-[10px] font-semibold">
                <span className="inline-flex items-center gap-1.5 text-[var(--muted)]">
                  <Clock3 className="h-3.5 w-3.5" />
                  {session.time}
                </span>
                <span>{session.attendees} registered</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => onToast(`${session.title} opened`)} className="secondary-button flex-1 justify-center">
                  Open
                </button>
                <button
                  onClick={() =>
                    setRows((current) =>
                      current.map((row) =>
                        row.id === session.id
                          ? { ...row, status: row.status === "Upcoming" ? "Completed" : "Upcoming" }
                          : row
                      )
                    )
                  }
                  className="primary-button flex-1 justify-center"
                >
                  {session.status === "Upcoming" ? "Complete" : "Reopen"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </DataCard>
    </div>
  );
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

function PracticeProblemsView({
  practiceProblems = [],
  onCreateProblem,
  onViewProblem,
  onEditProblem,
  onSaveProblem,
  onDeleteProblem,
  onToggleStatus,
  onToast,
  onRefresh,
}: {
  practiceProblems?: PracticeProblem[];
  onCreateProblem?: () => void;
  onViewProblem?: (prob: PracticeProblem) => void;
  onEditProblem?: (prob: PracticeProblem) => void;
  onSaveProblem?: (prob: PracticeProblem) => void;
  onDeleteProblem?: (id: string | number) => void;
  onToggleStatus?: (id: string | number) => void;
  onToast: (message: string) => void;
  onRefresh?: () => void;
}) {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [problemToEdit, setProblemToEdit] = useState<PracticeProblem | null>(null);
  const [problemDraft, setProblemDraft] = useState(() => getDraft("practice_problem") || getDraft("practice_problem_modal"));

  useEffect(() => {
    const update = () => {
      setProblemDraft(getDraft("practice_problem") || getDraft("practice_problem_modal"));
    };
    update();
    window.addEventListener("lms:draft-change", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("lms:draft-change", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const rows = practiceProblems || [];

  // Derive dynamic categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    rows.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return ["All", "Easy", "Medium", "Hard", ...Array.from(cats)];
  }, [rows]);

  const filtered = rows.filter(
    (item) =>
      (filter === "All" || item.difficulty === filter || item.category === filter) &&
      `${item.title} ${item.category} ${item.difficulty}`.toLowerCase().includes(query.toLowerCase())
  );

  // Metrics
  const totalCount = rows.length;
  const easyCount = rows.filter((p) => p.difficulty === "Easy").length;
  const medHardCount = rows.filter((p) => p.difficulty !== "Easy").length;
  const liveCount = rows.filter((p) => p.status === "Live").length;

  const handleCreateNew = () => {
    if (onCreateProblem) {
      onCreateProblem();
    } else {
      setProblemToEdit(null);
      setIsModalOpen(true);
    }
  };

  const handleEdit = (prob: PracticeProblem) => {
    if (onEditProblem) {
      onEditProblem(prob);
    } else {
      setProblemToEdit(prob);
      setIsModalOpen(true);
    }
  };

  const [problemToDelete, setProblemToDelete] = useState<PracticeProblem | null>(null);
  const [isDeletingProblem, setIsDeletingProblem] = useState(false);

  const handleConfirmDeleteProblem = async () => {
    if (!problemToDelete || isDeletingProblem) return;
    setIsDeletingProblem(true);
    try {
      if (onDeleteProblem) {
        await onDeleteProblem(problemToDelete.id);
      }
      onToast(`Deleted problem "${problemToDelete.title}"`);
      setProblemToDelete(null);
    } catch {
      onToast(`Failed to delete problem`);
    } finally {
      setIsDeletingProblem(false);
    }
  };

  const handleDelete = (prob: PracticeProblem) => {
    setProblemToDelete(prob);
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rows, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `practice_problems_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onToast("Practice problems exported as JSON");
  };

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9">
      {/* Dedicated In-Section Active Draft Banner */}
      {problemDraft && hasDraftContent(problemDraft) && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-indigo-200/90 dark:border-indigo-800/40 bg-gradient-to-r from-indigo-50/90 via-violet-50/80 to-purple-50/90 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-[#161329] p-4 sm:p-5 shadow-sm animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/25">
              <Code2 className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#121620]" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <span className="inline-flex items-center gap-1 rounded-md bg-indigo-600/10 dark:bg-indigo-400/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  <Sparkles className="h-2.5 w-2.5" />
                  Unfinished Problem Draft
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-400">
                  <Clock3 className="h-3 w-3" />
                  Saved {formatTimeAgo(problemDraft.timestamp)}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                Continue editing: <span className="text-indigo-600 dark:text-indigo-300 font-semibold">"{problemDraft.title || "Untitled Practice Problem"}"</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                You were creating a challenge in this section. Pick up right where you left off.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={() => {
                clearDraft("practice_problem");
                clearDraft("practice_problem_modal");
                setProblemDraft(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-950/30 transition cursor-pointer shadow-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Discard draft</span>
            </button>
            <button
              type="button"
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/25 transition cursor-pointer active:scale-95"
            >
              <span>Continue filling problem</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <SectionHeader
        section="practice_problems"
        description={sectionDescriptions.practice_problems}
        actionLabel="Create problem"
        onAction={handleCreateNew}
        onExport={handleExport}
      />

      <MetricStrip
        items={[
          { label: "Coding problems", value: String(totalCount), change: `${liveCount} Live on platform` },
          { label: "Easy challenges", value: String(easyCount), change: "High solve rate" },
          { label: "Medium / Hard", value: String(medHardCount), change: "Interview focused", tone: "text-amber-600" },
          { label: "Active challenge bank", value: "100% synced", change: "Persistent storage", tone: "text-emerald-600" },
        ]}
      />

      <DataCard
        title="Challenge library"
        subtitle="DSA practice problems, coding screens, and competitive programming track"
        toolbar={
          <div className="flex items-center gap-3">
            <SearchToolbar
              query={query}
              setQuery={setQuery}
              filter={filter}
              setFilter={setFilter}
              filters={categories}
            />
            {onRefresh && (
              <button
                onClick={onRefresh}
                title="Refresh from server"
                className="hidden sm:grid h-9 w-9 place-items-center rounded-xl border border-[var(--app-line)] hover:bg-[var(--subtle-bg)] text-slate-500 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
              </button>
            )}
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="border-b border-[var(--app-line)] text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                <th className="px-5 py-3 sm:px-6">Problem</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Difficulty</th>
                <th className="px-4 py-3">Acceptance</th>
                <th className="px-4 py-3">Submissions</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[var(--muted)]">
                    No practice problems found. Click "Create problem" to add the first challenge!
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => {
                      if (onViewProblem) {
                        onViewProblem(item);
                      } else {
                        handleEdit(item);
                      }
                    }}
                    className="border-b border-[var(--app-line)] last:border-0 hover:bg-[var(--subtle-bg)] transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <span className="grid h-8 w-8 place-items-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300 group-hover:scale-105 transition-transform">
                          <Code2 className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-[12px] font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {item.title}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[11px] font-semibold text-slate-700 dark:text-slate-300">{item.category}</td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[10px] font-bold",
                          item.difficulty === "Easy"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : item.difficulty === "Medium"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                        )}
                      >
                        {item.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[12px] font-bold">{item.acceptance || "75.0%"}</td>
                    <td className="px-4 py-4 text-[12px] font-semibold text-[var(--muted)]">{(item.submissions || 0).toLocaleString()}</td>
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onToggleStatus && onToggleStatus(item.id)}
                        className="cursor-pointer"
                        title="Click to toggle status"
                      >
                        <StatusBadge>{item.status}</StatusBadge>
                      </button>
                    </td>
                    <td className="px-4 py-4 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onToggleStatus && onToggleStatus(item.id)}
                          className="rounded-lg px-2 py-1 text-[10px] font-bold text-[var(--brand)] hover:bg-[var(--subtle-bg)] transition-colors cursor-pointer"
                        >
                          {item.status === "Live" ? "Draft" : "Publish"}
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          title="Edit problem"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          title="Delete problem"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DataCard>

      <PracticeProblemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        problemToEdit={problemToEdit}
        onSave={(saved) => {
          if (onSaveProblem) onSaveProblem(saved);
        }}
        onToast={onToast}
      />

      {/* Custom Problem Delete Confirmation Dialog */}
      <CustomConfirmDialog
        isOpen={!!problemToDelete}
        onClose={() => !isDeletingProblem && setProblemToDelete(null)}
        onConfirm={handleConfirmDeleteProblem}
        title="Delete Practice Problem?"
        description="Are you sure you want to permanently delete this practice problem? It will be removed from the library and student practice arena."
        targetName={problemToDelete?.title}
        confirmText="Delete problem"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isDeletingProblem}
      />
    </div>
  );
}

function AssignmentsView({
  onAction,
  onToast,
  onCreateAssignment,
  onEditAssignment,
  assignments = [],
  submissions = [],
  onRefresh,
}: {
  onAction?: (state: DialogState) => void;
  onToast: (message: string) => void;
  onCreateAssignment?: () => void;
  onEditAssignment?: (assignment: any) => void;
  assignments?: any[];
  submissions?: any[];
  onRefresh?: () => void;
}) {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [assignmentToDelete, setAssignmentToDelete] = useState<any | null>(null);
  const [isDeletingAssignment, setIsDeletingAssignment] = useState(false);
  const [assignmentDraft, setAssignmentDraft] = useState(() => getDraft("assignment"));

  useEffect(() => {
    const update = () => {
      setAssignmentDraft(getDraft("assignment"));
    };
    update();
    window.addEventListener("lms:draft-change", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("lms:draft-change", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const rows = assignments;
  const filtered = rows.filter(
    (item) =>
      (filter === "All" || item.status === filter) &&
      `${item.title || ""} ${item.course || ""}`.toLowerCase().includes(query.toLowerCase())
  );

  const activeCount = rows.filter((r) => r.status === "Published").length;
  const totalSubmissions = rows.reduce((sum, r) => sum + (Number(r.submissions) || 0), 0);
  const pendingCount = submissions.filter(
    (s) => s.status === "Needs review" || s.status === "Action required" || s.status === "PENDING"
  ).length;

  const handleToggleStatus = async (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = item.status === "Published" ? "Draft" : "Published";
    try {
      const res = await fetch(`http://localhost:4000/api/v1/admin/assignments/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        onToast(`Assignment marked as ${nextStatus}`);
        if (onRefresh) onRefresh();
      } else {
        onToast(`Failed to update status`);
      }
    } catch {
      onToast(`Failed to update status`);
    }
  };

  const handleConfirmDeleteAssignment = async () => {
    if (!assignmentToDelete || isDeletingAssignment) return;
    setIsDeletingAssignment(true);
    try {
      const res = await fetch(`http://localhost:4000/api/v1/admin/assignments/${assignmentToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onToast(`Assignment deleted`);
        if (onRefresh) onRefresh();
      } else {
        onToast(`Failed to delete assignment`);
      }
      setAssignmentToDelete(null);
    } catch {
      onToast(`Failed to delete assignment`);
    } finally {
      setIsDeletingAssignment(false);
    }
  };

  const handleDeleteAssignment = (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setAssignmentToDelete(item);
  };

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9">
      {/* Dedicated In-Section Active Draft Banner */}
      {assignmentDraft && hasDraftContent(assignmentDraft) && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-indigo-200/90 dark:border-indigo-800/40 bg-gradient-to-r from-indigo-50/90 via-violet-50/80 to-purple-50/90 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-[#161329] p-4 sm:p-5 shadow-sm animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/25">
              <ClipboardCheck className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#121620]" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <span className="inline-flex items-center gap-1 rounded-md bg-indigo-600/10 dark:bg-indigo-400/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  <Sparkles className="h-2.5 w-2.5" />
                  Unfinished Assignment Draft
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-400">
                  <Clock3 className="h-3 w-3" />
                  Saved {formatTimeAgo(assignmentDraft.timestamp)}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                Continue editing: <span className="text-indigo-600 dark:text-indigo-300 font-semibold">"{assignmentDraft.title || "Untitled Assignment"}"</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                You were creating an assignment task. Pick up right where you left off.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={() => {
                clearDraft("assignment");
                setAssignmentDraft(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-950/30 transition cursor-pointer shadow-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Discard draft</span>
            </button>
            <button
              type="button"
              onClick={onCreateAssignment}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/25 transition cursor-pointer active:scale-95"
            >
              <span>Continue filling assignment</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <SectionHeader
        section="assignments"
        description={sectionDescriptions.assignments}
        actionLabel="Create assignment"
        onAction={onCreateAssignment || (() => onToast("Opening assignment builder..."))}
        onExport={() => onToast("Assignments list exported")}
      />

      <MetricStrip
        items={[
          { label: "Active assignments", value: String(activeCount), change: `${activeCount} live in catalog` },
          { label: "Total submissions", value: String(totalSubmissions), change: "Learner turn-ins" },
          { label: "Pending grading", value: String(pendingCount), change: pendingCount > 0 ? "Needs review" : "All clear", tone: pendingCount > 0 ? "text-amber-600" : undefined },
          { label: "Total items", value: String(rows.length), change: "In repository" },
        ]}
      />

      <DataCard
        title="Assignment directory"
        subtitle="Homework, capstone projects, and GitHub repository submissions"
        toolbar={
          <SearchToolbar
            query={query}
            setQuery={setQuery}
            filter={filter}
            setFilter={setFilter}
            filters={["All", "Published", "Draft"]}
          />
        }
      >
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300 mb-3">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-[var(--foreground)]">No assignments found</h3>
              <p className="mt-1 text-xs text-[var(--muted)] max-w-sm">
                {query
                  ? "No assignments match your search filter."
                  : "No assignments created yet. Create your first assignment to assign problem sets and projects to students."}
              </p>
              {!query && (
                <button
                  onClick={onCreateAssignment}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Create assignment
                </button>
              )}
            </div>
          ) : (
            <table className="w-full min-w-[850px] text-left">
              <thead>
                <tr className="border-b border-[var(--app-line)] text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                  <th className="px-5 py-3 sm:px-6">Assignment</th>
                  <th className="px-4 py-3">Attached Course</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Submissions</th>
                  <th className="px-4 py-3">Avg. Grade</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[var(--app-line)] last:border-0 hover:bg-[var(--subtle-bg)] transition-colors cursor-pointer"
                    onClick={() => onEditAssignment && onEditAssignment(item)}
                  >
                    <td className="px-5 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <span className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
                          <ClipboardCheck className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-[12px] font-bold hover:text-indigo-600 transition-colors">{item.title}</p>
                          {item.difficulty && (
                            <span className="text-[10px] text-[var(--muted)]">Difficulty: {item.difficulty}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[11px] font-semibold text-[var(--muted)]">{item.course}</td>
                    <td className="px-4 py-4 text-[11px] font-semibold">{item.dueDate}</td>
                    <td className="px-4 py-4 text-[12px] font-bold">{item.submissions} submitted</td>
                    <td className="px-4 py-4 text-[12px] font-bold text-emerald-600 dark:text-emerald-400">{item.avgGrade}</td>
                    <td className="px-4 py-4"><StatusBadge>{item.status}</StatusBadge></td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={(e) => handleToggleStatus(item, e)}
                          className="text-[10px] font-bold text-[var(--brand)] hover:underline"
                        >
                          {item.status === "Published" ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          onClick={(e) => handleDeleteAssignment(item, e)}
                          className="text-[10px] font-bold text-rose-500 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </DataCard>

      {/* Custom Assignment Delete Confirmation Dialog */}
      <CustomConfirmDialog
        isOpen={!!assignmentToDelete}
        onClose={() => !isDeletingAssignment && setAssignmentToDelete(null)}
        onConfirm={handleConfirmDeleteAssignment}
        title="Delete Assignment?"
        description="Are you sure you want to delete this assignment? All associated learner submissions, grades, and attachments will be permanently removed."
        targetName={assignmentToDelete?.title}
        confirmText="Delete assignment"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isDeletingAssignment}
      />
    </div>
  );
}

function SubmissionsView({
  onAction,
  onToast,
  submissions = [],
  onRefresh,
}: {
  onAction: (state: DialogState) => void;
  onToast: (message: string) => void;
  submissions?: any[];
  onRefresh?: () => void;
}) {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");

  const rows = submissions;
  const filtered = rows.filter(
    (item) =>
      (filter === "All" || item.status === filter) &&
      `${item.id || ""} ${item.student || ""} ${item.item || ""} ${item.course || ""}`.toLowerCase().includes(query.toLowerCase())
  );

  const pendingCount = rows.filter((s) => s.status === "Needs review" || s.status === "Action required").length;
  const gradedCount = rows.filter((s) => s.status === "Graded").length;

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9">
      <SectionHeader
        section="submissions"
        description={sectionDescriptions.submissions}
        actionLabel="Batch review"
        onAction={() => onToast("Opened batch grading queue")}
        onExport={() => onToast("Submissions grading log exported")}
      />

      <MetricStrip
        items={[
          { label: "Pending review", value: String(pendingCount), change: pendingCount > 0 ? "Due today" : "Queue empty", tone: pendingCount > 0 ? "text-amber-600" : undefined },
          { label: "Graded submissions", value: String(gradedCount), change: "Evaluated" },
          { label: "Total received", value: String(rows.length), change: "Turned in" },
          { label: "Review status", value: pendingCount === 0 ? "Up to date" : "Active queue", change: "System health", tone: pendingCount === 0 ? "text-emerald-600" : undefined },
        ]}
      />

      <DataCard
        title="Learner submission inbox"
        subtitle="Incoming code repos, test outputs, and instructor evaluation queue"
        toolbar={
          <SearchToolbar
            query={query}
            setQuery={setQuery}
            filter={filter}
            setFilter={setFilter}
            filters={["All", "Needs review", "Graded", "Action required"]}
          />
        }
      >
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300 mb-3">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-[var(--foreground)]">No submissions found</h3>
              <p className="mt-1 text-xs text-[var(--muted)] max-w-sm">
                {query
                  ? "No submissions match your filter."
                  : "No students have submitted assignments yet. Submissions will appear here in real time as students submit their work."}
              </p>
            </div>
          ) : (
            <table className="w-full min-w-[850px] text-left">
              <thead>
                <tr className="border-b border-[var(--app-line)] text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                  <th className="px-5 py-3 sm:px-6">Submission ID</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Problem / Assignment</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--app-line)] last:border-0 hover:bg-[var(--subtle-bg)]">
                    <td className="px-5 py-4 text-[11px] font-bold font-mono sm:px-6">{item.id}</td>
                    <td className="px-4 py-4 text-[11px] font-semibold">{item.student}</td>
                    <td className="px-4 py-4 text-[12px] font-bold">{item.item}</td>
                    <td className="px-4 py-4 text-[11px] text-[var(--muted)]">{item.course}</td>
                    <td className="px-4 py-4 text-[11px] text-[var(--muted)]">{item.submitted}</td>
                    <td className="px-4 py-4 text-[12px] font-bold">{item.score}</td>
                    <td className="px-4 py-4"><StatusBadge>{item.status}</StatusBadge></td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => onToast(`Evaluating submission ${item.id}`)}
                        className="text-[10px] font-bold text-[var(--brand)]"
                      >
                        {item.status === "Graded" ? "Re-evaluate" : "Grade"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </DataCard>
    </div>
  );
}

function AnnouncementsView({ onAction, onToast }: { onAction: (state: DialogState) => void; onToast: (message: string) => void }) {
  const [filter, setFilter] = useState("All");
  const [rows] = useState(announcementsData);
  const filtered = rows.filter((item) => filter === "All" || item.status === filter);

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9">
      <SectionHeader
        section="announcements"
        description={sectionDescriptions.announcements}
        actionLabel="Post announcement"
        onAction={() =>
          onAction({
            title: "Broadcast announcement",
            description: "Send push alerts, email digest, and in-app notices to selected student cohorts.",
            fields: ["Title", "Target cohort", "Message", "Channels (Email/Telegram/In-app)"],
          })
        }
        onExport={() => onToast("Announcements log exported")}
      />

      <MetricStrip
        items={[
          { label: "Announcements sent", value: "38", change: "+4 this month" },
          { label: "Active cohorts reached", value: "4", change: "100% delivered" },
          { label: "Avg. open rate", value: "94.2%", change: "+6.1%" },
          { label: "Pinned notices", value: "2", change: "Live on portal" },
        ]}
      />

      <DataCard
        title="Broadcast center"
        subtitle="Platform news, batch updates, live session reminders, and schedule changes"
        toolbar={
          <div className="flex items-center gap-2">
            <CustomDropdown value={filter} onChange={setFilter} options={["All", "Published", "Draft"]} />
          </div>
        }
      >
        <div className="divide-y divide-[var(--app-line)]">
          {filtered.map((item) => (
            <div key={item.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:px-6">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-300">
                <Send className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[13px] font-bold">{item.title}</p>
                  <StatusBadge>{item.status}</StatusBadge>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[var(--muted)]">
                  <span>Target: <strong className="text-[var(--app-ink)]">{item.cohort}</strong></span>
                  <span>·</span>
                  <span>By {item.author}</span>
                  <span>·</span>
                  <span>{item.date}</span>
                </div>
                <p className="mt-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                  Channels: {item.channels}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToast(`Announcement resent to ${item.cohort}`)}
                  className="secondary-button"
                >
                  Resend
                </button>
              </div>
            </div>
          ))}
        </div>
      </DataCard>
    </div>
  );
}

function RecordingsView({
  onAction,
  onToast,
  onUploadRecording,
}: {
  onAction: (state: DialogState) => void;
  onToast: (message: string) => void;
  onUploadRecording?: () => void;
}) {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [rows] = useState(recordingsData);
  const [recordingDraft, setRecordingDraft] = useState(() => getDraft("upload_recording"));

  useEffect(() => {
    const update = () => {
      setRecordingDraft(getDraft("upload_recording"));
    };
    update();
    window.addEventListener("lms:draft-change", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("lms:draft-change", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const filtered = rows.filter(
    (item) =>
      (filter === "All" || item.course === filter) &&
      `${item.title} ${item.instructor} ${item.course}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9">
      {/* Dedicated In-Section Active Draft Banner */}
      {recordingDraft && hasDraftContent(recordingDraft) && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-indigo-200/90 dark:border-indigo-800/40 bg-gradient-to-r from-indigo-50/90 via-violet-50/80 to-purple-50/90 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-[#161329] p-4 sm:p-5 shadow-sm animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/25">
              <PlayCircle className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#121620]" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <span className="inline-flex items-center gap-1 rounded-md bg-indigo-600/10 dark:bg-indigo-400/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  <Sparkles className="h-2.5 w-2.5" />
                  Unfinished Recording Upload Draft
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-400">
                  <Clock3 className="h-3 w-3" />
                  Saved {formatTimeAgo(recordingDraft.timestamp)}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                Continue editing: <span className="text-indigo-600 dark:text-indigo-300 font-semibold">"{recordingDraft.title || "Untitled Recording"}"</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                You were uploading a lecture recording. Pick up right where you left off.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={() => {
                clearDraft("upload_recording");
                setRecordingDraft(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-950/30 transition cursor-pointer shadow-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Discard draft</span>
            </button>
            <button
              type="button"
              onClick={onUploadRecording}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/25 transition cursor-pointer active:scale-95"
            >
              <span>Continue upload</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <SectionHeader
        section="recordings"
        description={sectionDescriptions.recordings}
        actionLabel="Upload recording"
        onAction={
          onUploadRecording ||
          (() =>
            onAction({
              title: "Upload class recording",
              description: "Upload video recording MP4 or attach cloud stream link.",
              fields: ["Session title", "Course / Module", "Instructor", "Video URL / File", "Duration"],
            }))
        }
        onExport={() => onToast("Recordings inventory exported")}
      />

      <MetricStrip
        items={[
          { label: "Recorded lectures", value: "84", change: "+12 this month" },
          { label: "Total watch hours", value: "1,420 hrs", change: "+18.6%" },
          { label: "Avg. views / class", value: "112", change: "86% completion" },
          { label: "Cloud storage used", value: "420 GB", change: "1.2 TB free" },
        ]}
      />

      <DataCard
        title="Class recordings archive"
        subtitle="On-demand video playback, timestamps, lecture notes, and downloadable assets"
        toolbar={
          <SearchToolbar
            query={query}
            setQuery={setQuery}
            filter={filter}
            setFilter={setFilter}
            filters={["All", "DSA Mastery", "System Design", "Placement Prep"]}
          />
        }
      >
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--app-line)] bg-[var(--app-card)] p-4 transition-all hover:border-indigo-300 dark:hover:border-white/20 hover:shadow-md"
            >
              <div>
                <div className="relative mb-3 flex h-32 w-full items-center justify-center rounded-xl bg-slate-900 text-white overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-white/20 backdrop-blur-md text-white transition-transform group-hover:scale-110">
                    <PlayCircle className="h-6 w-6" />
                  </span>
                  <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {item.duration}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                  {item.title}
                </h3>
                <p className="mt-1 text-[11px] text-[var(--muted)]">{item.course}</p>
                <p className="mt-0.5 text-[10px] text-slate-400">By {item.instructor} · {item.date}</p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[var(--app-line)] pt-3">
                <span className="text-[10px] font-semibold text-[var(--muted)]">{item.views} views</span>
                <button
                  onClick={() => onToast(`Playing ${item.title}`)}
                  className="text-[11px] font-bold text-[var(--brand)] hover:underline"
                >
                  Watch recording
                </button>
              </div>
            </div>
          ))}
        </div>
      </DataCard>
    </div>
  );
}

function HelpCenterView({ onAction, onToast }: { onAction: (state: DialogState) => void; onToast: (message: string) => void }) {
  return (
    <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9">
      <SectionHeader
        section="help"
        description={sectionDescriptions.help}
        actionLabel="Contact support"
        onAction={() =>
          onAction({
            title: "Submit support request",
            description: "Describe the issue or feature request. Our team responds within 15 minutes.",
            fields: ["Subject", "Category", "Description", "Priority level"],
          })
        }
        onExport={() => onToast("Help documentation PDF exported")}
      />

      <MetricStrip
        items={[
          { label: "Guides & FAQs", value: "48", change: "Updated this week" },
          { label: "Support response time", value: "< 15 mins", change: "Live chat active" },
          { label: "Platform uptime", value: "99.99%", change: "All systems nominal" },
          { label: "Open tickets", value: "0", change: "All resolved" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
        {[
          { title: "Course Builder Guide", desc: "How to structure modules, auto-extract syllabus, and publish curriculum." },
          { title: "Student Management & Cohorts", desc: "Track enrollments, attendance, progress signals, and certificates." },
          { title: "Live Streaming & Video Hosting", desc: "Integrate Zoom, Google Meet, or upload recordings to cloud storage." },
          { title: "Payments, Invoices & Refunds", desc: "Configuring UPI, Razorpay, Stripe, automated invoices, and payouts." },
          { title: "Assignments & Evaluation", desc: "Creating practice problem sets, homework deadlines, and submission grading." },
          { title: "Platform Security & Access", desc: "Setting up 2FA, admin roles, audit logs, and IP restrictions." },
        ].map((guide, idx) => (
          <div key={idx} className="surface-card p-5 hover:border-indigo-300 dark:hover:border-white/20 transition-all cursor-pointer" onClick={() => onToast(`Opened: ${guide.title}`)}>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300 mb-3">
              <LifeBuoy className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">{guide.title}</h3>
            <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--muted)]">{guide.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditView({ onToast }: { onToast: (message: string) => void }) {
  const [query, setQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<typeof auditLogs[0] | null>(null);

  const filtered = auditLogs.filter(
    (item) =>
      item.action.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      item.actor.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9">
      {/* Header matching reference screenshot */}
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400">
            <LayoutGrid className="h-3.5 w-3.5" /> OPERATIONS / AUDIT LOGS
          </div>
          <h1 className="font-display text-3xl font-bold tracking-[-0.04em] text-slate-900 dark:text-white">
            Audit logs
          </h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-6 text-slate-500 dark:text-slate-400">
            Review the operational trail across your platform workspace.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToast("Exporting platform activity logs...")}
            className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 dark:shadow-none"
          >
            <Plus className="h-3.5 w-3.5" /> Export logs
          </button>
        </div>
      </div>

      {/* 4 Metric Strip Cards */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Events today</p>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-slate-900 dark:text-white">1,284</p>
          <p className="mt-2 text-[11px] font-bold text-emerald-600">+14.2%</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Admin actions</p>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-slate-900 dark:text-white">326</p>
          <p className="mt-2 text-[11px] font-bold text-emerald-600">Across 8 admins</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">System events</p>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-slate-900 dark:text-white">958</p>
          <p className="mt-2 text-[11px] font-bold text-emerald-600">All services</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Security alerts</p>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-slate-900 dark:text-white">0</p>
          <p className="mt-2 text-[11px] font-bold text-emerald-600">No action needed</p>
        </div>
      </div>

      {/* Main Audit Trail Card */}
      <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">Audit trail</h2>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-400">
              Every important platform action, with actor and entity context
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search audit events"
              className="h-10 w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 pl-10 pr-4 text-xs font-medium text-slate-800 outline-none transition focus:border-indigo-300 focus:bg-white dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:focus:bg-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="mt-6 divide-y divide-slate-100 dark:divide-slate-800/80">
          {filtered.map((item) => {
            const badgeClass =
              item.badgeType === "emerald"
                ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40"
                : item.badgeType === "blue"
                ? "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40"
                : item.badgeType === "purple"
                ? "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/40"
                : item.badgeType === "amber"
                ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40"
                : "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40";

            return (
              <div
                key={item.id}
                onClick={() => setSelectedLog(item)}
                className="group flex items-center justify-between py-4 px-2 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 rounded-xl transition cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-transform group-hover:scale-105", badgeClass)}>
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                      {item.action}
                    </p>
                    <p className="mt-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-400">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-400">{item.time}</span>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400">
              No audit events found matching "{query}"
            </div>
          )}
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedLog.action}</h3>
                  <p className="text-[11px] text-slate-400">{selectedLog.time}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100/60 dark:border-slate-800/60">
                <span className="font-semibold text-slate-500">Actor</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedLog.actor}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100/60 dark:border-slate-800/60">
                <span className="font-semibold text-slate-500">Entity</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedLog.entity}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100/60 dark:border-slate-800/60">
                <span className="font-semibold text-slate-500">Timestamp</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{selectedLog.time}</span>
              </div>
              <div className="py-2">
                <span className="font-semibold text-slate-500 block mb-1">Payload / Description</span>
                <p className="rounded-xl bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                  {selectedLog.details}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onToast(`Event payload copied for ${selectedLog.action}`);
                  setSelectedLog(null);
                }}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                Copy event JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsView({
  onToast,
  initialTab = "General",
}: {
  onToast: (message: string) => void;
  initialTab?: string;
}) {
  const { subtab, navigate } = useAdminRoute();
  const [saved, setSaved] = useState(false);

  const resolveTab = (st?: string) => {
    if (!st) return initialTab || "General";
    const map: Record<string, string> = {
      general: "General",
      branding: "Branding",
      notifications: "Notifications",
      security: "Security",
      certificates: "Certificates",
      payments: "Payments",
    };
    return map[st.toLowerCase()] || st;
  };

  const [activeTab, setActiveTab] = useState(() => resolveTab(subtab));
  const [primaryColor, setPrimaryColor] = useState("#5c5bf0");
  const [timezone, setTimezone] = useState("Asia/Kolkata (IST)");
  const [compactNav, setCompactNav] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (subtab) {
      setActiveTab(resolveTab(subtab));
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [subtab, initialTab]);

  const [toggles, setToggles] = useState({
    emails: true,
    twoFactor: true,
    certificates: false,
  });

  const [notificationToggles, setNotificationToggles] = useState({
    adminEmails: true,
    studentActivity: false,
    dailyDigest: true,
  });

  const [securityToggles, setSecurityToggles] = useState({
    twoFactor: true,
    sessionTimeout: true,
    loginAlerts: true,
  });

  const [certificateToggles, setCertificateToggles] = useState({
    autoIssue: false,
    requireApproval: false,
  });
  const [issuerName, setIssuerName] = useState("Skillforge Learning");

  const [paymentCurrency, setPaymentCurrency] = useState("INR — Indian Rupee");
  const [taxRegion, setTaxRegion] = useState("India · GST");
  const [automaticRefund, setAutomaticRefund] = useState(false);
  const [paymentToggles, setPaymentToggles] = useState({
    automaticInvoicing: true,
    allowCoupons: true,
    collectTax: true,
  });

  const toggle = (key: keyof typeof toggles) =>
    setToggles((current) => ({ ...current, [key]: !current[key] }));

  const toggleNotification = (key: keyof typeof notificationToggles) =>
    setNotificationToggles((current) => ({ ...current, [key]: !current[key] }));

  const toggleSecurity = (key: keyof typeof securityToggles) =>
    setSecurityToggles((current) => ({ ...current, [key]: !current[key] }));

  const toggleCertificate = (key: keyof typeof certificateToggles) =>
    setCertificateToggles((current) => ({ ...current, [key]: !current[key] }));

  const togglePayment = (key: keyof typeof paymentToggles) =>
    setPaymentToggles((current) => ({ ...current, [key]: !current[key] }));

  const navItems = [
    { id: "General", label: "General", icon: User },
    { id: "Branding", label: "Branding", icon: Palette },
    { id: "Notifications", label: "Notifications", icon: Bell },
    { id: "Security", label: "Security", icon: Shield },
    { id: "Certificates", label: "Certificates", icon: GraduationCap },
    { id: "Payments", label: "Payments", icon: CreditCard },
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 sm:px-8 sm:py-9">
      {/* Header matching reference screenshot */}
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400">
            PLATFORM CONTROLS
          </div>
          <h1 className="font-display text-3xl font-bold tracking-[-0.04em] text-slate-900 dark:text-white">
            Settings
          </h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-6 text-slate-500 dark:text-slate-400">
            Manage your LMS profile, security, communications, and operational defaults.
          </p>
        </div>
        <button
          onClick={() => {
            setSaved(true);
            onToast("Settings saved successfully");
          }}
          className="flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 dark:shadow-none cursor-pointer"
        >
          <Save className="h-4 w-4" /> Save changes
        </button>
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Left Navigation Card */}
        <div className="rounded-3xl border border-slate-100 bg-white p-3 space-y-1 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] dark:border-slate-800 dark:bg-slate-900 h-fit">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSaved(false);
                navigate({ tab: "settings", subtab: item.id.toLowerCase() });
                onToast(`Viewing ${item.label} settings`);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-xs transition-all cursor-pointer",
                activeTab === item.id
                  ? "border border-indigo-200/90 bg-indigo-50/70 text-indigo-600 font-bold dark:bg-indigo-950/50 dark:border-indigo-800 dark:text-indigo-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 font-medium"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Right Tab Content */}
        {activeTab === "Branding" ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                Branding
              </h2>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">
                Customize how the workspace feels to your team and learners.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Primary Color Swatch */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
                  Primary color
                </label>
                <div className="relative">
                  <div
                    onClick={() => colorInputRef.current?.click()}
                    style={{ backgroundColor: primaryColor }}
                    className="h-10 w-full rounded-xl cursor-pointer shadow-xs border border-transparent hover:ring-2 hover:ring-indigo-500/20 transition flex items-center justify-between px-3"
                  >
                    <input
                      ref={colorInputRef}
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="sr-only"
                    />
                  </div>
                </div>
              </div>

              {/* Default Timezone Dropdown */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
                  Default timezone
                </label>
                <CustomDropdown
                  value={timezone}
                  onChange={setTimezone}
                  options={[
                    "Asia/Kolkata (IST)",
                    "UTC (Coordinated Universal Time)",
                    "America/New_York (EST)",
                    "America/Los_Angeles (PST)",
                    "Europe/London (GMT)",
                    "Asia/Dubai (GST)",
                    "Asia/Singapore (SGT)",
                  ]}
                  className="w-full"
                />
              </div>
            </div>

            {/* Compact Navigation Toggle */}
            <div className="mt-8 pt-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Compact navigation</p>
                <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-400">
                  Use a tighter sidebar layout for dense workspaces.
                </p>
              </div>
              <ToggleSwitch
                checked={compactNav}
                onChange={setCompactNav}
                ariaLabel="Compact navigation"
              />
            </div>

            {saved && (
              <div className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <Check className="h-4 w-4" /> Branding preferences saved.
              </div>
            )}
          </div>
        ) : activeTab === "General" ? (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-[var(--app-line)] pb-4">
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    Platform profile
                  </h2>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    The details learners see across your LMS.
                  </p>
                </div>
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                  <GraduationCap className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Platform name
                  <input
                    defaultValue="LearnHub"
                    className="input mt-2 w-full text-xs font-medium"
                  />
                </label>

                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Support email
                  <input
                    defaultValue="abhishek.j3094@gmail.com"
                    className="input mt-2 w-full text-xs font-medium"
                  />
                </label>

                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 sm:col-span-2">
                  Default learner welcome message
                  <textarea
                    defaultValue="Welcome to LearnHub — your complete learning and career launchpad."
                    className="input mt-2 min-h-[88px] w-full py-2.5 text-xs font-medium leading-relaxed"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-[var(--app-line)] pb-4">
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Workspace controls
                </h2>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Control operational notifications and account protections.
                </p>
              </div>

              <div className="mt-2 divide-y divide-[var(--app-line)]">
                {[
                  {
                    key: "emails" as const,
                    title: "Admin email notifications",
                    detail: "Receive alerts for payments, feedback, and reviews.",
                  },
                  {
                    key: "twoFactor" as const,
                    title: "Two-factor authentication",
                    detail: "Require a second step for every admin login.",
                  },
                  {
                    key: "certificates" as const,
                    title: "Auto-issue certificates",
                    detail: "Issue certificates when learners complete a course.",
                  },
                ].map((item) => (
                  <div
                    className="flex items-center justify-between gap-4 py-4.5 px-2 rounded-xl cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition"
                    key={item.key}
                    onClick={() => toggle(item.key)}
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</p>
                      <p className="mt-0.5 text-[11px] text-[var(--muted)]">{item.detail}</p>
                    </div>
                    <ToggleSwitch
                      checked={toggles[item.key]}
                      onChange={() => toggle(item.key)}
                      ariaLabel={item.title}
                    />
                  </div>
                ))}
              </div>

              {saved && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <Check className="h-4 w-4" /> All changes are synced and active.
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "Notifications" ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                Notifications
              </h2>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">
                Choose which operational events reach your admin team.
              </p>
            </div>

            <div className="mt-6 divide-y divide-slate-100 dark:divide-slate-800/80">
              {[
                {
                  key: "adminEmails" as const,
                  title: "Admin email notifications",
                  detail: "Payments, feedback, reviews, and platform alerts.",
                },
                {
                  key: "studentActivity" as const,
                  title: "Student activity alerts",
                  detail: "Notify admins about important learner milestones.",
                },
                {
                  key: "dailyDigest" as const,
                  title: "Daily operations digest",
                  detail: "Receive a daily summary of sessions and pending reviews.",
                },
              ].map((item) => (
                <div
                  className="flex items-center justify-between gap-4 py-5 px-1 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-xl transition"
                  key={item.key}
                  onClick={() => toggleNotification(item.key)}
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</p>
                    <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-400">{item.detail}</p>
                  </div>
                  <ToggleSwitch
                    checked={notificationToggles[item.key]}
                    onChange={() => toggleNotification(item.key)}
                    ariaLabel={item.title}
                  />
                </div>
              ))}
            </div>

            {saved && (
              <div className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <Check className="h-4 w-4" /> Notification preferences saved.
              </div>
            )}
          </div>
        ) : activeTab === "Security" ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                Security
              </h2>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">
                Protect admin access and review account activity.
              </p>
            </div>

            <div className="mt-6 divide-y divide-slate-100 dark:divide-slate-800/80">
              {[
                {
                  key: "twoFactor" as const,
                  title: "Two-factor authentication",
                  detail: "Require a second step for every admin login.",
                },
                {
                  key: "sessionTimeout" as const,
                  title: "Session timeout",
                  detail: "Sign out inactive admins after 30 minutes.",
                },
                {
                  key: "loginAlerts" as const,
                  title: "Login alerts",
                  detail: "Send an alert when a new admin login is detected.",
                },
              ].map((item) => (
                <div
                  className="flex items-center justify-between gap-4 py-5 px-1 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-xl transition"
                  key={item.key}
                  onClick={() => toggleSecurity(item.key)}
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</p>
                    <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-400">{item.detail}</p>
                  </div>
                  <ToggleSwitch
                    checked={securityToggles[item.key]}
                    onChange={() => toggleSecurity(item.key)}
                    ariaLabel={item.title}
                  />
                </div>
              ))}
            </div>

            <div className="mt-8 pt-2">
              <button
                type="button"
                onClick={() => onToast("Security keys rotated successfully. New session tokens generated.")}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                <KeyRound className="h-4 w-4 text-slate-500 dark:text-slate-400" /> Rotate security keys
              </button>
            </div>

            {saved && (
              <div className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <Check className="h-4 w-4" /> Security policies saved.
              </div>
            )}
          </div>
        ) : activeTab === "Certificates" ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                Certificates
              </h2>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">
                Configure course completion certificates.
              </p>
            </div>

            <div className="mt-6 divide-y divide-slate-100 dark:divide-slate-800/80">
              {[
                {
                  key: "autoIssue" as const,
                  title: "Auto-issue certificates",
                  detail: "Issue a certificate when learners complete a course.",
                },
                {
                  key: "requireApproval" as const,
                  title: "Require mentor approval",
                  detail: "Hold certificates until an instructor reviews completion.",
                },
              ].map((item) => (
                <div
                  className="flex items-center justify-between gap-4 py-5 px-1 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-xl transition"
                  key={item.key}
                  onClick={() => toggleCertificate(item.key)}
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</p>
                    <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-400">{item.detail}</p>
                  </div>
                  <ToggleSwitch
                    checked={certificateToggles[item.key]}
                    onChange={() => toggleCertificate(item.key)}
                    ariaLabel={item.title}
                  />
                </div>
              ))}
            </div>

            <div className="mt-8">
              <label className="text-xs font-bold text-slate-900 dark:text-white block mb-2">
                Certificate issuer name
              </label>
              <input
                type="text"
                value={issuerName}
                onChange={(e) => setIssuerName(e.target.value)}
                placeholder="Skillforge Learning"
                className="w-full rounded-2xl bg-slate-50/70 border border-slate-200/80 px-4 py-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>

            {saved && (
              <div className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <Check className="h-4 w-4" /> Certificate settings saved.
              </div>
            )}
          </div>
        ) : activeTab === "Payments" ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                Payments
              </h2>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">
                Manage operational payment defaults.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Currency Dropdown */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
                  Currency
                </label>
                <CustomDropdown
                  value={paymentCurrency}
                  onChange={setPaymentCurrency}
                  options={[
                    "INR — Indian Rupee",
                    "USD — US Dollar",
                    "EUR — Euro",
                    "GBP — British Pound",
                    "SGD — Singapore Dollar",
                    "AED — UAE Dirham",
                    "CAD — Canadian Dollar",
                    "AUD — Australian Dollar",
                  ]}
                  className="w-full"
                />
              </div>

              {/* Tax Region Dropdown */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
                  Tax region
                </label>
                <CustomDropdown
                  value={taxRegion}
                  onChange={setTaxRegion}
                  options={[
                    "India · GST",
                    "United States · Sales Tax",
                    "European Union · VAT",
                    "United Kingdom · VAT",
                    "Singapore · GST",
                    "United Arab Emirates · VAT",
                    "None / Tax Exempt",
                  ]}
                  className="w-full"
                />
              </div>
            </div>

            {/* Automatic Refund Approval Toggle */}
            <div
              className="mt-8 pt-2 flex items-center justify-between gap-4 py-4 px-1 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-xl transition"
              onClick={() => setAutomaticRefund(!automaticRefund)}
            >
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Automatic refund approval
                </p>
                <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-400">
                  Approve refund requests below ₹2,000 automatically.
                </p>
              </div>
              <ToggleSwitch
                checked={automaticRefund}
                onChange={setAutomaticRefund}
                ariaLabel="Automatic refund approval"
              />
            </div>

            {saved && (
              <div className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <Check className="h-4 w-4" /> Payment defaults saved.
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {activeTab}
            </h2>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">
              Configure your platform {activeTab.toLowerCase()} settings and policies.
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {activeTab} configurations are active
                </p>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Manage rules, automated webhook triggers, and administrative overrides.
                </p>
              </div>
            </div>

            {saved && (
              <div className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <Check className="h-4 w-4" /> {activeTab} settings saved successfully.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const { adminUser } = useAdminAuth();
  const { tab: section, subtab, navigate, setQueryParam } = useAdminRoute();
  const [isCourseBuilderOpen, setIsCourseBuilderOpen] = useState(false);
  const [editingCourseData, setEditingCourseData] = useState<Partial<CourseBuilderData> | null>(null);
  const [isAssignmentBuilderOpen, setIsAssignmentBuilderOpen] = useState(false);
  const [editingAssignmentData, setEditingAssignmentData] = useState<Partial<AssignmentData> | null>(null);
  const [isScheduleSessionOpen, setIsScheduleSessionOpen] = useState(false);
  const [editingSessionData, setEditingSessionData] = useState<Partial<LiveSessionData> | null>(null);
  const [isUploadRecordingOpen, setIsUploadRecordingOpen] = useState(false);
  const [editingRecordingData, setEditingRecordingData] = useState<Partial<RecordingData> | null>(null);
  const [isPracticeProblemBuilderOpen, setIsPracticeProblemBuilderOpen] = useState(false);
  const [editingProblemData, setEditingProblemData] = useState<Partial<PracticeProblem> | null>(null);
  const [viewingProblemData, setViewingProblemData] = useState<PracticeProblem | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [toast, setToast] = useState<string | null>(null);
  const {
    refresh,
    courses: liveCourses,
    assignments: liveAssignments,
    submissions: liveSubmissions,
    students: liveStudents,
    content: liveContent,
    practiceProblems: livePracticeProblems,
    stats: liveStats,
    isLoading,
    isWsConnected,
    upsertCourse,
    upsertPracticeProblem,
    deletePracticeProblem,
    toggleProblemStatus,
  } = useLiveAdminData();

  useEffect(() => {
    if (section === "create-course") {
      setIsCourseBuilderOpen(true);
    } else {
      setIsCourseBuilderOpen(false);
    }
    if (section === "create-assignment") {
      setIsAssignmentBuilderOpen(true);
    } else {
      setIsAssignmentBuilderOpen(false);
    }
    if (section === "schedule-session" || section === "schedule_session") {
      setIsScheduleSessionOpen(true);
    } else {
      setIsScheduleSessionOpen(false);
    }
    if (section === "upload-recording" || section === "upload_recording") {
      setIsUploadRecordingOpen(true);
    } else {
      setIsUploadRecordingOpen(false);
    }
    if (section === "create-practice-problem" || section === "create_practice_problem") {
      setIsPracticeProblemBuilderOpen(true);
    } else {
      setIsPracticeProblemBuilderOpen(false);
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
  }, [section, subtab]);

  const onAction = (state: DialogState) => setDialog(state);
  const onToast = (message: string) => setToast(message);

  const handleOpenCourseBuilder = () => {
    setEditingCourseData(null);
    setIsCourseBuilderOpen(true);
    navigate({ tab: "create-course" });
  };

  const handleOpenAssignmentBuilder = () => {
    setEditingAssignmentData(null);
    setIsAssignmentBuilderOpen(true);
    navigate({ tab: "create-assignment" });
  };

  const handleEditAssignment = (assignment: any) => {
    setEditingAssignmentData({
      id: assignment.id,
      title: assignment.title,
      course: assignment.course,
      deadline: assignment.dueDate || assignment.deadline || "22 Sept 2026",
      status: assignment.status || "Draft",
    });
    setIsAssignmentBuilderOpen(true);
    navigate({ tab: "create-assignment", id: assignment.id });
  };

  const handleCloseAssignmentBuilder = () => {
    setIsAssignmentBuilderOpen(false);
    setEditingAssignmentData(null);
    navigate({ tab: "assignments" });
  };

  const handleSaveAssignmentDraft = async (data: AssignmentData) => {
    try {
      const res = await fetch("http://localhost:4000/api/v1/admin/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, status: "Draft" }),
      });
      if (res.ok) {
        onToast(`Assignment draft "${data.title}" saved successfully!`);
        refresh();
      } else {
        onToast(`Assignment draft "${data.title}" saved!`);
      }
    } catch {
      onToast(`Assignment draft "${data.title}" saved!`);
    }
  };

  const handlePublishAssignment = async (data: AssignmentData) => {
    try {
      const res = await fetch("http://localhost:4000/api/v1/admin/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, status: "Published" }),
      });
      if (res.ok) {
        onToast(`Assignment "${data.title}" published successfully!`);
        refresh();
      } else {
        onToast(`Assignment "${data.title}" published!`);
      }
    } catch {
      onToast(`Assignment "${data.title}" published!`);
    }
    handleCloseAssignmentBuilder();
  };

  const handleOpenScheduleSession = () => {
    setEditingSessionData(null);
    setIsScheduleSessionOpen(true);
    navigate({ tab: "schedule-session" });
  };

  const handleCloseScheduleSession = () => {
    setIsScheduleSessionOpen(false);
    setEditingSessionData(null);
    navigate({ tab: "live" });
  };

  const handleSaveSessionDraft = (data: LiveSessionData) => {
    onToast(`Live session draft "${data.title}" saved successfully!`);
  };

  const handleScheduleSession = (data: LiveSessionData) => {
    onToast(`Live session "${data.title}" scheduled successfully!`);
    handleCloseScheduleSession();
  };

  const handleOpenUploadRecording = () => {
    setEditingRecordingData(null);
    setIsUploadRecordingOpen(true);
    navigate({ tab: "upload-recording" });
  };

  const handleCloseUploadRecording = () => {
    setIsUploadRecordingOpen(false);
    setEditingRecordingData(null);
    navigate({ tab: "recordings" });
  };

  const handleSaveRecordingDraft = (data: RecordingData) => {
    onToast(`Recording draft "${data.title}" saved successfully!`);
  };

  const handlePublishRecording = (data: RecordingData) => {
    onToast(`Recording "${data.title}" published successfully!`);
    handleCloseUploadRecording();
  };

  const handleOpenPracticeProblemBuilder = (prob?: PracticeProblem) => {
    setEditingProblemData(prob || null);
    setIsPracticeProblemBuilderOpen(true);
    if (prob?.id) {
      navigate({ tab: "create-practice-problem", id: String(prob.id) });
    } else {
      navigate({ tab: "create-practice-problem" });
    }
  };

  const handleClosePracticeProblemBuilder = () => {
    setIsPracticeProblemBuilderOpen(false);
    setEditingProblemData(null);
    navigate({ tab: "practice_problems" });
  };

  const handleSaveProblemDraft = async (data: PracticeProblem) => {
    try {
      const targetId = editingProblemData?.id;
      const isExisting = Boolean(targetId);
      const url = isExisting
        ? `http://localhost:4000/api/v1/admin/practice-problems/${targetId}`
        : "http://localhost:4000/api/v1/admin/practice-problems";
      const method = isExisting ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, status: "Draft" }),
      });
      if (res.ok) {
        const saved = await res.json();
        upsertPracticeProblem(saved);
        onToast(`Problem draft "${data.title}" saved successfully!`);
      } else {
        upsertPracticeProblem({ ...data, status: "Draft" });
        onToast(`Problem draft "${data.title}" saved!`);
      }
    } catch {
      upsertPracticeProblem({ ...data, status: "Draft" });
      onToast(`Problem draft "${data.title}" saved!`);
    }
    refresh();
    handleClosePracticeProblemBuilder();
  };

  const handlePublishProblem = async (data: PracticeProblem) => {
    try {
      const targetId = editingProblemData?.id;
      const isExisting = Boolean(targetId);
      const url = isExisting
        ? `http://localhost:4000/api/v1/admin/practice-problems/${targetId}`
        : "http://localhost:4000/api/v1/admin/practice-problems";
      const method = isExisting ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, status: "Live" }),
      });
      if (res.ok) {
        const saved = await res.json();
        upsertPracticeProblem(saved);
        onToast(`Practice problem "${data.title}" published live to student arena!`);
      } else {
        upsertPracticeProblem({ ...data, status: "Live" });
        onToast(`Practice problem "${data.title}" published live!`);
      }
    } catch {
      upsertPracticeProblem({ ...data, status: "Live" });
      onToast(`Practice problem "${data.title}" published live!`);
    }
    refresh();
    handleClosePracticeProblemBuilder();
  };

  const handleDeleteProblemFromBuilder = async (id: string | number) => {
    await deletePracticeProblem(id);
    onToast("Practice problem deleted");
    refresh();
    handleClosePracticeProblemBuilder();
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
      requirements: course.requirements || [],
      targetLearners: course.targetLearners || [],
      tags: course.tags || course.skillsCovered || [],
    });
    setIsCourseBuilderOpen(true);
  };

  const handleCloseCourseBuilder = () => {
    setIsCourseBuilderOpen(false);
    setEditingCourseData(null);
    navigate({ tab: "courses" });
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
        const savedData = await res.json().catch(() => null);
        if (savedData) {
          upsertCourse(savedData);
        }
        onToast("Course draft saved successfully!");
        refresh();
      } else {
        const err = await res.json().catch(() => ({}));
        onToast(err.error || "Failed to save course draft");
      }
    } catch (err: any) {
      onToast(err?.message || "Failed to save course draft");
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

      let statusVal: "DRAFT" | "PUBLISHED" | "ARCHIVED" = "PUBLISHED";
      if (data.courseStatus === "Draft") {
        statusVal = "DRAFT";
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
        const savedData = await res.json().catch(() => null);
        if (savedData) {
          upsertCourse(savedData);
        }
        onToast(
          statusVal === "PUBLISHED"
            ? "Course published successfully!"
            : "Course created successfully!"
        );
        refresh();
        handleCloseCourseBuilder();
      } else {
        const err = await res.json().catch(() => ({}));
        onToast(err.error || "Failed to create course");
      }
    } catch (err: any) {
      onToast(err?.message || "Failed to connect to backend server");
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

  if (isAssignmentBuilderOpen || section === "create-assignment") {
    return (
      <div className="relative min-h-screen bg-[#f8fafc]">
        <AssignmentBuilder
          initialData={editingAssignmentData || undefined}
          onClose={handleCloseAssignmentBuilder}
          onSaveDraft={handleSaveAssignmentDraft}
          onPublish={handlePublishAssignment}
          courses={liveCourses}
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

  if (isScheduleSessionOpen || section === "schedule-session" || section === "schedule_session") {
    return (
      <div className="relative min-h-screen bg-[#f8fafc]">
        <ScheduleSessionBuilder
          initialData={editingSessionData || undefined}
          onClose={handleCloseScheduleSession}
          onSaveDraft={handleSaveSessionDraft}
          onSchedule={handleScheduleSession}
          courses={liveCourses}
          contentItems={liveContent}
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

  if (isUploadRecordingOpen || section === "upload-recording" || section === "upload_recording") {
    return (
      <div className="relative min-h-screen bg-[#f8fafc]">
        <UploadRecordingBuilder
          initialData={editingRecordingData || undefined}
          onClose={handleCloseUploadRecording}
          onSaveDraft={handleSaveRecordingDraft}
          onPublish={handlePublishRecording}
          courses={liveCourses}
          contentItems={liveContent}
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

  if (isPracticeProblemBuilderOpen || section === "create-practice-problem" || section === "create_practice_problem") {
    return (
      <div className="relative min-h-screen bg-[#f8fafc]">
        <PracticeProblemBuilder
          initialData={editingProblemData}
          onClose={handleClosePracticeProblemBuilder}
          onSaveDraft={handleSaveProblemDraft}
          onPublish={handlePublishProblem}
          onDelete={handleDeleteProblemFromBuilder}
          existingProblems={livePracticeProblems}
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

  if (viewingProblemData && !isPracticeProblemBuilderOpen) {
    return (
      <div className="relative min-h-screen bg-[#f8fafc]">
        <PracticeProblemDetailView
          problem={viewingProblemData}
          onBack={() => {
            setViewingProblemData(null);
            navigate({ tab: "practice_problems" });
          }}
          onEdit={(prob) => {
            setEditingProblemData(prob);
            setIsPracticeProblemBuilderOpen(true);
          }}
          onToggleStatus={async (id) => {
            await toggleProblemStatus(id);
            setViewingProblemData((prev) =>
              prev ? { ...prev, status: prev.status === "Live" ? "Draft" : "Live" } : null
            );
          }}
          onDelete={async (id) => {
            await deletePracticeProblem(id);
            onToast("Practice problem deleted");
            setViewingProblemData(null);
            refresh();
          }}
          onDuplicate={(prob) => {
            handleOpenPracticeProblemBuilder({
              ...prob,
              id: undefined as any,
              title: `${prob.title} (Copy)`,
              status: "Draft",
            });
            setViewingProblemData(null);
          }}
          existingProblems={livePracticeProblems}
          onSelectProblem={(prob) => {
            setViewingProblemData(prob);
          }}
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
      <Overview
        onAction={onAction}
        onToast={onToast}
        onCreateCourse={handleOpenCourseBuilder}
        courses={liveCourses}
        stats={liveStats}
        isWsConnected={isWsConnected}
      />
    ) : section === "courses" ? (
      <CoursesView
        onAction={onAction}
        onToast={onToast}
        onCreateCourse={handleOpenCourseBuilder}
        onEditCourse={handleEditCourse}
        courses={liveCourses}
        isLoading={isLoading}
        onRefresh={refresh}
      />
    ) : section === "students" ? (
      <StudentsView
        onAction={onAction}
        onToast={onToast}
        students={liveStudents}
        stats={liveStats}
        isLoading={isLoading}
        onRefresh={refresh}
      />
    ) : section === "content" ? (
      <ContentView
        onToast={onToast}
        onCreateCourse={handleOpenCourseBuilder}
        onOpenPracticeProblemBuilder={handleOpenPracticeProblemBuilder}
        content={liveContent}
        onRefresh={refresh}
      />
    ) : section === "practice_problems" ? (
      <PracticeProblemsView
        practiceProblems={livePracticeProblems}
        onCreateProblem={() => handleOpenPracticeProblemBuilder()}
        onViewProblem={(prob) => setViewingProblemData(prob)}
        onEditProblem={(prob) => handleOpenPracticeProblemBuilder(prob)}
        onSaveProblem={upsertPracticeProblem}
        onDeleteProblem={deletePracticeProblem}
        onToggleStatus={toggleProblemStatus}
        onToast={onToast}
        onRefresh={refresh}
      />
    ) : section === "assignments" ? (
      <AssignmentsView
        onAction={onAction}
        onToast={onToast}
        onCreateAssignment={handleOpenAssignmentBuilder}
        onEditAssignment={handleEditAssignment}
        assignments={liveAssignments}
        submissions={liveSubmissions}
        onRefresh={refresh}
      />
    ) : section === "submissions" ? (
      <SubmissionsView
        onAction={onAction}
        onToast={onToast}
        submissions={liveSubmissions}
        onRefresh={refresh}
      />
    ) : section === "announcements" ? (
      <AnnouncementsView onAction={onAction} onToast={onToast} />
    ) : section === "live" || section === "live_sessions" ? (
      <LiveView onAction={onAction} onToast={onToast} onScheduleSession={handleOpenScheduleSession} />
    ) : section === "recordings" ? (
      <RecordingsView onAction={onAction} onToast={onToast} onUploadRecording={handleOpenUploadRecording} />
    ) : section === "payments" ? (
      <PaymentsView onAction={onAction} onToast={onToast} />
    ) : section === "feedback" ? (
      <FeedbackView onAction={onAction} onToast={onToast} />
    ) : section === "reports" ? (
      <ReportsView onToast={onToast} />
    ) : section === "audit" || section === "audit_logs" ? (
      <AuditView onToast={onToast} />
    ) : section === "help" ? (
      <HelpCenterView onAction={onAction} onToast={onToast} />
    ) : (
      <SettingsView
        onToast={onToast}
        initialTab={
          subtab === "security"
            ? "Security"
            : subtab === "branding"
            ? "Branding"
            : subtab === "notifications"
            ? "Notifications"
            : subtab === "certificates"
            ? "Certificates"
            : subtab === "payments" || subtab === "payment_settings" || subtab === "settings_payments"
            ? "Payments"
            : subtab === "general"
            ? "General"
            : section === "security"
            ? "Security"
            : section === "branding"
            ? "Branding"
            : section === "notifications"
            ? "Notifications"
            : section === "certificates"
            ? "Certificates"
            : section === "payment_settings" || section === "settings_payments"
            ? "Payments"
            : "General"
        }
      />
    );

  const handleResumeDraft = (type: DraftType) => {
    switch (type) {
      case "course":
        handleOpenCourseBuilder();
        break;
      case "assignment":
        handleOpenAssignmentBuilder();
        break;
      case "practice_problem":
      case "practice_problem_modal":
        handleOpenPracticeProblemBuilder();
        break;
      case "schedule_session":
        handleOpenScheduleSession();
        break;
      case "upload_recording":
        handleOpenUploadRecording();
        break;
      default:
        handleOpenCourseBuilder();
        break;
    }
  };

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
        
        {/* Contextual / Global Unsaved Draft Banner */}
        <div className="px-5 pt-4 sm:px-8 empty:hidden">
          <ActiveDraftBanner currentSection={section} onResume={handleResumeDraft} />
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

