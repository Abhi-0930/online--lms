import React, { useEffect } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CustomAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: React.ReactNode | string;
  buttonText?: string;
  variant?: "danger" | "warning" | "info" | "success";
  icon?: React.ComponentType<{ className?: string }>;
}

export default function CustomAlertDialog({
  isOpen,
  onClose,
  title = "Notice",
  message,
  buttonText = "Got it",
  variant = "info",
  icon: CustomIcon,
}: CustomAlertDialogProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          iconBg: "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50",
          DefaultIcon: AlertCircle,
          btnBg: "bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20",
        };
      case "warning":
        return {
          iconBg: "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50",
          DefaultIcon: AlertTriangle,
          btnBg: "bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-600/20",
        };
      case "success":
        return {
          iconBg: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50",
          DefaultIcon: CheckCircle2,
          btnBg: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20",
        };
      case "info":
      default:
        return {
          iconBg: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50",
          DefaultIcon: Info,
          btnBg: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20",
        };
    }
  };

  const { iconBg, DefaultIcon, btnBg } = getVariantStyles();
  const IconComponent = CustomIcon || DefaultIcon;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-[#121620] p-6 shadow-2xl border border-slate-200/90 dark:border-white/10 animate-in zoom-in-95 duration-200 transition-all space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                iconBg
              )}
            >
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white leading-tight">
                {title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-1">
          {typeof message === "string" ? <p>{message}</p> : message}
        </div>

        <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-white/5">
          <button
            type="button"
            autoFocus
            onClick={onClose}
            className={cn(
              "rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer active:scale-[0.98]",
              btnBg
            )}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
