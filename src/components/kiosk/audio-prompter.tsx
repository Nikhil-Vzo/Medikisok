"use client";

import * as React from "react";
import { Volume2, VolumeX, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { speak, speakWithBrowserTTS, stopAllAudio, setActiveAudio } from "@/lib/voice/bhashini";

// -----------------------------------------------------------------------
// Confirmation message map (Hindi, English, Bengali, Marathi, Tamil, Telugu, Maithili, Gujarati)
// -----------------------------------------------------------------------

const CONFIRMATION_MESSAGES: Record<string, Record<string, string>> = {
  session_start: {
    hi: "आपका सत्र शुरू हो गया। अब हम कुछ सवाल पूछेंगे।",
    en: "Your session has started. We will now ask you a few questions.",
    bn: "আপনার সেশন শুরু হয়েছে। এবার আমরা কিছু প্রশ্ন জিজ্ঞাসা করব।",
    mr: "तुमचे सत्र सुरू झाले आहे. आता आम्ही काही प्रश्न विचारू.",
    ta: "உங்கள் அமர்வு தொடங்கியது. இப்போது சில கேள்விகளைக் கேட்போம்.",
    te: "మీ సెషన్ ప్రారంభమైంది. ఇప్పుడు మేము కొన్ని ప్రశ్నలు అడుగుతాము.",
    mai: "अहाँक सत्र शुरू भऽ गेल। आब हम किछु प्रश्न पुछब.",
    gu: "તમારું સત્ર શરૂ થઈ ગયું છે. હવે અમે કેટલાક પ્રશ્નો પૂછીશું.",
  },
  language_selected: {
    hi: "भाषा चुन ली गई। आपकी पसंदीदा भाषा में बात करें।",
    en: "Language selected. Please speak in your preferred language.",
    bn: "ভাষা নির্বাচন করা হয়েছে। আপনার পছন্দের ভাষায় কথা বলুন।",
    mr: "भाषा निवडली गेली. आपल्या पसंतीच्या भाषेत बोला.",
    ta: "மொழி தேர்ந்தெடுக்கப்பட்டது. உங்கள் விருப்பமான மொழியில் பேசவும்.",
    te: "భాష ఎంచుకోబడింది. మీకు నచ్చిన భాషలో మాట్లాడండి.",
    mai: "भाषा चुन लेल गेल। अपन पसंदीदा भाषामे बाजू।",
    gu: "ભાષા પસંદ કરવામાં આવી છે. તમારી પસંદગીની ભાષામાં બોલો.",
  },
  consent_submitted: {
    hi: "आपकी सहमति दर्ज हो गई। धन्यवाद।",
    en: "Your consent has been recorded. Thank you.",
    bn: "আপনার সম্মতি রেকর্ড করা হয়েছে। ধন্যবাদ।",
    mr: "तुमची संमती नोंदवली गेली आहे. धन्यवाद.",
    ta: "உங்கள் ஒப்புதல் பதிவு செய்யப்பட்டது. நன்றி.",
    te: "మీ సమ్మతి నమోదు చేయబడింది. ధన్యవాదాలు.",
    mai: "अहाँक सहमति दर्ज भऽ गेल। धन्यवाद।",
    gu: "તમારી સંમતિ નોંધાઈ ગઈ છે. આભાર.",
  },
  vitals_confirmed: {
    hi: "आपके सभी जीवन-चिह्न दर्ज हो गए। बहुत अच्छे।",
    en: "All your vitals have been recorded. Very good.",
    bn: "আপনার সমস্ত ভাইটাল রেকর্ড করা হয়েছে। খুব ভালো।",
    mr: "तुमची सर्व लक्षणे नोंदवली गेली आहेत. खूप छान.",
    ta: "உங்கள் அனைத்து முக்கிய அளவீடுகளும் பதிவு செய்யப்பட்டன. மிக நன்று.",
    te: "మీ అన్ని ముఖ్య లక్షణాలు నమోదు చేయబడ్డాయి. చాలా మంచిది.",
    mai: "अहाँक सबहि जीवन-चिह्न दर्ज भऽ गेल। बहुत नीक।",
    gu: "તમારા તમામ વાઇટલ્સ નોંધાઈ ગયા છે. ખૂબ સરસ.",
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
  language: string = "en"
): void {
  if (typeof window === "undefined") return;

  const msg = CONFIRMATION_MESSAGES[action];
  if (!msg) return;

  const text = msg[language] || msg.en || msg.hi;
  // Cancel any ongoing speech or audio across the entire kiosk
  stopAllAudio();
  speak(text, language, { rate: 1.0 }).catch(() => {
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
  mai: { tag: "hi-IN", label: "मैथिली", voiceKeywords: ["maithili", "मैथिली", "hindi", "हिन्दी", "kalpana", "hemant", "swara"] },
  gu: { tag: "gu-IN", label: "ગુજરાતી", voiceKeywords: ["gujarati", "gu-in", "gu_in", "dhwani"] },
  kn: { tag: "kn-IN", label: "ಕನ್ನಡ", voiceKeywords: ["kannada", "kn-in", "kn_in", "gagan"] },
};

export const AudioPrompter: React.FC<AudioPrompterProps> = ({
  textToSpeak,
  language = "en",
  autoPlay = true,
  className,
}) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const promptTokenRef = React.useRef(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const speakText = React.useCallback(
    async (text: string) => {
      if (typeof window === "undefined") return;
      if (isMuted || !text) return;

      // Unique token for this speech invocation
      const currentToken = ++promptTokenRef.current;

      // Cancel any ongoing browser speech synthesis or audio streams immediately
      stopAllAudio();

      if (audioRef.current) {
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }

      setIsPlaying(true);

      try {
        // 1. High-fidelity Indic audio stream from /api/voice/tts
        const cleanText = text.replace(/[#*_`]/g, "").replace(/\s+/g, " ").trim().slice(0, 200);
        if (cleanText) {
          const audioUrl = `/api/voice/tts?text=${encodeURIComponent(cleanText)}&lang=${encodeURIComponent(language)}`;
          const audio = new Audio(audioUrl);
          audio.playbackRate = 1.0; // Voice must ALWAYS be strictly 1x
          audioRef.current = audio;
          setActiveAudio(audio);

          audio.onended = () => {
            if (promptTokenRef.current === currentToken) {
              setIsPlaying(false);
              audioRef.current = null;
              setActiveAudio(null);
            }
          };
          audio.onerror = () => {
            if (promptTokenRef.current !== currentToken) return;
            setActiveAudio(null);
            speakWithBrowserTTS(text, language, { rate: 1.0 })
              .catch(() => {})
              .finally(() => {
                if (promptTokenRef.current === currentToken) setIsPlaying(false);
              });
          };

          await audio.play();
          return;
        }
      } catch (err: any) {
        if (promptTokenRef.current !== currentToken) return;
        setActiveAudio(null);
        if (err?.name === "NotAllowedError") {
          // Autoplay policy: waiting for user gesture/tap
          setIsPlaying(false);
          return;
        }
        // Fallback to browser TTS safely only if still the active prompt
        speakWithBrowserTTS(text, language, { rate: 1.0 })
          .catch(() => {})
          .finally(() => {
            if (promptTokenRef.current === currentToken) setIsPlaying(false);
          });
      }
    },
    [isMuted, language]
  );

  React.useEffect(() => {
    if (autoPlay && textToSpeak) {
      const timer = setTimeout(() => {
        speakText(textToSpeak);
      }, 250);
      return () => {
        clearTimeout(timer);
        promptTokenRef.current++;
        stopAllAudio();
      };
    }
  }, [textToSpeak, autoPlay, speakText]);

  // Stop any lingering audio on component unmount
  React.useEffect(() => {
    return () => {
      promptTokenRef.current++;
      stopAllAudio();
    };
  }, []);

  const toggleMute = () => {
    promptTokenRef.current++;
    if (isPlaying) {
      stopAllAudio();
      audioRef.current = null;
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
        title="Tap to listen to this question aloud (1.0x Natural Speed)"
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
            बोलकर सुनें ({currentLangLabel} · 1x)
          </span>
        )}
      </button>

      {/* Speed Rate Fixed Badge (Always 1x) & Mute */}
      <div className="flex items-center gap-1.5 border-l border-emerald-200 pl-2">
        <span
          className="px-2 py-0.5 rounded-md bg-white text-[11px] font-semibold text-emerald-900 border border-emerald-200"
          title="Voice Speed: 1.0x Natural Speed"
        >
          1.0x
        </span>

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
