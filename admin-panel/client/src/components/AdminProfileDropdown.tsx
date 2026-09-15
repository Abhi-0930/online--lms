import React, { useState, useRef, useEffect } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { LogOut, Settings, LayoutDashboard, Shield, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AdminProfileDropdownProps {
  variant?: "topbar" | "sidebar";
  align?: "end" | "start";
}

export default function AdminProfileDropdown({
  variant = "topbar",
  align = "end",
}: AdminProfileDropdownProps) {
  const { adminUser, logout } = useAdminAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = adminUser?.name || "Abhishek";
  const displayEmail = adminUser?.email || "abhishek.j3094@gmail.com";
  const roleLabel = adminUser?.roleLabel || "Owner";
  const initials = adminUser?.avatar || "AJ";

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    toast.success("Signed out successfully.");
    logout();
  };

  const handleNavigate = (hash: string) => {
    window.location.hash = hash;
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      {variant === "topbar" ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "group flex items-center gap-2 rounded-full p-0.5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8] cursor-pointer",
            isOpen && "ring-2 ring-[#1a73e8]"
          )}
          aria-label="User profile menu"
          aria-expanded={isOpen}
        >
          <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-[11px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 group-hover:scale-105 transition-transform">
            {initials}
          </div>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-all hover:bg-slate-100 dark:hover:bg-white/5 outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8] cursor-pointer",
            isOpen && "bg-slate-100 dark:bg-white/5 ring-1 ring-slate-200 dark:ring-white/10"
          )}
          aria-label="User profile menu"
          aria-expanded={isOpen}
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white shadow-sm">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-[12px] font-bold text-[var(--app-ink)]">{displayName}</p>
              <span className="rounded-md bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                {roleLabel}
              </span>
            </div>
            <p className="truncate text-[11px] text-[var(--muted)]">{displayEmail}</p>
          </div>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-[var(--muted)] transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>
      )}

      {/* Floating Dropdown Menu Card */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-[100] mt-2 w-64 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:border-white/10 dark:bg-[#1e293b] animate-in fade-in zoom-in-95 duration-150",
            align === "end" ? "right-0 origin-top-right" : "left-0 origin-top-left",
            variant === "sidebar" && "bottom-full left-0 mb-2 mt-0 origin-bottom-left"
          )}
        >
          {/* User Details Header */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50/90 dark:bg-white/5 p-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-sm">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-[13px] font-bold text-slate-900 dark:text-white">
                  {displayName}
                </p>
                <span className="rounded bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">
                  {roleLabel}
                </span>
              </div>
              <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                {displayEmail}
              </p>
            </div>
          </div>

          {/* Nav Items */}
          <div className="mt-2 space-y-1">
            <button
              type="button"
              onClick={() => handleNavigate("overview")}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <LayoutDashboard className="h-4 w-4 text-slate-400" />
              <span>Workspace Overview</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigate("settings")}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              <span>Account & Settings</span>
            </button>
          </div>

          {/* Divider */}
          <div className="my-1.5 border-t border-slate-100 dark:border-white/10" />

          {/* Logout Action */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4 text-red-500" />
            <span>Log out</span>
          </button>
        </div>
      )}
    </div>
  );
}
