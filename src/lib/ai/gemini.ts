import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";

export const isGeminiConfigured = Boolean(apiKey);

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured — using deterministic fallback engine.");
  }
  if (!genAI) genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
}

export async function getGeminiModel() {
  return getClient().getGenerativeModel({ model: modelName });
}

export async function generateClinicalResponse(prompt: string, systemInstruction?: string): Promise<string> {
  try {
    const model = getClient().getGenerativeModel({
      model: modelName,
      systemInstruction: systemInstruction || "You are MediKiosk AI, a specialized clinical intake engine for Indian hospital OPDs and Ministry of Ayush institutions. You elicit structured medical history, adhere strictly to clinical safety, never prescribe medicines directly to patients, and format outputs in structured JSON."
    });

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}
