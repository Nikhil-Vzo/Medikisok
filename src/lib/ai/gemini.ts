import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const defaultModelName = process.env.GEMINI_MODEL || "gemini-flash-lite-latest";

export const isGeminiConfigured = Boolean(apiKey);

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured — using deterministic fallback engine.");
  }
  if (!genAI) genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
}

export async function getGeminiModel(model: string = defaultModelName) {
  return getClient().getGenerativeModel({ model });
}

export async function generateClinicalResponse(prompt: string, systemInstruction?: string): Promise<string> {
  const client = getClient();
  const sysInst = systemInstruction || "You are MediKiosk AI, a specialized clinical intake engine for Indian hospital OPDs and Ministry of Ayush institutions. You elicit structured medical history, adhere strictly to clinical safety, never prescribe medicines directly to patients, and format outputs in structured JSON.";

  const candidateModels = [
    defaultModelName,
    "gemini-flash-lite-latest",
    "gemini-3.5-flash-lite",
    "gemini-3.7-flash",
    "gemini-3.5-flash",
    "gemini-3.6-flash"
  ];
  // Deduplicate while preserving order
  const modelsToTry = Array.from(new Set(candidateModels));

  let lastError: any = null;
  for (const m of modelsToTry) {
    try {
      const model = client.getGenerativeModel({
        model: m,
        systemInstruction: sysInst
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text) return text;
    } catch (err: any) {
      console.warn(`Clinical response model ${m} failed:`, err?.status || err?.message || err);
      lastError = err;
    }
  }

  console.error("All clinical response models exhausted:", lastError);
  throw lastError || new Error("Failed to generate clinical response across all candidate models.");
}
