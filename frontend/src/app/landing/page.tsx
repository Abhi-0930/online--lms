"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Navbar,
  HeroSection,
  CompaniesMarquee,
  LMSShowcase,
  LearningJourney,
  WhyChooseUs,
  CourseCategories,
  PlatformStats,
  StudentProjects,
  SuccessStories,
  VideoTestimonials,
  CommunitySection,
  InstructorSection,
  FaqSection,
  ContactSection,
  FinalCTA,
  Footer,
  VelorahHero,
  HeroScrollDemo,
  CourseCategory,
  COURSE_CATEGORIES,
} from "@/landing";
import {
  X,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Star
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    router.prefetch("/dashboard");
    router.prefetch("/login");
  }, [router]);

  const handleStartLearning = () => {
    if (isAuthenticated || user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  const [heroStyle, setHeroStyle] = useState<"velorah" | "editorial">("velorah");
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseCategory>(COURSE_CATEGORIES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrollForm, setEnrollForm] = useState({
    name: "",
    email: "",
    phone: "",
    coupon: "EARLY2026",
  });

  const handleOpenEnroll = (course?: CourseCategory) => {
    if (course) setSelectedCourse(course);
    setEnrollModalOpen(true);
  };

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollForm.name || !enrollForm.email) {
      toast.error("Please fill in your name and email");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setEnrollModalOpen(false);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
      });
      toast.success(`Welcome aboard, ${enrollForm.name}! Your enrollment for ${selectedCourse.title} has been confirmed. Check your email for orientation details.`);
    }, 1200);
  };

  return (
    <div className="relative min-h-screen bg-white text-slate-900 overflow-x-hidden font-sans">
      {/* Floating Hero Style Selector Pill */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-1.5 p-1.5 rounded-full bg-slate-950/90 border border-white/20 shadow-2xl backdrop-blur-xl text-white text-xs">
        <button
          onClick={() => setHeroStyle("velorah")}
          className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
            heroStyle === "velorah"
              ? "bg-white text-slate-950 shadow-xs"
              : "text-slate-400 hover:text-white"
          }`}
        >
          🎬 Velorah (Cinematic Video)
        </button>
        <button
          onClick={() => setHeroStyle("editorial")}
          className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
            heroStyle === "editorial"
              ? "bg-white text-slate-950 shadow-xs"
              : "text-slate-400 hover:text-white"
          }`}
        >
          ⚡ Layer Reveal (LMS)
        </button>
      </div>

      {/* Render Selected Hero */}
      {heroStyle === "velorah" ? (
        <VelorahHero onBeginJourney={handleStartLearning} />
      ) : (
        <>
          <Navbar onEnrollClick={() => handleOpenEnroll()} />
          <HeroSection onStartLearning={handleStartLearning} />
        </>
      )}

      {/* 2. Scroll-Based LMS Product Demo (Aceternity UI ContainerScroll) */}
      <HeroScrollDemo />

      {/* 3. Companies & Hiring Partners Marquee */}
      <CompaniesMarquee />

      {/* 4. LMS Interactive Showcase Tour */}
      <LMSShowcase />

      {/* 5. 8-Stage Learning Journey Roadmap */}
      <LearningJourney />

      {/* 6. Why Choose Us / Value Proposition */}
      <WhyChooseUs />

      {/* 7. Comprehensive Course Categories */}
      <CourseCategories onEnrollCourse={(c) => handleOpenEnroll(c)} />

      {/* 8. Platform Statistics Count-up */}
      <PlatformStats />

      {/* 9. Student Shipped Projects */}
      <StudentProjects />

      {/* 10. Alumni Success Stories & Placements */}
      <SuccessStories />

      {/* 11. Video Testimonials */}
      <VideoTestimonials />

      {/* 12. Vibrant Community Hub */}
      <CommunitySection onJoin={() => toast.success("Redirecting to PrepPath Discord community...")} />

      {/* 13. World-Class Instructors */}
      <InstructorSection />

      {/* 14. Frequently Asked Questions */}
      <FaqSection />

      {/* 15. Contact & Admissions Counseling */}
      <ContactSection />

      {/* 16. Final High-Impact CTA */}
      <FinalCTA onEnroll={() => handleOpenEnroll()} />

      {/* 17. Comprehensive SaaS Footer */}
      <Footer />

      {/* Global Quick Enrollment Modal */}
      {enrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white relative">
              <button
                onClick={() => setEnrollModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase mb-2">
                <Sparkles className="w-3 h-3" />
                <span>2026 Cohort Admission</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight">Fast-Track Enrollment</h3>
              <p className="text-blue-100 text-xs mt-0.5">
                Lock your batch seat with 100% money-back guarantee.
              </p>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEnrollSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Selected Course Track
                </label>
                <select
                  value={selectedCourse.id}
                  onChange={(e) => {
                    const found = COURSE_CATEGORIES.find((c) => c.id === e.target.value);
                    if (found) setSelectedCourse(found);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {COURSE_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.title} ({cat.duration})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohan Verma"
                  value={enrollForm.name}
                  onChange={(e) => setEnrollForm({ ...enrollForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rohan@example.com"
                  value={enrollForm.email}
                  onChange={(e) => setEnrollForm({ ...enrollForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={enrollForm.phone}
                  onChange={(e) => setEnrollForm({ ...enrollForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-blue-700">Coupon: EARLY2026 Applied</span>
                  <p className="text-[11px] text-blue-600">Flat 30% Early Bird Scholarship</p>
                </div>
                <span className="font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">
                  SAVED ₹12,000
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span>Securing Seat...</span>
                ) : (
                  <>
                    <span>Confirm Enrollment & Start Learning</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
                <Lock className="w-3 h-3" />
                <span>256-bit encrypted · 7-day 100% money back guarantee</span>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
