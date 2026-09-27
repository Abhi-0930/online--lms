"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play, Sparkles, Video, Clock } from "lucide-react";
import { VIDEO_TESTIMONIALS, VideoTestimonial } from "./landingData";
import { VideoModal } from "./VideoModal";

export function VideoTestimonials() {
  const [selectedVideo, setSelectedVideo] = useState<VideoTestimonial | null>(null);

  return (
    <section id="testimonials" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Video className="w-3.5 h-3.5" />
            <span>Video Stories</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Hear Directly from Our Graduates
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Unfiltered interviews with students discussing their interview loops, study routines, and how they cracked top tech offers.
          </p>
        </div>

        {/* 3 Video Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {VIDEO_TESTIMONIALS.map((video, idx) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              onClick={() => setSelectedVideo(video)}
              className="group rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between"
            >
              {/* Thumbnail Container with Play Overlay */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                <img
                  src={video.thumbnail}
                  alt={video.studentName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-colors" />

                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 group-hover:scale-115 transition-transform duration-300">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Video Duration Badge */}
                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/70 text-white text-[11px] font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{video.duration}</span>
                </div>
              </div>

              {/* Info Body */}
              <div className="p-6 space-y-2">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  {video.courseName}
                </span>
                <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {video.highlight}
                </h4>
                <p className="text-xs text-slate-500 pt-1">
                  {video.studentName} · <strong>{video.role}</strong>
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Video Player Modal */}
      <VideoModal
        testimonial={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </section>
  );
}
