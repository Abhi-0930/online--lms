"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Code2,
  Cpu,
  Users,
  Award,
  CheckCircle2,
  ShieldCheck,
  Target,
  Zap,
  Globe,
  Star,
  BookOpen,
  HelpCircle,
  Briefcase
} from "lucide-react";
import { Footer } from "@/landing/Footer";
import { INSTRUCTORS } from "@/landing/landingData";

export default function AboutPage() {
  const coreValues = [
    {
      icon: Code2,
      title: "Production-First Pedagogy",
      description:
        "No trivial toy problems. Every data structure, concurrency model, and system design pattern is taught using real-world architectures running at modern tech companies."
    },
    {
      icon: Users,
      title: "Direct Access to Elite Mentors",
      description:
        "Learn directly from Staff & Principal engineers from Google, Meta, and Amazon. Get unhindered 1-on-1 code reviews, architectural advice, and career roadmaps."
    },
    {
      icon: Zap,
      title: "Hands-On Problem Arena",
      description:
        "Knowledge without practice is incomplete. Our built-in code runner lets you test edge cases, analyze time/space bottlenecks, and build algorithmic intuition."
    },
    {
      icon: Target,
      title: "Outcome & Placement Driven",
      description:
        "From technical mock interviews and resume refactoring to salary negotiation strategies, we prepare you end-to-end to secure high-tier tech offers."
    }
  ];

  const milestones = [
    {
      number: "10,000+",
      label: "Problems Solved in Arena",
      detail: "Across DSA, Dynamic Programming & Graphs"
    },
    {
      number: "94.8%",
      label: "Career Transition Rate",
      detail: "Graduates placed in top product companies"
    },
    {
      number: "45+ LPA",
      label: "Highest Compensation",
      detail: "Offered to alumni in recent cohorts"
    },
    {
      number: "1 : 15",
      label: "Mentor-to-Student Ratio",
      detail: "Ensuring personal attention & doubt resolution"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between selection:bg-lime-400 selection:text-slate-950">
      
      {/* Top Floating Glass Header */}
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
            <span>Transforming Computer Science Education</span>
          </div>

          <h1
            className="text-4xl sm:text-6xl font-normal tracking-tight text-slate-950 leading-[1.08]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Where ambition meets <em className="italic text-slate-600">production-grade</em> engineering.
          </h1>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
            PrepPath was founded with a singular conviction: Traditional college curricula and generic recorded bootcamps are disconnected from high-scale engineering reality. We bridge that divide through live mentorship, deep problem solving, and production architectures.
          </p>
        </section>

        {/* 2. Platform Metrics */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {milestones.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight font-display block">
                  {item.number}
                </span>
                <span className="text-sm font-bold text-slate-800 mt-1 block">
                  {item.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100 leading-snug">
                {item.detail}
              </p>
            </div>
          ))}
        </section>

        {/* 3. The Story & The Problem We Solve */}
        <section className="bg-slate-950 text-white rounded-3xl p-8 sm:p-14 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-lime-400 text-xs font-semibold tracking-wide border border-white/10">
              <span>The PrepPath Story</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl font-normal tracking-tight text-white leading-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Built by engineers, for engineers who want to excel.
            </h2>
            <div className="space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>
                Every year, thousands of brilliant aspiring developers get stuck in a frustrating cycle: watching endless passive video tutorials without truly grasping how algorithms behave under extreme constraints or how microservices scale to millions of concurrent users.
              </p>
              <p>
                At PrepPath, we replaced passive lectures with <strong>interactive live cohorts</strong>, continuous code execution, and comprehensive architectural dissections. Our students don&apos;t just memorize syntax — they write optimal solutions, defend their design decisions, and develop true engineering taste.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Core Pillars / Values */}
        <section className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2
              className="text-3xl sm:text-4xl font-normal tracking-tight text-slate-950"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Our Core Educational Pillars
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              The four foundational principles guiding every course, problem, and cohort at PrepPath.
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

        {/* 5. World-Class Mentors & Instructors */}
        <section className="space-y-10 pt-4">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Industry Leadership</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl font-normal tracking-tight text-slate-950"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Learn from Engineers Who Have Built at Scale
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Our mentors have designed search engines, distributed storage, and foundation AI models at the world&apos;s leading technology companies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {INSTRUCTORS.map((instructor) => (
              <div
                key={instructor.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-7 shadow-xs hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Photo & Company Logo */}
                  <div className="flex items-start justify-between mb-5">
                    <img
                      src={instructor.avatar}
                      alt={instructor.name}
                      className="w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-100 shadow-sm"
                    />
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                      <img
                        src={instructor.companyLogo}
                        alt={instructor.currentCompany}
                        className="h-5 w-auto max-w-[70px] object-contain"
                      />
                    </div>
                  </div>

                  {/* Name & Credentials */}
                  <h3 className="text-lg font-bold text-slate-950">{instructor.name}</h3>
                  <p className="text-xs font-bold text-blue-600 mb-1">
                    {instructor.role} @ {instructor.currentCompany}
                  </p>
                  <p className="text-xs text-slate-500 mb-4 font-medium">
                    {instructor.experience} Industry Experience
                  </p>

                  {/* Bio */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                    {instructor.bio}
                  </p>

                  {/* Specialties */}
                  <div className="space-y-2 mb-6">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Core Domains
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {instructor.specialties.map((spec, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-semibold"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Rating Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{instructor.rating} Rating</span>
                  </div>
                  <span className="text-slate-500 font-medium">
                    {instructor.studentsTaught} Mentored
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Contact & Physical Presence */}
        <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-bold text-slate-950">
              Have Questions or Want to Partner?
            </h3>
            <p className="text-sm text-slate-600 max-w-xl">
              Our engineering advisory team is based out of Hyderabad, Telangana, India. Reach out for corporate training, cohort enrollment inquiries, or campus partnerships.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className="px-6 py-3 rounded-full bg-slate-950 text-white font-semibold text-sm hover:bg-slate-800 transition-colors shadow-sm"
            >
              Contact Advisory
            </Link>
            <a
              href="mailto:hello@preppath.net"
              className="px-6 py-3 rounded-full bg-slate-100 text-slate-800 font-semibold text-sm hover:bg-slate-200 transition-colors"
            >
              hello@preppath.net
            </a>
          </div>
        </section>

        {/* 7. Bottom CTA */}
        <section className="text-center bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-10 sm:p-16 space-y-6 shadow-2xl">
          <h2
            className="text-3xl sm:text-5xl font-normal tracking-tight text-white max-w-2xl mx-auto"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Start your journey toward engineering excellence today.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Join thousands of developers mastering Data Structures, Algorithms, Distributed Systems, and AI under top mentors.
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

      {/* Footer with About Us link */}
      <Footer />
    </div>
  );
}
