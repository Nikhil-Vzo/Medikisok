import { NextRequest, NextResponse } from "next/server";

// Language code map for high-fidelity Indic audio synthesis
const INDIC_LANG_MAP: Record<string, string> = {
  hi: "hi",
  "hi-in": "hi",
  en: "en",
  "en-in": "en",
  bn: "bn",
  "bn-in": "bn",
  ta: "ta",
  "ta-in": "ta",
  te: "te",
  "te-in": "te",
  mr: "mr",
  "mr-in": "mr",
  gu: "gu",
  "gu-in": "gu",
  mai: "hi", // Maithili phonetics accurately handled by Devanagari Indic voice
  "mai-in": "hi",
  kn: "kn",
  "kn-in": "kn",
  pa: "pa",
  "pa-in": "pa",
};

async function fetchIndicTtsAudio(text: string, langCode: string): Promise<ArrayBuffer | null> {
  const tl = INDIC_LANG_MAP[langCode.toLowerCase()] || "en";
  // Clean text: strip special markdown/quotes and cap to first 200 chars for instant stream
  const cleanText = text
    .replace(/[#*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);

  if (!cleanText) return null;

  // 1. If Bhashini credentials configured, attempt Bhashini TTS first
  if (process.env.BHASHINI_API_KEY) {
    try {
      const endpoint = process.env.BHASHINI_ENDPOINT ?? "https://meity-auth.ulcacontrib.in";
      const bhashiniRes = await fetch(`${endpoint}/tts/v1/convert`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.BHASHINI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: { text: cleanText },
          language: { source: tl },
          audioFormat: "wav",
        }),
      });

      if (bhashiniRes.ok) {
        const data = await bhashiniRes.json();
        const base64Audio = data.audioContent ?? data.output ?? data.audio;
        if (base64Audio) {
          const binaryStr = atob(base64Audio);
          const len = binaryStr.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          return bytes.buffer;
        }
      }
    } catch (e) {
      console.warn("[tts/route.ts] Bhashini attempt failed, falling back to Indic TTS:", e);
    }
  }

  // 2. High-fidelity Indic Cloud Audio stream (Google Translate Indic TTS engine)
  try {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${tl}&client=tw-ob&q=${encodeURIComponent(cleanText)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Referer: "https://translate.google.com/",
      },
      signal: AbortSignal.timeout(3500),
    });

    if (!res.ok) {
      return null;
    }

    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

/**
 * GET /api/voice/tts?text=...&lang=...
 * Returns audio/mpeg stream directly playable by new Audio() or <audio src="...">
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get("text") || "";
    const lang = searchParams.get("lang") || "en";

    if (!text) {
      return new NextResponse("Text parameter required", { status: 400 });
    }

    const audioBuffer = await fetchIndicTtsAudio(text, lang);
    if (!audioBuffer) {
      return new NextResponse(null, { status: 204 });
    }

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}

/**
 * POST /api/voice/tts
 * Body: { text: string, language?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { text, language = "hi" } = await req.json();

    if (!text) {
      return NextResponse.json({ success: false, error: "Text is required" }, { status: 400 });
    }

    const audioBuffer = await fetchIndicTtsAudio(text, language);
    if (!audioBuffer) {
      return NextResponse.json({ success: false, error: "Audio generation failed" }, { status: 500 });
    }

    // Return as audio/mpeg stream
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error: any) {
    console.error("[api/voice/tts POST] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
