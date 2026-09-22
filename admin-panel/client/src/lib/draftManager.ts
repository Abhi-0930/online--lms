export type DraftType =
  | "course"
  | "practice_problem"
  | "practice_problem_modal"
  | "assignment"
  | "schedule_session"
  | "upload_recording"
  | "add_content"
  | "announcement";

export interface StoredDraft<T = any> {
  type: DraftType;
  title: string;
  step?: number;
  data: T;
  timestamp: number;
  updatedAtFormatted: string;
}

const DRAFT_STORAGE_PREFIX = "lms_admin_draft_";

export const DRAFT_KEYS: Record<DraftType, string> = {
  course: `${DRAFT_STORAGE_PREFIX}course`,
  practice_problem: `${DRAFT_STORAGE_PREFIX}practice_problem`,
  practice_problem_modal: `${DRAFT_STORAGE_PREFIX}practice_problem_modal`,
  assignment: `${DRAFT_STORAGE_PREFIX}assignment`,
  schedule_session: `${DRAFT_STORAGE_PREFIX}schedule_session`,
  upload_recording: `${DRAFT_STORAGE_PREFIX}upload_recording`,
  add_content: `${DRAFT_STORAGE_PREFIX}add_content`,
  announcement: `${DRAFT_STORAGE_PREFIX}announcement`,
};

export const DRAFT_LABELS: Record<DraftType, string> = {
  course: "Course Application",
  practice_problem: "Practice Problem",
  practice_problem_modal: "Quick Practice Problem",
  assignment: "Assignment",
  schedule_session: "Live Session Schedule",
  upload_recording: "Lecture Recording",
  add_content: "Content Item",
  announcement: "Broadcast Announcement",
};

