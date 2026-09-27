"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  PlaySquare,
  Code2,
  FileCheck2,
  Award,
  CheckCircle2,
  Sparkles,
  Terminal,
  Bookmark,
  Share2,
  ArrowRight,
  TrendingUp,
  Clock,
  Laptop,
  Check,
  Zap,
  Play
} from "lucide-react";

export function LMSShowcase() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "player" | "practice" | "assignments" | "certificate"
  >("practice");

  const tabs = [
    { id: "dashboard", label: "Student Dashboard", icon: LayoutDashboard },
    { id: "player", label: "Course Player & Notes", icon: PlaySquare },
    { id: "practice", label: "Practice Arena & Code Runner", icon: Code2 },
    { id: "assignments", label: "Assignments & Reviews", icon: FileCheck2 },
    { id: "certificate", label: "Verified Certificates", icon: Award },
  ] as const;

  return (
    <section id="showcase" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Laptop className="w-3.5 h-3.5" />
            <span>Interactive Product Tour</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            The Learning Environment Built for Elite Engineers
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Experience an all-in-one workspace combining video lectures, in-browser code compilation, automated tests, and 1:1 mentor feedback.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/25 scale-102"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Device Screen Frame */}
        <div className="relative rounded-3xl border border-slate-300/80 bg-slate-900 shadow-2xl p-2 sm:p-4 overflow-hidden">
          
          {/* Top Browser Bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <div className="ml-3 px-3 py-0.5 rounded-md bg-slate-800 text-[11px] text-slate-400 font-mono hidden sm:inline-block">
                https://app.preppath.dev/workspace/module-07
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11.5px] font-medium">Synced in Real-time</span>
            </div>
          </div>

          {/* Screen Display Content */}
          <div className="bg-slate-950 rounded-2xl min-h-[500px] p-4 sm:p-6 text-slate-100 overflow-hidden">
            <AnimatePresence mode="wait">
              
              {/* TAB 1: DASHBOARD PREVIEW */}
              {activeTab === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div>
                      <h3 className="text-xl font-bold text-white">Welcome back, Rohan 👋</h3>
                      <p className="text-xs text-slate-400">Full Stack & Distributed Systems Cohort 2026</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>Streak: 28 Days</span>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                        Top 2% Leaderboard
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                      <p className="text-xs text-slate-400">Course Progress</p>
                      <p className="text-2xl font-bold text-white mt-1">78%</p>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2">
                        <div className="w-[78%] h-full bg-blue-500 rounded-full" />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                      <p className="text-xs text-slate-400">Problems Solved</p>
                      <p className="text-2xl font-bold text-emerald-400 mt-1">214 / 250</p>
                      <p className="text-[11px] text-slate-500 mt-1">+18 solved this week</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                      <p className="text-xs text-slate-400">Assignment Avg</p>
                      <p className="text-2xl font-bold text-indigo-400 mt-1">96.4 / 100</p>
                      <p className="text-[11px] text-slate-500 mt-1">5/5 submitted on time</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                        <Play className="w-5 h-5 fill-current" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Up Next: Building Distributed Caching with Redis</h4>
                        <p className="text-xs text-slate-400">Module 07 · Video lesson + 3 coding assignments</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700">
                      Resume Lesson
                    </button>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: COURSE PLAYER & NOTES */}
              {activeTab === "player" && (
                <motion.div
                  key="player"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
                >
                  <div className="lg:col-span-8 space-y-3">
                    <div className="aspect-video w-full rounded-xl bg-black border border-slate-800 relative flex items-center justify-center group overflow-hidden">
                      <div className="w-16 h-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform cursor-pointer">
                        <Play className="w-7 h-7 fill-current ml-1" />
                      </div>
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/70 text-[11px] font-mono text-white">
                        4K UHD · 60 FPS
                      </div>
                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-300">
                        <span>14:20 / 38:45</span>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px]">1.5x Speed</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px]">Captions ON</span>
                        </div>
                      </div>
                    </div>
                    <h4 className="text-base font-bold text-white">
                      Deep Dive: Low-Level Locking Mechanisms & Distributed Mutex in Go
                    </h4>
                  </div>

                  <div className="lg:col-span-4 bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                        <Bookmark className="w-3.5 h-3.5" /> Interactive Notes
                      </span>
                      <span className="text-[10px] text-slate-500">Auto-saved</span>
                    </div>
                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <span className="text-blue-400 font-mono text-[11px] font-bold">@12:15</span>
                        <p className="mt-0.5">Use Redis Redlock algorithm for distributed fault-tolerant locking across 5 nodes.</p>
                      </div>
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <span className="text-blue-400 font-mono text-[11px] font-bold">@24:30</span>
                        <p className="mt-0.5">Key gotcha: TTL must exceed max processing time to prevent race conditions.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: PRACTICE ARENA & CODE RUNNER */}
              {activeTab === "practice" && (
                <motion.div
                  key="practice"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-4"
                >
                  <div className="lg:col-span-5 bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[11px] font-bold">
                        Medium
                      </span>
                      <h4 className="text-sm font-bold text-white">Longest Substring Without Repeating</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Given a string <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">s</code>, find the length of the longest substring without duplicate characters.
                    </p>
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400">
                      Input: s = &quot;abcabcbb&quot;<br />
                      Output: 3 (Explanation: &quot;abc&quot;)
                    </div>
                  </div>

                  <div className="lg:col-span-7 bg-slate-900 rounded-xl border border-slate-800 flex flex-col justify-between overflow-hidden">
                    <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <span className="text-blue-400 font-mono font-bold">Solution.cpp (C++20)</span>
                      <span className="text-emerald-400 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" /> All tests passing
                      </span>
                    </div>

                    <div className="p-4 font-mono text-xs text-slate-300 space-y-1 overflow-x-auto">
                      <div><span className="text-purple-400">int</span> <span className="text-blue-300">lengthOfLongestSubstring</span>(string s) {"{"}</div>
                      <div className="pl-4 text-slate-500">// Sliding window with frequency hashmap</div>
                      <div className="pl-4"><span className="text-purple-400">unordered_map</span>&lt;<span className="text-purple-400">char</span>, <span className="text-purple-400">int</span>&gt; charIndex;</div>
                      <div className="pl-4"><span className="text-purple-400">int</span> maxLength = <span className="text-orange-300">0</span>, left = <span className="text-orange-300">0</span>;</div>
                      <div className="pl-4"><span className="text-purple-400">for</span> (<span className="text-purple-400">int</span> right = <span className="text-orange-300">0</span>; right &lt; s.<span className="text-blue-300">length</span>(); right++) {"{"}</div>
                      <div className="pl-8 text-emerald-300">if (charIndex.<span className="text-blue-300">count</span>(s[right])) left = max(left, charIndex[s[right]] + 1);</div>
                      <div className="pl-8 text-emerald-300">charIndex[s[right]] = right;</div>
                      <div className="pl-8 text-emerald-300">maxLength = max(maxLength, right - left + 1);</div>
                      <div className="pl-4">{"}"}</div>
                      <div className="pl-4"><span className="text-purple-400">return</span> maxLength;</div>
                      <div>{"}"}</div>
                    </div>

                    <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-emerald-400 font-mono font-bold">
                        ⚡ Runtime: 4ms · Memory: 8.2MB (Beats 99.2%)
                      </span>
                      <button className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer">
                        Submit Solution
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: ASSIGNMENTS & REVIEWS */}
              {activeTab === "assignments" && (
                <motion.div
                  key="assignments"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-400">Graded: 98 / 100</span>
                      <h4 className="text-base font-bold text-white mt-0.5">
                        Assignment 04: Implement Raft Consensus Algorithm in Go
                      </h4>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                      APPROVED BY MENTOR
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Mentor Code Review Comments:
                    </h5>
                    <p className="text-xs text-slate-300 italic border-l-2 border-blue-500 pl-3">
                      &quot;Excellent election timeout randomization logic! Clean channel synchronization with zero deadlocks under network partition tests.&quot;
                    </p>
                    <p className="text-[11px] text-slate-500 pt-1">
                      Reviewed by: <strong>Alex Chen</strong> (Senior Staff Engineer @ Google Cloud)
                    </p>
                  </div>
                </motion.div>
              )}

              {/* TAB 5: CERTIFICATE PREVIEW */}
              {activeTab === "certificate" && (
                <motion.div
                  key="certificate"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-xl mx-auto p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 border border-blue-500/30 text-center space-y-4 shadow-xl"
                >
                  <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                      Verified Skill Certification
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1">
                      Full Stack & Distributed Systems Masterclass
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Issued to <strong>Rohan Verma</strong> · Grade: Distinction (Top 2%)
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <span>Credential ID: PK-2026-9482</span>
                    <span>·</span>
                    <span className="text-emerald-400 font-semibold">Cryptographically Verified</span>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  );
}
