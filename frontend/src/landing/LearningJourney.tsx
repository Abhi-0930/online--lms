"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Compass,
  BookOpenCheck,
  Code2,
  FileCheck2,
  Rocket,
  Users2,
  Sparkle,
  Award,
  CheckCircle2,
  ArrowRight,
  Zap,
  Layers
} from "lucide-react";
import { LEARNING_JOURNEY_STEPS } from "./landingData";

const iconMap: Record<string, React.ElementType> = {
  Compass,
  BookOpenCheck,
  Code2,
  FileCheck2,
  Rocket,
  Users2,
  Sparkle,
  Award
};

export function LearningJourney() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  return (
    <section id="journey" className="py-24 bg-slate-50/60 relative overflow-hidden">
      {/* Background soft grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>The Proven 8-Stage Roadmap</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            From Zero to FAANG-Ready Software Engineer
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            A battle-tested sequential learning framework designed to build deep foundational mastery, production muscle, and interview confidence.
          </p>
        </div>

        {/* Step Indicator Bar on Large Screens */}
        <div className="hidden lg:grid grid-cols-8 gap-2 p-2 rounded-2xl bg-white border border-slate-200/80 shadow-xs mb-12">
          {LEARNING_JOURNEY_STEPS.map((step, idx) => {
            const Icon = iconMap[step.icon] || Code2;
            const isActive = idx === activeStepIndex;
            return (
              <button
                key={step.step}
                onClick={() => setActiveStepIndex(idx)}
                className={`flex flex-col items-center text-center p-3 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 scale-102"
                    : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold opacity-75">{step.step}</span>
                <span className="text-xs font-bold truncate max-w-full">{step.title}</span>
              </button>
            );
          })}
        </div>

        {/* Highlighted Step Feature Card */}
        <div className="hidden lg:block mb-16">
          {(() => {
            const current = LEARNING_JOURNEY_STEPS[activeStepIndex];
            const Icon = iconMap[current.icon] || Code2;
            return (
              <motion.div
                key={current.step}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-8 rounded-3xl bg-white border border-blue-200/70 shadow-xl shadow-blue-500/5 grid grid-cols-12 gap-8 items-center"
              >
                <div className="col-span-7 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-lg bg-blue-600 text-white font-mono text-xs font-bold">
                      STAGE {current.step} OF 08
                    </span>
                    <span className="text-xs font-semibold text-blue-600">{current.tagline}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 font-display">
                    {current.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                    {current.description}
                  </p>
                  
                  <div className="pt-2">
                    <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                      Key Outcomes & Deliverables:
                    </h5>
                    <div className="grid grid-cols-3 gap-3">
                      {current.deliverables.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-xs font-medium text-slate-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="col-span-5 flex flex-col items-center justify-center p-8 rounded-2xl bg-gradient-to-tr from-blue-50 via-indigo-50/40 to-slate-50 border border-blue-100 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 mb-4">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{current.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{current.tagline}</p>
                  <button
                    onClick={() => {
                      if (activeStepIndex < LEARNING_JOURNEY_STEPS.length - 1) {
                        setActiveStepIndex(activeStepIndex + 1);
                      } else {
                        setActiveStepIndex(0);
                      }
                    }}
                    className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-50 shadow-xs cursor-pointer"
                  >
                    <span>{activeStepIndex === 7 ? "Restart Journey" : "Next Milestone"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })()}
        </div>

        {/* Sequential Timeline for all viewports (Mobile & Desktop) */}
        <div className="relative border-l-2 border-blue-200 ml-4 sm:ml-8 lg:ml-12 pl-6 sm:pl-10 space-y-12">
          {LEARNING_JOURNEY_STEPS.map((step, idx) => {
            const Icon = iconMap[step.icon] || Code2;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="relative group"
              >
                {/* Glowing Node Dot on Timeline */}
                <div className="absolute -left-[35px] sm:-left-[51px] top-1.5 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center text-blue-600 shadow-md shadow-blue-500/15 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>

                <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                        STAGE {step.step}
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                        {step.title}
                      </h3>
                    </div>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                      {step.tagline}
                    </span>
                  </div>

                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-4">
                    {step.description}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
                    {step.deliverables.map((item, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-150 px-2.5 py-1 rounded-lg"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
