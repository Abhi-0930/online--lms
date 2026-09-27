"use client";

import React from "react";
import { X, Play, Award, CheckCircle2 } from "lucide-react";
import { VideoTestimonial } from "./landingData";

export function VideoModal({
  testimonial,
  onClose,
}: {
  testimonial: VideoTestimonial | null;
  onClose: () => void;
}) {
  if (!testimonial) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Video Player Display Container */}
        <div className="aspect-video w-full bg-black relative flex items-center justify-center">
          <div className="text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-500/40 animate-pulse">
              <Play className="w-7 h-7 fill-current ml-1" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">
                {testimonial.studentName} · {testimonial.role}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                {testimonial.highlight}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Info Footer */}
        <div className="p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-white text-xs">
          <div>
            <p className="font-bold">{testimonial.courseName}</p>
            <p className="text-slate-400 text-[11px]">Duration: {testimonial.duration}</p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold transition-colors"
          >
            Done Watching
          </button>
        </div>
      </div>
    </div>
  );
}
