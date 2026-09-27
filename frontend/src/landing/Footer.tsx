"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Github,
  Twitter,
  Linkedin,
  Youtube,
  Send,
  Heart,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    toast.success("Subscribed to the weekly engineering newsletter!");
  };

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800 relative select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Col 1 & 2: Brand Info & Newsletter */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/landing" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white font-display">
                PrepPath
              </span>
            </Link>

            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              The premier online learning platform for serious software engineers. Master algorithms, cloud architecture, generative AI, and crack FAANG-tier roles.
            </p>

            {/* Newsletter Form */}
            <div className="pt-2">
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                Subscribe to Weekly Tech Deep-Dives
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-slate-900 p-3 rounded-xl border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>You are subscribed to the weekly newsletter!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Join
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Col 3: Tracks */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Learning Tracks
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#courses" className="hover:text-white transition-colors">Data Structures & Algorithms</a></li>
              <li><a href="#courses" className="hover:text-white transition-colors">Full Stack Web Engineering</a></li>
              <li><a href="#courses" className="hover:text-white transition-colors">Frontend & 3D Interactive Web</a></li>
              <li><a href="#courses" className="hover:text-white transition-colors">Backend & Distributed Systems</a></li>
              <li><a href="#courses" className="hover:text-white transition-colors">AI & Generative AI Systems</a></li>
              <li><a href="#courses" className="hover:text-white transition-colors">Cloud & DevOps Engineering</a></li>
            </ul>
          </div>

          {/* Col 4: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#showcase" className="hover:text-white transition-colors">Browser Code Runner</a></li>
              <li><a href="#journey" className="hover:text-white transition-colors">8-Stage Roadmap</a></li>
              <li><a href="#projects" className="hover:text-white transition-colors">Student Projects</a></li>
              <li><a href="#stories" className="hover:text-white transition-colors">Alumni Wall</a></li>
              <li><a href="#instructors" className="hover:text-white transition-colors">Mentors</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ & Policies</a></li>
            </ul>
          </div>

          {/* Col 5: Resources & Status */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              System & Community
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#contact" className="hover:text-white transition-colors">Contact Support</a></li>
              <li><Link href="/" className="hover:text-white transition-colors">Student Portal Login</Link></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Book 1:1 Consultation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>

            <div className="pt-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>All Systems Operational (99.99%)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Socials */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 PrepPath Technologies Inc. Built with passion for world-class engineers.</p>

          <div className="flex items-center gap-4 text-slate-400">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
