"use client";

import React, { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Play,
  CheckCircle2,
  Sparkles,
  Award,
  Terminal,
  BarChart3,
  Flame,
  Check,
  ShieldCheck,
  Zap,
  Code2,
  FolderGit2
} from "lucide-react";

export function Hero3DVisualization() {
  const [activeTab, setActiveTab] = useState<"code" | "analytics" | "course">("code");
  const [isCopied, setIsCopied] = useState(false);

  // Mouse tilt tracking
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 120, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 120, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);
  const cardTranslateZ = useTransform(mouseXSpring, [-0.5, 0.5], ["30px", "40px"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[620px] mx-auto select-none [perspective:1400px]"
    >
      {/* Ambient background glow orbs */}
      <div className="absolute -top-12 -left-12 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* 3D Tilting Root Container */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full rounded-2xl border border-slate-200/90 bg-white/95 shadow-[0_25px_70px_-15px_rgba(49,87,232,0.12),0_10px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-shadow duration-300"
      >
        {/* Top Window Chrome */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-400/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block" />
            <div className="ml-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white border border-slate-200/60 text-[11px] font-medium text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>live.preppath.workspace</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab("code")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "code"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Code2 className="w-3.5 h-3.5 inline mr-1" />
              Code Arena
            </button>
            <button
              onClick={() => setActiveTab("course")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "course"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Play className="w-3 h-3 inline mr-1" />
              Course Player
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 inline mr-1" />
              Analytics
            </button>
          </div>
        </div>

        {/* Dashboard Content Body */}
        <div className="p-5 space-y-4">
          {/* Active Course Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white border border-blue-100/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30 shrink-0">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100/70 px-2 py-0.5 rounded-full">
                    Module 08
                  </span>
                  <span className="text-[12px] font-medium text-slate-500">Live Cohort</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                  Dynamic Programming: Kadane & Knapsack Patterns
                </h4>
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-end">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
                <span>Progress: 84%</span>
              </div>
              <div className="w-24 h-1.5 bg-blue-100 rounded-full mt-1.5 overflow-hidden">
                <div className="w-[84%] h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" />
              </div>
            </div>
          </div>

          {/* Tab 1: Code Arena */}
          {activeTab === "code" && (
            <div className="rounded-xl border border-slate-200 bg-slate-950 p-4 font-mono text-[12.5px] text-slate-100 shadow-inner">
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">Solution.ts</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    TypeScript 5.7
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-sans">Time Complexity: O(N)</span>
              </div>

              <div className="space-y-1 text-slate-300 overflow-x-auto leading-relaxed">
                <div>
                  <span className="text-purple-400 font-bold">function</span>{" "}
                  <span className="text-blue-300">maxSubArray</span>(nums: <span className="text-yellow-300">number[]</span>): <span className="text-yellow-300">number</span> {"{"}
                </div>
                <div className="pl-4 text-slate-400">
                  <span className="text-purple-400">let</span> maxSum = nums[<span className="text-orange-300">0</span>];
                </div>
                <div className="pl-4 text-slate-400">
                  <span className="text-purple-400">let</span> currentSum = <span className="text-orange-300">0</span>;
                </div>
                <div className="pl-4 text-slate-400">
                  <span className="text-purple-400">for</span> (<span className="text-purple-400">const</span> num <span className="text-purple-400">of</span> nums) {"{"}
                </div>
                <div className="pl-8 text-emerald-300 font-semibold">
                  currentSum = Math.<span className="text-blue-300">max</span>(num, currentSum + num);
                </div>
                <div className="pl-8 text-emerald-300 font-semibold">
                  maxSum = Math.<span className="text-blue-300">max</span>(maxSum, currentSum);
                </div>
                <div className="pl-4 text-slate-400">{"}"}</div>
                <div className="pl-4 text-purple-400">
                  return <span className="text-slate-100">maxSum;</span>
                </div>
                <div>{"}"}</div>
              </div>

              {/* Execution Feedback Pill */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>3/3 Test Cases Passed</span>
                  <span className="text-slate-500 font-sans">· 12ms (Beats 98.4%)</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                  ACCEPTED
                </span>
              </div>
            </div>
          )}

          {/* Tab 2: Course Player Preview */}
          {activeTab === "course" && (
            <div className="rounded-xl border border-slate-200 bg-slate-900 overflow-hidden relative group">
              <div className="aspect-video w-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center relative">
                <div className="w-14 h-14 rounded-2xl bg-blue-600/90 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 group-hover:scale-110 transition-transform cursor-pointer">
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                </div>
                <div className="mt-3">
                  <p className="text-xs font-semibold text-blue-400">Lesson 14 · 4K Crisp Playback</p>
                  <h5 className="text-sm font-bold text-white mt-0.5">
                    Distributed Caching with Redis & Cache Invalidation Strategies
                  </h5>
                </div>

                {/* Progress scrub preview */}
                <div className="absolute bottom-3 left-4 right-4 flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 font-mono">18:42</span>
                  <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="w-[65%] h-full bg-blue-500 rounded-full" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">28:15</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Analytics Preview */}
          {activeTab === "analytics" && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-900">Skill Proficiency Radar</h5>
                  <p className="text-[11px] text-slate-500">Benchmark vs Top 5% Candidates</p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Top 2% Percentile
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                  <p className="text-[11px] text-slate-500">DSA Score</p>
                  <p className="text-sm font-bold text-blue-600 mt-0.5">94 / 100</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                  <p className="text-[11px] text-slate-500">System Design</p>
                  <p className="text-sm font-bold text-indigo-600 mt-0.5">88 / 100</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                  <p className="text-[11px] text-slate-500">Code Quality</p>
                  <p className="text-sm font-bold text-emerald-600 mt-0.5">96 / 100</p>
                </div>
              </div>
            </div>
          )}

          {/* Mini Action Badges Footer */}
          <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Next live masterclass: Today 8:00 PM IST</span>
            </div>
            <div className="flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700 cursor-pointer">
              <span>View Full LMS Demo</span>
              <span>→</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating 3D Depth Card 1: Top-Right Streak Badge */}
      <motion.div
        style={{
          translateZ: cardTranslateZ,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="absolute -top-6 -right-6 hidden sm:flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/95 border border-slate-200/90 shadow-lg shadow-blue-500/10 backdrop-blur-md"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-xs">
          <Flame className="w-4 h-4 fill-current" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-900 leading-tight">28-Day Streak 🔥</p>
          <p className="text-[10px] text-slate-500 font-medium">Top 1% Consistent</p>
        </div>
      </motion.div>

      {/* Floating 3D Depth Card 2: Bottom-Left Mentor Review Card */}
      <motion.div
        style={{
          translateZ: cardTranslateZ,
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="absolute -bottom-6 -left-6 hidden sm:flex items-center gap-3 px-4 py-3 rounded-xl bg-white/95 border border-slate-200/90 shadow-xl shadow-slate-900/5 backdrop-blur-md max-w-[260px]"
      >
        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-900">Assignment Review</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded">98/100</span>
          </div>
          <p className="text-[11px] text-slate-500 truncate">Approved by Senior SDE @ Google</p>
        </div>
      </motion.div>

      {/* Floating 3D Depth Card 3: Bottom-Right Verified Credential */}
      <motion.div
        style={{
          translateZ: cardTranslateZ,
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="absolute -bottom-8 -right-4 hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-white shadow-xl text-xs font-semibold"
      >
        <Award className="w-4 h-4 text-amber-400" />
        <span>Verified Certificate</span>
        <Check className="w-3.5 h-3.5 text-emerald-400" />
      </motion.div>
    </div>
  );
}
