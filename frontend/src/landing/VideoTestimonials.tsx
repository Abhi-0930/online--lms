"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, ArrowRight, Play, Volume2, X } from "lucide-react";

export interface VideoCardItem {
  id: string;
  duration: string;
  videoUrl: string;
}

export const VIDEO_TESTIMONIAL_CARDS: VideoCardItem[] = [
  {
    id: "vid-1",
    duration: "3:42",
    videoUrl: "/videos/video1.mp4",
  },
  {
    id: "vid-2",
    duration: "4:15",
    videoUrl: "/videos/video2.mp4",
  },
  {
    id: "vid-3",
    duration: "2:58",
    videoUrl: "/videos/video3.mp4",
  },
  {
    id: "vid-4",
    duration: "3:10",
    videoUrl: "/videos/video4.mp4",
  },
  {
    id: "vid-5",
    duration: "4:02",
    videoUrl: "/videos/video5.mp4",
  },
  {
    id: "vid-6",
    duration: "3:30",
    videoUrl: "/videos/video6.mp4",
  },
  {
    id: "vid-7",
    duration: "3:55",
    videoUrl: "/videos/video7.mp4",
  },
];

export function VideoTestimonials() {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

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

  const handlePlayInline = (cardId: string) => {
    if (hasDragged) return;

    // Pause previously playing video if different
    if (activeVideoId && activeVideoId !== cardId) {
      const prevVideo = videoRefs.current[activeVideoId];
      if (prevVideo) {
        prevVideo.pause();
      }
    }

    setActiveVideoId(cardId);

    // Play active video with sound enabled
    setTimeout(() => {
      const currentVideo = videoRefs.current[cardId];
      if (currentVideo) {
        currentVideo.muted = false;
        currentVideo.volume = 1.0;
        currentVideo.play().catch(() => {
          if (currentVideo) {
            currentVideo.muted = true;
            currentVideo.play().catch(() => {});
          }
        });
      }
    }, 50);
  };

  const handleCloseInline = (e: React.MouseEvent, cardId: string) => {
    e.stopPropagation();
    const video = videoRefs.current[cardId];
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    if (activeVideoId === cardId) {
      setActiveVideoId(null);
    }
  };

  return (
    <section id="testimonials" className="py-20 sm:py-28 bg-[#f8fafc] border-t border-slate-200/60 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Heading, Supporting Text, and Navigation Arrows */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
              Video Testimonials
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-xl font-normal">
              Hear directly from PrepPath learners who transformed their technical skills and career trajectories.
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

        {/* Scrollable Container with Native Scroll + Drag Gesture */}
        <div
          ref={scrollRef}
          onScroll={checkScrollability}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`flex gap-5 sm:gap-6 overflow-x-auto pb-6 pt-1 select-none scroll-smooth ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          } -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden`}
        >
          {VIDEO_TESTIMONIAL_CARDS.map((card) => {
            const isPlaying = activeVideoId === card.id;

            return (
              <div
                key={card.id}
                onClick={() => {
                  if (!isPlaying) {
                    handlePlayInline(card.id);
                  }
                }}
                className={`group relative flex-[0_0_280px] sm:flex-[0_0_320px] md:flex-[0_0_340px] aspect-[9/15] rounded-[26px] overflow-hidden bg-slate-950 border transition-all duration-300 shrink-0 ${
                  isPlaying
                    ? "border-blue-500 shadow-[0_15px_40px_rgba(37,99,235,0.25)] ring-2 ring-blue-500/30"
                    : "border-slate-200/80 shadow-md hover:shadow-2xl hover:border-blue-300/80 cursor-pointer"
                }`}
              >
                {/* Real Inline HTML5 Video Element */}
                <video
                  ref={(el) => {
                    videoRefs.current[card.id] = el;
                  }}
                  src={card.videoUrl}
                  controls={isPlaying}
                  playsInline
                  controlsList="nodownload"
                  onEnded={() => setActiveVideoId(null)}
                  preload="metadata"
                  className={`w-full h-full object-cover bg-black transition-opacity duration-300 ${
                    isPlaying ? "opacity-100 z-20 relative" : "opacity-90 group-hover:opacity-100 group-hover:scale-105 pointer-events-none"
                  }`}
                />

                {/* Overlays & Content when NOT currently active/playing */}
                {!isPlaying && (
                  <>
                    {/* Subtle Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none z-10" />

                    {/* Top Duration & Sound Indicator Pill */}
                    <div className="absolute top-4 right-4 flex items-center pointer-events-none z-10">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-black/60 text-white backdrop-blur-md border border-white/15 shadow-sm">
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                        {card.duration}
                      </span>
                    </div>

                    {/* Center Play Button Icon with Glow Effect */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                      <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white/95 backdrop-blur-md text-blue-600 flex items-center justify-center shadow-2xl shadow-black/50 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-blue-500/50 transition-all duration-300">
                        <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1" />
                      </div>
                    </div>
                  </>
                )}

                {/* Floating Close Button Overlay when Video is Playing INLINE */}
                {isPlaying && (
                  <div className="absolute top-3 right-3 z-30 pointer-events-auto">
                    <button
                      onClick={(e) => handleCloseInline(e, card.id)}
                      title="Stop & return to preview"
                      className="p-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white backdrop-blur-md border border-white/20 transition-all shadow-lg cursor-pointer active:scale-95"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
