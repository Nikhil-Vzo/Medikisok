"use client";

import * as React from "react";
import { Languages, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { INDIAN_LANGUAGES, LanguageOption } from "@/components/kiosk/language-selector";
import { stopAllAudio } from "@/lib/voice/bhashini";

export interface LanguageDropdownProps {
  currentLang: string;
  onSelect: (langCode: string) => void;
  className?: string;
}

export function LanguageDropdown({
  currentLang,
  onSelect,
  className
}: LanguageDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement | null>(null);

  const selectedOption =
    INDIAN_LANGUAGES.find((l) => l.code === currentLang) || INDIAN_LANGUAGES[0];

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Esc key
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleChoose = (code: string) => {
    stopAllAudio();
    onSelect(code);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title="Select Language (भाषा चुनें)"
        className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-800 text-xs font-semibold shadow-2xs transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      >
        <Languages className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
        <span className="font-bold text-slate-900">{selectedOption.nativeName}</span>
        <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
          ({selectedOption.name})
        </span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-slate-400 transition-transform duration-150 shrink-0",
            isOpen && "rotate-180 text-emerald-700"
          )}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Supported Languages"
          className="absolute right-0 mt-1.5 w-52 rounded-xl bg-white border border-emerald-100 shadow-xl shadow-slate-900/10 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
        >
          <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Select Language</span>
            <span className="text-emerald-700">{INDIAN_LANGUAGES.length} Languages</span>
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
            {INDIAN_LANGUAGES.map((lang: LanguageOption) => {
              const isSelected = lang.code === currentLang;
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleChoose(lang.code)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors select-none",
                    isSelected
                      ? "bg-emerald-50 text-emerald-950 font-bold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-emerald-900"
                  )}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-[13px] leading-tight">
                      {lang.nativeName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {lang.name}
                    </span>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
