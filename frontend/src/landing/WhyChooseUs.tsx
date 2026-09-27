"use client";

import React from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";
import {
  Code2,
  Terminal,
  Cpu,
  Layers,
  Users2,
  CheckCircle2,
  Sparkles,
  Rocket,
  ShieldCheck,
  Award,
  ArrowRight
} from "lucide-react";

export function WhyChooseUs() {
  const cards = data.map((card, index) => (
    <Card key={card.src + index} card={card} index={index} />
  ));

  return (
    <section id="why-us" className="w-full h-full py-20 sm:py-28 bg-[#0f172a] overflow-hidden border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-display text-white">
          Why Top Engineers Choose PrepPath
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
          We eliminated the fluff, isolated tutorials, and outdated theory. Everything is built from the ground up to simulate what top engineering teams expect on day one.
        </p>
      </div>

      <Carousel items={cards} />
    </section>
  );
}

// ----------------------------------------------------
// DETAILED MODAL BREAKDOWN COMPONENTS
// ----------------------------------------------------

const InteractiveIDEContent = () => {
  return (
    <div className="space-y-6 text-slate-700 dark:text-slate-300">
      <div className="bg-[#F5F5F7] dark:bg-neutral-800/70 p-6 md:p-10 rounded-3xl space-y-4 border border-slate-200/60 dark:border-neutral-700/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              Zero-Config Browser Execution Engine
            </h4>
            <p className="text-xs md:text-sm text-slate-500">Fast compilation with WebAssembly & Docker sandboxes</p>
          </div>
        </div>

        <p className="text-sm md:text-base leading-relaxed">
          Say goodbye to hours wasted debugging local environment setups. Our integrated browser IDE supports Python, C++, Java, Go, TypeScript, and Rust with instant test validation, memory profiling, and complexity counters.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-700 text-center">
            <span className="text-xl font-black text-blue-600 dark:text-blue-400">450+</span>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Automated Test Suites</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-700 text-center">
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">&lt;50ms</span>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Execution Latency</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-700 text-center">
            <span className="text-xl font-black text-purple-600 dark:text-purple-400">12+</span>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Supported Runtimes</p>
          </div>
        </div>
      </div>

      <div className="bg-[#F5F5F7] dark:bg-neutral-800/70 p-6 md:p-10 rounded-3xl space-y-3 border border-slate-200/60 dark:border-neutral-700/60">
        <h5 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Real-time Code Profiling</span>
        </h5>
        <p className="text-sm leading-relaxed">
          Every submission automatically visualizes call stack depth, recursion trees, memory allocations, and compares time complexity against optimal solution benchmarks.
        </p>
      </div>
    </div>
  );
};

