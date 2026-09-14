"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Search, ChevronDown, ChevronUp } from "lucide-react";

interface StudyOption {
  id: string;
  label: string;
  badgeBg: string;
  iconColor: string;
}

const STUDY_OPTIONS: StudyOption[] = [
  {
    id: "1st_year",
    label: "1st year",
    badgeBg: "bg-[#e8f1fd]",
    iconColor: "#1a73e8",
  },
  {
    id: "2nd_year",
    label: "2nd year",
    badgeBg: "bg-[#e6f8ef]",
    iconColor: "#059669",
  },
  {
    id: "3rd_year",
    label: "3rd year",
    badgeBg: "bg-[#f3e8ff]",
    iconColor: "#9333ea",
  },
  {
    id: "4th_year",
    label: "4th year",
    badgeBg: "bg-[#fef3c7]",
    iconColor: "#b45309",
  },
  {
    id: "working_professional",
    label: "Working professional",
    badgeBg: "bg-[#ffe4e6]",
    iconColor: "#e11d48",
  },
];

const POPULAR_ROLES = [
  "Software Engineer",
  "Data Analyst",
  "Machine Learning Engineer",
  "Cloud Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "DevOps Engineer",
  "Cybersecurity Analyst",
  "Mobile App Developer",
  "Product Manager",
  "UI/UX Designer",
  "Database Administrator",
  "SRE (Site Reliability Engineer)",
  "Business Analyst",
];

