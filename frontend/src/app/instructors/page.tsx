"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Star,
  Award,
  Users,
  Building,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Code2,
  Cpu,
  ShieldCheck,
  Server,
  BrainCircuit,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  ChevronDown
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

export interface DetailedInstructor {
  id: string;
  name: string;
  role: string;
  currentCompany: string;
  companyLogo: string;
  avatar: string;
  experience: string;
  studentsTaught: string;
  rating: number;
  reviewsCount: number;
  bio: string;
  specialties: string[];
  pastCompanies: string[];
  coursesTaught: string[];
  highlight: string;
}

const INSTRUCTORS_DATA: DetailedInstructor[] = [
  {
    id: "inst-1",
    name: "Dr. Sandeep Kulkarni",
    role: "Ex-Staff Software Engineer",
    currentCompany: "Google",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
    experience: "14+ Years",
    studentsTaught: "3,800+",
    rating: 4.97,
    reviewsCount: 1420,
    bio: "Former Google Search infrastructure architect and competitive programming Grandmaster. Specializes in transforming complex algorithmic problems into intuitive mental models and pattern archetypes.",
    specialties: ["Advanced Dynamic Programming", "Graph Theory & Network Flows", "Competitive Programming", "High-Throughput DSA"],
    pastCompanies: ["Google", "Meta", "Directi"],
    coursesTaught: ["Data Structures & Algorithmic Patterns Masterclass", "Competitive Coding & Olympiad Problem Solving"],
    highlight: "Authored data structure optimizations used across billion-user search pipelines at Google."
  },
  {
    id: "inst-2",
    name: "Natasha Romanov",
    role: "Principal AI Research Scientist",
    currentCompany: "Meta AI",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    experience: "11+ Years",
    studentsTaught: "3,200+",
    rating: 4.95,
    reviewsCount: 980,
    bio: "Specializes in LLM optimization, multimodal vision architectures, and autonomous agent frameworks. Led core machine learning infrastructure teams and research papers at NeurIPS.",
    specialties: ["Generative AI & LLMs", "PyTorch Distributed Training", "Vector Databases & RAG", "Autonomous Agent Systems"],
    pastCompanies: ["Meta AI", "OpenAI Contributor", "Stanford AI Lab"],
    coursesTaught: ["Production Generative AI & Autonomous Agents", "Deep Learning & Neural Network Foundations"],
    highlight: "Co-authored pioneering papers in low-latency LLM quantization and multimodal alignment."
  }
];

