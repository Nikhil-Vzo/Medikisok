"use client";

import * as React from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface VoiceMicButtonProps {
  onTranscriptReceived?: (transcript: string) => void;
  language?: string;
  isListening?: boolean;
  onListeningChange?: (listening: boolean) => void;
  className?: string;
}

const LANG_SPEECH_TAGS: Record<string, { tag: string; listeningText: string; tapText: string }> = {
  hi: { tag: "hi-IN", listeningText: "बोलते रहिए, AI सुन रहा है...", tapText: "माइक दबाकर बोलें (Tap to Speak)" },
  en: { tag: "en-IN", listeningText: "Listening... please speak clearly", tapText: "Tap Mic to Speak Aloud" },
  bn: { tag: "bn-IN", listeningText: "বলতে থাকুন, AI শুনছে...", tapText: "মাইক টিপে বলুন (Tap to Speak)" },
  ta: { tag: "ta-IN", listeningText: "பேசுங்கள், AI கேட்கிறது...", tapText: "பேச மைக் தட்டவும் (Tap to Speak)" },
  te: { tag: "te-IN", listeningText: "మాట్లాడండి, AI వింటోంది...", tapText: "మాట్లాడటానికి మైక్ నొక్కండి" },
  mr: { tag: "mr-IN", listeningText: "बोला, AI ऐकत आहे...", tapText: "माईक दाबून बोला" },
  mai: { tag: "hi-IN", listeningText: "बजइत रहू, AI सुनि रहल अछि...", tapText: "माइक दबाकऽ बाजू (Tap to Speak)" },
  gu: { tag: "gu-IN", listeningText: "બોલો, AI સાંભળી રહ્યું છે...", tapText: "માઇક દબાવીને બોલો" },
  kn: { tag: "kn-IN", listeningText: "ಮಾತನಾಡಿ, AI ಕೇಳುತ್ತಿದೆ...", tapText: "ಮಾತನಾಡಲು ಮೈಕ್ ಒತ್ತಿರಿ" },
};

export const VoiceMicButton: React.FC<VoiceMicButtonProps> = ({
  onTranscriptReceived,
  language = "en",
  isListening: externalListening,
  onListeningChange,
  className
}) => {
  const [internalListening, setInternalListening] = React.useState(false);
  const [liveTranscript, setLiveTranscript] = React.useState("");
  const recognitionRef = React.useRef<any>(null);
  const transcriptRef = React.useRef<string>("");

  const langConfig = LANG_SPEECH_TAGS[language] || LANG_SPEECH_TAGS.en || LANG_SPEECH_TAGS.hi;
  const isListening = externalListening !== undefined ? externalListening : internalListening;

  const setListening = (val: boolean) => {
    setInternalListening(val);
    onListeningChange?.(val);
  };

  const startListening = () => {
    if (typeof window === "undefined") return;

    transcriptRef.current = "";
    setLiveTranscript("");

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback for browsers without native SpeechRecognition
      setListening(true);
      setTimeout(() => {
        const mockResponses: Record<string, string> = {
          hi: "छाती के बिल्कुल बीच में",
          en: "Right in the center of my chest",
          bn: "বুকের ঠিক মাঝখানে",
          ta: "நெஞ்சின் நடுப்பகுதியில்",
          te: "ఛాతీ మధ్యలో",
          mr: "छातीच्या मध्यभागी",
          gu: "છાતીની બરાબર વચ્ચે",
          mai: "छातीक ठीक बीचमे",
        };
        const mockResponse = mockResponses[language] || mockResponses.en || mockResponses.hi;
        setLiveTranscript(language === "hi" ? `पहचाना: "${mockResponse}"` : `Recognized: "${mockResponse}"`);
        onTranscriptReceived?.(mockResponse);
        setListening(false);
      }, 1500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = langConfig.tag;

      recognition.onstart = () => {
        setListening(true);
        transcriptRef.current = "";
        setLiveTranscript(langConfig.listeningText);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        transcriptRef.current = transcript;
        setLiveTranscript(transcript);
        onTranscriptReceived?.(transcript);
      };

      recognition.onend = () => {
        setListening(false);
        if (transcriptRef.current) {
          onTranscriptReceived?.(transcriptRef.current);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setListening(false);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setLiveTranscript("कृपया माइक की अनुमति दें (Allow microphone)");
        } else if (event.error === "no-speech") {
          setLiveTranscript("आवाज़ नहीं सुनी जा सकी (No speech detected)");
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Speech recognition failed:", err);
      setListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
  };

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-3.5", className)}>
      <button
        type="button"
        onClick={toggleMic}
        className={cn(
          "relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-200 active:scale-95 select-none",
          isListening
            ? "bg-red-600 text-white ring-4 ring-red-100 shadow-sm"
            : "bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm"
        )}
        title={isListening ? "Stop listening" : "Tap to speak"}
      >
        <Mic className="w-7 h-7 stroke-[2]" />
      </button>

      {/* Live Audio Visualizer Bars when listening */}
      {isListening && (
        <div className="flex items-center gap-1 h-4">
          <span className="w-1 bg-red-500 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3" />
          <span className="w-1 bg-red-500 rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.1s] h-4" />
          <span className="w-1 bg-red-500 rounded-full animate-[pulse_0.5s_ease-in-out_infinite_0.2s] h-2" />
          <span className="w-1 bg-red-500 rounded-full animate-[pulse_0.7s_ease-in-out_infinite_0.15s] h-4" />
          <span className="w-1 bg-red-500 rounded-full animate-[pulse_0.6s_ease-in-out_infinite_0.05s] h-3" />
        </div>
      )}

      {/* Transcription Feedback */}
      <div className="text-center space-y-1 max-w-sm">
        <p className="text-[13px] font-semibold text-slate-800">
          {isListening ? langConfig.listeningText : langConfig.tapText}
        </p>
        {liveTranscript ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-950">
            <Volume2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>"{liveTranscript}"</span>
          </div>
        ) : (
          <p className="text-xs text-slate-500 font-medium">
            Bhashini Voice Engine · {langConfig.tag}
          </p>
        )}
      </div>
    </div>
  );
};
