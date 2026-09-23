import React, { useState, useEffect } from "react";
import { AlertTriangle, Trash2, AlertCircle, Info, HelpCircle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CustomConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: React.ReactNode | string;
  targetName?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "warning" | "info" | "primary";
  isLoading?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

export default function CustomConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  targetName,
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "destructive",
  isLoading = false,
  icon: CustomIcon,
}: CustomConfirmDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const isBusy = isLoading || internalLoading;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isBusy) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isBusy, onClose]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "destructive":
        return {
          iconBg: "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 shadow-xs shadow-rose-500/10",
          DefaultIcon: Trash2,
          confirmBtn:
            "bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/25 active:scale-[0.98] border border-rose-700/30 focus:ring-rose-500",
        };
      case "warning":
        return {
          iconBg: "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50 shadow-xs shadow-amber-500/10",
          DefaultIcon: AlertTriangle,
          confirmBtn:
            "bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-600/25 active:scale-[0.98] border border-amber-700/30 focus:ring-amber-500",
        };
      case "info":
      case "primary":
      default:
        return {
          iconBg: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 shadow-xs shadow-indigo-500/10",
          DefaultIcon: HelpCircle,
          confirmBtn:
            "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/25 active:scale-[0.98] border border-indigo-700/30 focus:ring-indigo-500",
        };
    }
  };

  const { iconBg, DefaultIcon, confirmBtn } = getVariantStyles();
  const IconComponent = CustomIcon || DefaultIcon;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={() => {
        if (!isLoading) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-[#121620] p-6 shadow-2xl border border-slate-200/90 dark:border-white/10 animate-in zoom-in-95 duration-200 transition-all space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Icon and Close */}
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
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Action confirmation required
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Target name badge if present */}
        {targetName && (
          <div className="rounded-xl border border-slate-200/70 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] px-3.5 py-2.5 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0">
              Target:
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate font-mono">
              {targetName}
            </span>
          </div>
        )}

        {/* Main message body */}
        <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {typeof description === "string" ? (
            <p>{description}</p>
          ) : (
            description
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-white/5">
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition cursor-pointer shadow-xs disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            autoFocus
            onClick={async () => {
              try {
                setInternalLoading(true);
                await onConfirm();
              } finally {
                setInternalLoading(false);
              }
            }}
            disabled={isBusy}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-900",
              confirmBtn
            )}
          >
            {isBusy ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>
                  {confirmText.toLowerCase().includes("delete") || variant === "destructive"
                    ? "Deleting..."
                    : "Processing..."}
                </span>
              </>
            ) : (
              <>
                {variant === "destructive" && <Trash2 className="h-3.5 w-3.5" />}
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