export default function InstructorsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const stats: Array<{
    target: number;
    decimals?: number;
    prefix?: string;
    suffix?: string;
    label: string;
    detail: string;
  }> = [
    {
      target: 2,
      suffix: "",
      label: "Industry Mentors",
      detail: "Staff & Principal Engineers from top tech giants"
    },
    {
      target: 4.96,
      decimals: 2,
      suffix: " / 5.0",
      label: "Average Mentorship Rating",
      detail: "Verified by student session reviews"
    },
    {
      target: 7000,
      suffix: "+",
      label: "Learners Mentored",
      detail: "Across live cohorts, masterclasses & mock rounds"
    },
    {
      target: 100,
      suffix: "%",
      label: "Active Practitioners",
      detail: "Zero generic trainers; 100% active industry leaders"
    }
  ];

  const mentorshipPillars = [
    {
      icon: Code2,
      title: "Line-by-Line Code Reviews",
      description: "Get granular feedback on time complexity, memory layout, clean naming conventions, and idiomatic design directly from veteran engineers."
    },
    {
      icon: Server,
      title: "Real-World Architecture Critiques",
      description: "Defend high-level system designs against real-world failure scenarios — caching stampedes, network partitions, and database failovers."
    },
    {
      icon: MessageSquare,
      title: "FAANG Mock Interviews",
      description: "Experience the rigorous pace of actual MAANG hiring rounds with actionable scorecard ratings across communication, algorithms, and speed."
    },
    {
      icon: BrainCircuit,
      title: "Career & Offer Negotiation",
      description: "Receive personalized guidance on resume ATS optimization, recruiter reach-out strategy, and multi-offer compensation negotiation."
    }
  ];

  const instructorFaqs = [
    {
      question: "Who are the instructors at PrepPath?",
      answer: "All PrepPath instructors are active Staff, Principal, and Lead Software Engineers at premier tech firms like Google and Meta. We do not employ full-time generic educators; our mentors build high-scale production systems daily."
    },
    {
      question: "How do 1:1 mentorship and doubt-clearing sessions work?",
      answer: "Every enrolled cohort student has access to scheduled 1:1 mentorship slots, live weekly Q&A breakout rooms, and dedicated private communication channels for asynchronous code reviews and project critiques."
    },
    {
      question: "Can instructors review my resume and personal projects?",
      answer: "Yes. Mentors conduct comprehensive portfolio audits and ATS-optimized resume reviews, ensuring your projects demonstrate production-grade depth (e.g., CI/CD, testing, distributed caching, observability) that catches hiring managers' eyes."
    },
    {
      question: "Are live classes interactive or lecture-based?",
      answer: "PrepPath live sessions are strictly interactive workshops. You code alongside the mentor, debug edge cases in real-time, benchmark algorithmic solutions, and debate architectural trade-offs."
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between selection:bg-lime-400 selection:text-slate-950">
      
      {/* 1. Floating Top Header */}
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

      {/* 2. Main Page Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 sm:py-20 w-full space-y-20">
        
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-lime-100 text-lime-900 border border-lime-200 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-lime-700" />
            <span>World-Class Mentors & Industry Leaders</span>
          </div>

          <h1
            className="text-4xl sm:text-6xl font-normal tracking-tight text-slate-950 leading-[1.08]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Learn from engineers who have <em className="italic text-slate-600">built at scale</em>.
          </h1>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
            Our mentors are Staff and Principal Engineers from Google and Meta. They teach the exact mental models, system architectures, and coding standards used to build products for billions.
          </p>
        </section>

        {/* Rolling Key Metrics */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((item, idx) => (
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

        {/* Instructor Cards Grid (2 Mentors) */}
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {INSTRUCTORS_DATA.map((instructor, idx) => (
              <motion.div
                key={instructor.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-6 sm:p-8 space-y-6">
                  
                  {/* Top Header: Avatar + Company Logo */}
                  <div className="flex items-start justify-between">
                    <div className="relative">
                      <img
                        src={instructor.avatar}
                        alt={instructor.name}
                        className="w-22 h-22 rounded-2xl object-cover ring-4 ring-slate-100 shadow-sm group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-md bg-slate-950 text-white text-[10px] font-bold shadow-xs">
                        {instructor.experience}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center max-w-[90px] h-10">
                      <img
                        src={instructor.companyLogo}
                        alt={instructor.currentCompany}
                        className="h-5 w-auto object-contain"
                      />
                    </div>
                  </div>

                  {/* Name, Role & Company */}
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 mb-1">
                      <span>{instructor.role}</span>
                      <span>•</span>
                      <span>{instructor.currentCompany}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-950">{instructor.name}</h3>
                  </div>

                  {/* Highlight Quote */}
                  <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-100 text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                    &ldquo;{instructor.highlight}&rdquo;
                  </div>

                  {/* Bio */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {instructor.bio}
                  </p>

                  {/* Core Expertise Tags */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Core Expertise</p>
                    <div className="flex flex-wrap gap-1.5">
                      {instructor.specialties.map((spec, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Past Companies Pedigree */}
                  <div className="pt-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Career Pedigree
                    </p>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      {instructor.pastCompanies.join("  →  ")}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Rating & Stats */}
                <div className="p-5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-slate-900 font-semibold">{instructor.rating} Rating</span>
                    <span className="text-slate-400 font-normal">({instructor.reviewsCount} reviews)</span>
                  </div>

                  <span className="text-slate-600 font-medium">
                    {instructor.studentsTaught} students mentored
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 3. The PrepPath Mentorship Methodology */}
        <section className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-xs space-y-10">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight font-display">
              The Mentorship Experience That Bridges the Industry Gap
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every mentor brings battle-tested engineering methodologies directly into your weekly learning loop.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {mentorshipPillars.map((pillar, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-start gap-4 hover:bg-slate-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-lime-400/20 text-lime-900 border border-lime-400/30 flex items-center justify-center shrink-0">
                  <pillar.icon className="w-5 h-5 text-slate-950" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-950">{pillar.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Frequently Asked Questions about Instructors */}
        <section className="space-y-8 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight font-display">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Everything you need to know about our instructors, live sessions, and 1:1 guidance.
            </p>
          </div>

          <div className="space-y-3">
            {instructorFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden transition-all shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base hover:text-slate-950 transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-slate-950" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. Final CTA */}
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white p-8 sm:p-14 text-center space-y-6 shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2
              className="text-3xl sm:text-5xl font-normal tracking-tight leading-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Ready to learn from the <em className="italic text-lime-400">best minds</em> in tech?
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
              Join our active cohort programs and receive weekly live architectural reviews, algorithmic mastery, and direct 1:1 mentorship.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login"
                className="w-full sm:w-auto px-7 py-3 rounded-full bg-lime-400 text-slate-950 text-xs sm:text-sm font-bold hover:bg-lime-300 transition-all shadow-md inline-flex items-center justify-center gap-2"
              >
                <span>Start Learning Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/#courses"
                className="w-full sm:w-auto px-7 py-3 rounded-full bg-white/10 text-white text-xs sm:text-sm font-bold hover:bg-white/20 transition-all border border-white/15 inline-flex items-center justify-center"
              >
                Explore All Courses
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* 6. Footer */}
      <Footer />
    </div>
  );
}
