"use client";

import React, { useState, useEffect } from "react";

export interface CompanyItem {
  name: string;
  domain: string;
}

export const POPULAR_COMPANIES: CompanyItem[] = [
  { name: "Google", domain: "google.com" },
  { name: "Microsoft", domain: "microsoft.com" },
  { name: "Amazon", domain: "amazon.com" },
  { name: "Apple", domain: "apple.com" },
  { name: "Meta", domain: "meta.com" },
  { name: "Netflix", domain: "netflix.com" },
  { name: "Adobe", domain: "adobe.com" },
  { name: "Salesforce", domain: "salesforce.com" },
  { name: "TCS", domain: "tcs.com" },
  { name: "Infosys", domain: "infosys.com" },
  { name: "Wipro", domain: "wipro.com" },
  { name: "Accenture", domain: "accenture.com" },
  { name: "Deloitte", domain: "deloitte.com" },
  { name: "Capgemini", domain: "capgemini.com" },
  { name: "Cognizant", domain: "cognizant.com" },
  { name: "IBM", domain: "ibm.com" },
];

export const MORE_COMPANIES: CompanyItem[] = [
  { name: "Uber", domain: "uber.com" },
  { name: "Oracle", domain: "oracle.com" },
  { name: "Cisco", domain: "cisco.com" },
  { name: "Intel", domain: "intel.com" },
  { name: "Nvidia", domain: "nvidia.com" },
  { name: "Walmart", domain: "walmart.com" },
  { name: "Flipkart", domain: "flipkart.com" },
  { name: "Swiggy", domain: "swiggy.com" },
  { name: "Zomato", domain: "zomato.com" },
  { name: "Razorpay", domain: "razorpay.com" },
  { name: "Atlassian", domain: "atlassian.com" },
  { name: "Stripe", domain: "stripe.com" },
  { name: "PayPal", domain: "paypal.com" },
  { name: "Spotify", domain: "spotify.com" },
  { name: "LinkedIn", domain: "linkedin.com" },
  { name: "Goldman Sachs", domain: "goldmansachs.com" },
  { name: "Morgan Stanley", domain: "morganstanley.com" },
  { name: "JP Morgan", domain: "jpmorgan.com" },
  { name: "ByteDance", domain: "bytedance.com" },
  { name: "Twitter / X", domain: "x.com" },
  { name: "Airbnb", domain: "airbnb.com" },
  { name: "Palantir", domain: "palantir.com" },
  { name: "Dropbox", domain: "dropbox.com" },
  { name: "Zoom", domain: "zoom.us" },
  { name: "Slack", domain: "slack.com" },
  { name: "GitHub", domain: "github.com" },
  { name: "Pinterest", domain: "pinterest.com" },
  { name: "Snapchat", domain: "snapchat.com" },
  { name: "Tesla", domain: "tesla.com" },
  { name: "Qualcomm", domain: "qualcomm.com" },
  { name: "AMD", domain: "amd.com" },
  { name: "Intuit", domain: "intuit.com" },
  { name: "eBay", domain: "ebay.com" },
  { name: "Shopify", domain: "shopify.com" },
  { name: "Twilio", domain: "twilio.com" },
  { name: "Databricks", domain: "databricks.com" },
  { name: "Snowflake", domain: "snowflake.com" },
];

export const ALL_COMPANIES: CompanyItem[] = [
  ...POPULAR_COMPANIES,
  ...MORE_COMPANIES,
];

const KNOWN_DOMAINS: Record<string, string> = {
  google: "google.com",
  microsoft: "microsoft.com",
  amazon: "amazon.com",
  apple: "apple.com",
  meta: "meta.com",
  facebook: "meta.com",
  netflix: "netflix.com",
  adobe: "adobe.com",
  salesforce: "salesforce.com",
  tcs: "tcs.com",
  "tata consultancy services": "tcs.com",
  infosys: "infosys.com",
  wipro: "wipro.com",
  accenture: "accenture.com",
  deloitte: "deloitte.com",
  capgemini: "capgemini.com",
  cognizant: "cognizant.com",
  ibm: "ibm.com",
  uber: "uber.com",
  oracle: "oracle.com",
  cisco: "cisco.com",
  intel: "intel.com",
  nvidia: "nvidia.com",
  walmart: "walmart.com",
  flipkart: "flipkart.com",
  swiggy: "swiggy.com",
  zomato: "zomato.com",
  razorpay: "razorpay.com",
  atlassian: "atlassian.com",
  stripe: "stripe.com",
  paypal: "paypal.com",
  spotify: "spotify.com",
  linkedin: "linkedin.com",
  "goldman sachs": "goldmansachs.com",
  "morgan stanley": "morganstanley.com",
  "jp morgan": "jpmorgan.com",
  "jpmorgan chase": "jpmorgan.com",
  bytedance: "bytedance.com",
  twitter: "x.com",
  "twitter / x": "x.com",
  x: "x.com",
  airbnb: "airbnb.com",
  palantir: "palantir.com",
  dropbox: "dropbox.com",
  zoom: "zoom.us",
  slack: "slack.com",
  github: "github.com",
  pinterest: "pinterest.com",
  snapchat: "snapchat.com",
  tesla: "tesla.com",
  qualcomm: "qualcomm.com",
  amd: "amd.com",
  intuit: "intuit.com",
  ebay: "ebay.com",
  shopify: "shopify.com",
  twilio: "twilio.com",
  databricks: "databricks.com",
  snowflake: "snowflake.com",
};

