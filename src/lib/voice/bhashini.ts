/**
 * Bhashini ASR/TTS Integration
 *
 * Uses Bhashini API (https://bhashini.gov.in) for Indian language
 * speech-to-text (ASR) and text-to-speech (TTS) when credentials
 * are available. Falls back to Web Speech API (browser-native)
 * when BHASHINI_API_KEY is not set.
 *
 * Env vars required (add to .env.local):
 *   BHASHINI_API_KEY=your_bhashini_api_key
 *   BHASHINI_ENDPOINT=https://meity-auth.ulcacontrib.in  (or your regional endpoint)
 *
 * Bhashini API reference:
 *   ASR: POST {endpoint}/asr/v1/recognize  — audio/webm → {output[0].source}
 *   TTS: POST {endpoint}/tts/v1/convert    — {input, language} → audio/wav base64
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TranscribeResult {
  text: string;
  confidence: number;
  language: string;
}

export interface SpeakOptions {
  lang?: string;        // kiosk language code e.g. "hi", "en"
  rate?: number;        // speech rate 0.5–2.0 (default 0.85)
  pitch?: number;       // pitch 0.5–2.0 (default 1.0)
  volume?: number;      // volume 0–1 (default 1.0)
}

/** Language code to Bhashini-compatible code (ISO 639-1 → Bhashini code) */
export const BHASHINI_LANG_CODE: Record<string, string> = {
  hi: "hi",
  en: "en",
  bn: "bn",
  ta: "ta",
  te: "te",
  mr: "mr",
  mai: "mai",
  gu: "gu",
  kn: "kn",
  ml: "ml",
  pa: "pa",
};

// ---------------------------------------------------------------------------
// Config helpers
// ---------------------------------------------------------------------------

function getBhashiniConfig() {
  return {
    apiKey: process.env.BHASHINI_API_KEY,
    endpoint: process.env.BHASHINI_ENDPOINT ?? "https://meity-auth.ulcacontrib.in",
  };
}

function isBhashiniConfigured(): boolean {
  return Boolean(getBhashiniConfig().apiKey);
}

// ---------------------------------------------------------------------------
// Global Audio Coordinator — Prevents overlapping speech across the kiosk
// ---------------------------------------------------------------------------

let activeAudioElement: HTMLAudioElement | null = null;

/**
 * Halts all speech synthesis and HTML5 audio playback across the entire app.
 * Guarantees that at any given moment, only one voice can be speaking.
 */
export function stopAllAudio(): void {
  if (typeof window === "undefined") return;

  try {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  } catch {}

  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
      activeAudioElement.src = "";
    } catch {}
    activeAudioElement = null;
  }
}

/**
 * Register a newly started HTMLAudioElement so any subsequent audio call can stop it.
 */
export function setActiveAudio(audio: HTMLAudioElement | null): void {
  if (activeAudioElement && activeAudioElement !== audio) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
      activeAudioElement.src = "";
    } catch {}
  }
  activeAudioElement = audio;
}

// ---------------------------------------------------------------------------
// Browser Web Speech API fallbacks
// ---------------------------------------------------------------------------

/** BCP-47 tag for a given kiosk lang code */
function bcp47Tag(lang: string): string {
  const map: Record<string, string> = {
    hi: "hi-IN", en: "en-IN", bn: "bn-IN", ta: "ta-IN",
    te: "te-IN", mr: "mr-IN", mai: "hi-IN", gu: "gu-IN", kn: "kn-IN",
    ml: "ml-IN", pa: "pa-IN",
  };
  return map[lang] ?? "hi-IN";
}

