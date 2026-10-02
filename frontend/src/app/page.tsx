"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Navbar,
  VelorahHero,
  HeroScrollDemo,
  CompaniesMarquee,
  SuccessStories,
  WhyChooseUs,
  CourseFolderSection,
  VideoTestimonials,
  CommunitySection,
  GeminiExploreSection,
  FaqSection,
  ContactSection,
  Footer,
} from "@/landing";
import { toast } from "sonner";

export default function RootHomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    router.prefetch("/dashboard");
    router.prefetch("/login");

    if (typeof window !== "undefined") {
      const isManual = sessionStorage.getItem("lms_manual_logout");
      if (isManual === "true") {
        sessionStorage.removeItem("lms_manual_logout");
        toast.success("You have been signed out successfully.");
      }
    }
  }, [router]);

  const handleBeginJourney = () => {
    const hasToken =
      typeof window !== "undefined" &&
      Boolean(
        localStorage.getItem("lms_access_token") ||
        localStorage.getItem("lms_active_session_token") ||
        sessionStorage.getItem("lms_session_token") ||
        localStorage.getItem("lms_user_profile")  
      );

    if ((isAuthenticated || user) && hasToken) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] overflow-x-clip">
      <Navbar onEnrollClick={handleBeginJourney} />
      <VelorahHero onBeginJourney={handleBeginJourney} />
      <HeroScrollDemo />
      <CompaniesMarquee />
      <SuccessStories />
      <WhyChooseUs />
      <CourseFolderSection />
      <VideoTestimonials />
      <CommunitySection />
      <FaqSection />
      <GeminiExploreSection />
      <ContactSection />
      <Footer />
    </div>
  );
}


