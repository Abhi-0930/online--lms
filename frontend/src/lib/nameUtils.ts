export function resolveDisplayName(userOrName: any): string {
  if (!userOrName) return "Learner";

  let raw = "";

  if (typeof userOrName === "string") {
    raw = userOrName.trim();
  } else if (typeof userOrName === "object") {
    raw =
      userOrName.onboarding?.primaryGoal ||
      userOrName.fullName ||
      userOrName.name ||
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

