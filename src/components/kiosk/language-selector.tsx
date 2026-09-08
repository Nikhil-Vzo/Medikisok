import * as React from "react";
import { Languages, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { stopAllAudio } from "@/lib/voice/bhashini";

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

export const INDIAN_LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "mai", name: "Maithili", nativeName: "मैथिली" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
];

export interface LanguageSelectorProps {
  currentLang: string;
  onSelect: (langCode: string) => void;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLang,
  onSelect,
  className
}) => {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4", className)}>
      {INDIAN_LANGUAGES.map((lang) => {
        const isSelected = currentLang === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => {
              stopAllAudio();
              onSelect(lang.code);
            }}
            className={cn(
              "flex items-center justify-between p-4 rounded-xl border font-medium transition-all text-left select-none active:scale-[0.98] min-h-[64px] focus:outline-none focus:ring-4 focus:ring-emerald-500/20",
              isSelected
                ? "border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-sm ring-1 ring-emerald-500"
                : "border-slate-200 bg-white text-slate-800 hover:border-emerald-300 hover:bg-emerald-50/30"
            )}
          >
            <div>
              <p className="text-base font-bold leading-tight">{lang.nativeName}</p>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">{lang.name}</p>
            </div>
            {isSelected && (
              <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