/** Speak text using the browser's native Web Speech API (TTS fallback) */
export async function speakWithBrowserTTS(
  text: string,
  lang: string = "hi",
  options: SpeakOptions = {}
): Promise<void> {
  const { rate = 0.85, pitch = 1.0, volume = 1.0 } = options;

  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve();
      return;
    }

    stopAllAudio();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Try to find a suitable Indian-language voice
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const targetTag = bcp47Tag(lang).toLowerCase();
      const voiceKeywords: Record<string, string[]> = {
        hi: ["hindi", "हिन्दी", "hemant", "kalpana"],
        en: ["india", "indian", "en-in"],
        bn: ["bengali", "bangla", "bn-in"],
        ta: ["tamil", "ta-in"],
        te: ["telugu", "te-in"],
        mr: ["marathi", "mr-in"],
        mai: ["maithili", "मैथिली", "hindi", "हिन्दी", "kalpana", "hemant"],
        gu: ["gujarati", "gu-in"],
        kn: ["kannada", "kn-in"],
      };
      const keywords = voiceKeywords[lang] ?? [];

      const matchedVoice = voices.find((v) => {
        const vLang = v.lang.toLowerCase();
        const vName = v.name.toLowerCase();
        return (
          vLang.startsWith(lang) ||
          vLang.replace("_", "-") === targetTag ||
          keywords.some((kw) => vName.includes(kw))
        );
      });

      if (matchedVoice) {
        utterance.voice = matchedVoice;
        utterance.lang = matchedVoice.lang;
      } else {
        // If NO native voice for this Indian language on this device:
        // Use an Indian voice (Hindi / Indian English) rather than default US English
        const indicVoice = voices.find((v) =>
          v.lang.toLowerCase().startsWith("hi") ||
          v.name.toLowerCase().includes("hindi") ||
          v.lang.toLowerCase().includes("in")
        );
        if (indicVoice) {
          utterance.voice = indicVoice;
          utterance.lang = indicVoice.lang;
        } else {
          utterance.lang = "en-IN";
        }
      }
    }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      console.warn("[bhashini.ts] SpeechSynthesis error:", e);
      resolve();
    };
    window.speechSynthesis.speak(utterance);
  });
}

/** Transcribe audio using the browser's native Web Speech API (ASR fallback) */
export function transcribeWithBrowserASR(
  audioBlob: Blob,
  lang: string = "hi"
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Browser environment required"));
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      reject(new Error("Browser Web Speech API (SpeechRecognition) not available"));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = bcp47Tag(lang);
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join("");
      resolve(transcript);
    };

    recognition.onerror = (event: any) => reject(new Error(`ASR error: ${event.error}`));
    recognition.onend = () => {};

    // Convert Blob to AudioBuffer for playback hint — browser ASR uses live mic
    // so we signal readiness and let the mic start automatically
    try {
      recognition.start();
    } catch (err) {
      reject(err);
    }
  });
}

// ---------------------------------------------------------------------------
// Bhashini API (primary when credentials available)
// ---------------------------------------------------------------------------

/**
 * Convert audio blob to base64 string for Bhashini API.
 * Supports audio/webm, audio/wav, audio/mp3.
 */
async function audioBlobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Transcribe audio using Bhashini ASR API.
 *
 * Bhashini ASR endpoint: POST {endpoint}/asr/v1/recognize
 * Headers: Authorization: Bearer {apiKey}, Content-Type: application/json
 * Body: { audioSource: base64String, config: { language: { source: langCode } } }
 *
 * @param audioBlob  Raw audio captured from the browser mic (webm/wav)
 * @param lang       Kiosk language code (hi, en, bn, ta, te, mr, gu, kn, ml, pa)
 * @returns          Transcribed text
 */
