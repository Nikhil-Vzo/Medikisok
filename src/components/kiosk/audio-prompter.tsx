"use client";

import * as React from "react";
import { Volume2, VolumeX, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { speak } from "@/lib/voice/bhashini";

// -----------------------------------------------------------------------
// Confirmation message map (Hindi + English)
// -----------------------------------------------------------------------

const CONFIRMATION_MESSAGES: Record<string, { hi: string; en: string }> = {
  session_start: {
    hi: "आपका सत्र शुरू हो गया। अब हम कुछ सवाल पूछेंगे।",
    en: "Your session has started. We will now ask you a few questions.",
  },
  language_selected: {
    hi: "भाषा चुन ली गई। आपकी पसंदीदा भाषा में बात करें।",
    en: "Language selected. Please speak in your preferred language.",
  },
  consent_submitted: {
    hi: "आपकी सहमति दर्ज हो गई। धन्यवाद।",
    en: "Your consent has been recorded. Thank you.",
  },
  vitals_confirmed: {
    hi: "आपके सभी जीवन-चिह्न दर्ज हो गए। बहुत अच्छे।",
    en: "All your vitals have been recorded. Very good.",
  },
};

export type KioskConfirmationAction = keyof typeof CONFIRMATION_MESSAGES;

// -----------------------------------------------------------------------
// Interruptible TTS confirmation — cancels previous speech on new action
// -----------------------------------------------------------------------

/**
 * Speak a short confirmation in the user's selected language.
 * Automatically cancels any in-progress speech before starting.
 * Uses bhashini.ts speak() so Bhashini API is preferred when configured.
 */
export function speakConfirmation(
  action: KioskConfirmationAction,
  language: string = "hi"
): void {
  if (typeof window === "undefined") return;

  const msg = CONFIRMATION_MESSAGES[action];
  if (!msg) return;

  const text = language === "en" ? msg.en : msg.hi;
  // Cancel any ongoing speech — ensures interruption on rapid successive actions
  window.speechSynthesis?.cancel();
  speak(text, language, { rate: 0.9 }).catch(() => {
    // Swallow errors — TTS confirmation is non-critical
  });
}

// -----------------------------------------------------------------------
// AudioPrompter Component
// -----------------------------------------------------------------------

export interface AudioPrompterProps {
  textToSpeak: string;
  language?: string;
  autoPlay?: boolean;
  className?: string;
}

const LANG_BCP47_MAP: Record<string, { tag: string; label: string; voiceKeywords: string[] }> = {
  hi: { tag: "hi-IN", label: "हिन्दी", voiceKeywords: ["hindi", "हिन्दी", "hemant", "kalpana", "swara", "madhur"] },
  en: { tag: "en-IN", label: "English", voiceKeywords: ["india", "indian", "en-in"] },
  bn: { tag: "bn-IN", label: "বাংলা", voiceKeywords: ["bengali", "bangla", "bn-in", "bn_in", "tapan"] },
  ta: { tag: "ta-IN", label: "தமிழ்", voiceKeywords: ["tamil", "ta-in", "ta_in", "valluvar"] },
  te: { tag: "te-IN", label: "తెలుగు", voiceKeywords: ["telugu", "te-in", "te_in", "chitra"] },
  mr: { tag: "mr-IN", label: "मराठी", voiceKeywords: ["marathi", "mr-in", "mr_in", "aarohi"] },
  gu: { tag: "gu-IN", label: "ગુજરાતી", voiceKeywords: ["gujarati", "gu-in", "gu_in", "dhwani"] },
  kn: { tag: "kn-IN", label: "ಕನ್ನಡ", voiceKeywords: ["kannada", "kn-in", "kn_in", "gagan"] },
};

export const AudioPrompter: React.FC<AudioPrompterProps> = ({
  textToSpeak,
  language = "hi",
  autoPlay = true,
  className,
}) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [speechRate, setSpeechRate] = React.useState(0.85); // 0.85x clear pacing

  const speakText = React.useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      if (isMuted || !text) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const langConfig = LANG_BCP47_MAP[language] || LANG_BCP47_MAP.hi;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechRate;
      utterance.pitch = 1.0;
      utterance.lang = langConfig.tag;

      // Match system voices for this Indian language
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const matchedVoice = voices.find((v) => {
          const vLang = v.lang.toLowerCase();
          const vName = v.name.toLowerCase();
          const matchesTag = vLang.startsWith(language) || vLang.replace("_", "-") === langConfig.tag.toLowerCase();
          const matchesKeyword = langConfig.voiceKeywords.some((kw) => vName.includes(kw));
          return matchesTag || matchesKeyword;
        });

        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
    },
    [isMuted, language, speechRate]
  );

  React.useEffect(() => {
    if (autoPlay && textToSpeak) {
      const timer = setTimeout(() => {
        speakText(textToSpeak);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [textToSpeak, autoPlay, speakText]);

  const toggleMute = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
    setIsMuted(!isMuted);
  };

  const handleReplay = () => {
    if (isMuted) setIsMuted(false);
    speakText(textToSpeak);
  };

  const currentLangLabel = LANG_BCP47_MAP[language]?.label || "हिन्दी";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-emerald-50/60 border border-emerald-200/80 shadow-xs transition-all duration-300",
        isPlaying && "ring-2 ring-emerald-500/30 bg-emerald-100/60",
        className
      )}
    >
      {/* Waveform Animation / Speaker Icon */}
      <button
        type="button"
        onClick={handleReplay}
        className="flex items-center gap-2 text-emerald-950 font-semibold text-xs hover:text-emerald-800 transition-colors"
        title="Tap to listen to this question aloud"
      >
        <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Volume2 className={cn("w-4 h-4", isPlaying && "")} />
        </div>

        {/* Live Speaking Indicator */}
        {isPlaying ? (
          <div className="flex items-center gap-1 h-4">
            <span className="w-1 bg-emerald-700 rounded-full animate-voice-wave" style={{ animationDelay: "0ms" }} />
            <span className="w-1 bg-emerald-700 rounded-full animate-voice-wave" style={{ animationDelay: "150ms" }} />
            <span className="w-1 bg-emerald-700 rounded-full animate-voice-wave" style={{ animationDelay: "300ms" }} />
            <span className="w-1 bg-emerald-700 rounded-full animate-voice-wave" style={{ animationDelay: "450ms" }} />
            <span className="text-xs font-semibold text-emerald-950 ml-1">बोल रहे हैं ({currentLangLabel})...</span>
          </div>
        ) : (
          <span className="text-xs font-semibold text-emerald-950 font-sans">
            बोलकर सुनें ({currentLangLabel} Audio)
          </span>
        )}
      </button>

      {/* Speed Rate Toggle & Mute */}
      <div className="flex items-center gap-1.5 border-l border-emerald-200 pl-2">
        <button
          type="button"
          onClick={() => {
            const nextRate = speechRate === 0.85 ? 0.7 : 0.85;
            setSpeechRate(nextRate);
            speakText(textToSpeak);
          }}
          className="px-2 py-0.5 rounded-md bg-white text-[11px] font-semibold text-emerald-900 border border-emerald-200 hover:bg-emerald-50"
          title="Speech Speed Rate"
        >
          {speechRate === 0.85 ? "0.85x" : "0.7x"}
        </button>

        <button
          type="button"
          onClick={toggleMute}
          className="p-1 rounded-md text-emerald-800 hover:text-emerald-950 transition-colors"
          title={isMuted ? "Unmute TTS" : "Mute TTS"}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-600" /> : <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />}
        </button>
      </div>
    </div>
  );
};
