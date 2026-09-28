"use client";

import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { CourseDetailModal } from "./CourseDetailModal";
import { CourseCategory, COURSE_CATEGORIES } from "./landingData";

export interface FolderCardData {
  id: string;
  index: string;
  title: string;
  description: string;
  backplateGradient: string;
  artworkSrc: string;
  flapBg: string;
  textColor: string;
  subtextColor: string;
  arrowColor: string;
}

export const CARDS_DATA: FolderCardData[] = [
  {
    id: "fullstack",
    index: "01",
    title: "Built for speed",
    description: "Every interaction responds before you notice the wait.",
    backplateGradient: "bg-gradient-to-b from-[#6b46c1] via-[#5233a8] to-[#24135e]",
    artworkSrc: "/courses/chrome-arrow.jpg",
    flapBg: "#1b193a",
    textColor: "text-white",
    subtextColor: "text-white/45",
    arrowColor: "text-white/70 group-hover:text-white",
  },
  {
    id: "dsa",
    index: "02",
    title: "Made to bend",
    description: "Reshape the layout without touching a single line of code.",
    backplateGradient: "bg-gradient-to-b from-[#e77a60] via-[#d65f49] to-[#8c2d20]",
    artworkSrc: "/courses/chrome-ribbon.jpg",
    flapBg: "#e2e5ea",
    textColor: "text-[#111827]",
    subtextColor: "text-[#4b5563]",
    arrowColor: "text-[#111827]/70 group-hover:text-[#111827]",
  },
  {
    id: "backend",
    index: "03",
    title: "Room to grow",
    description: "Start small and scale up without ever hitting a redesign.",
    backplateGradient: "bg-gradient-to-b from-[#9ba7be] via-[#637493] to-[#253247]",
    artworkSrc: "/courses/chrome-silver.jpg",
    flapBg: "#14161a",
    textColor: "text-white",
    subtextColor: "text-white/45",
    arrowColor: "text-white/70 group-hover:text-white",
  },
  {
    id: "ai-ml",
    index: "04",
    title: "Autonomous agents",
    description: "Deploy self-governing reasoning chains and dynamic tool-use pipelines.",
    backplateGradient: "bg-gradient-to-b from-[#a855f7] via-[#7e22ce] to-[#3b0764]",
    artworkSrc: "/courses/genai-3d.jpg",
    flapBg: "#1a1226",
    textColor: "text-white",
    subtextColor: "text-white/45",
    arrowColor: "text-white/70 group-hover:text-white",
  },
  {
    id: "frontend",
    index: "05",
    title: "Spatial precision",
    description: "Fluid WebGL shaders and tactile interaction designed for the next web.",
    backplateGradient: "bg-gradient-to-b from-[#06b6d4] via-[#0284c7] to-[#0c4a6e]",
    artworkSrc: "/courses/frontend-3d.jpg",
    flapBg: "#0d1b22",
    textColor: "text-white",
    subtextColor: "text-white/45",
    arrowColor: "text-white/70 group-hover:text-white",
  },
  {
    id: "cloud",
    index: "06",
    title: "Zero friction infra",
    description: "Automated multi-region orchestration with resilient zero-downtime rollouts.",
    backplateGradient: "bg-gradient-to-b from-[#f97316] via-[#c2410c] to-[#431407]",
    artworkSrc: "/courses/cloud-3d.jpg",
    flapBg: "#1c1410",
    textColor: "text-white",
    subtextColor: "text-white/45",
    arrowColor: "text-white/70 group-hover:text-white",
  },
];

export function CourseFolderSection() {
  const [selectedCourse, setSelectedCourse] = useState<CourseCategory | null>(null);

  const handleOpenDetail = (card: FolderCardData) => {
    const matching = COURSE_CATEGORIES.find((c) => c.id === card.id) || null;
    if (matching) {
      setSelectedCourse(matching);
    }
  };

  return (
    <section id="courses" className="w-full py-24 sm:py-32 bg-black text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-display text-white">
            Courses We Offer
          </h2>
          <p className="text-sm sm:text-base text-neutral-400">
            Engineered curricula for production architectures, algorithmic mastery, and modern tech stacks.
          </p>
        </div>

        {/* Minimalist Folder Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 justify-items-center">
          {CARDS_DATA.map((card) => (
            <MinimalFolderCard
              key={card.id}
              card={card}
              onClick={() => handleOpenDetail(card)}
            />
          ))}
        </div>

      </div>

      {/* Curriculum Modal */}
      <CourseDetailModal
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
      />
    </section>
  );
}

function MinimalFolderCard({
  card,
  onClick,
}: {
  card: FolderCardData;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="group relative w-full max-w-[360px] h-[480px] sm:h-[500px] rounded-[30px] overflow-hidden cursor-pointer select-none bg-black border border-white/10 shadow-2xl transition-all duration-300"
    >
      {/* 1. BACKPLATE GRADIENT (Full Card Area) */}
      <div className={`absolute inset-0 w-full h-full ${card.backplateGradient}`}>
        {/* Subtle Specular Top Sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
      </div>

      {/* 2. 3D ARTWORK (Peeking out at top-right) */}
      <div className="absolute top-10 right-3 w-48 h-48 sm:w-52 sm:h-52 z-10 pointer-events-none transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-3 group-hover:scale-105">
        <img
          src={card.artworkSrc}
          alt={card.title}
          className="w-full h-full object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]"
        />
      </div>

      {/* 3. FRONT FOLDER FLAP (Slides Down on Hover with smooth ease) */}
      <div className="absolute inset-x-0 bottom-0 h-[320px] sm:h-[335px] z-20 pointer-events-none transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-[150px] sm:group-hover:translate-y-[165px]">
        
        {/* Seamless Smooth Folder Flap SVG Silhouette */}
        <svg
          viewBox="0 0 360 340"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
        >
          <path
            d="M 0 28 
               C 0 12.5 12.5 0 28 0 
               H 185 
               C 198 0 206 7 213 18 
               C 219 28 227 34 240 34 
               H 332 
               C 347.5 34 360 46.5 360 62 
               V 312 
               C 360 327.5 347.5 340 332 340 
               H 28 
               C 12.5 340 0 327.5 0 312 
               Z"
            fill={card.flapBg}
          />
        </svg>

        {/* Flap Content Overlay */}
        <div className={`relative w-full h-full flex flex-col justify-between p-7 sm:p-8 ${card.textColor}`}>
          
          {/* Top Row: Huge Index (01) on Tab & Arrow on Lower Step */}
          <div className="flex items-start justify-between">
            {/* Index Number */}
            <span className="font-display font-extrabold text-5xl sm:text-6xl tracking-tight leading-none select-none">
              {card.index}
            </span>

            {/* Minimal Diagonal Arrow */}
            <div className="mt-3.5 mr-1">
              <ArrowUpRight className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${card.arrowColor}`} />
            </div>
          </div>

          {/* Bottom Row: Title & Clean Subtitle */}
          <div className="space-y-1.5 pb-2">
            <h3 className="text-base sm:text-lg font-bold tracking-tight leading-snug">
              {card.title}
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${card.subtextColor}`}>
              {card.description}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