const DistributedSystemsContent = () => {
  return (
    <div className="space-y-6 text-slate-700 dark:text-slate-300">
      <div className="bg-[#F5F5F7] dark:bg-neutral-800/70 p-6 md:p-10 rounded-3xl space-y-4 border border-slate-200/60 dark:border-neutral-700/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              Enterprise Distributed Microservices
            </h4>
            <p className="text-xs md:text-sm text-slate-500">Handle concurrency, sharding, and fault tolerance</p>
          </div>
        </div>

        <p className="text-sm md:text-base leading-relaxed">
          You don&apos;t just build simple CRUD apps. You engineer multi-region microservices handling 10,000+ RPS with Kafka event streaming, Redis distributed locks, PostgreSQL partition indexing, and Docker Swarm/Kubernetes orchestration.
        </p>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-700 space-y-2">
          <span className="text-xs font-bold uppercase text-slate-400">Production Capstone Stack:</span>
          <div className="flex flex-wrap gap-1.5">
            {["Kafka", "Redis Sharding", "PostgreSQL", "Docker", "Kubernetes", "gRPC", "Prometheus", "Grafana"].map((t) => (
              <span key={t} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-neutral-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MentorshipContent = () => {
  return (
    <div className="space-y-6 text-slate-700 dark:text-slate-300">
      <div className="bg-[#F5F5F7] dark:bg-neutral-800/70 p-6 md:p-10 rounded-3xl space-y-4 border border-slate-200/60 dark:border-neutral-700/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Users2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              1:1 Line-by-Line Senior Code Reviews
            </h4>
            <p className="text-xs md:text-sm text-slate-500">Direct mentorship from senior Google, Amazon & Microsoft leads</p>
          </div>
        </div>

        <p className="text-sm md:text-base leading-relaxed">
          Get real GitHub pull request reviews on your code structure, design patterns, clean code principles, test coverage, and documentation. No generic feedback—every review is tailored to elevate you to staff-level engineering standards.
        </p>
      </div>
    </div>
  );
};

const PlacementContent = () => {
  return (
    <div className="space-y-6 text-slate-700 dark:text-slate-300">
      <div className="bg-[#F5F5F7] dark:bg-neutral-800/70 p-6 md:p-10 rounded-3xl space-y-4 border border-slate-200/60 dark:border-neutral-700/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              Direct Referrals to 500+ Hiring Partners
            </h4>
            <p className="text-xs md:text-sm text-slate-500">Skip the automated resume rejection black hole</p>
          </div>
        </div>

        <p className="text-sm md:text-base leading-relaxed">
          Graduates receive direct recruiter referrals into tier-1 tech companies, unicorns, and high-growth fintech startups, with dedicated salary and equity negotiation coaching before signing offers.
        </p>
      </div>
    </div>
  );
};

const AIPoweredContent = () => {
  return (
    <div className="space-y-6 text-slate-700 dark:text-slate-300">
      <div className="bg-[#F5F5F7] dark:bg-neutral-800/70 p-6 md:p-10 rounded-3xl space-y-4 border border-slate-200/60 dark:border-neutral-700/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              AI Diagnostic & Adaptive Roadmaps
            </h4>
            <p className="text-xs md:text-sm text-slate-500">Personalized learning paths tuned to your dream target role</p>
          </div>
        </div>

        <p className="text-sm md:text-base leading-relaxed">
          Our AI diagnostic engine continuously evaluates your code style, problem-solving speed, and conceptual blindspots, recommending targeted practice modules to maximize learning velocity.
        </p>
      </div>
    </div>
  );
};

const CommunityContent = () => {
  return (
    <div className="space-y-6 text-slate-700 dark:text-slate-300">
      <div className="bg-[#F5F5F7] dark:bg-neutral-800/70 p-6 md:p-10 rounded-3xl space-y-4 border border-slate-200/60 dark:border-neutral-700/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              24/7 Dedicated TA & Peer Discord Community
            </h4>
            <p className="text-xs md:text-sm text-slate-500">Never get stuck on a bug for more than 15 minutes</p>
          </div>
        </div>

        <p className="text-sm md:text-base leading-relaxed">
          Join 45,000+ active ambitious developers across 35 countries. Engage in weekly live masterclasses, system design teardowns, and pair-programming sessions.
        </p>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// CAROUSEL CARD DATA
// ----------------------------------------------------
const data = [
  {
    category: "Interactive Practice",
    title: "Browser code execution with instant edge-case testing.",
    src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop",
    content: <InteractiveIDEContent />,
  },
  {
    category: "Enterprise Scale",
    title: "Engineer distributed systems with Kafka & Redis.",
    src: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2668&auto=format&fit=crop",
    content: <DistributedSystemsContent />,
  },
  {
    category: "1:1 Mentorship",
    title: "Line-by-line pull request code reviews by FAANG leads.",
    src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop",
    content: <MentorshipContent />,
  },
  {
    category: "Placement Edge",
    title: "Skip ATS filters with direct hiring partner referrals.",
    src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2670&auto=format&fit=crop",
    content: <PlacementContent />,
  },
  {
    category: "Adaptive AI",
    title: "Intelligent diagnostic skill matrix & roadmaps.",
    src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
    content: <AIPoweredContent />,
  },
  {
    category: "Global Community",
    title: "24/7 active Discord with senior TA doubt resolution.",
    src: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=2670&auto=format&fit=crop",
    content: <CommunityContent />,
  },
];
