"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { VelorahHero, HeroScrollDemo, CompaniesMarquee, SuccessStories, WhyChooseUs } from "@/landing";
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
    if (isAuthenticated || user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] overflow-x-hidden">
      <VelorahHero onBeginJourney={handleBeginJourney} />
      <HeroScrollDemo />
      <CompaniesMarquee />
      <SuccessStories />
      <WhyChooseUs />
    </div>
  );
}