export function saveDraft<T = any>(
  type: DraftType,
  data: T,
  options?: { title?: string; step?: number }
): void {
  if (typeof window === "undefined") return;
  try {
    const key = DRAFT_KEYS[type];
    const now = Date.now();
    const title =
      options?.title?.trim() ||
      (data as any)?.title?.trim() ||
      (data as any)?.name?.trim() ||
      `Untitled ${DRAFT_LABELS[type]}`;

    const draft: StoredDraft<T> = {
      type,
      title,
      step: options?.step,
      data,
      timestamp: now,
      updatedAtFormatted: new Date(now).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    localStorage.setItem(key, JSON.stringify(draft));
    window.dispatchEvent(new CustomEvent("lms:draft-change", { detail: { type, draft } }));
  } catch (err) {
    console.warn("[draftManager] Failed to save draft:", err);
  }
}

export function getDraft<T = any>(type: DraftType): StoredDraft<T> | null {
  if (typeof window === "undefined") return null;
  try {
    const key = DRAFT_KEYS[type];
    const item = localStorage.getItem(key);
    if (!item) return null;
    return JSON.parse(item) as StoredDraft<T>;
  } catch {
    return null;
  }
}

export function hasDraft(type: DraftType): boolean {
  return getDraft(type) !== null;
}

export function clearDraft(type: DraftType): void {
  if (typeof window === "undefined") return;
  try {
    const key = DRAFT_KEYS[type];
    localStorage.removeItem(key);
    window.dispatchEvent(new CustomEvent("lms:draft-change", { detail: { type, draft: null } }));
  } catch {}
}

export function hasDraftContent(draft: StoredDraft | null): boolean {
  if (!draft || !draft.data) return false;
  const d = draft.data as any;
  if (typeof d !== "object") return Boolean(d);

  // Check common meaningful fields across builders
  if (d.title && typeof d.title === "string" && d.title.trim().length > 0) return true;
  if (d.statement && typeof d.statement === "string" && d.statement.trim().length > 0) return true;
  if (d.description && typeof d.description === "string" && d.description.trim().length > 0) return true;
  if (d.instructions && typeof d.instructions === "string" && d.instructions.trim().length > 0) return true;
  if (d.constraints && typeof d.constraints === "string" && d.constraints.trim().length > 0) return true;
  if (d.companies && typeof d.companies === "string" && d.companies.trim().length > 0) return true;
  if (d.editorialApproach && typeof d.editorialApproach === "string" && d.editorialApproach.trim().length > 0) return true;
  if (d.editorialAlgorithm && typeof d.editorialAlgorithm === "string" && d.editorialAlgorithm.trim().length > 0) return true;
  if (d.timeComplexity && typeof d.timeComplexity === "string" && d.timeComplexity.trim().length > 0) return true;
  if (d.spaceComplexity && typeof d.spaceComplexity === "string" && d.spaceComplexity.trim().length > 0) return true;
  if (d.sampleInput && typeof d.sampleInput === "string" && d.sampleInput.trim().length > 0) return true;
  if (d.sampleOutput && typeof d.sampleOutput === "string" && d.sampleOutput.trim().length > 0) return true;
  if (d.meetingLink && typeof d.meetingLink === "string" && d.meetingLink.trim().length > 0) return true;
  if (d.videoUrl && typeof d.videoUrl === "string" && d.videoUrl.trim().length > 0) return true;
  if (d.videoFileName && typeof d.videoFileName === "string" && d.videoFileName.trim().length > 0) return true;
  if (d.formTitle && typeof d.formTitle === "string" && d.formTitle.trim().length > 0) return true;
  if (d.prerequisites && typeof d.prerequisites === "string" && d.prerequisites.trim().length > 0) return true;
  if (d.targetAudience && typeof d.targetAudience === "string" && d.targetAudience.trim().length > 0) return true;
  if (d.jsStarter || d.pyStarter || d.cppStarter) return true;

  // Check array fields
  if (Array.isArray(d.modules) && d.modules.length > 0) return true;
  if (Array.isArray(d.problemsList) && d.problemsList.length > 0) return true;
  if (Array.isArray(d.tags) && d.tags.length > 0) return true;
  if (Array.isArray(d.hints) && d.hints.some((h: any) => typeof h === "string" && h.trim().length > 0)) return true;
  if (Array.isArray(d.learningOutcomes) && d.learningOutcomes.some((o: any) => typeof o === "string" && o.trim().length > 0)) return true;
  if (Array.isArray(d.requirements) && d.requirements.some((r: any) => typeof r === "string" && r.trim().length > 0)) return true;
  if (
    Array.isArray(d.examples) &&
    d.examples.some((ex: any) => ex?.input?.trim() || ex?.output?.trim() || ex?.explanation?.trim())
  )
    return true;
  if (
    Array.isArray(d.testCasesList) &&
    d.testCasesList.some((tc: any) => tc?.input?.trim() || tc?.expectedOutput?.trim())
  )
    return true;

  // Check code fields
  if (d.starterCode && typeof d.starterCode === "object") {
    if (Object.values(d.starterCode).some((code: any) => typeof code === "string" && code.trim().length > 0)) {
      return true;
    }
  }
  if (d.referenceSolution && typeof d.referenceSolution === "object") {
    if (Object.values(d.referenceSolution).some((code: any) => typeof code === "string" && code.trim().length > 0)) {
      return true;
    }
  }

  // Fallback: check if title was customized
  return (
    typeof draft.title === "string" &&
    draft.title.trim().length > 0 &&
    draft.title !== `Untitled ${DRAFT_LABELS[draft.type]}` &&
    !draft.title.startsWith("Untitled")
  );
}

export function getAllDrafts(): StoredDraft[] {
  if (typeof window === "undefined") return [];
  const drafts: StoredDraft[] = [];
  const types: DraftType[] = [
    "course",
    "practice_problem",
    "practice_problem_modal",
    "assignment",
    "schedule_session",
    "upload_recording",
    "add_content",
    "announcement",
  ];

  for (const type of types) {
    const draft = getDraft(type);
    if (draft && hasDraftContent(draft)) {
      drafts.push(draft);
    }
  }

  return drafts.sort((a, b) => b.timestamp - a.timestamp);
}

export function isDraftForSection(type: DraftType, section: string = ""): boolean {
  const s = section.toLowerCase().replace(/-/g, "_");
  if (s.includes("course") && type === "course") return true;
  if ((s.includes("practice") || s.includes("problem")) && (type === "practice_problem" || type === "practice_problem_modal")) return true;
  if (s.includes("assignment") && type === "assignment") return true;
  if ((s.includes("session") || s === "live" || s.includes("schedule")) && type === "schedule_session") return true;
  if ((s.includes("recording") || s.includes("upload")) && type === "upload_recording") return true;
  if (s.includes("content") && (type === "add_content" || type === "course")) return true;
  if (s.includes("announcement") && type === "announcement") return true;
  return false;
}

export function formatTimeAgo(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 45) return "just now";
  if (diffMin === 1) return "1 minute ago";
  if (diffMin < 60) return `${diffMin} minutes ago`;
  if (diffHour === 1) return "1 hour ago";
  if (diffHour < 24) return `${diffHour} hours ago`;
  if (diffDay === 1) return "yesterday";
  return `${diffDay} days ago`;
}
