"use client";

import React, { useRef } from "react";
import { useScroll, useTransform, useSpring } from "framer-motion";
import { GoogleGeminiEffect } from "@/components/ui/google-gemini-effect";

export function GoogleGeminiEffectDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Spring smoothing for 60/120fps fluid non-lagging animation
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 35,
    mass: 0.15,
    restDelta: 0.0001,
  });

  // Snappy path transformations: sweeps across the entire screen swiftly without drag
  const pathLengthFirst = useTransform(smoothProgress, [0, 0.52], [0.2, 1.2]);
  const pathLengthSecond = useTransform(smoothProgress, [0, 0.52], [0.15, 1.2]);
  const pathLengthThird = useTransform(smoothProgress, [0, 0.52], [0.1, 1.2]);
  const pathLengthFourth = useTransform(smoothProgress, [0, 0.52], [0.05, 1.2]);
  const pathLengthFifth = useTransform(smoothProgress, [0, 0.52], [0, 1.2]);

  const handleBrowseCourses = () => {
    const el = document.getElementById("courses");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.hash = "courses";
    }
  };

  return (
    <div
      ref={ref}
      id="explore"
      className="h-[170vh] sm:h-[190vh] bg-black w-full relative pt-28 sm:pt-36 overflow-clip"
    >
      <GoogleGeminiEffect
        title="Still Exploring Where To Start?"
        description="Find the right learning path, explore courses, and start building skills that matter."
        buttonText="Browse Courses"
        onButtonClick={handleBrowseCourses}
        pathLengths={[
          pathLengthFirst,
          pathLengthSecond,
          pathLengthThird,
          pathLengthFourth,
          pathLengthFifth,
        ]}
      />
    </div>
  );
}

export const GeminiExploreSection = GoogleGeminiEffectDemo;

