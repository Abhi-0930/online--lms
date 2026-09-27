"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Quote,
  Star,
  ExternalLink,
  Award,
  Sparkles,
  ArrowRight,
  Linkedin
} from "lucide-react";
import { SUCCESS_STORIES, SuccessStory } from "./landingData";

export function SuccessStories() {
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const filterTabs = ["All", "FAANG", "Product", "Unicorn"];

  const filteredStories =
    activeFilter === "All"
      ? SUCCESS_STORIES
      : SUCCESS_STORIES.filter((s) => s.category === activeFilter);

  return (
    <section id="stories" className="py-24 bg-slate-50/60 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>Alumni Placement Wall</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            From Non-Tech & Service Firms to Tier-1 Tech
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Real engineers. Real career transformations. See how our graduates cracked high-paying software roles at top companies worldwide.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeFilter === tab
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
              }`}
            >
              {tab === "All" ? "All Stories" : `${tab} Offers`}
            </button>
          ))}
        </div>

        {/* Stories Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredStories.map((story, idx) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group relative p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Header: Photo + Company Logo + Hike Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={story.avatar}
                      alt={story.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{story.name}</h4>
                      <p className="text-xs text-slate-500">{story.currentRole}</p>
                    </div>
                  </div>

                  <img
                    src={story.companyLogo}
                    alt={story.company}
                    className="h-5 w-auto max-w-[60px] object-contain"
                  />
                </div>

                {/* Salary Hike Pill */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold mb-3.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+{story.salaryHike} Salary Hike</span>
                </div>

                {/* Previous vs Current */}
                <div className="text-[11.5px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3 space-y-0.5">
                  <p>Previous: <strong className="text-slate-700">{story.previousRole}</strong></p>
                  <p>Current: <strong className="text-blue-600">{story.currentRole} @ {story.company}</strong></p>
                </div>

                {/* Quote */}
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  &quot;{story.quote}&quot;
                </p>
              </div>

              {/* Story Footer */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-400">Verified Alumni</span>
                <a
                  href={story.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 font-bold hover:underline"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
