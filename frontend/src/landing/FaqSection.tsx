"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2
} from "lucide-react";
import { FAQ_ITEMS } from "./landingData";

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id || null);
  const [helpfulFeedback, setHelpfulFeedback] = useState<Record<string, "yes" | "no">>({});

  const handleFeedback = (id: string, value: "yes" | "no") => {
    setHelpfulFeedback((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <section id="faq" className="py-20 sm:py-28 bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9]/50 to-[#ffffff] relative overflow-hidden">
      {/* Background Decorative Mesh Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-4 w-72 h-72 bg-sky-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Subtle Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none -z-10"
        style={{
          backgroundImage: `radial-gradient(#0f172a 1px, transparent 1px)`,
          backgroundSize: "28px 28px"
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            Frequently Asked{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600">
              Questions
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Have questions about our curriculum, live mentorship, placement support, or guarantee? 
            We have transparent answers ready for you.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3.5">
          {FAQ_ITEMS.map((faq, index) => {
            const isOpen = openId === faq.id;
            const feedback = helpfulFeedback[faq.id];

            return (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.02 }}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "bg-white border-blue-300 shadow-lg shadow-blue-500/5 ring-1 ring-blue-500/10"
                    : "bg-white/90 border-slate-200/90 hover:border-slate-300/90 hover:bg-white shadow-xs"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between p-5 text-left cursor-pointer gap-4"
                >
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug flex-1">
                    {faq.question}
                  </h3>

                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 ${
                      isOpen
                        ? "bg-blue-600 text-white rotate-180 shadow-xs"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="px-5 pb-5 pt-1 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100/90">
                        <p className="mt-3">{faq.answer}</p>

                        {/* Interactive Micro-Feedback */}
                        <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                          <span className="font-medium">Was this answer helpful?</span>
                          <div className="flex items-center gap-2">
                            {feedback ? (
                              <div className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Thank you for your feedback!</span>
                              </div>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleFeedback(faq.id, "yes")}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer font-medium"
                                >
                                  <ThumbsUp className="w-3 h-3 text-slate-500" />
                                  <span>Yes</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleFeedback(faq.id, "no")}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer font-medium"
                                >
                                  <ThumbsDown className="w-3 h-3 text-slate-500" />
                                  <span>No</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
