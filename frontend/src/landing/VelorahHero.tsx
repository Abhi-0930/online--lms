"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function VelorahHero({ onBeginJourney }: { onBeginJourney?: () => void }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    router.prefetch("/dashboard");
    router.prefetch("/login");
  }, [router]);

  const handleAction = () => {
    if (onBeginJourney) {
      onBeginJourney();
    } else if (isAuthenticated || user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex flex-col justify-between select-none"
      style={{
        backgroundColor: "hsl(201 100% 13%)",
        color: "hsl(0 0% 100%)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* 1. Fullscreen Looping Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
      />

      {/* 2. Glassmorphic Navigation Bar */}
      <header className="relative z-10 w-full">
        <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
          {/* Logo */}
          <Link
            href="/"
            className="text-3xl tracking-tight text-white cursor-pointer hover:opacity-90 transition-opacity"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            preppath
          </Link>

          {/* Navigation Links (Hidden on Mobile, md:flex) */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm text-white font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="/landing#courses"
              className="text-sm text-[#a1a1aa] hover:text-white transition-colors"
            >
              Courses
            </Link>
            <Link
              href="/landing#stories"
              className="text-sm text-[#a1a1aa] hover:text-white transition-colors"
            >
              Success Stories
            </Link>
            <Link
              href="/landing#testimonials"
              className="text-sm text-[#a1a1aa] hover:text-white transition-colors"
            >
              Testimonials
            </Link>
            <Link
              href="/landing#contact"
              className="text-sm text-[#a1a1aa] hover:text-white transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Top Right Liquid Glass CTA Button */}
          <button
            onClick={handleAction}
            className="liquid-glass rounded-full px-6 py-2.5 text-sm text-white font-medium hover:scale-[1.03] transition-transform duration-200 cursor-pointer"
          >
            Start Learning
          </button>
        </nav>
      </header>

      {/* 3. Cinematic Vertically Centered Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-32 pb-40 py-[90px] max-w-7xl mx-auto">
        {/* H1 Heading with Contrast Typography */}
        <h1
          className="animate-fade-rise text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-[-2.46px] max-w-7xl font-normal text-white"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Where{" "}
          <em className="not-italic text-[#a1a1aa] inline">ambition</em>{" "}
          finds its{" "}
          <em className="not-italic text-[#a1a1aa] inline">path.</em>
        </h1>

        {/* Cinematic Subtext */}
        <p className="animate-fade-rise-delay text-[#a1a1aa] text-base sm:text-lg max-w-2xl mt-8 leading-relaxed font-normal">
          For those who aspire to learn, build, and grow. Develop real-world skills through structured learning, hands-on practice, and a community committed to progress.
        </p>

        {/* Hero Main Liquid Glass CTA Button */}
        <button
          onClick={handleAction}
          className="animate-fade-rise-delay-2 liquid-glass rounded-full px-14 py-5 text-base text-white font-medium mt-12 hover:scale-[1.03] transition-transform duration-200 cursor-pointer"
        >
          Start Learning
        </button>
      </main>
    </div>
  );
}
