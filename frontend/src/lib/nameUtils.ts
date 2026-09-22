export function resolveDisplayName(userOrName: any): string {
  let target = userOrName;

  // If user object not passed, check localStorage as instant fallback on client
  if (!target && typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("lms_user_profile");
      if (stored) {
        target = JSON.parse(stored);
      }
    } catch {}
  }

  if (!target) return "Learner";

  let raw = "";

  if (typeof target === "string") {
    raw = target.trim();
  } else if (typeof target === "object") {
    raw =
      target.fullName ||
      target.name ||
      target.onboarding?.primaryGoal ||
      "";

    // If raw name is missing or is generic "Learner", try deriving from email
    if (!raw || raw.trim().toLowerCase() === "learner") {
      if (target.email && target.email.includes("@")) {
        raw = target.email.split("@")[0];
      }
    }
  }

  if (!raw || raw.trim().toLowerCase() === "learner") {
    return "Learner";
  }

  // Clean raw if it contains dots, underscores, dashes, or digits
  if (raw.includes(".") || raw.includes("_") || raw.includes("-") || /\d+/.test(raw)) {
    const cleaned = raw.replace(/[._-]+/g, " ").replace(/\d+/g, "").trim();
    if (cleaned) {
      return cleaned
        .split(/\s+/)
        .filter(Boolean)
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    }
  }

  return raw
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function resolveFirstName(userOrName: any): string {
  const full = resolveDisplayName(userOrName);
  if (!full || full === "Learner") return "Learner";
  return full.split(/\s+/)[0] || "Learner";
}

export function resolveEducationStatus(user: any): string {
  let target = user;

  if (!target && typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("lms_user_profile");
      if (stored) {
        target = JSON.parse(stored);
      }
    } catch {}
  }

  if (!target) return "Student";

  const raw =
    target.onboarding?.educationStatus ||
    target.educationStatus ||
    target.education ||
    target.roleDescription ||
    "";

  if (!raw) {
    return target.role === "INSTRUCTOR" ? "Instructor" : "Student";
  }

  const normalized = raw.trim().toLowerCase();

  if (normalized.includes("1st") || normalized === "first_year" || normalized === "first year") {
    return "1st year";
  }
  if (normalized.includes("2nd") || normalized === "second_year" || normalized === "second year") {
    return "2nd year";
  }
  if (normalized.includes("3rd") || normalized === "third_year" || normalized === "third year") {
    return "3rd year";
  }
  if (normalized.includes("4th") || normalized === "fourth_year" || normalized === "fourth year") {
    return "4th year";
  }
  if (normalized.includes("professional") || normalized.includes("working")) {
    return "Working Professional";
  }

  return raw
    .replace(/[._-]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}


