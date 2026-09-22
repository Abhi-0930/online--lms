import React, { useState, useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Megaphone,
  Send,
  Sparkles,
  Bell,
  Mail,
  Pin,
  MessageSquare,
  X,
  Check,
  Eye,
  Edit3,
  ExternalLink,
  ChevronDown,
  Layers,
  ArrowRight,
  Clock,
  Radio,
  FileText,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Save,
  Bold,
  Code,
  List,
  Link,
  Smile,
} from "lucide-react";
import {
  saveDraft,
  getDraft,
  clearDraft,
  formatTimeAgo,
} from "@/lib/draftManager";

export interface AnnouncementItem {
  id: string | number;
  title: string;
  category: string;
  cohort: string;
  author: string;
  body: string;
  date: string;
  channels: string[];
  ctaLabel?: string;
  ctaUrl?: string;
  isPinned?: boolean;
  status: "Published" | "Draft";
}

interface PostAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (announcement: AnnouncementItem) => void;
  onToast: (msg: string) => void;
  announcementToEdit?: AnnouncementItem | null;
}

const CATEGORIES = [
  { id: "Live Session", label: "Live Session", color: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
  { id: "Practice & Arena", label: "Practice & Arena", color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
  { id: "Assignment & Milestone", label: "Assignment & Milestone", color: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
  { id: "Contest & Sprint", label: "Contest & Sprint", color: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800" },
  { id: "Platform Notice", label: "Platform Notice", color: "bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border-pink-200 dark:border-pink-800" },
  { id: "Career & Placement", label: "Career & Placement", color: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800" },
  { id: "General", label: "General", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700" },
];

const COHORTS = [
  "All Cohorts & Learners",
  "DSA Placement Program 2026",
  "Full Stack Web Dev (Spring)",
  "System Design Masterclass",
  "Placement Screening Cohort",
  "Frontend Advanced Batch",
  "AI & ML Foundations",
];

const PRESET_TEMPLATES = [
  {
    icon: "🚀",
    name: "Live Masterclass",
    title: "🚀 Live System Design Clinic with FAANG Staff Engineer",
    category: "Live Session",
    cohort: "All Cohorts & Learners",
    channels: ["Email Digest", "In-App Notice", "Portal Banner"],
    ctaLabel: "Join Live Room",
    ctaUrl: "/announcements",
    body: "Join us this Thursday at 7:30 PM IST for an exclusive interactive breakdown of distributed caching, Kafka event streaming, and real-world system architecture. Bring your questions for open Q&A!",
  },
  {
    icon: "📢",
    name: "48h Coding Sprint",
    title: "📢 Weekend Dynamic Programming Marathon is Live!",
    category: "Contest & Sprint",
    cohort: "DSA Placement Program 2026",
    channels: ["In-App Notice", "Portal Banner", "Discord / Telegram"],
    ctaLabel: "Start Solving",
    ctaUrl: "/practice-problems",
    body: "The 48-hour DP Coding Marathon has officially begun! 12 hand-picked interview challenges from Google & Amazon are unlocked in the Practice Arena. Solve them to climb the batch leaderboard.",
  },
  {
    icon: "🛠️",
    name: "Maintenance Notice",
    title: "🛠️ Scheduled Platform Maintenance - Sunday 2:00 AM IST",
    category: "Platform Notice",
    cohort: "All Cohorts & Learners",
    channels: ["Email Digest", "Portal Banner"],
    ctaLabel: "Status Page",
    ctaUrl: "/announcements",
    body: "Skillforge servers will undergo scheduled infrastructure optimization this Sunday from 2:00 AM to 4:00 AM IST. Practice arenas and coding sandboxes may be briefly unavailable during this window.",
  },
  {
    icon: "📝",
    name: "Assignment Due",
    title: "📝 Assignment Checkpoint: Graph Algorithms & DFS/BFS",
    category: "Assignment & Milestone",
    cohort: "DSA Placement Program 2026",
    channels: ["Email Digest", "In-App Notice"],
    ctaLabel: "Submit Solution",
    ctaUrl: "/assignments",
    body: "Friendly reminder that the Graph Algorithms assignment is due this Friday by 11:59 PM IST. Ensure your GitHub repo link or code submission passes all public test cases before the deadline.",
  },
  {
    icon: "💼",
    name: "Mock Interviews",
    title: "💼 1-on-1 Mock Interview Booking Window is Open",
    category: "Career & Placement",
    cohort: "Placement Screening Cohort",
    channels: ["Email Digest", "In-App Notice", "Portal Banner"],
    ctaLabel: "Book 45m Slot",
    ctaUrl: "/announcements",
    body: "Mock technical screening slots with industry mentors are now available for booking. Reserve your 45-minute slot and review the prep checklist before your scheduled interview.",
  },
];

export default function PostAnnouncementModal({
  isOpen,
  onClose,
  onSuccess,
  onToast,
  announcementToEdit,
}: PostAnnouncementModalProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Live Session");
  const [cohort, setCohort] = useState("All Cohorts & Learners");
  const [author, setAuthor] = useState("Admin Team");
  const [body, setBody] = useState("");
  const [channels, setChannels] = useState<string[]>([
    "Email Digest",
    "In-App Notice",
    "Portal Banner",
  ]);
  const [hasCta, setHasCta] = useState(false);
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [status, setStatus] = useState<"Published" | "Draft">("Published");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize or restore draft
  useEffect(() => {
    if (!isOpen) return;

    if (announcementToEdit) {
      setTitle(announcementToEdit.title || "");
      setCategory(announcementToEdit.category || "Live Session");
      setCohort(announcementToEdit.cohort || "All Cohorts & Learners");
      setAuthor(announcementToEdit.author || "Admin Team");
      setBody(announcementToEdit.body || "");
      setChannels(announcementToEdit.channels || ["Email Digest", "In-App Notice"]);
      setHasCta(Boolean(announcementToEdit.ctaLabel));
      setCtaLabel(announcementToEdit.ctaLabel || "");
      setCtaUrl(announcementToEdit.ctaUrl || "");
      setIsPinned(Boolean(announcementToEdit.isPinned));
      setStatus(announcementToEdit.status || "Published");
      setHasDraft(false);
    } else {
      const draft = getDraft<any>("announcement");
      if (draft && draft.data) {
        setTitle(draft.data.title || "");
        setCategory(draft.data.category || "Live Session");
        setCohort(draft.data.cohort || "All Cohorts & Learners");
        setAuthor(draft.data.author || "Admin Team");
        setBody(draft.data.body || "");
        setChannels(draft.data.channels || ["Email Digest", "In-App Notice", "Portal Banner"]);
        setHasCta(Boolean(draft.data.ctaLabel));
        setCtaLabel(draft.data.ctaLabel || "");
        setCtaUrl(draft.data.ctaUrl || "");
        setIsPinned(Boolean(draft.data.isPinned));
        setStatus(draft.data.status || "Published");
        setHasDraft(true);
      } else {
        // Reset defaults
        setTitle("");
        setCategory("Live Session");
        setCohort("All Cohorts & Learners");
        setAuthor("Admin Team");
        setBody("");
        setChannels(["Email Digest", "In-App Notice", "Portal Banner"]);
        setHasCta(false);
        setCtaLabel("");
        setCtaUrl("");
        setIsPinned(false);
        setStatus("Published");
        setHasDraft(false);
      }
    }
  }, [isOpen, announcementToEdit]);

  // Auto-save draft on changes
  useEffect(() => {
    if (!isOpen || announcementToEdit) return;

    if (title.trim() || body.trim()) {
      saveDraft(
        "announcement",
        {
          title,
          category,
          cohort,
          author,
          body,
          channels,
          ctaLabel: hasCta ? ctaLabel : "",
          ctaUrl: hasCta ? ctaUrl : "",
          isPinned,
          status,
        },
        { title: title.trim() || "Untitled Announcement" }
      );
      setHasDraft(true);
    }
  }, [isOpen, title, category, cohort, author, body, channels, hasCta, ctaLabel, ctaUrl, isPinned, status, announcementToEdit]);

  const toggleChannel = (channel: string) => {
    setChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  };

  const applyTemplate = (tpl: typeof PRESET_TEMPLATES[0]) => {
    setTitle(tpl.title);
    setCategory(tpl.category);
    setCohort(tpl.cohort);
    setChannels(tpl.channels);
    setBody(tpl.body);
    setHasCta(Boolean(tpl.ctaLabel));
    setCtaLabel(tpl.ctaLabel || "");
    setCtaUrl(tpl.ctaUrl || "");
    onToast(`Applied template "${tpl.name}"`);
  };

  const insertMarkdown = (prefix: string, suffix: string = "") => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = body.substring(start, end);
    const replacement = `${prefix}${selected || "text"}${suffix}`;
    const newBody = body.substring(0, start) + replacement + body.substring(end);
    setBody(newBody);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 10);
  };

  const handleClearDraft = () => {
    clearDraft("announcement");
    setTitle("");
    setCategory("Live Session");
    setCohort("All Cohorts & Learners");
    setBody("");
    setHasCta(false);
    setCtaLabel("");
    setCtaUrl("");
    setIsPinned(false);
    setStatus("Published");
    setHasDraft(false);
    onToast("Announcement draft discarded");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      onToast("Please enter an announcement title");
      return;
    }
    if (!body.trim()) {
      onToast("Please enter announcement message content");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newAnnouncement: AnnouncementItem = {
        id: announcementToEdit?.id || `ANN-${Date.now().toString().slice(-4)}`,
        title: title.trim(),
        category,
        cohort,
        author: author.trim() || "Admin Team",
        body: body.trim(),
        date: "Just now",
        channels: channels.length > 0 ? channels : ["In-App Notice"],
        ctaLabel: hasCta && ctaLabel.trim() ? ctaLabel.trim() : undefined,
        ctaUrl: hasCta && ctaUrl.trim() ? ctaUrl.trim() : undefined,
        isPinned,
        status,
      };

      // Clear draft on successful broadcast
      clearDraft("announcement");
      setHasDraft(false);
      setIsSubmitting(false);

      onSuccess(newAnnouncement);
      onToast(
        status === "Published"
          ? `🚀 Announcement broadcasted to ${cohort} via ${newAnnouncement.channels.join(", ")}!`
          : `Saved announcement draft successfully`
      );
      onClose();
    }, 350);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl my-auto rounded-2xl bg-[var(--card)] border border-[var(--app-line)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[var(--app-line)] bg-[var(--subtle-bg)]/50">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/20">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[var(--foreground)]">
                  {announcementToEdit ? "Edit Announcement" : "Broadcast Announcement"}
                </h2>
                {hasDraft && !announcementToEdit && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/60 px-2 py-0.5 rounded-full border border-pink-200 dark:border-pink-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" />
                    Draft Auto-Saved
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--muted)]">
                Send push alerts, email digest, and platform notices to student cohorts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch */}
            <div className="flex rounded-lg bg-[var(--card)] p-0.5 border border-[var(--app-line)]">
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all",
                  activeTab === "edit"
                    ? "bg-[var(--brand)] text-white shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                <Edit3 className="h-3.5 w-3.5" />
                Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all",
                  activeTab === "preview"
                    ? "bg-[var(--brand)] text-white shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                <Eye className="h-3.5 w-3.5" />
                Learner Preview
              </button>
            </div>

            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "edit" ? (
            <form id="announcement-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Quick Preset Starters */}
              {!announcementToEdit && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-pink-500" />
                      Quick Templates
                    </span>
                    {hasDraft && (
                      <button
                        type="button"
                        onClick={handleClearDraft}
                        className="text-[11px] text-rose-500 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" /> Clear draft
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.name}
                        type="button"
                        onClick={() => applyTemplate(tpl)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[var(--subtle-bg)] hover:bg-pink-50 hover:text-pink-700 hover:border-pink-300 dark:hover:bg-pink-950/40 dark:hover:text-pink-300 dark:hover:border-pink-800 border border-[var(--app-line)] transition-all"
                      >
                        <span>{tpl.icon}</span>
                        <span>{tpl.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                  Announcement Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 🚀 Live System Design Mock Interview with FAANG Staff Engineer"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/30 focus:border-[var(--brand)]"
                  required
                />
              </div>

              {/* Category & Cohort Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                    Category Tag
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/30 focus:border-[var(--brand)]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                    Target Cohort
                  </label>
                  <select
                    value={cohort}
                    onChange={(e) => setCohort(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/30 focus:border-[var(--brand)]"
                  >
                    {COHORTS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Broadcast Channels Selection */}
              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] mb-2">
                  Delivery Channels
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: "Email Digest", icon: Mail, label: "Email Alert", desc: "Inbox delivery" },
                    { id: "In-App Notice", icon: Bell, label: "In-App Badge", desc: "Navbar alerts" },
                    { id: "Portal Banner", icon: Pin, label: "Top Ribbon", desc: "Pinned banner" },
                    { id: "Discord / Telegram", icon: MessageSquare, label: "Cohort Chat", desc: "Channel webhook" },
                  ].map((ch) => {
                    const active = channels.includes(ch.id);
                    const Icon = ch.icon;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => toggleChannel(ch.id)}
                        className={cn(
                          "flex flex-col items-start p-3 rounded-xl border text-left transition-all",
                          active
                            ? "border-pink-500 bg-pink-50/70 text-pink-900 dark:bg-pink-950/40 dark:text-pink-200 dark:border-pink-600 shadow-sm"
                            : "border-[var(--app-line)] bg-[var(--card)] hover:bg-[var(--subtle-bg)] text-[var(--muted)]"
                        )}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <Icon className={cn("h-4 w-4", active ? "text-pink-600 dark:text-pink-400" : "text-[var(--muted)]")} />
                          <span
                            className={cn(
                              "h-3.5 w-3.5 rounded-full border flex items-center justify-center text-[9px]",
                              active
                                ? "border-pink-600 bg-pink-600 text-white"
                                : "border-slate-300 dark:border-slate-600"
                            )}
                          >
                            {active && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[var(--foreground)]">{ch.label}</span>
                        <span className="text-[10px] text-[var(--muted)]">{ch.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message Content with Markdown Toolbar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[var(--foreground)]">
                    Announcement Message <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => insertMarkdown("**", "**")}
                      className="p-1 text-xs rounded hover:bg-[var(--hover-bg)] text-[var(--muted)]"
                      title="Bold"
                    >
                      <Bold className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown("`", "`")}
                      className="p-1 text-xs rounded hover:bg-[var(--hover-bg)] text-[var(--muted)]"
                      title="Code"
                    >
                      <Code className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown("- ")}
                      className="p-1 text-xs rounded hover:bg-[var(--hover-bg)] text-[var(--muted)]"
                      title="Bullet List"
                    >
                      <List className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown("[Link Text](", ")")}
                      className="p-1 text-xs rounded hover:bg-[var(--hover-bg)] text-[var(--muted)]"
                      title="Link"
                    >
                      <Link className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <textarea
                  ref={textareaRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  placeholder="Type the full announcement message, key highlights, dates, or guidelines..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs font-normal leading-relaxed focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/30 focus:border-[var(--brand)]"
                  required
                />
              </div>

              {/* Action Button CTA (Optional) */}
              <div className="p-4 rounded-xl border border-[var(--app-line)] bg-[var(--subtle-bg)]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-[var(--brand)]" />
                    <div>
                      <span className="text-xs font-bold text-[var(--foreground)]">Attach Action Button</span>
                      <p className="text-[11px] text-[var(--muted)]">Add a primary CTA button (e.g. Join Meeting, View Problem)</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasCta}
                    onChange={(e) => setHasCta(e.target.checked)}
                    className="h-4 w-4 rounded accent-pink-600"
                  />
                </div>

                {hasCta && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[var(--app-line)]">
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                        Button Label
                      </label>
                      <input
                        type="text"
                        value={ctaLabel}
                        onChange={(e) => setCtaLabel(e.target.value)}
                        placeholder="e.g. Join Live Room"
                        className="w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-xs font-semibold focus:outline-none focus:border-[var(--brand)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                        Destination URL / Route
                      </label>
                      <input
                        type="text"
                        value={ctaUrl}
                        onChange={(e) => setCtaUrl(e.target.value)}
                        placeholder="e.g. /live-classes or https://zoom.us/..."
                        className="w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-xs font-semibold focus:outline-none focus:border-[var(--brand)]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Settings & Priority */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="h-4 w-4 rounded accent-pink-600"
                  />
                  <Pin className="h-3.5 w-3.5 text-amber-500" />
                  <span>Pin notice to top of announcements</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--muted)]">Status:</span>
                  <div className="flex rounded-lg bg-[var(--input-bg)] p-0.5 border border-[var(--app-line)]">
                    <button
                      type="button"
                      onClick={() => setStatus("Published")}
                      className={cn(
                        "px-2.5 py-1 text-xs font-bold rounded-md transition-all",
                        status === "Published"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-[var(--muted)] hover:text-[var(--foreground)]"
                      )}
                    >
                      Publish Now
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus("Draft")}
                      className={cn(
                        "px-2.5 py-1 text-xs font-bold rounded-md transition-all",
                        status === "Draft"
                          ? "bg-slate-700 text-white shadow-sm"
                          : "text-[var(--muted)] hover:text-[var(--foreground)]"
                      )}
                    >
                      Save Draft
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            /* Live Student Preview Tab */
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-pink-50/60 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-900/40">
                <div className="flex items-center gap-2 text-xs font-bold text-pink-700 dark:text-pink-300 mb-1">
                  <Eye className="h-4 w-4" /> Live Learner Platform View
                </div>
                <p className="text-[11px] text-pink-900/80 dark:text-pink-200/80">
                  This is exactly how learners in <strong className="font-bold">{cohort}</strong> will see this announcement on their dashboard.
                </p>
              </div>

              {/* Top Pinned Banner Preview */}
              {isPinned && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <Pin className="h-4 w-4 shrink-0 fill-white" />
                    <span className="text-xs font-bold truncate">
                      {title || "Untitled Announcement Title"}
                    </span>
                  </div>
                  {hasCta && ctaLabel && (
                    <button className="px-3 py-1 text-xs font-bold bg-white text-pink-600 rounded-lg shadow shrink-0">
                      {ctaLabel}
                    </button>
                  )}
                </div>
              )}

              {/* Feed Card Preview */}
              <article className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--app-line)] shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-pink-600 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-200 dark:border-pink-800">
                    <Bell className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-200 dark:border-pink-800 px-2 py-0.5 text-[10px] font-bold">
                        {category}
                      </span>
                      <span className="text-[10px] text-[var(--muted)] font-medium">Just now</span>
                      {isPinned && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                          <Pin className="h-3 w-3" /> Pinned
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 text-base font-bold text-[var(--foreground)]">
                      {title || "Untitled Announcement"}
                    </h3>

                    <p className="mt-2 text-xs leading-relaxed text-[var(--muted)] whitespace-pre-line">
                      {body || "Your announcement message will appear here..."}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--app-line)]">
                      <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
                        <span>Target: <strong className="text-[var(--foreground)]">{cohort}</strong></span>
                        <span>·</span>
                        <span>By {author}</span>
                      </div>

                      {hasCta && ctaLabel && (
                        <button className="px-3.5 py-1.5 text-xs font-bold bg-[var(--brand)] text-white rounded-lg shadow-sm hover:opacity-90 flex items-center gap-1.5">
                          {ctaLabel}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--app-line)] bg-[var(--subtle-bg)]/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--hover-bg)] rounded-xl transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setStatus("Draft");
                setTimeout(() => {
                  const form = document.getElementById("announcement-form") as HTMLFormElement;
                  if (form) form.requestSubmit();
                }, 10);
              }}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-[var(--app-line)] hover:bg-[var(--hover-bg)] text-[var(--foreground)] flex items-center gap-1.5 transition-colors"
            >
              <Save className="h-3.5 w-3.5" />
              Save Draft
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setStatus("Published");
                setTimeout(() => {
                  const form = document.getElementById("announcement-form") as HTMLFormElement;
                  if (form) form.requestSubmit();
                }, 10);
              }}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-md shadow-pink-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              {status === "Draft" ? "Save Announcement" : "Broadcast Announcement"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
