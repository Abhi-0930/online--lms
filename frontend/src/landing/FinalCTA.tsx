"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  Users,
  ShieldCheck,
  Award
} from "lucide-react";
import confetti from "canvas-confetti";

export function FinalCTA({ onEnroll }: { onEnroll?: () => void }) {
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    if (onEnroll) {
      onEnroll();
    } else {
      const element = document.querySelector("#courses");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const scrollTo = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white via-blue-50/40 to-slate-50 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-blue-600/10 via-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Glowing Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Transform Your Career in 2026</span>
        </motion.div>

        {/* Main Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] font-display mb-6"
        >
          Start Your Learning Journey Today
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Join 45,000+ developers mastering Data Structures, Full Stack, AI, and Cloud Architecture. 100% money-back guarantee.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
        >
          <button
            onClick={triggerConfetti}
            className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Enroll Now & Get Started</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => scrollTo("#courses")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-white border border-slate-300 text-slate-800 font-bold text-base hover:bg-slate-50 shadow-xs transition-all cursor-pointer"
          >
            <span>Explore All Tracks</span>
          </button>
        </motion.div>

        {/* Security & Guarantee Pills */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>7-Day 100% Money-Back Guarantee</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-blue-500" />
            <span>Verifiable Industry Certification</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-500" />
            <span>Lifetime Alumni Network Access</span>
          </div>
        </div>

      </div>
    </section>
  );
}
