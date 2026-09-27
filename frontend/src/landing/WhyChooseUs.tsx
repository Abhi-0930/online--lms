"use client";

import React from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";
import {
  BookOpen,
  Compass,
  Code2,
  Target,
  ClipboardCheck,
  Video,
  BarChart3,
  TrendingUp,
  Users2,
  CheckCircle2,
  Sparkles,
  Terminal,
  Layers,
  Award,
  Calendar,
  Clock,
  Zap,
  Activity,
  MessageSquare,
  FileCode2,
  Flame,
  ShieldCheck
} from "lucide-react";

export function WhyChooseUs() {
  const cards = data.map((card, index) => (
    <Card key={card.title + index} card={card} index={index} />
  ));

  return (
    <section id="why-us" className="w-full h-full py-20 sm:py-28 bg-gradient-to-b from-[#1e293b] via-[#1a233a] to-[#151c2e] overflow-hidden border-t border-slate-700/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-display text-white">
          Why Choose Us
        </h2>
      </div>

      <Carousel items={cards} />
    </section>
  );
}

// ----------------------------------------------------
// DETAILED MODAL BREAKDOWN COMPONENTS
// ----------------------------------------------------

const StructuredLearningContent = () => {
  return (
    <div className="space-y-6 text-slate-700 dark:text-slate-300">
      <div className="bg-[#F5F5F7] dark:bg-neutral-800/70 p-6 md:p-10 rounded-3xl space-y-5 border border-slate-200/60 dark:border-neutral-700/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              Zero Guesswork Curriculum Architecture
            </h4>
            <p className="text-xs md:text-sm text-slate-500">Carefully structured sequential modules with prerequisite validation</p>
          </div>
        </div>

        <p className="text-sm md:text-base leading-relaxed">
          Never wonder what to learn next. Every track is mapped sequentially from core programming fundamentals all the way to complex distributed system architectures, preventing conceptual gaps and tutorial paralysis.
        </p>

        <div className="space-y-3 pt-2">
          {[
            { step: "01", title: "Core Fundamentals & Computational Logic", desc: "Memory models, control flow, functions, and algorithmic complexity." },
            { step: "02", title: "Advanced Data Structures & Patterns", desc: "Trees, graphs, dynamic programming, and greedy optimization patterns." },
            { step: "03", title: "Modern Application Architecture", desc: "REST & gRPC APIs, database indexing, caching strategies, and auth systems." },
            { step: "04", title: "High-Scale Distributed Systems", desc: "Concurrency, sharding, event messaging with Kafka, and containerized deployment." },
          ].map((item) => (
            <div key={item.step} className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-700 flex items-start gap-3.5">
              <span className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {item.step}
              </span>
              <div>
                <h5 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h5>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const HandsOnPracticeContent = () => {
  return (
    <div className="space-y-6 text-slate-700 dark:text-slate-300">
      <div className="bg-[#F5F5F7] dark:bg-neutral-800/70 p-6 md:p-10 rounded-3xl space-y-4 border border-slate-200/60 dark:border-neutral-700/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              Instant In-Browser Coding Sandbox
            </h4>
            <p className="text-xs md:text-sm text-slate-500">Over 500+ curated problems with instant test execution</p>
          </div>
        </div>

        <p className="text-sm md:text-base leading-relaxed">
          Strengthen your intuition through active coding. Our browser sandbox executes code instantly across Python, TypeScript, Java, C++, and Go, with comprehensive boundary and stress test cases to ensure deep mastery.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-700 text-center">
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">500+</span>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Curated Challenges</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-700 text-center">
            <span className="text-xl font-black text-blue-600 dark:text-blue-400">&lt;50ms</span>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Execution Latency</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-700 text-center">
            <span className="text-xl font-black text-purple-600 dark:text-purple-400">100%</span>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Automated Validation</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const RealAssignmentsContent = () => {
  return (
    <div className="space-y-6 text-slate-700 dark:text-slate-300">
      <div className="bg-[#F5F5F7] dark:bg-neutral-800/70 p-6 md:p-10 rounded-3xl space-y-4 border border-slate-200/60 dark:border-neutral-700/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              Production-Grade Capstone Assignments
            </h4>
            <p className="text-xs md:text-sm text-slate-500">Simulate real-world engineering sprints and PR reviews</p>
          </div>
        </div>

        <p className="text-sm md:text-base leading-relaxed">
          Move beyond toy examples. Build production microservices, distributed caches, real-time collaboration engines, and rate limiters with automated CI/CD pipelines and senior pull request reviews.
        </p>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-700 space-y-2.5">
          <span className="text-xs font-bold uppercase text-slate-400">Included Capstone Milestones:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Distributed Task Queue & Workers</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Full-Text Search Engine with Inverted Index</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Real-Time WebSocket Chat & Presence</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Payment Gateway with Webhook Idempotency</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LiveInteractiveSessionsContent = () => {
  return (
    <div className="space-y-6 text-slate-700 dark:text-slate-300">
      <div className="bg-[#F5F5F7] dark:bg-neutral-800/70 p-6 md:p-10 rounded-3xl space-y-4 border border-slate-200/60 dark:border-neutral-700/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              Live Classes & Interactive Masterclasses
            </h4>
            <p className="text-xs md:text-sm text-slate-500">Learn directly from senior engineers and ask questions in real time</p>
          </div>
        </div>

        <p className="text-sm md:text-base leading-relaxed">
          Attend live weekend masterclasses, live system architecture breakdowns, and interactive code walkthroughs. Ask questions freely and get live feedback on your approach from experienced industry instructors.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-700">
            <h5 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-500" />
              <span>Weekly Live Workshops</span>
            </h5>
            <p className="text-xs text-slate-500 mt-1">Deep dives into system design patterns, concurrency, and clean architecture.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-700">
            <h5 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Recorded with Full Search</span>
            </h5>
            <p className="text-xs text-slate-500 mt-1">Missed a session? Access high-def recordings, transcripts, and code snippets.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProgressTrackingContent = () => {
  return (
    <div className="space-y-6 text-slate-700 dark:text-slate-300">
      <div className="bg-[#F5F5F7] dark:bg-neutral-800/70 p-6 md:p-10 rounded-3xl space-y-4 border border-slate-200/60 dark:border-neutral-700/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              Granular Milestone & Consistency Tracking
            </h4>
            <p className="text-xs md:text-sm text-slate-500">Visual progress metrics, streaks, and weakness diagnostic matrices</p>
          </div>
        </div>

        <p className="text-sm md:text-base leading-relaxed">
          Stay motivated with intuitive visual analytics. Track daily problem-solving streaks, topic completion rates, speed improvements, and identify conceptual blind spots before interview season.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-700 text-center">
            <span className="text-xl font-black text-amber-500">Streak Heatmap</span>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Daily Habit Builder</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-700 text-center">
            <span className="text-xl font-black text-emerald-500">Topic Radar</span>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Skill Matrix Insights</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-700 text-center">
            <span className="text-xl font-black text-cyan-500">Benchmarks</span>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Performance Rank</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CommunitySupportContent = () => {
  return (
    <div className="space-y-6 text-slate-700 dark:text-slate-300">
      <div className="bg-[#F5F5F7] dark:bg-neutral-800/70 p-6 md:p-10 rounded-3xl space-y-4 border border-slate-200/60 dark:border-neutral-700/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
            <Users2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              Ambitious Peer Community & Rapid TA Support
            </h4>
            <p className="text-xs md:text-sm text-slate-500">Collaborate with thousands of passionate developers across 35+ countries</p>
          </div>
        </div>

        <p className="text-sm md:text-base leading-relaxed">
          You never learn alone. Join active study pods, engage in peer code reviews, participate in weekly community hackathons, and receive swift assistance from dedicated teaching assistants whenever you get stuck.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-700">
            <h5 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-500" />
              <span>24/7 Discord Community</span>
            </h5>
            <p className="text-xs text-slate-500 mt-1">Active channels for discussion, code debugging, and project collaboration.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-700">
            <h5 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>&lt;15 Min TA Response</span>
            </h5>
            <p className="text-xs text-slate-500 mt-1">Dedicated teaching assistants to help you unblock syntax or conceptual bugs fast.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// THE 6 CAROUSEL CARDS
// ----------------------------------------------------
const data = [
  {
    category: "Roadmap",
    title: "1. Structured Learning Path",
    description: "Follow a clear roadmap from fundamentals to advanced concepts with no guesswork.",
    icon: <BookOpen className="w-5 h-5" />,
    src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2670&auto=format&fit=crop",
    content: <StructuredLearningContent />,
  },
  {
    category: "Practice",
    title: "2. Hands-On Practice",
    description: "Strengthen your understanding through curated practice problems and coding challenges.",
    icon: <Code2 className="w-5 h-5" />,
    src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop",
    content: <HandsOnPracticeContent />,
  },
  {
    category: "Assignments",
    title: "3. Real Assignments",
    description: "Apply concepts through practical assignments designed to simulate real-world scenarios.",
    icon: <ClipboardCheck className="w-5 h-5" />,
    src: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=2670&auto=format&fit=crop",
    content: <RealAssignmentsContent />,
  },
  {
    category: "Live Classes",
    title: "4. Live Interactive Sessions",
    description: "Attend live classes, ask questions, and learn directly from experienced instructors.",
    icon: <Video className="w-5 h-5" />,
    src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2670&auto=format&fit=crop",
    content: <LiveInteractiveSessionsContent />,
  },
  {
    category: "Analytics",
    title: "5. Progress Tracking",
    description: "Track learning milestones, consistency, course completion, and overall performance.",
    icon: <TrendingUp className="w-5 h-5" />,
    src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop",
    content: <ProgressTrackingContent />,
  },
  {
    category: "Community",
    title: "6. Community & Support",
    description: "Learn alongside a community of peers, mentors, and professionals.",
    icon: <Users2 className="w-5 h-5" />,
    src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop",
    content: <CommunitySupportContent />,
  },
];
