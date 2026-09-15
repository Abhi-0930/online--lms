import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import AdminProfileDropdown from "./AdminProfileDropdown";
import {
  Activity,
  BarChart3,
  BookOpen,
  BrainCircuit,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  Video,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const navigation = [
  {
    label: "Workspace",
    items: [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "courses", label: "Courses", icon: BookOpen, badge: "24" },
      { id: "students", label: "Students", icon: Users },
    ],
  },
  {
    label: "Learning operations",
    items: [
      { id: "content", label: "Content library", icon: ListChecks },
      { id: "assessments", label: "Assessments", icon: ClipboardCheck, badge: "8" },
      { id: "live", label: "Live & recorded", icon: Video },
      { id: "payments", label: "Payments", icon: CircleDollarSign },
    ],
  },
  {
    label: "Insights",
    items: [
      { id: "feedback", label: "Feedback", icon: FileText },
      { id: "reports", label: "Reports", icon: BarChart3 },
      { id: "audit", label: "Audit logs", icon: ShieldCheck },
    ],
  },
];

export const navLabelMap: Record<string, string> = {
  ...Object.fromEntries(navigation.flatMap((group) => group.items.map((item) => [item.id, item.label]))),
  settings: "Settings",
};

function getHash() {
  return window.location.hash.replace("#", "") || "overview";
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { adminUser, logout } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(getHash);

  useEffect(() => {
    const syncHash = () => setActiveSection(getHash());
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  const displayName = adminUser?.name || "Abhishek";
  const displayEmail = adminUser?.email || "abhishek.j3094@gmail.com";
  const roleLabel = adminUser?.roleLabel || "Owner";
  const initials = adminUser?.avatar || "AJ";

  const activeLabel = useMemo(() => navLabelMap[activeSection] || "Overview", [activeSection]);

  const navigate = (id: string) => {
    window.location.hash = id;
    setActiveSection(id);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-ink)]">
      <div className="flex min-h-screen">
        {mobileOpen && (
          <button
            className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
        )}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-[var(--app-line)] bg-[var(--sidebar-bg)] px-4 py-5 transition-transform duration-200 lg:static lg:translate-x-0",
            collapsed ? "lg:w-[84px]" : "lg:w-[260px]",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className={cn("mb-7 flex items-center", collapsed ? "justify-center" : "justify-between")}>
            <button onClick={() => navigate("overview")} className="flex items-center gap-3 text-left">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#1a73e8] text-white shadow-md shadow-blue-500/20">
                <BookOpen className="h-5 w-5" />
              </span>
              {!collapsed && (
                <span>
                  <span className="block font-display text-[17px] font-bold tracking-tight text-[var(--app-ink)]">LearnHub</span>
                  <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Admin Workspace</span>
                </span>
              )}
            </button>
            <button className="icon-button lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <X className="h-4 w-4" />
            </button>
          </div>

          {!collapsed && (
            <div className="mb-5 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-3 py-3 dark:border-indigo-900/50 dark:bg-indigo-950/30">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-700 dark:text-indigo-300">
                <Sparkles className="h-3.5 w-3.5" />
                Spring cohort
              </div>
              <p className="mt-1.5 text-xs leading-5 text-indigo-900/70 dark:text-indigo-200/70">12 days left to hit the placement target.</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-indigo-200/70 dark:bg-indigo-900/60"><div className="h-full w-[76%] rounded-full bg-indigo-600" /></div>
            </div>
          )}

          <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto pr-1">
            {navigation.map((group) => (
              <div key={group.label}>
                {!collapsed && <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">{group.label}</p>}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = activeSection === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigate(item.id)}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold transition-all",
                          collapsed && "justify-center px-2",
                          active ? "bg-[var(--nav-active)] text-[var(--brand)] shadow-sm" : "text-[var(--muted)] hover:bg-slate-100 hover:text-[var(--app-ink)] dark:hover:bg-white/5",
                        )}
                      >
                        <Icon className={cn("h-[17px] w-[17px] shrink-0", active && "stroke-[2.5]")} />
                        {!collapsed && <><span className="min-w-0 flex-1 truncate">{item.label}</span>{item.badge && <span className={cn("rounded-md px-1.5 py-0.5 text-[10px]", active ? "bg-white/80 text-[var(--brand)]" : "bg-slate-100 text-[var(--muted)] dark:bg-white/10")}>{item.badge}</span>}</>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {!collapsed && (
            <div className="mt-5 border-t border-[var(--app-line)] pt-4 space-y-1">
              <button onClick={() => navigate("settings")} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[13px] font-semibold text-[var(--muted)] transition-colors hover:bg-slate-100 hover:text-[var(--app-ink)] dark:hover:bg-white/5 cursor-pointer">
                <Settings className="h-[17px] w-[17px]" /> Settings
              </button>
              <button onClick={toggleTheme} className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[13px] font-semibold text-[var(--muted)] transition-colors hover:bg-slate-100 hover:text-[var(--app-ink)] dark:hover:bg-white/5 cursor-pointer">
                <span className="flex items-center gap-3">
                  {theme === "dark" ? <Sun className="h-[17px] w-[17px]" /> : <Moon className="h-[17px] w-[17px]" />}
                  <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
                </span>
              </button>
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[13px] font-semibold text-[var(--muted)] transition-colors hover:bg-slate-100 hover:text-[var(--app-ink)] dark:hover:bg-white/5 cursor-pointer">
                <LifeBuoy className="h-[17px] w-[17px]" /> Help center
              </button>
            </div>
          )}

          <div className={cn("mt-4 border-t border-[var(--app-line)] pt-4", collapsed ? "flex justify-center" : "")}>
            {collapsed ? (
              <AdminProfileDropdown variant="topbar" align="start" />
            ) : (
              <AdminProfileDropdown variant="sidebar" align="start" />
            )}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Mobile hamburger floating toggle */}
          <div className="lg:hidden fixed top-3.5 left-3.5 z-40">
            <button className="icon-button bg-white shadow-md border border-[var(--app-line)] dark:bg-slate-900" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </button>
          </div>
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}

export { navigation };
