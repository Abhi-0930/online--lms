import React, { useState } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { toast } from "sonner";
import { BookOpen, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

export default function Login() {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
      toast.error("Authentication server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    toast.info("Password reset request sent to your registered admin address (abhishek.j3094@gmail.com).");
  };

  return (
    <div className="relative min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-4 sm:p-6 select-none overflow-hidden font-sans">
      {/* Ambient background soft glow orbs matching screenshot */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-indigo-50/60 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/4 h-72 w-72 -translate-y-1/2 rounded-full bg-sky-50/40 blur-2xl" />

      {/* Centered Modern Card */}
      <div className="relative z-10 w-full max-w-[440px] rounded-[28px] bg-white p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] border border-slate-100/80 transition-all">
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
        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
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
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors"
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
              onClick={handleForgotPassword}
              className="text-xs font-medium text-[#1a73e8] hover:text-[#1557b0] transition-colors"
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
    </div>
  );
}
