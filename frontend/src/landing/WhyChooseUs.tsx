"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  GitFork,
  Laptop,
  Terminal,
  ClipboardCheck,
  Video,
  PlaySquare,
  UserCheck,
  MessagesSquare,
  Target,
  Sparkles
} from "lucide-react";
import { WHY_CHOOSE_US } from "./landingData";

const iconMap: Record<string, React.ElementType> = {
  GitFork,
  Laptop,
  Terminal,
  ClipboardCheck,
  Video,
  PlaySquare,
  UserCheck,
  MessagesSquare,
  Target
};

export function WhyChooseUs() {
  return (
    <section id="why-us" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built for Ambitious Engineers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Why High-Growth Developers Choose PrepPath
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            We eliminated the fluff, outdated theory, and isolated tutorials. Everything is built to simulate what top engineering teams expect on day one.
          </p>
        </div>

        {/* 9 Interactive 3D Depth Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY_CHOOSE_US.map((item, idx) => {
            const Icon = iconMap[item.icon] || Sparkles;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group relative p-7 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Subtle top card glow */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/0 to-transparent group-hover:via-blue-500 transition-all duration-300 rounded-t-2xl" />

                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center mb-5 transition-all duration-300 shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
                  <span>Learn more</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
