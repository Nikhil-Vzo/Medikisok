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
      type="button"
      aria-label={isHighContrast ? "Disable high contrast dark mode" : "Enable high contrast dark mode"}
      aria-pressed={isHighContrast}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all font-semibold text-xs cursor-pointer select-none
        ${isHighContrast
          ? "border-emerald-400 bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900/90 shadow-xs ring-1 ring-emerald-400"
          : "border-emerald-200 bg-white text-emerald-900 hover:border-emerald-500 hover:bg-emerald-50"
        }
        focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${className}`}
    >
      <Contrast className={`w-3.5 h-3.5 ${isHighContrast ? "text-emerald-300" : "text-emerald-700"}`} aria-hidden="true" />
      <span>{isHighContrast ? "High Contrast: ON" : "High Contrast"}</span>
    </button>
  );
}