export function getCompanyDomain(name: string): string {
  if (!name) return "";
  const normalized = name.toLowerCase().trim();
  if (KNOWN_DOMAINS[normalized]) {
    return KNOWN_DOMAINS[normalized];
  }
  const clean = normalized.replace(/[^a-z0-9]/g, "");
  return clean ? `${clean}.com` : "google.com";
}

const MONOGRAM_PALETTES = [
  { bg: "bg-blue-50 dark:bg-blue-950/50", text: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
  { bg: "bg-indigo-50 dark:bg-indigo-950/50", text: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-200 dark:border-indigo-800" },
  { bg: "bg-purple-50 dark:bg-purple-950/50", text: "text-purple-600 dark:text-purple-400", border: "border-purple-200 dark:border-purple-800" },
  { bg: "bg-emerald-50 dark:bg-emerald-950/50", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800" },
  { bg: "bg-amber-50 dark:bg-amber-950/50", text: "text-amber-600 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800" },
  { bg: "bg-rose-50 dark:bg-rose-950/50", text: "text-rose-600 dark:text-rose-400", border: "border-rose-200 dark:border-rose-800" },
  { bg: "bg-cyan-50 dark:bg-cyan-950/50", text: "text-cyan-600 dark:text-cyan-400", border: "border-cyan-200 dark:border-cyan-800" },
  { bg: "bg-teal-50 dark:bg-teal-950/50", text: "text-teal-600 dark:text-teal-400", border: "border-teal-200 dark:border-teal-800" },
];

export function getMonogramPalette(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % MONOGRAM_PALETTES.length;
  return MONOGRAM_PALETTES[index];
}

export function getCompanyInitial(name: string) {
  const cleanName = name.trim();
  return cleanName ? cleanName.charAt(0).toUpperCase() : "C";
}

interface CompanyLogoProps {
  name: string;
  domain?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export function CompanyLogo({
  name,
  domain,
  size = "md",
  className = "",
}: CompanyLogoProps) {
  const primaryDomain = domain || getCompanyDomain(name);
  const [imgSrc, setImgSrc] = useState<string>(
    `https://logo.clearbit.com/${primaryDomain}`
  );
  const [hasTriedFavicon, setHasTriedFavicon] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(`https://logo.clearbit.com/${primaryDomain}`);
    setHasTriedFavicon(false);
    setHasError(false);
  }, [primaryDomain]);

  const handleError = () => {
    if (!hasTriedFavicon) {
      setHasTriedFavicon(true);
      setImgSrc(`https://www.google.com/s2/favicons?domain=${primaryDomain}&sz=128`);
    } else {
      setHasError(true);
    }
  };

  const sizeClasses = {
    xs: "w-4 h-4 text-[9px] rounded-xs",
    sm: "w-5 h-5 text-[10px] rounded-sm",
    md: "w-6 h-6 text-[12px] rounded-md",
    lg: "w-8 h-8 text-[14px] rounded-lg",
  };

  if (hasError) {
    const palette = getMonogramPalette(name);
    return (
      <div
        className={`${sizeClasses[size]} ${palette.bg} border ${palette.border} flex items-center justify-center ${palette.text} font-bold shrink-0 select-none shadow-2xs ${className}`}
      >
        {getCompanyInitial(name)}
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={`${name} logo`}
      onError={handleError}
      className={`${sizeClasses[size]} object-contain bg-white dark:bg-white/10 p-0.5 rounded-xs shrink-0 shadow-2xs ${className}`}
      loading="lazy"
    />
  );
}
