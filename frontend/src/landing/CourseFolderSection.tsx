"use client";

import React, { useState, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
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

export const OFFERED_COURSES: FolderCardData[] = [
  {
    id: "software-dev",
    index: "01",
    title: "Software Development",
    description: "Architect scalable full-stack applications, clean codebases, and production microservices.",
    backplateGradient: "bg-gradient-to-b from-[#6b46c1] via-[#5233a8] to-[#24135e]",
    artworkSrc: "/courses/fullstack-3d.jpg",
    flapBg: "#121218",
    textColor: "text-white",
    subtextColor: "text-white/50",
    arrowColor: "text-white/70 group-hover:text-white",
  },
  {
    id: "dsa",
    index: "02",
    title: "Data Structures & Algorithms",
    description: "Master fundamental to advanced data structures, graph theory, and algorithmic problem solving.",
    backplateGradient: "bg-gradient-to-b from-[#e77a60] via-[#d65f49] to-[#8c2d20]",
    artworkSrc: "/courses/dsa-3d.jpg",
    flapBg: "#121218",
    textColor: "text-white",
    subtextColor: "text-white/50",
    arrowColor: "text-white/70 group-hover:text-white",
  },
  {
    id: "cloud-devops",
    index: "03",
    title: "Cloud & DevOps",
    description: "Orchestrate multi-region cloud infrastructures, Kubernetes clusters, Docker, and CI/CD automation.",
    backplateGradient: "bg-gradient-to-b from-[#9ba7be] via-[#637493] to-[#253247]",
    artworkSrc: "/courses/cloud-3d.jpg",
    flapBg: "#121218",
    textColor: "text-white",
    subtextColor: "text-white/50",
    arrowColor: "text-white/70 group-hover:text-white",
  },
  {
    id: "ai",
    index: "04",
    title: "Artificial Intelligence",
    description: "Build intelligent autonomous agents, fine-tuned neural models, RAG pipelines, and GenAI applications.",
    backplateGradient: "bg-gradient-to-b from-[#a855f7] via-[#7e22ce] to-[#3b0764]",
    artworkSrc: "/courses/ai-chrome.jpg",
    flapBg: "#121218",
    textColor: "text-white",
    subtextColor: "text-white/50",
    arrowColor: "text-white/70 group-hover:text-white",
  },
  {
    id: "cyber-security",
    index: "05",
    title: "Cyber Security",
    description: "Defend enterprise infrastructures with penetration testing, OWASP defense, and zero-trust security.",
    backplateGradient: "bg-gradient-to-b from-[#e11d48] via-[#be123c] to-[#4c0519]",
    artworkSrc: "/courses/cyber-chrome.jpg",
    flapBg: "#121218",
    textColor: "text-white",
    subtextColor: "text-white/50",
    arrowColor: "text-white/70 group-hover:text-white",
  },
  {
    id: "blockchain-web3",
    index: "06",
    title: "Blockchain & Web3",
    description: "Engineer smart contracts, consensus mechanisms, DeFi protocols, and decentralized applications.",
    backplateGradient: "bg-gradient-to-b from-[#10b981] via-[#059669] to-[#064e3b]",
    artworkSrc: "/courses/web3-chrome.jpg",
    flapBg: "#121218",
    textColor: "text-white",
    subtextColor: "text-white/50",
    arrowColor: "text-white/70 group-hover:text-white",
  },
  {
    id: "data-analytics",
    index: "07",
    title: "Data & Analytics",
    description: "Transform big datasets with distributed data warehousing, pipeline engineering, and intelligence.",
    backplateGradient: "bg-gradient-to-b from-[#06b6d4] via-[#0284c7] to-[#0c4a6e]",
    artworkSrc: "/courses/distributed-3d.jpg",
    flapBg: "#121218",
    textColor: "text-white",
    subtextColor: "text-white/50",
    arrowColor: "text-white/70 group-hover:text-white",
  },
  {
    id: "interview-prep",
    index: "08",
    title: "Interview Preparation",
    description: "Conquer technical coding rounds, high/low-level system design interviews, and behavioral screenings.",
    backplateGradient: "bg-gradient-to-b from-[#f59e0b] via-[#d97706] to-[#451a03]",
    artworkSrc: "/courses/chrome-arrow.jpg",
    flapBg: "#121218",
    textColor: "text-white",
    subtextColor: "text-white/50",
    arrowColor: "text-white/70 group-hover:text-white",
  },
];

export function CourseFolderSection() {
  const [selectedCourse, setSelectedCourse] = useState<CourseCategory | null>(null);

  const handleOpenDetail = (card: FolderCardData) => {
    const matching = COURSE_CATEGORIES.find((c) => c.id === card.id || c.title.toLowerCase().includes(card.title.toLowerCase())) || {
      id: card.id,
      title: card.title,
      tagline: card.description,
      description: card.description,
      icon: "Code2",
      accent: "from-blue-600 to-indigo-600",
      coursesCount: 16,
      studentsCount: "15.8k",
      rating: 4.95,
      duration: "16 Weeks",
      level: "All Levels",
      topics: ["Core Fundamentals", "Advanced Architecture", "System Design", "Production Capstones", "Code Reviews"],
      featuredCourse: {
        title: `${card.title} Masterclass & Certification`,
        instructor: "Senior Staff Engineer & Tech Lead",
        modules: 24,
        projects: 6,
        problems: 250,
      },
    };
    setSelectedCourse(matching);
  };

  return (
    <section id="courses" className="w-full pt-12 sm:pt-24 pb-8 sm:pb-24 bg-black text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-14 space-y-2.5">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-display text-white">
            Courses We Offer
          </h2>
          <p className="text-sm sm:text-base text-neutral-400">
            Engineered curricula for production architectures, algorithmic mastery, and modern tech stacks.
          </p>
        </div>

        {/* 1. DESKTOP VIEW (4 Columns Grid with Hover Slide-Down) */}
        <div className="hidden lg:grid grid-cols-4 gap-7 justify-items-center">
          {OFFERED_COURSES.map((card) => (
            <DesktopFolderCard
              key={card.id}
              card={card}
              onClick={() => handleOpenDetail(card)}
            />
          ))}
        </div>

      </div>

      {/* 2. MOBILE & TABLET VIEW (Exact Sticky Section Animation with Snappy Travel) */}
      <div className="block lg:hidden w-full">
        <MobileStickyCardDeck
          courses={OFFERED_COURSES}
          onSelectCard={handleOpenDetail}
        />
      </div>

      {/* Curriculum Modal */}
      <CourseDetailModal
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
      />
    </section>
  );
}

// ----------------------------------------------------
// DESKTOP FOLDER CARD COMPONENT (HOVER SLIDE-DOWN)
// ----------------------------------------------------

function DesktopFolderCard({
  card,
  onClick,
}: {
  card: FolderCardData;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="group relative w-full max-w-[340px] h-[470px] rounded-[28px] overflow-hidden cursor-pointer select-none bg-black border border-white/10 shadow-2xl transition-all duration-300"
    >
      {/* 1. Backplate Gradient */}
      <div className={`absolute inset-0 w-full h-full ${card.backplateGradient}`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
      </div>

      {/* 2. 3D Artwork */}
      <div className="absolute top-8 right-2.5 w-44 h-44 sm:w-48 sm:h-48 z-10 pointer-events-none transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-3 group-hover:scale-105">
        <img
          src={card.artworkSrc}
          alt={card.title}
          className="w-full h-full object-cover rounded-2xl drop-shadow-[0_20px_35px_rgba(0,0,0,0.65)]"
        />
      </div>

      {/* 3. Front Folder Flap (Smooth Deep Slide-Down on Hover) */}
      <div className="absolute inset-x-0 bottom-0 h-[310px] sm:h-[320px] z-20 pointer-events-none transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-[150px]">
        {/* Seamless Smooth Folder Flap SVG Silhouette */}
        <svg
          viewBox="0 0 340 330"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
        >
          <path
            d="M 0 26 
               C 0 11.6 11.6 0 26 0 
               H 175 
               C 188 0 195 7 202 17 
               C 208 27 216 32 228 32 
               H 314 
               C 328.4 32 340 43.6 340 58 
               V 304 
               C 340 318.4 328.4 330 314 330 
               H 26 
               C 11.6 330 0 318.4 0 304 
               Z"
            fill={card.flapBg}
          />
        </svg>

        {/* Flap Content */}
        <div className={`relative w-full h-full flex flex-col justify-between p-6 sm:p-7 ${card.textColor}`}>
          {/* Top Row: Index & Minimal Arrow */}
          <div className="flex items-start justify-between">
            <span className="font-display font-extrabold text-5xl sm:text-6xl tracking-tight leading-none select-none">
              {card.index}
            </span>
            <div className="mt-3.5 mr-1">
              <ArrowUpRight className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${card.arrowColor}`} />
            </div>
          </div>

          {/* Bottom Row: Title & Subtitle */}
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

// ----------------------------------------------------
// MOBILE & TABLET VERTICAL SCROLL STICKY DECK
// ----------------------------------------------------

function MobileStickyCardDeck({
  courses,
  onSelectCard,
}: {
  courses: FolderCardData[];
  onSelectCard: (card: FolderCardData) => void;
}) {
  return (
    <div className="relative w-full pb-16">
      {courses.map((card, index) => (
        <MobileCardSection
          key={card.id}
          card={card}
          index={index}
          total={courses.length}
          onClick={() => onSelectCard(card)}
        />
      ))}
    </div>
  );
}

function MobileCardSection({
  card,
  index,
  total,
  onClick,
}: {
  card: FolderCardData;
  index: number;
  total: number;
  onClick: () => void;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 16px", "end 16px"],
  });

  const isLast = index === total - 1;
  const tilt = index % 2 === 0 ? -4 : 4;

  // Scale: smoothly scales from 1 to 0.88 as next card stacks on top
  const scale = useTransform(scrollYProgress, [0, 1], [1, isLast ? 1 : 0.88]);

  // Rotate: smoothly tilts as next card stacks on top
  const rotate = useTransform(scrollYProgress, [0, 1], [0, isLast ? 0 : tilt]);

  const [isFlapOpen, setIsFlapOpen] = useState(false);

  return (
    <div
      ref={sectionRef}
      className="sticky top-2 sm:top-4 h-[460px] sm:h-[480px] w-full flex flex-col items-center justify-start px-4 select-none mb-3"
      style={{ zIndex: index + 10 }}
    >
      <motion.div
        style={{ scale, rotate }}
        onClick={() => {
          setIsFlapOpen(!isFlapOpen);
          onClick();
        }}
        className="group relative w-[90vw] max-w-[340px] sm:max-w-[380px] h-[440px] sm:h-[460px] rounded-[28px] overflow-hidden cursor-pointer select-none bg-black border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.9)] transition-all duration-300 active:scale-[0.98]"
      >
        {/* 1. Backplate Gradient */}
        <div className={`absolute inset-0 w-full h-full ${card.backplateGradient}`}>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
        </div>

        {/* 2. 3D Artwork */}
        <div className="absolute top-7 right-3 w-44 h-44 sm:w-48 sm:h-48 z-10 pointer-events-none transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-2 group-hover:scale-105">
          <img
            src={card.artworkSrc}
            alt={card.title}
            className="w-full h-full object-cover rounded-2xl drop-shadow-[0_20px_35px_rgba(0,0,0,0.7)]"
          />
        </div>

        {/* 3. Front Folder Flap (Smooth Deep Slide-Down on Hover or Tap) */}
        <div
          className={`absolute inset-x-0 bottom-0 h-[300px] sm:h-[315px] z-20 pointer-events-none transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isFlapOpen ? "translate-y-[145px]" : "group-hover:translate-y-[145px]"
          }`}
        >
          {/* Seamless Smooth Folder Flap SVG Silhouette */}
          <svg
            viewBox="0 0 340 330"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="none"
          >
            <path
              d="M 0 26 
                 C 0 11.6 11.6 0 26 0 
                 H 175 
                 C 188 0 195 7 202 17 
                 C 208 27 216 32 228 32 
                 H 314 
                 C 328.4 32 340 43.6 340 58 
                 V 304 
                 C 340 318.4 328.4 330 314 330 
                 H 26 
                 C 11.6 330 0 318.4 0 304 
                 Z"
              fill={card.flapBg}
            />
          </svg>

          {/* Flap Content */}
          <div className={`relative w-full h-full flex flex-col justify-between p-6 sm:p-7 ${card.textColor}`}>
            {/* Top Row: Index & Minimal Arrow */}
            <div className="flex items-start justify-between">
              <span className="font-display font-extrabold text-5xl sm:text-6xl tracking-tight leading-none select-none">
                {card.index}
              </span>
              <div className="mt-3.5 mr-1">
                <ArrowUpRight className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${card.arrowColor}`} />
              </div>
            </div>

            {/* Bottom Row: Title & Subtitle */}
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
      </motion.div>
    </div>
  );
}
