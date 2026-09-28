"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
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
  videoUrl?: string;
}

export const VIDEO_TESTIMONIAL_CARDS: VideoCardItem[] = [
  {
    id: "vid-1",
    studentName: "Aditya Roy",
    role: "SDE @ Uber",
    company: "Uber",
    courseName: "Data Structures & Advanced Algorithms",
    thumbnail: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    duration: "3:42",
    highlight: "How I cracked the Uber coding round with the 14-pattern framework",
  },
  {
    id: "vid-2",
    studentName: "Kavya Patel",
    role: "AI Engineer @ Atlassian",
    company: "Atlassian",
    courseName: "Generative AI & LLM Systems",
    thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    duration: "4:15",
    highlight: "From zero AI experience to deploying production RAG systems",
  },
  {
    id: "vid-3",
    studentName: "Manish Kumar",
    role: "Cloud Architect @ Deloitte",
    company: "Deloitte",
    courseName: "AWS Cloud & DevOps Engineering",
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    duration: "2:58",
    highlight: "Switched careers from mechanical engineering in 5 months",
  },
  {
    id: "vid-4",
    studentName: "Sneha Reddy",
    role: "Full Stack @ Microsoft",
    company: "Microsoft",
    courseName: "Software Development Track",
    thumbnail: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80",
    duration: "3:10",
    highlight: "Building distributed microservices and clearing Microsoft Azure loop",
  },
  {
    id: "vid-5",
    studentName: "Vikram Malhotra",
    role: "Backend Engineer @ Amazon",
    company: "Amazon",
    courseName: "Distributed Systems & Cloud",
    thumbnail: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    duration: "4:02",
    highlight: "Cracked Amazon SDE-2 after mastering Kafka and Redis sharding",
  },
  {
    id: "vid-6",
    studentName: "Priya Nair",
    role: "Frontend Engineer @ Adobe",
    company: "Adobe",
    courseName: "Advanced Frontend Engineering",
    thumbnail: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    duration: "3:30",
    highlight: "Mastering WebGL and Core Web Vitals to join Adobe Creative Cloud",
  },
  {
    id: "vid-7",
    studentName: "Kabir Sengupta",
    role: "AI Systems @ Swiggy",
    company: "Swiggy",
    courseName: "Artificial Intelligence Masterclass",
    thumbnail: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
    duration: "3:55",
    highlight: "Designing GenAI voice ordering and multi-agent systems",
  },
  {
    id: "vid-8",
    studentName: "Ananya Iyer",
    role: "Payments Engineer @ Razorpay",
    company: "Razorpay",
    courseName: "Full Stack & Microservices",
    thumbnail: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    duration: "3:20",
    highlight: "Fintech ledger architecture and idempotency deep-dive",
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
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
              Video Testimonials
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-xl font-normal">
              Hear directly from learners who are building skills and advancing their careers.
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
          className={`flex gap-5 sm:gap-6 overflow-x-auto pb-2 pt-1 select-none scroll-smooth ${
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
                    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                  });
                }
              }}
              className="group relative flex-[0_0_260px] sm:flex-[0_0_300px] md:flex-[0_0_320px] aspect-[3/4] rounded-[26px] overflow-hidden bg-slate-900 border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer select-none shrink-0"
            >
              {/* Full-Bleed Image */}
              <img
                src={card.thumbnail}
                alt={card.studentName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out pointer-events-none"
                loading="lazy"
                draggable={false}
              />

              {/* Subtle Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

              {/* Video Play Icon in the Center */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/95 backdrop-blur-md text-slate-900 flex items-center justify-center shadow-lg shadow-black/25 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current ml-0.5" />
                </div>
              </div>
            </div>
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
