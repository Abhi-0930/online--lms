"use client";

import { useState, useEffect, Suspense, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Search,
  ChevronDown,
  ChevronUp,
  Check,
  Loader2,
  User,
  BookOpen,
  Home,
  Lightbulb,
} from "lucide-react";
import { createSecureUrl, decodeDataParam } from "@/lib/urlParams";
import { ConfettiAnimation } from "@/components/ConfettiAnimation";

interface StudyOption {
  id: string;
  label: string;
  badgeBg: string;
  iconColor: string;
}

interface CompanyItem {
  name: string;
  domain: string;
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

const POPULAR_COMPANIES: CompanyItem[] = [
  { name: "Google", domain: "google.com" },
  { name: "Microsoft", domain: "microsoft.com" },
  { name: "Amazon", domain: "amazon.com" },
  { name: "Apple", domain: "apple.com" },
  { name: "Meta", domain: "meta.com" },
  { name: "Netflix", domain: "netflix.com" },
  { name: "Adobe", domain: "adobe.com" },
  { name: "Salesforce", domain: "salesforce.com" },
  { name: "TCS", domain: "tcs.com" },
  { name: "Infosys", domain: "infosys.com" },
  { name: "Wipro", domain: "wipro.com" },
  { name: "Accenture", domain: "accenture.com" },
  { name: "Deloitte", domain: "deloitte.com" },
  { name: "Capgemini", domain: "capgemini.com" },
  { name: "Cognizant", domain: "cognizant.com" },
  { name: "IBM", domain: "ibm.com" },
];

const MORE_COMPANIES: CompanyItem[] = [
  { name: "Uber", domain: "uber.com" },
  { name: "Oracle", domain: "oracle.com" },
  { name: "Cisco", domain: "cisco.com" },
  { name: "Intel", domain: "intel.com" },
  { name: "Nvidia", domain: "nvidia.com" },
  { name: "Walmart", domain: "walmart.com" },
  { name: "Flipkart", domain: "flipkart.com" },
  { name: "Swiggy", domain: "swiggy.com" },
  { name: "Zomato", domain: "zomato.com" },
  { name: "Razorpay", domain: "razorpay.com" },
  { name: "Atlassian", domain: "atlassian.com" },
  { name: "Stripe", domain: "stripe.com" },
  { name: "PayPal", domain: "paypal.com" },
  { name: "Spotify", domain: "spotify.com" },
  { name: "LinkedIn", domain: "linkedin.com" },
  { name: "Goldman Sachs", domain: "goldmansachs.com" },
  { name: "Morgan Stanley", domain: "morganstanley.com" },
  { name: "JP Morgan", domain: "jpmorgan.com" },
];

const MONOGRAM_PALETTES = [
  { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200" },
  { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
  { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200" },
  { bg: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-200" },
  { bg: "bg-teal-50", text: "text-teal-600", border: "border-teal-200" },
];

function getMonogramPalette(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % MONOGRAM_PALETTES.length;
  return MONOGRAM_PALETTES[index];
}

function getCompanyInitial(name: string) {
  const cleanName = name.trim();
  return cleanName ? cleanName.charAt(0).toUpperCase() : "C";
}

function CompanyLogo({ name, domain }: { name: string; domain?: string }) {
  const primaryDomain = domain || `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
  const [imgSrc, setImgSrc] = useState<string>(`https://logo.clearbit.com/${primaryDomain}`);
  const [hasTriedFavicon, setHasTriedFavicon] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(`https://logo.clearbit.com/${primaryDomain}`);
    setHasTriedFavicon(false);
    setHasError(false);
  }, [primaryDomain]);

  const handleError = () => {
    if (!hasTriedFavicon) {
      setHasTriedFavicon(true);
      setImgSrc(`https://www.google.com/s2/favicons?domain=${primaryDomain}&sz=128`);
    } else {
      setHasError(true);
    }
  };

  if (hasError) {
    const palette = getMonogramPalette(name);
    return (
      <div
        className={`w-6 h-6 rounded-md ${palette.bg} border ${palette.border} flex items-center justify-center ${palette.text} font-bold text-[12px] shrink-0 select-none shadow-2xs`}
      >
        {getCompanyInitial(name)}
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={`${name} logo`}
      onError={handleError}
      className="w-6 h-6 object-contain rounded-xs shrink-0"
      loading="lazy"
    />
  );
}

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

function DotGrid({
  cols = 5,
  rows = 6,
  className = "",
}: {
  cols?: number;
  rows?: number;
  className?: string;
}) {
  return (
    <div
      className={`grid gap-3.5 opacity-30 select-none pointer-events-none ${className}`}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: cols * rows }).map((_, i) => (
        <div key={i} className="w-1 h-1 rounded-full bg-slate-400" />
      ))}
    </div>
  );
}

function ThankYouSuccessScreen({ onRedirect }: { onRedirect: () => void }) {
  const TOTAL_DURATION_MS = 3000;
  const [progressPct, setProgressPct] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(3);
  const redirectedRef = useRef(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / TOTAL_DURATION_MS) * 100);
      const remainingSec = Math.max(1, Math.ceil((TOTAL_DURATION_MS - elapsed) / 1000));
      setProgressPct(pct);
      setSecondsLeft(remainingSec);

