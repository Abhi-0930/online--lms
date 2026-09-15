import React, { useState, useEffect } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { toast } from "sonner";
import {
  BookOpen,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  Check,
  CheckCircle2,
  Send,
  Sparkles,
} from "lucide-react";

type AuthView = "login" | "forgot_password" | "reset_link_sent" | "reset_password" | "reset_success";

export default function Login() {
  const { login, requestPasswordReset, resetPassword } = useAdminAuth();

  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("abhishek.j3094@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Reset password fields
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [simulatedResetUrl, setSimulatedResetUrl] = useState<string | null>(null);

  // Check URL query parameters on mount (e.g. /reset-password?token=...&email=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const paramEmail = params.get("email");

    if (token || window.location.pathname.includes("reset-password")) {
      if (token) setResetToken(token);
      if (paramEmail) setEmail(paramEmail);
      setView("reset_password");
    }
  }, []);

  // Live password validation rules
  const rules = {
    length: newPassword.length >= 8,
    number: /\d/.test(newPassword),
    upper: /[A-Z]/.test(newPassword),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(newPassword),
  };
  const isPasswordValid = rules.length && rules.number && rules.upper && rules.special;

  // 1. Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both your email address and password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success("Welcome back, Abhishek! Logged in as Owner.");
      } else {
        toast.error(res.message || "Invalid admin credentials.");
      }
    } catch {
      toast.error("Authentication error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Forgot Password Submit (Send Reset Link)
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your admin email address.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestPasswordReset(email);
      if (res.success) {
        setResetToken(res.resetToken || "token_demo");
        if (res.resetUrl) {
          setSimulatedResetUrl(res.resetUrl);
        }
        setView("reset_link_sent");
        toast.success(`Password reset link sent to ${email}`);
      } else {
        toast.error(res.message || "Failed to send reset link.");
      }
    } catch {
      toast.error("Unable to process request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Handle Reset Password Submit
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error("Please make sure your new password meets all security requirements.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match. Please verify.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPassword(resetToken, newPassword, email);
      if (res.success) {
        setPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setView("reset_success");
        toast.success("Password reset successfully!");
      } else {
        toast.error(res.message || "Failed to reset password.");
      }
    } catch {
      toast.error("Error resetting password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-4 sm:p-6 select-none overflow-hidden font-sans">
      {/* Ambient background soft glow orbs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-indigo-50/60 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/4 h-72 w-72 -translate-y-1/2 rounded-full bg-sky-50/40 blur-2xl" />

      {/* Centered Modern Card */}
      <div className="relative z-10 w-full max-w-[440px] rounded-[28px] bg-white p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] border border-slate-100/80 transition-all">
        {/* ========================================================= */}
        {/* VIEW 1 & 6: ADMIN LOGIN                                  */}
        {/* ========================================================= */}
        {view === "login" && (
          <div>
            {/* Brand Header */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf2fd] text-[#1a73e8] shadow-sm ring-4 ring-[#eaf2fd]/50">
                <BookOpen className="h-7 w-7 stroke-[2.2]" />
              </div>

              <h1 className="mt-4 font-display text-xl font-bold tracking-tight text-slate-900">
                LearnHub
              </h1>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Admin Portal
              </p>

              <h2 className="mt-6 font-display text-[26px] font-bold tracking-tight text-slate-900">
                Welcome Back
              </h2>
              <p className="mt-1 text-xs text-slate-500 font-normal">
                Log in to access your admin panel.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="mt-7 space-y-4">
              {/* Email field */}
              <div className="space-y-1.5 text-left">
                <label className="text-[13px] font-semibold text-slate-700">
                  Email address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your admin email"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5 text-left">
                <label className="text-[13px] font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password link */}
              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  onClick={() => setView("forgot_password")}
                  className="text-xs font-medium text-[#1a73e8] hover:text-[#1557b0] transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Login Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1a73e8] font-medium text-sm text-white shadow-md shadow-[#1a73e8]/20 transition-all hover:bg-[#1557b0] active:scale-[0.99] disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Login</span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: FORGOT PASSWORD                                   */}
        {/* ========================================================= */}
        {view === "forgot_password" && (
          <div>
            {/* Brand Header */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf2fd] text-[#1a73e8] shadow-sm ring-4 ring-[#eaf2fd]/50">
                <BookOpen className="h-7 w-7 stroke-[2.2]" />
              </div>

              <h1 className="mt-4 font-display text-xl font-bold tracking-tight text-slate-900">
                LearnHub
              </h1>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Admin Portal
              </p>

              <h2 className="mt-6 font-display text-[26px] font-bold tracking-tight text-slate-900">
                Forgot Password?
              </h2>
              <p className="mt-1 text-xs text-slate-500 font-normal leading-relaxed max-w-[280px]">
                No worries! Enter your email address and we'll send you a reset link.
              </p>
            </div>

            {/* Email Form */}
            <form onSubmit={handleForgotPasswordSubmit} className="mt-7 space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[13px] font-semibold text-slate-700">
                  Email address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your admin email"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10"
                  />
                </div>
              </div>

              {/* Send Reset Link Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1a73e8] font-medium text-sm text-white shadow-md shadow-[#1a73e8]/20 transition-all hover:bg-[#1557b0] active:scale-[0.99] disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending reset link...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>

              {/* Back to Login link */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setView("login")}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1a73e8] hover:text-[#1557b0] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to login</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: RESET LINK SENT (CHECK YOUR EMAIL)               */}
        {/* ========================================================= */}
        {view === "reset_link_sent" && (
          <div className="flex flex-col items-center text-center">
            {/* Paper Airplane Circular Badge */}
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#dcfce7] text-[#16a34a] shadow-sm ring-8 ring-[#dcfce7]/40">
              <Send className="h-7 w-7 stroke-[2.2] -rotate-12 translate-x-0.5" />
              {/* Motion Sparkles */}
              <div className="absolute -top-1 -right-1 flex gap-0.5">
                <span className="h-2 w-0.5 rounded-full bg-[#16a34a] rotate-45" />
                <span className="h-1.5 w-0.5 rounded-full bg-[#16a34a] rotate-12" />
              </div>
            </div>

            <h2 className="mt-6 font-display text-[24px] font-bold tracking-tight text-slate-900">
              Check Your Email
            </h2>

            <p className="mt-2 text-xs text-slate-600 leading-relaxed max-w-[320px]">
              We've sent a password reset link to <strong className="text-slate-900">{email}</strong>.
            </p>

            <p className="mt-2 text-xs text-slate-500 leading-relaxed max-w-[300px]">
              Please check your inbox (and spam folder) and click the link to reset your password.
            </p>

            {/* Back to Login button */}
            <div className="mt-7 w-full space-y-3">
              <button
                type="button"
                onClick={() => setView("login")}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#f1f5f9] font-medium text-xs text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to login</span>
              </button>

              {/* Dev Shortcut to simulate clicking email link immediately */}
              <button
                type="button"
                onClick={() => setView("reset_password")}
                className="text-[11px] text-[#1a73e8] hover:underline cursor-pointer"
              >
                (Dev Shortcut: Open Reset Password screen)
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 4: RESET YOUR PASSWORD                               */}
        {/* ========================================================= */}
        {view === "reset_password" && (
          <div>
            {/* Brand Header */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf2fd] text-[#1a73e8] shadow-sm ring-4 ring-[#eaf2fd]/50">
                <BookOpen className="h-7 w-7 stroke-[2.2]" />
              </div>

              <h1 className="mt-4 font-display text-xl font-bold tracking-tight text-slate-900">
                LearnHub
              </h1>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Admin Portal
              </p>

              <h2 className="mt-5 font-display text-[24px] font-bold tracking-tight text-slate-900">
                Reset Your Password
              </h2>
              <p className="mt-1 text-xs text-slate-500 font-normal">
                Enter your new password below.
              </p>
            </div>

            {/* Reset Form */}
            <form onSubmit={handleResetPasswordSubmit} className="mt-6 space-y-4">
              {/* New Password field */}
              <div className="space-y-1.5 text-left">
                <label className="text-[13px] font-semibold text-slate-700">
                  New Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password Rules Checklist */}
                <div className="mt-2 space-y-1.5 pt-1">
                  {[
                    { key: "length", text: "At least 8 characters", valid: rules.length },
                    { key: "number", text: "Include a number", valid: rules.number },
                    { key: "upper", text: "Include an uppercase letter", valid: rules.upper },
                    { key: "special", text: "Include a special character", valid: rules.special },
                  ].map((rule) => (
                    <div
                      key={rule.key}
                      className={`flex items-center gap-2 text-[11px] transition-colors ${
                        rule.valid ? "text-emerald-600 font-medium" : "text-slate-400"
                      }`}
                    >
                      <div
                        className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center transition-all ${
                          rule.valid
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-slate-300 bg-transparent"
                        }`}
                      >
                        {rule.valid && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                      <span>{rule.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm New Password field */}
              <div className="space-y-1.5 text-left">
                <label className="text-[13px] font-semibold text-slate-700">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Reset Password Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1a73e8] font-medium text-sm text-white shadow-md shadow-[#1a73e8]/20 transition-all hover:bg-[#1557b0] active:scale-[0.99] disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Updating password...</span>
                  </>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 5: SUCCESS CONFIRMATION                              */}
        {/* ========================================================= */}
        {view === "reset_success" && (
          <div className="flex flex-col items-center text-center">
            {/* Green Checkmark Badge with Confetti dots */}
            <div className="relative flex h-18 w-18 items-center justify-center rounded-full bg-[#dcfce7] text-[#16a34a] shadow-sm ring-8 ring-[#dcfce7]/40">
              <Check className="h-9 w-9 stroke-[3]" />

              {/* Confetti particles */}
              <span className="absolute -top-1 -left-2 h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="absolute -top-2 right-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span className="absolute -bottom-1 -left-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />
              <span className="absolute bottom-1 -right-2 h-1.5 w-1.5 rounded-full bg-purple-500" />
              <span className="absolute top-1/2 -right-3 h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>

            <h2 className="mt-6 font-display text-[24px] font-bold tracking-tight text-slate-900">
              Password Reset Successful!
            </h2>

            <p className="mt-2 text-xs text-slate-500 leading-relaxed max-w-[290px]">
              Your password has been updated successfully. You can now log in to your admin panel.
            </p>

            {/* Go to Login button */}
            <button
              type="button"
              onClick={() => setView("login")}
              className="mt-7 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1a73e8] font-medium text-sm text-white shadow-md shadow-[#1a73e8]/20 transition-all hover:bg-[#1557b0] active:scale-[0.99] cursor-pointer"
            >
              <span>Go to Login</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
