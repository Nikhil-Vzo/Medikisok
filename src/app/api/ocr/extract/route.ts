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

// ── Multilingual Clinical Summary Generator (Truthful, non-fabricated) ───────
function buildLocalizedSummary(data: any, lang: string = "en"): string {
  const isHi = lang === "hi";
  const isBn = lang === "bn";
  const isTa = lang === "ta";
  const isTe = lang === "te";
  const isMr = lang === "mr";

  const hasMeds = Array.isArray(data.medications) && data.medications.length > 0;
  const hasLabs = Array.isArray(data.labValues) && data.labValues.length > 0;
  const hasDiagnoses = Array.isArray(data.diagnoses) && data.diagnoses.length > 0;

  let summary = "";

  if (isHi) {
    summary = `📋 पर्चा सारांश (डिजिटल क्लिनिकल विवरण):\n`;
    if (data.doctorName) summary += `• चिकित्सक: डॉ. ${data.doctorName}\n`;
    if (data.hospitalName) summary += `• अस्पताल/क्लीनिक: ${data.hospitalName}\n`;
    if (data.documentDate) summary += `• परामर्श तिथि: ${data.documentDate}\n`;
    if (hasDiagnoses) summary += `• निदान / बीमारी: ${data.diagnoses.join(", ")}\n`;
    summary += `\n`;

    if (hasMeds) {
      summary += `💊 निर्धारित दवाइयां (${data.medications.length}):\n`;
      data.medications.forEach((m: any, idx: number) => {
        const freq = m.frequency ? `· ${m.frequency}` : "";
        const dur = m.duration ? `(${m.duration})` : "";
        summary += `  ${idx + 1}. ${m.name} ${m.dosage || ""} ${freq} ${dur}\n`;
      });
      summary += `\n`;
    } else {
      summary += `ℹ️ कोई विशिष्ट दवा विवरण दर्ज नहीं मिला।\n\n`;
    }

    if (hasLabs) {
      summary += `🧪 प्रयोगशाला जांच:\n`;
      data.labValues.forEach((l: any) => {
        summary += `  • ${l.test}: ${l.value} (${l.range || "मानक"}) ${l.abnormal ? "[चेतावनी/असामान्य]" : "[सामान्य]"}\n`;
      });
      summary += `\n`;
    }

    if (data.doctorAdvice) {
      summary += `📝 डॉक्टर सलाह: ${data.doctorAdvice}\n`;
    }
  } else if (isBn) {
    summary = `📋 প্রেসক্রিপশন সারসংক্ষেপ:\n`;
    if (data.doctorName) summary += `• চিকিৎসক: ${data.doctorName}\n`;
    if (hasDiagnoses) summary += `• রোগ নির্ণয়: ${data.diagnoses.join(", ")}\n\n`;
    if (hasMeds) {
      summary += `💊 নির্ধারিত ওষুধসমূহ:\n`;
      data.medications.forEach((m: any, idx: number) => {
        summary += `  ${idx + 1}. ${m.name} ${m.dosage || ""} - ${m.frequency || ""} ${m.duration || ""}\n`;
      });
    }
  } else if (isTa) {
    summary = `📋 மருத்துவ சீட்டு சுருக்கம்:\n`;
    if (data.doctorName) summary += `• மருத்துவர்: ${data.doctorName}\n`;
    if (hasDiagnoses) summary += `• பாதிப்பு: ${data.diagnoses.join(", ")}\n\n`;
    if (hasMeds) {
      summary += `💊 மருந்துகள்:\n`;
      data.medications.forEach((m: any, idx: number) => {
        summary += `  ${idx + 1}. ${m.name} ${m.dosage || ""} - ${m.frequency || ""}\n`;
      });
    }
  } else if (isTe) {
    summary = `📋 ప్రిస్క్రిప్షన్ సారాంశం:\n`;
    if (data.doctorName) summary += `• వైద్యులు: ${data.doctorName}\n`;
    if (hasDiagnoses) summary += `• నిర్ధారణ: ${data.diagnoses.join(", ")}\n\n`;
    if (hasMeds) {
      summary += `💊 సూచించిన మందులు:\n`;
      data.medications.forEach((m: any, idx: number) => {
        summary += `  ${idx + 1}. ${m.name} ${m.dosage || ""} - ${m.frequency || ""}\n`;
      });
    }
  } else if (isMr) {
    summary = `📋 प्रिस्क्रिप्शन सारांश:\n`;
    if (data.doctorName) summary += `• डॉक्टर: ${data.doctorName}\n`;
    if (hasDiagnoses) summary += `• निदान: ${data.diagnoses.join(", ")}\n\n`;
    if (hasMeds) {
      summary += `💊 लिहून दिलेली औषधे:\n`;
      data.medications.forEach((m: any, idx: number) => {
        summary += `  ${idx + 1}. ${m.name} ${m.dosage || ""} - ${m.frequency || ""}\n`;
      });
    }
  } else {
    // English default — strictly truth-based
    summary = `📋 Clinical Prescription Summary:\n`;
    if (data.doctorName) summary += `• Prescribing Doctor: ${data.doctorName}\n`;
    if (data.hospitalName) summary += `• Hospital / Facility: ${data.hospitalName}\n`;
    if (data.documentDate) summary += `• Date: ${data.documentDate}\n`;
    if (hasDiagnoses) summary += `• Diagnosis / Indications: ${data.diagnoses.join(", ")}\n`;
    summary += `\n`;

    if (hasMeds) {
      summary += `💊 Prescribed Medications (${data.medications.length}):\n`;
      data.medications.forEach((m: any, idx: number) => {
        const freq = m.frequency ? `· ${m.frequency}` : "";
        const dur = m.duration ? `(${m.duration})` : "";
        summary += `  ${idx + 1}. ${m.name} ${m.dosage || ""} ${freq} ${dur}\n`;
      });
      summary += `\n`;
    } else {
      summary += `ℹ️ No specific medications detected in this document.\n\n`;
    }

    if (hasLabs) {
      summary += `🧪 Laboratory Findings:\n`;
      data.labValues.forEach((l: any) => {
        summary += `  • ${l.test}: ${l.value} (${l.range || "Standard"}) ${l.abnormal ? "[Alert/Abnormal]" : "[Normal]"}\n`;
      });
      summary += `\n`;
    }

    if (data.doctorAdvice) {
      summary += `📝 Doctor's Advice: ${data.doctorAdvice}\n`;
    }
  }

  return summary.trim();
}

