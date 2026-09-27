"use client";

import React from "react";
import {
  X,
  CheckCircle2,
  Clock,
  BookOpen,
  Users,
  Star,
  ArrowRight,
  ShieldCheck,
  Code2,
  Sparkles
} from "lucide-react";
import { CourseCategory } from "./landingData";

export function CourseDetailModal({
  course,
  onClose,
  onEnroll,
}: {
  course: CourseCategory | null;
  onClose: () => void;
  onEnroll?: (course: CourseCategory) => void;
}) {
  if (!course) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-2">
            {course.level} · {course.duration}
          </span>
          <h3 className="text-2xl font-bold tracking-tight">{course.title}</h3>
          <p className="text-blue-100 text-sm mt-1">{course.tagline}</p>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
              Track Overview
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Featured Capstone & Metrics */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Featured Flagship Curriculum
            </h5>
            <p className="text-sm font-bold text-blue-600">
              {course.featuredCourse.title}
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <span className="block font-bold text-slate-900">{course.featuredCourse.modules}</span>
                <span className="text-slate-500 text-[11px]">Modules</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <span className="block font-bold text-slate-900">{course.featuredCourse.projects}</span>
                <span className="text-slate-500 text-[11px]">Projects</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <span className="block font-bold text-slate-900">{course.featuredCourse.problems}+</span>
                <span className="text-slate-500 text-[11px]">Problems</span>
              </div>
            </div>
          </div>

          {/* Topics Covered */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Core Technologies & Concepts
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {course.topics.map((t, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-xs font-medium text-slate-700">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-4 h-4 fill-current" />
            </div>
            <span className="text-xs font-bold text-slate-900">{course.rating}</span>
            <span className="text-xs text-slate-500">({course.studentsCount} enrolled)</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                if (onEnroll) onEnroll(course);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <span>Enroll in Track</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
