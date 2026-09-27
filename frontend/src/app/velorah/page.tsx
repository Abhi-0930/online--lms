"use client";

import React, { useState } from "react";
import { VelorahHero } from "@/landing";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { X, Sparkles, ArrowRight, Lock } from "lucide-react";

export default function VelorahPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleBeginJourney = () => {
    setModalOpen(true);
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setModalOpen(false);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    toast.success("Welcome to Velorah. Your access link has been dispatched.");
  };

  return (
    <>
      <VelorahHero onBeginJourney={handleBeginJourney} />

      {/* Access Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#0a1118] text-white rounded-3xl border border-white/15 p-8 shadow-2xl space-y-6">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div
                className="text-3xl tracking-tight text-white mb-2"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Velorah<sup className="text-xs ml-0.5 font-sans font-normal">®</sup>
              </div>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Join the private cohort of deep thinkers and creators building digital spaces for sharp focus.
              </p>
            </div>

            <form onSubmit={handleConfirm} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#a1a1aa] font-medium mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/40"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#a1a1aa] font-medium mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/40"
                />
              </div>

              <button
                type="submit"
                className="w-full liquid-glass rounded-full py-4 text-sm font-semibold text-white hover:scale-[1.02] transition-transform cursor-pointer"
              >
                Request Private Access
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#a1a1aa]/60 pt-2">
                <Lock className="w-3 h-3" />
                <span>Encrypted · Early Member Invitation</span>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