export async function POST(req: NextRequest) {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const paddleOcrApiKey = process.env.PADDLEOCR_API_KEY;
    const geminiConfigured = isValidKey(geminiApiKey);
    const paddleConfigured = isValidKey(paddleOcrApiKey);
    const genAI = geminiConfigured ? new GoogleGenerativeAI(geminiApiKey!) : null;
    const body = await req.json();

    // ── Instant Language Switch / Translation Action ────────────────────────
    if (body.action === "translate_summary") {
      const targetLang = body.language || "en";
      const summary = buildLocalizedSummary(body.extracted || {}, targetLang);
      return NextResponse.json({
        success: true,
        language: targetLang,
        summaryText: summary,
      });
    }

    const { imageBase64, mimeType = "image/jpeg", language = "en" } = body;

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
        const paddleRes = await fetch("https://paddlepaddle.org.cn/paddleocr/ocr/api/recognize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${paddleOcrApiKey}`
          },
          body: JSON.stringify({
            images: [cleanBase64],
            lang: language === "hi" ? "hi" : "en"
          })
        });

        if (paddleRes.ok) {
          const paddleData = await paddleRes.json();
          const rawText = (paddleData.result?.records?.[0]?.text ?? []) as string[];
          const fullText = rawText.join("\n");
          const summary = buildLocalizedSummary({ summaryText: fullText }, language);
          return NextResponse.json({
            success: true,
            engine: "paddleocr",
            extracted: {
              docType: "prescription",
              medications: [],
              labValues: [],
              diagnoses: [],
              summaryText: summary,
              rawOcrText: summary
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

    const prompt = `You are an expert medical OCR vision specialist for Indian hospital OPDs.
Examine this medical prescription or lab document image carefully.

CRITICAL ACCURACY & GROUND TRUTH DIRECTIVES:
1. ONLY extract clinical entities that are ACTUALLY WRITTEN or PRINTED in this specific image.
2. DO NOT invent, hallucinate, or guess medications that do not appear in the image.
3. Carefully decipher Indian doctor handwriting and clinical abbreviations:
   - Shorthand frequencies: "1-0-1" -> "Twice daily (Morning & Night) / BD", "1-0-0" -> "Once daily (Morning) / OD", "0-0-1" -> "Once daily (Night) / HS", "1-1-1" -> "Thrice daily / TDS", "SOS" -> "As needed", "Stat" -> "Immediately".
   - Timings: "AC" -> "Before meals", "PC" -> "After meals".
   - Drug forms: Tab (Tablet), Cap (Capsule), Syp (Syrup), Inj (Injection), Oint (Ointment), Churna, Vati, Kwath, Drop.
4. If an item is partially illegible, extract only the decipherable name with confidence between 0.5 and 0.8.
5. If this image is NOT a medical prescription or contains no legible medical text, return "medications": [] and "diagnoses": [].

Output strictly valid JSON matching this schema:
{
  "docType": "prescription" | "lab_report" | "discharge_summary" | "other",
  "documentDate": "YYYY-MM-DD or null",
  "doctorName": "Doctor name or null",
  "hospitalName": "Hospital or Clinic name or null",
  "medications": [
    {
      "name": "Exact drug name",
      "dosage": "Strength e.g. 500mg, 40mg, 5ml",
      "frequency": "Frequency e.g. 1-0-1 (BD), 1-0-0 (OD)",
      "duration": "Duration e.g. 5 Days, 1 Month",
      "confidence": 0.95
    }
  ],
  "labValues": [
    {
      "test": "Test name",
      "value": "Value with unit",
      "range": "Normal range",
      "abnormal": false
    }
  ],
  "diagnoses": ["Clinical diagnosis or null"],
  "proceduresSurgeries": [],
  "allergies": [],
  "doctorAdvice": "Specific advice or lifestyle note written on document, or null",
  "summaryText": "Brief truthful summary of what is visible in the document"
}`;

    // Multi-tier fast model fallback: tries the fastest active models first
    const candidateModels = [
      "gemini-flash-lite-latest",
      "gemini-3.5-flash-lite",
      "gemini-3.7-flash",
      "gemini-3.5-flash",
      "gemini-3.6-flash"
    ];

    let lastError: any = null;
    let responseText = "";
    let usedModel = "";

    for (const cand of candidateModels) {
      try {
        const model = genAI!.getGenerativeModel({
          model: cand,
          generationConfig: {
            temperature: 0.05,
            responseMimeType: "application/json",
            maxOutputTokens: 1200,
          },
        });

        // Fast 9-second timeout so mobile uploads never hang indefinitely
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
          setTimeout(() => reject(new Error(`Timeout after 9s on ${cand}`)), 9000)
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
      console.warn("Vision models exhausted or image illegible:", lastError);
      return NextResponse.json({
        success: true,
        engine: "notice",
        extracted: {
          docType: "prescription",
          documentDate: null,
          doctorName: null,
          hospitalName: null,
          medications: [],
          labValues: [],
          diagnoses: [],
          doctorAdvice: null,
          summaryText: language === "hi"
            ? "⚠️ पर्चे से पाठ को स्पष्ट रूप से पढ़ा नहीं जा सका। कृपया सुनिश्चित करें कि तस्वीर साफ, सीधी और पर्याप्त रोशनी में ली गई है।"
            : "⚠️ Could not clearly extract legible prescription text from the uploaded image. Please ensure the document is clear, well-lit, and in focus, or try taking another photo.",
          rawOcrText: language === "hi"
            ? "⚠️ पर्चे से पाठ को स्पष्ट रूप से पढ़ा नहीं जा सका। कृपया स्पष्ट तस्वीर दोबारा अपलोड करें।"
            : "⚠️ Could not clearly extract legible prescription text. Please ensure the photo is clear and try again.",
          structuredJson: { medications: [], diagnoses: [], labValues: [] }
        }
      });
    }

    // Extract JSON block
    let jsonString = responseText.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }

    try {
      const parsedData = JSON.parse(jsonString);
      const localizedSummary = buildLocalizedSummary(parsedData, language);

      return NextResponse.json({
        success: true,
        engine: `gemini (${usedModel})`,
        extracted: {
          ...parsedData,
          summaryText: localizedSummary || parsedData.summaryText,
          rawOcrText: localizedSummary || parsedData.summaryText,
          structuredJson: parsedData
        }
      });
    } catch (pErr) {
      const fallbackSummary = buildLocalizedSummary({ summaryText: responseText }, language);
      return NextResponse.json({
        success: true,
        engine: `gemini (${usedModel})`,
        extracted: {
          docType: "prescription",
          medications: [],
          labValues: [],
          diagnoses: [],
          summaryText: fallbackSummary,
          rawOcrText: fallbackSummary
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
      { status: 200 }
    );
  }
}
