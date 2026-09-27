"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Star,
  Award,
  Users,
  Building,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { INSTRUCTORS } from "./landingData";

export function InstructorSection() {
  return (
    <section id="instructors" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>World-Class Mentors</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Learn from Engineers Who Have Built at Scale
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Our curriculum is architected and taught by Staff & Principal engineers from Google, Meta, and Amazon — not full-time generic trainers.
          </p>
        </div>

        {/* Instructors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {INSTRUCTORS.map((instructor, idx) => (
            <motion.div
              key={instructor.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Photo & Company Logo */}
                <div className="flex items-start justify-between mb-5">
                  <img
                    src={instructor.avatar}
                    alt={instructor.name}
                    className="w-20 h-20 rounded-2xl object-cover ring-4 ring-blue-50 shadow-sm"
                  />
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <img
                      src={instructor.companyLogo}
                      alt={instructor.currentCompany}
                      className="h-5 w-auto max-w-[70px] object-contain"
                    />
                  </div>
                </div>

                {/* Name & Role */}
                <h3 className="text-lg font-bold text-slate-900">{instructor.name}</h3>
                <p className="text-xs font-bold text-blue-600 mb-1">{instructor.role} @ {instructor.currentCompany}</p>
                <p className="text-xs text-slate-500 mb-4">{instructor.experience} Industry Experience</p>

                {/* Bio */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                  {instructor.bio}
                </p>

                {/* Specialties */}
                <div className="space-y-1.5 mb-5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Core Expertise</p>
                  <div className="flex flex-wrap gap-1.5">
                    {instructor.specialties.map((spec, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{instructor.rating} Rating</span>
                </div>
                <span className="text-slate-500 font-medium">
                  {instructor.studentsTaught} Students Mentored
                </span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
