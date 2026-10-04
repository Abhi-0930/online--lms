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
  tcs: "tata.com",
  "tata consultancy services": "tata.com",
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
  "cdk global": "cdkglobal.com",
  cdk: "cdkglobal.com",
  virtusa: "virtusa.com",
  cloudbridge: "cloudbridge.com",
  "standard group companies": "standardgroup.com",
  "standard group": "standardgroup.com",
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

// Crisp Vector SVGs for instant zero-latency loading on all devices
const INLINE_SVGS: Record<string, (cls: string) => React.ReactNode> = {
  google: (cls) => (
    <svg className={cls} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
    </svg>
  ),
  microsoft: (cls) => (
    <svg className={cls} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="9.5" height="9.5" fill="#F25022" />
      <rect x="12.5" y="2" width="9.5" height="9.5" fill="#7FBA00" />
      <rect x="2" y="12.5" width="9.5" height="9.5" fill="#00A4EF" />
      <rect x="12.5" y="12.5" width="9.5" height="9.5" fill="#FFB900" />
    </svg>
  ),
  amazon: (cls) => (
    <svg className={cls} viewBox="0 0 24 24" fill="none">
      <path d="M13.9 12.5c-.8 0-1.5-.4-1.5-1.2 0-1.1 1-1.5 2.3-1.5.7 0 1.2.1 1.6.2-.2 1.5-1.2 2.5-2.4 2.5zm3.6 4.3c-.2.2-.5.2-.7 0l-.8-.8c-.1-.1-.1-.2 0-.3 1-1 1.5-2 1.5-3.8V8.3c0-.9-.6-1.3-1.8-1.3-1.6 0-3 .6-3.8 1.4-.2.2-.3.1-.3 0l-.6-.8c-.1-.1 0-.3.2-.4 1.2-1 2.8-1.5 4.8-1.5 2 0 3.3.9 3.3 2.8v4.5c0 .7.3 1 .6 1.4.1.1.1.3 0 .4l-1.3 1.1zm-8.8-1c.2.1.3.1.5 0 2.2-1.3 5.4-1.9 8.2-1.9 3.7 0 6.6 1.2 8.7 3.3.2.2.4.2.5 0l1.1-1.1c.2-.2.1-.4 0-.5-2.4-2.3-5.7-3.7-9.8-3.7-3.1 0-6.6.7-9.1 2.2-.2.1-.3.3-.2.5l.1 1.2zm-.8-3.5c-.1.2.1.4.3.5 1.5.8 3.5 1.2 5.6 1.2 3.1 0 5.6-.9 7.4-2.5.2-.2.1-.4-.1-.5l-.8-.6c-.2-.1-.4-.1-.5.1-1.5 1.3-3.6 2-6.1 2-1.8 0-3.4-.3-4.7-1-.2-.1-.4 0-.5.2l-.6.7z" fill="#FF9900" />
      <path d="M22.5 17.5c-.2-.2-.8-.2-1.2-.1-.5.1-.8.4-.9.7 0 .1.1.2.2.2.4 0 .9-.2 1.3-.4.1-.1.7-.2.6-.4z" fill="#FF9900" />
    </svg>
  ),
  apple: (cls) => (
    <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.76 1.05-1.82.93-2.88-.91.04-2.01.61-2.65 1.37-.56.65-1.05 1.73-.92 2.76 1.02.08 2.02-.49 2.64-1.25z" />
    </svg>
  ),
  meta: (cls) => (
    <svg className={cls} viewBox="0 0 24 24" fill="none">
      <path d="M12 6.5C8.8 6.5 6.3 8.3 4.2 11.2 2.8 13.2 2 15 2 16.3c0 2.3 1.7 3.7 3.8 3.7 2.5 0 4.6-2 6.2-4.5 1.6 2.5 3.7 4.5 6.2 4.5 2.1 0 3.8-1.4 3.8-3.7 0-1.3-.8-3.1-2.2-5.1C17.7 8.3 15.2 6.5 12 6.5zm-5.7 11.3c-1.1 0-2-.7-2-1.8 0-.9.6-2.3 1.7-3.8 1.5-2.1 3.4-3.7 5.4-4.2-2.3 4.3-4 9.8-5.1 9.8zm11.4 0c-1.1 0-2.8-5.5-5.1-9.8 2 .5 3.9 2.1 5.4 4.2 1.1 1.5 1.7 2.9 1.7 3.8 0 1.1-.9 1.8-2 1.8z" fill="#0081FB" />
    </svg>
  ),
  netflix: (cls) => (
    <svg className={cls} viewBox="0 0 24 24" fill="none">
      <path d="M5.5 2H9v20l-3.5-.7V2z" fill="#E50914" />
      <path d="M15 2h3.5v20L15 21.3V2z" fill="#E50914" />
      <path d="M5.5 2h3.6l6 19.3-3.6.7L5.5 2z" fill="#B81D24" />
    </svg>
  ),
  adobe: (cls) => (
    <svg className={cls} viewBox="0 0 24 24" fill="none">
      <path d="M14.5 3H22v18L14.5 3zM9.5 3H2v18L9.5 3zM12 9.5l3.5 8.5h-2.5l-1-2.5h-2l1 2.5H8.5L12 9.5z" fill="#FF0000" />
    </svg>
  ),
  salesforce: (cls) => (
    <svg className={cls} viewBox="0 0 24 24" fill="none">
      <path d="M9.8 6.5a4.8 4.8 0 014.4-3 4.9 4.9 0 014.5 3 4.7 4.7 0 013.3 4.5 4.8 4.8 0 01-4 4.7 4.5 4.5 0 01-3.6 2.3 4.8 4.8 0 01-4.2-2.5 4.9 4.9 0 01-4.2.2 4.8 4.8 0 01-2-4.5 4.9 4.9 0 015.8-4.7z" fill="#00A1E0" />
    </svg>
  ),
  uber: (cls) => (
    <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 13.5h-9v-7h9v7zm-2-2v-3h-5v3h5z" />
    </svg>
  ),
  linkedin: (cls) => (
    <svg className={cls} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#0A66C2" />
      <path d="M7 10v7H4.5v-7H7zm-1.2-1.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zM19.5 17H17v-3.7c0-.9 0-2.1-1.3-2.1s-1.5 1-1.5 2v3.8h-2.5v-7h2.4v1h.1c.3-.6 1.1-1.2 2.3-1.2 2.5 0 2.9 1.6 2.9 3.8V17z" fill="#FFFFFF" />
    </svg>
  ),
  spotify: (cls) => (
    <svg className={cls} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#1ED760" />
      <path d="M16.5 15.2c-.2.3-.5.4-.8.2-2.2-1.3-4.9-1.6-8.2-.9-.3.1-.7-.1-.8-.4-.1-.3.1-.7.4-.8 3.5-.8 6.6-.5 9.1 1.1.3.2.4.5.3.8zm1.1-2.4c-.2.4-.7.5-1.1.3-2.5-1.5-6.3-2-9.2-1.1-.4.1-.9-.1-1-.5-.1-.4.1-.9.5-1 3.4-1 7.6-.5 10.5 1.3.4.1.5.6.3 1zm.1-2.5c-3-1.8-8-1.9-10.8-1.1-.5.1-1-.2-1.1-.7-.1-.5.2-1 .7-1.1 3.3-1 8.9-.8 12.3 1.3.4.3.6.8.3 1.3-.2.4-.8.5-1.4.3z" fill="#FFFFFF" />
    </svg>
  ),
  stripe: (cls) => (
    <svg className={cls} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="5" fill="#635BFF" />
      <path d="M14.5 10.5c0-.8-.7-1.2-1.8-1.2-1.2 0-2.5.4-3.5 1V8c1.1-.5 2.5-.7 3.8-.7 3.1 0 5 1.6 5 4.3 0 4.1-5.6 3.5-5.6 5.3 0 .9.8 1.2 2 1.2 1.4 0 2.9-.6 4-1.2v2.3c-1.3.6-2.8.8-4.2.8-3.2 0-5.3-1.6-5.3-4.3 0-4.4 5.6-3.7 5.6-5.4z" fill="#FFFFFF" />
    </svg>
  ),
  github: (cls) => (
    <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  ),
  tcs: (cls) => (
    <svg className={cls} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#005696" />
      <text x="50%" y="65%" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="900" fontFamily="sans-serif">TCS</text>
    </svg>
  ),
  infosys: (cls) => (
    <svg className={cls} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#007CC3" />
      <text x="50%" y="62%" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="800" fontFamily="sans-serif">INFY</text>
    </svg>
  ),
};

