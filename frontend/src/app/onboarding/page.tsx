"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface StudyOption {
  id: string;
  label: string;
  iconType: "cap" | "briefcase";
  badgeBg: string;
  iconColor: string;
}

const STUDY_OPTIONS: StudyOption[] = [
  {
    id: "1st_year",
    label: "1st year",
    iconType: "cap",
    badgeBg: "bg-[#e8f1fd]",
    iconColor: "#1a73e8",
  },
  {
    id: "2nd_year",
    label: "2nd year",
    iconType: "cap",
    badgeBg: "bg-[#e6f8ef]",
    iconColor: "#059669",
  },
  {
    id: "3rd_year",
    label: "3rd year",
    iconType: "cap",
    badgeBg: "bg-[#f3e8ff]",
    iconColor: "#9333ea",
  },
  {
    id: "4th_year",
    label: "4th year",
    iconType: "cap",
    badgeBg: "bg-[#fef3c7]",
    iconColor: "#b45309",
  },
  {
    id: "working_professional",
    label: "Working professional",
    iconType: "briefcase",
    badgeBg: "bg-[#ffe4e6]",
    iconColor: "#e11d48",
  },
];

function GraduationCapIcon({ color }: { color: string }) {
  return (
    <svg
      className="w-6 h-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

function BriefcaseIcon({ color }: { color: string }) {
  return (
    <svg
      className="w-6 h-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const topOptions = STUDY_OPTIONS.slice(0, 4);
  const bottomOption = STUDY_OPTIONS[4];

  const handleContinue = async () => {
    if (!selectedOption) return;
    setIsSubmitting(true);

    try {
      localStorage.setItem("lms_user_education_status", selectedOption);

      const existingUserStr = localStorage.getItem("lms_user");
      let userId: string | undefined;
      if (existingUserStr) {
        const parsed = JSON.parse(existingUserStr);
        parsed.educationStatus = selectedOption;
        userId = parsed.id;
        localStorage.setItem("lms_user", JSON.stringify(parsed));
      }

      const token = localStorage.getItem("lms_token");

      // Save to backend database table UserOnboarding
      await fetch("http://localhost:4000/api/v1/onboarding/step-1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          educationStatus: selectedOption,
          userId,
        }),
      }).catch(() => {});

      toast.success("Preferences saved successfully!");
      router.push("/dashboard");
    } catch {
      router.push("/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8faff] relative flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      {/* Subtle background decorative shapes */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[32rem] h-[32rem] bg-indigo-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-80 h-80 bg-blue-50/60 rounded-full blur-2xl pointer-events-none" />

      {/* Main Onboarding Modal Card */}
      <div className="w-full max-w-[760px] bg-white rounded-[28px] border border-[#eef2f6] shadow-[0_12px_44px_rgba(0,0,0,0.03)] px-6 sm:px-12 py-9 sm:py-12 relative z-10 flex flex-col items-center">
        {/* Step Progress Indicators */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-1.5 rounded-full bg-[#1a73e8]" />
          <div className="w-10 h-1.5 rounded-full bg-[#e2e8f0]" />
          <div className="w-10 h-1.5 rounded-full bg-[#e2e8f0]" />
        </div>

        {/* Heading */}
        <h1 className="text-[26px] sm:text-[30px] font-bold text-[#0f172a] text-center tracking-tight mb-8">
          What are you studying?
        </h1>

        {/* Top 4 Options Grid */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 mb-4">
          {topOptions.map((opt) => {
            const isSelected = selectedOption === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedOption(opt.id)}
                className={`flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-[#1a73e8] bg-[#f0f7ff] ring-2 ring-[#1a73e8]/20 shadow-sm"
                    : "border-[#e2e8f0] bg-white hover:border-[#cbd5e1] hover:shadow-sm"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-full ${opt.badgeBg} flex items-center justify-center mb-3.5 transition-transform duration-200 ${
                    isSelected ? "scale-105" : ""
                  }`}
                >
                  <GraduationCapIcon color={opt.iconColor} />
                </div>
                <span className="text-[14px] sm:text-[15px] font-medium text-[#1e293b] text-center whitespace-nowrap">
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom Centered Option */}
        <div className="w-full flex justify-center mb-9">
          {bottomOption && (
            <button
              type="button"
              onClick={() => setSelectedOption(bottomOption.id)}
              className={`w-full sm:w-[calc(25%-12px)] min-w-[155px] max-w-[200px] flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                selectedOption === bottomOption.id
                  ? "border-[#1a73e8] bg-[#f0f7ff] ring-2 ring-[#1a73e8]/20 shadow-sm"
                  : "border-[#e2e8f0] bg-white hover:border-[#cbd5e1] hover:shadow-sm"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-full ${bottomOption.badgeBg} flex items-center justify-center mb-3.5 transition-transform duration-200 ${
                  selectedOption === bottomOption.id ? "scale-105" : ""
                }`}
              >
                <BriefcaseIcon color={bottomOption.iconColor} />
              </div>
              <span className="text-[14px] sm:text-[15px] font-medium text-[#1e293b] text-center whitespace-nowrap">
                {bottomOption.label}
              </span>
            </button>
          )}
        </div>

        {/* Continue Button */}
        <div className="w-full flex justify-center">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedOption || isSubmitting}
            className={`w-full max-w-[220px] py-3 sm:py-3.5 px-8 rounded-xl text-[15px] font-medium transition-all duration-200 text-center ${
              selectedOption && !isSubmitting
                ? "bg-[#1a73e8] text-white hover:bg-[#1557b0] shadow-md shadow-[#1a73e8]/25 active:scale-[0.98] cursor-pointer"
                : "bg-[#c7dcfc] text-white cursor-not-allowed opacity-90"
            }`}
          >
            {isSubmitting ? "Saving..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
