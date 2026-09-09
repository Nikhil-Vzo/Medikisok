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
      title={isHighContrast ? "High Contrast Mode: ON (Click to turn off)" : "High Contrast Mode: OFF (Click to turn on)"}
      aria-label={isHighContrast ? "Disable high contrast dark mode" : "Enable high contrast dark mode"}
      aria-pressed={isHighContrast}
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-all cursor-pointer select-none shrink-0 shadow-2xs active:scale-95
        ${isHighContrast
          ? "border-emerald-400 bg-emerald-950 text-emerald-300 hover:bg-emerald-900 shadow-xs ring-1 ring-emerald-400"
          : "border-slate-200 bg-white text-slate-700 hover:text-emerald-900 hover:border-emerald-300 hover:bg-emerald-50/60"
        }
        focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${className}`}
    >
      <Contrast className={`w-4 h-4 ${isHighContrast ? "text-emerald-300" : "text-emerald-700"}`} aria-hidden="true" />
      {isHighContrast && (
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
      )}
    </button>
  );
}
