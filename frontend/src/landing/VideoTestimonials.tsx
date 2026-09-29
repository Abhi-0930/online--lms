"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, ArrowRight, Play, Volume2, Sparkles, Building2 } from "lucide-react";
import { VideoModal } from "./VideoModal";
import { VideoTestimonial } from "./landingData";

export interface VideoCardItem {
  id: string;
  studentName: string;
  role: string;
  company: string;
  courseName: string;
  thumbnail: string;
  duration: string;
  highlight: string;
  videoUrl: string;
}

export const VIDEO_TESTIMONIAL_CARDS: VideoCardItem[] = [
  {
    id: "vid-1",
    studentName: "Aditya Roy",
    role: "SDE @ Google",
    company: "Google",
    courseName: "Data Structures & Advanced Algorithms",
    thumbnail: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    duration: "3:42",
    highlight: "How I cracked Google SWE round with PrepPath's 14-pattern framework",
    videoUrl: "/videos/video1.mp4",
  },
  {
    id: "vid-2",
    studentName: "Kavya Patel",
    role: "AI Engineer @ Microsoft",
    company: "Microsoft",
    courseName: "Generative AI & LLM Systems",
    thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    duration: "4:15",
    highlight: "From zero experience to building production AI agents at scale",
    videoUrl: "/videos/video2.mp4",
  },
  {
    id: "vid-3",
    studentName: "Manish Kumar",
    role: "Software Engineer @ Amazon",
    company: "Amazon",
    courseName: "Full Stack & Distributed Systems",
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    duration: "2:58",
    highlight: "Switched careers from tier-3 college to Amazon SDE in 4 months",
    videoUrl: "/videos/video3.mp4",
  },
  {
    id: "vid-4",
    studentName: "Sneha Reddy",
    role: "Backend Engineer @ Uber",
    company: "Uber",
    courseName: "System Design & Microservices",
    thumbnail: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80",
    duration: "3:10",
    highlight: "Mastered distributed Kafka and high-throughput microservices",
    videoUrl: "/videos/video4.mp4",
  },
  {
    id: "vid-5",
    studentName: "Vikram Malhotra",
    role: "SDE-2 @ Atlassian",
    company: "Atlassian",
    courseName: "Competitive Programming & DSA",
    thumbnail: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    duration: "4:02",
    highlight: "Cleared Atlassian technical loops with mock interview practice",
    videoUrl: "/videos/video5.mp4",
  },
  {
    id: "vid-6",
    studentName: "Priya Nair",
    role: "Frontend Engineer @ Adobe",
    company: "Adobe",
    courseName: "Advanced Frontend Engineering",
    thumbnail: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    duration: "3:30",
    highlight: "Mastered WebGL, Core Web Vitals, and React internals to join Adobe",
    videoUrl: "/videos/video6.mp4",
  },
  {
    id: "vid-7",
    studentName: "Kabir Sengupta",
    role: "Payments Engineer @ Razorpay",
    company: "Razorpay",
    courseName: "Fintech & Backend Architecture",
    thumbnail: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
    duration: "3:55",
    highlight: "Transitioned to fintech engineering with real-world ledger projects",
    videoUrl: "/videos/video7.mp4",
  },
];

export function VideoTestimonials() {
  const [selectedVideo, setSelectedVideo] = useState<VideoTestimonial | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  // Mouse drag to scroll state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  const checkScrollability = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollPrev(scrollLeft > 5);
    setCanScrollNext(scrollLeft < scrollWidth - clientWidth - 5);
  }, []);

  useEffect(() => {
    checkScrollability();
    const el = scrollRef.current;
    if (!el) return;

    const handleResize = () => checkScrollability();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [checkScrollability]);

  const scrollPrev = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -340, behavior: "smooth" });
    }
  };

  const scrollNext = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 340, behavior: "smooth" });
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasDragged(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftPos(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.4;
    if (Math.abs(walk) > 6) {
      setHasDragged(true);
    }
    scrollRef.current.scrollLeft = scrollLeftPos - walk;
    checkScrollability();
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  return (
    <section id="video-testimonials" className="py-20 sm:py-28 bg-[#f8fafc] border-t border-slate-200/60 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Heading, Supporting Text, and Navigation Arrows */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200/60 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real Student Journeys</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
              Video Testimonials
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-xl font-normal">
              Hear directly from PrepPath learners who cracked top product companies and transformed their careers.
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              aria-label="Previous testimonials"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-slate-200/90 bg-white text-slate-800 flex items-center justify-center hover:bg-slate-100 hover:border-slate-300 disabled:opacity-35 disabled:cursor-not-allowed shadow-xs transition-all duration-200 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              aria-label="Next testimonials"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-slate-200/90 bg-white text-slate-800 flex items-center justify-center hover:bg-slate-100 hover:border-slate-300 disabled:opacity-35 disabled:cursor-not-allowed shadow-xs transition-all duration-200 cursor-pointer active:scale-95"
            >
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Container with Native Scroll + Drag Gesture (Hidden Scrollbar) */}
        <div
          ref={scrollRef}
          onScroll={checkScrollability}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`flex gap-5 sm:gap-6 overflow-x-auto pb-4 pt-1 select-none scroll-smooth ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          } -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden`}
        >
          {VIDEO_TESTIMONIAL_CARDS.map((card) => (
            <div
              key={card.id}
              onClick={() => {
                if (!hasDragged) {
                  setSelectedVideo({
                    id: card.id,
                    studentName: card.studentName,
                    role: card.role,
                    company: card.company,
                    courseName: card.courseName,
                    thumbnail: card.thumbnail,
                    duration: card.duration,
                    highlight: card.highlight,
                    videoUrl: card.videoUrl,
                  });
                }
              }}
              className="group relative flex-[0_0_270px] sm:flex-[0_0_310px] md:flex-[0_0_330px] aspect-[9/14] rounded-[26px] overflow-hidden bg-slate-900 border border-slate-200/80 shadow-md hover:shadow-2xl hover:border-blue-300/80 transition-all duration-300 cursor-pointer select-none shrink-0"
            >
              {/* Video Preview or Fallback Poster Image */}
              <div className="absolute inset-0 overflow-hidden bg-slate-950">
                <video
                  src={`${card.videoUrl}#t=0.5`}
                  preload="metadata"
                  muted
                  playsInline
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 pointer-events-none"
                />
              </div>

              {/* Multi-tier Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/30 pointer-events-none" />

              {/* Top Company Badge & Duration Pill */}
              <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white backdrop-blur-md shadow-md border border-white/20">
                  <Building2 className="w-3 h-3 text-blue-600" />
                  {card.company}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/60 text-white/90 backdrop-blur-md border border-white/10">
                  <Volume2 className="w-3 h-3 text-emerald-400" />
                  {card.duration}
                </span>
              </div>

              {/* Center Play Button Icon with Glow & Sound Pulse */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/95 backdrop-blur-md text-blue-600 flex items-center justify-center shadow-xl shadow-black/40 group-hover:scale-115 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-blue-500/50 transition-all duration-300">
                  <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current ml-0.5" />
                </div>
              </div>

              {/* Bottom Card Content: Student info & Highlight Quote */}
              <div className="absolute bottom-0 inset-x-0 p-5 space-y-2 pointer-events-none z-10">
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug group-hover:text-blue-200 transition-colors">
                    {card.studentName}
                  </h4>
                  <p className="text-xs text-blue-300 font-medium">
                    {card.role}
                  </p>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed opacity-90">
                  "{card.highlight}"
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Interactive Video Player Modal with Sound */}
      <VideoModal
        testimonial={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </section>
  );
}