interface CompanyLogoProps {
  name: string;
  domain?: string;
  logoUrl?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function CompanyLogo({
  name,
  domain,
  logoUrl,
  size = "md",
  className = "",
}: CompanyLogoProps) {
  // Extract primary company name if comma-separated
  const cleanName = typeof name === "string" ? name.replace(/[\[\]"']/g, "").split(",")[0].trim() : "Company";
  const normalizedKey = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const primaryDomain = domain || getCompanyDomain(cleanName);

  const [imgFailed, setImgFailed] = useState(false);
  const [useFallbackCdn, setUseFallbackCdn] = useState(false);

  useEffect(() => {
    setImgFailed(false);
    setUseFallbackCdn(false);
  }, [cleanName, primaryDomain, logoUrl]);

  const sizeClasses = {
    xs: "w-3.5 h-3.5 text-[8px] rounded-xs",
    sm: "w-4.5 h-4.5 text-[9px] rounded-sm",
    md: "w-5.5 h-5.5 text-[11px] rounded-md",
    lg: "w-7 h-7 text-[13px] rounded-lg",
    xl: "w-9 h-9 text-[15px] rounded-xl",
  };

  const iconClass = `${sizeClasses[size]} shrink-0 select-none object-contain ${className}`;

  // 1. Check if high-perf inline SVG exists
  if (!logoUrl && INLINE_SVGS[normalizedKey]) {
    return <div className="inline-flex items-center justify-center shrink-0">{INLINE_SVGS[normalizedKey](iconClass)}</div>;
  }

  // 2. Check if primary image source failed -> Render Monogram
  if (imgFailed) {
    const palette = getMonogramPalette(cleanName);
    return (
      <div
        className={`${sizeClasses[size]} ${palette.bg} border ${palette.border} flex items-center justify-center ${palette.text} font-bold shrink-0 select-none shadow-2xs ${className}`}
        title={cleanName}
      >
        {getCompanyInitial(cleanName)}
      </div>
    );
  }

  // 3. Reliable Google Favicon CDN / custom logo URL
  const currentSrc = logoUrl
    ? (useFallbackCdn ? `https://www.google.com/s2/favicons?domain=${primaryDomain}&sz=128` : logoUrl)
    : (useFallbackCdn
        ? `https://unavatar.io/${primaryDomain}?fallback=false`
        : `https://www.google.com/s2/favicons?domain=${primaryDomain}&sz=128`);

  return (
    <img
      src={currentSrc}
      alt={`${cleanName} logo`}
      onError={() => {
        if (!useFallbackCdn) {
          setUseFallbackCdn(true);
        } else {
          setImgFailed(true);
        }
      }}
      className={`${sizeClasses[size]} object-contain bg-white dark:bg-white/10 p-0.5 rounded-xs shrink-0 shadow-2xs ${className}`}
      loading="lazy"
    />
  );
}
