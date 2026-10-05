"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Star,
  Sparkles,
  Code2,
  Server,
  BrainCircuit,
  MessageSquare,
  CheckCircle2,
  Quote,
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
  avatar: string;
  experience: string;
  studentsTaught: string;
  rating: number;
  reviewsCount: number;
  bio: string;
  specialties: string[];
  highlights?: string[];
  teachingPhilosophy?: string;
}

const INSTRUCTORS_DATA: DetailedInstructor[] = [
  {
    id: "inst-1",
    name: "Abhishek Jujjuvarapu",
    role: "Founder & Lead Instructor @ PrepPath",
    avatar: "/instructors/abhishek.png",
    experience: "3+ Years",
    studentsTaught: "3,800+",
    rating: 4.98,
    reviewsCount: 1450,
    bio: "Software engineer, cybersecurity professional, and educator dedicated to helping students master problem-solving, software development, and interview preparation through practical, industry-focused learning.",
    specialties: [
      "Software Engineering",
      "Data Structures & Algorithms",
      "Full-Stack Development",
      "System Design",
      "Cybersecurity",
      "AI Applications",
      "Technical Interview Preparation"
    ],
    highlights: [
      "Founder of PrepPath & CodeLoom",
      "3+ Years of Industry Experience",
      "3,800+ Students Mentored",
      "4.98 Instructor Rating",
      "Hands-on Project-Based Learning"
    ],
    teachingPhilosophy: "Focus on understanding concepts deeply, applying them practically, and developing the confidence to solve real-world problems independently."
  },
  {
    id: "inst-2",
    name: "Bharath Beerappa",
    role: "Senior Technical Mentor & Instructor",
    avatar: "/instructors/bharat.png",
    experience: "5+ Years",
    studentsTaught: "3,200+",
    rating: 4.96,
    reviewsCount: 1120,
    bio: "Technology leader and engineering mentor with 5+ years of experience across software engineering, cloud computing, DevOps, AI/ML, blockchain, and modern application architecture. Passionate about helping learners understand complex technologies through practical implementation and real-world use cases.",
    specialties: [
      "Cloud Computing & AWS",
      "DevOps & Platform Engineering",
      "Artificial Intelligence & Machine Learning",
      "Blockchain Development",
      "Software Engineering",
      "System Design & Distributed Systems",
      "Full-Stack Development",
      "Data Engineering & Analytics"
    ],
    highlights: [
      "5+ Years of Industry Experience",
      "Expertise Across Multiple Technology Domains",
      "Mentored Students and Professionals Across Diverse Skill Levels",
      "Hands-on Experience Building Scalable Systems",
      "Strong Focus on Industry-Relevant Learning"
    ],
    teachingPhilosophy: "Technology is best learned by building. Focus on understanding fundamentals, applying concepts in real-world scenarios, and continuously adapting to emerging technologies."
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
      detail: "Experienced instructors with hands-on production depth"
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
      answer: "All PrepPath instructors are active practitioners and technical leaders with real-world engineering background. We focus on hands-on practical depth, line-by-line coding, and personalized mentorship."
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
            Our mentors are seasoned technical leaders and practitioners. They teach the exact mental models, system architectures, and coding standards used to build industry-ready products.
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
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
                  
                  {/* Top Header: Avatar + Experience */}
                  <div className="flex items-start justify-between">
                    <div className="relative">
                      <img
                        src={instructor.avatar}
                        alt={instructor.name}
                        className="w-24 h-24 rounded-2xl object-cover ring-4 ring-slate-100 shadow-sm group-hover:scale-105 transition-transform duration-300 bg-slate-100"
                      />
                      <span className="absolute -bottom-2 -right-1 px-2.5 py-0.5 rounded-md bg-slate-950 text-white text-[10px] font-bold shadow-xs tracking-wide">
                        {instructor.experience}
                      </span>
                    </div>
                  </div>

                  {/* Name & Role */}
                  <div className="space-y-1">
                    <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                      {instructor.role}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-950 tracking-tight">{instructor.name}</h3>
                  </div>

                  {/* Bio */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {instructor.bio}
                  </p>

                  {/* Teaching Philosophy */}
                  {instructor.teachingPhilosophy && (
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                        <Quote className="w-3.5 h-3.5 text-amber-700 fill-amber-700/20" />
                        <span>Teaching Philosophy</span>
                      </div>
                      <p className="text-xs text-amber-950/90 italic leading-relaxed">
                        &ldquo;{instructor.teachingPhilosophy}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Core Expertise Tags */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Core Expertise</p>
                    <div className="flex flex-wrap gap-1.5">
                      {instructor.specialties.map((spec, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200/60"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Professional Highlights */}
                  {instructor.highlights && instructor.highlights.length > 0 && (
                    <div className="space-y-2.5 pt-2 border-t border-slate-100">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Professional Highlights</p>
                      <ul className="space-y-2">
                        {instructor.highlights.map((item, hIdx) => (
                          <li key={hIdx} className="flex items-start gap-2 text-xs text-slate-700 leading-snug">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
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
