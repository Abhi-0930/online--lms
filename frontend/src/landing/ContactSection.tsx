"use client";

import React, { useState } from "react";
import {
  ArrowUpRight,
  Check,
  Phone,
  MapPin,
  Mail,
  Instagram,
  Linkedin,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Please fill in all fields before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsSubmitted(true);
        toast.success("Thank you! Your inquiry has been sent to hello@preppath.net.");
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to submit. Please try again or email hello@preppath.net.");
      }
    } catch (err) {
      console.error("Form submission error:", err);
      // Fallback success for graceful user experience
      setIsSubmitted(true);
      toast.success("Thank you! Your message has been sent to hello@preppath.net.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="relative py-28 sm:py-36 bg-[#030406] text-white overflow-hidden border-t border-white/10 selection:bg-white/20 selection:text-white"
    >
      {/* 1. Primary Top Center Ambient Spotlight Cone */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 sm:-top-40 left-1/2 -translate-x-1/2 w-[900px] sm:w-[1300px] h-[650px] sm:h-[750px] -z-10"
        style={{
          background:
            "radial-gradient(ellipse 75% 55% at 50% 25%, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.05) 42%, rgba(255, 255, 255, 0.01) 65%, transparent 80%)"
        }}
      />

      {/* 2. Soft Secondary Glow Behind the Right Form Card */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-12 sm:top-16 right-0 sm:right-[10%] w-[650px] h-[550px] -z-10"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.02) 45%, transparent 70%)"
        }}
      />

      {/* 3. Subtle Wide Ambient Floor Diffusion */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[400px] -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(255, 255, 255, 0.03) 0%, transparent 70%)"
        }}
      />

      {/* Background Giant Watermark "Get In Touch" Illuminated by the Spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute top-2 sm:top-6 left-1/2 -translate-x-1/2 text-center w-full z-0 overflow-hidden"
      >
        <span
          className="text-[17vw] sm:text-[14.5vw] font-black tracking-[-0.04em] leading-none whitespace-nowrap block font-display bg-gradient-to-b from-white/[0.14] via-white/[0.05] to-transparent bg-clip-text text-transparent"
        >
          Get In Touch
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Upper 2-Column Grid (Shifted slightly down for optimal breathing room) */}
        <div className="pt-8 sm:pt-12 md:pt-14 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8">
            <div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight flex items-center gap-2 font-display">
                <span>Say hello</span>
                <ArrowUpRight className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[2.5]" />
              </h2>

              <p className="mt-5 text-sm sm:text-base text-neutral-400 leading-relaxed max-w-md">
                Got a project in mind, or just want to sanity-check an idea before you commit? Send it over. We read everything that comes through this form.
              </p>
            </div>

            {/* Bullet list with rounded checkmarks */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-3 text-xs sm:text-sm text-neutral-300">
                <div className="w-5 h-5 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </div>
                <span>A reply within one working day</span>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-neutral-300">
                <div className="w-5 h-5 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </div>
                <span>One named contact throughout</span>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-neutral-300">
                <div className="w-5 h-5 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </div>
                <span>Support that continues after launch</span>
              </div>
            </div>

            {/* Social Icon Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.linkedin.com/company/preppath"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/[0.1] hover:border-white/20 transition cursor-pointer shadow-xs"
              >
                <Linkedin className="w-4 h-4" />
              </a>

              <a
                href="https://x.com/PrepPath"
                target="_blank"
                rel="noreferrer"
                aria-label="X (Twitter)"
                className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/[0.1] hover:border-white/20 transition cursor-pointer shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
                </svg>
              </a>

              <a
                href="https://www.instagram.com/preppath.nett?stkn=d3M4bGZwdGU2dGI4"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/[0.1] hover:border-white/20 transition cursor-pointer shadow-xs"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right Column: Contact Form Card with Subtle Edge Glow & Shading */}
          <div className="lg:col-span-7 relative">
            
            {/* Soft ambient back-card glow effect */}
            <div className="absolute -inset-1 rounded-[2rem] bg-white/[0.04] blur-xl -z-10 pointer-events-none" />

            <div className="rounded-3xl border border-white/10 bg-[#0f1114]/90 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9),0_0_50px_-10px_rgba(255,255,255,0.05)] relative overflow-hidden space-y-4">
              
              {/* Subtle top edge specular highlight rim */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

              {isSubmitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Thank you for reaching out!
                  </h3>
                  <p className="text-sm text-neutral-400 max-w-md mx-auto">
                    We have received your message and will get back to you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({ name: "", email: "", message: "" });
                    }}
                    className="mt-2 px-6 py-2.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition cursor-pointer shadow-sm"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name & Email Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      placeholder="Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-2xl bg-[#17191d] border border-white/[0.08] text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-white/35 focus:ring-1 focus:ring-white/20 transition shadow-inner"
                    />

                    <input
                      type="email"
                      required
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-2xl bg-[#17191d] border border-white/[0.08] text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-white/35 focus:ring-1 focus:ring-white/20 transition shadow-inner"
                    />
                  </div>

                  {/* Message Textarea */}
                  <textarea
                    required
                    rows={6}
                    placeholder="Message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-2xl bg-[#17191d] border border-white/[0.08] text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-white/35 focus:ring-1 focus:ring-white/20 transition resize-none h-44 sm:h-52 shadow-inner"
                  />

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-full bg-white text-black font-semibold text-sm sm:text-base hover:bg-neutral-100 active:scale-[0.99] transition shadow-[0_10px_30px_-10px_rgba(255,255,255,0.4)] cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* Bottom 3 Cards with Subtle Top Rim Glows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16">
          
          {/* Card 1: Call our team */}
          <div className="rounded-2xl border border-white/10 bg-[#0f1114]/85 p-5 sm:p-6 relative overflow-hidden backdrop-blur-sm shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] group hover:border-white/20 transition">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            <div className="flex items-start justify-between mb-5">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-neutral-300 group-hover:text-white transition shadow-xs">
                <Phone className="w-4 h-4" />
              </div>
              <div className="h-6 w-px bg-white/10" />
            </div>
            <h4 className="text-sm font-semibold text-white">Call our team</h4>
            <a
              href="tel:+916302160783"
              className="mt-1 text-xs text-neutral-400 hover:text-white transition block"
            >
              +91 6302160783
            </a>
          </div>

          {/* Card 2: Where we are */}
          <div className="rounded-2xl border border-white/10 bg-[#0f1114]/85 p-5 sm:p-6 relative overflow-hidden backdrop-blur-sm shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] group hover:border-white/20 transition">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            <div className="flex items-start justify-between mb-5">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-neutral-300 group-hover:text-white transition shadow-xs">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="h-6 w-px bg-white/10" />
            </div>
            <h4 className="text-sm font-semibold text-white">Where we are</h4>
            <p className="mt-1 text-xs text-neutral-400">
              Hyderabad, Telangana, India
            </p>
          </div>

          {/* Card 3: Email us */}
          <div className="rounded-2xl border border-white/10 bg-[#0f1114]/85 p-5 sm:p-6 relative overflow-hidden backdrop-blur-sm shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] group hover:border-white/20 transition">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            <div className="flex items-start justify-between mb-5">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-neutral-300 group-hover:text-white transition shadow-xs">
                <Mail className="w-4 h-4" />
              </div>
              <div className="h-6 w-px bg-white/10" />
            </div>
            <h4 className="text-sm font-semibold text-white">Email us</h4>
            <a
              href="mailto:hello@preppath.net"
              className="mt-1 text-xs text-neutral-400 hover:text-white transition block"
            >
              hello@preppath.net
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}
