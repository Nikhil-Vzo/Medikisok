"use client";

import * as React from "react";
import { Contrast } from "lucide-react";
import { useHighContrast } from "@/hooks/useHighContrast";

interface HighContrastToggleProps {
  className?: string;
}

export function HighContrastToggle({ className = "" }: HighContrastToggleProps) {
  const { isHighContrast, toggle } = useHighContrast();

  return (
    <button
      onClick={toggle}
      aria-label={isHighContrast ? "Disable high contrast mode" : "Enable high contrast mode"}
      aria-pressed={isHighContrast}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all font-semibold text-xs
        ${isHighContrast
          ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
          : "border-emerald-200 bg-white text-emerald-900 hover:border-emerald-500 hover:bg-emerald-50"
        }
        focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${className}`}
    >
      <Contrast className={`w-3.5 h-3.5 ${isHighContrast ? "text-white" : "text-emerald-700"}`} aria-hidden="true" />
      <span>{isHighContrast ? "Normal Contrast" : "High Contrast"}</span>
    </button>
  );
}
