"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Quote
} from "lucide-react";
import { SUCCESS_STORIES, SuccessStory } from "./landingData";

export function SuccessStories() {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const totalStories = SUCCESS_STORIES.length;

  // Autoplay ticker (2 seconds continuous)
  useEffect(() => {
    if (totalStories <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalStories);
    }, 2000);

    return () => clearInterval(interval);
  }, [totalStories]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? totalStories - 1 : prev - 1));
  }, [totalStories]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalStories);
  }, [totalStories]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrev, handleNext]);

  return (
    <section
      id="stories"
      className="py-16 sm:py-24 bg-[#f8fafc] relative overflow-hidden text-slate-900 select-none border-t border-slate-200/80"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Minimal Clean Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-3">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-display text-slate-900">
            Learner Success Stories
          </h2>

          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Explore the journeys of learners who transformed dedication, consistency, and hard work into meaningful career opportunities.
          </p>
        </div>

        {/* ---------------------------------------------------- */}
        {/* LIGHT THEME RAINBOW DOME ARC STAGE                   */}
        {/* ---------------------------------------------------- */}
        <div className="relative w-full h-[510px] sm:h-[560px] md:h-[610px] overflow-hidden flex items-start justify-center pt-6 sm:pt-8 select-none">
          {/* Card Arch */}
          <div className="relative w-full h-full flex justify-center">
            {SUCCESS_STORIES.map((story, i) => {
              const offset = i - activeIndex;

              // Render visible cards along the arc
              const isVisible = Math.abs(offset) <= 3.8;
              if (!isVisible) return null;

              // Angular calculation for wide dome with clean spacing
              const stepAngleDeg = 24;
              const angleDeg = offset * stepAngleDeg;
              const angleRad = (angleDeg * Math.PI) / 180;

              // Arc Radii
              const rx = typeof window !== "undefined" && window.innerWidth < 640 ? 380 : 570;
              const ry = typeof window !== "undefined" && window.innerWidth < 640 ? 280 : 360;

              // Coordinates relative to apex
              const transX = rx * Math.sin(angleRad);
              const transY = ry * (1 - Math.cos(angleRad));
              const rotZ = angleDeg;

              const isCenter = Math.abs(angleDeg) < 10;
              const scale = Math.max(0.72, 1.08 - Math.abs(offset) * 0.07);
              const opacity = Math.max(0.35, 1 - Math.abs(offset) * 0.16);
              const zIndex = Math.round(50 - Math.abs(offset) * 10);

              return (
                <motion.div
                  key={story.id}
                  className="absolute top-4 sm:top-5 origin-bottom cursor-pointer select-none"
                  style={{
                    zIndex,
                    width: "225px",
                    userSelect: "none",
                  }}
                  animate={{
                    x: transX,
                    y: transY,
                    rotate: rotZ,
                    scale: isCenter ? 1.12 : scale,
                    opacity: opacity,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 26,
                    mass: 0.8,
                  }}
                  onClick={() => {
                    setActiveIndex(i);
                  }}
                >
                  <LightArcCard
                    story={story}
                    isCenter={isCenter}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Minimal Floating Chevrons (< and >) placed downwards in the hollow arch */}
          <div className="absolute top-[340px] sm:top-[380px] md:top-[415px] left-1/2 -translate-x-1/2 flex items-center justify-center gap-3 sm:gap-4 pointer-events-none z-40">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              aria-label="Previous story"
              className="pointer-events-auto w-10 h-10 rounded-full bg-white hover:bg-slate-100 border border-slate-300/80 text-slate-700 hover:text-slate-950 flex items-center justify-center shadow-md transition-all cursor-pointer active:scale-90"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="Next story"
              className="pointer-events-auto w-10 h-10 rounded-full bg-white hover:bg-slate-100 border border-slate-300/80 text-slate-700 hover:text-slate-950 flex items-center justify-center shadow-md transition-all cursor-pointer active:scale-90"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}

// ----------------------------------------------------
// LIGHT THEME ARC CARD COMPONENT
// ----------------------------------------------------
interface LightArcCardProps {
  story: SuccessStory;
  isCenter: boolean;
}

function LightArcCard({ story, isCenter }: LightArcCardProps) {
  return (
    <div
      className={`relative w-full h-[280px] sm:h-[295px] rounded-[22px] overflow-hidden transition-all duration-300 flex flex-col justify-between p-4 bg-white border ${
        isCenter
          ? "border-blue-300 shadow-xl ring-2 ring-blue-500/20"
          : "border-slate-200/90 hover:border-slate-300 shadow-sm"
      }`}
    >
      {/* Header: Avatar + Verified Dot + Company Logo */}
      <div className="flex items-center justify-between gap-2">
        <div className="relative">
          <img
            draggable={false}
            src={story.avatar}
            alt={story.name}
            className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 shadow-xs"
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
        </div>

        {/* Company Logo Image */}
        <div className="h-6 max-w-[85px] flex items-center justify-end">
          <img
            draggable={false}
            src={story.companyLogo}
            alt={story.company}
            className="max-h-5 max-w-full object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </div>
      </div>

      {/* Center Details: Name & Role */}
      <div className="space-y-0.5">
        <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">{story.name}</h4>
        <p className="text-xs text-slate-500 font-medium truncate">
          {story.currentRole}
        </p>
      </div>

      {/* Quote / Feedback Description (Larger readable text) */}
      <div className="relative p-3 rounded-xl bg-slate-50 border border-slate-100 flex-1 flex flex-col justify-center">
        <Quote className="w-3 h-3 text-slate-400 absolute top-2 right-2 opacity-50" />
        <p className="text-[12px] sm:text-[13px] text-slate-700 italic leading-relaxed line-clamp-4">
          &quot;{story.quote}&quot;
        </p>
      </div>
    </div>
  );
}
