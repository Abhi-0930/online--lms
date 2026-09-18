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
  { label: "Practice problems", href: "/practice", icon: Code2, badge: "12" },
];

const utilityItems: NavItem[] = [
  { label: "Announcements", href: "/announcements", icon: Bell },
  { label: "Progress", href: "/progress", icon: LineChart },
  { label: "Community", href: "/community", icon: Users },
];

const courses = [
  {
    id: "dsa-foundations",
    slug: "dsa-foundations",
    title: "DSA for Placements",
    subtitle: "Complete Data Structures & Algorithms with Python",
    description: "Build the problem-solving muscle that top interviews look for. Complete Data Structures & Algorithms with Python from beginner to advanced.",
    instructor: "Abhishek Jujjuvarapu",
    instructorRole: "Full Stack Engineer • Mentor",
    instructorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    students: "12.8k",
    duration: "4 Months",
    lessons: "54 lessons",
    rating: "4.9",
    price: "₹ 2,499",
    category: "DSA",
    level: "Beginner to Advanced",
    image: courseImages.dsa,
    badgeText: "DSA\nfor Placements",
    progress: 0,
    accent: "blue",
  },
  {
    id: "placement-sprint",
    slug: "placement-sprint",
    title: "Placement Sprint 2025",
    subtitle: "A guided 30-day sprint for OA rounds, interviews, and confidence",
    description: "A guided 30-day sprint for OA rounds, interviews, and confidence. High-frequency problems, timed assessments, and live clinics.",
    instructor: "Abhishek Jujjuvarapu",
    instructorRole: "Full Stack Engineer • Mentor",
    instructorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    students: "8.4k",
    duration: "30 days",
    lessons: "42 lessons",
    rating: "4.8",
    price: "₹ 2,299",
    category: "Placement",
    level: "Intermediate to Advanced",
    image: courseImages.system,
    badgeText: "Placement\nSprint 2025",
    progress: 0,
    accent: "violet",
  },
  {
    id: "frontend-lab",
    slug: "frontend-lab",
    title: "Frontend Interview Lab",
    subtitle: "Ship production-grade web applications & ace tech rounds",
    description: "Ship polished UI while mastering the questions interviewers ask. Performance, modern state management, and framework internals.",
    instructor: "Abhishek Jujjuvarapu",
    instructorRole: "Full Stack Engineer • Mentor",
    instructorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    students: "5.7k",
    duration: "6 weeks",
    lessons: "36 lessons",
    rating: "4.7",
    price: "₹ 1,799",
    category: "Web development",
    level: "Intermediate",
    image: courseImages.web,
    badgeText: "Frontend\nInterview Lab",
    progress: 0,
    accent: "amber",
  },
  {
    id: "system-design",
    slug: "system-design",
    title: "System Design, Simply",
    subtitle: "Distributed architectures, microservices, scaling & trade-offs",
    description: "Think in trade-offs, draw clean architectures, and explain your why. Real-world distributed systems, caching, scaling, and database sharding.",
    instructor: "Abhishek Jujjuvarapu",
    instructorRole: "Full Stack Engineer • Mentor",
    instructorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    students: "3.1k",
    duration: "5 weeks",
    lessons: "28 lessons",
    rating: "4.9",
    price: "₹ 1,999",
    category: "System design",
    level: "Advanced",
    image: courseImages.database,
    badgeText: "System\nDesign",
    progress: 0,
    accent: "emerald",
  },
];

const problems = [
  { title: "Two Sum", topic: "Arrays", difficulty: "Easy", solved: true, attempts: 2, acceptance: "49%" },
  { title: "Valid Parentheses", topic: "Stack", difficulty: "Easy", solved: true, attempts: 1, acceptance: "41%" },
  { title: "Longest Substring Without Repeating Characters", topic: "Strings", difficulty: "Medium", solved: false, attempts: 3, acceptance: "35%" },
  { title: "Merge Intervals", topic: "Arrays", difficulty: "Medium", solved: false, attempts: 0, acceptance: "47%" },
  { title: "Binary Tree Level Order Traversal", topic: "Trees", difficulty: "Medium", solved: true, attempts: 1, acceptance: "68%" },
  { title: "Number of Islands", topic: "Graphs", difficulty: "Hard", solved: false, attempts: 0, acceptance: "52%" },
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
  return <span className={cx("inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3157e8] via-[#567bf5] to-[#7f5af0] font-semibold text-white ring-2 ring-white dark:ring-[#182036]", sizeClass)}>{initials}</span>;
}

function Sidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (value: boolean) => void }) {
  const location = usePathname() || "";
  const isActive = (href: string) => href === "/" ? location === "/" : location.startsWith(href);
  return (
    <aside className={cx("fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-[#e5e8f0] bg-[#fbfcff] transition-[width] duration-200 dark:border-white/10 dark:bg-[#10172b] lg:flex", collapsed ? "w-[86px]" : "w-[250px]")}>
      <div className={cx("flex h-[78px] items-center border-b border-[#e5e8f0] dark:border-white/10", collapsed ? "justify-center px-3" : "px-6")}>
        <Logo compact={collapsed} />
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto px-3 py-6">
        {!collapsed && <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9aa4bc]">Workspace</p>}
        <nav className="space-y-1">
          {navItems.map((item) => <SidebarLink key={item.href} item={item} active={isActive(item.href)} collapsed={collapsed} />)}
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
          <span className="block text-xs font-bold text-[#17223d] dark:text-white truncate max-w-[140px]">{displayName}</span>
          <span className="block text-[10px] text-[#9aa4bc]">{roleName}</span>
        </span>
        <ChevronDown className={cx("hidden h-3.5 w-3.5 text-[#9aa4bc] transition-transform duration-200 lg:block", open && "rotate-180 text-[#3157e8]")} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 rounded-2xl border border-[#e5e8f0] bg-white p-2 shadow-2xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-100 dark:border-white/10 dark:bg-[#151c30]">
          <div className="flex items-center gap-2.5 border-b border-[#edf0f6] p-2.5 pb-3 dark:border-white/10">
            <Avatar size="sm" name={displayName} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-[#17223d] dark:text-white">{displayName}</p>
              <p className="truncate text-[10px] text-[#9aa4bc]">{user?.email || "learner@example.com"}</p>
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
  const displayName = resolveDisplayName(user);
  if (!open) return null;
  return <div className="fixed inset-0 z-[60] lg:hidden"><button aria-label="Close menu" onClick={onClose} className="absolute inset-0 bg-[#17223d]/40 backdrop-blur-sm" /><aside className="relative flex h-full w-[82%] max-w-[310px] flex-col bg-[#fbfcff] shadow-2xl dark:bg-[#10172b]"><div className="flex h-[78px] items-center justify-between border-b border-[#e5e8f0] px-6 dark:border-white/10"><Logo /><button onClick={onClose} className="rounded-lg p-2 text-[#7c87a4] hover:bg-[#eef2ff]"><X className="h-5 w-5" /></button></div><div className="flex-1 px-4 py-6"><p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9aa4bc]">Workspace</p>{[...navItems, ...utilityItems].map((item) => <div key={item.href} onClick={onClose}><SidebarLink item={item} active={item.href === "/" ? location === "/" : location.startsWith(item.href)} collapsed={false} /></div>)}</div><div className="border-t border-[#e5e8f0] p-5 dark:border-white/10"><div className="flex items-center gap-3"><Avatar name={displayName} /><div><p className="text-sm font-bold text-[#17223d] dark:text-white truncate max-w-[180px]">{displayName}</p><p className="text-xs text-[#9aa4bc]">7 day learning streak</p></div></div></div></aside></div>;
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
  return <div className="card-surface p-4 sm:p-5"><div className="flex items-start justify-between gap-2"><span className={cx("flex h-9 w-9 items-center justify-center rounded-xl", tones[color])}><Icon className="h-[17px] w-[17px]" /></span><span className="flex items-center gap-1 text-[10px] font-bold text-[#24a06b]"><ArrowUpRight className="h-3 w-3" />{trend}</span></div><p className="mt-4 font-display text-[26px] font-bold tracking-[-0.05em] text-[#17223d] dark:text-white">{value}</p><p className="mt-1 text-xs font-medium text-[#9aa4bc]">{label}</p></div>;
}

function ProgressBar({ value, color = "#3157e8" }: { value: number; color?: string }) {
  return <div className="h-1.5 overflow-hidden rounded-full bg-[#edf0f6] dark:bg-white/10"><span className="block h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, background: color }} /></div>;
}

function Dashboard() {
  const [showAll, setShowAll] = useState(false);
  const { user } = useAuth();
  const displayName = resolveDisplayName(user);
  const firstName = resolveFirstName(user);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

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
              <Link href={getSecureHref("/learn")} className="button-primary">
                <Play className="h-3.5 w-3.5 fill-current" /> Resume learning
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
              <h2 className="mt-1 font-display text-lg font-bold tracking-[-0.03em] text-[#17223d] dark:text-white">
                DSA Foundations
              </h2>
            </div>
            <span className="rounded-lg bg-[#eaf0ff] px-2 py-1 text-[10px] font-bold text-[#3157e8] dark:bg-[#3157e8]/20">
              68% done
            </span>
          </div>
          <div className="mt-6">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#17223d] text-white">
                <Code2 className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#17223d] dark:text-white">
                  Sliding Window Patterns
                </p>
                <p className="mt-0.5 text-xs text-[#9aa4bc]">Module 04 · Lesson 03</p>
              </div>
            </div>
            <ProgressBar value={68} />
            <div className="mt-2 flex justify-between text-[10px] font-semibold text-[#9aa4bc]">
              <span>18 of 26 lessons</span>
              <span>12 min left</span>
            </div>
          </div>
          <Link
            href={getSecureHref("/learn")}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f1f4fb] py-3 text-xs font-bold text-[#3157e8] transition hover:bg-[#e6ebfb] dark:bg-white/5 dark:hover:bg-white/10"
          >
            Continue lesson <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </section>
      </div>
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard icon={BookOpen} value="04" label="Courses enrolled" trend="+1 this month" color="blue" />
        <StatCard icon={ClipboardCheck} value="18" label="Assignments submitted" trend="+4 this week" color="violet" />
        <StatCard icon={Code2} value="42" label="Problems solved" trend="+12% vs last week" color="amber" />
        <StatCard icon={Clock3} value="26h 40m" label="Total watch time" trend="+3h 20m" color="emerald" />
      </div>
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(310px,0.75fr)]">
        <section>
          <SectionTitle title="Continue your learning" link="Browse all" href={getSecureHref("/my-courses")} />
          <div className="grid gap-4 md:grid-cols-2">
            <CourseProgressCard course={courses[0]} />
            <CourseProgressCard course={courses[1]} />
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

function CourseProgressCard({ course }: { course: typeof courses[number] }) {
  return <Link href={createSecureUrl("/courses", { courseId: course.id })} className="card-surface group overflow-hidden"><div className="relative h-[125px] overflow-hidden"><img src={course.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#17223d]/70 to-transparent" /><span className="absolute bottom-3 left-4 rounded-md bg-white/15 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md">{course.category}</span><button onClick={(e) => { e.preventDefault(); toast.success("Course bookmarked"); }} className="absolute right-3 top-3 rounded-lg bg-black/20 p-2 text-white backdrop-blur-md hover:bg-black/40"><Bookmark className="h-3.5 w-3.5" /></button></div><div className="p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-bold text-[#17223d] dark:text-white">{course.title}</h3><p className="mt-1 text-xs text-[#9aa4bc]">Next: Sliding Window Patterns</p></div><span className="text-xs font-bold text-[#3157e8]">{course.progress}%</span></div><div className="mt-4"><ProgressBar value={course.progress} color={course.accent === "violet" ? "#7f5af0" : "#3157e8"} /></div></div></Link>;
}

function ActivityRow({ item, last }: { item: typeof activity[number]; last: boolean }) { const Icon = item.icon; const colors = { blue: "bg-[#eaf0ff] text-[#3157e8]", emerald: "bg-[#e4f8ee] text-[#23a26d]", violet: "bg-[#f0eaff] text-[#7f5af0]", amber: "bg-[#fff4db] text-[#d68c20]" }; return <div className="flex items-center gap-3 py-4"><span className={cx("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", colors[item.color as keyof typeof colors])}><Icon className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-[#17223d] dark:text-white">{item.title}</p><p className="mt-0.5 truncate text-xs text-[#9aa4bc]">{item.subtitle}</p></div><span className="shrink-0 text-[10px] font-medium text-[#a5aec2]">{item.time}</span>{!last && <span className="sr-only">divider</span>}</div>; }

function UpcomingSessions() { return <section><SectionTitle title="Upcoming sessions" link="Calendar" href={getSecureHref("/announcements")} /><div className="card-surface divide-y divide-[#edf0f6] px-5 dark:divide-white/10"><SessionRow day="18" month="SEP" title="Live DSA clinic" meta="Thursday · 7:30 PM" tone="blue" /><SessionRow day="21" month="SEP" title="Mock interview #02" meta="Sunday · 11:00 AM" tone="violet" /><SessionRow day="24" month="SEP" title="Guest session: Google" meta="Wednesday · 6:00 PM" tone="amber" /></div></section>; }
function SessionRow({ day, month, title, meta, tone }: { day: string; month: string; title: string; meta: string; tone: "blue" | "violet" | "amber" }) { const tones = { blue: "bg-[#eaf0ff] text-[#3157e8]", violet: "bg-[#f0eaff] text-[#7f5af0]", amber: "bg-[#fff4db] text-[#d68c20]" }; return <div className="flex items-center gap-3 py-4"><div className={cx("flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl", tones[tone])}><span className="text-[9px] font-bold uppercase">{month}</span><span className="font-display text-lg font-bold leading-4">{day}</span></div><div className="min-w-0"><p className="truncate text-sm font-bold text-[#17223d] dark:text-white">{title}</p><p className="mt-1 text-xs text-[#9aa4bc]">{meta}</p></div><ChevronRight className="ml-auto h-4 w-4 shrink-0 text-[#c4cada]" /></div>; }
function AssignmentsWidget() { return <section><SectionTitle title="Pending assignments" link="See all" href={getSecureHref("/assignments")} /><div className="card-surface px-5"><AssignmentRow title="Arrays checkpoint" course="DSA Foundations" due="Due tomorrow" urgent /><AssignmentRow title="System design reflection" course="Placement Sprint" due="Due in 4 days" /><AssignmentRow title="Portfolio review" course="Frontend Interview Lab" due="Due Sep 28" /></div></section>; }
function AssignmentRow({ title, course, due, urgent }: { title: string; course: string; due: string; urgent?: boolean }) { return <div className="flex items-start gap-3 border-b border-[#edf0f6] py-4 last:border-0 dark:border-white/10"><span className={cx("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", urgent ? "bg-[#fff0ed] text-[#ef8354]" : "bg-[#f0f2f8] text-[#7c87a4] dark:bg-white/10")}><ClipboardCheck className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[#17223d] dark:text-white">{title}</p><p className="mt-1 truncate text-[10px] text-[#9aa4bc]">{course}</p></div><span className={cx("shrink-0 text-[10px] font-bold", urgent ? "text-[#ef8354]" : "text-[#9aa4bc]")}>{due}</span></div>; }

function CoursesPage() {
  const [category, setCategory] = useState("All courses");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("Popular");
  const categories = ["All courses", "DSA", "Placement", "Web development", "System design"];
  const sortOptions = [
    { label: "Sort: Popular", value: "Popular" },
    { label: "Sort: Highest rated", value: "Rating" },
    { label: "Sort: Price (Low to High)", value: "PriceLow" },
    { label: "Sort: Price (High to Low)", value: "PriceHigh" },
  ];

  let filtered = courses.filter(course => (category === "All courses" || course.category === category) && course.title.toLowerCase().includes(query.toLowerCase()));
  if (sortBy === "Rating") {
    filtered = [...filtered].sort((a, b) => Number(b.rating) - Number(a.rating));
  } else if (sortBy === "PriceLow") {
    filtered = [...filtered].sort((a, b) => parseInt(a.price.replace(/[^\d]/g, "")) - parseInt(b.price.replace(/[^\d]/g, "")));
  } else if (sortBy === "PriceHigh") {
    filtered = [...filtered].sort((a, b) => parseInt(b.price.replace(/[^\d]/g, "")) - parseInt(a.price.replace(/[^\d]/g, "")));
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
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-semibold text-[#9aa4bc]">
          Showing <span className="text-[#17223d] dark:text-white">{filtered.length} courses</span>
        </p>
        <div className="hidden items-center gap-2 text-xs font-semibold text-[#9aa4bc] sm:flex">
          <span className="h-2 w-2 rounded-full bg-[#48c58a]" /> Updated weekly
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
        {filtered.length === 0 && (
          <div className="card-surface col-span-full p-10 text-center">
            <Search className="mx-auto h-8 w-8 text-[#c4cada]" />
            <p className="mt-3 text-sm font-bold text-[#17223d] dark:text-white">No courses found</p>
            <p className="mt-1 text-xs text-[#9aa4bc]">Try another keyword or category.</p>
          </div>
        )}
      </div>
    </>
  );
}

function CourseCard({ course }: { course: typeof courses[number] }) {
  const router = useRouter();
  const { isEnrolled } = useEnrollments();
  const enrolled = isEnrolled(course.id) || isEnrolled(course.id.toLowerCase());

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
            <div>
              <p className="text-[10px] text-white/60">By {course.instructor}</p>
              <p className="mt-1 font-display text-xl font-bold tracking-[-0.04em]">
                {course.title}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold">
              <Star className="h-3.5 w-3.5 fill-[#ffca63] text-[#ffca63]" />
              {course.rating}
            </div>
          </div>
        </div>
        <div className="p-4">
          <p className="line-clamp-2 min-h-[40px] text-sm leading-5 text-[#7c87a4]">
            {course.description}
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
        <span className="font-display text-lg font-bold text-[#17223d] dark:text-white">
          {course.price}
        </span>
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
  const { isEnrolled } = useEnrollments();
  const course = courses.find((item) => item.id === courseId || item.slug === courseId) || courses[0];
  const [openModule, setOpenModule] = useState(0);
  const enrolled = isEnrolled(course.id) || isEnrolled(course.id.toLowerCase());

  const modules = [
    { title: "Getting started with problem solving", lessons: 6, duration: "42 min", complete: 6 },
    { title: "Arrays & Hashing", lessons: 8, duration: "1h 26 min", complete: 8 },
    { title: "Sliding Window Patterns", lessons: 7, duration: "1h 18 min", complete: 3 },
    { title: "Two pointers & stacks", lessons: 6, duration: "1h 04 min", complete: 0 },
    { title: "Trees, graphs & recursion", lessons: 9, duration: "2h 10 min", complete: 0 },
  ];

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
            {enrolled && (
              <span className="flex items-center gap-1 rounded-md bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                <Check className="h-3.5 w-3.5 stroke-[3]" /> Enrolled & Active
              </span>
            )}
          </div>
          <h1 className="font-display text-3xl font-bold tracking-[-0.05em] sm:text-5xl">{course.title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
            {course.subtitle || course.description} Learn a repeatable framework for breaking down unfamiliar problems, communicating trade-offs, and shipping answers you can stand behind.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs font-semibold text-white/65">
            <span className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-[#ffca63] text-[#ffca63]" /> {course.rating} rating
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> {course.students} learners
            </span>
            <span className="flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" /> {course.duration}
            </span>
            <span className="flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5" /> Certificate included
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
          <section>
            <SectionTitle title="What you’ll learn" />
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Think in patterns instead of memorizing solutions",
                "Write clean, testable code under time pressure",
                "Choose the right data structure with confidence",
                "Explain your approach like an interviewer can follow",
              ].map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-xl bg-white p-4 text-sm font-semibold leading-5 text-[#52617f] shadow-[0_6px_15px_rgba(23,34,61,0.03)] dark:bg-white/5 dark:text-white/75"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#23a26d]" />
                  {item}
                </div>
              ))}
            </div>
          </section>
          <section>
            <SectionTitle title="Course curriculum" />
            <div className="card-surface overflow-hidden">
              {modules.map((module, index) => (
                <div key={module.title} className="border-b border-[#edf0f6] last:border-0 dark:border-white/10">
                  <button
                    onClick={() => setOpenModule(openModule === index ? -1 : index)}
                    className="flex w-full items-center gap-3 p-4 text-left sm:p-5"
                  >
                    <span
                      className={cx(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                        module.complete === module.lessons ? "bg-[#e4f8ee] text-[#23a26d]" : "bg-[#eef2ff] text-[#3157e8]"
                      )}
                    >
                      {module.complete === module.lessons ? <Check className="h-4 w-4" /> : String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-[#17223d] dark:text-white">{module.title}</span>
                      <span className="mt-1 block text-xs text-[#9aa4bc]">
                        {module.lessons} lessons · {module.duration}
                      </span>
                    </span>
                    <ChevronDown
                      className={cx("h-4 w-4 text-[#9aa4bc] transition-transform", openModule === index && "rotate-180")}
                    />
                  </button>
                  {openModule === index && (
                    <div className="border-t border-[#edf0f6] bg-[#fafbfe] px-5 pb-4 pt-2 dark:border-white/10 dark:bg-white/[0.02]">
                      {Array.from({ length: Math.min(module.lessons, 4) }).map((_, lessonIndex) => (
                        <Link
                          href={lessonIndex < module.complete || enrolled ? getSecureHref("/learn") : createSecureUrl("/courses", { courseId: course.id, v: "checkout" })}
                          key={lessonIndex}
                          className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-[#f0f3fb] dark:hover:bg-white/5"
                        >
                          <span
                            className={cx(
                              "flex h-6 w-6 items-center justify-center rounded-full",
                              lessonIndex < module.complete
                                ? "bg-[#e4f8ee] text-[#23a26d]"
                                : "bg-white text-[#9aa4bc] dark:bg-white/10"
                            )}
                          >
                            {lessonIndex < module.complete ? <Check className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                          </span>
                          <span className="flex-1 text-xs font-semibold text-[#5f6c8c] dark:text-white/70">
                            {module.title} · Lesson {lessonIndex + 1}
                          </span>
                          <span className="text-[10px] text-[#9aa4bc]">{12 + lessonIndex * 4} min</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
        <aside className="space-y-5">
          {!enrolled ? (
            <div className="card-surface p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9aa4bc]">Standard License</span>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Save 40%</span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold tracking-tight text-[#17223d] dark:text-white">{course.price}</span>
                <span className="text-xs text-[#9aa4bc] line-through">₹4,999</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-[#7c87a4]">
                Get lifetime access to this entire course, code templates, assignments, and verified completion certificate.
              </p>
              <Link
                href={createSecureUrl("/courses", { courseId: course.id, v: "checkout" })}
                className="mt-5 w-full button-primary flex items-center justify-center gap-2 py-3 shadow-[0_8px_20px_rgba(49,87,232,0.3)] transition-all hover:scale-[1.02] active:scale-95 text-center"
              >
                <CreditCard className="h-4 w-4" />
                Enroll with Razorpay
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
                <span className="mb-1 text-xs font-semibold text-[#9aa4bc]">18 / 26 lessons</span>
              </div>
              <div className="mt-4">
                <ProgressBar value={course.progress} />
              </div>
              <p className="mt-4 text-xs leading-5 text-[#9aa4bc]">
                You’re ahead of 72% of learners in this cohort. Keep that momentum.
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
                AJ
              </span>
              <div>
                <p className="text-sm font-bold text-[#17223d] dark:text-white">{course.instructor}</p>
                <p className="mt-0.5 text-xs text-[#9aa4bc]">{course.instructorRole || "Full Stack Engineer • Mentor"}</p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-5 text-[#7c87a4]">
              Senior software engineer & educator dedicated to helping students crack tier-1 product companies and placements.
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
  const { isEnrolled, refreshEnrollments } = useEnrollments();
  const course = courses.find((item) => item.id === courseId || item.slug === courseId) || courses[0];
  const [isProcessing, setIsProcessing] = useState(false);
  const enrolled = isEnrolled(course.id) || isEnrolled(course.slug || course.id);

  const numericPrice = course.price.replace(/[^\d]/g, "") || "2499";
  const basePriceNumber = parseInt(numericPrice, 10);
  const platformFee = 10;
  const totalAmountNumber = basePriceNumber + platformFee;

  const formattedBasePrice = `₹ ${basePriceNumber.toLocaleString("en-IN")}`;
  const formattedTotalPrice = `₹ ${totalAmountNumber.toLocaleString("en-IN")}`;

  const handleProceedToPay = async () => {
    if (enrolled) {
      toast.info("You are already enrolled in this course!");
      router.push(getSecureHref("/learn"));
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
                <p className="font-display text-lg font-black leading-tight tracking-tight">
                  {course.id === "dsa-foundations" ? "DSA" : course.title.split(" ")[0]}
                </p>
                <p className="text-[10px] font-medium text-white/80">
                  {course.id === "dsa-foundations" ? "for Placements" : course.title.split(" ").slice(1).join(" ")}
                </p>
              </div>
              <div className="flex items-center justify-end">
                {course.id === "dsa-foundations" ? (
                  <PythonLogo className="h-6 w-6" />
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/15 backdrop-blur-sm">
                    <Code2 className="h-3.5 w-3.5 text-yellow-400" />
                  </span>
                )}
              </div>
            </div>

            {/* Course Meta Info */}
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-base font-bold text-[#0f172a] dark:text-white">
                {course.title}
              </h3>
              <p className="mt-1 text-xs leading-5 text-[#64748b] dark:text-slate-400">
                {course.subtitle || course.description}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-[#64748b] dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <BarChart2 className="h-3.5 w-3.5 text-[#0066ff]" />
                  {course.level || "Beginner to Advanced"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5 text-[#0066ff]" />
                  {course.duration || "4 Months"}
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
                  alt={course.instructor || "Abhishek Jujjuvarapu"}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-sm font-bold text-[#0f172a] dark:text-white">
                  {course.instructor || "Abhishek Jujjuvarapu"}
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#1877f2] text-white">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                </p>
                <p className="text-xs text-[#64748b] dark:text-slate-400">
                  {course.instructorRole || "Full Stack Engineer • Mentor"}
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
              <span className="font-semibold text-[#0f172a] dark:text-white">{formattedBasePrice}</span>
            </div>
            <div className="flex items-center justify-between text-[#64748b] dark:text-slate-400">
              <span>Discount</span>
              <span className="font-semibold text-[#059669] dark:text-emerald-400">- ₹ 0</span>
            </div>
            <div className="flex items-center justify-between text-[#64748b] dark:text-slate-400">
              <span>Platform Fee</span>
              <span className="font-semibold text-[#0f172a] dark:text-white">₹ 10</span>
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
            <span>{isProcessing ? "Connecting to Razorpay..." : `Proceed to Pay ${formattedTotalPrice}`}</span>
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
  const [filter, setFilter] = useState("All");

  const enrolledCount = Math.max(courses.length, enrollments.length);
  const filtered = courses.filter((c) =>
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
            <p className="font-display text-2xl font-bold text-[#17223d] dark:text-white">01</p>
            <p className="text-xs text-[#9aa4bc]">Certificate earned</p>
          </div>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((course) => (
          <MyCourseCard key={course.id} course={course} />
        ))}
      </div>
    </>
  );
}

function MyCourseCard({ course }: { course: typeof courses[number] }) {
  return (
    <div className="card-surface group overflow-hidden">
      <div className="relative h-36 overflow-hidden">
        <img src={course.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#17223d]/75 to-transparent" />
        <span className="absolute bottom-3 left-4 rounded-md bg-white/15 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md">
          {course.progress === 100 ? "Completed" : "In progress"}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-bold tracking-[-0.03em] text-[#17223d] dark:text-white">{course.title}</h3>
        <p className="mt-1 text-xs text-[#9aa4bc]">Last opened 2 hours ago</p>
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
            {tab !== "Notes" && (
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

function PracticePage() {
  const [difficulty, setDifficulty] = useState("All");
  const [topic, setTopic] = useState("All topics");
  const [saved, setSaved] = useState<string[]>([]);
  const filtered = problems.filter(
    (p) =>
      (difficulty === "All" || p.difficulty === difficulty) &&
      (topic === "All topics" || p.topic === topic)
  );

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
          <p className="text-xs font-semibold text-[#9aa4bc]">Solved this month</p>
          <p className="mt-2 font-display text-3xl font-bold text-[#17223d] dark:text-white">24</p>
          <div className="mt-3">
            <ProgressBar value={72} color="#23a26d" />
          </div>
          <p className="mt-2 text-[10px] font-bold text-[#23a26d]">+8 from last month</p>
        </div>
        <div className="card-surface p-5">
          <p className="text-xs font-semibold text-[#9aa4bc]">Current accuracy</p>
          <p className="mt-2 font-display text-3xl font-bold text-[#17223d] dark:text-white">
            78<span className="text-base">%</span>
          </p>
          <p className="mt-3 text-[10px] font-bold text-[#3157e8]">Top 18% of your cohort</p>
        </div>
        <div className="card-surface p-5">
          <p className="text-xs font-semibold text-[#9aa4bc]">Next milestone</p>
          <p className="mt-2 font-display text-3xl font-bold text-[#17223d] dark:text-white">
            50 <span className="text-sm font-semibold text-[#9aa4bc]">solved</span>
          </p>
          <p className="mt-3 text-[10px] font-bold text-[#d68c20]">26 more to unlock badge</p>
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["All", "Easy", "Medium", "Hard"].map((item) => (
            <button
              key={item}
              onClick={() => setDifficulty(item)}
              className={cx(
                "rounded-full px-4 py-2 text-xs font-bold",
                difficulty === item
                  ? "bg-[#17223d] text-white dark:bg-[#3157e8]"
                  : "bg-white text-[#7c87a4] dark:bg-white/5"
              )}
            >
              {item}
            </button>
          ))}
        </div>
        <CustomDropdown
          value={topic}
          onChange={setTopic}
          options={["All topics", "Arrays", "Strings", "Stack", "Trees", "Graphs"]}
          icon={<Code2 className="h-4 w-4 text-[#9aa4bc]" />}
        />
      </div>
      <div className="mt-5 card-surface overflow-hidden">
        <div className="hidden grid-cols-[minmax(0,1fr)_130px_110px_110px_54px] gap-4 border-b border-[#edf0f6] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#9aa4bc] dark:border-white/10 sm:grid">
          <span>Problem</span>
          <span>Difficulty</span>
          <span>Acceptance</span>
          <span>Status</span>
          <span />
        </div>
        {filtered.map((problem) => (
          <div
            key={problem.title}
            className="grid gap-3 border-b border-[#edf0f6] px-5 py-4 last:border-0 dark:border-white/10 sm:grid-cols-[minmax(0,1fr)_130px_110px_110px_54px] sm:items-center sm:gap-4"
          >
            <div className="flex min-w-0 items-start gap-3">
              <span
                className={cx(
                  "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                  problem.solved
                    ? "bg-[#e4f8ee] text-[#23a26d]"
                    : "bg-[#f1f3f8] text-[#9aa4bc] dark:bg-white/10"
                )}
              >
                <Code2 className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <Link
                  href={createSecureUrl("/practice", {
                    slug: problem.title.toLowerCase().replace(/\s+/g, "-"),
                  })}
                  className="block truncate text-sm font-bold text-[#17223d] hover:text-[#3157e8] dark:text-white"
                >
                  {problem.title}
                </Link>
                <p className="mt-1 text-[10px] text-[#9aa4bc]">
                  {problem.topic} · {problem.attempts} attempts
                </p>
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
            <span className="text-xs font-semibold text-[#7c87a4]">{problem.acceptance}</span>
            <span
              className={cx(
                "w-fit text-xs font-bold",
                problem.solved ? "text-[#23a26d]" : "text-[#9aa4bc]"
              )}
            >
              {problem.solved ? "Solved" : "Not started"}
            </span>
            <button
              onClick={() =>
                setSaved(
                  saved.includes(problem.title)
                    ? saved.filter((item) => item !== problem.title)
                    : [...saved, problem.title]
                )
              }
              className={cx(
                "justify-self-start rounded-lg p-2",
                saved.includes(problem.title) ? "text-[#3157e8]" : "text-[#b6bfd0] hover:text-[#3157e8]"
              )}
            >
              <Bookmark className={cx("h-4 w-4", saved.includes(problem.title) && "fill-current")} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function ProgressPage() {
  const [timeframe, setTimeframe] = useState("Last 14 days");
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
            {courses.slice(0, 3).map((course) => (
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
            ))}
          </div>
        </section>
        <section>
          <SectionTitle title="Practice statistics" link="Practice" href="/practice" />
          <div className="card-surface grid grid-cols-3 divide-x divide-[#edf0f6] p-5 dark:divide-white/10">
            <div className="px-2 text-center">
              <p className="font-display text-3xl font-bold text-[#23a26d]">24</p>
              <p className="mt-2 text-[10px] font-bold text-[#9aa4bc]">Easy solved</p>
            </div>
            <div className="px-2 text-center">
              <p className="font-display text-3xl font-bold text-[#d68c20]">15</p>
              <p className="mt-2 text-[10px] font-bold text-[#9aa4bc]">Medium solved</p>
            </div>
            <div className="px-2 text-center">
              <p className="font-display text-3xl font-bold text-[#ef8354]">03</p>
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
  const announcements = [
    {
      title: "Your next live clinic is this Thursday",
      category: "Live session",
      date: "Sep 12, 2025",
      body: "Bring one problem you got stuck on. We’ll break it down together and leave time for open Q&A.",
    },
    {
      title: "New practice set: trees & graphs",
      category: "New content",
      date: "Sep 09, 2025",
      body: "12 fresh problems are now available in the practice room, with hints written by your mentors.",
    },
    {
      title: "Mock interview week is open",
      category: "Important",
      date: "Sep 05, 2025",
      body: "Book your slot before September 20 and use the prep checklist to make the most of your 45 minutes.",
    },
  ];
  return (
    <>
      <PageHeader
        eyebrow="Stay in the loop"
        title="Announcements"
        description="The latest from your instructors, cohort, and learning community."
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          {announcements.map((item, index) => (
            <article key={item.title} className="card-surface p-5 sm:p-6">
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
                      {item.category}
                    </span>
                    <span className="text-[10px] text-[#aab3c5]">{item.date}</span>
                  </div>
                  <h2 className="mt-3 font-display text-lg font-bold tracking-[-0.03em] text-[#17223d] dark:text-white">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#7c87a4]">{item.body}</p>
                  <button
                    onClick={() => toast.success("Announcement marked as read")}
                    className="mt-4 text-xs font-bold text-[#3157e8]"
                  >
                    Mark as read
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
        <aside className="card-surface h-fit p-5">
          <p className="text-xs font-bold text-[#7c87a4]">Upcoming reminders</p>
          <div className="mt-4 space-y-4">
            <Reminder icon={AlarmClock} title="Arrays checkpoint" meta="Due tomorrow" color="amber" />
            <Reminder icon={Video} title="Live DSA clinic" meta="Thu, 7:30 PM" color="blue" />
            <Reminder icon={Target} title="Mock interview" meta="Book by Sep 20" color="violet" />
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

function AssignmentsPage() { const [submitted, setSubmitted] = useState(false); return <><PageHeader eyebrow="Show your work" title="Assignments" description="Turn your practice into proof with thoughtful submissions and mentor feedback." /><div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"><section className="card-surface p-5 sm:p-7"><div className="flex items-start gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff0ed] text-[#ef8354]"><ClipboardCheck className="h-5 w-5" /></span><div><span className="rounded-md bg-[#fff0ed] px-2 py-1 text-[10px] font-bold text-[#ef8354]">Due tomorrow</span><h2 className="mt-3 font-display text-2xl font-bold tracking-[-0.04em] text-[#17223d] dark:text-white">Arrays checkpoint</h2><p className="mt-1 text-xs text-[#9aa4bc]">DSA Foundations · Module 02</p></div></div><div className="mt-7 rounded-xl bg-[#f7f9fc] p-5 dark:bg-white/5"><p className="text-sm font-bold text-[#17223d] dark:text-white">Instructions</p><p className="mt-2 text-sm leading-6 text-[#7c87a4]">Choose two array problems from this module and explain your approach, complexity, and one edge case you intentionally handled. Include code that another learner could review.</p></div><label className="mt-6 block text-xs font-bold text-[#52617f] dark:text-white/80">Your submission</label><textarea placeholder="Paste your explanation or solution here..." className="mt-2 min-h-[150px] w-full resize-none rounded-xl border border-[#e5e8f0] bg-white p-4 text-sm outline-none focus:border-[#9db3ff] focus:ring-4 focus:ring-[#3157e8]/10 dark:border-white/10 dark:bg-white/5 dark:text-white" /><div className="mt-4 grid gap-3 sm:grid-cols-2"><button onClick={() => toast.info("File upload opened")} className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#cbd4e5] py-4 text-xs font-bold text-[#7c87a4] hover:border-[#3157e8] hover:text-[#3157e8] dark:border-white/15"><Plus className="h-4 w-4" /> Attach a file</button><button onClick={() => toast.info("GitHub link field ready")} className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#cbd4e5] py-4 text-xs font-bold text-[#7c87a4] hover:border-[#3157e8] hover:text-[#3157e8] dark:border-white/15"><Github className="h-4 w-4" /> Add GitHub link</button></div><div className="mt-6 flex justify-end"><button onClick={() => { setSubmitted(true); toast.success("Assignment submitted for review"); }} className="button-primary"><Send className="h-4 w-4" /> {submitted ? "Submitted" : "Submit assignment"}</button></div></section><aside className="space-y-5"><div className="card-surface p-5"><p className="text-xs font-bold text-[#7c87a4]">Submission history</p><div className="mt-4 space-y-4"><div className="flex items-start gap-3"><span className="mt-0.5 h-2 w-2 rounded-full bg-[#23a26d]" /><div><p className="text-xs font-bold text-[#17223d] dark:text-white">Placement reflection</p><p className="mt-1 text-[10px] text-[#9aa4bc]">Reviewed · Sep 08, 2025</p></div></div><div className="flex items-start gap-3"><span className="mt-0.5 h-2 w-2 rounded-full bg-[#ffca63]" /><div><p className="text-xs font-bold text-[#17223d] dark:text-white">Portfolio review</p><p className="mt-1 text-[10px] text-[#9aa4bc]">Pending · Sep 04, 2025</p></div></div></div></div><div className="rounded-2xl bg-[#eaf0ff] p-5 dark:bg-[#3157e8]/20"><Headphones className="h-5 w-5 text-[#3157e8]" /><p className="mt-4 text-sm font-bold text-[#17223d] dark:text-white">Need a second pair of eyes?</p><p className="mt-2 text-xs leading-5 text-[#5f6c8c] dark:text-white/65">Ask your cohort in Community or bring the question to your next clinic.</p><Link href={getSecureHref("/community")} className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#3157e8]">Open community <ArrowRight className="h-3.5 w-3.5" /></Link></div></aside></div></>; }

function ProfilePage() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
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
              <p className="font-display text-lg font-bold text-[#17223d] dark:text-white">04</p>
              <p className="mt-1 text-[9px] text-[#9aa4bc]">Courses</p>
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-bold text-[#17223d] dark:text-white">42</p>
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
  const content = useMemo(() => {
    switch (page) {
      case "courses": return <CoursesPage />;
      case "course-detail": return <CourseDetail courseId={courseId} />;
      case "checkout": return <EnrollmentCheckoutPage courseId={courseId} />;
      case "my-courses": return <MyCoursesPage />;
      case "learn": return <PlayerPage />;
      case "practice": return <PracticePage />;
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
  return <AppShell>{content}</AppShell>;
}
