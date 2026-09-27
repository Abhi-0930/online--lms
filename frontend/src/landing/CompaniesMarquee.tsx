"use client";

import React, { useState } from "react";
import { UsersIcon } from "@/components/animate-ui/icons/users";
import { ChartNoAxesColumnIncreasingIcon } from "@/components/animate-ui/icons/chart-no-axes-column-increasing";
import { SparklesIcon } from "@/components/animate-ui/icons/sparkles";

export interface Company {
  name: string;
  logo: string;
  domain?: string;
}

export const ALL_COMPANIES: Company[] = [
  {
    name: "Google",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    domain: "google.com",
  },
  {
    name: "Microsoft",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
    domain: "microsoft.com",
  },
  {
    name: "Amazon",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    domain: "amazon.com",
  },
  {
    name: "Meta",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
    domain: "meta.com",
  },
  {
    name: "Apple",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    domain: "apple.com",
  },
  {
    name: "Netflix",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    domain: "netflix.com",
  },
  {
    name: "Uber",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png",
    domain: "uber.com",
  },
  {
    name: "Stripe",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
    domain: "stripe.com",
  },
  {
    name: "Atlassian",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Atlassian-Logo.svg",
    domain: "atlassian.com",
  },
  {
    name: "Spotify",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
    domain: "spotify.com",
  },
  {
    name: "Adobe",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Adobe_Inc._logo.svg",
    domain: "adobe.com",
  },
  {
    name: "Nvidia",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg",
    domain: "nvidia.com",
  },
  {
    name: "Salesforce",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg",
    domain: "salesforce.com",
  },
  {
    name: "Goldman Sachs",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/61/Goldman_Sachs.svg",
    domain: "goldmansachs.com",
  },
  {
    name: "Razorpay",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg",
    domain: "razorpay.com",
  },
  {
    name: "Swiggy",
    logo: "https://upload.wikimedia.org/wikipedia/en/1/12/Swiggy_logo.svg",
    domain: "swiggy.com",
  },
  {
    name: "Zomato",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Zomato_Logo.svg",
    domain: "zomato.com",
  },
  {
    name: "Airbnb",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg",
    domain: "airbnb.com",
  },
  {
    name: "Snowflake",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Snowflake_Inc._logo.svg",
    domain: "snowflake.com",
  },
  {
    name: "Cisco",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg",
    domain: "cisco.com",
  },
  {
    name: "Oracle",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg",
    domain: "oracle.com",
  },
  {
    name: "Flipkart",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Flipkart_logo.svg",
    domain: "flipkart.com",
  },
  {
    name: "LinkedIn",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/aa/LinkedIn_2021.svg",
    domain: "linkedin.com",
  },
  {
    name: "Databricks",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/63/Databricks_Logo.png",
    domain: "databricks.com",
  },
];

function CompanyLogoItem({ company }: { company: Company }) {
  const [imgError, setImgError] = useState(false);
  const [useFavicon, setUseFavicon] = useState(false);

  const handleError = () => {
    if (!useFavicon && company.domain) {
      setUseFavicon(true);
    } else {
      setImgError(true);
    }
  };

  const imageSrc = useFavicon
    ? `https://www.google.com/s2/favicons?domain=${company.domain}&sz=128`
    : company.logo;

  if (imgError) {
    return null;
  }

  return (
    <div className="flex items-center justify-center px-4 sm:px-6 shrink-0 transition-transform duration-300 hover:scale-110 cursor-pointer">
      <img
        src={imageSrc}
        alt={`${company.name} logo`}
        onError={handleError}
        className="h-7 sm:h-8 md:h-9 max-w-[110px] sm:max-w-[130px] md:max-w-[150px] w-auto object-contain select-none"
        loading="lazy"
      />
    </div>
  );
}

export function CompaniesMarquee() {
  // Triple items for continuous, uninterrupted seamless loop
  const marqueeItems = [...ALL_COMPANIES, ...ALL_COMPANIES, ...ALL_COMPANIES];

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-white via-slate-50/60 to-white border-y border-slate-200/60 overflow-hidden relative select-none">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10 relative z-10">
        {/* Section Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-display">
          Where Our Learners{" "}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
            Work
          </span>
        </h2>

        {/* Subtitle */}
        <p className="mt-3.5 max-w-2xl mx-auto text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
          Our alumni build scalable systems, lead engineering teams, and drive impact at world-class tech leaders and high-growth unicorns.
        </p>

        {/* Quick Highlights Strip */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-bold text-slate-700">
          <div className="group flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-blue-300 transition-all duration-300 cursor-pointer">
            <UsersIcon size={18} animateOnHover className="text-blue-600 group-hover:scale-110 transition-transform" />
            <span>500+ Hiring Partners</span>
          </div>
          <div className="group flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-emerald-300 transition-all duration-300 cursor-pointer">
            <ChartNoAxesColumnIncreasingIcon size={18} animateOnHover className="text-emerald-600 group-hover:scale-110 transition-transform" />
            <span>168% Avg. Salary Hike</span>
          </div>
          <div className="group flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-indigo-300 transition-all duration-300 cursor-pointer">
            <SparklesIcon size={18} animateOnHover className="text-indigo-600 group-hover:scale-110 transition-transform" />
            <span>96% Placement Success Rate</span>
          </div>
        </div>
      </div>

      {/* Side gradient blur masks for smooth edge fading */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-r from-white via-white/80 to-transparent z-20" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-l from-white via-white/80 to-transparent z-20" />

      {/* Single Marquee Track without bounding boxes, full color, relaxed speed */}
      <div className="relative">
        <div
          className="flex w-max animate-marquee hover:[animation-play-state:paused] items-center gap-10 sm:gap-14 md:gap-16"
          style={{ animationDuration: "65s" }}
        >
          {marqueeItems.map((company, index) => (
            <CompanyLogoItem
              key={`marquee-${company.name}-${index}`}
              company={company}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
