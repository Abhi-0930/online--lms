"use client";

import React, { useState } from "react";
import { UsersIcon } from "@/components/animate-ui/icons/users";
import { ChartNoAxesColumnIncreasingIcon } from "@/components/animate-ui/icons/chart-no-axes-column-increasing";
import { SparklesIcon } from "@/components/animate-ui/icons/sparkles";

export interface Company {
  name: string;
  logo: string;
  domain?: string;
  cdnLogo?: string;
  brandColor?: string;
  renderSvg?: () => React.ReactNode;
}

export const ALL_COMPANIES: Company[] = [
  {
    name: "GlobalLogic",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/23/GlobalLogic_logo.svg",
    cdnLogo: "https://cdn.simpleicons.org/globallogic/FF6600",
    domain: "globallogic.com",
    brandColor: "#FF6600",
    renderSvg: () => (
      <svg className="h-7 sm:h-8 md:h-9 w-auto select-none" viewBox="0 0 160 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g className="translate-y-1">
          <path d="M12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C15.86 20 19.08 17.27 19.82 13.67H12V10.33H23.5C23.83 10.87 24 11.42 24 12C24 18.63 18.63 24 12 24C5.37 24 0 18.63 0 12C0 5.37 5.37 0 12 0C16.2 0 19.87 2.16 22 5.43L18.72 7.35C17.25 5.3 14.8 4 12 4Z" fill="#FF6600" />
          <path d="M18 10L24 16L18 22" stroke="#0099D8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <text x="32" y="23" fontFamily="system-ui, -apple-system, sans-serif" fontSize="18" fontWeight="700" fill="#1E293B" letterSpacing="-0.3px">
          Global<tspan fill="#FF6600">Logic</tspan>
        </text>
      </svg>
    ),
  },
  {
    name: "Cognizant",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Cognizant_logo_2022.svg",
    cdnLogo: "https://cdn.simpleicons.org/cognizant/0033A0",
    domain: "cognizant.com",
    brandColor: "#0033A0",
    renderSvg: () => (
      <svg className="h-7 sm:h-8 md:h-9 w-auto select-none" viewBox="0 0 150 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(0, 4)">
          <path d="M14 2C7.37 2 2 7.37 2 14C2 20.63 7.37 26 14 26C19.5 26 24.1 22.3 25.5 17.2H20.7C19.5 19.8 16.9 21.6 14 21.6C9.8 21.6 6.4 18.2 6.4 14C6.4 9.8 9.8 6.4 14 6.4C16.9 6.4 19.5 8.2 20.7 10.8H25.5C24.1 5.7 19.5 2 14 2Z" fill="#0033A0" />
          <circle cx="21" cy="7" r="3" fill="#00B4D8" />
        </g>
        <text x="30" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontSize="18" fontWeight="700" fill="#0033A0" letterSpacing="-0.4px">
          cognizant
        </text>
      </svg>
    ),
  },
  {
    name: "TCS",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg",
    cdnLogo: "https://cdn.simpleicons.org/tataconsultancyservices/005696",
    domain: "tcs.com",
    brandColor: "#005696",
    renderSvg: () => (
      <svg className="h-7 sm:h-8 md:h-9 w-auto select-none" viewBox="0 0 160 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="tcsGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#005696" />
            <stop offset="100%" stopColor="#E6007E" />
          </linearGradient>
        </defs>
        <text x="2" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontSize="24" fontWeight="900" fill="url(#tcsGrad)" letterSpacing="1px">
          tcs
        </text>
        <g transform="translate(48, 10)">
          <text x="0" y="7" fontFamily="system-ui, -apple-system, sans-serif" fontSize="7.5" fontWeight="800" fill="#005696" letterSpacing="0.8px">
            TATA
          </text>
          <text x="0" y="15" fontFamily="system-ui, -apple-system, sans-serif" fontSize="6.5" fontWeight="700" fill="#475569" letterSpacing="0.4px">
            CONSULTANCY SERVICES
          </text>
        </g>
      </svg>
    ),
  },
  {
    name: "Capgemini",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Capgemini_201x_logo.svg",
    cdnLogo: "https://cdn.simpleicons.org/capgemini/0070AD",
    domain: "capgemini.com",
    brandColor: "#0070AD",
    renderSvg: () => (
      <svg className="h-7 sm:h-8 md:h-9 w-auto select-none" viewBox="0 0 160 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(2, 6)">
          <path d="M12 0C7 6 0 10 0 15C0 19 3.5 22 8 22C10 22 11.5 21 12 19.5C12.5 21 14 22 16 22C20.5 22 24 19 24 15C24 10 17 6 12 0Z" fill="#0070AD" />
          <path d="M10 22L8 25H16L14 22H10Z" fill="#0070AD" />
        </g>
        <text x="32" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontSize="19" fontWeight="700" fill="#002D56" letterSpacing="-0.4px">
          Capgemini
        </text>
      </svg>
    ),
  },
  {
    name: "Accenture",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg",
    cdnLogo: "https://cdn.simpleicons.org/accenture/A100FF",
    domain: "accenture.com",
    brandColor: "#A100FF",
    renderSvg: () => (
      <svg className="h-7 sm:h-8 md:h-9 w-auto select-none" viewBox="0 0 145 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="2" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontSize="21" fontWeight="700" fill="#0F172A" letterSpacing="-0.5px">
          accenture
        </text>
        <path d="M78 6L84 10L78 14" stroke="#A100FF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
  {
    name: "IBM",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",
    cdnLogo: "https://cdn.simpleicons.org/ibm/052FAD",
    domain: "ibm.com",
    brandColor: "#052FAD",
    renderSvg: () => (
      <svg className="h-7 sm:h-8 md:h-9 w-auto select-none" viewBox="0 0 100 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="#0F62FE">
          {/* 8-bar striped IBM representation */}
          <rect x="5" y="6" width="90" height="2.2" />
          <rect x="5" y="9.4" width="90" height="2.2" />
          <rect x="5" y="12.8" width="90" height="2.2" />
          <rect x="5" y="16.2" width="90" height="2.2" />
          <rect x="5" y="19.6" width="90" height="2.2" />
          <rect x="5" y="23" width="90" height="2.2" />
          <rect x="5" y="26.4" width="90" height="2.2" />
          <rect x="5" y="29.8" width="90" height="2.2" />
          <mask id="ibmMask">
            <rect width="100" height="36" fill="white" />
            <rect x="18" y="0" width="10" height="36" fill="black" />
            <rect x="42" y="0" width="8" height="36" fill="black" />
            <rect x="68" y="0" width="6" height="36" fill="black" />
          </mask>
        </g>
        <text x="8" y="27" fontFamily="monospace, 'Courier New', sans-serif" fontSize="27" fontWeight="900" fill="#0F62FE" letterSpacing="4px">
          IBM
        </text>
      </svg>
    ),
  },
  {
    name: "Amazon",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    cdnLogo: "https://cdn.simpleicons.org/amazon/FF9900",
    domain: "amazon.com",
    brandColor: "#FF9900",
    renderSvg: () => (
      <svg className="h-7 sm:h-8 md:h-9 w-auto select-none" viewBox="0 0 115 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="2" y="20" fontFamily="system-ui, -apple-system, sans-serif" fontSize="21" fontWeight="700" fill="#111827" letterSpacing="-0.6px">
          amazon
        </text>
        <path d="M8 24C28 32 58 31 76 23" stroke="#FF9900" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M73 21L78 24L74 27" fill="#FF9900" />
      </svg>
    ),
  },
  {
    name: "HackerRank",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/65/HackerRank_logo.png",
    cdnLogo: "https://cdn.simpleicons.org/hackerrank/00EA64",
    domain: "hackerrank.com",
    brandColor: "#00EA64",
    renderSvg: () => (
      <svg className="h-7 sm:h-8 md:h-9 w-auto select-none" viewBox="0 0 160 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(2, 6)">
          <rect width="24" height="24" rx="5" fill="#00EA64" />
          <path d="M7 6V18M17 6V18M7 12H17" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
        </g>
        <text x="32" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontSize="18" fontWeight="800" fill="#0F172A" letterSpacing="-0.4px">
          Hacker<tspan fill="#00EA64">Rank</tspan>
        </text>
      </svg>
    ),
  },
  {
    name: "Wipro",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg",
    cdnLogo: "https://cdn.simpleicons.org/wipro/1A237E",
    domain: "wipro.com",
    brandColor: "#1A237E",
    renderSvg: () => (
      <svg className="h-7 sm:h-8 md:h-9 w-auto select-none" viewBox="0 0 130 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(6, 18)">
          <circle cx="-3" cy="-7" r="2.2" fill="#E41C2B" />
          <circle cx="3" cy="-7" r="2.2" fill="#F3A812" />
          <circle cx="7" cy="-2" r="2.2" fill="#00A34D" />
          <circle cx="5" cy="4" r="2.2" fill="#0070BA" />
          <circle cx="-1" cy="6" r="2.2" fill="#6C2D84" />
          <circle cx="-6" cy="1" r="2.2" fill="#E41C2B" />
        </g>
        <text x="26" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontSize="20" fontWeight="700" fill="#1A237E" letterSpacing="-0.5px">
          wipro
        </text>
      </svg>
    ),
  },
  {
    name: "CDK",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/9c/CDK_Global_logo.svg",
    cdnLogo: "https://cdn.simpleicons.org/cdk/E31B23",
    domain: "cdkglobal.com",
    brandColor: "#E31B23",
    renderSvg: () => (
      <svg className="h-7 sm:h-8 md:h-9 w-auto select-none" viewBox="0 0 140 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="2" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontSize="22" fontWeight="900" fill="#E31B23" letterSpacing="0.5px">
          CDK
        </text>
        <text x="56" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontSize="16" fontWeight="700" fill="#475569" letterSpacing="0.8px">
          GLOBAL
        </text>
      </svg>
    ),
  },
  {
    name: "PwC",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/05/PricewaterhouseCoopers_Logo.svg",
    cdnLogo: "https://cdn.simpleicons.org/pwc/D04A02",
    domain: "pwc.com",
    brandColor: "#D04A02",
    renderSvg: () => (
      <svg className="h-7 sm:h-8 md:h-9 w-auto select-none" viewBox="0 0 110 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(2, 6)">
          <rect x="0" y="0" width="7" height="7" fill="#EB8C00" />
          <rect x="8" y="0" width="7" height="7" fill="#DC3825" />
          <rect x="0" y="8" width="7" height="7" fill="#B7295A" />
          <rect x="8" y="8" width="7" height="7" fill="#D8536F" />
        </g>
        <text x="24" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontSize="22" fontWeight="800" fill="#1E293B" letterSpacing="-0.5px">
          pwc
        </text>
      </svg>
    ),
  },
  {
    name: "HCLTech",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/50/HCLTech_Logo.svg",
    cdnLogo: "https://cdn.simpleicons.org/hcl/004B87",
    domain: "hcltech.com",
    brandColor: "#004B87",
    renderSvg: () => (
      <svg className="h-7 sm:h-8 md:h-9 w-auto select-none" viewBox="0 0 140 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="2" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontSize="21" fontWeight="800" fill="#004B87" letterSpacing="-0.3px">
          HCL<tspan fill="#00A3E0">Tech</tspan>
        </text>
      </svg>
    ),
  },
  {
    name: "Deloitte",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/56/Deloitte.svg",
    cdnLogo: "https://cdn.simpleicons.org/deloitte/86BC25",
    domain: "deloitte.com",
    brandColor: "#86BC25",
    renderSvg: () => (
      <svg className="h-7 sm:h-8 md:h-9 w-auto select-none" viewBox="0 0 120 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="2" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontSize="21" fontWeight="700" fill="#0F172A" letterSpacing="-0.4px">
          Deloitte<tspan fill="#86BC25">.</tspan>
        </text>
      </svg>
    ),
  },
  {
    name: "GAP",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Gap_logo.svg",
    cdnLogo: "https://cdn.simpleicons.org/gap/002F6C",
    domain: "gap.com",
    brandColor: "#002F6C",
    renderSvg: () => (
      <svg className="h-7 sm:h-8 md:h-9 w-auto select-none" viewBox="0 0 90 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="4" width="28" height="28" rx="2" fill="#002F6C" />
        <text x="16" y="24" fontFamily="'Times New Roman', Times, serif" fontSize="16" fontWeight="700" fill="#FFFFFF" textAnchor="middle" letterSpacing="1px">
          GAP
        </text>
        <text x="36" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontSize="18" fontWeight="700" fill="#002F6C" letterSpacing="1px">
          GAP
        </text>
      </svg>
    ),
  },
  {
    name: "Infosys",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg",
    cdnLogo: "https://cdn.simpleicons.org/infosys/007CC3",
    domain: "infosys.com",
    brandColor: "#007CC3",
    renderSvg: () => (
      <svg className="h-7 sm:h-8 md:h-9 w-auto select-none" viewBox="0 0 125 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="2" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontSize="22" fontWeight="700" fill="#007CC3" letterSpacing="-0.6px">
          Infosys
        </text>
      </svg>
    ),
  },
];

function FallbackBrandBadge({ company }: { company: Company }) {
  const initial = company.name.charAt(0);
  const color = company.brandColor || "#2563EB";

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-colors">
      <span
        className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[11px] font-black shrink-0 shadow-xs"
        style={{ backgroundColor: color }}
      >
        {initial}
      </span>
      <span className="font-bold text-slate-800 text-sm whitespace-nowrap">
        {company.name}
      </span>
    </div>
  );
}

function CompanyLogoItem({ company }: { company: Company }) {
  const [fallbackStage, setFallbackStage] = useState(0);

  // Stage 0: Custom authentic high-resolution Vector SVG (100% reliable, zero latency, no CORS/429)
  // If renderSvg exists and stage === 0, render it directly!
  if (company.renderSvg && fallbackStage === 0) {
    return (
      <div 
        className="flex items-center justify-center px-4 sm:px-6 shrink-0 transition-all duration-300 hover:scale-110 cursor-pointer opacity-90 hover:opacity-100"
        title={company.name}
      >
        {company.renderSvg()}
      </div>
    );
  }

  // Stage 1+: Image fallback cascade
  const handleError = () => {
    setFallbackStage((prev) => prev + 1);
  };

  const getImageSrc = () => {
    switch (fallbackStage) {
      case 1:
        return company.logo;
      case 2:
        return company.cdnLogo || `https://unavatar.io/${company.domain}`;
      case 3:
        return `https://logo.clearbit.com/${company.domain}`;
      case 4:
        return `https://www.google.com/s2/favicons?domain=${company.domain}&sz=128`;
      default:
        return null;
    }
  };

  const imageSrc = getImageSrc();

  if (!imageSrc) {
    return (
      <div className="flex items-center justify-center px-4 sm:px-6 shrink-0 transition-transform duration-300 hover:scale-105 cursor-pointer">
        <FallbackBrandBadge company={company} />
      </div>
    );
  }

  return (
    <div 
      className="flex items-center justify-center px-4 sm:px-6 shrink-0 transition-all duration-300 hover:scale-110 cursor-pointer"
      title={company.name}
    >
      <img
        src={imageSrc}
        alt={`${company.name} logo`}
        onError={handleError}
        className="h-7 sm:h-8 md:h-9 max-w-[110px] sm:max-w-[130px] md:max-w-[150px] w-auto object-contain select-none"
        loading="lazy"
      />
    </div>
  );
}

export function CompaniesMarquee() {
  // Triple items for continuous, uninterrupted seamless loop
  const marqueeItems = [...ALL_COMPANIES, ...ALL_COMPANIES, ...ALL_COMPANIES];

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-white via-slate-50/60 to-white border-y border-slate-200/60 overflow-hidden relative select-none">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10 relative z-10">
        {/* Section Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-display">
          Where Our Learners{" "}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
            Work
          </span>
        </h2>

        {/* Subtitle */}
        <p className="mt-3.5 max-w-2xl mx-auto text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
          Our alumni build scalable systems, lead engineering teams, and drive impact at world-class tech leaders and high-growth unicorns.
        </p>

        {/* Quick Highlights Strip with Animated Icons */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-bold text-slate-700">
          <div className="group flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-blue-300 transition-all duration-300 cursor-pointer">
            <UsersIcon size={18} animateOnHover className="text-blue-600 group-hover:scale-110 transition-transform" />
            <span>500+ Hiring Partners</span>
          </div>
          <div className="group flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-emerald-300 transition-all duration-300 cursor-pointer">
            <ChartNoAxesColumnIncreasingIcon size={18} animateOnHover className="text-emerald-600 group-hover:scale-110 transition-transform" />
            <span>168% Avg. Salary Hike</span>
          </div>
          <div className="group flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-indigo-300 transition-all duration-300 cursor-pointer">
            <SparklesIcon size={18} animateOnHover className="text-indigo-600 group-hover:scale-110 transition-transform" />
            <span>96% Placement Success Rate</span>
          </div>
        </div>
      </div>

      {/* Side gradient blur masks for smooth edge fading */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-r from-white via-white/80 to-transparent z-20" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-l from-white via-white/80 to-transparent z-20" />

      {/* Single Marquee Track without bounding boxes, full color, relaxed speed */}
      <div className="relative">
        <div
          className="flex w-max animate-marquee hover:[animation-play-state:paused] items-center gap-10 sm:gap-14 md:gap-16"
          style={{ animationDuration: "50s" }}
        >
          {marqueeItems.map((company, index) => (
            <CompanyLogoItem
              key={`marquee-${company.name}-${index}`}
              company={company}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