export async function transcribe(
  audioBlob: Blob,
  lang: string = "hi"
): Promise<TranscribeResult> {
  if (!isBhashiniConfigured()) {
    // Fallback to browser Web Speech API
    const text = await transcribeWithBrowserASR(audioBlob, lang);
    return { text, confidence: 1.0, language: lang };
  }

  const { apiKey, endpoint } = getBhashiniConfig();
  const bhashiniLang = BHASHINI_LANG_CODE[lang] ?? "hi";

  try {
    const base64Audio = await audioBlobToBase64(audioBlob);

    const response = await fetch(`${endpoint}/asr/v1/recognize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audioSource: base64Audio,
        config: {
          language: {
            source: bhashiniLang,
            target: bhashiniLang,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Bhashini ASR API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Bhashini ASR response shape (varies by model version — handle common variants):
    // { output: [{ source: "transcribed text", confidence: 0.99 }] }
    // or { results: [{ alternatives: [{ transcript: "..." }] }] }
    const result = data.output?.[0]?.source
      ?? data.results?.[0]?.alternatives?.[0]?.transcript
      ?? data.text
      ?? "";

    const confidence = data.output?.[0]?.confidence
      ?? data.confidence
      ?? 0.9;

    return { text: result as string, confidence, language: lang };
  } catch (err) {
    console.warn("[bhashini.ts] Bhashini ASR failed, falling back to browser ASR:", err);
    const text = await transcribeWithBrowserASR(audioBlob, lang);
    return { text, confidence: 0.8, language: lang };
  }
}

/**
 * Speak text using Bhashini TTS API.
 *
 * Bhashini TTS endpoint: POST {endpoint}/tts/v1/convert
 * Headers: Authorization: Bearer {apiKey}, Content-Type: application/json
 * Body: { input: { text: string }, language: { source: langCode }, audioFormat: "wav" }
 *
 * @param text     Text to speak (supports Hindi, English, and Indian languages)
 * @param lang     Kiosk language code
 * @param options  rate, pitch, volume (applied to browser fallback or ignored by API)
 * @returns        Resolves when audio playback begins
 */
export async function speak(
  text: string,
  lang: string = "hi",
  options: SpeakOptions = {}
): Promise<void> {
  const { rate = 0.85, pitch = 1.0, volume = 1.0 } = options;

  // Stop any active audio playback across the entire app first
  stopAllAudio();

  // 1. If running in browser, play high-fidelity audio stream from /api/voice/tts
  if (typeof window !== "undefined") {
    try {
      const cleanText = text.replace(/[#*_`]/g, "").replace(/\s+/g, " ").trim().slice(0, 200);
      if (cleanText) {
        const audioUrl = `/api/voice/tts?text=${encodeURIComponent(cleanText)}&lang=${encodeURIComponent(lang)}`;
        const audio = new Audio(audioUrl);
        setActiveAudio(audio);
        audio.playbackRate = rate;
        audio.volume = volume;

        await new Promise<void>((resolve, reject) => {
          audio.onended = () => {
            setActiveAudio(null);
            resolve();
          };
          audio.onerror = (e) => {
            setActiveAudio(null);
            reject(e);
          };
          audio.play().catch((err) => {
            setActiveAudio(null);
            reject(err);
          });
        });
        return;
      }
    } catch (err) {
      console.warn("[bhashini.ts] Local TTS audio stream failed, falling back to browser TTS:", err);
    }
  }

  // 2. If Bhashini credentials configured on server side
  if (isBhashiniConfigured()) {
    const { apiKey, endpoint } = getBhashiniConfig();
    const bhashiniLang = BHASHINI_LANG_CODE[lang] ?? "hi";

    try {
      const response = await fetch(`${endpoint}/tts/v1/convert`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: { text },
          language: { source: bhashiniLang },
          audioFormat: "wav",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const base64Audio = data.audioContent ?? data.output ?? data.audio ?? null;

        if (base64Audio) {
          const audioBlob = await fetch(`data:audio/wav;base64,${base64Audio}`).then((r) => r.blob());
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audio.playbackRate = rate;
          audio.volume = volume;

          await new Promise<void>((resolve, reject) => {
            audio.onended = () => {
              URL.revokeObjectURL(audioUrl);
              resolve();
            };
            audio.onerror = () => {
              URL.revokeObjectURL(audioUrl);
              reject(new Error("TTS audio playback failed"));
            };
            audio.play().catch(reject);
          });
          return;
        }
      }
    } catch (err) {
      console.warn("[bhashini.ts] Bhashini TTS failed, falling back to browser TTS:", err);
    }
  }

  // 3. Fallback to Browser Speech Synthesis
  return speakWithBrowserTTS(text, lang, options);
}

// ---------------------------------------------------------------------------
// Utility: language code constants (shared across voice modules)
// ---------------------------------------------------------------------------

/** Supported kiosk language codes */
export const SUPPORTED_VOICE_LANGS = [
  "hi", "en", "bn", "ta", "te", "mr", "mai", "gu", "kn",
] as const;
export type SupportedVoiceLang = (typeof SUPPORTED_VOICE_LANGS)[number];

/** Check if a language code is supported for voice */
export function isVoiceLangSupported(lang: string): lang is SupportedVoiceLang {
  return (SUPPORTED_VOICE_LANGS as unknown as string[]).includes(lang);
}
