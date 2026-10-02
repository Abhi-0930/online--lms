"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export function Navbar({ onEnrollClick }: { onEnrollClick?: () => void }) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show when near the very top of the page
      if (currentScrollY <= 50) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY <= 0 ? 0 : currentScrollY;
        ticking = false;
        return;
      }

      const diff = currentScrollY - lastScrollY.current;

      // Threshold of 6px to avoid micro-jitter
      if (Math.abs(diff) > 6) {
        if (diff > 0) {
          // Scrolling down -> hide dynamic island
          setIsVisible(false);
        } else {
          // Scrolling up -> show dynamic island
          setIsVisible(true);
        }
        lastScrollY.current = currentScrollY;
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { name: "Courses", href: "#courses" },
    { name: "Success Stories", href: "#stories" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Contact", href: "#contact" },
  ];

  const scrollTo = (href: string) => {
    if (href === "#overview" || href === "#") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleStartLearning = () => {
    if (onEnrollClick) {
      onEnrollClick();
    } else {
      router.push("/login");
    }
  };

  return (
    <header
      className={`fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible
          ? "translate-y-0 opacity-100 scale-100 pointer-events-auto"
          : "-translate-y-28 opacity-0 scale-95 pointer-events-none"
      }`}
    >
      <div className="flex items-center justify-between gap-2.5 sm:gap-6 px-3.5 sm:px-5 py-2 rounded-full bg-slate-950/85 text-white backdrop-blur-2xl border border-white/15 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.6)] ring-1 ring-white/10 select-none">
        
        {/* Brand Logo with Serif Styling & Pulse Dot */}
        <Link
          href="/"
          onClick={(e) => {
            if (typeof window !== "undefined" && window.location.pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="flex items-center gap-1.5 group cursor-pointer pl-1 pr-1.5"
        >
          <span
            className="text-xl sm:text-2xl font-normal tracking-tight text-white group-hover:text-lime-400 transition-colors"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            preppath
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-lime-400 inline-block shadow-[0_0_8px_rgba(163,230,53,0.9)] animate-pulse" />
        </Link>

        {/* Center: Desktop Nav Links (Hidden on mobile) */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => scrollTo(link.href)}
              className="px-3 py-1 rounded-full text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              {link.name}
            </button>
          ))}
        </nav>

        {/* Right: Sign in + Start Learning Action */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex px-3 py-1.5 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            Sign in
          </Link>

          <button
            onClick={handleStartLearning}
            className="liquid-glass group inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold text-white hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-md"
          >
            <span>Start Learning</span>
            <ArrowRight className="w-3.5 h-3.5 text-lime-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

      </div>
    </header>
  );
}
