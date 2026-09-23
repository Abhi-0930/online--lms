import React, { useState, useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  X,
  FileText,
  PlayCircle,
  Code2,
  ClipboardCheck,
  Check,
  Trash2,
  Loader2,
  ChevronDown,
  Layers,
  Sparkles,
} from "lucide-react";
import { ContentItem } from "@/hooks/useLiveAdminData";

interface CustomDropdownProps {
  value: string;
  onChange: (val: string) => void;
  options: Array<{ value: string; label: string } | string>;
  placeholder?: string;
  className?: string;
}

function CustomDropdown({
  value,
  onChange,
  options,
  placeholder,
  className,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const formattedOptions = useMemo(
    () =>
      options.map((opt) =>
        typeof opt === "string" ? { value: opt, label: opt } : opt
      ),
    [options]
  );

  const selectedOption = formattedOptions.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder || value || "Select...";

  return (
    <div ref={containerRef} className={cn("relative inline-block w-full", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between gap-2.5 hover:bg-slate-100/70 dark:hover:bg-white/5 transition-all cursor-pointer shadow-xs select-none",
          isOpen && "ring-2 ring-indigo-500/20 border-indigo-500 bg-white dark:bg-[#151926] shadow-sm"
        )}
      >
        <span className="truncate text-left">{displayLabel}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200",
            isOpen && "rotate-180 text-indigo-600 dark:text-indigo-400"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 min-w-[180px] w-full max-h-56 overflow-y-auto rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] p-1.5 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          {formattedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition cursor-pointer select-none",
                  isSelected
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/5"
                )}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-indigo-400 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface EditContentModalProps {
  isOpen: boolean;
  item: ContentItem | null;
  onClose: () => void;
  onSave: (updated: ContentItem) => Promise<void> | void;
  onDelete?: (id: string | number) => Promise<void> | void;
  courses?: any[];
  instructors?: any[];
}

export default function EditContentModal({
  isOpen,
  item,
  onClose,
  onSave,
  onDelete,
  courses = [],
  instructors = [],
}: EditContentModalProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Video");
  const [parent, setParent] = useState("");
  const [owner, setOwner] = useState("Admin Team");
  const [status, setStatus] = useState("Published");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setType(item.type || "Video");
      setParent(item.parent || "");
      setOwner(item.owner || "Admin Team");
      setStatus(item.status || "Published");
      setError("");
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const courseOptions = courses.map((c) => c.title || c.name || String(c.id)).filter(Boolean);
  const parentOptions = [
    ...courseOptions.map((c) => ({ value: c, label: `Course: ${c}` })),
    { value: "General Library", label: "General Library" },
    { value: "Resources & Notes", label: "Resources & Notes" },
  ];

  const instructorOptions = instructors.length > 0
    ? instructors.map((i) => {
        const name = i.fullName || i.name || i.email || "Admin";
        return { value: name, label: `${name} (${i.role === "INSTRUCTOR" ? "Instructor" : "Admin"})` };
      })
    : [
        { value: "Admin Team", label: "Admin Team" },
        { value: "Abhishek J", label: "Abhishek J (Admin)" },
        { value: "Lead Instructor", label: "Lead Instructor" },
      ];

  const typeOptions = [
    "Video",
    "PDF",
    "Assignment",
    "Practice problem",
    "Resource",
    "Text",
    "Quiz",
  ];

  const statusOptions = ["Published", "Draft", "Review"];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Content title is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await onSave({
        ...item,
        title: title.trim(),
        type,
        parent: parent.trim() || "General Library",
        owner,
        status,
        updated: "Just now",
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to update content item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (window.confirm(`Are you sure you want to remove "${item.title}" from the content library?`)) {
      try {
        setIsDeleting(true);
        await onDelete(item.id);
        onClose();
      } catch (err: any) {
        setError(err?.message || "Failed to delete item");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121620] shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100/80 dark:border-indigo-900/50 shrink-0">
              {type === "Video" ? (
                <PlayCircle className="h-4 w-4" />
              ) : type === "Practice problem" ? (
                <Code2 className="h-4 w-4" />
              ) : type === "Assignment" ? (
                <ClipboardCheck className="h-4 w-4 text-emerald-600" />
              ) : (
                <FileText className="h-4 w-4 text-rose-500" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Edit Content Asset
              </h3>
              <p className="text-xs text-slate-400">
                Update learning asset title, category, course location, and visibility.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              Content Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError("");
              }}
              placeholder="e.g. Binary Search Masterclass, Dynamic Programming Notes"
              className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-4 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-semibold"
            />
          </div>

          {/* Type & Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Asset Type
              </label>
              <CustomDropdown
                value={type}
                onChange={(val) => setType(val)}
                options={typeOptions}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Visibility Status
              </label>
              <CustomDropdown
                value={status}
                onChange={(val) => setStatus(val)}
                options={statusOptions}
              />
            </div>
          </div>

          {/* Location / Parent Course */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              Course Location / Parent Track
            </label>
            {parentOptions.length > 2 ? (
              <CustomDropdown
                value={parent}
                onChange={(val) => setParent(val)}
                options={parentOptions}
                placeholder="Select course location"
              />
            ) : (
              <input
                type="text"
                value={parent}
                onChange={(e) => setParent(e.target.value)}
                placeholder="e.g. Full Stack Web Development · Backend Track"
                className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-4 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
              />
            )}
          </div>

          {/* Owner / Instructor */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              Designated Owner / Instructor
            </label>
            <CustomDropdown
              value={owner}
              onChange={(val) => setOwner(val)}
              options={instructorOptions}
            />
          </div>

          {error && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-xl border border-rose-200/60 dark:border-rose-900/40">
              {error}
            </p>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
            {onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-3 py-2 rounded-xl transition cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Asset</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isDeleting}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
