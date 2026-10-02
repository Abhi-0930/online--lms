"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  ArrowRight,
  Sparkles,
  GraduationCap
} from "lucide-react";

export function Navbar({ onEnrollClick }: { onEnrollClick?: () => void }) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#overview" },
    { name: "Courses", href: "#courses" },
    { name: "Success Stories", href: "#stories" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Contact", href: "#contact" },
  ];

  const scrollTo = (href: string) => {
    setMobileMenuOpen(false);
    if (href === "#overview") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 py-4 sm:py-5 px-4 sm:px-6 lg:px-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo with Editorial Serif Vibe */}
          <Link href="/landing" className="flex items-center gap-2 group select-none">
            <span className="text-2xl sm:text-2xl font-normal tracking-tight font-serif italic text-slate-900 group-hover:text-lime-600 transition-colors">
              preppath
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-lime-500 mb-2 inline-block" />
          </Link>

          {/* Centered Floating Frosted Glass Pill Navigation Bar */}
          <nav className="hidden md:flex items-center gap-1 px-4 py-2 rounded-full bg-white/75 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => scrollTo(link.href)}
                className="px-3.5 py-1.5 rounded-full text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all cursor-pointer"
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            <Link
              href="/login"
              className="px-4 py-2 rounded-full text-[13px] font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              Sign in
            </Link>

            <button
              onClick={onEnrollClick || (() => scrollTo("#courses"))}
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-950 text-white hover:bg-slate-900 text-[13px] font-bold shadow-md shadow-slate-950/15 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Start Learning</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-lime-400" />
            </button>
          </div>

          {/* Mobile Hamburger Menu */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              className="p-2 rounded-full bg-white/90 border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-2xl pt-24 px-6 pb-8 flex flex-col justify-between md:hidden animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => scrollTo(link.href)}
                className="w-full flex items-center justify-between p-3.5 rounded-xl text-left text-base font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <span>{link.name}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>

          <div className="space-y-3 pt-6 border-t border-slate-200">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center py-3 rounded-full text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Student Portal Sign In
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onEnrollClick) onEnrollClick();
                else scrollTo("#courses");
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-slate-950 text-white text-sm font-bold shadow-lg"
            >
              <span>Explore All Tracks</span>
              <ArrowRight className="w-4 h-4 text-lime-400" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
