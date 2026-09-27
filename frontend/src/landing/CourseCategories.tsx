"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Code2,
  Layers,
  Sparkles,
  Server,
  BrainCircuit,
  Cloud,
  ShieldCheck,
  Briefcase,
  ArrowRight,
  Star,
  Clock,
  BookOpen,
  CheckCircle2
} from "lucide-react";
import { COURSE_CATEGORIES, CourseCategory } from "./landingData";
import { CourseDetailModal } from "./CourseDetailModal";

const iconMap: Record<string, React.ElementType> = {
  Code2,
  Layers,
  Sparkles,
  Server,
  BrainCircuit,
  Cloud,
  ShieldCheck,
  Briefcase
};

export function CourseCategories({ onEnrollCourse }: { onEnrollCourse?: (course: CourseCategory) => void }) {
  const [selectedCourse, setSelectedCourse] = useState<CourseCategory | null>(null);

  return (
    <section id="courses" className="py-24 bg-slate-50/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Comprehensive Tracks</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Explore Industry-Engineered Learning Tracks
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Structured curricula with built-in LeetCode-style problem arenas, production microservices, and 1:1 mentor code reviews.
          </p>
        </div>

        {/* 8 Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {COURSE_CATEGORIES.map((category, idx) => {
            const Icon = iconMap[category.icon] || Code2;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                onClick={() => setSelectedCourse(category)}
                className="group relative p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                {/* Header Icon + Level Badge */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                      {category.level}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-blue-600 transition-colors">
                    {category.title}
                  </h3>

                  <p className="text-xs text-slate-500 mb-3 font-medium">
                    {category.tagline}
                  </p>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {category.description}
                  </p>

                  {/* Micro Topic Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {category.topics.slice(0, 3).map((topic, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-150 text-[10.5px] font-medium text-slate-600"
                      >
                        {topic}
                      </span>
                    ))}
                    {category.topics.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-[10.5px] font-bold text-blue-600">
                        +{category.topics.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer: Rating & Duration */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 font-bold text-slate-800">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{category.rating}</span>
                    <span className="text-slate-400 font-normal">({category.studentsCount})</span>
                  </div>

                  <span className="font-bold text-blue-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    View Track <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>

      {/* Syllabus Modal */}
      <CourseDetailModal
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
        onEnroll={onEnrollCourse}
      />
    </section>
  );
}
