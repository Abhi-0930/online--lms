"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Users2,
  MessageSquare,
  Briefcase,
  HelpCircle,
  Sparkles,
  Zap,
  CheckCircle2,
  ArrowRight,
  Flame,
  Bot
} from "lucide-react";

export function CommunitySection({ onJoin }: { onJoin?: () => void }) {
  const communityPillars = [
    {
      icon: HelpCircle,
      title: "15-Min Doubt Resolution",
      description: "Dedicated TA channels for every module. Never stay stuck on a tricky algorithm or deployment bug.",
      stat: "< 14 min avg response"
    },
    {
      icon: Briefcase,
      title: "Exclusive Job Board",
      description: "Daily curated referrals and off-campus hiring drives posted directly by alumni at top firms.",
      stat: "120+ jobs/month"
    },
    {
      icon: Users2,
      title: "Peer Mock Interview Rooms",
      description: "Practice technical coding and system design with peers in timed interactive breakout rooms.",
      stat: "2,400+ rooms hosted"
    },
    {
      icon: Flame,
      title: "Weekly Hackathons & Contests",
      description: "Compete in bi-weekly algorithmic sprints, earn badges, and climb the platform global leaderboard.",
      stat: "$15K+ prizes won"
    }
  ];

  return (
    <section className="py-24 bg-slate-50/60 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
            <Users2 className="w-3.5 h-3.5" />
            <span>Vibrant Developer Hub</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Never Learn in Isolation Again
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Join 60,000+ ambitious developers, alumni, and industry engineers sharing real interview questions, reviewing code, and networking.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {communityPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{pillar.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{pillar.description}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                  <span>{pillar.stat}</span>
                  <span>⚡</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Live Community Feed Mockup Card */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold">#alumni-referrals & doubt-support</h4>
                <p className="text-xs text-slate-400">1,420 members online right now</p>
              </div>
            </div>

            <button
              onClick={onJoin}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-colors cursor-pointer"
            >
              Join Discord Server
            </button>
          </div>

          <div className="space-y-4 pt-6 text-xs">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                SC
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">Siddharth (SDE @ Razorpay)</span>
                  <span className="text-[10px] text-slate-400">2 mins ago</span>
                </div>
                <p className="text-slate-300 mt-1">
                  🚀 <strong>Hiring alert:</strong> Razorpay is opening 6 Frontend SDE-1 roles for React 19 / TypeScript developers. DM me your PrepPath certificate & GitHub link for direct referral!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                TA
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-400">Pooja (Lead Teaching Assistant)</span>
                  <span className="text-[10px] text-slate-400">8 mins ago</span>
                </div>
                <p className="text-slate-300 mt-1">
                  💡 Just posted detailed video walkthrough for today’s DP Assignment (Problem 45: Jump Game II). Check the solutions channel!
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
