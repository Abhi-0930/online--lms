"use client";

import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

export function HeroScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-white text-slate-900 relative">
      {/* Ambient background soft light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-sky-200/50 via-blue-100/40 to-transparent blur-[120px] pointer-events-none rounded-full" />

      <ContainerScroll
        titleComponent={
          <div className="mb-4">
            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-semibold text-slate-900 tracking-tight">
              Unlock your potential through <br />
              <span className="text-3xl sm:text-4xl md:text-6xl lg:text-[5.5rem] font-extrabold mt-1 sm:mt-2 leading-tight md:leading-none bg-gradient-to-r from-slate-950 via-blue-900 to-indigo-800 bg-clip-text text-transparent inline-block">
                Learning
              </span>
            </h2>
          </div>
        }
      >
        <img
          src="/scroll-mockup.png"
          alt="LMS Platform Showcase"
          width={1672}
          height={941}
          className="rounded-lg sm:rounded-xl object-cover object-top w-full h-full shadow-md"
          draggable={false}
        />
      </ContainerScroll>
    </div>
  );
}
