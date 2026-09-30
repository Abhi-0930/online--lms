"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  CheckCircle,
  Play,
  Users,
  ShieldCheck,
  Star,
  Flame,
  Code2,
  Layers,
  Sparkle
} from "lucide-react";
import { LayerRevealCanvas } from "./LayerRevealCanvas";
import { Hero3DVisualization } from "./Hero3DVisualization";

export function HeroSection({ onStartLearning }: { onStartLearning?: () => void }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [viewMode, setViewMode] = useState<"reveal" | "workspace">("reveal");

  useEffect(() => {
    router.prefetch("/dashboard");
    router.prefetch("/login");
  }, [router]);

  const handleAction = () => {
    if (onStartLearning) {
      onStartLearning();
    } else {
      const hasToken =
        typeof window !== "undefined" &&
        Boolean(
          localStorage.getItem("lms_access_token") ||
          localStorage.getItem("lms_active_session_token") ||
          sessionStorage.getItem("lms_session_token") ||
          localStorage.getItem("lms_user_profile")
        );

      if ((isAuthenticated || user) && hasToken) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  };

  const scrollTo = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="overview" className="relative min-h-screen pt-32 pb-20 overflow-hidden bg-gradient-to-b from-[#f0f6fa] via-[#f7fafc] to-white">
      
      {/* Ambient background soft light */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[900px] h-[480px] bg-gradient-to-tr from-sky-200/40 via-blue-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Editorial Top Capsule Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-slate-200/80 text-slate-700 shadow-xs backdrop-blur-md mb-8"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-500" />
          </span>
          <span className="text-xs font-semibold tracking-wide">
            2026 Batch Enrollment Open
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-xs font-bold text-slate-900">
            96% Placement Rate
          </span>
        </motion.div>

        {/* Editorial Headline Inspired by Motion Reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-1 mb-6"
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[76px] tracking-tight leading-[1.08] text-slate-900 font-display">
            <span className="font-serif italic font-normal text-slate-900 block sm:inline mr-3">
              Where ambition
            </span>
            <span className="font-extrabold tracking-tight font-display text-slate-950">
              finds its path.
            </span>
          </h1>
        </motion.div>

        {/* Subtitle with High-End SaaS Clarity */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8"
        >
          For those who aspire to learn, build, and grow. Develop real-world skills through structured learning, hands-on practice, and a community committed to progress.
        </motion.p>

        {/* CTA Buttons: Electric Lime Pill from Video + Glass Secondary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14"
        >
          <button
            onClick={handleAction}
            className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#b4ff39] hover:bg-[#a6f528] text-slate-950 font-extrabold text-sm shadow-lg shadow-[#b4ff39]/30 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Start Learning</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => scrollTo("#showcase")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/90 border border-slate-200/90 text-slate-800 font-bold text-sm hover:bg-white shadow-xs backdrop-blur-md transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current text-slate-900" />
            <span>Experience Platform Demo</span>
          </button>
        </motion.div>

        {/* Centerpiece Visualizer Switcher & Frame */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="relative w-full max-w-5xl mx-auto"
        >
          {/* Subtle Mode Switcher Tabs */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <button
              onClick={() => setViewMode("reveal")}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                viewMode === "reveal"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white/80 text-slate-600 hover:bg-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5 inline mr-1 text-lime-400" />
              Interactive Layer Reveal (Hover Canvas)
            </button>
            <button
              onClick={() => setViewMode("workspace")}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                viewMode === "workspace"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white/80 text-slate-600 hover:bg-white"
              }`}
            >
              <Code2 className="w-3.5 h-3.5 inline mr-1 text-blue-400" />
              3D Live Code Arena Workspace
            </button>
          </div>

          {/* Render Active Centerpiece */}
          {viewMode === "reveal" ? (
            <div className="rounded-3xl border border-slate-200/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] bg-white/60 backdrop-blur-md p-2 sm:p-3">
              <LayerRevealCanvas />
            </div>
          ) : (
            <div className="py-4">
              <Hero3DVisualization />
            </div>
          )}
        </motion.div>

        {/* Micro Value Metric Highlights Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="pt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-semibold text-slate-600"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>400+ Curated LeetCode Patterns</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>1:1 Weekly FAANG Mentorship</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>500+ Direct Hiring Partners</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="font-bold text-slate-900">4.9/5 from 12,000+ engineers</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
