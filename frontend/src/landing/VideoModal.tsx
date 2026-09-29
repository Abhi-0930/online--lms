"use client";

import React, { useEffect, useRef } from "react";
import { X, Volume2, Sparkles, Building2 } from "lucide-react";
import { VideoTestimonial } from "./landingData";

export function VideoModal({
  testimonial,
  onClose,
}: {
  testimonial: VideoTestimonial | null;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (testimonial) {
      // Ensure audio is enabled and video plays with sound
      if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.volume = 1.0;
        videoRef.current.play().catch(() => {
          // Autoplay policy fallback: if browser blocks unmuted autoplay, play muted or let user unmute
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().catch(() => {});
          }
        });
      }

      // Handle Escape key to close
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [testimonial, onClose]);

  if (!testimonial) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-slate-900 rounded-[28px] border border-slate-700/80 shadow-[0_25px_70px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Student info and Close Button */}
        <div className="px-5 py-4 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-600/30 border border-blue-500/40 shrink-0 flex items-center justify-center text-white font-bold text-sm">
              {testimonial.thumbnail ? (
                <img
                  src={testimonial.thumbnail}
                  alt={testimonial.studentName}
                  className="w-full h-full object-cover"
                />
              ) : (
                testimonial.studentName.charAt(0)
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white truncate">
                  {testimonial.studentName}
                </h3>
                {testimonial.company && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <Building2 className="w-2.5 h-2.5" />
                    {testimonial.company}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate">
                {testimonial.role} • {testimonial.courseName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close video"
            className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real HTML5 Video Player with Controls & Sound */}
        <div className="aspect-video w-full bg-black relative flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            src={testimonial.videoUrl}
            controls
            autoPlay
            playsInline
            controlsList="nodownload"
            poster={testimonial.thumbnail}
            className="w-full h-full object-contain bg-black"
          >
            Your browser does not support HTML5 video playback.
          </video>
        </div>

        {/* Modal Footer with Highlight and Audio badge */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-medium text-[13px]">{testimonial.highlight}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> Sound Enabled
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md shadow-blue-600/30 cursor-pointer"
            >
              Done Watching
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
