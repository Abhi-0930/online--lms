"use client";
import { useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";
import { createSecureUrl } from "@/lib/urlParams";
import { resolveDisplayName, resolveFirstName, resolveEducationStatus } from "@/lib/nameUtils";
import { initiateRazorpayCheckout } from "@/lib/razorpay";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useLiveCourses, LiveCourseItem } from "@/hooks/useLiveCourses";
import { useAssignments, LiveAssignmentItem } from "@/hooks/useAssignments";
import { useLiveProblems, PublicProblem } from "@/hooks/useLiveProblems";
import StudentProblemArena from "@/components/StudentProblemArena";
import { CompanyLogo } from "@/components/CompanyLogo";

function getSecureHref(path: string, params?: Record<string, any>) {
  if (!path || path === "#" || path.startsWith("http")) return path;
  return createSecureUrl(path, {
    v: path.replace(/^\//, "") || "dashboard",
    ...params,
  });
}
import {
  AlarmClock,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Award,
  BarChart2,
  Bell,
  Bookmark,
  BookOpen,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  Code2,
  Copy,
  CreditCard,
  FileText,
  Flame,
  FolderOpen,
  Github,
  GraduationCap,
  Headphones,
  LayoutDashboard,
  Library,
  LineChart,
  ListChecks,
  LockKeyhole,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Moon,
  Play,
  PlaySquare,
  Plus,
  Search,
  Send,
  Settings2,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Tag,
  Target,
  ThumbsUp,
  Trophy,
  Users,
  Video,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const courseImages = {
  dsa: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=85",
  web: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=85",
  system: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=85",
  database: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=900&q=85",
};

type NavItem = { label: string; href: string; icon: LucideIcon; badge?: string };

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Browse courses", href: "/courses", icon: Library },
  { label: "My learning", href: "/my-courses", icon: BookOpen },
  { label: "Practice problems", href: "/practice", icon: Code2 },
  { label: "Assignments", href: "/assignments", icon: ClipboardCheck },
];

const utilityItems: NavItem[] = [
  { label: "Announcements", href: "/announcements", icon: Bell },
  { label: "Progress", href: "/progress", icon: LineChart },
  { label: "Community", href: "/community", icon: Users },
];



const activity = [
  { icon: Video, title: "Watched lesson", subtitle: "Sliding Window Patterns", time: "12 min ago", color: "blue" },
  { icon: Code2, title: "Solved problem", subtitle: "Valid Parentheses", time: "Yesterday", color: "emerald" },
  { icon: ClipboardCheck, title: "Submitted assignment", subtitle: "Arrays checkpoint", time: "2 days ago", color: "violet" },
  { icon: Trophy, title: "Earned a badge", subtitle: "7 day streak", time: "3 days ago", color: "amber" },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href={getSecureHref("/dashboard")} className="flex items-center gap-3 min-w-0 group">
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-[#3157e8] text-white shadow-[0_8px_18px_rgba(49,87,232,0.3)] transition-transform duration-200 group-hover:-rotate-3">
        <span className="absolute h-4 w-4 rounded-[5px] border-[2px] border-white/90" />
        <span className="absolute h-1.5 w-1.5 rounded-full bg-white" />
      </span>
      {!compact && <span className="font-display text-[17px] font-bold tracking-[-0.03em] text-[#17223d] dark:text-white">codepath<span className="text-[#3157e8]">.</span></span>}
    </Link>
  );
}

function Avatar({ size = "md", name }: { size?: "sm" | "md" | "lg"; name?: string }) {
  const { user } = useAuth();
  const userName = resolveDisplayName(name || user);
  const initials = userName
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "L";
  const sizeClass = size === "lg" ? "h-16 w-16 text-xl" : size === "sm" ? "h-8 w-8 text-[11px]" : "h-10 w-10 text-sm";
  return (
    <span
      suppressHydrationWarning
      className={cx("inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3157e8] via-[#567bf5] to-[#7f5af0] font-semibold text-white ring-2 ring-white dark:ring-[#182036]", sizeClass)}
    >
      {initials}
    </span>
  );
}

function Sidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (value: boolean) => void }) {
  const location = usePathname() || "";
  const { problems: liveProblems } = useLiveProblems();
  const { courses } = useLiveCourses();
  const { enrollments } = useEnrollments();
  const { assignments } = useAssignments();
  const isActive = (href: string) => href === "/" ? location === "/" : location.startsWith(href);

  const dynamicNavItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Browse courses", href: "/courses", icon: Library, badge: courses.length > 0 ? String(courses.length) : undefined },
    { label: "My learning", href: "/my-courses", icon: BookOpen, badge: enrollments.length > 0 ? String(enrollments.length) : undefined },
    { label: "Practice problems", href: "/practice", icon: Code2, badge: liveProblems.length > 0 ? String(liveProblems.length) : undefined },
    { label: "Assignments", href: "/assignments", icon: ClipboardCheck, badge: assignments.length > 0 ? String(assignments.length) : undefined },
  ];

  return (
    <aside className={cx("fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-[#e5e8f0] bg-[#fbfcff] transition-[width] duration-200 dark:border-white/10 dark:bg-[#10172b] lg:flex", collapsed ? "w-[86px]" : "w-[250px]")}>
      <div className={cx("flex h-[78px] items-center border-b border-[#e5e8f0] dark:border-white/10", collapsed ? "justify-center px-3" : "px-6")}>
        <Logo compact={collapsed} />
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto px-3 py-6">
        {!collapsed && <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9aa4bc]">Workspace</p>}
        <nav className="space-y-1">
          {dynamicNavItems.map((item) => <SidebarLink key={item.href} item={item} active={isActive(item.href)} collapsed={collapsed} />)}
        </nav>
        {!collapsed && <p className="mb-3 mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9aa4bc]">Keep going</p>}
        <nav className="space-y-1">
          {utilityItems.map((item) => <SidebarLink key={item.href} item={item} active={isActive(item.href)} collapsed={collapsed} />)}
        </nav>
        {!collapsed && (
          <div className="mt-auto pt-8">
            <div className="relative overflow-hidden rounded-2xl bg-[#17223d] p-4 text-white shadow-[0_16px_30px_rgba(23,34,61,0.18)] dark:bg-[#23315b]">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#3157e8]/30 blur-2xl" />
              <Sparkles className="relative mb-3 h-5 w-5 text-[#ffca63]" />
              <p className="relative text-sm font-semibold">Small steps. Big offers.</p>
              <p className="relative mt-1 text-xs leading-5 text-white/60">Keep your 7-day streak alive.</p>
              <div className="relative mt-4 flex items-center gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => <span key={day} className={cx("h-1.5 flex-1 rounded-full", day < 7 ? "bg-[#ffca63]" : "bg-white/20")} />)}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className={cx("border-t border-[#e5e8f0] dark:border-white/10", collapsed ? "p-3" : "p-4")}>
        <button onClick={() => setCollapsed(!collapsed)} className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold text-[#7c87a4] transition-colors hover:bg-[#eef2ff] hover:text-[#3157e8] dark:hover:bg-white/5">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /> Collapse sidebar</>}
        </button>
      </div>
    </aside>
  );
}

function SidebarLink({ item, active, collapsed }: { item: NavItem; active: boolean; collapsed: boolean }) {
  const Icon = item.icon;
  return <Link href={getSecureHref(item.href)} className={cx("group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150", collapsed ? "justify-center" : "", active ? "bg-[#eaf0ff] text-[#3157e8] dark:bg-[#26345e] dark:text-white" : "text-[#7c87a4] hover:bg-[#f2f5fb] hover:text-[#17223d] dark:hover:bg-white/5 dark:hover:text-white")} title={collapsed ? item.label : undefined}>
    {active && <span className="absolute bottom-2 left-0 top-2 w-0.5 rounded-r-full bg-[#3157e8]" />}
    <Icon className={cx("h-[18px] w-[18px] shrink-0", active ? "stroke-[2.4]" : "stroke-[1.8]")} />
    {!collapsed && <><span className="truncate">{item.label}</span>{item.badge && <span className="ml-auto rounded-md bg-[#dce6ff] px-1.5 py-0.5 text-[10px] text-[#3157e8] dark:bg-[#3157e8]/30 dark:text-white">{item.badge}</span>}</>}
  </Link>;
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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
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
    <div ref={ref} className={cx("relative inline-block text-left", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cx(
          "flex h-10 items-center justify-between gap-2 rounded-xl border border-[#e5e8f0] bg-white px-3 text-xs font-bold text-[#5f6c8c] outline-none transition-all dark:border-white/10 dark:bg-white/5 dark:text-white cursor-pointer select-none",
          open && "ring-2 ring-[#3157e8]/30 border-[#3157e8] shadow-sm"
        )}
      >
        <span className="flex items-center gap-1.5 truncate">
          {icon}
          <span className="truncate">{selectedOption.label}</span>
        </span>
        <ChevronDown
          className={cx(
            "h-3.5 w-3.5 transition-transform duration-200 text-[#9aa4bc] shrink-0",
            open && "rotate-180 text-[#3157e8]"
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[150px] rounded-xl border border-[#e5e8f0] bg-white p-1.5 shadow-xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-100 dark:border-white/10 dark:bg-[#1a2238]">
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
                  className={cx(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition-colors cursor-pointer",
                    isSelected
                      ? "bg-[#eef2ff] font-bold text-[#3157e8] dark:bg-[#3157e8]/20 dark:text-white"
                      : "text-[#5f6c8c] hover:bg-[#f1f3f8] dark:text-slate-200 dark:hover:bg-white/5"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-[#3157e8]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function LearnerProfileDropdown({ displayName, roleName, user, onLogout }: { displayName: string; roleName: string; user: any; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cx(
          "flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-[#eef2ff] dark:hover:bg-white/10 cursor-pointer select-none",
          open && "bg-[#eef2ff] ring-2 ring-[#3157e8]/20 dark:bg-white/10"
        )}
      >
        <Avatar size="sm" name={displayName} />
        <span className="hidden text-left lg:block">
          <span suppressHydrationWarning className="block text-xs font-bold text-[#17223d] dark:text-white truncate max-w-[140px]">{displayName}</span>
          <span suppressHydrationWarning className="block text-[10px] text-[#9aa4bc]">{roleName}</span>
        </span>
        <ChevronDown className={cx("hidden h-3.5 w-3.5 text-[#9aa4bc] transition-transform duration-200 lg:block", open && "rotate-180 text-[#3157e8]")} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 rounded-2xl border border-[#e5e8f0] bg-white p-2 shadow-2xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-100 dark:border-white/10 dark:bg-[#151c30]">
          <div className="flex items-center gap-2.5 border-b border-[#edf0f6] p-2.5 pb-3 dark:border-white/10">
            <Avatar size="sm" name={displayName} />
            <div className="min-w-0 flex-1">
              <p suppressHydrationWarning className="truncate text-xs font-bold text-[#17223d] dark:text-white">{displayName}</p>
              <p suppressHydrationWarning className="truncate text-[10px] text-[#9aa4bc]">{user?.email || "learner@example.com"}</p>
              <span className="mt-1 inline-block rounded bg-[#e4f8ee] px-1.5 py-0.5 text-[9px] font-bold text-[#23a26d]">Active Learner</span>
            </div>
          </div>

          <div className="space-y-0.5 py-1.5 border-b border-[#edf0f6] dark:border-white/10">
            <Link
              href={getSecureHref("/profile")}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-[#5f6c8c] transition hover:bg-[#eef2ff] hover:text-[#3157e8] dark:text-slate-200 dark:hover:bg-white/5"
            >
              <Users className="h-4 w-4 text-[#9aa4bc]" />
              <span>Profile & Goals</span>
            </Link>
            <Link
              href={getSecureHref("/my-courses")}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-[#5f6c8c] transition hover:bg-[#eef2ff] hover:text-[#3157e8] dark:text-slate-200 dark:hover:bg-white/5"
            >
              <BookOpen className="h-4 w-4 text-[#9aa4bc]" />
              <span>My Enrolled Courses</span>
            </Link>
            <Link
              href={getSecureHref("/progress")}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-[#5f6c8c] transition hover:bg-[#eef2ff] hover:text-[#3157e8] dark:text-slate-200 dark:hover:bg-white/5"
            >
              <LineChart className="h-4 w-4 text-[#9aa4bc]" />
              <span>Learning Progress</span>
            </Link>
          </div>

          <div className="pt-1.5">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 cursor-pointer"
            >
              <LockKeyhole className="h-4 w-4 text-rose-500" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Topbar({ onMenu }: { onMenu: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const displayName = resolveDisplayName(user);
  const roleName = resolveEducationStatus(user);

  return <header className="sticky top-0 z-30 flex h-[78px] items-center justify-between border-b border-[#e5e8f0]/90 bg-[#fbfcff]/90 px-4 backdrop-blur-xl dark:border-white/10 dark:bg-[#10172b]/90 sm:px-6 lg:px-8">
    <div className="flex min-w-0 items-center gap-3">
      <button onClick={onMenu} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#5b6788] hover:bg-[#eef2ff] lg:hidden dark:hover:bg-white/10"><Menu className="h-5 w-5" /></button>
      <div className="hidden items-center gap-2 text-sm text-[#9aa4bc] md:flex"><span className="h-2 w-2 rounded-full bg-[#48c58a]" /> Learning space</div>
      <div className="relative hidden w-[260px] lg:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa4bc]" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && toast.info(query ? `Searching for “${query}”` : "Try searching for a course or problem")} placeholder="Search anything..." className="h-10 w-full rounded-xl border border-[#e5e8f0] bg-white pl-9 pr-12 text-sm text-[#17223d] outline-none transition focus:border-[#9db3ff] focus:ring-4 focus:ring-[#3157e8]/10 dark:border-white/10 dark:bg-white/5 dark:text-white" />
        <span className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-md border border-[#e5e8f0] px-1.5 py-0.5 text-[10px] font-semibold text-[#9aa4bc] xl:block dark:border-white/10">⌘ K</span>
      </div>
    </div>
    <div className="flex items-center gap-2 sm:gap-4">
      <Link href={getSecureHref("/notifications")} aria-label="Open notifications" className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#7c87a4] transition hover:bg-[#eef2ff] hover:text-[#3157e8] dark:hover:bg-white/10"><Bell className="h-[18px] w-[18px]" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#ef8354] ring-2 ring-[#fbfcff] dark:ring-[#10172b]" /></Link>
      <button className="hidden h-10 w-10 items-center justify-center rounded-xl text-[#7c87a4] transition hover:bg-[#eef2ff] hover:text-[#3157e8] sm:inline-flex dark:hover:bg-white/10" onClick={toggleTheme}>{theme === "light" ? <Moon className="h-[17px] w-[17px]" /> : <Sun className="h-[17px] w-[17px]" />}</button>
      <div className="hidden h-7 w-px bg-[#e5e8f0] sm:block dark:bg-white/10" />
      <LearnerProfileDropdown displayName={displayName} roleName={roleName} user={user} onLogout={logout} />
    </div>
  </header>;
}

function MobileNav() {
  const location = usePathname() || "";
  const items = [{ label: "Home", href: "/", icon: LayoutDashboard }, { label: "Learn", href: "/my-courses", icon: BookOpen }, { label: "Practice", href: "/practice", icon: Code2 }, { label: "Progress", href: "/progress", icon: LineChart }];
  return <nav className="fixed inset-x-0 bottom-0 z-50 flex h-[72px] items-center justify-around border-t border-[#e5e8f0] bg-[#fbfcff]/95 px-2 pb-1 backdrop-blur-xl dark:border-white/10 dark:bg-[#10172b]/95 lg:hidden">
    {items.map(({ label, href, icon: Icon }) => { const active = href === "/" ? location === "/" : location.startsWith(href); return <Link key={href} href={getSecureHref(href)} className={cx("flex min-w-[62px] flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-bold transition", active ? "text-[#3157e8]" : "text-[#9aa4bc]")}><Icon className={cx("h-[19px] w-[19px]", active && "stroke-[2.5]")} /><span>{label}</span>{active && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#3157e8]" />}</Link> })}
  </nav>;
}

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = usePathname() || "";
  const { user } = useAuth();
  const { problems: liveProblems } = useLiveProblems();
  const { courses } = useLiveCourses();
  const { enrollments } = useEnrollments();
  const { assignments } = useAssignments();
  const displayName = resolveDisplayName(user);
  if (!open) return null;

  const dynamicNavItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Browse courses", href: "/courses", icon: Library, badge: courses.length > 0 ? String(courses.length) : undefined },
    { label: "My learning", href: "/my-courses", icon: BookOpen, badge: enrollments.length > 0 ? String(enrollments.length) : undefined },
    { label: "Practice problems", href: "/practice", icon: Code2, badge: liveProblems.length > 0 ? String(liveProblems.length) : undefined },
    { label: "Assignments", href: "/assignments", icon: ClipboardCheck, badge: assignments.length > 0 ? String(assignments.length) : undefined },
  ];

  return <div className="fixed inset-0 z-[60] lg:hidden"><button aria-label="Close menu" onClick={onClose} className="absolute inset-0 bg-[#17223d]/40 backdrop-blur-sm" /><aside className="relative flex h-full w-[82%] max-w-[310px] flex-col bg-[#fbfcff] shadow-2xl dark:bg-[#10172b]"><div className="flex h-[78px] items-center justify-between border-b border-[#e5e8f0] px-6 dark:border-white/10"><Logo /><button onClick={onClose} className="rounded-lg p-2 text-[#7c87a4] hover:bg-[#eef2ff]"><X className="h-5 w-5" /></button></div><div className="flex-1 px-4 py-6"><p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9aa4bc]">Workspace</p>{[...dynamicNavItems, ...utilityItems].map((item) => <div key={item.href} onClick={onClose}><SidebarLink item={item} active={item.href === "/" ? location === "/" : location.startsWith(item.href)} collapsed={false} /></div>)}</div><div className="border-t border-[#e5e8f0] p-5 dark:border-white/10"><div className="flex items-center gap-3"><Avatar name={displayName} /><div><p suppressHydrationWarning className="text-sm font-bold text-[#17223d] dark:text-white truncate max-w-[180px]">{displayName}</p><p className="text-xs text-[#9aa4bc]">7 day learning streak</p></div></div></div></aside></div>;
}

function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  return <div className="min-h-screen bg-[#f5f7fb] text-[#17223d] dark:bg-[#0d1325] dark:text-white"><Sidebar collapsed={collapsed} setCollapsed={setCollapsed} /><MobileDrawer open={drawer} onClose={() => setDrawer(false)} /><div className={cx("min-h-screen transition-[padding] duration-200", collapsed ? "lg:pl-[86px]" : "lg:pl-[250px]")}><Topbar onMenu={() => setDrawer(true)} /><main className="mx-auto max-w-[1540px] px-4 pb-28 pt-7 sm:px-6 lg:px-8 lg:pb-10">{children}</main></div><MobileNav /></div>;
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#3157e8]">{eyebrow || "Your workspace"}</p><h1 className="font-display text-[27px] font-bold tracking-[-0.045em] text-[#17223d] dark:text-white sm:text-[32px]">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7c87a4]">{description}</p>}</div>{action}</div>;
}

function SectionTitle({ title, link, href = "#" }: { title: string; link?: string; href?: string }) {
  const secureHref = href === "#" ? "#" : getSecureHref(href);
  return <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-[17px] font-bold tracking-[-0.02em] text-[#17223d] dark:text-white">{title}</h2>{link && <Link href={secureHref} className="flex items-center gap-1 text-xs font-bold text-[#3157e8] hover:gap-2 transition-all">{link}<ArrowRight className="h-3.5 w-3.5" /></Link>}</div>;
}

function StatCard({ icon: Icon, value, label, trend, color }: { icon: LucideIcon; value: string; label: string; trend: string; color: "blue" | "violet" | "amber" | "emerald" }) {
  const tones = { blue: "bg-[#eaf0ff] text-[#3157e8] dark:bg-[#3157e8]/20", violet: "bg-[#f0eaff] text-[#7f5af0] dark:bg-[#7f5af0]/20", amber: "bg-[#fff4db] text-[#d68c20] dark:bg-[#d68c20]/20", emerald: "bg-[#e4f8ee] text-[#23a26d] dark:bg-[#23a26d]/20" };
  return <div className="card-surface p-4 sm:p-5"><div className="flex items-start justify-between gap-2"><span className={cx("flex h-9 w-9 items-center justify-center rounded-xl", tones[color])}><Icon className="h-[17px] w-[17px]" /></span><span className="flex items-center gap-1 text-[10px] font-bold text-[#24a06b]" suppressHydrationWarning><ArrowUpRight className="h-3 w-3" />{trend}</span></div><p className="mt-4 font-display text-[26px] font-bold tracking-[-0.05em] text-[#17223d] dark:text-white" suppressHydrationWarning>{value}</p><p className="mt-1 text-xs font-medium text-[#9aa4bc]">{label}</p></div>;
}

function ProgressBar({ value, color = "#3157e8" }: { value: number; color?: string }) {
  return <div className="h-1.5 overflow-hidden rounded-full bg-[#edf0f6] dark:bg-white/10"><span className="block h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, background: color }} /></div>;
}

function Dashboard() {
  const [showAll, setShowAll] = useState(false);
  const { user } = useAuth();
  const { courses, loading: coursesLoading } = useLiveCourses();
  const { enrollments, isEnrolled } = useEnrollments();
  const { submissions: mySubmissions } = useAssignments();
  const { problems: liveProblems } = useLiveProblems();
  const displayName = resolveDisplayName(user);
  const firstName = resolveFirstName(user);
  const solvedCount = liveProblems.filter((p) => p.solved).length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const enrolledCourses = courses.filter((c) =>
    isEnrolled(c.id) ||
    isEnrolled(c.slug) ||
    enrollments.some((e) => e.courseId === c.id || e.course?.id === c.id || e.course?.slug === c.slug)
  );

  const activeDisplayCourses = enrolledCourses.length > 0 ? enrolledCourses : courses;
  const currentFocusCourse = activeDisplayCourses[0];

  return (
    <>
      <div className="mb-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
        <section className="relative min-h-[230px] overflow-hidden rounded-[24px] bg-[#17223d] p-6 text-white shadow-[0_18px_34px_rgba(23,34,61,0.16)] sm:p-8">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border-[34px] border-[#3157e8]/20" />
          <div className="absolute right-28 -bottom-28 h-64 w-64 rounded-full border-[1px] border-white/10" />
          <div className="relative z-10 max-w-xl">
            <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-white/50">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#3157e8] text-white">
                <Sparkles className="h-3.5 w-3.5" />
              </span>{" "}
              {todayFormatted}
            </div>
            <h1 className="font-display text-[28px] font-bold leading-tight tracking-[-0.05em] sm:text-[35px]">
              {greeting}, {firstName}<span className="text-[#ffca63]">.</span>
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/60">
              You’re building momentum. One focused session today can keep your placement prep on track.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href={getSecureHref(enrolledCourses.length > 0 ? "/learn" : "/courses")} className="button-primary">
                <Play className="h-3.5 w-3.5 fill-current" /> {enrolledCourses.length > 0 ? "Resume learning" : "Explore courses"}
              </Link>
              <Link href={getSecureHref("/progress")} className="button-ghost-dark">
                View progress <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
          <div className="absolute bottom-7 right-8 hidden w-40 md:block">
            <div className="mb-2 flex items-end justify-between">
              <span className="text-xs font-semibold text-white/50">Weekly focus</span>
              <span className="font-display text-2xl font-bold">4.2h</span>
            </div>
            <div className="flex h-10 items-end gap-1.5">
              {[45, 65, 32, 85, 58, 76, 25].map((h, i) => (
                <span
                  key={i}
                  className={cx("flex-1 rounded-t-md", i === 6 ? "bg-[#ffca63]" : "bg-white/20")}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[9px] text-white/35">
              <span>M</span>
              <span>W</span>
              <span>F</span>
              <span>S</span>
            </div>
          </div>
        </section>
        <section className="card-surface flex flex-col justify-between p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-[#7c87a4]">Current focus</p>
              <h2 className="mt-1 font-display text-lg font-bold tracking-[-0.03em] text-[#17223d] dark:text-white line-clamp-1">
                {currentFocusCourse ? currentFocusCourse.title : "Get Started"}
              </h2>
            </div>
            <span className="rounded-lg bg-[#eaf0ff] px-2 py-1 text-[10px] font-bold text-[#3157e8] dark:bg-[#3157e8]/20">
              {currentFocusCourse ? `${currentFocusCourse.progress}% done` : "Available"}
            </span>
          </div>
          <div className="mt-6">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#17223d] text-white">
                <Code2 className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#17223d] dark:text-white">
                  {currentFocusCourse ? currentFocusCourse.subtitle || currentFocusCourse.title : "Browse real courses"}
                </p>
                <p className="mt-0.5 text-xs text-[#9aa4bc]">
                  {currentFocusCourse ? `${currentFocusCourse.category} · ${currentFocusCourse.lessons}` : "Self-paced learning"}
                </p>
              </div>
            </div>
            <ProgressBar value={currentFocusCourse ? currentFocusCourse.progress : 0} />
            <div className="mt-2 flex justify-between text-[10px] font-semibold text-[#9aa4bc]">
              <span>{currentFocusCourse ? currentFocusCourse.lessons : "0 modules"}</span>
              <span>{currentFocusCourse ? currentFocusCourse.duration : "Real time"}</span>
            </div>
          </div>
          <Link
            href={getSecureHref(currentFocusCourse ? (isEnrolled(currentFocusCourse.id) ? "/learn" : `/courses?courseId=${currentFocusCourse.id}`) : "/courses")}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f1f4fb] py-3 text-xs font-bold text-[#3157e8] transition hover:bg-[#e6ebfb] dark:bg-white/5 dark:hover:bg-white/10"
          >
            {enrolledCourses.length > 0 ? "Continue lesson" : "Start learning"} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </section>
      </div>
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard
          icon={BookOpen}
          value={String(enrollments.length).padStart(2, "0")}
          label="Courses enrolled"
          trend={enrollments.length > 0 ? `+${enrollments.length} active` : "0 active"}
          color="blue"
        />
        <StatCard
          icon={ClipboardCheck}
          value={String(mySubmissions.length).padStart(2, "0")}
          label="Assignments submitted"
          trend={mySubmissions.length > 0 ? `${mySubmissions.length} submitted` : "0 submitted"}
          color="violet"
        />
        <StatCard
          icon={Code2}
          value={String(solvedCount).padStart(2, "0")}
          label="Problems solved"
          trend={liveProblems.length > 0 ? `${solvedCount} of ${liveProblems.length} solved` : "0 available"}
          color="amber"
        />
        <StatCard icon={Clock3} value="26h 40m" label="Total watch time" trend="+3h 20m" color="emerald" />
      </div>
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(310px,0.75fr)]">
        <section>
          <SectionTitle
            title="Continue your learning"
            link={courses.length > 0 ? "Browse all" : undefined}
            href={getSecureHref("/courses")}
          />
          <div className="grid gap-4 md:grid-cols-2">
            {coursesLoading ? (
              [1, 2].map((n) => (
                <div key={n} className="card-surface h-48 animate-pulse rounded-2xl bg-slate-200/50 dark:bg-white/5" />
              ))
            ) : activeDisplayCourses.length > 0 ? (
              activeDisplayCourses.slice(0, 2).map((c) => (
                <CourseProgressCard key={c.id} course={c} />
              ))
            ) : (
              <div className="card-surface col-span-full p-8 text-center">
                <Library className="mx-auto h-8 w-8 text-[#9aa4bc]" />
                <p className="mt-3 text-sm font-bold text-[#17223d] dark:text-white">No courses available yet</p>
                <p className="mt-1 text-xs text-[#9aa4bc]">Courses added via the Admin Panel will appear here live.</p>
              </div>
            )}
          </div>
          <div className="mt-8">
            <SectionTitle title="Activity timeline" link={showAll ? "Show less" : "View all activity"} href="#" />
            <div className="card-surface divide-y divide-[#edf0f6] px-5 dark:divide-white/10">
              {activity.slice(0, showAll ? 4 : 3).map((item, i) => (
                <ActivityRow key={item.title} item={item} last={i === (showAll ? 3 : 2)} />
              ))}
              <button
                onClick={() => setShowAll(!showAll)}
                className="flex w-full items-center justify-center gap-2 py-4 text-xs font-bold text-[#3157e8]"
              >
                {showAll ? "Show less" : "Load older activity"}
                <ChevronDown className={cx("h-3.5 w-3.5 transition-transform", showAll && "rotate-180")} />
              </button>
            </div>
          </div>
        </section>
        <aside className="space-y-8">
          <UpcomingSessions />
          <AssignmentsWidget />
        </aside>
      </div>
    </>
  );
}

function CourseProgressCard({ course }: { course: LiveCourseItem }) {
  return (
    <Link href={createSecureUrl("/courses", { courseId: course.id })} className="card-surface group overflow-hidden">
      <div className="relative h-[125px] overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-lg bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
          {course.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-display text-sm font-bold text-[#17223d] dark:text-white line-clamp-1">{course.title}</h3>
        <p className="mt-1 text-[11px] text-[#9aa4bc] line-clamp-1">{course.subtitle}</p>
        <div className="mt-4 flex items-center justify-between border-t border-[#edf0f6] pt-3 text-[10px] font-bold text-[#7c87a4] dark:border-white/10">
          <span>{course.level}</span>
          <span className="text-[#3157e8]">{course.price}</span>
        </div>
      </div>
    </Link>
  );
}

function ActivityRow({ item, last }: { item: typeof activity[number]; last: boolean }) { const Icon = item.icon; const colors = { blue: "bg-[#eaf0ff] text-[#3157e8]", emerald: "bg-[#e4f8ee] text-[#23a26d]", violet: "bg-[#f0eaff] text-[#7f5af0]", amber: "bg-[#fff4db] text-[#d68c20]" }; return <div className="flex items-center gap-3 py-4"><span className={cx("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", colors[item.color as keyof typeof colors])}><Icon className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-[#17223d] dark:text-white">{item.title}</p><p className="mt-0.5 truncate text-xs text-[#9aa4bc]">{item.subtitle}</p></div><span className="shrink-0 text-[10px] font-medium text-[#a5aec2]">{item.time}</span>{!last && <span className="sr-only">divider</span>}</div>; }

function UpcomingSessions() {
  const [sessions, setSessions] = useState<any[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("lms_admin_live_sessions");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let isMounted = true;
    const fetchLiveSessions = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/v1/live-sessions");
        if (res.ok) {
          const json = await res.json();
          const items = Array.isArray(json) ? json : json?.data || [];
          if (Array.isArray(items) && isMounted) {
            setSessions(items);
            try {
              localStorage.setItem("lms_admin_live_sessions", JSON.stringify(items));
            } catch {}
            return;
          }
        }
      } catch {
        // Fallback to local storage if backend is unreachable
      }
      if (isMounted) {
        try {
          const saved = localStorage.getItem("lms_admin_live_sessions");
          if (saved) setSessions(JSON.parse(saved));
        } catch {}
      }
    };

    fetchLiveSessions();

    const handleSync = () => {
      fetchLiveSessions();
    };

    window.addEventListener("storage", handleSync);
    window.addEventListener("lms_live_sessions_updated", handleSync);
    const interval = setInterval(fetchLiveSessions, 10000);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("lms_live_sessions_updated", handleSync);
      clearInterval(interval);
    };
  }, []);

  const upcomingList = sessions.filter(
    (s) => s.status !== "Completed" && s.status !== "Draft"
  );

  return (
    <section>
      <SectionTitle
        title="Upcoming sessions"
        link={upcomingList.length > 0 ? "Calendar" : undefined}
        href={getSecureHref("/announcements")}
      />
      <div className="card-surface divide-y divide-[#edf0f6] px-5 dark:divide-white/10">
        {upcomingList.length === 0 ? (
          <div className="py-7 text-center">
            <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Video className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-[#17223d] dark:text-white">No live sessions scheduled</p>
            <p className="mt-0.5 text-[11px] text-[#9aa4bc]">New live classes and workshops will appear here.</p>
          </div>
        ) : (
          upcomingList.slice(0, 4).map((session, idx) => {
            const tones: Array<"blue" | "violet" | "amber"> = ["blue", "violet", "amber"];
            const tone = tones[idx % tones.length];
            const dateObj = session.date ? new Date(session.date) : new Date();
            const dayStr = !isNaN(dateObj.getDate()) ? String(dateObj.getDate()).padStart(2, "0") : "18";
            const monthStr = !isNaN(dateObj.getMonth())
              ? dateObj.toLocaleString("en-US", { month: "short" }).toUpperCase()
              : "SEP";
            const metaStr = `${session.course || "Live Class"}${session.startTime ? ` · ${session.startTime}` : ""}`;
            const isLive = session.status === "Live";

            return (
              <div
                key={session.id || idx}
                onClick={() => {
                  if (session.meetingLink) {
                    window.open(session.meetingLink, "_blank", "noopener,noreferrer");
                    toast.info(`Opening ${session.platform || "Live"} meeting...`);
                  } else {
                    toast.info("Meeting link will be shared by instructor before start.");
                  }
                }}
                className={cx(
                  "group cursor-pointer transition-all duration-150 hover:bg-slate-50/70 dark:hover:bg-white/[0.02] -mx-5 px-5 first:rounded-t-2xl last:rounded-b-2xl"
                )}
              >
                <SessionRow
                  day={dayStr}
                  month={monthStr}
                  title={session.title || "Live Lecture"}
                  meta={metaStr}
                  tone={tone}
                  isLive={isLive}
                  platform={session.platform}
                  hasLink={Boolean(session.meetingLink)}
                />
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

function SessionRow({
  day,
  month,
  title,
  meta,
  tone,
  isLive,
  platform,
  hasLink,
}: {
  day: string;
  month: string;
  title: string;
  meta: string;
  tone: "blue" | "violet" | "amber";
  isLive?: boolean;
  platform?: string;
  hasLink?: boolean;
}) {
  const tones = {
    blue: "bg-[#eaf0ff] text-[#3157e8] dark:bg-indigo-950/50 dark:text-indigo-300",
    violet: "bg-[#f0eaff] text-[#7f5af0] dark:bg-purple-950/50 dark:text-purple-300",
    amber: "bg-[#fff4db] text-[#d68c20] dark:bg-amber-950/50 dark:text-amber-300",
  };
  return (
    <div className="flex items-center gap-3 py-3.5">
      <div className={cx("flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl transition-transform group-hover:scale-105", tones[tone])}>
        <span className="text-[9px] font-extrabold uppercase tracking-wider">{month}</span>
        <span className="font-display text-lg font-bold leading-4">{day}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-bold text-[#17223d] dark:text-white">{title}</p>
          {isLive && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-emerald-600 dark:text-emerald-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              LIVE
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-[#9aa4bc]">
          {meta} {platform ? ` · ${platform}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {hasLink ? (
          <span className="rounded-lg bg-indigo-50 dark:bg-indigo-950/50 px-2 py-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
            Join
          </span>
        ) : null}
        <ChevronRight className="h-4 w-4 shrink-0 text-[#c4cada] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
      </div>
    </div>
  );
}

function AssignmentsWidget() {
  const { assignments, loading } = useAssignments();
  return (
    <section>
      <SectionTitle title="Pending assignments" link={assignments.length > 0 ? "See all" : undefined} href={getSecureHref("/assignments")} />
      <div className="card-surface px-5">
        {loading ? (
          <div className="py-6 space-y-3">
            <div className="h-4 bg-slate-200/60 dark:bg-white/5 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-slate-200/60 dark:bg-white/5 rounded animate-pulse w-1/2" />
          </div>
        ) : assignments.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#9aa4bc]">
            No pending assignments. All caught up!
          </div>
        ) : (
          assignments.slice(0, 3).map((a) => (
            <Link key={a.id} href={getSecureHref("/assignments")}>
              <AssignmentRow
                title={a.title}
                course={a.course}
                due={a.dueDate}
                urgent={a.dueDate.toLowerCase().includes("tomorrow") || a.dueDate.toLowerCase().includes("today")}
              />
            </Link>
          ))
        )}
      </div>
    </section>
  );
}

function AssignmentRow({ title, course, due, urgent }: { title: string; course: string; due: string; urgent?: boolean }) {
  return (
    <div className="flex items-start gap-3 border-b border-[#edf0f6] py-4 last:border-0 dark:border-white/10 hover:opacity-85 transition-opacity">
      <span className={cx("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", urgent ? "bg-[#fff0ed] text-[#ef8354]" : "bg-[#f0f2f8] text-[#7c87a4] dark:bg-white/10")}>
        <ClipboardCheck className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-[#17223d] dark:text-white">{title}</p>
        <p className="mt-1 truncate text-[10px] text-[#9aa4bc]">{course}</p>
      </div>
      <span className={cx("shrink-0 text-[10px] font-bold", urgent ? "text-[#ef8354]" : "text-[#9aa4bc]")}>{due}</span>
    </div>
  );
}

function CoursesPage() {
  const { courses, loading } = useLiveCourses();
  const [category, setCategory] = useState("All courses");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("Popular");

  const categories = useMemo(() => {
    const rawCategories = Array.from(new Set(courses.map((c) => c.category).filter(Boolean)));
    return ["All courses", ...rawCategories];
  }, [courses]);

  const sortOptions = [
    { label: "Sort: Popular", value: "Popular" },
    { label: "Sort: Highest rated", value: "Rating" },
    { label: "Sort: Price (Low to High)", value: "PriceLow" },
    { label: "Sort: Price (High to Low)", value: "PriceHigh" },
  ];

  let filtered = courses.filter(
    (course) =>
      (category === "All courses" || course.category === category) &&
      (course.title.toLowerCase().includes(query.toLowerCase()) ||
        course.description.toLowerCase().includes(query.toLowerCase()) ||
        course.instructor.toLowerCase().includes(query.toLowerCase()))
  );

  if (sortBy === "Rating") {
    filtered = [...filtered].sort((a, b) => Number(b.rating) - Number(a.rating));
  } else if (sortBy === "PriceLow") {
    filtered = [...filtered].sort((a, b) => a.rawPrice - b.rawPrice);
  } else if (sortBy === "PriceHigh") {
    filtered = [...filtered].sort((a, b) => b.rawPrice - a.rawPrice);
  }

  return (
    <>
      <PageHeader
        eyebrow="Explore the library"
        title="Find your next edge"
        description="Curated courses, guided practice, and real interview patterns to help you move with confidence."
        action={
          <button onClick={() => toast.info("Saved courses are coming next")} className="button-secondary">
            <Bookmark className="h-4 w-4" /> Saved courses
          </button>
        }
      />
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#e5e8f0] bg-white p-3 shadow-[0_8px_20px_rgba(23,34,61,0.03)] dark:border-white/10 dark:bg-white/5 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa4bc]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, skills, instructors"
            className="h-10 w-full rounded-xl bg-[#f5f7fb] pl-9 pr-3 text-sm outline-none placeholder:text-[#aeb6c8] focus:ring-4 focus:ring-[#3157e8]/10 dark:bg-white/5 dark:text-white"
          />
        </div>
        <CustomDropdown
          value={sortBy}
          onChange={setSortBy}
          options={sortOptions}
          icon={<ListChecks className="h-4 w-4 text-[#9aa4bc]" />}
        />
      </div>

      {categories.length > 1 && (
        <div className="mb-7 flex gap-2 overflow-x-auto pb-1">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={cx(
                "whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition",
                category === item
                  ? "bg-[#17223d] text-white dark:bg-[#3157e8]"
                  : "bg-white text-[#7c87a4] hover:bg-[#eef2ff] dark:bg-white/5 dark:hover:bg-white/10"
              )}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {loading && courses.length === 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <CourseCardSkeleton key={n} />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
          {!loading && filtered.length === 0 && (
            <div className="card-surface col-span-full p-12 text-center">
              <Library className="mx-auto h-10 w-10 text-[#c4cada]" />
              <p className="mt-3 text-base font-bold text-[#17223d] dark:text-white">
                {courses.length === 0 ? "No courses available yet" : "No matching courses found"}
              </p>
              <p className="mt-1 text-xs text-[#9aa4bc] max-w-sm mx-auto">
                {courses.length === 0
                  ? "Courses created from the Admin Panel will appear here automatically."
                  : "Try clearing your search query or choosing a different category filter."}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function CourseCardSkeleton() {
  return (
    <div className="card-surface flex flex-col justify-between overflow-hidden animate-pulse">
      <div>
        <div className="relative h-44 bg-slate-200/70 dark:bg-white/5">
          <div className="absolute left-4 top-4 flex gap-2">
            <div className="h-5 w-16 rounded-md bg-slate-300/80 dark:bg-white/10" />
            <div className="h-5 w-16 rounded-md bg-slate-300/60 dark:bg-white/10" />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div className="space-y-1.5 flex-1 pr-4">
              <div className="h-2.5 w-20 rounded bg-slate-300/70 dark:bg-white/10" />
              <div className="h-5 w-3/4 rounded-md bg-slate-300/90 dark:bg-white/15" />
            </div>
            <div className="h-4 w-8 rounded bg-slate-300/70 dark:bg-white/10" />
          </div>
        </div>
        <div className="p-4 space-y-2">
          <div className="h-3.5 w-full rounded bg-slate-200/80 dark:bg-white/5" />
          <div className="h-3.5 w-4/5 rounded bg-slate-200/80 dark:bg-white/5" />
          <div className="mt-4 flex items-center gap-3 pt-2">
            <div className="h-3 w-16 rounded bg-slate-200/60 dark:bg-white/5" />
            <div className="h-3 w-16 rounded bg-slate-200/60 dark:bg-white/5" />
            <div className="h-3 w-16 rounded bg-slate-200/60 dark:bg-white/5" />
          </div>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-[#edf0f6] p-4 pt-3 dark:border-white/10">
        <div className="h-6 w-16 rounded-md bg-slate-200/80 dark:bg-white/10" />
        <div className="h-8 w-24 rounded-lg bg-slate-200/80 dark:bg-white/10" />
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: LiveCourseItem }) {
  const router = useRouter();
  const { isEnrolled } = useEnrollments();
  const enrolled = isEnrolled(course.id) || isEnrolled(course.slug);

  const handleEnrollClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (enrolled) {
      router.push(getSecureHref("/learn"));
    } else {
      router.push(createSecureUrl("/courses", { courseId: course.id, v: "checkout" }));
    }
  };

  return (
    <div className="card-surface group flex flex-col justify-between overflow-hidden">
      <Link href={createSecureUrl("/courses", { courseId: course.id })}>
        <div className="relative h-44 overflow-hidden">
          <img
            src={course.image}
            alt={course.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#17223d]/80 via-transparent to-[#17223d]/5" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="rounded-md bg-white/15 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md">
              {course.category}
            </span>
            <span className="rounded-md bg-[#17223d]/40 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md">
              {course.level}
            </span>
            {course.hasDiscount && course.discountPercentage ? (
              <span className="rounded-md bg-emerald-500/90 px-2 py-1 text-[10px] font-bold text-white shadow-sm backdrop-blur-md">
                {course.discountPercentage}% OFF
              </span>
            ) : null}
            {enrolled && (
              <span className="flex items-center gap-1 rounded-md bg-emerald-500/90 px-2 py-1 text-[10px] font-bold text-white shadow-sm backdrop-blur-md">
                <Check className="h-3 w-3 stroke-[3]" /> Enrolled
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toast.success("Course saved to your library");
            }}
            className="absolute right-3 top-3 rounded-lg bg-black/20 p-2 text-white backdrop-blur-md hover:bg-black/40"
          >
            <Bookmark className="h-4 w-4" />
          </button>
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
            <div className="min-w-0 pr-2">
              <p className="text-[10px] text-white/60 truncate">By {course.instructor}</p>
              <p className="mt-1 font-display text-lg font-bold tracking-[-0.04em] line-clamp-1">
                {course.title}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1 text-xs font-bold">
              <Star className="h-3.5 w-3.5 fill-[#ffca63] text-[#ffca63]" />
              {course.rating}
            </div>
          </div>
        </div>
        <div className="p-4">
          <p className="line-clamp-2 min-h-[40px] text-sm leading-5 text-[#7c87a4]">
            {course.subtitle || course.description}
          </p>
          <div className="mt-4 flex items-center gap-3 text-[10px] font-semibold text-[#9aa4bc]">
            <span className="flex items-center gap-1">
              <Video className="h-3.5 w-3.5" />
              {course.lessons}
            </span>
            <span className="flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              {course.duration}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {course.students}
            </span>
          </div>
        </div>
      </Link>
      <div className="mt-auto flex items-center justify-between border-t border-[#edf0f6] p-4 pt-3 dark:border-white/10">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-lg font-bold text-[#17223d] dark:text-white">
            {course.price}
          </span>
          {course.hasDiscount && course.originalPrice && (
            <span className="text-xs text-[#9aa4bc] line-through font-semibold">
              {course.originalPrice}
            </span>
          )}
        </div>
        <button
          onClick={handleEnrollClick}
          className={cx(
            "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition cursor-pointer active:scale-95",
            enrolled
              ? "bg-[#eaf0ff] text-[#3157e8] hover:bg-[#dce6ff] dark:bg-[#3157e8]/20 dark:text-white"
              : "bg-[#0066ff] text-white shadow-sm hover:bg-[#0052cc]"
          )}
        >
          {enrolled ? (
            <>
              <Play className="h-3.5 w-3.5 fill-current" /> Continue
            </>
          ) : (
            <>
              <CreditCard className="h-3.5 w-3.5" /> Enroll now
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function CourseDetail({ courseId }: { courseId: string }) {
  const { courses, loading } = useLiveCourses();
  const { isEnrolled } = useEnrollments();
  const [openModule, setOpenModule] = useState(0);

  const course = courses.find((item) => item.id === courseId || item.slug === courseId);

  if (loading && !course) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-5 w-28 rounded bg-slate-200/80 dark:bg-white/10" />
        <div className="rounded-[26px] bg-slate-200/70 dark:bg-white/5 p-8 sm:p-12 space-y-4">
          <div className="flex gap-2">
            <div className="h-5 w-20 rounded-md bg-slate-300/80 dark:bg-white/10" />
            <div className="h-5 w-20 rounded-md bg-slate-300/80 dark:bg-white/10" />
          </div>
          <div className="h-10 w-2/3 rounded-lg bg-slate-300/90 dark:bg-white/15" />
          <div className="h-4 w-full max-w-xl rounded bg-slate-300/60 dark:bg-white/10" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="card-surface mx-auto max-w-lg p-10 text-center">
        <CircleHelp className="mx-auto h-10 w-10 text-[#3157e8]" />
        <h1 className="mt-4 font-display text-2xl font-bold text-[#17223d] dark:text-white">Course Not Found</h1>
        <p className="mt-2 text-sm leading-6 text-[#7c87a4]">
          This course may have been removed or is no longer available.
        </p>
        <Link href={getSecureHref("/courses")} className="mt-6 inline-flex button-primary">
          Back to all courses
        </Link>
      </div>
    );
  }

  const enrolled = isEnrolled(course.id) || isEnrolled(course.slug);

  const defaultOutcomes = [
    "Think in patterns instead of memorizing solutions",
    "Write clean, testable code under time pressure",
    "Choose the right data structure with confidence",
    "Explain your approach like an interviewer can follow",
  ];

  const outcomesToDisplay = (course.learningOutcomes && course.learningOutcomes.length > 0)
    ? course.learningOutcomes
    : defaultOutcomes;

  const defaultModules = [
    { title: "Getting started with fundamentals", lessons: 6, duration: "42 min", complete: 6 },
    { title: "Core Architecture & Concepts", lessons: 8, duration: "1h 26 min", complete: 8 },
    { title: "Advanced Patterns & Optimization", lessons: 7, duration: "1h 18 min", complete: 3 },
    { title: "Real-world Project Implementation", lessons: 6, duration: "1h 04 min", complete: 0 },
    { title: "Assessment & Interview Preparation", lessons: 9, duration: "2h 10 min", complete: 0 },
  ];

  const modulesToDisplay = (course.modules && course.modules.length > 0)
    ? course.modules
    : defaultModules;

  return (
    <>
      <Link
        href={getSecureHref("/courses")}
        className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-[#7c87a4] hover:text-[#3157e8]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to courses
      </Link>
      <section className="relative overflow-hidden rounded-[26px] bg-[#17223d] p-6 text-white sm:p-10">
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: `url(${course.image})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="absolute inset-0 bg-[#17223d]/85" />
        <div className="relative z-10 max-w-3xl">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-[#3157e8] px-2.5 py-1 text-[10px] font-bold">{course.category}</span>
            <span className="rounded-md bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/70">{course.level}</span>
            {course.hasDiscount && course.discountPercentage ? (
              <span className="rounded-md bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm backdrop-blur-md">
                {course.discountPercentage}% OFF
              </span>
            ) : null}
            {enrolled && (
              <span className="flex items-center gap-1 rounded-md bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                <Check className="h-3.5 w-3.5 stroke-[3]" /> Enrolled & Active
              </span>
            )}
          </div>
          <h1 className="font-display text-3xl font-bold tracking-[-0.05em] sm:text-5xl">{course.title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
            {course.subtitle || course.description}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs font-semibold text-white/65">
            <span className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-[#ffca63] text-[#ffca63]" /> {course.rating} rating
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> {course.students}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" /> {course.duration}
            </span>
            <span className="flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5" /> {course.certificateAvailable !== false ? "Certificate included" : "Self-paced"}
            </span>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {enrolled ? (
              <Link href={getSecureHref("/learn")} className="button-primary">
                <Play className="h-4 w-4 fill-current" /> Continue learning
              </Link>
            ) : (
              <Link
                href={createSecureUrl("/courses", { courseId: course.id, v: "checkout" })}
                className="button-primary flex items-center gap-2 shadow-[0_10px_25px_rgba(49,87,232,0.35)] transition-all hover:scale-[1.02] active:scale-95"
              >
                <CreditCard className="h-4 w-4" />
                Enroll now · {course.price}
              </Link>
            )}
            <button onClick={() => toast.success("You're on the course waitlist")} className="button-ghost-dark">
              <Bookmark className="h-4 w-4" /> Save for later
            </button>
          </div>
        </div>
      </section>
      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_350px]">
        <div className="space-y-8">
          {/* What you'll learn */}
          <section>
            <SectionTitle title="What you’ll learn" />
            <div className="grid gap-3 sm:grid-cols-2">
              {outcomesToDisplay.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 rounded-xl bg-white p-4 text-sm font-semibold leading-5 text-[#52617f] shadow-[0_6px_15px_rgba(23,34,61,0.03)] dark:bg-white/5 dark:text-white/75"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#23a26d]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Skills covered */}
          {course.skillsCovered && course.skillsCovered.length > 0 && (
            <section>
              <SectionTitle title="Skills you’ll gain" />
              <div className="flex flex-wrap gap-2.5">
                {course.skillsCovered.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-white/5 border border-[#edf0f6] dark:border-white/10 px-3.5 py-2 text-xs font-bold text-[#3157e8] dark:text-blue-400 shadow-2xs"
                  >
                    <Tag className="h-3.5 w-3.5 text-[#3157e8] dark:text-blue-400" />
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Course curriculum */}
          <section>
            <SectionTitle title="Course curriculum" />
            <div className="card-surface overflow-hidden">
              {modulesToDisplay.map((module: any, index: number) => (
                <div key={module.id || module.title || index} className="border-b border-[#edf0f6] last:border-0 dark:border-white/10">
                  <button
                    onClick={() => setOpenModule(openModule === index ? -1 : index)}
                    className="flex w-full items-center gap-3 p-4 text-left sm:p-5"
                  >
                    <span
                      className={cx(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                        module.complete && module.complete === module.lessons ? "bg-[#e4f8ee] text-[#23a26d]" : "bg-[#eef2ff] text-[#3157e8]"
                      )}
                    >
                      {module.complete && module.complete === module.lessons ? <Check className="h-4 w-4" /> : String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-[#17223d] dark:text-white">{module.title}</span>
                      <span className="mt-1 block text-xs text-[#9aa4bc]">
                        {module.lessons || 0} lessons · {module.duration || "15 mins"}
                      </span>
                    </span>
                    <ChevronDown
                      className={cx("h-4 w-4 text-[#9aa4bc] transition-transform", openModule === index && "rotate-180")}
                    />
                  </button>
                  {openModule === index && (
                    <div className="border-t border-[#edf0f6] bg-[#fafbfe] px-5 pb-4 pt-3 dark:border-white/10 dark:bg-white/[0.02] space-y-3">
                      {module.topics && Array.isArray(module.topics) && module.topics.length > 0 ? (
                        module.topics.map((top: any, tIdx: number) => (
                          <div key={top.id || tIdx} className="space-y-1.5">
                            {top.title && (
                              <p className="text-xs font-bold text-[#17223d] dark:text-white/90 px-1 pt-1">
                                {top.title}
                              </p>
                            )}
                            {(top.subtopics && top.subtopics.length > 0
                              ? top.subtopics
                              : [{ id: top.id, title: top.title || `Lesson ${tIdx + 1}`, duration: "15 min", type: "Video" }]
                            ).map((sub: any, sIdx: number) => (
                              <Link
                                href={enrolled ? getSecureHref("/learn") : createSecureUrl("/courses", { courseId: course.id, v: "checkout" })}
                                key={sub.id || sIdx}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-[#f0f3fb] dark:hover:bg-white/5 transition"
                              >
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[#9aa4bc] dark:bg-white/10 shadow-2xs">
                                  {sub.type === "Quiz" ? (
                                    <CircleHelp className="h-3 w-3 text-amber-500" />
                                  ) : sub.type === "Assignment" ? (
                                    <FileText className="h-3 w-3 text-violet-500" />
                                  ) : (
                                    <Play className="h-3 w-3 text-[#3157e8]" />
                                  )}
                                </span>
                                <span className="flex-1 text-xs font-semibold text-[#5f6c8c] dark:text-white/70">
                                  {sub.title}
                                </span>
                                <span className="text-[10px] text-[#9aa4bc] shrink-0">{sub.duration || "15 min"}</span>
                              </Link>
                            ))}
                          </div>
                        ))
                      ) : (
                        Array.from({ length: Math.min(module.lessons || 4, 6) }).map((_, lessonIndex) => (
                          <Link
                            href={lessonIndex < (module.complete || 0) || enrolled ? getSecureHref("/learn") : createSecureUrl("/courses", { courseId: course.id, v: "checkout" })}
                            key={lessonIndex}
                            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-[#f0f3fb] dark:hover:bg-white/5"
                          >
                            <span
                              className={cx(
                                "flex h-6 w-6 items-center justify-center rounded-full",
                                lessonIndex < (module.complete || 0)
                                  ? "bg-[#e4f8ee] text-[#23a26d]"
                                  : "bg-white text-[#9aa4bc] dark:bg-white/10"
                              )}
                            >
                              {lessonIndex < (module.complete || 0) ? <Check className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                            </span>
                            <span className="flex-1 text-xs font-semibold text-[#5f6c8c] dark:text-white/70">
                              {module.title} · Lesson {lessonIndex + 1}
                            </span>
                            <span className="text-[10px] text-[#9aa4bc]">{12 + lessonIndex * 4} min</span>
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Prerequisites & Requirements */}
          {(course.prerequisites || (course.requirements && course.requirements.length > 0)) && (
            <section>
              <SectionTitle title="Prerequisites & Requirements" />
              <div className="card-surface p-6 space-y-3">
                {course.requirements && course.requirements.length > 0 ? (
                  <ul className="space-y-2.5 text-xs sm:text-sm font-medium text-[#52617f] dark:text-white/75">
                    {course.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#3157e8]" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs sm:text-sm leading-6 text-[#52617f] dark:text-white/75 whitespace-pre-line">
                    {course.prerequisites}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Who this course is for (Target Audience) */}
          {(course.targetAudience || (course.targetLearners && course.targetLearners.length > 0)) && (
            <section>
              <SectionTitle title="Who this course is for" />
              <div className="card-surface p-6 space-y-3">
                {course.targetLearners && course.targetLearners.length > 0 ? (
                  <ul className="space-y-2.5 text-xs sm:text-sm font-medium text-[#52617f] dark:text-white/75">
                    {course.targetLearners.map((learner, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#23a26d]" />
                        <span>{learner}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs sm:text-sm leading-6 text-[#52617f] dark:text-white/75 whitespace-pre-line">
                    {course.targetAudience}
                  </p>
                )}
              </div>
            </section>
          )}
        </div>
        <aside className="space-y-5">
          {!enrolled ? (
            <div className="card-surface p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9aa4bc]">
                  {course.accessType || "Standard License"}
                </span>
                {course.hasDiscount && course.discountPercentage ? (
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    Save {course.discountPercentage}%
                  </span>
                ) : (
                  <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-bold text-[#3157e8] dark:text-blue-400">
                    Full Access
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold tracking-tight text-[#17223d] dark:text-white">
                  {course.price}
                </span>
                {course.hasDiscount && course.originalPrice && (
                  <span className="text-sm text-[#9aa4bc] line-through font-semibold">
                    {course.originalPrice}
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs leading-5 text-[#7c87a4]">
                Get full access to this course, curriculum modules, assignments, and verified completion certificate.
              </p>
              <Link
                href={createSecureUrl("/courses", { courseId: course.id, v: "checkout" })}
                className="mt-5 w-full button-primary flex items-center justify-center gap-2 py-3 shadow-[0_8px_20px_rgba(49,87,232,0.3)] transition-all hover:scale-[1.02] active:scale-95 text-center cursor-pointer"
              >
                <CreditCard className="h-4 w-4" />
                {course.rawPrice === 0 ? "Enroll for Free" : "Enroll with Razorpay"}
              </Link>
              <div className="mt-5 space-y-2.5 border-t border-[#edf0f6] pt-4 text-[11px] text-[#7c87a4] dark:border-white/10">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#3157e8]" />
                  <span>Razorpay test gateway · Instant activation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#23a26d]" />
                  <span>30-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-[#7f5af0]" />
                  <span>Shareable certificate of completion</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="card-surface p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#7c87a4]">Your progress</p>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">Active</span>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <span className="font-display text-4xl font-bold tracking-[-0.06em] text-[#17223d] dark:text-white">
                  {course.progress}%
                </span>
                <span className="mb-1 text-xs font-semibold text-[#9aa4bc]">0 / {course.lessons}</span>
              </div>
              <div className="mt-4">
                <ProgressBar value={course.progress} />
              </div>
              <p className="mt-4 text-xs leading-5 text-[#9aa4bc]">
                You’re building steady momentum. Keep learning!
              </p>
              <Link
                href={getSecureHref("/progress")}
                className="mt-5 flex items-center justify-center gap-2 text-xs font-bold text-[#3157e8]"
              >
                Open progress report <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
          <div className="card-surface p-5">
            <p className="text-xs font-bold text-[#7c87a4]">Meet your instructor</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#dce6ff] text-sm font-bold text-[#3157e8]">
                {course.instructor.split(" ").map(n => n[0]).slice(0, 2).join("") || "IN"}
              </span>
              <div>
                <p className="text-sm font-bold text-[#17223d] dark:text-white">{course.instructor}</p>
                <p className="mt-0.5 text-xs text-[#9aa4bc]">{course.instructorRole || "Lead Instructor • Mentor"}</p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-5 text-[#7c87a4]">
              Senior engineer & educator dedicated to helping students crack tier-1 product companies and placements.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

function PythonLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M54.5 4.5C28.2 4.5 29.8 15.9 29.8 15.9L29.9 27.7H55.2V31.3H20.1C8.7 31.3 4.5 41.6 4.5 54.4C4.5 67.2 12.3 75.8 22.3 75.8H29.5V64.6C29.5 51.9 39.8 41.8 52.6 41.8H77.9C80.2 41.8 82.1 39.9 82.1 37.6V15.9C82.1 15.9 83.2 4.5 54.5 4.5ZM41.4 12.8C44.1 12.8 46.3 15 46.3 17.7C46.3 20.4 44.1 22.6 41.4 22.6C38.7 22.6 36.5 20.4 36.5 17.7C36.5 15 38.7 12.8 41.4 12.8Z" fill="#387EB8"/>
      <path d="M55.5 105.5C81.8 105.5 80.2 94.1 80.2 94.1L80.1 82.3H54.8V78.7H89.9C101.3 78.7 105.5 68.4 105.5 55.6C105.5 42.8 97.7 34.2 87.7 34.2H80.5V45.4C80.5 58.1 70.2 68.2 57.4 68.2H32.1C29.8 68.2 27.9 70.1 27.9 72.4V94.1C27.9 94.1 26.8 105.5 55.5 105.5ZM68.6 97.2C65.9 97.2 63.7 95 63.7 92.3C63.7 89.6 65.9 87.4 68.6 87.4C71.3 87.4 73.5 89.6 73.5 92.3C73.5 95 71.3 97.2 68.6 97.2Z" fill="#FFE052"/>
    </svg>
  );
}

function EnrollmentCheckoutPage({ courseId }: { courseId: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const { courses, loading } = useLiveCourses();
  const { isEnrolled, refreshEnrollments } = useEnrollments();
  const [isProcessing, setIsProcessing] = useState(false);

  const course = courses.find((item) => item.id === courseId || item.slug === courseId);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#3157e8] border-t-transparent" />
        <p className="mt-3 text-sm text-[#9aa4bc]">Loading checkout details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="card-surface mx-auto max-w-lg p-10 text-center">
        <CircleHelp className="mx-auto h-10 w-10 text-[#3157e8]" />
        <h1 className="mt-4 font-display text-2xl font-bold text-[#17223d] dark:text-white">Course Not Found</h1>
        <p className="mt-2 text-sm leading-6 text-[#7c87a4]">
          We couldn't locate the course you're attempting to checkout with.
        </p>
        <Link href={getSecureHref("/courses")} className="mt-6 inline-flex button-primary">
          Back to all courses
        </Link>
      </div>
    );
  }

  const enrolled = isEnrolled(course.id) || isEnrolled(course.slug);
  const basePriceNumber = course.rawPrice;
  const platformFee = basePriceNumber > 0 ? 10 : 0;
  const totalAmountNumber = basePriceNumber + platformFee;

  const originalPriceNumber = course.rawOriginalPrice || basePriceNumber;
  const discountSavingsNumber = course.hasDiscount && originalPriceNumber > basePriceNumber
    ? originalPriceNumber - basePriceNumber
    : 0;

  const formattedOriginalPrice = `₹ ${originalPriceNumber.toLocaleString("en-IN")}`;
  const formattedDiscountSavings = `- ₹ ${discountSavingsNumber.toLocaleString("en-IN")}`;
  const formattedBasePrice = basePriceNumber === 0 ? "Free" : `₹ ${basePriceNumber.toLocaleString("en-IN")}`;
  const formattedTotalPrice = totalAmountNumber === 0 ? "Free" : `₹ ${totalAmountNumber.toLocaleString("en-IN")}`;

  const handleProceedToPay = async () => {
    if (enrolled) {
      toast.info("You are already enrolled in this course!");
      router.push(getSecureHref("/learn"));
      return;
    }

    if (totalAmountNumber === 0) {
      setIsProcessing(true);
      toast.success("Enrolled successfully for free!");
      refreshEnrollments();
      setTimeout(() => {
        router.push(getSecureHref("/my-courses"));
      }, 800);
      return;
    }

    setIsProcessing(true);
    await initiateRazorpayCheckout({
      courseId: course.id,
      courseTitle: course.title,
      price: totalAmountNumber,
      user,
      onSuccess: () => {
        setIsProcessing(false);
        refreshEnrollments();
        setTimeout(() => {
          router.push(getSecureHref("/my-courses"));
        }, 800);
      },
      onError: () => {
        setIsProcessing(false);
      },
      onCancel: () => {
        setIsProcessing(false);
      },
    });
  };

  return (
    <div className="mx-auto max-w-5xl py-2">
      {/* Back to Course button */}
      <Link
        href={createSecureUrl("/courses", { courseId: course.id })}
        className="mb-4 inline-flex items-center gap-2 text-xs font-bold text-[#64748b] hover:text-[#0066ff] dark:text-slate-400 dark:hover:text-blue-400 transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Course
      </Link>

      {/* Page Heading */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold tracking-[-0.04em] text-[#0f172a] dark:text-white sm:text-4xl">
          Confirm Your Enrollment
        </h1>
        <p className="mt-1.5 text-sm text-[#64748b] dark:text-slate-400">
          Review your course and payment details before proceeding.
        </p>
      </div>

      {/* 2-Column Responsive Card Grid */}
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] items-start">
        {/* Left Column: Course Details */}
        <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 sm:p-7 shadow-sm dark:border-white/10 dark:bg-white/5 space-y-6">
          <h2 className="font-display text-lg font-bold text-[#0f172a] dark:text-white">
            Course Details
          </h2>

          {/* Course Banner Block */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Dark Styled Thumbnail Badge */}
            <div className="relative flex h-24 w-36 shrink-0 flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br from-[#0c1535] via-[#14234d] to-[#1e346f] p-3 text-white shadow-md">
              <div className="absolute -right-4 -bottom-4 h-16 w-16 rounded-full bg-blue-500/20 blur-xl" />
              <div>
                <p className="font-display text-lg font-black leading-tight tracking-tight line-clamp-1">
                  {course.category}
                </p>
                <p className="text-[10px] font-medium text-white/80 line-clamp-1">
                  {course.title}
                </p>
              </div>
              <div className="flex items-center justify-end">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/15 backdrop-blur-sm">
                  <Code2 className="h-3.5 w-3.5 text-yellow-400" />
                </span>
              </div>
            </div>

            {/* Course Meta Info */}
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-base font-bold text-[#0f172a] dark:text-white line-clamp-1">
                {course.title}
              </h3>
              <p className="mt-1 text-xs leading-5 text-[#64748b] dark:text-slate-400 line-clamp-2">
                {course.subtitle || course.description}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-[#64748b] dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <BarChart2 className="h-3.5 w-3.5 text-[#0066ff]" />
                  {course.level || "Beginner to Advanced"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5 text-[#0066ff]" />
                  {course.duration || "Self-paced"}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-[#f1f5f9] dark:border-white/10" />

          {/* Instructor Section */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] dark:text-slate-400">
              Instructor
            </p>
            <div className="mt-3 flex items-center gap-3.5">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-white bg-[#eff6ff] shadow-sm dark:border-slate-800">
                <img
                  src={course.instructorAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"}
                  alt={course.instructor || "Platform Admin"}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-sm font-bold text-[#0f172a] dark:text-white">
                  {course.instructor || "Platform Admin"}
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#1877f2] text-white">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                </p>
                <p className="text-xs text-[#64748b] dark:text-slate-400">
                  {course.instructorRole || "Lead Instructor • Mentor"}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-[#f1f5f9] dark:border-white/10" />

          {/* What you'll get */}
          <div>
            <p className="text-sm font-bold text-[#0f172a] dark:text-white">
              What you’ll get
            </p>
            <div className="mt-3 flex flex-wrap gap-2.5">
              <div className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2 text-xs font-semibold text-[#334155] dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                <PlaySquare className="h-4 w-4 text-[#475569] dark:text-slate-300" />
                Recorded Sessions
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2 text-xs font-semibold text-[#334155] dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                <FileText className="h-4 w-4 text-[#475569] dark:text-slate-300" />
                Study Notes
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2 text-xs font-semibold text-[#334155] dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                <Code2 className="h-4 w-4 text-[#475569] dark:text-slate-300" />
                Practice Problems
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Breakdown */}
        <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 sm:p-7 shadow-sm dark:border-white/10 dark:bg-white/5 space-y-6">
          <h2 className="font-display text-lg font-bold text-[#0f172a] dark:text-white">
            Payment Breakdown
          </h2>

          {/* Pricing Breakdown Lines */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between text-[#64748b] dark:text-slate-400">
              <span>Course Price</span>
              <span className="font-semibold text-[#0f172a] dark:text-white">{formattedOriginalPrice}</span>
            </div>
            {discountSavingsNumber > 0 && (
              <div className="flex items-center justify-between text-[#64748b] dark:text-slate-400">
                <span>Discount Savings</span>
                <span className="font-semibold text-[#059669] dark:text-emerald-400">{formattedDiscountSavings}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-[#64748b] dark:text-slate-400">
              <span>Platform Fee</span>
              <span className="font-semibold text-[#0f172a] dark:text-white">{platformFee === 0 ? "₹ 0" : "₹ 10"}</span>
            </div>
          </div>

          {/* Dotted divider */}
          <div className="border-t border-dashed border-[#e2e8f0] dark:border-white/10" />

          {/* Total Amount */}
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold text-[#0f172a] dark:text-white">Total Amount</span>
            <span className="font-display text-3xl font-extrabold tracking-tight text-[#0f172a] dark:text-white">
              {formattedTotalPrice}
            </span>
          </div>

          {/* Green Guarantee Chip */}
          <div className="flex items-center gap-2 rounded-xl border border-[#a7f3d0] bg-[#ecfdf5] p-3 text-xs font-semibold text-[#065f46] dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-300">
            <Tag className="h-4 w-4 shrink-0 text-[#059669] dark:text-emerald-400" />
            <span>No hidden charges. One-time payment.</span>
          </div>

          {/* Main Action Button */}
          <button
            onClick={handleProceedToPay}
            disabled={isProcessing}
            className="w-full rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-white font-bold py-3.5 px-6 flex items-center justify-center gap-2 text-base shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-75 cursor-pointer"
          >
            <span>{isProcessing ? "Connecting to Payment Gateway..." : totalAmountNumber === 0 ? "Enroll Now for Free" : `Proceed to Pay ${formattedTotalPrice}`}</span>
            {!isProcessing && <ArrowRight className="h-4 w-4" />}
          </button>

          {/* Security Subtext */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#475569] dark:text-slate-300">
              <LockKeyhole className="h-3.5 w-3.5 text-[#64748b]" />
              <span>Secure payment via <strong className="font-bold text-[#0f172a] dark:text-white">Razorpay</strong></span>
            </div>
            <p className="text-[11px] text-[#94a3b8]">Your payment information is safe with us.</p>
          </div>
        </div>
      </div>

      {/* Bottom Trust Section */}
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3 border-t border-[#e2e8f0] dark:border-white/10 pt-8">
        <div className="flex items-center gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-[#eff6ff] text-[#0066ff] dark:border-blue-900/40 dark:bg-blue-950/50">
            <Shield className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-[#0f172a] dark:text-white">Secure Payments</p>
            <p className="text-xs text-[#64748b] dark:text-slate-400">Powered by Razorpay</p>
          </div>
        </div>
        <div className="flex items-center gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-[#ecfdf5] text-[#059669] dark:border-emerald-900/40 dark:bg-emerald-950/50">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-[#0f172a] dark:text-white">100% Safe & Secure</p>
            <p className="text-xs text-[#64748b] dark:text-slate-400">Your data is protected</p>
          </div>
        </div>
        <div className="flex items-center gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-[#f8fafc] text-[#475569] dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <Headphones className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-[#0f172a] dark:text-white">Need Help?</p>
            <p className="text-xs text-[#64748b] dark:text-slate-400">Contact Support</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MyCoursesPage() {
  const { enrollments } = useEnrollments();
  const { courses, loading } = useLiveCourses();
  const { assignments } = useAssignments();
  const [filter, setFilter] = useState("All");

  const enrolledCourses = courses.filter((c) =>
    enrollments.some((e) => e.courseId === c.id || e.course?.id === c.id || e.course?.slug === c.slug)
  );

  const enrolledCount = enrolledCourses.length;
  const filtered = enrolledCourses.filter((c) =>
    filter === "All"
      ? true
      : filter === "In progress"
      ? c.progress > 0 && c.progress < 100
      : filter === "Completed"
      ? c.progress === 100
      : true
  );

  return (
    <>
      <PageHeader
        eyebrow="Your library"
        title="My learning"
        description="Pick up where you left off, or make space for a new skill."
        action={
          <div className="flex gap-2 rounded-xl bg-white p-1 shadow-sm dark:bg-white/5">
            {["All", "In progress", "Completed"].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={cx(
                  "rounded-lg px-3 py-2 text-xs font-bold",
                  filter === item ? "bg-[#17223d] text-white dark:bg-[#3157e8]" : "text-[#9aa4bc]"
                )}
              >
                {item}
              </button>
            ))}
          </div>
        }
      />
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="card-surface flex items-center gap-4 p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#3157e8]">
            <BookOpen className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-2xl font-bold text-[#17223d] dark:text-white">
              {String(enrolledCount).padStart(2, "0")}
            </p>
            <p className="text-xs text-[#9aa4bc]">Courses enrolled</p>
          </div>
        </div>
        <div className="card-surface flex items-center gap-4 p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff4db] text-[#d68c20]">
            <Flame className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-2xl font-bold text-[#17223d] dark:text-white">07 days</p>
            <p className="text-xs text-[#9aa4bc]">Current streak</p>
          </div>
        </div>
        <div className="card-surface flex items-center gap-4 p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e4f8ee] text-[#23a26d]">
            <Award className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-2xl font-bold text-[#17223d] dark:text-white">
              {enrolledCourses.filter((c) => c.progress === 100).length}
            </p>
            <p className="text-xs text-[#9aa4bc]">Certificates earned</p>
          </div>
        </div>
      </div>
      {loading && enrolledCourses.length === 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <MyCourseCardSkeleton key={n} />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course) => (
            <MyCourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="card-surface p-12 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-[#c4cada]" />
          <p className="mt-3 text-base font-bold text-[#17223d] dark:text-white">No enrolled courses yet</p>
          <p className="mt-1 text-xs text-[#9aa4bc] max-w-sm mx-auto">
            Explore our course catalog to find your next skill and kickstart your learning journey.
          </p>
          <Link href={getSecureHref("/courses")} className="mt-5 inline-flex button-primary">
            Browse Courses
          </Link>
        </div>
      )}

      {/* Course Assignments & Assessments Section */}
      {assignments.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-xl font-bold tracking-tight text-[#17223d] dark:text-white">
                Assignments & Problem Sets ({assignments.length})
              </h2>
              <p className="mt-0.5 text-xs text-[#9aa4bc]">
                Practical challenges, project checkpoints, and coding assignments available for your courses.
              </p>
            </div>
            <Link
              href={getSecureHref("/assignments")}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#3157e8] hover:underline"
            >
              Open assignment workspace <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {assignments.map((a) => {
              const isSubmitted = Boolean(a.userSubmission);
              return (
                <Link
                  key={a.id}
                  href={getSecureHref("/assignments")}
                  className="card-surface p-5 flex flex-col justify-between hover:border-[#3157e8]/40 hover:shadow-md transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#3157e8] dark:bg-[#3157e8]/15 dark:text-blue-300">
                          {a.course}
                        </span>
                        {a.module && (
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-white/10 dark:text-white/80">
                            {a.module}
                          </span>
                        )}
                      </div>
                      {isSubmitted ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> Submitted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                          <Clock3 className="h-3 w-3" /> {a.dueDate}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-[#17223d] group-hover:text-[#3157e8] dark:text-white transition">
                      {a.title}
                    </h3>
                    {a.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-[#7c87a4]">
                        {a.description}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-[#edf0f6] pt-3 text-xs dark:border-white/10">
                    <span className="text-[11px] font-semibold text-[#9aa4bc]">
                      {a.problemsCount > 0 ? `${a.problemsCount} Problems · ` : ""}{a.totalMarks} pts
                    </span>
                    <span className="font-bold text-[#3157e8] inline-flex items-center gap-1">
                      {isSubmitted ? "View Submission" : "Start Assignment"} <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}

function MyCourseCardSkeleton() {
  return (
    <div className="card-surface overflow-hidden animate-pulse">
      <div className="relative h-36 bg-slate-200/70 dark:bg-white/5">
        <div className="absolute bottom-3 left-4 h-4 w-20 rounded-md bg-slate-300/80 dark:bg-white/10" />
      </div>
      <div className="p-5">
        <div className="h-5 w-3/4 rounded-md bg-slate-200/80 dark:bg-white/10" />
        <div className="mt-2 h-3.5 w-full rounded bg-slate-100 dark:bg-white/5" />
        <div className="mt-5 flex items-center justify-between">
          <div className="h-3 w-24 rounded bg-slate-200/60 dark:bg-white/10" />
          <div className="h-3 w-8 rounded bg-slate-200/60 dark:bg-white/10" />
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-200/80 dark:bg-white/10" />
        <div className="mt-5 h-10 w-full rounded-xl bg-slate-200/80 dark:bg-white/10" />
      </div>
    </div>
  );
}

function MyCourseCard({ course }: { course: LiveCourseItem }) {
  return (
    <div className="card-surface group overflow-hidden">
      <div className="relative h-36 overflow-hidden">
        <img src={course.image} alt={course.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#17223d]/75 to-transparent" />
        <span className="absolute bottom-3 left-4 rounded-md bg-white/15 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md">
          {course.progress === 100 ? "Completed" : "In progress"}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-bold tracking-[-0.03em] text-[#17223d] dark:text-white line-clamp-1">{course.title}</h3>
        <p className="mt-1 text-xs text-[#9aa4bc] line-clamp-1">{course.subtitle || course.description}</p>
        <div className="mt-5 flex items-center justify-between text-xs font-bold">
          <span className="text-[#7c87a4]">Course progress</span>
          <span className="text-[#3157e8]">{course.progress}%</span>
        </div>
        <div className="mt-2">
          <ProgressBar value={course.progress} color={course.accent === "violet" ? "#7f5af0" : course.accent === "amber" ? "#d68c20" : "#3157e8"} />
        </div>
        <Link
          href={course.progress ? getSecureHref("/learn") : createSecureUrl("/courses", { courseId: course.id })}
          className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#eef2ff] py-3 text-xs font-bold text-[#3157e8] transition hover:bg-[#e2e9ff] dark:bg-[#3157e8]/20 dark:text-white"
        >
          {course.progress ? "Continue learning" : "Start course"}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function PlayerPage() {
  const { assignments } = useAssignments();
  const [tab, setTab] = useState("Notes");
  const [completed, setCompleted] = useState(false);
  const [moduleOpen, setModuleOpen] = useState(1);
  const [note, setNote] = useState("");
  const lessons = ["Welcome & how to think in patterns", "Arrays: the mental model", "Sliding Window Patterns", "Two pointers: a visual guide", "Stacks in the real world", "Checkpoint: arrays & strings"];
  return (
    <div className="-mx-4 -mt-7 lg:-mx-8">
      <div className="border-b border-[#e5e8f0] bg-[#fbfcff] px-4 py-4 dark:border-white/10 dark:bg-[#10172b] sm:px-6 lg:px-8">
        <Link href={getSecureHref("/my-courses")} className="inline-flex items-center gap-2 text-xs font-bold text-[#7c87a4] hover:text-[#3157e8]">
          <ArrowLeft className="h-4 w-4" /> Back to my learning
        </Link>
        <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#3157e8]">DSA Foundations · Module 03</p>
            <h1 className="mt-1 font-display text-xl font-bold tracking-[-0.04em] text-[#17223d] dark:text-white sm:text-2xl">Sliding Window Patterns</h1>
            <p className="mt-1 text-xs text-[#9aa4bc]">Lesson 03 of 07 · 12 min remaining</p>
          </div>
          <button
            onClick={() => {
              setCompleted(!completed);
              toast.success(completed ? "Lesson marked incomplete" : "Lesson complete — nice work!");
            }}
            className={cx(
              "flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition",
              completed ? "bg-[#e4f8ee] text-[#23a26d]" : "bg-[#3157e8] text-white shadow-[0_7px_16px_rgba(49,87,232,0.25)]"
            )}
          >
            {completed ? <CheckCircle2 className="h-4 w-4" /> : <Check className="h-4 w-4" />}{" "}
            {completed ? "Completed" : "Mark as complete"}
          </button>
        </div>
      </div>
      <div className="grid min-h-[620px] lg:grid-cols-[minmax(0,1fr)_350px]">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="video-frame relative flex aspect-video min-h-[270px] items-center justify-center overflow-hidden rounded-[22px] bg-[#111a33] shadow-[0_18px_36px_rgba(23,34,61,0.18)] sm:min-h-[420px]">
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage: `radial-gradient(circle at 30% 30%, #3157e8, transparent 35%), radial-gradient(circle at 70% 70%, #7f5af0, transparent 32%)`,
              }}
            />
            <div className="relative z-10 flex flex-col items-center">
              <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#3157e8] shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
                <Play className="ml-1 h-7 w-7 fill-current" />
              </span>
              <p className="text-sm font-bold text-white">Sliding window, made visual</p>
              <p className="mt-1 text-xs text-white/45">Video lesson · 12:48</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
              <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/15">
                <span className="block h-full w-[42%] rounded-full bg-[#ffca63]" />
              </div>
              <div className="flex items-center justify-between text-white/55">
                <div className="flex items-center gap-4">
                  <button onClick={() => toast.info("Playing lesson")}>
                    <Play className="h-4 w-4 fill-current" />
                  </button>
                  <span className="text-[10px]">05:22 / 12:48</span>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => toast.info("Playback speed: 1.25x")} className="text-[10px] font-bold">
                    1x
                  </button>
                  <button>
                    <Settings2 className="h-4 w-4" />
                  </button>
                  <button>
                    <span className="text-xs">⛶</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-1 overflow-x-auto border-b border-[#e5e8f0] dark:border-white/10">
            {["Notes", "Resources", "Practice problems", "Assignments", "Discussion"].map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={cx(
                  "whitespace-nowrap border-b-2 px-3 pb-3 text-xs font-bold transition",
                  tab === item
                    ? "border-[#3157e8] text-[#3157e8]"
                    : "border-transparent text-[#9aa4bc] hover:text-[#17223d] dark:hover:text-white"
                )}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="pt-6">
            {tab === "Notes" && (
              <div className="max-w-2xl">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-[#17223d] dark:text-white">My notes</h2>
                  <button onClick={() => toast.success("Notes exported as PDF")} className="flex items-center gap-2 text-xs font-bold text-[#3157e8]">
                    <FileText className="h-3.5 w-3.5" /> Download PDF
                  </button>
                </div>
                <p className="text-sm leading-7 text-[#5f6c8c] dark:text-white/65">
                  The window represents the current range we’re evaluating. Expand it when the constraint is valid, and shrink it when it isn’t. The trick is to define the invariant before writing a line of code.
                </p>
                <div className="my-5 rounded-xl border border-[#dfe5f3] bg-[#f5f7fb] p-4 font-mono text-xs leading-6 text-[#52617f] dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                  <p><span className="text-[#7f5af0]">while</span> right &lt; n:</p>
                  <p className="pl-4">window.add(s[right])</p>
                  <p className="pl-4"><span className="text-[#7f5af0]">while</span> invalid(window):</p>
                  <p className="pl-8">window.remove(s[left])</p>
                  <p className="pl-8">left += 1</p>
                  <p className="pl-4">answer = max(answer, right - left + 1)</p>
                  <p className="pl-4">right += 1</p>
                </div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a private note to this lesson..."
                  className="min-h-[110px] w-full resize-none rounded-xl border border-[#e5e8f0] bg-white p-4 text-sm outline-none focus:border-[#9db3ff] focus:ring-4 focus:ring-[#3157e8]/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => {
                      if (note.trim()) {
                        toast.success("Note saved");
                        setNote("");
                      }
                    }}
                    className="button-secondary"
                  >
                    <Plus className="h-4 w-4" /> Save note
                  </button>
                </div>
              </div>
            )}
            {tab === "Assignments" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-[#17223d] dark:text-white">
                    Module Assignments ({assignments.length})
                  </h2>
                  <Link href={getSecureHref("/assignments")} className="text-xs font-bold text-[#3157e8] hover:underline inline-flex items-center gap-1">
                    Full Workspace <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {assignments.map((a) => {
                    const isSubmitted = Boolean(a.userSubmission);
                    return (
                      <div key={a.id} className="rounded-2xl border border-[#edf0f6] bg-white p-5 dark:border-white/10 dark:bg-white/5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#3157e8] dark:bg-[#3157e8]/20">
                                {a.module || a.course}
                              </span>
                              {isSubmitted && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle2 className="h-3 w-3" /> Submitted
                                </span>
                              )}
                            </div>
                            <h3 className="mt-2 text-sm font-bold text-[#17223d] dark:text-white">{a.title}</h3>
                            <p className="mt-1 text-xs text-[#7c87a4]">{a.description}</p>
                          </div>
                          <span className="shrink-0 text-xs font-bold text-[#3157e8]">{a.totalMarks} pts</span>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-[#edf0f6] pt-3 text-xs dark:border-white/10">
                          <span className="text-[11px] text-amber-600 font-semibold">{a.dueDate}</span>
                          <Link href={getSecureHref("/assignments")} className="button-primary !py-1.5 !px-3 !text-xs">
                            {isSubmitted ? "View Submission" : "Open & Submit"}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {tab !== "Notes" && tab !== "Assignments" && (
              <div className="rounded-2xl bg-[#f7f9fc] p-8 text-center dark:bg-white/5">
                <FolderOpen className="mx-auto h-8 w-8 text-[#c4cada]" />
                <h3 className="mt-3 text-sm font-bold text-[#17223d] dark:text-white">{tab} for this lesson</h3>
                <p className="mt-1 text-xs text-[#9aa4bc]">Your cohort resources and conversations will show up here.</p>
                <button onClick={() => toast.info("This workspace is ready for your cohort content")} className="mt-5 button-secondary">
                  Explore space
                </button>
              </div>
            )}
          </div>
        </div>
        <aside className="border-t border-[#e5e8f0] bg-[#fbfcff] dark:border-white/10 dark:bg-[#10172b] lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between border-b border-[#e5e8f0] px-5 py-4 dark:border-white/10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#3157e8]">Course contents</p>
              <p className="mt-1 text-sm font-bold text-[#17223d] dark:text-white">DSA Foundations</p>
            </div>
            <span className="text-xs font-bold text-[#3157e8]">68%</span>
          </div>
          <div className="max-h-[640px] overflow-y-auto p-3">
            {["Foundations", "Sliding Window Patterns", "Stacks & Queues", "Trees & Graphs"].map((module, moduleIndex) => (
              <div key={module} className="mb-2 overflow-hidden rounded-xl border border-[#edf0f6] dark:border-white/10">
                <button
                  onClick={() => setModuleOpen(moduleOpen === moduleIndex ? -1 : moduleIndex)}
                  className="flex w-full items-center gap-2 bg-white px-3 py-3 text-left dark:bg-white/5"
                >
                  <ChevronDown className={cx("h-3.5 w-3.5 text-[#9aa4bc] transition-transform", moduleOpen === moduleIndex && "rotate-180")} />
                  <span className="flex-1 text-xs font-bold text-[#17223d] dark:text-white">{module}</span>
                  <span className="text-[10px] text-[#9aa4bc]">{moduleIndex === 1 ? "3/7" : moduleIndex === 0 ? "6/6" : "0/6"}</span>
                </button>
                {moduleOpen === moduleIndex && (
                  <div className="border-t border-[#edf0f6] p-1 dark:border-white/10">
                    {(moduleIndex === 1 ? lessons : ["Introduction", "Key concepts", "Checkpoint"]).map((lesson, index) => (
                      <Link
                        key={lesson}
                        href={index === 2 && moduleIndex === 1 ? getSecureHref("/learn") : "#"}
                        className={cx(
                          "flex items-center gap-2 rounded-lg px-2 py-2.5 text-xs",
                          moduleIndex === 1 && index === 2
                            ? "bg-[#eaf0ff] text-[#3157e8] dark:bg-[#3157e8]/20 dark:text-white"
                            : "text-[#7c87a4] hover:bg-[#f5f7fb] dark:hover:bg-white/5"
                        )}
                      >
                        <span
                          className={cx(
                            "flex h-5 w-5 items-center justify-center rounded-full",
                            index < (moduleIndex === 0 ? 3 : moduleIndex === 1 ? 3 : 0)
                              ? "bg-[#e4f8ee] text-[#23a26d]"
                              : "bg-[#f1f3f8] text-[#aab3c5] dark:bg-white/10"
                          )}
                        >
                          <Check className="h-3 w-3" />
                        </span>
                        <span className="min-w-0 flex-1 truncate">{lesson}</span>
                        {index === 2 && moduleIndex === 1 ? <Play className="h-3 w-3 fill-current" /> : <span className="text-[9px]">{10 + index * 3}m</span>}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function PracticePage({
  onSelectProblem,
}: {
  onSelectProblem?: (slugOrId: string) => void;
}) {
  const { problems: liveProblems, isLoading, refresh } = useLiveProblems();
  const [difficulty, setDifficulty] = useState("All");
  const [topic, setTopic] = useState("All topics");
  const [selectedCompany, setSelectedCompany] = useState("All companies");
  const [saved, setSaved] = useState<string[]>([]);

  const topicOptions = useMemo(() => {
    const set = new Set<string>();
    liveProblems.forEach((p) => {
      if (p.topic || p.category) set.add(p.topic || p.category);
    });
    const customList = Array.from(set);
    return customList.length > 0
      ? ["All topics", ...customList]
      : ["All topics", "Arrays", "Strings", "Stack", "Sliding Window", "Trees", "Graphs", "Two Pointers"];
  }, [liveProblems]);

  const companyOptions = useMemo(() => {
    const set = new Set<string>();
    liveProblems.forEach((p) => {
      if (typeof p.companies === "string" && p.companies.trim()) {
        p.companies
          .replace(/[\[\]"']/g, "")
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
          .forEach((c) => set.add(c));
      }
    });
    const list = Array.from(set);
    return list.length > 0
      ? ["All companies", ...list]
      : ["All companies", "Google", "Amazon", "Microsoft", "Meta", "Adobe", "Apple", "Netflix"];
  }, [liveProblems]);

  const filtered = liveProblems.filter(
    (p) =>
      (difficulty === "All" || p.difficulty.toLowerCase() === difficulty.toLowerCase()) &&
      (topic === "All topics" || (p.topic || p.category || "").toLowerCase() === topic.toLowerCase()) &&
      (selectedCompany === "All companies" ||
        (typeof p.companies === "string" &&
          p.companies.toLowerCase().includes(selectedCompany.toLowerCase())))
  );

  const solvedCount = liveProblems.filter((p) => p.solved).length;
  const totalCount = liveProblems.length;
  const accuracyPct = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  return (
    <>
      <PageHeader
        eyebrow="Build your edge"
        title="Practice problems"
        description="A focused set of interview patterns. Solve a little every day, then review what you missed."
        action={
          <div className="flex items-center gap-2 rounded-xl bg-[#fff4db] px-3 py-2 text-xs font-bold text-[#b77917]">
            <Flame className="h-4 w-4" /> 7 day streak
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-surface p-5">
          <p className="text-xs font-semibold text-[#9aa4bc]">Solved</p>
          <p className="mt-2 font-display text-3xl font-bold text-[#17223d] dark:text-white" suppressHydrationWarning>
            {solvedCount}
          </p>
          <div className="mt-3">
            <ProgressBar value={totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0} color="#23a26d" />
          </div>
          <p className="mt-2 text-[10px] font-bold text-[#23a26d]" suppressHydrationWarning>
            {totalCount} total challenges available
          </p>
        </div>
        <div className="card-surface p-5">
          <p className="text-xs font-semibold text-[#9aa4bc]">Completion rate</p>
          <p className="mt-2 font-display text-3xl font-bold text-[#17223d] dark:text-white" suppressHydrationWarning>
            {accuracyPct}<span className="text-base">%</span>
          </p>
          <p className="mt-3 text-[10px] font-bold text-[#3157e8]" suppressHydrationWarning>
            {solvedCount > 0 ? `${solvedCount} of ${totalCount} solved` : (totalCount > 0 ? "Start your first problem" : "No problems available")}
          </p>
        </div>
        <div className="card-surface p-5">
          <p className="text-xs font-semibold text-[#9aa4bc]">Remaining</p>
          <p className="mt-2 font-display text-3xl font-bold text-[#17223d] dark:text-white" suppressHydrationWarning>
            {Math.max(0, totalCount - solvedCount)} <span className="text-sm font-semibold text-[#9aa4bc]">unsolved</span>
          </p>
          <p className="mt-3 text-[10px] font-bold text-[#d68c20]" suppressHydrationWarning>
            {totalCount === 0 ? "No problems published yet" : `${Math.max(0, totalCount - solvedCount)} more to complete all`}
          </p>
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between flex-wrap">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["All", "Easy", "Medium", "Hard"].map((item) => (
            <button
              key={item}
              onClick={() => setDifficulty(item)}
              className={cx(
                "rounded-full px-4 py-2 text-xs font-bold transition-colors cursor-pointer",
                difficulty === item
                  ? "bg-[#17223d] text-white dark:bg-[#3157e8]"
                  : "bg-white text-[#7c87a4] dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10"
              )}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <CustomDropdown
            value={topic}
            onChange={setTopic}
            options={topicOptions}
            icon={<Code2 className="h-4 w-4 text-[#9aa4bc]" />}
          />
          <CustomDropdown
            value={selectedCompany}
            onChange={setSelectedCompany}
            options={companyOptions}
            icon={<Building2 className="h-4 w-4 text-[#9aa4bc]" />}
          />
        </div>
      </div>
      <div className="mt-5 card-surface overflow-hidden">
        <div className="hidden grid-cols-[minmax(0,1fr)_130px_110px_110px_54px] gap-4 border-b border-[#edf0f6] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#9aa4bc] dark:border-white/10 sm:grid">
          <span>Problem</span>
          <span>Difficulty</span>
          <span>Acceptance</span>
          <span>Status</span>
          <span />
        </div>
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#9aa4bc]">
            No practice problems match the selected filters.
          </div>
        ) : (
          filtered.map((problem) => (
            <div
              key={String(problem.id || problem.title)}
              onClick={() => {
                if (onSelectProblem) {
                  onSelectProblem(problem.slug || String(problem.id));
                }
              }}
              className="grid gap-3 border-b border-[#edf0f6] px-5 py-4 last:border-0 dark:border-white/10 sm:grid-cols-[minmax(0,1fr)_130px_110px_110px_54px] sm:items-center sm:gap-4 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={cx(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg group-hover:scale-105 transition-transform",
                    problem.solved
                      ? "bg-[#e4f8ee] text-[#23a26d]"
                      : "bg-[#f1f3f8] text-[#9aa4bc] dark:bg-white/10"
                  )}
                >
                  <Code2 className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <span className="block truncate text-sm font-bold text-[#17223d] group-hover:text-[#3157e8] dark:text-white transition-colors">
                    {problem.title}
                  </span>
                </div>
              </div>
              <span
                className={cx(
                  "w-fit rounded-md px-2 py-1 text-[10px] font-bold",
                  problem.difficulty === "Easy"
                    ? "bg-[#e4f8ee] text-[#23a26d]"
                    : problem.difficulty === "Medium"
                    ? "bg-[#fff4db] text-[#d68c20]"
                    : "bg-[#fff0ed] text-[#ef8354]"
                )}
              >
                {problem.difficulty}
              </span>
              <span className="text-xs font-semibold text-[#7c87a4]">{problem.acceptance || "75.0%"}</span>
              <span
                className={cx(
                  "w-fit text-xs font-bold",
                  problem.solved ? "text-[#23a26d]" : "text-[#9aa4bc]"
                )}
              >
                {problem.solved ? "Solved" : "Not started"}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSaved(
                    saved.includes(problem.title)
                      ? saved.filter((item) => item !== problem.title)
                      : [...saved, problem.title]
                  );
                }}
                className={cx(
                  "justify-self-start rounded-lg p-2 transition-colors cursor-pointer",
                  saved.includes(problem.title) ? "text-[#3157e8]" : "text-[#b6bfd0] hover:text-[#3157e8]"
                )}
              >
                <Bookmark className={cx("h-4 w-4", saved.includes(problem.title) && "fill-current")} />
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}

function ProgressPage() {
  const [timeframe, setTimeframe] = useState("Last 14 days");
  const { courses } = useLiveCourses();
  const { enrollments } = useEnrollments();
  const { problems: liveProblems } = useLiveProblems();

  const enrolledCourses = courses.filter((c) =>
    enrollments.some((e) => e.courseId === c.id || e.course?.id === c.id || e.course?.slug === c.slug)
  );
  const targetCourses = enrolledCourses.length > 0 ? enrolledCourses : courses;

  const easySolved = liveProblems.filter((p) => p.solved && p.difficulty?.toLowerCase() === "easy").length;
  const mediumSolved = liveProblems.filter((p) => p.solved && p.difficulty?.toLowerCase() === "medium").length;
  const hardSolved = liveProblems.filter((p) => p.solved && p.difficulty?.toLowerCase() === "hard").length;

  const bars =
    timeframe === "Last 7 days"
      ? [52, 84, 72, 92, 60, 76, 96]
      : timeframe === "Last 30 days"
      ? [35, 44, 56, 68, 52, 65, 84, 72, 92, 60, 76, 48, 82, 70, 88, 62, 96]
      : [44, 68, 52, 84, 72, 92, 60, 76, 48, 82, 70, 88, 62, 96];

  return (
    <>
      <PageHeader
        eyebrow="Your momentum"
        title="Progress overview"
        description="See the habits behind your progress and the next small move to make."
        action={
          <button onClick={() => toast.success("Progress report downloaded")} className="button-secondary">
            <FileText className="h-4 w-4" /> Export report
          </button>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.65fr)]">
        <section className="card-surface p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-[#9aa4bc]">Weekly activity</p>
              <p className="mt-1 font-display text-2xl font-bold tracking-[-0.04em] text-[#17223d] dark:text-white">
                4h 20m <span className="text-xs font-semibold text-[#23a26d]">+18%</span>
              </p>
            </div>
            <CustomDropdown
              value={timeframe}
              onChange={setTimeframe}
              options={["Last 7 days", "Last 14 days", "Last 30 days", "This quarter"]}
            />
          </div>
          <div className="mt-9 flex h-[180px] items-end gap-2 sm:gap-3">
            {bars.map((height, index) => (
              <div key={index} className="group flex flex-1 flex-col items-center gap-2">
                <div className="relative flex h-full w-full items-end">
                  <span
                    className={cx(
                      "block w-full rounded-t-lg transition hover:opacity-80",
                      index === bars.length - 1
                        ? "bg-[#3157e8]"
                        : "bg-[#dce6ff] dark:bg-[#3157e8]/30"
                    )}
                    style={{ height: `${height}%` }}
                  />
                  <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-[#17223d] px-1.5 py-1 text-[9px] font-bold text-white opacity-0 transition group-hover:opacity-100">
                    {Math.round(height / 9)}m
                  </span>
                </div>
                <span className="text-[9px] text-[#aab3c5]">
                  {index % 2 === 0 ? `S${index / 2 + 1}` : ""}
                </span>
              </div>
            ))}
          </div>
        </section>
        <section className="relative overflow-hidden rounded-[22px] bg-[#17223d] p-6 text-white">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full border-[18px] border-[#3157e8]/30" />
          <Flame className="relative h-6 w-6 text-[#ffca63]" />
          <p className="relative mt-6 font-display text-4xl font-bold tracking-[-0.07em]">07</p>
          <p className="relative mt-1 text-sm font-semibold">day learning streak</p>
          <p className="relative mt-4 max-w-[190px] text-xs leading-5 text-white/55">
            You’re two days away from your longest streak this month.
          </p>
          <div className="relative mt-6 flex gap-1.5">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
              <div key={`${day}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                <span
                  className={cx(
                    "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold",
                    index < 6
                      ? "bg-[#ffca63] text-[#17223d]"
                      : "bg-white/15 text-white/50"
                  )}
                >
                  {index < 6 ? <Check className="h-3.5 w-3.5" /> : "·"}
                </span>
                <span className="text-[9px] text-white/40">{day}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <SectionTitle title="Course progress" link="My courses" href="/my-courses" />
          <div className="card-surface px-5">
            {targetCourses.length > 0 ? (
              targetCourses.slice(0, 3).map((course) => (
                <div
                  key={course.id}
                  className="border-b border-[#edf0f6] py-5 last:border-0 dark:border-white/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eef2ff] text-[#3157e8]">
                        <BookOpen className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#17223d] dark:text-white">
                          {course.title}
                        </p>
                        <p className="mt-1 text-[10px] text-[#9aa4bc]">
                          {course.progress === 100
                            ? "Completed"
                            : `${course.progress}% complete`}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#3157e8]">{course.progress}%</span>
                  </div>
                  <div className="mt-3">
                    <ProgressBar
                      value={course.progress}
                      color={course.accent === "violet" ? "#7f5af0" : "#3157e8"}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-[#9aa4bc]">
                No courses available to track progress.
              </div>
            )}
          </div>
        </section>
        <section>
          <SectionTitle title="Practice statistics" link="Practice" href="/practice" />
          <div className="card-surface grid grid-cols-3 divide-x divide-[#edf0f6] p-5 dark:divide-white/10">
            <div className="px-2 text-center">
              <p className="font-display text-3xl font-bold text-[#23a26d]" suppressHydrationWarning>
                {String(easySolved).padStart(2, "0")}
              </p>
              <p className="mt-2 text-[10px] font-bold text-[#9aa4bc]">Easy solved</p>
            </div>
            <div className="px-2 text-center">
              <p className="font-display text-3xl font-bold text-[#d68c20]" suppressHydrationWarning>
                {String(mediumSolved).padStart(2, "0")}
              </p>
              <p className="mt-2 text-[10px] font-bold text-[#9aa4bc]">Medium solved</p>
            </div>
            <div className="px-2 text-center">
              <p className="font-display text-3xl font-bold text-[#ef8354]" suppressHydrationWarning>
                {String(hardSolved).padStart(2, "0")}
              </p>
              <p className="mt-2 text-[10px] font-bold text-[#9aa4bc]">Hard solved</p>
            </div>
          </div>
          <div className="mt-4 card-surface p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-[#7c87a4]">Assignment health</p>
              <span className="text-xs font-bold text-[#23a26d]">On track</span>
            </div>
            <div className="mt-5 flex items-center gap-4">
              <div
                className="relative h-20 w-20 rounded-full"
                style={{
                  background:
                    "conic-gradient(#23a26d 0 62%, #ffca63 62% 80%, #eef1f6 80% 100%)",
                }}
              >
                <div className="absolute inset-[8px] flex items-center justify-center rounded-full bg-white dark:bg-[#182036]">
                  <span className="font-display text-lg font-bold text-[#17223d] dark:text-white">
                    18
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-[10px] font-semibold text-[#7c87a4]">
                <p>
                  <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#23a26d]" />
                  Submitted <b className="text-[#17223d] dark:text-white">18</b>
                </p>
                <p>
                  <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#ffca63]" />
                  Pending <b className="text-[#17223d] dark:text-white">05</b>
                </p>
                <p>
                  <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#e1e5ed]" />
                  Reviewed <b className="text-[#17223d] dark:text-white">11</b>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("lms_admin_announcements");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [liveSessions, setLiveSessions] = useState<any[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("lms_admin_live_sessions");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let isMounted = true;
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/v1/admin/announcements");
        if (res.ok) {
          const json = await res.json();
          const items = Array.isArray(json) ? json : json?.data || [];
          if (Array.isArray(items) && isMounted) {
            setAnnouncements(items);
            try {
              localStorage.setItem("lms_admin_announcements", JSON.stringify(items));
            } catch {}
          }
        }
      } catch {
        if (isMounted) {
          try {
            const saved = localStorage.getItem("lms_admin_announcements");
            if (saved) setAnnouncements(JSON.parse(saved));
          } catch {}
        }
      }
    };

    const fetchLiveSessions = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/v1/live-sessions");
        if (res.ok) {
          const json = await res.json();
          const items = Array.isArray(json) ? json : json?.data || [];
          if (Array.isArray(items) && isMounted) {
            setLiveSessions(items);
            try {
              localStorage.setItem("lms_admin_live_sessions", JSON.stringify(items));
            } catch {}
          }
        }
      } catch {
        if (isMounted) {
          try {
            const saved = localStorage.getItem("lms_admin_live_sessions");
            if (saved) setLiveSessions(JSON.parse(saved));
          } catch {}
        }
      }
    };

    fetchAnnouncements();
    fetchLiveSessions();

    const handleSync = () => {
      fetchAnnouncements();
      fetchLiveSessions();
    };

    window.addEventListener("storage", handleSync);
    window.addEventListener("lms_announcements_updated", handleSync);
    window.addEventListener("lms_live_sessions_updated", handleSync);
    const interval = setInterval(handleSync, 12000);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("lms_announcements_updated", handleSync);
      window.removeEventListener("lms_live_sessions_updated", handleSync);
      clearInterval(interval);
    };
  }, []);

  const upcomingSessions = liveSessions.filter(
    (s) => s.status !== "Completed" && s.status !== "Draft"
  );

  return (
    <>
      <PageHeader
        eyebrow="Stay in the loop"
        title="Announcements"
        description="The latest from your instructors, cohort, and learning community."
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <div className="card-surface flex flex-col items-center justify-center p-12 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eaf0ff] text-[#3157e8] dark:bg-white/10 dark:text-blue-400 mb-3">
                <Bell className="h-6 w-6" />
              </div>
              <h3 className="font-display text-base font-bold text-[#17223d] dark:text-white">No announcements yet</h3>
              <p className="mt-1 text-xs text-[#7c87a4] max-w-sm">
                Cohort updates, live session reminders, and important notices from your instructors will appear here.
              </p>
            </div>
          ) : (
            announcements.map((item, index) => (
              <article key={item.id || item.title || index} className="card-surface p-5 sm:p-6">
                <div className="flex gap-4">
                  <span
                    className={cx(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      index === 0
                        ? "bg-[#eaf0ff] text-[#3157e8]"
                        : index === 1
                        ? "bg-[#e4f8ee] text-[#23a26d]"
                        : "bg-[#fff4db] text-[#d68c20]"
                    )}
                  >
                    <Bell className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-[#f1f3f8] px-2 py-1 text-[10px] font-bold text-[#7c87a4] dark:bg-white/10">
                        {item.category || item.targetAudience || "General"}
                      </span>
                      <span className="text-[10px] text-[#aab3c5]">
                        {item.publishedAt || item.date || "Just now"}
                      </span>
                      {item.isPinned && (
                        <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 text-[9px] font-bold text-indigo-600 dark:text-indigo-400">
                          Pinned
                        </span>
                      )}
                    </div>
                    <h2 className="mt-3 font-display text-lg font-bold tracking-[-0.03em] text-[#17223d] dark:text-white">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#7c87a4]">{item.content || item.body}</p>
                    <button
                      onClick={() => toast.success("Announcement marked as read")}
                      className="mt-4 text-xs font-bold text-[#3157e8] hover:underline"
                    >
                      Mark as read
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
        <aside className="card-surface h-fit p-5 space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-[#7c87a4]">Upcoming live sessions</p>
              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                {upcomingSessions.length} Scheduled
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {upcomingSessions.length === 0 ? (
                <p className="text-xs text-[#9aa4bc] py-2">No live classes scheduled for today.</p>
              ) : (
                upcomingSessions.slice(0, 4).map((session, idx) => {
                  const isLive = session.status === "Live";
                  return (
                    <div
                      key={session.id || idx}
                      onClick={() => {
                        if (session.meetingLink) {
                          window.open(session.meetingLink, "_blank", "noopener,noreferrer");
                          toast.info(`Joining ${session.platform || "Live"} class...`);
                        } else {
                          toast.info("Meeting link will be active shortly before start.");
                        }
                      }}
                      className="group flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition cursor-pointer border border-slate-100 dark:border-white/5"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                          <Video className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#17223d] dark:text-white truncate">
                            {session.title}
                          </p>
                          <p className="text-[10px] text-[#9aa4bc] truncate">
                            {session.date} · {session.startTime || "TBD"}
                          </p>
                        </div>
                      </div>
                      {isLive ? (
                        <span className="shrink-0 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 animate-pulse">
                          LIVE
                        </span>
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#c4cada] group-hover:text-indigo-600" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div className="border-t border-slate-100 dark:border-white/10 pt-4">
            <p className="text-xs font-bold text-[#7c87a4]">Reminders</p>
            <div className="mt-3 space-y-3">
              <Reminder icon={AlarmClock} title="Arrays checkpoint" meta="Due soon" color="amber" />
              <Reminder icon={Target} title="Mock interview" meta="Cohort prep" color="violet" />
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
function Reminder({ icon: Icon, title, meta, color }: { icon: LucideIcon; title: string; meta: string; color: "amber" | "blue" | "violet" }) { const colors = { amber: "bg-[#fff4db] text-[#d68c20]", blue: "bg-[#eaf0ff] text-[#3157e8]", violet: "bg-[#f0eaff] text-[#7f5af0]" }; return <div className="flex items-center gap-3"><span className={cx("flex h-8 w-8 items-center justify-center rounded-lg", colors[color])}><Icon className="h-4 w-4" /></span><div><p className="text-xs font-bold text-[#17223d] dark:text-white">{title}</p><p className="mt-1 text-[10px] text-[#9aa4bc]">{meta}</p></div></div>; }

function CommunityPage() {
  const [topicFilter, setTopicFilter] = useState("All topics");
  const [query, setQuery] = useState("");
  const [liked, setLiked] = useState<string[]>([]);
  const submissions = [
    {
      name: "Nisha Verma",
      initials: "NV",
      problem: "Merge Intervals",
      topic: "Arrays & Intervals",
      language: "Python",
      time: "18 min ago",
      likes: 24,
      code: "intervals.sort(key=lambda x: x[0])",
    },
    {
      name: "Kabir Rao",
      initials: "KR",
      problem: "Valid Parentheses",
      topic: "Stack & Queue",
      language: "JavaScript",
      time: "2 hours ago",
      likes: 18,
      code: "const stack = []; for (const char of s)",
    },
    {
      name: "Ishita Sen",
      initials: "IS",
      problem: "Two Sum",
      topic: "Arrays & Hashing",
      language: "Java",
      time: "Yesterday",
      likes: 31,
      code: "Map<Integer, Integer> seen = new HashMap<>();",
    },
    {
      name: "Rohan V.",
      initials: "RV",
      problem: "Binary Tree Right Side View",
      topic: "Trees & Graphs",
      language: "C++",
      time: "3 days ago",
      likes: 42,
      code: "vector<int> rightSideView(TreeNode* root) { ... }",
    },
  ];

  const filteredSubmissions = submissions.filter((item) => {
    const matchesTopic =
      topicFilter === "All topics" ||
      item.topic.toLowerCase().includes(topicFilter.toLowerCase()) ||
      topicFilter.toLowerCase().includes(item.topic.toLowerCase());
    const matchesQuery =
      !query ||
      item.problem.toLowerCase().includes(query.toLowerCase()) ||
      item.name.toLowerCase().includes(query.toLowerCase());
    return matchesTopic && matchesQuery;
  });

  return (
    <>
      <PageHeader
        eyebrow="Learn together"
        title="Community solutions"
        description="See how other learners think, explain, and improve their approach."
        action={
          <button onClick={() => toast.info("Use Practice to publish a solution")} className="button-primary">
            <Plus className="h-4 w-4" /> Share solution
          </button>
        }
      />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa4bc]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search problem or learner"
            className="h-11 w-full rounded-xl border border-[#e5e8f0] bg-white pl-9 pr-3 text-sm outline-none focus:ring-4 focus:ring-[#3157e8]/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>
        <CustomDropdown
          value={topicFilter}
          onChange={setTopicFilter}
          options={[
            "All topics",
            "Arrays & Intervals",
            "Stack & Queue",
            "Arrays & Hashing",
            "Trees & Graphs",
            "Dynamic Programming",
          ]}
          icon={<Code2 className="h-4 w-4 text-[#9aa4bc]" />}
        />
      </div>
      <div className="space-y-4">
        {filteredSubmissions.map((item) => (
          <article key={item.name} className="card-surface p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf0ff] text-xs font-bold text-[#3157e8]">
                {item.initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-[#17223d] dark:text-white">{item.name}</span>
                  <span className="text-xs text-[#9aa4bc]">shared a solution</span>
                  <span className="text-[10px] text-[#b0b8c8]">· {item.time}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-lg font-bold tracking-[-0.03em] text-[#17223d] dark:text-white">
                    {item.problem}
                  </h2>
                  <span className="rounded-md bg-[#f0eaff] px-2 py-1 text-[10px] font-bold text-[#7f5af0]">
                    {item.language}
                  </span>
                </div>
                <div className="mt-4 rounded-xl bg-[#17223d] p-4 font-mono text-xs leading-6 text-white/75">
                  <p>
                    <span className="text-[#ffca63]">// clean approach</span>
                  </p>
                  <p>{item.code}</p>
                  <p>
                    <span className="text-[#7ed8ac]">return</span> result
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-5">
                  <button
                    onClick={() =>
                      setLiked(
                        liked.includes(item.name)
                          ? liked.filter((n) => n !== item.name)
                          : [...liked, item.name]
                      )
                    }
                    className={cx(
                      "flex items-center gap-1.5 text-xs font-bold",
                      liked.includes(item.name) ? "text-[#3157e8]" : "text-[#9aa4bc]"
                    )}
                  >
                    <ThumbsUp
                      className={cx("h-4 w-4", liked.includes(item.name) && "fill-current")}
                    />{" "}
                    {item.likes + (liked.includes(item.name) ? 1 : 0)}
                  </button>
                  <button
                    onClick={() => toast.info("Comment thread opened")}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#9aa4bc]"
                  >
                    <MessageCircle className="h-4 w-4" /> Discuss
                  </button>
                  <button
                    onClick={() => toast.success("Code copied")}
                    className="ml-auto flex items-center gap-1.5 text-xs font-bold text-[#9aa4bc]"
                  >
                    <Copy className="h-4 w-4" /> Copy code
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
        {filteredSubmissions.length === 0 && (
          <div className="card-surface p-10 text-center">
            <Search className="mx-auto h-8 w-8 text-[#c4cada]" />
            <p className="mt-3 text-sm font-bold text-[#17223d] dark:text-white">No solutions found</p>
            <p className="mt-1 text-xs text-[#9aa4bc]">Try another filter or search term.</p>
          </div>
        )}
      </div>
    </>
  );
}

function NotificationsPage() {
  const [read, setRead] = useState<string[]>([]);
  const { user } = useAuth();
  const displayName = resolveDisplayName(user);
  const firstName = resolveFirstName(user);
  const notifications = [
    { id: "1", title: "Maya shared a new clinic recording", body: "Sliding Window Patterns · 42 min", time: "12 min ago", icon: Video, color: "blue" },
    { id: "2", title: "Assignment deadline tomorrow", body: "Arrays checkpoint · DSA Foundations", time: "3 hours ago", icon: AlarmClock, color: "amber" },
    { id: "3", title: "Your submission was reviewed", body: `Nice work on the edge cases, ${firstName}.`, time: "Yesterday", icon: CheckCircle2, color: "emerald" },
    { id: "4", title: "You moved up in the cohort", body: "You’re now in the top 20% for weekly activity.", time: "Yesterday", icon: Trophy, color: "violet" },
  ];
  return (
    <>
      <PageHeader
        eyebrow="Stay on top"
        title="Notifications"
        description="A single place for new lessons, feedback, and important dates."
        action={
          <button onClick={() => setRead(notifications.map((n) => n.id))} className="button-secondary">
            <Check className="h-4 w-4" /> Mark all as read
          </button>
        }
      />
      <div className="card-surface overflow-hidden">
        {notifications.map((item) => {
          const Icon = item.icon;
          const isRead = read.includes(item.id);
          return (
            <div
              key={item.id}
              className={cx(
                "flex gap-4 border-b border-[#edf0f6] p-5 last:border-0 dark:border-white/10",
                !isRead && "bg-[#fbfcff] dark:bg-white/[0.02]"
              )}
            >
              <span
                className={cx(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  item.color === "blue"
                    ? "bg-[#eaf0ff] text-[#3157e8]"
                    : item.color === "amber"
                    ? "bg-[#fff4db] text-[#d68c20]"
                    : item.color === "emerald"
                    ? "bg-[#e4f8ee] text-[#23a26d]"
                    : "bg-[#f0eaff] text-[#7f5af0]"
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={cx("text-sm", isRead ? "font-semibold text-[#7c87a4]" : "font-bold text-[#17223d] dark:text-white")}>
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-[#9aa4bc]">{item.body}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-[#aab3c5]">{item.time}</span>
                </div>
                {!isRead && (
                  <button onClick={() => setRead([...read, item.id])} className="mt-3 text-[10px] font-bold text-[#3157e8]">
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function AssignmentsPage() {
  const { assignments, submissions, loading, submitAssignment } = useAssignments();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "submitted">("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  const [submissionText, setSubmissionText] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [showGithubInput, setShowGithubInput] = useState(false);
  const [showFileInput, setShowFileInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedForCurrent, setSubmittedForCurrent] = useState(false);

  // Selected assignment for detail view
  const currentAssignment = assignments.find((a) => a.id === selectedId) || null;

  // Sync form inputs when an assignment is selected
  useEffect(() => {
    if (currentAssignment) {
      if (currentAssignment.userSubmission) {
        setSubmittedForCurrent(true);
        setSubmissionText(currentAssignment.userSubmission.content || "");
        setGithubUrl(currentAssignment.userSubmission.githubUrl || "");
        setFileUrl(currentAssignment.userSubmission.fileUrl || "");
        setShowGithubInput(Boolean(currentAssignment.userSubmission.githubUrl));
        setShowFileInput(Boolean(currentAssignment.userSubmission.fileUrl));
      } else {
        setSubmittedForCurrent(false);
        setSubmissionText("");
        setGithubUrl("");
        setFileUrl("");
        setShowGithubInput(false);
        setShowFileInput(false);
      }
    }
  }, [currentAssignment?.id, currentAssignment?.userSubmission]);

  // Derived metrics
  const totalCount = assignments.length;
  const submittedCount = assignments.filter((a) => Boolean(a.userSubmission)).length;
  const pendingCount = totalCount - submittedCount;
  const totalPointsAvailable = assignments.reduce((acc, a) => acc + (a.totalMarks || 100), 0);

  // Filter courses list for dropdown
  const uniqueCourses = useMemo(() => {
    const courses = new Set<string>();
    assignments.forEach((a) => {
      if (a.course) courses.add(a.course);
    });
    return Array.from(courses);
  }, [assignments]);

  const courseDropdownOptions = useMemo(() => [
    { label: "All Courses", value: "all" },
    ...uniqueCourses.map((c) => ({ label: c, value: c })),
  ], [uniqueCourses]);

  const difficultyDropdownOptions = useMemo(() => [
    { label: "All Difficulties", value: "all" },
    { label: "Easy", value: "Easy" },
    { label: "Medium", value: "Medium" },
    { label: "Hard", value: "Hard" },
  ], []);

  // Filtered assignments list
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.topic && a.topic.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (a.module && a.module.toLowerCase().includes(searchQuery.toLowerCase()));

      const isSubmitted = Boolean(a.userSubmission);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "submitted" && isSubmitted) ||
        (statusFilter === "pending" && !isSubmitted);

      const matchesCourse = courseFilter === "all" || a.course === courseFilter;
      const matchesDifficulty =
        difficultyFilter === "all" ||
        (a.difficulty || "Medium").toLowerCase() === difficultyFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesCourse && matchesDifficulty;
    });
  }, [assignments, searchQuery, statusFilter, courseFilter, difficultyFilter]);

  const handleSubmit = async () => {
    if (!currentAssignment) return;
    if (!submissionText.trim() && !githubUrl.trim() && !fileUrl.trim()) {
      toast.error("Please provide your submission text, GitHub link, or attached file");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitAssignment(currentAssignment.id, {
        content: submissionText,
        githubUrl: githubUrl || undefined,
        fileUrl: fileUrl || undefined,
      });

      if (res.success) {
        setSubmittedForCurrent(true);
        toast.success(`Assignment "${currentAssignment.title}" submitted successfully for review!`);
      } else {
        toast.error(res.error || "Failed to submit assignment");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Show your work & master concepts"
        title="Course Assignments & Problem Sets"
        description="Complete practical problem sets, build end-to-end projects, and submit your code for mentor evaluation."
      />

      {loading ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card-surface h-24 animate-pulse p-4" />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card-surface h-64 animate-pulse p-6" />
            ))}
          </div>
        </div>
      ) : assignments.length === 0 ? (
        <div className="card-surface p-12 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300 mb-4">
            <ClipboardCheck className="h-8 w-8" />
          </div>
          <h2 className="font-display text-xl font-bold text-[#17223d] dark:text-white">
            No assignments available yet
          </h2>
          <p className="mt-2 text-xs text-[#9aa4bc] max-w-md mx-auto">
            Assignments created and published from the Admin Panel will appear here automatically in real time.
          </p>
          <Link
            href={getSecureHref("/courses")}
            className="button-primary mt-6 inline-flex items-center gap-2"
          >
            Browse courses <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : currentAssignment ? (
        /* ============================================================ */
        /* SINGLE ASSIGNMENT DETAIL & SUBMISSION WORKSPACE */
        /* ============================================================ */
        <div className="space-y-6">
          {/* Back button and assignment breadcrumbs */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#e5e8f0] bg-white px-4 py-2 text-xs font-bold text-[#52617f] transition hover:bg-[#f7f9fc] hover:text-[#17223d] dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" /> Back to all assignments ({assignments.length})
            </button>
            <div className="flex items-center gap-2">
              <span
                className={cx(
                  "rounded-lg px-2.5 py-1 text-[11px] font-bold",
                  (currentAssignment.difficulty || "Medium").toLowerCase() === "easy"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : (currentAssignment.difficulty || "Medium").toLowerCase() === "hard"
                    ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                )}
              >
                {currentAssignment.difficulty || "Medium"}
              </span>
              <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-[#3157e8] dark:bg-[#3157e8]/15 dark:text-blue-300">
                {currentAssignment.totalMarks || 100} pts
              </span>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            {/* Main Assignment Content */}
            <div className="space-y-6">
              <section className="card-surface p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eaf0ff] text-[#3157e8] dark:bg-[#3157e8]/20">
                    <ClipboardCheck className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#7c87a4]">
                      <span>{currentAssignment.course}</span>
                      {currentAssignment.module && (
                        <>
                          <span>·</span>
                          <span>{currentAssignment.module}</span>
                        </>
                      )}
                      {currentAssignment.topic && (
                        <>
                          <span>·</span>
                          <span className="text-[#3157e8]">{currentAssignment.topic}</span>
                        </>
                      )}
                    </div>
                    <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#17223d] dark:text-white">
                      {currentAssignment.title}
                    </h1>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#7c87a4]">
                      <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                        <Clock3 className="h-4 w-4" /> Due: {currentAssignment.dueDate}
                      </span>
                      {currentAssignment.allowLate && (
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <Check className="h-3.5 w-3.5" /> Late submissions allowed
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {currentAssignment.description && (
                  <div className="mt-6 border-t border-[#edf0f6] pt-6 dark:border-white/10">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#9aa4bc]">
                      Assignment Overview
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-[#52617f] dark:text-white/75">
                      {currentAssignment.description}
                    </p>
                  </div>
                )}

                {currentAssignment.instructions && (
                  <div className="mt-6 rounded-2xl bg-[#f8fafc] p-5 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#17223d] dark:text-white">
                      Instructions & Submission Guidelines
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#52617f] dark:text-white/70 whitespace-pre-line">
                      {currentAssignment.instructions}
                    </p>
                  </div>
                )}

                {/* Attached Problems Bank */}
                {Array.isArray(currentAssignment.problemsList) && currentAssignment.problemsList.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#9aa4bc]">
                        Attached Problems ({currentAssignment.problemsList.length})
                      </h3>
                      <span className="text-[11px] text-[#7c87a4]">Solve directly in practice arena</span>
                    </div>
                    <div className="divide-y divide-[#edf0f6] rounded-2xl border border-[#edf0f6] dark:divide-white/10 dark:border-white/10">
                      {currentAssignment.problemsList.map((p: any, idx: number) => (
                        <div key={p.id || idx} className="flex items-center justify-between p-3.5 text-xs">
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-[#9aa4bc]">#{idx + 1}</span>
                            <div>
                              <p className="font-bold text-[#17223d] dark:text-white">{p.title}</p>
                              {p.category && <p className="text-[10px] text-[#9aa4bc]">{p.category}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={cx(
                                "rounded px-2 py-0.5 text-[10px] font-bold",
                                (p.difficulty || "Medium").toLowerCase() === "easy"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                  : (p.difficulty || "Medium").toLowerCase() === "hard"
                                  ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                                  : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                              )}
                            >
                              {p.difficulty || "Medium"}
                            </span>
                            <span className="font-bold text-[#3157e8]">{p.points || 25} pts</span>
                            <Link
                              href={getSecureHref("/practice", {
                                slug: p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                              })}
                              className="rounded-lg bg-[#eaf0ff] px-2.5 py-1 text-[11px] font-bold text-[#3157e8] transition hover:bg-[#d8e4ff] dark:bg-[#3157e8]/20 dark:text-white"
                            >
                              Solve →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resources List */}
                {Array.isArray(currentAssignment.resources) && currentAssignment.resources.length > 0 && (
                  <div className="mt-6 space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#9aa4bc]">
                      Attached Resources & Templates ({currentAssignment.resources.length})
                    </h3>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {currentAssignment.resources.map((r: any, idx: number) => (
                        <div
                          key={r.id || idx}
                          className="flex items-center justify-between rounded-xl border border-[#edf0f6] bg-[#f8fafc] p-3 text-xs dark:border-white/10 dark:bg-white/5"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-4 w-4 shrink-0 text-[#3157e8]" />
                            <span className="truncate font-semibold text-[#17223d] dark:text-white">
                              {r.name || `Resource_${idx + 1}`}
                            </span>
                          </div>
                          {r.size && <span className="shrink-0 text-[10px] text-[#9aa4bc]">{r.size}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Submission Box */}
              <section className="card-surface p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-lg font-bold text-[#17223d] dark:text-white">
                      Your Submission Workspace
                    </h2>
                    <p className="mt-0.5 text-xs text-[#7c87a4]">
                      Provide code explanations, approach analysis, GitHub link, or cloud asset URLs.
                    </p>
                  </div>
                  {submittedForCurrent && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                      <CheckCircle2 className="h-4 w-4" /> Submitted for Review
                    </span>
                  )}
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#52617f] dark:text-white/80">
                      Solution Code & Approach Explanation
                    </label>
                    <textarea
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      placeholder="Paste your solution code, time/space complexity breakdown, algorithm explanation, and test case proofs here..."
                      className="mt-2 min-h-[160px] w-full resize-none rounded-xl border border-[#e5e8f0] bg-white p-4 font-mono text-xs leading-relaxed text-[#17223d] outline-none focus:border-[#9db3ff] focus:ring-4 focus:ring-[#3157e8]/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>

                  {showGithubInput && (
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-[#52617f] dark:text-white/80">
                        <Github className="h-3.5 w-3.5 text-[#17223d] dark:text-white" /> GitHub Repository / PR Link
                      </label>
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/username/project-repository"
                        className="mt-1.5 w-full rounded-xl border border-[#e5e8f0] bg-white px-3.5 py-2.5 text-xs outline-none focus:border-[#9db3ff] dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                    </div>
                  )}

                  {showFileInput && (
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-[#52617f] dark:text-white/80">
                        <FileText className="h-3.5 w-3.5 text-[#3157e8]" /> File / Cloud Asset Link
                      </label>
                      <input
                        type="text"
                        value={fileUrl}
                        onChange={(e) => setFileUrl(e.target.value)}
                        placeholder="https://drive.google.com/... or uploaded document link"
                        className="mt-1.5 w-full rounded-xl border border-[#e5e8f0] bg-white px-3.5 py-2.5 text-xs outline-none focus:border-[#9db3ff] dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                    </div>
                  )}

                  <div className="grid gap-3 pt-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setShowFileInput(!showFileInput)}
                      className={cx(
                        "flex items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-xs font-bold transition",
                        showFileInput || fileUrl
                          ? "border-[#3157e8] text-[#3157e8] bg-[#eaf0ff]/50 dark:bg-[#3157e8]/10"
                          : "border-[#cbd4e5] text-[#7c87a4] hover:border-[#3157e8] hover:text-[#3157e8] dark:border-white/15"
                      )}
                    >
                      <Plus className="h-4 w-4" /> {fileUrl ? "File Link Added" : "Attach File / Cloud URL"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowGithubInput(!showGithubInput)}
                      className={cx(
                        "flex items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-xs font-bold transition",
                        showGithubInput || githubUrl
                          ? "border-[#3157e8] text-[#3157e8] bg-[#eaf0ff]/50 dark:bg-[#3157e8]/10"
                          : "border-[#cbd4e5] text-[#7c87a4] hover:border-[#3157e8] hover:text-[#3157e8] dark:border-white/15"
                      )}
                    >
                      <Github className="h-4 w-4" /> {githubUrl ? "GitHub Linked" : "Add GitHub Link"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#edf0f6] pt-5 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setSelectedId(null)}
                      className="text-xs font-bold text-[#7c87a4] hover:text-[#17223d] dark:hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="button-primary inline-flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {isSubmitting
                        ? "Submitting..."
                        : submittedForCurrent
                        ? "Update Submission"
                        : "Submit Assignment"}
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {/* Sidebar info */}
            <aside className="space-y-5">
              <div className="card-surface p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#7c87a4]">
                  Assignment Criteria
                </h3>
                <div className="mt-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-[#edf0f6] dark:border-white/10">
                    <span className="text-[#9aa4bc]">Total Marks:</span>
                    <span className="font-bold text-[#17223d] dark:text-white">
                      {currentAssignment.totalMarks || 100} pts
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#edf0f6] dark:border-white/10">
                    <span className="text-[#9aa4bc]">Passing Score:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {currentAssignment.passingMarks || 40} pts (
                      {Math.round(((currentAssignment.passingMarks || 40) / (currentAssignment.totalMarks || 100)) * 100)}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#edf0f6] dark:border-white/10">
                    <span className="text-[#9aa4bc]">Deadline:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {currentAssignment.dueDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[#9aa4bc]">Submission Type:</span>
                    <span className="font-bold text-[#17223d] dark:text-white">
                      {Array.isArray(currentAssignment.submissionTypes)
                        ? currentAssignment.submissionTypes.join(", ")
                        : "Code / GitHub"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submissions for this assignment */}
              <div className="card-surface p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#7c87a4]">
                  Submission History
                </h3>
                <div className="mt-4 space-y-3">
                  {submissions.length === 0 ? (
                    <p className="py-3 text-center text-xs text-[#9aa4bc]">
                      No submissions recorded yet.
                    </p>
                  ) : (
                    submissions.map((s) => {
                      const isGraded = (s.status || "").toUpperCase() === "GRADED";
                      return (
                        <div key={s.id} className="flex items-start gap-3 rounded-xl bg-[#f8fafc] p-3 text-xs dark:bg-white/5">
                          <span
                            className={cx(
                              "mt-1 h-2 w-2 shrink-0 rounded-full",
                              isGraded ? "bg-[#23a26d]" : "bg-[#ffca63]"
                            )}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-bold text-[#17223d] dark:text-white">
                              {s.assignment?.title || "Assignment Submission"}
                            </p>
                            <p className="mt-0.5 text-[10px] text-[#9aa4bc]">
                              {isGraded ? `Grade: ${s.score}/${s.maxScore || 100}` : "Under Review"} ·{" "}
                              {new Date(s.submittedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-[#eaf0ff] p-5 dark:bg-[#3157e8]/20">
                <Headphones className="h-5 w-5 text-[#3157e8]" />
                <p className="mt-4 text-sm font-bold text-[#17223d] dark:text-white">Have questions or stuck?</p>
                <p className="mt-1.5 text-xs leading-relaxed text-[#5f6c8c] dark:text-white/70">
                  Ask your peers and instructors in the Community channels or attend live clinics.
                </p>
                <Link
                  href={getSecureHref("/community")}
                  className="mt-3.5 inline-flex items-center gap-1 text-xs font-bold text-[#3157e8]"
                >
                  Open community discussion <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      ) : (
        /* ============================================================ */
        /* ALL ASSIGNMENTS CATALOG & GRID VIEW */
        /* ============================================================ */
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card-surface p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#3157e8] dark:bg-[#3157e8]/15 dark:text-blue-300">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#9aa4bc]">Total Assignments</p>
                <p className="mt-1 font-display text-2xl font-bold text-[#17223d] dark:text-white">
                  {totalCount}
                </p>
              </div>
            </div>

            <div className="card-surface p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300">
                <Clock3 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#9aa4bc]">Pending Submissions</p>
                <p className="mt-1 font-display text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {pendingCount}
                </p>
              </div>
            </div>

            <div className="card-surface p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#9aa4bc]">Submitted & Completed</p>
                <p className="mt-1 font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {submittedCount}
                </p>
              </div>
            </div>

            <div className="card-surface p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#9aa4bc]">Total Marks Available</p>
                <p className="mt-1 font-display text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {totalPointsAvailable} pts
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="card-surface p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-[#f5f7fb] p-1 dark:bg-white/5">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={cx(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                  statusFilter === "all"
                    ? "bg-white text-[#17223d] shadow-sm dark:bg-white/15 dark:text-white"
                    : "text-[#7c87a4] hover:text-[#17223d] dark:hover:text-white"
                )}
              >
                All ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("pending")}
                className={cx(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                  statusFilter === "pending"
                    ? "bg-white text-amber-600 shadow-sm dark:bg-white/15 dark:text-amber-300"
                    : "text-[#7c87a4] hover:text-[#17223d] dark:hover:text-white"
                )}
              >
                Pending ({pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("submitted")}
                className={cx(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                  statusFilter === "submitted"
                    ? "bg-white text-emerald-600 shadow-sm dark:bg-white/15 dark:text-emerald-300"
                    : "text-[#7c87a4] hover:text-[#17223d] dark:hover:text-white"
                )}
              >
                Submitted ({submittedCount})
              </button>
            </div>

            {/* Search + Custom Dropdowns */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[200px] flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9aa4bc]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search assignments..."
                  className="h-10 w-full rounded-xl border border-[#e5e8f0] bg-white pl-9 pr-3 text-xs outline-none focus:border-[#9db3ff] dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              <CustomDropdown
                value={courseFilter}
                onChange={setCourseFilter}
                options={courseDropdownOptions}
                icon={<BookOpen className="h-4 w-4 text-[#9aa4bc]" />}
              />

              <CustomDropdown
                value={difficultyFilter}
                onChange={setDifficultyFilter}
                options={difficultyDropdownOptions}
                icon={<BarChart2 className="h-4 w-4 text-[#9aa4bc]" />}
              />
            </div>
          </div>

          {/* Assignments Cards Grid */}
          {filteredAssignments.length === 0 ? (
            <div className="card-surface p-12 text-center">
              <ClipboardCheck className="mx-auto h-10 w-10 text-[#9aa4bc]" />
              <p className="mt-3 text-sm font-bold text-[#17223d] dark:text-white">
                No assignments match your search or filter
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setCourseFilter("all");
                  setDifficultyFilter("all");
                }}
                className="mt-4 text-xs font-bold text-[#3157e8] underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredAssignments.map((a) => {
                const isSubmitted = Boolean(a.userSubmission);
                const isGraded = isSubmitted && (a.userSubmission?.status || "").toUpperCase() === "GRADED";
                const isUrgent =
                  !isSubmitted &&
                  (a.dueDate.toLowerCase().includes("today") ||
                    a.dueDate.toLowerCase().includes("tomorrow") ||
                    a.dueDate.toLowerCase().includes("3 days"));

                return (
                  <div
                    key={a.id}
                    onClick={() => setSelectedId(a.id)}
                    className="card-surface group flex cursor-pointer flex-col justify-between p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-[#3157e8]/30 dark:hover:border-[#3157e8]/50"
                  >
                    <div>
                      {/* Card Header Tags */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-[#3157e8] dark:bg-[#3157e8]/15 dark:text-blue-300">
                            {a.course}
                          </span>
                          {a.module && (
                            <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-white/10 dark:text-white/80">
                              {a.module}
                            </span>
                          )}
                        </div>

                        {/* Status Badge */}
                        {isSubmitted ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" />
                            {isGraded ? `Graded: ${a.userSubmission?.score}/${a.totalMarks}` : "Submitted"}
                          </span>
                        ) : (
                          <span
                            className={cx(
                              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold",
                              isUrgent
                                ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
                                : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                            )}
                          >
                            <Clock3 className="h-3 w-3" />
                            Pending
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <h3 className="mt-4 font-display text-lg font-bold tracking-tight text-[#17223d] transition group-hover:text-[#3157e8] dark:text-white dark:group-hover:text-[#839efc]">
                        {a.title}
                      </h3>
                      {a.description && (
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#7c87a4]">
                          {a.description}
                        </p>
                      )}
                    </div>

                    {/* Footer Row & Chips */}
                    <div className="mt-6 border-t border-[#edf0f6] pt-4 dark:border-white/10">
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-[#7c87a4]">
                          <span className={cx("inline-flex items-center gap-1", isUrgent ? "text-rose-600 font-bold dark:text-rose-400" : "")}>
                            <Clock3 className="h-3.5 w-3.5" />
                            {a.dueDate}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[#3157e8]">
                            <Award className="h-3.5 w-3.5" />
                            {a.totalMarks} pts
                          </span>
                          {a.problemsCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-slate-600 dark:text-white/70">
                              <Code2 className="h-3.5 w-3.5" />
                              {a.problemsCount} Problems
                            </span>
                          )}
                        </div>

                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#3157e8] group-hover:translate-x-0.5 transition-transform">
                          {isSubmitted ? "View / Edit Submission" : "Open & Submit"} <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function ProfilePage() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { enrollments } = useEnrollments();
  const { problems: liveProblems } = useLiveProblems();
  const solvedCount = liveProblems.filter((p) => p.solved).length;
  const displayName = resolveDisplayName(user);
  const email = user?.email || "learner@example.com";
  const nameParts = displayName.trim().split(/\s+/);
  const firstName = resolveFirstName(user);
  const lastName = nameParts.slice(1).join(" ") || "";
  const roleDisplay = user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()) : "Student";
  const educationStatus = resolveEducationStatus(user);

  return (
    <>
      <PageHeader
        eyebrow="Your account"
        title="Profile & settings"
        description="Keep your learning space personal, focused, and notification-light."
        action={
          <button onClick={() => toast.success("Profile changes saved")} className="button-primary">
            <Check className="h-4 w-4" /> Save changes
          </button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="card-surface h-fit p-5">
          <div className="flex flex-col items-center text-center">
            <Avatar size="lg" name={displayName} />
            <h2 className="mt-4 font-display text-lg font-bold text-[#17223d] dark:text-white truncate max-w-[200px]">
              {displayName}
            </h2>
            <p className="mt-1 text-xs text-[#9aa4bc] truncate max-w-[200px]">{email}</p>
            <span className="mt-3 rounded-full bg-[#e4f8ee] px-3 py-1 text-[10px] font-bold text-[#23a26d]">
              Active {educationStatus.toLowerCase().includes("professional") ? "professional" : educationStatus.toLowerCase().includes("year") ? `${educationStatus} student` : roleDisplay.toLowerCase()}
            </span>
          </div>
          <div className="mt-6 grid grid-cols-3 divide-x divide-[#edf0f6] dark:divide-white/10">
            <div className="text-center">
              <p className="font-display text-lg font-bold text-[#17223d] dark:text-white">
                {String(enrollments.length).padStart(2, "0")}
              </p>
              <p className="mt-1 text-[9px] text-[#9aa4bc]">Courses</p>
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-bold text-[#17223d] dark:text-white" suppressHydrationWarning>
                {String(solvedCount).padStart(2, "0")}
              </p>
              <p className="mt-1 text-[9px] text-[#9aa4bc]">Solved</p>
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-bold text-[#17223d] dark:text-white">07</p>
              <p className="mt-1 text-[9px] text-[#9aa4bc]">Streak</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              toast.success("Signed out successfully");
            }}
            className="mt-5 w-full rounded-xl border border-red-200 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-950/20"
          >
            Sign out
          </button>
        </aside>
        <section className="space-y-5">
          <div className="card-surface p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold text-[#17223d] dark:text-white">Profile information</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="First name" value={firstName} />
              <Field label="Last name" value={lastName} />
              <Field label="Email address" value={email} />
              <Field label="Current role / Education" value={educationStatus} />
            </div>
          </div>
          <div className="card-surface p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold text-[#17223d] dark:text-white">Preferences</h2>
            <div className="mt-4 divide-y divide-[#edf0f6] dark:divide-white/10">
              <PreferenceRow
                icon={theme === "light" ? Sun : Moon}
                title="Appearance"
                description={`Use ${theme} mode across your learning space`}
                control={
                  <button
                    onClick={toggleTheme}
                    className="rounded-lg bg-[#eef2ff] px-3 py-2 text-xs font-bold text-[#3157e8] dark:bg-[#3157e8]/20 dark:text-white"
                  >
                    {theme === "light" ? "Light" : "Dark"}
                  </button>
                }
              />
              <PreferenceRow
                icon={Bell}
                title="Learning reminders"
                description="A gentle nudge when it’s time to practice"
                control={
                  <span className="h-5 w-9 rounded-full bg-[#3157e8] p-1">
                    <span className="ml-4 block h-3 w-3 rounded-full bg-white" />
                  </span>
                }
              />
              <PreferenceRow
                icon={MessageCircle}
                title="Community updates"
                description="Replies, likes, and cohort conversations"
                control={
                  <span className="h-5 w-9 rounded-full bg-[#3157e8] p-1">
                    <span className="ml-4 block h-3 w-3 rounded-full bg-white" />
                  </span>
                }
              />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
function Field({ label, value }: { label: string; value: string }) { return <label><span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9aa4bc]">{label}</span><input defaultValue={value} key={value} className="mt-2 h-11 w-full rounded-xl border border-[#e5e8f0] bg-white px-3 text-sm font-semibold text-[#17223d] outline-none focus:border-[#9db3ff] focus:ring-4 focus:ring-[#3157e8]/10 dark:border-white/10 dark:bg-white/5 dark:text-white" /></label>; }
function PreferenceRow({ icon: Icon, title, description, control }: { icon: LucideIcon; title: string; description: string; control: React.ReactNode }) { return <div className="flex items-center gap-3 py-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f1f3f8] text-[#7c87a4] dark:bg-white/10"><Icon className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="text-sm font-bold text-[#17223d] dark:text-white">{title}</p><p className="mt-1 text-xs text-[#9aa4bc]">{description}</p></div>{control}</div>; }

function FeedbackPage() { const [rating, setRating] = useState(0); return <><PageHeader eyebrow="Help us teach better" title="Feedback & reviews" description="Your honest notes help us make the course more useful for the next learner." /><div className="mx-auto max-w-2xl card-surface p-6 sm:p-8"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff4db] text-[#d68c20]"><Star className="h-5 w-5" /></span><div><p className="text-xs text-[#9aa4bc]">Reviewing</p><p className="text-sm font-bold text-[#17223d] dark:text-white">DSA Foundations</p></div></div><div className="mt-8"><label className="text-xs font-bold text-[#52617f] dark:text-white/80">How would you rate the course?</label><div className="mt-3 flex gap-2">{[1, 2, 3, 4, 5].map(value => <button key={value} onClick={() => setRating(value)} className={cx("rounded-lg p-2 transition", value <= rating ? "text-[#ffb629]" : "text-[#c4cada]")}><Star className={cx("h-7 w-7", value <= rating && "fill-current")} /></button>)}</div></div><label className="mt-7 block text-xs font-bold text-[#52617f] dark:text-white/80">What’s one thing we should keep or improve?</label><textarea placeholder="Tell us about the teaching, content, or platform experience..." className="mt-2 min-h-[150px] w-full resize-none rounded-xl border border-[#e5e8f0] bg-white p-4 text-sm outline-none focus:border-[#9db3ff] focus:ring-4 focus:ring-[#3157e8]/10 dark:border-white/10 dark:bg-white/5 dark:text-white" /><button onClick={() => toast.success("Thanks — your feedback was shared with the team")} className="mt-5 w-full button-primary"><Send className="h-4 w-4" /> Submit feedback</button></div></>; }

function NotesPage() { return <><PageHeader eyebrow="Capture your thinking" title="Notes" description="Your private course notes, collected in one calm place." action={<button onClick={() => toast.success("New note created")} className="button-primary"><Plus className="h-4 w-4" /> New note</button>} /><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{["Sliding Window Patterns", "The anatomy of a good interview answer", "Trees: recursive vs iterative"].map((title, i) => <article key={title} className="card-surface p-5"><div className="flex items-start justify-between"><span className={cx("flex h-9 w-9 items-center justify-center rounded-xl", i === 0 ? "bg-[#eaf0ff] text-[#3157e8]" : i === 1 ? "bg-[#f0eaff] text-[#7f5af0]" : "bg-[#e4f8ee] text-[#23a26d]")}><FileText className="h-4 w-4" /></span><button onClick={() => toast.info("Note actions opened")} className="text-[#9aa4bc]"><MoreHorizontal className="h-4 w-4" /></button></div><h2 className="mt-5 font-display text-lg font-bold tracking-[-0.03em] text-[#17223d] dark:text-white">{title}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-[#7c87a4]">A short, memorable way to frame the idea before writing code. Capture the invariant first, then test it on a tiny example.</p><div className="mt-5 flex items-center justify-between text-[10px] font-semibold text-[#9aa4bc]"><span>Updated {i + 1} day{i ? "s" : ""} ago</span><span className="flex items-center gap-1"><Bookmark className="h-3 w-3 fill-current text-[#3157e8]" /> Saved</span></div></article>)}</div></>; }

function NotFoundLike() { return <div className="card-surface mx-auto max-w-lg p-10 text-center"><CircleHelp className="mx-auto h-10 w-10 text-[#3157e8]" /><h1 className="mt-4 font-display text-2xl font-bold text-[#17223d] dark:text-white">This space is being prepared</h1><p className="mt-2 text-sm leading-6 text-[#7c87a4]">The learning path is ready to grow here. Use the navigation to explore the rest of CodePath.</p><Link href={getSecureHref("/dashboard")} className="mt-6 inline-flex button-primary">Back to dashboard</Link></div>; }

export default function Home({
  page = "dashboard",
  courseId = "",
  problemSlug = "",
}: {
  page?: string;
  courseId?: string;
  problemSlug?: string;
}) {
  useAuth();
  const { problems: liveProblems } = useLiveProblems();
  const [activeProblemSlug, setActiveProblemSlug] = useState<string | null>(problemSlug || null);

  useEffect(() => {
    if (problemSlug) {
      setActiveProblemSlug(problemSlug);
    }
  }, [problemSlug]);

  const activeProblem = useMemo(() => {
    if (!activeProblemSlug) return null;
    return (
      liveProblems.find(
        (p) =>
          p.slug === activeProblemSlug ||
          String(p.id) === activeProblemSlug ||
          p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") === activeProblemSlug
      ) || null
    );
  }, [activeProblemSlug, liveProblems]);

  const content = useMemo(() => {
    switch (page) {
      case "courses": return <CoursesPage />;
      case "course-detail": return <CourseDetail courseId={courseId} />;
      case "checkout": return <EnrollmentCheckoutPage courseId={courseId} />;
      case "my-courses": return <MyCoursesPage />;
      case "learn": return <PlayerPage />;
      case "practice": return (
        <PracticePage
          onSelectProblem={(slug) => {
            setActiveProblemSlug(slug);
            if (typeof window !== "undefined") {
              window.history.replaceState(null, "", createSecureUrl("/practice", { slug }));
            }
          }}
        />
      );
      case "progress": return <ProgressPage />;
      case "announcements": return <AnnouncementsPage />;
      case "community": return <CommunityPage />;
      case "notifications": return <NotificationsPage />;
      case "assignments": return <AssignmentsPage />;
      case "profile": return <ProfilePage />;
      case "feedback": return <FeedbackPage />;
      case "notes": return <NotesPage />;
      default: return <Dashboard />;
    }
  }, [courseId, page]);

  // Full-page LeetCode-style problem arena view (outside AppShell, exactly like admin panel)
  if (page === "practice" && activeProblem) {
    return (
      <div className="relative min-h-screen bg-[#f5f7fb] dark:bg-[#0b0e17]">
        <StudentProblemArena
          problem={activeProblem}
          onBack={() => {
            setActiveProblemSlug(null);
            if (typeof window !== "undefined") {
              window.history.replaceState(null, "", createSecureUrl("/practice", { v: "practice" }));
            }
          }}
          onSelectProblem={(slugOrId) => {
            setActiveProblemSlug(slugOrId);
            if (typeof window !== "undefined") {
              window.history.replaceState(
                null,
                "",
                createSecureUrl("/practice", { slug: slugOrId })
              );
            }
          }}
        />
      </div>
    );
  }

  return <AppShell>{content}</AppShell>;
}
