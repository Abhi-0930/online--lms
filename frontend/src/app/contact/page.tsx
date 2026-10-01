import React from "react";
import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Clock, MessageSquare } from "lucide-react";
import { ContactSection } from "@/landing/ContactSection";
import { Footer } from "@/landing/Footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-950 text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to PrepPath</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-950 text-white flex items-center justify-center font-bold text-xs">
              P
            </div>
            <span className="font-bold font-display text-slate-900">PrepPath</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12 sm:py-16 w-full space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-lime-100 text-lime-800 border border-lime-200 inline-block">
            We&apos;re Here to Help
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-950 tracking-tight">
            Contact PrepPath Support
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Have questions regarding our DSA curriculum, cohort schedules, mentorship, or enterprise training? Reach out and our engineering advisors will respond promptly.
          </p>
        </div>

        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Direct Email</h3>
            <p className="text-xs text-slate-500 mt-1 mb-3">For admissions, billing & general queries</p>
            <a href="mailto:support@preppath.net" className="text-sm font-semibold text-blue-600 hover:underline">
              support@preppath.net
            </a>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Response Time</h3>
            <p className="text-xs text-slate-500 mt-1 mb-3">Operating 7 days a week</p>
            <span className="text-sm font-semibold text-slate-800">Under 2 to 4 Hours</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Community Chat</h3>
            <p className="text-xs text-slate-500 mt-1 mb-3">Real-time doubt resolution</p>
            <Link href="/community" className="text-sm font-semibold text-purple-600 hover:underline">
              Join Discord / Forum &rarr;
            </Link>
          </div>
        </div>

        {/* Embedded Interactive Contact Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-10">
          <ContactSection />
        </div>
      </main>

      <Footer />
    </div>
  );
}
