import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const paddleConfigured = Boolean(process.env.PADDLEOCR_API_KEY);
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY);

  if (paddleConfigured) {
    return NextResponse.json({
      configured: true,
      engine: "paddleocr",
      message: "PaddleOCR is configured and ready."
    });
  }
  if (geminiConfigured) {
    return NextResponse.json({
      configured: true,
      engine: "gemini",
      message: "Gemini Vision is configured and ready."
    });
  }
  return NextResponse.json({
    configured: false,
    engine: null,
    message: "OCR credentials not configured. Set PADDLEOCR_API_KEY or GEMINI_API_KEY in your environment to enable document scanning."
  });
}
