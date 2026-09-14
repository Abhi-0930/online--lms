"use client";

import React from "react";
import * as Flags from "country-flag-icons/react/3x2";

interface CountryFlagProps {
  code: string;
  className?: string;
  title?: string;
}

export function CountryFlag({
  code,
  className = "w-5 h-3.5",
  title,
}: CountryFlagProps) {
  const FlagComponent = (
    Flags as Record<
      string,
      React.ComponentType<{ className?: string; title?: string }>
    >
  )[code?.toUpperCase()];

  if (!FlagComponent) {
    return <span className="text-[14px]">🌐</span>;
  }

  return (
    <FlagComponent
      className={`inline-block object-cover rounded-[2px] shadow-xs shrink-0 ${className}`}
      title={title}
    />
  );
}
