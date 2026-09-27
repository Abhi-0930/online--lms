"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Code, Award, Building, BookOpen, Clock } from "lucide-react";
import { PLATFORM_STATS } from "./landingData";

function CounterItem({
  value,
  prefix = "",
  suffix = "",
  label,
  description,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  description: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    const intervalTime = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isInView, value]);

  const formattedCount =
    count >= 1000000
      ? (count / 1000000).toFixed(1) + "M"
      : count >= 1000
      ? (count / 1000).toFixed(count >= 10000 ? 0 : 1) + "K"
      : count.toString();

  return (
    <div
      ref={ref}
      className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all text-center flex flex-col justify-between"
    >
      <div>
        <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
          <span className="text-blue-600">{prefix}</span>
          {formattedCount}
          <span className="text-blue-600">{suffix}</span>
        </p>
        <h4 className="text-sm font-bold text-slate-800 mt-2">{label}</h4>
      </div>
      <p className="text-xs text-slate-500 mt-2">{description}</p>
    </div>
  );
}

export function PlatformStats() {
  return (
    <section className="py-20 bg-slate-50/50 border-y border-slate-200/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {PLATFORM_STATS.map((stat, i) => (
            <CounterItem
              key={i}
              value={stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
              label={stat.label}
              description={stat.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
