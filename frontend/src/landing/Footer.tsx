"use client";

import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative bg-white text-slate-900 pt-20 sm:pt-24 pb-8 sm:pb-12 overflow-hidden border-t border-slate-100 select-none">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        
        {/* Top 5-Column Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 sm:gap-10 pb-16 sm:pb-20">
          
          {/* Col 1 & 2: Brand & Copyright */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              {/* Geometric Logo Mark */}
              <div className="w-8 h-8 rounded-lg bg-slate-950 text-white flex items-center justify-center font-black text-base shadow-sm">
                <span>P</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 font-display">
                PrepPath
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-500 max-w-xs leading-relaxed pt-1">
              © 2026 PrepPath. All rights reserved.
            </p>
          </div>

          {/* Col 2: Pages */}
          <div className="space-y-3.5">
            <h4 className="text-sm font-bold text-slate-950">Pages</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
              <li>
                <Link href="/about" className="hover:text-slate-950 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/instructors" className="hover:text-slate-950 transition-colors">
                  Our Instructors
                </Link>
              </li>
              <li>
                <a href="#courses" className="hover:text-slate-950 transition-colors">
                  All Courses
                </a>
              </li>
              <li>
                <a href="#stories" className="hover:text-slate-950 transition-colors">
                  Success Stories
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-slate-950 transition-colors">
                  Testimonials
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-slate-950 transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

            {/* Col 3: Socials */}
            <div className="space-y-3.5">
              <h4 className="text-sm font-bold text-slate-950">Socials</h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                <li>
                  <a
                    href="https://www.linkedin.com/company/preppath"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-slate-950 transition-colors"
                  >
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href="https://x.com/PrepPath"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-slate-950 transition-colors"
                  >
                    X (Twitter)
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.instagram.com/preppath.nett?stkn=d3M4bGZwdGU2dGI4"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-slate-950 transition-colors"
                  >
                    Instagram
                  </a>
                </li>
              </ul>
            </div>

          {/* Col 4: Legal & Policies */}
          <div className="space-y-3.5">
            <h4 className="text-sm font-bold text-slate-950">Legal</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
              <li>
                <Link href="/privacy" className="hover:text-slate-950 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-slate-950 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-slate-950 transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-slate-950 transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Register */}
          <div className="space-y-3.5">
            <h4 className="text-sm font-bold text-slate-950">Register</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
              <li>
                <Link href="/register" className="hover:text-slate-950 transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-slate-950 transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/forgot-password" className="hover:text-slate-950 transition-colors">
                  Forgot Password
                </Link>
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* Bottom Giant Brand Watermark (Exact match to reference image) */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none w-full text-center overflow-hidden -mb-4 sm:-mb-8 md:-mb-12 mt-4 sm:mt-8"
      >
        <span className="text-[17vw] sm:text-[15.5vw] font-black tracking-[-0.04em] text-[#ededed] leading-none whitespace-nowrap block font-display">
          PrepPath
        </span>
      </div>
    </footer>
  );
}
