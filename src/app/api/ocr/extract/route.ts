import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

export async function POST(req: NextRequest) {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const paddleOcrApiKey = process.env.PADDLEOCR_API_KEY;
    const geminiConfigured = isValidKey(geminiApiKey);
    const paddleConfigured = isValidKey(paddleOcrApiKey);
    const genAI = geminiConfigured ? new GoogleGenerativeAI(geminiApiKey!) : null;
    const body = await req.json();
    const { imageBase64, mimeType = "image/jpeg" } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: "imageBase64 is required" },
        { status: 400 }
      );
    }

    // Strip prefix if present (e.g., data:image/jpeg;base64,)
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    // ── PaddleOCR path (only if real key provided) ───────────────────────────
    if (paddleConfigured) {
      try {
        // PaddleOCR Cloud API
        const paddleRes = await fetch("https://paddlepaddle.org.cn/paddleocr/ocr/api/recognize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${paddleOcrApiKey}`
          },
          body: JSON.stringify({
            images: [cleanBase64],
            lang: "en"
          })
        });

        if (paddleRes.ok) {
          const paddleData = await paddleRes.json();
          const rawText = (paddleData.result?.records?.[0]?.text ?? []) as string[];
          const fullText = rawText.join("\n");
          return NextResponse.json({
            success: true,
            engine: "paddleocr",
            extracted: {
              docType: "prescription",
              medications: [],
              labValues: [],
              diagnoses: [],
              summaryText: fullText || "Text extracted from document.",
              rawOcrText: fullText
            }
          });
        }
      } catch (paddleErr) {
        console.warn("PaddleOCR call failed, falling back to Gemini:", paddleErr);
      }
    }

    // ── No credentials configured ───────────────────────────────────────────────
    if (!geminiConfigured && !paddleConfigured) {
      return NextResponse.json({
        success: false,
        error: "requires_credentials",
        message: "OCR credentials not configured. Set GEMINI_API_KEY or PADDLEOCR_API_KEY in your environment."
      });
    }

    const prompt = `You are an expert medical OCR specialist for Indian hospital OPDs.
Analyze this medical document (handwritten prescription, lab report, or discharge slip).
Extract all clinical entities accurately and output strictly a JSON object with this structure:
{
  "docType": "prescription" | "lab_report" | "discharge_summary",
  "documentDate": "YYYY-MM-DD" (or null if not found),
  "doctorName": "string" (or null),
  "hospitalName": "string" (or null),
  "medications": [
    {
      "name": "Drug Brand/Generic name",
      "dosage": "e.g. 500mg, 40mg",
      "frequency": "e.g. BD (Twice daily), OD (Once daily), TDS",
      "duration": "e.g. 15 days, 1 month",
      "confidence": 0.95
    }
  ],
  "labValues": [
    {
      "test": "e.g. Fasting Blood Sugar, HbA1c, Serum Creatinine",
      "value": "e.g. 168 mg/dL, 8.4%",
      "range": "e.g. 70-100 mg/dL",
      "abnormal": true | false
    }
  ],
  "diagnoses": ["e.g. Type 2 Diabetes Mellitus", "Essential Hypertension"],
  "proceduresSurgeries": ["e.g. Cholecystectomy 2021", "Appendectomy"],
  "allergies": ["e.g. Penicillin allergy"],
  "summaryText": "Concise summary of findings from this document"
}`;

    const candidateModels = ["gemini-flash-lite-latest", "gemini-flash-latest"];

    let lastError: any = null;
    let responseText = "";
    let usedModel = "";

    for (const cand of candidateModels) {
      try {
        const model = genAI!.getGenerativeModel({
          model: cand,
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1500,
          },
        });

        // Fast 10s timeout per candidate to keep OCR responsive
        const generatePromise = model.generateContent([
          prompt,
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType
            }
          }
        ]);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout after 12s on ${cand}`)), 12000)
        );

        const result: any = await Promise.race([generatePromise, timeoutPromise]);
        responseText = result.response.text().trim();
        usedModel = cand;
        if (responseText) break;
      } catch (err: any) {
        console.warn(`Vision model ${cand} attempt failed:`, err?.status || err?.message || err);
        lastError = err;
      }
    }

    if (!responseText) {
      throw lastError || new Error("Failed to process document across vision models.");
    }
    // Extract JSON block
    let jsonString = responseText.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }

    try {
      const parsedData = JSON.parse(jsonString);
      return NextResponse.json({
        success: true,
        engine: "gemini",
        extracted: {
          ...parsedData,
          rawOcrText: responseText
        }
      });
    } catch (pErr) {
      return NextResponse.json({
        success: true,
        engine: "gemini",
        extracted: {
          docType: "prescription",
          medications: [],
          labValues: [],
          diagnoses: [],
          summaryText: responseText,
          rawOcrText: responseText
        }
      });
    }
  } catch (error: any) {
    console.error("OCR Extraction Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "extraction_failed",
        message: error?.message || "Document scanning failed. Please ensure the image is clear and try again."
      },
      { status: 500 }
    );
  }
}