const MORE_ROLES = [
  "AI Engineer",
  "QA / Automation Engineer",
  "Blockchain Developer",
  "System Architect",
  "Security Engineer",
  "Game Developer",
  "Technical Product Manager",
  "Engineering Manager",
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
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Step 1 State
  const [selectedStudyOption, setSelectedStudyOption] = useState<string | null>(null);

  // Step 2 State
  const [roleSearch, setRoleSearch] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [showMoreRoles, setShowMoreRoles] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter roles based on search
  const allAvailableRoles = showMoreRoles
    ? [...POPULAR_ROLES, ...MORE_ROLES]
    : POPULAR_ROLES;

  const filteredRoles = roleSearch.trim()
    ? [...POPULAR_ROLES, ...MORE_ROLES].filter((role) =>
        role.toLowerCase().includes(roleSearch.toLowerCase().trim())
      )
    : allAvailableRoles;

  const toggleRoleSelection = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  // Step 1 -> Step 2
  const handleStep1Continue = async () => {
    if (!selectedStudyOption) return;
    setIsSubmitting(true);

    try {
      localStorage.setItem("lms_user_education_status", selectedStudyOption);

      const existingUserStr = localStorage.getItem("lms_user");
      let userId: string | undefined;
      if (existingUserStr) {
        const parsed = JSON.parse(existingUserStr);
        parsed.educationStatus = selectedStudyOption;
        userId = parsed.id;
        localStorage.setItem("lms_user", JSON.stringify(parsed));
      }

      const token = localStorage.getItem("lms_token");

      // Save Step 1 to database table UserOnboarding
      await fetch("http://localhost:4000/api/v1/onboarding/step-1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          educationStatus: selectedStudyOption,
          userId,
        }),
      }).catch(() => {});

      setCurrentStep(2);
    } catch {
      setCurrentStep(2);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2 -> Next (or Dashboard)
  const handleStep2Continue = async () => {
    if (selectedRoles.length === 0) return;
    setIsSubmitting(true);

    try {
      localStorage.setItem("lms_user_target_roles", JSON.stringify(selectedRoles));

      const existingUserStr = localStorage.getItem("lms_user");
      let userId: string | undefined;
      if (existingUserStr) {
        const parsed = JSON.parse(existingUserStr);
        parsed.targetRoles = selectedRoles;
        userId = parsed.id;
        localStorage.setItem("lms_user", JSON.stringify(parsed));
      }

      const token = localStorage.getItem("lms_token");

      // Save Step 2 to database table UserOnboarding
      await fetch("http://localhost:4000/api/v1/onboarding/step-2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          targetRoles: selectedRoles,
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

  const topStudyOptions = STUDY_OPTIONS.slice(0, 4);
  const bottomStudyOption = STUDY_OPTIONS[4];

  return (
    <div className="min-h-screen w-full bg-[#f8faff] relative flex items-center justify-center p-4 sm:p-6 overflow-x-hidden select-none">
      {/* Subtle background decorative shapes */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[32rem] h-[32rem] bg-indigo-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-80 h-80 bg-blue-50/60 rounded-full blur-2xl pointer-events-none" />

      {/* Main Onboarding Modal Card */}
      <div className="w-full max-w-[840px] bg-white rounded-[28px] border border-[#eef2f6] shadow-[0_12px_44px_rgba(0,0,0,0.03)] px-6 sm:px-12 py-8 sm:py-10 relative z-10 flex flex-col items-center">
        {/* Top Header: Back Button, 4-Step Progress Indicators, Step Counter */}
        <div className="w-full flex items-center justify-between mb-7">
          <div className="w-24 flex items-center justify-start">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-1.5 text-[14px] font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : null}
          </div>

          {/* 4 Progress Stepper Pills */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-1.5 rounded-full bg-[#1a73e8]" />
            <div
              className={`w-9 h-1.5 rounded-full transition-colors duration-200 ${
                currentStep >= 2 ? "bg-[#1a73e8]" : "bg-[#e2e8f0]"
              }`}
            />
            <div className="w-9 h-1.5 rounded-full bg-[#e2e8f0]" />
            <div className="w-9 h-1.5 rounded-full bg-[#e2e8f0]" />
          </div>

          <div className="w-24 text-right">
            <span className="text-[13.5px] font-medium text-slate-500">
              Step {currentStep} of 4
            </span>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* STEP 1: What are you studying? */}
        {/* ---------------------------------------------------- */}
        {currentStep === 1 && (
          <div className="w-full flex flex-col items-center animate-fadeIn">
            {/* Heading */}
            <h1 className="text-[26px] sm:text-[30px] font-bold text-[#0f172a] text-center tracking-tight mb-8">
              What are you studying?
            </h1>

            {/* Top 4 Options Grid */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 mb-4 max-w-[700px]">
              {topStudyOptions.map((opt) => {
                const isSelected = selectedStudyOption === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedStudyOption(opt.id)}
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
            <div className="w-full flex justify-center mb-9 max-w-[700px]">
              {bottomStudyOption && (
                <button
                  type="button"
                  onClick={() => setSelectedStudyOption(bottomStudyOption.id)}
                  className={`w-full sm:w-[calc(25%-12px)] min-w-[155px] max-w-[200px] flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    selectedStudyOption === bottomStudyOption.id
                      ? "border-[#1a73e8] bg-[#f0f7ff] ring-2 ring-[#1a73e8]/20 shadow-sm"
                      : "border-[#e2e8f0] bg-white hover:border-[#cbd5e1] hover:shadow-sm"
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-full ${bottomStudyOption.badgeBg} flex items-center justify-center mb-3.5 transition-transform duration-200 ${
                      selectedStudyOption === bottomStudyOption.id ? "scale-105" : ""
                    }`}
                  >
                    <BriefcaseIcon color={bottomStudyOption.iconColor} />
                  </div>
                  <span className="text-[14px] sm:text-[15px] font-medium text-[#1e293b] text-center whitespace-nowrap">
                    {bottomStudyOption.label}
                  </span>
                </button>
              )}
            </div>

            {/* Continue Button */}
            <div className="w-full flex justify-center">
              <button
                type="button"
                onClick={handleStep1Continue}
                disabled={!selectedStudyOption || isSubmitting}
                className={`w-full max-w-[220px] py-3.5 px-8 rounded-xl text-[15px] font-medium transition-all duration-200 text-center ${
                  selectedStudyOption && !isSubmitting
                    ? "bg-[#1a73e8] text-white hover:bg-[#1557b0] shadow-md shadow-[#1a73e8]/25 active:scale-[0.98] cursor-pointer"
                    : "bg-[#c7dcfc] text-white cursor-not-allowed opacity-90"
                }`}
              >
                {isSubmitting ? "Saving..." : "Continue"}
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 2: What roles are you targeting? */}
        {/* ---------------------------------------------------- */}
        {currentStep === 2 && (
          <div className="w-full flex flex-col items-center animate-fadeIn">
            {/* Heading */}
            <h1 className="text-[26px] sm:text-[30px] font-bold text-[#0f172a] text-center tracking-tight mb-6">
              What roles are you targeting?
            </h1>

            {/* Search Bar */}
            <div className="w-full max-w-[660px] relative mb-6">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                placeholder="Search roles (e.g. Software Engineer, Data Analyst, Product Manager...)"
                className="w-full pl-11 pr-4 py-3 bg-[#f8fafc] border border-slate-200/90 rounded-xl text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/15 transition-all"
              />
            </div>

            {/* Popular Roles Heading */}
            <div className="w-full max-w-[660px] text-left mb-3">
              <span className="text-[13.5px] font-medium text-slate-500">
                {roleSearch.trim() ? "Matching roles" : "Popular roles"}
              </span>
            </div>

            {/* Roles Grid or Empty State */}
            {filteredRoles.length > 0 ? (
              <div className="w-full max-w-[660px] grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
                {filteredRoles.map((role) => {
                  const isSelected = selectedRoles.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRoleSelection(role)}
                      className={`py-3.5 px-3 rounded-xl border text-[13.5px] font-medium text-center transition-all duration-150 cursor-pointer flex items-center justify-center min-h-[50px] leading-snug ${
                        isSelected
                          ? "border-[#1a73e8] bg-[#f0f7ff] text-[#1a73e8] font-semibold ring-2 ring-[#1a73e8]/15 shadow-xs"
                          : "border-[#e2e8f0] bg-white text-slate-700 hover:border-[#cbd5e1] hover:bg-slate-50/60"
                      }`}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="w-full max-w-[660px] flex flex-col items-center justify-center py-9 px-4 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 my-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <Search className="w-5 h-5 stroke-[1.75]" />
                </div>
                <p className="text-[15px] font-semibold text-slate-800 mb-1">
                  No roles found for &ldquo;{roleSearch}&rdquo;
                </p>
                <p className="text-[13px] text-slate-500 mb-4 max-w-sm">
                  Try searching with different keywords or add your specific role.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRoleSearch("")}
                    className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#1a73e8] bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    Clear search
                  </button>
                  {roleSearch.trim() && !selectedRoles.includes(roleSearch.trim()) && (
                    <button
                      type="button"
                      onClick={() => {
                        const customRole = roleSearch.trim();
                        if (customRole) {
                          setSelectedRoles((prev) => [...prev, customRole]);
                          setRoleSearch("");
                        }
                      }}
                      className="px-4 py-2 rounded-xl text-[13px] font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer shadow-2xs"
                    >
                      Add &ldquo;{roleSearch.trim()}&rdquo;
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* View More Roles Toggle (Only when not searching) */}
            {!roleSearch.trim() && (
              <button
                type="button"
                onClick={() => setShowMoreRoles((prev) => !prev)}
                className="flex items-center gap-1 text-[13.5px] font-medium text-[#1a73e8] hover:text-[#1557b0] transition-colors cursor-pointer my-4 select-none"
              >
                <span>{showMoreRoles ? "View fewer roles" : "View more roles"}</span>
                {showMoreRoles ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Continue Button */}
            <div className="w-full flex justify-center mt-3">
              <button
                type="button"
                onClick={handleStep2Continue}
                disabled={selectedRoles.length === 0 || isSubmitting}
                className={`w-full max-w-[220px] py-3.5 px-8 rounded-xl text-[15px] font-medium transition-all duration-200 text-center ${
                  selectedRoles.length > 0 && !isSubmitting
                    ? "bg-[#1a73e8] text-white hover:bg-[#1557b0] shadow-md shadow-[#1a73e8]/25 active:scale-[0.98] cursor-pointer"
                    : "bg-[#c7dcfc] text-white cursor-not-allowed opacity-90"
                }`}
              >
                {isSubmitting ? "Saving..." : "Continue"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
