"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export function Navbar({ onEnrollClick }: { onEnrollClick?: () => void }) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Activates Dynamic Island when scrolled 50-70px from top
      setIsScrolled(window.scrollY > 60);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleStartLearning = () => {
    if (onEnrollClick) {
      onEnrollClick();
    } else {
      router.push("/login");
    }
  };

  return (
    <header
      className={`fixed z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isScrolled
          ? "top-4 sm:top-5 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-fit px-0"
          : "top-0 left-0 right-0 w-full px-6 sm:px-8 py-5 sm:py-6 bg-transparent"
      }`}
    >
      <div
        className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-between ${
          isScrolled
            ? "gap-6 sm:gap-10 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-slate-950/85 text-white backdrop-blur-2xl border border-white/15 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.65)] ring-1 ring-white/10 select-none"
            : "max-w-7xl mx-auto w-full"
        }`}
      >
        {/* Brand Logo: preppath */}
        <Link
          href="/"
          onClick={(e) => {
            if (typeof window !== "undefined" && window.location.pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="flex items-center gap-1.5 group cursor-pointer select-none"
        >
          <span
            className={`font-serif italic tracking-tight text-white transition-all duration-500 hover:text-lime-400 ${
              isScrolled ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
            }`}
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            preppath
          </span>
          {isScrolled && (
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400 inline-block shadow-[0_0_8px_rgba(163,230,53,0.9)] animate-pulse" />
          )}
        </Link>

        {/* CTA Button: Start Learning */}
        <button
          onClick={handleStartLearning}
          className={`liquid-glass group inline-flex items-center gap-1.5 rounded-full text-white font-medium hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer shadow-md ${
            isScrolled
              ? "px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold"
              : "px-6 py-2.5 text-sm"
          }`}
        >
          <span>Start Learning</span>
          <ArrowRight
            className={`text-lime-400 group-hover:translate-x-0.5 transition-transform ${
              isScrolled ? "w-3.5 h-3.5" : "w-4 h-4 hidden sm:inline-block"
            }`}
          />
        </button>
      </div>
    </header>
  );
}
