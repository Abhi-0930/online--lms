export function resolveDisplayName(userOrName: any): string {
  if (!userOrName) return "Learner";

  let raw = "";

  if (typeof userOrName === "string") {
    raw = userOrName.trim();
  } else if (typeof userOrName === "object") {
    raw =
      userOrName.fullName ||
      userOrName.name ||
      userOrName.onboarding?.primaryGoal ||
      "";

    // If raw name is missing or is generic "Learner", try deriving from email
    if (!raw || raw.trim().toLowerCase() === "learner") {
      if (userOrName.email && userOrName.email.includes("@")) {
        raw = userOrName.email.split("@")[0];
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
  if (!userOrName) return "Learner";
  const full = resolveDisplayName(userOrName);
  if (!full || full === "Learner") return "Learner";
  return full.split(/\s+/)[0] || "Learner";
}

export function resolveEducationStatus(user: any): string {
  if (!user) return "Student";

  const raw =
    user.onboarding?.educationStatus ||
    user.educationStatus ||
    user.education ||
    user.roleDescription ||
    "";

  if (!raw) {
    return user.role === "INSTRUCTOR" ? "Instructor" : "Student";
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


