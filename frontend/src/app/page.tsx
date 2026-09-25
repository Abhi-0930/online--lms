"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  ChevronDown,
  Search,
  CheckCircle2,
  Circle,
  User,
  Laptop,
  ShieldAlert,
  LogOut,
  ArrowRight,
  X,
} from "lucide-react";
import { COUNTRIES, DEFAULT_COUNTRY, type Country } from "@/lib/countries";
import { CountryFlag } from "@/components/CountryFlag";
import { createSecureUrl, decodeDataParam } from "@/lib/urlParams";
import { useAuth } from "@/hooks/useAuth";

function AuthForm({
  initialMode = "login",
}: {
  initialMode?: "login" | "register";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, refresh } = useAuth();
  const dataParam = searchParams?.get("data") || searchParams?.get("q");

  const decoded = decodeDataParam<{
    mode?: "login" | "register";
    error?: string;
    email?: string;
  }>(dataParam);

  const errorParam = decoded?.error || searchParams?.get("error");
  const emailParam = decoded?.email || searchParams?.get("email");

  const [isSignUp, setIsSignUp] = useState(
    decoded?.mode === "register" ||
      initialMode === "register" ||
      searchParams?.get("mode") === "register" ||
      errorParam === "ACCOUNT_NOT_FOUND"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceLimitModal, setDeviceLimitModal] = useState<{
    open: boolean;
    activeDeviceName?: string;
    ipAddress?: string;
    lastActiveAt?: string;
  }>({ open: false });

  const setMode = (signUp: boolean) => {
    setIsSignUp(signUp);
    setFormData((prev) => ({
      ...prev,
      password: "",
    }));
    router.replace(
      createSecureUrl("/", {
        mode: signUp ? "register" : "login",
      })
    );
  };

  // Ensure root URL is ALWAYS completely encrypted with tamper-resistant query params
  useEffect(() => {
    if (!dataParam) {
      const rawError = searchParams?.get("error");
      const rawEmail = searchParams?.get("email");
      router.replace(
        createSecureUrl("/", {
          mode: isSignUp ? "register" : "login",
          ...(rawError ? { error: rawError } : {}),
          ...(rawEmail ? { email: rawEmail } : {}),
        })
      );
    }
  }, [dataParam, isSignUp, router, searchParams]);

  // Country code selector state
  const [selectedCountry, setSelectedCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: emailParam || "",
    password: "",
  });

  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isPasswordHovered, setIsPasswordHovered] = useState(false);

  // Password Strength Validation Rules: Min 8, 1 Capital letter, 1 Special character
  const password = formData.password;
  const hasMinLength = password.length >= 8;
  const hasCapital = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);
  const isPasswordValid = hasMinLength && hasCapital && hasSpecial;
  const hasStartedTyping = password.length > 0;

  // Real-time border color for password input only: red if less validated, green if good
  const passwordBorderClass = isSignUp
    ? hasStartedTyping
      ? isPasswordValid
        ? "border-emerald-500 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100"
        : "border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100"
      : "border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
    : "border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100";

  const passwordTooltipTitle = isSignUp
    ? `Password Requirements:\n${hasMinLength ? "✓" : "✗"} Minimum 8 characters\n${hasCapital ? "✓" : "✗"} At least 1 capital letter (A-Z)\n${hasSpecial ? "✓" : "✗"} At least 1 special character (!@#$%^&*...)`
    : undefined;

  // Handle OAuth error callbacks
  useEffect(() => {
    if (errorParam === "ACCOUNT_NOT_FOUND") {
      toast.error("No account found with this Google account. Please create an account first.");
      setIsSignUp(true);
      if (emailParam) {
        setFormData((prev) => ({ ...prev, email: emailParam }));
      }
    } else if (errorParam === "DEVICE_LIMIT_REACHED") {
      toast.error("Device limit reached (Maximum 1 device allowed). Please sign out from your other device.");
    } else if (errorParam === "SESSION_REVOKED") {
      toast.error("Your session ended because your account was logged into on another device.");
    } else if (errorParam === "AUTH_FAILED") {
      toast.error("Authentication failed. Please try again.");
    }
  }, [errorParam, emailParam]);

  // Close country dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCountryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPersistentDeviceId = (): string => {
    if (typeof window === "undefined") return "web-unknown";
    try {
      let id = localStorage.getItem("lms_device_id");
      if (!id) {
        id = `web-${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
        localStorage.setItem("lms_device_id", id);
      }
      return id;
    } catch {
      return `web-fallback-${Date.now().toString(36)}`;
    }
  };

  const getBrowserDeviceName = (): string => {
    if (typeof window === "undefined") return "Web Browser";
    const ua = navigator.userAgent || "";
    if (/android/i.test(ua)) return "Android Device";
    if (/iPad|iPhone|iPod/.test(ua)) return "iOS Device (Safari/Chrome)";
    if (/Macintosh|Mac OS X/.test(ua)) return "Mac (Web Browser)";
    if (/Windows/.test(ua)) return "Windows PC (Web Browser)";
    if (/Linux/.test(ua)) return "Linux PC (Web Browser)";
    return "Web Browser";
  };

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.dialCode.includes(countrySearch) ||
      c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleForceLogin = async () => {
    setDeviceLimitModal({ open: false });
    setIsLoading(true);
    try {
      const endpoint = "http://localhost:4000/api/v1/auth/login";
      const payload = {
        email: formData.email,
        password: formData.password,
        deviceId: getPersistentDeviceId(),
        deviceName: getBrowserDeviceName(),
        force: true,
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const resData = await res.json().catch(() => ({}));
        const rawUser = resData?.user || {};
        const fallbackName = formData.fullName.trim() || formData.email.split("@")[0];
        const userObj = {
          ...rawUser,
          id: rawUser.id || undefined,
          email: rawUser.email || formData.email,
          name: rawUser.name || rawUser.fullName || fallbackName,
          fullName: rawUser.fullName || rawUser.name || fallbackName,
          role: rawUser.role || "STUDENT",
          avatarUrl: rawUser.avatarUrl || null,
        };

        setUser(userObj);
        refresh().catch(() => {});
        toast.success("Signed in successfully! Other device disconnected.");
        router.push(createSecureUrl("/dashboard", { v: "dashboard" }));
        return;
      }

      const errData = await res.json().catch(() => ({}));
      toast.error(errData.message || "Failed to disconnect other device");
    } catch {
      toast.error("Unable to connect to authentication server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp && !isPasswordValid) {
      if (!hasMinLength) {
        toast.error("Password must be at least 8 characters long");
      } else if (!hasCapital) {
        toast.error("Password must contain at least one capital letter (A-Z)");
      } else if (!hasSpecial) {
        toast.error("Password must contain at least one special character");
      } else {
        toast.error("Please meet all password strength requirements");
      }
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isSignUp
        ? "http://localhost:4000/api/v1/auth/register"
        : "http://localhost:4000/api/v1/auth/login";

      const payload = isSignUp
        ? {
            fullName: formData.fullName.trim() || formData.email.split("@")[0],
            email: formData.email,
            password: formData.password,
            phone: `${selectedCountry.dialCode}${formData.phone}`,
            deviceId: getPersistentDeviceId(),
            deviceName: getBrowserDeviceName(),
          }
        : {
            email: formData.email,
            password: formData.password,
            deviceId: getPersistentDeviceId(),
            deviceName: getBrowserDeviceName(),
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const resData = await res.json().catch(() => ({}));
        const rawUser = resData?.user || {};
        const fallbackName = formData.fullName.trim() || formData.email.split("@")[0];
        const userObj = {
          ...rawUser,
          id: rawUser.id || undefined,
          email: rawUser.email || formData.email,
          name: rawUser.name || rawUser.fullName || fallbackName,
          fullName: rawUser.fullName || rawUser.name || fallbackName,
          role: rawUser.role || "STUDENT",
          avatarUrl: rawUser.avatarUrl || null,
        };

        // Instantly update AuthContext React state and localStorage
        setUser(userObj);
        refresh().catch(() => {});

        toast.success(
          isSignUp ? "Account created successfully!" : "Welcome back!"
        );
        router.push(
          isSignUp
            ? createSecureUrl("/onboarding", { step: 1 })
            : createSecureUrl("/dashboard", { v: "dashboard" })
        );
        return;
      }

      const errData = await res.json().catch(() => ({}));
      if (
        res.status === 409 ||
        errData.code === "DEVICE_LIMIT_REACHED" ||
        errData.error === "DEVICE_LIMIT_REACHED" ||
        errData.message?.toLowerCase().includes("device limit")
      ) {
        setDeviceLimitModal({
          open: true,
          activeDeviceName: errData.activeDevice?.deviceName || "Another Device",
          ipAddress: errData.activeDevice?.ipAddress,
          lastActiveAt: errData.activeDevice?.lastActiveAt,
        });
      } else if (
        res.status === 404 ||
        errData.code === "ACCOUNT_NOT_FOUND" ||
        errData.error === "ACCOUNT_NOT_FOUND" ||
        errData.message?.toLowerCase().includes("no account found")
      ) {
        toast.error(errData.message || "No account found with this email. Switched to Sign Up.");
        setMode(true);
      } else {
        toast.error(errData.message || (isSignUp ? "Registration failed" : "Invalid email or password"));
      }
    } catch {
      toast.error("Unable to connect to the authentication server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const deviceId = getPersistentDeviceId();
    const deviceName = getBrowserDeviceName();
    window.location.href = `http://localhost:4000/api/v1/auth/google?state=${isSignUp ? "register" : "login"}&deviceId=${encodeURIComponent(deviceId)}&deviceName=${encodeURIComponent(deviceName)}`;
  };

  return (
    <div className="h-screen max-h-screen w-full bg-white text-gray-900 flex flex-col lg:flex-row font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden">
      {/* Left Column: Seamless hero illustration */}
      <div className="hidden lg:flex lg:w-[50%] xl:w-[51%] 2xl:w-[50%] h-full max-h-screen relative bg-white items-center justify-start p-0 overflow-hidden select-none">
        <img
          src={isSignUp ? "/register-hero.png" : "/login-hero.png"}
          alt={
            isSignUp
              ? "Learn Today. Build Tomorrow."
              : "Learn. Practice. Get Placed."
          }
          className="h-full w-auto max-h-full object-contain object-left select-none pointer-events-none transition-opacity duration-200"
        />
      </div>

      {/* Right Column: Auth Container */}
      <div className="w-full lg:w-[50%] xl:w-[49%] 2xl:w-[50%] h-full max-h-screen flex flex-col justify-between px-6 sm:px-10 lg:px-12 xl:px-16 py-4 lg:py-6 bg-[#fcfcfd] lg:bg-white overflow-y-auto lg:overflow-hidden">
        {/* Top Navbar */}
        <div className="w-full flex items-center justify-between lg:justify-end gap-3 pt-1 pb-2 shrink-0">
          {/* Logo on mobile only (desktop has it in the hero image) */}
          <div
            className="flex lg:hidden items-center gap-2 select-none cursor-pointer"
            onClick={() => router.push("/")}
          >
            <div className="flex items-center justify-center text-[#1a73e8]">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-bold text-[20px] tracking-tight text-gray-900">
              PrepPath
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[14px] text-gray-500 font-normal">
              {isSignUp ? "Already have an account?" : "New here?"}
            </span>
            {isSignUp ? (
              <button
                type="button"
                onClick={() => setMode(false)}
                className="text-[14px] font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
              >
                Sign in
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode(true)}
                className="text-[14px] font-medium text-gray-800 bg-white hover:bg-gray-50 border border-gray-200 px-4 py-1.5 rounded-xl transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                Create account
              </button>
            )}
          </div>
        </div>

        {/* Center Auth Card */}
        <div className="flex-1 flex items-center justify-center py-2 shrink min-h-0">
          <div className="w-full max-w-[460px] bg-white rounded-[28px] p-7 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-100/90">
            {/* Header Text */}
            <div className="mb-5">
              <h1 className="text-[28px] sm:text-[32px] font-bold tracking-tight text-gray-900 leading-tight">
                {isSignUp ? "Create your account" : "Welcome back"}
              </h1>
              <p className="text-[14.5px] text-gray-500 mt-1.5 font-normal">
                {isSignUp
                  ? "Join PrepPath and start your learning journey."
                  : "Sign in to continue your learning journey."}
              </p>
            </div>

            {/* Login / Register Form */}
            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              {/* Full Name Field (Only on Sign Up) */}
              {isSignUp && (
                <div>
                  <div className="relative flex items-center rounded-xl border border-gray-200 bg-white px-3.5 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all h-[48px]">
                    <User className="w-5 h-5 text-gray-400 mr-2.5 shrink-0 stroke-[1.8]" />
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required={isSignUp}
                      className="w-full bg-transparent text-[14px] text-gray-800 placeholder:text-gray-400 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Mobile Number Field (Only on Sign Up) */}
              {isSignUp && (
                <div className="flex items-center gap-2.5">
                  {/* Country Code Dropdown Trigger */}
                  <div className="relative" ref={countryDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsCountryOpen(!isCountryOpen)}
                      className="h-[48px] px-3 rounded-xl border border-gray-200 bg-white flex items-center gap-2 text-[14px] text-gray-800 hover:border-gray-300 transition-all cursor-pointer select-none shrink-0"
                    >
                      <CountryFlag code={selectedCountry.code} className="w-5 h-3.5 object-cover rounded-[2px]" />
                      <span className="font-medium text-[13.5px] text-gray-700">
                        {selectedCountry.dialCode}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-400 stroke-[2]" />
                    </button>

                    {/* Popover Dropdown matching Screenshot */}
                    {isCountryOpen && (
                      <div className="absolute left-0 top-[52px] w-[275px] bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                        {/* Search bar */}
                        <div className="relative flex items-center px-2.5 py-1.5 mb-1.5 rounded-lg bg-gray-50 border border-gray-100">
                          <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                          <input
                            type="text"
                            placeholder="Search country or code..."
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            className="w-full bg-transparent text-[13px] text-gray-800 placeholder:text-gray-400 outline-none"
                            autoFocus
                          />
                        </div>

                        {/* Country List */}
                        <div className="max-h-[220px] overflow-y-auto space-y-0.5 pr-1 scrollbar-thin">
                          {filteredCountries.map((country) => {
                            const isSelected =
                              country.code === selectedCountry.code;
                            return (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => {
                                  setSelectedCountry(country);
                                  setIsCountryOpen(false);
                                  setCountrySearch("");
                                }}
                                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[13px] transition-colors text-left cursor-pointer ${
                                  isSelected
                                    ? "bg-blue-50 text-blue-600 font-medium"
                                    : "hover:bg-gray-50 text-gray-700"
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <CountryFlag code={country.code} className="w-4.5 h-3 object-cover rounded-[2px]" />
                                  <span className="truncate">{country.name}</span>
                                </div>
                                <span className="text-[12.5px] font-medium text-gray-400 ml-2 shrink-0">
                                  {country.dialCode}
                                </span>
                              </button>
                            );
                          })}
                          {filteredCountries.length === 0 && (
                            <p className="text-center py-4 text-[12px] text-gray-400">
                              No countries found
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mobile number input */}
                  <div className="flex-1 relative flex items-center rounded-xl border border-gray-200 bg-white px-3.5 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all h-[48px]">
                    <Smartphone className="w-5 h-5 text-gray-400 mr-2.5 shrink-0 stroke-[1.8]" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Mobile number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required={isSignUp}
                      className="w-full bg-transparent text-[14px] text-gray-800 placeholder:text-gray-400 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <div className="relative flex items-center rounded-xl border border-gray-200 bg-white px-3.5 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all h-[48px]">
                  <Mail className="w-5 h-5 text-gray-400 mr-2.5 shrink-0 stroke-[1.8]" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-transparent text-[14px] text-gray-800 placeholder:text-gray-400 outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div
                className="relative"
                onMouseEnter={() => setIsPasswordHovered(true)}
                onMouseLeave={() => setIsPasswordHovered(false)}
              >
                <div
                  className={`relative flex items-center rounded-xl border bg-white px-3.5 py-3 transition-all duration-150 h-[48px] ${passwordBorderClass}`}
                >
                  <Lock
                    className={`w-5 h-5 mr-2.5 shrink-0 stroke-[1.8] transition-colors ${
                      isSignUp && hasStartedTyping
                        ? isPasswordValid
                          ? "text-emerald-500"
                          : "text-red-500"
                        : "text-gray-400"
                    }`}
                  />
                  <input
                    key={isSignUp ? "signup-password-field" : "login-password-field"}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    title={passwordTooltipTitle}
                    required
                    className="w-full bg-transparent text-[14px] text-gray-800 placeholder:text-gray-400 outline-none pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 stroke-[1.8]" />
                    ) : (
                      <Eye className="w-5 h-5 stroke-[1.8]" />
                    )}
                  </button>
                </div>

                {/* Password strength checklist / hover tooltip */}
                {isSignUp && (
                  <div
                    className={`mt-2 rounded-xl p-3 border transition-all duration-200 ${
                      hasStartedTyping
                        ? isPasswordValid
                          ? "bg-emerald-50/70 border-emerald-200 shadow-sm"
                          : "bg-red-50/50 border-red-200 shadow-sm"
                        : "bg-gray-50/80 border-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] font-semibold text-gray-700">
                        {hasStartedTyping ? (
                          isPasswordValid ? (
                            <span className="text-emerald-700">✓ All requirements met</span>
                          ) : (
                            <span className="text-red-700">Required validation:</span>
                          )
                        ) : (
                          <span>Password requirements:</span>
                        )}
                      </span>
                      {hasStartedTyping && (
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            isPasswordValid
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {isPasswordValid
                            ? "Strong"
                            : `${[hasMinLength, hasCapital, hasSpecial].filter(Boolean).length}/3 completed`}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-[12px]">
                      <div
                        className={`flex items-center gap-1.5 transition-colors ${
                          hasMinLength ? "text-emerald-700 font-medium" : "text-gray-500"
                        }`}
                      >
                        {hasMinLength ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        )}
                        <span>Minimum 8 characters</span>
                      </div>

                      <div
                        className={`flex items-center gap-1.5 transition-colors ${
                          hasCapital ? "text-emerald-700 font-medium" : "text-gray-500"
                        }`}
                      >
                        {hasCapital ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        )}
                        <span>At least one capital letter (A-Z)</span>
                      </div>

                      <div
                        className={`flex items-center gap-1.5 transition-colors ${
                          hasSpecial ? "text-emerald-700 font-medium" : "text-gray-500"
                        }`}
                      >
                        {hasSpecial ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        )}
                        <span>At least one special character (!@#$%^&*...)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Forgot Password Link (Only for Login) */}
              {!isSignUp && (
                <div className="flex justify-end pt-0.5">
                  <Link
                    href={createSecureUrl("/forgot-password", { v: "forgot-password" })}
                    className="text-[13.5px] font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold py-3.5 px-4 rounded-xl text-[15px] shadow-sm transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <span className="inline-block w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isSignUp ? (
                  "Create account"
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            {/* OR Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="w-full border-t border-gray-200" />
              <span className="bg-white px-3 text-xs text-gray-400 font-normal lowercase absolute">
                or
              </span>
            </div>

            {/* Continue with Google Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white hover:bg-gray-50/90 text-gray-800 font-semibold py-3 px-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-center gap-3 text-[14px] transition-all duration-150 active:scale-[0.99] cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Bottom Footer or Switch Link */}
            {isSignUp ? (
              <div className="text-center mt-5 text-[12px] text-gray-500 leading-relaxed">
                By creating an account, you agree to our{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
                .
              </div>
            ) : (
              <div className="text-center mt-5">
                <span className="text-[14px] text-gray-500">
                  Don&apos;t have an account?{" "}
                </span>
                <button
                  type="button"
                  onClick={() => setMode(true)}
                  className="text-[14px] font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  Create account
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom subtle space */}
        <div className="h-2 shrink-0" />
      </div>

      {/* Device Limit Exceeded Modal */}
      {deviceLimitModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setDeviceLimitModal({ open: false })}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 shrink-0">
                <ShieldAlert className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-gray-900">Device Limit Reached</h3>
                <p className="text-xs text-gray-500">1 active device allowed per account</p>
              </div>
            </div>

            <div className="mt-4 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Device</p>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Currently Signed In
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-blue-600 shrink-0 shadow-xs">
                  <Laptop className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {deviceLimitModal.activeDeviceName || "Web Browser"}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">
                    IP: {deviceLimitModal.ipAddress || "Active"} • Last active:{" "}
                    {deviceLimitModal.lastActiveAt
                      ? new Date(deviceLimitModal.lastActiveAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Recently"}
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-3.5 text-xs text-gray-600 leading-relaxed">
              Signing in here will safely disconnect your other active device.
            </p>

            <div className="mt-5 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setDeviceLimitModal({ open: false })}
                className="w-1/3 py-2.5 px-3 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100/80 transition cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleForceLogin}
                className="w-2/3 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-semibold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Switch to this Device</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuthPage({
  initialMode = "login",
}: {
  initialMode?: "login" | "register";
}) {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-white" />}>
      <AuthForm initialMode={initialMode} />
    </Suspense>
  );
}
