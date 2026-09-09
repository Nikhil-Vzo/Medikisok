import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function isValidKey(key?: string | null): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  if (trimmed.length < 10) return false;
  if (trimmed.startsWith("your_") || trimmed.includes("placeholder") || trimmed.includes("your-api-key")) {
    return false;
  }
  return true;
}

export async function GET() {
  const geminiConfigured = isValidKey(process.env.GEMINI_API_KEY);
  const paddleConfigured = isValidKey(process.env.PADDLEOCR_API_KEY);

  if (geminiConfigured) {
    return NextResponse.json({
      configured: true,
      engine: "gemini",
      message: "Gemini Vision AI is configured and ready for prescription scanning."
    });
  }
  if (paddleConfigured) {
    return NextResponse.json({
      configured: true,
      engine: "paddleocr",
      message: "PaddleOCR is configured and ready."
    });
  }
  return NextResponse.json({
    configured: false,
    engine: null,
    message: "OCR credentials not configured. Set GEMINI_API_KEY or PADDLEOCR_API_KEY in your environment to enable document scanning."
  });
}