      if (elapsed >= TOTAL_DURATION_MS && !redirectedRef.current) {
        redirectedRef.current = true;
        clearInterval(interval);
        onRedirect();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [onRedirect]);

  return (
    <div className="min-h-screen w-full bg-white relative flex flex-col justify-between p-6 sm:p-10 overflow-hidden select-none">
      {/* Decorative background glow orbs */}
      <div className="absolute top-10 -left-20 w-[420px] h-[420px] bg-blue-50/80 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-[480px] h-[480px] bg-blue-50/70 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative dot matrix grids matching the screenshot */}
      <div className="hidden md:block absolute left-8 top-1/2 -translate-y-1/2">
        <DotGrid cols={5} rows={3} />
      </div>
      <div className="hidden md:block absolute right-8 top-1/3">
        <DotGrid cols={5} rows={6} />
      </div>

      {/* Top Navbar */}
      <header className="w-full flex items-center justify-between z-10">
        {/* Left: LearnHub brand logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1a73e8] flex items-center justify-center text-white shadow-xs">
            <BookOpen className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
          <span className="font-bold text-[20px] tracking-tight text-slate-900">
            LearnHub
          </span>
        </div>

        {/* Right: Back to home */}
        <button
          type="button"
          onClick={onRedirect}
          className="flex items-center gap-1.5 text-[14px] font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <Home className="w-4 h-4 stroke-[1.8]" />
          <span>Back to home</span>
        </button>
      </header>

      {/* Center Hero Card */}
      <main className="flex-1 flex flex-col items-center justify-center text-center z-10 py-6 max-w-xl mx-auto w-full">
        {/* Party Popper Lottie Animation (0ms instant playback) */}
        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-[#f0f6ff]/70 flex items-center justify-center mb-6 overflow-hidden relative shadow-2xs">
          <ConfettiAnimation className="scale-110" />
        </div>

        {/* Heading */}
        <h1 className="text-[34px] sm:text-[42px] font-bold text-[#0f172a] tracking-tight mb-2.5">
          Thank you!
        </h1>

        {/* Subtitles */}
        <p className="text-[15px] sm:text-[16.5px] text-slate-600 leading-normal font-normal">
          Your information has been saved.
        </p>
        <p className="text-[15px] sm:text-[16.5px] text-slate-600 leading-normal font-normal mb-8">
          Redirecting you to your learning space...
        </p>

        {/* Smooth Animated Progress Bar */}
        <div className="w-[280px] sm:w-[320px] h-2 bg-slate-200/80 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-[#1a73e8] rounded-full transition-all duration-75 ease-linear"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Countdown Subtext */}
        <p className="text-[13px] sm:text-[13.5px] text-slate-500 font-medium">
          Redirecting in {secondsLeft} second{secondsLeft === 1 ? "" : "s"}...
        </p>

        {/* Bottom Tip Badge */}
        <div className="mt-8 px-5 py-3 rounded-2xl bg-[#f0f7ff] border border-[#d6e6fe] flex items-center gap-2.5 shadow-2xs">
          <Lightbulb className="w-4.5 h-4.5 text-[#1a73e8] stroke-[2] shrink-0" />
          <span className="text-[13.5px] sm:text-[14px] font-medium text-[#1e3a8a]">
            Get ready to start your learning journey!
          </span>
        </div>
      </main>

      {/* Bottom spacer */}
      <footer className="h-6 w-full shrink-0" />
    </div>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dataParam = searchParams?.get("data") || searchParams?.get("q");

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(() => {
    if (dataParam) {
      const decoded = decodeDataParam<{ step?: number }>(dataParam);
      if (decoded?.step && decoded.step >= 1 && decoded.step <= 5) {
        return decoded.step as 1 | 2 | 3 | 4 | 5;
      }
    }
    return 1;
  });

  const updateStep = useCallback(
    (newStep: 1 | 2 | 3 | 4 | 5) => {
      setCurrentStep(newStep);
      router.replace(createSecureUrl("/onboarding", { step: newStep }));
    },
    [router]
  );

  // Sync state from query params & ensure URL always carries the tamper-resistant Base64URL query
  useEffect(() => {
    if (dataParam) {
      const decoded = decodeDataParam<{ step?: number }>(dataParam);
      if (decoded?.step && decoded.step >= 1 && decoded.step <= 5) {
        if (decoded.step !== currentStep) {
          setCurrentStep(decoded.step as 1 | 2 | 3 | 4 | 5);
        }
      }
    } else {
      // Auto-encode bare /onboarding URL to /onboarding?data=...
      router.replace(createSecureUrl("/onboarding", { step: currentStep }));
    }
  }, [dataParam, currentStep, router]);

  // Step 1 State
  const [selectedStudyOption, setSelectedStudyOption] = useState<string | null>(null);

  // Step 2 State
  const [roleSearch, setRoleSearch] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [showMoreRoles, setShowMoreRoles] = useState(false);

  // Step 3 State
  const [companySearch, setCompanySearch] = useState("");
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [showMoreCompanies, setShowMoreCompanies] = useState(false);
  const [apiSuggestions, setApiSuggestions] = useState<CompanyItem[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);

  // Step 4 State
  const [userName, setUserName] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preload name if available from secure session
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch("http://localhost:4000/api/v1/auth/me", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.user?.fullName && !userName) {
            setUserName(data.user.fullName);
          }
        }
      } catch {}
    }
    loadSession();
  }, [userName]);

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

  // Live Autocomplete API search with 200ms debouncing
  useEffect(() => {
    const query = companySearch.trim();
    if (query.length < 2) {
      setApiSuggestions([]);
      setIsSearchingApi(false);
      return;
    }

    setIsSearchingApi(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(query)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const formatted: CompanyItem[] = data.map((item: { name?: string; domain?: string }) => ({
              name: item.name || query,
              domain: item.domain || `${(item.name || query).toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
            }));
            setApiSuggestions(formatted);
          }
        }
      } catch {
        // Silently fallback to local search
      } finally {
        setIsSearchingApi(false);
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [companySearch]);

  // Filter companies based on search (merging local + live API suggestions)
  const allAvailableCompanies = showMoreCompanies
    ? [...POPULAR_COMPANIES, ...MORE_COMPANIES]
    : POPULAR_COMPANIES;

  const localMatches = companySearch.trim()
    ? [...POPULAR_COMPANIES, ...MORE_COMPANIES].filter((c) =>
        c.name.toLowerCase().includes(companySearch.toLowerCase().trim())
      )
    : allAvailableCompanies;

  // Merge local matches and live API suggestions, eliminating duplicate company names
  const filteredCompanies = companySearch.trim()
    ? [
        ...localMatches,
        ...apiSuggestions.filter(
          (apiComp) =>
            !localMatches.some(
              (loc) => loc.name.toLowerCase() === apiComp.name.toLowerCase()
            )
        ),
      ]
    : allAvailableCompanies;

  const toggleCompanySelection = (companyName: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(companyName)
        ? prev.filter((c) => c !== companyName)
        : [...prev, companyName]
    );
  };

  // Step 1 -> Step 2
  const handleStep1Continue = async () => {
    if (!selectedStudyOption) return;
    setIsSubmitting(true);

    try {
      // Save Step 1 to database table UserOnboarding via authenticated cookie
      await fetch("http://localhost:4000/api/v1/onboarding/step-1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          educationStatus: selectedStudyOption,
        }),
      }).catch(() => {});

      updateStep(2);
    } catch {
      updateStep(2);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2 -> Step 3
  const handleStep2Continue = async () => {
    if (selectedRoles.length === 0) return;
    setIsSubmitting(true);

    try {
      // Save Step 2 to database table UserOnboarding via authenticated cookie
      await fetch("http://localhost:4000/api/v1/onboarding/step-2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          targetRoles: selectedRoles,
        }),
      }).catch(() => {});

      updateStep(3);
    } catch {
      updateStep(3);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3 -> Step 4
  const handleStep3Continue = async () => {
    if (selectedCompanies.length === 0) return;
    setIsSubmitting(true);

    try {
      // Save Step 3 to database table UserOnboarding via authenticated cookie
      await fetch("http://localhost:4000/api/v1/onboarding/step-3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          targetCompanies: selectedCompanies,
        }),
      }).catch(() => {});

      updateStep(4);
    } catch {
      updateStep(4);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 4 -> Dashboard
  const handleStep4Continue = async () => {
    if (!userName.trim()) return;
    setIsSubmitting(true);

    const cleanName = userName.trim();

    try {
      // Save Step 4 to database table UserOnboarding & mark isCompleted = true
      await fetch("http://localhost:4000/api/v1/onboarding/step-4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: cleanName,
        }),
      }).catch(() => {});

      toast.success(`Welcome to LearnHub, ${cleanName}!`);
      updateStep(5);
    } catch {
      updateStep(5);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentStep === 5) {
    return (
      <ThankYouSuccessScreen
        onRedirect={() => {
          router.push("/dashboard");
        }}
      />
    );
  }

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
                onClick={() => updateStep(((currentStep - 1) as 1 | 2 | 3 | 4))}
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
            <div
              className={`w-9 h-1.5 rounded-full transition-colors duration-200 ${
                currentStep >= 3 ? "bg-[#1a73e8]" : "bg-[#e2e8f0]"
              }`}
            />
            <div
              className={`w-9 h-1.5 rounded-full transition-colors duration-200 ${
                currentStep >= 4 ? "bg-[#1a73e8]" : "bg-[#e2e8f0]"
              }`}
            />
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

        {/* ---------------------------------------------------- */}
        {/* STEP 3: What companies are you targeting? */}
        {/* ---------------------------------------------------- */}
        {currentStep === 3 && (
          <div className="w-full flex flex-col items-center animate-fadeIn">
            {/* Heading */}
            <h1 className="text-[26px] sm:text-[30px] font-bold text-[#0f172a] text-center tracking-tight mb-6">
              What companies are you targeting?
            </h1>

            {/* Search Bar */}
            <div className="w-full max-w-[700px] relative mb-6">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
                placeholder="Search companies (e.g. Google, Microsoft, Amazon...)"
                className="w-full pl-11 pr-11 py-3 bg-[#f8fafc] border border-slate-200/90 rounded-xl text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/15 transition-all"
              />
              {isSearchingApi && (
                <Loader2 className="w-4 h-4 text-[#1a73e8] animate-spin absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              )}
            </div>

            {/* Popular Companies Heading */}
            <div className="w-full max-w-[700px] text-left mb-3">
              <span className="text-[13.5px] font-medium text-slate-500">
                {companySearch.trim() ? "Matching companies" : "Popular companies"}
              </span>
            </div>

            {/* Companies Grid or Empty State */}
            {filteredCompanies.length > 0 ? (
              <div className="w-full max-w-[700px] grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
                {filteredCompanies.map((company) => {
                  const isSelected = selectedCompanies.includes(company.name);
                  return (
                    <button
                      key={company.name}
                      type="button"
                      onClick={() => toggleCompanySelection(company.name)}
                      className={`py-3 px-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer flex items-center justify-between min-h-[52px] ${
                        isSelected
                          ? "border-[#1a73e8] bg-[#f0f7ff] ring-2 ring-[#1a73e8]/15 shadow-xs"
                          : "border-[#e2e8f0] bg-white hover:border-[#cbd5e1] hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden pr-2">
                        <CompanyLogo name={company.name} domain={company.domain} />
                        <span className="text-[13.5px] font-medium text-slate-800 truncate">
                          {company.name}
                        </span>
                      </div>

                      {/* Custom Checkbox */}
                      <div
                        className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? "bg-[#1a73e8] border-[#1a73e8] text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="w-full max-w-[700px] flex flex-col items-center justify-center py-9 px-4 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 my-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <Search className="w-5 h-5 stroke-[1.75]" />
                </div>
                <p className="text-[15px] font-semibold text-slate-800 mb-1">
                  No companies found for &ldquo;{companySearch}&rdquo;
                </p>
                <p className="text-[13px] text-slate-500 mb-4 max-w-sm">
                  Try searching with a different name or add your specific dream company.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCompanySearch("")}
                    className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#1a73e8] bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    Clear search
                  </button>
                  {companySearch.trim() && !selectedCompanies.includes(companySearch.trim()) && (
                    <button
                      type="button"
                      onClick={() => {
                        const customCompany = companySearch.trim();
                        if (customCompany) {
                          setSelectedCompanies((prev) => [...prev, customCompany]);
                          setCompanySearch("");
                        }
                      }}
                      className="px-4 py-2 rounded-xl text-[13px] font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer shadow-2xs"
                    >
                      Add &ldquo;{companySearch.trim()}&rdquo;
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* View More Companies Toggle (Only when not searching) */}
            {!companySearch.trim() && (
              <button
                type="button"
                onClick={() => setShowMoreCompanies((prev) => !prev)}
                className="flex items-center gap-1 text-[13.5px] font-medium text-[#1a73e8] hover:text-[#1557b0] transition-colors cursor-pointer my-4 select-none"
              >
                <span>{showMoreCompanies ? "View fewer companies" : "View more companies"}</span>
                {showMoreCompanies ? (
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
                onClick={handleStep3Continue}
                disabled={selectedCompanies.length === 0 || isSubmitting}
                className={`w-full max-w-[220px] py-3.5 px-8 rounded-xl text-[15px] font-medium transition-all duration-200 text-center ${
                  selectedCompanies.length > 0 && !isSubmitting
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
        {/* STEP 4: What should we call you? */}
        {/* ---------------------------------------------------- */}
        {currentStep === 4 && (
          <div className="w-full flex flex-col items-center animate-fadeIn py-2">
            {/* User Avatar Circle Icon */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#e8edfc] flex items-center justify-center mb-6 shadow-2xs">
              <User className="w-10 h-10 sm:w-12 sm:h-12 text-[#4f6bf7] fill-[#4f6bf7]" />
            </div>

            {/* Heading */}
            <h1 className="text-[26px] sm:text-[30px] font-bold text-[#0f172a] text-center tracking-tight mb-2">
              What should we call you?
            </h1>

            {/* Subtitle */}
            <p className="text-[14px] sm:text-[14.5px] text-slate-500 text-center mb-7">
              This is how we&apos;ll address you across the platform.
            </p>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleStep4Continue();
              }}
              className="w-full flex flex-col items-center"
            >
              <div className="w-full max-w-[460px] relative mb-2">
                <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  autoFocus
                  className="w-full pl-11 pr-4 py-3.5 bg-[#f8fafc] border border-slate-200/90 rounded-xl text-[14.5px] text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/15 transition-all"
                />
              </div>

              {/* Helper text */}
              <p className="text-[12.5px] text-slate-400 text-center mb-7">
                You can always change this later.
              </p>

              {/* Continue Button */}
              <button
                type="submit"
                disabled={!userName.trim() || isSubmitting}
                className={`w-full max-w-[220px] py-3.5 px-8 rounded-xl text-[15px] font-medium transition-all duration-200 text-center ${
                  userName.trim() && !isSubmitting
                    ? "bg-[#1a73e8] text-white hover:bg-[#1557b0] shadow-md shadow-[#1a73e8]/25 active:scale-[0.98] cursor-pointer"
                    : "bg-[#c7dcfc] text-white cursor-not-allowed opacity-90"
                }`}
              >
                {isSubmitting ? "Completing..." : "Continue"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#f8faff] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
