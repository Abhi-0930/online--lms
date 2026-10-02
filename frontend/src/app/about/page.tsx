"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Code2,
  Users,
  Target,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Compass,
  Layers,
  Terminal,
  Cpu,
  Mail,
  MapPin,
  Phone
} from "lucide-react";
import { Footer } from "@/landing/Footer";

function RollingCounter({
  target,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 2,
}: {
  target: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easedProgress = easeOutExpo(progress);

      const nextVal = easedProgress * target;
      setCurrentValue(nextVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCurrentValue(target);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isInView, target, duration]);

  const formatted =
    decimals > 0
      ? currentValue.toFixed(decimals)
      : Math.floor(currentValue).toLocaleString();

  return (
    <span ref={ref} className="tabular-nums inline-flex items-baseline">
      {prefix && <span>{prefix}</span>}
      <span>{formatted}</span>
      {suffix && <span>{suffix}</span>}
    </span>
  );
}

export default function AboutPage() {
  const coreValues = [
    {
      icon: Code2,
      title: "Production-First Pedagogy",
      description:
        "No trivial toy problems. Every data structure, concurrency model, and system design pattern is taught using real-world architectures running at modern tech companies."
    },
    {
      icon: Zap,
      title: "Hands-On Problem Arena",
      description:
        "Knowledge without rigorous practice is incomplete. Our built-in code runner lets learners test edge cases, analyze runtime bottlenecks, and build intuitive problem-solving skills."
    },
    {
      icon: Layers,
      title: "Full-Stack System Depth",
      description:
        "From low-level memory efficiency and algorithmic complexity to distributed caching, message queues, and cloud deployments — we cover the full engineering spectrum."
    },
    {
      icon: Target,
      title: "Outcome & Career Driven",
      description:
        "From technical mock interviews and resume refactoring to salary negotiation strategies, we prepare engineers end-to-end to secure high-tier tech offers."
    }
  ];

  const milestones = [
    {
      target: 10000,
      suffix: "+",
      label: "Problems Solved in Arena",
      detail: "Across DSA, Dynamic Programming & Graphs"
    },
    {
      target: 94.8,
      decimals: 1,
      suffix: "%",
      label: "Career Transition Rate",
      detail: "Graduates placed in top product companies"
    },
    {
      target: 45,
      suffix: "+ LPA",
      label: "Highest Compensation",
      detail: "Offered to alumni in recent cohorts"
    },
    {
      prefix: "1 : ",
      target: 15,
      label: "Mentor-to-Student Ratio",
      detail: "Ensuring personal attention & doubt resolution"
    }
  ];

  const teachingMethodology = [
    {
      step: "01",
      title: "First-Principles Conceptual Deep Dive",
      description:
        "We dissect core computer science fundamentals from ground up — explaining why an algorithm exists, its mathematical bounds, and where it fails in production."
    },
    {
      step: "02",
      title: "Active Live Coding & Real-Time Walkthroughs",
      description:
        "No passive video watching. Students actively write code, debug failing test suites, and refactor sub-optimal implementations during live cohort sessions."
    },
    {
      step: "03",
      title: "Automated Arena Submissions & Benchmarking",
      description:
        "Solve curated problems directly in our online code editor. Benchmark time & space complexity against optimal reference solutions with hidden test cases."
    },
    {
      step: "04",
      title: "Interview Readiness & System Architecture",
      description:
        "Simulate high-pressure technical interviews with live mock rounds, high-level system design (HLD) defenses, and low-level schema modeling."
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between selection:bg-lime-400 selection:text-slate-950">
      
      {/* Top Floating Header */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-950 text-sm font-semibold transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to PrepPath</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-slate-950 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                P
              </div>
              <span
                className="font-serif italic text-xl font-normal text-slate-950"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                preppath
              </span>
            </Link>
            <Link
              href="/login"
              className="hidden sm:inline-flex px-4 py-1.5 rounded-full bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 py-12 sm:py-20 w-full space-y-20">
        
        {/* 1. Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-lime-100 text-lime-900 border border-lime-200 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-lime-700" />
            <span>About PrepPath</span>
          </div>

          <h1
            className="text-4xl sm:text-6xl font-normal tracking-tight text-slate-950 leading-[1.08]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Where ambition meets <em className="italic text-slate-600">production-grade</em> engineering.
          </h1>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
            PrepPath is an advanced computer science learning ecosystem designed to bridge the gap between academic theory and the high-performance engineering standards required by modern product companies.
          </p>
        </section>

        {/* 2. Key Metrics with Rolling Counting Animation */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {milestones.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight font-display block">
                  <RollingCounter
                    target={item.target}
                    decimals={item.decimals}
                    prefix={item.prefix}
                    suffix={item.suffix}
                  />
                </span>
                <span className="text-sm font-bold text-slate-800 mt-1 block">
                  {item.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100 leading-snug">
                {item.detail}
              </p>
            </motion.div>
          ))}
        </section>

        {/* 3. The Story & The Problem We Solve */}
        <section className="bg-slate-950 text-white rounded-3xl p-8 sm:p-14 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-lime-400 text-xs font-semibold tracking-wide border border-white/10">
              <Compass className="w-3.5 h-3.5 text-lime-400" />
              <span>Our Founding Vision</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl font-normal tracking-tight text-white leading-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Built to transform passive learners into exceptional builders.
            </h2>
            <div className="space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
              <p>
                Every year, thousands of aspiring software engineers get trapped in an endless loop of passive video tutorials. They memorize code snippets without understanding how algorithms behave under heavy constraints or how distributed databases scale to millions of requests per second.
              </p>
              <p>
                PrepPath was engineered to replace passive lectures with <strong>rigorous practice</strong>, live technical mentorship, continuous test-case verification, and real-world system architecture breakdowns.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Core Educational Pillars */}
        <section className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2
              className="text-3xl sm:text-4xl font-normal tracking-tight text-slate-950"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Our Core Educational Pillars
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              The foundational principles that guide our curriculum, coding problems, and student cohorts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coreValues.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all space-y-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-xs">
                    <Icon className="w-6 h-6 text-lime-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    {val.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {val.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. How PrepPath Works (Methodology) */}
        <section className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider">
              <Terminal className="w-3.5 h-3.5" />
              <span>Learning Roadmap</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl font-normal tracking-tight text-slate-950"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              The PrepPath Learning System
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              A structured, step-by-step framework engineered for long-term algorithmic intuition and real system mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teachingMethodology.map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <span className="text-xs font-black text-slate-400 tracking-widest uppercase">
                    Step {item.step}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Headquarters & Physical Presence */}
        <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Headquartered in Hyderabad</span>
            </div>
            <h3 className="text-xl font-bold text-slate-950">
              Need Assistance or Have Questions?
            </h3>
            <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
              Our operations and student advisory team are based in Hyderabad, Telangana, India. Connect with us for program inquiries, corporate upskilling, or partnership opportunities.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="px-6 py-3 rounded-full bg-slate-950 text-white font-semibold text-sm hover:bg-slate-800 transition-colors shadow-sm inline-flex items-center gap-2"
            >
              <span>Contact Team</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <a
              href="mailto:hello@preppath.net"
              className="px-6 py-3 rounded-full bg-slate-100 text-slate-800 font-semibold text-sm hover:bg-slate-200 transition-colors inline-flex items-center gap-2"
            >
              <Mail className="w-4 h-4 text-slate-500" />
              <span>hello@preppath.net</span>
            </a>
          </div>
        </section>

        {/* 7. Bottom CTA */}
        <section className="text-center bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-10 sm:p-16 space-y-6 shadow-2xl">
          <h2
            className="text-3xl sm:text-5xl font-normal tracking-tight text-white max-w-2xl mx-auto"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Start your journey toward engineering excellence.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Explore our curriculum, test your problem-solving skills in the arena, and join a driven community of software engineers.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-full bg-lime-400 text-slate-950 font-bold text-sm hover:bg-lime-300 transition-colors shadow-lg shadow-lime-400/20 inline-flex items-center gap-2 group"
            >
              <span>Start Learning Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/#courses"
              className="px-7 py-3.5 rounded-full bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-colors border border-white/10"
            >
              Browse All Courses
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
