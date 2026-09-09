import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

const SYSTEM_KNOWLEDGE = `You are MediKiosk AI Assistant, the intelligent, friendly, and expert hospital guide built into MediKiosk (Sanjivani) — an AI-powered Clinical Intake & Medical Digitization platform for the Ministry of Ayush, All India Institute of Ayurveda (AIIA), and Indian hospital OPDs.

You have full access to the user's current screen and full knowledge of all pages and features of the application.

KEY CAPABILITIES & SITE ARCHITECTURE:
1. Patient Kiosk (/kiosk):
   - Step 1: Language & ABHA ID Verification (14-digit ABHA ID or QR code scan via ABDM Sandbox).
   - Step 2: Digital Consent Pad (e-consent compliant with India's DPDP Act 2023).
   - Step 3: Bilingual Voice/Touch Clinical Intake:
     * SOCRATES Protocol for acute allopathic complaints (Site, Onset, Character, Radiation, Associations, Time, Exacerbating factors, Severity).
     * Dashavidha Pariksha for Ayush (Prakriti, Vikriti, Sara, Agni, Satmya, Sattva, Ahara-shakti).
     * Bhashini Voice ASR/TTS in 8 Indic languages (Hindi, English, Bengali, Tamil, Telugu, Marathi, Gujarati, etc.).
   - Step 4: Medical Document Vision AI (OCR):
     * Real-time camera or photo upload scanning of handwritten doctor prescriptions & lab reports.
     * Extracts drug names, dosages, frequencies, and abnormal blood test markers.
   - Step 5: Red-Flag Emergency Alerts (Automatic triage to Resuscitation Bay for chest pain, acute dyspnea).

2. Doctor's OPD Portal (/doctor):
   - Pre-consultation Clinical Summaries in standardized Allopathic SOAP format (Subjective, Objective, Assessment, Plan).
   - Classical 8-Part AIIA Ayush Clinical History.
   - Herb-Drug Cross-System Interaction alerts (e.g. Glycemic warning for Metformin with hypoglycemic Ayurvedic herbs).
   - 1-Click Consultation Acceptance & HL7 FHIR R4 Bundle export to hospital HIS/EMR.

3. Hospital Desk & Queue (/desk):
   - Live Token Queue management, doctor room assignment, audio token call announcements, patient arrival check-in.

4. Patient Portal (/patient):
   - Digital OPD pass, downloadable electronic prescription PDF, longitudinal health timeline, and past visits.

5. Ministry / Admin Analytics (/admin):
   - Institutional throughput metrics, disease prevalence heatmaps, OPD wait-time reduction tracking.

6. Web App (PWA):
   - Installable on mobile phones and physical kiosk touch terminals with offline caching and standalone display.
   - High Contrast accessibility mode toggle available across the site.

GUIDELINES FOR YOUR RESPONSES:
- Be concise, warm, helpful, and clinically precise.
- You KNOW what screen the user is currently looking at from the provided Screen Context. Reference their current screen naturally (e.g. "Since you are on the Kiosk Intake screen, you can either tap the options or tap the microphone to speak your symptoms in Hindi or English.").
- Guide the user with step-by-step instructions on what to click or do next.
- If asked medical advice, provide helpful educational context and remind the user that final diagnostic decisions are verified by the consulting doctor.
- Answer in the same language the user asks (Hindi or English).`;

export async function POST(req: NextRequest) {
  try {
    const { messages, screenContext } = await req.json();

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json({
        reply: "MediKiosk Assistant is currently running in offline mode. For full AI reasoning, please configure GEMINI_API_KEY in your .env.local file."
      });
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const candidateModels = [
      process.env.GEMINI_MODEL || "gemini-1.5-flash",
      "gemini-1.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash-8b",
    ];

    const currentScreenPrompt = screenContext ? `
[CURRENT USER SCREEN CONTEXT]:
- Page Path: ${screenContext.pathname || "/"}
- Page Title: ${screenContext.title || "MediKiosk"}
- Active Screen State: ${screenContext.summary || "General navigation"}
- Visible Headings/Sections: ${Array.isArray(screenContext.visibleHeadings) ? screenContext.visibleHeadings.join(", ") : "N/A"}
` : "";

    const userMessage = messages && messages.length > 0
      ? messages[messages.length - 1].content
      : "Hello";

    // Build chat history for Gemini
    const contents = [
      {
        role: "user",
        parts: [
          {
            text: `${SYSTEM_KNOWLEDGE}\n\n${currentScreenPrompt}\n\nUser Question: ${userMessage}`
          }
        ]
      }
    ];

    let reply = "";
    let lastError = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent({ contents });
        reply = result.response.text();
        if (reply) break;
      } catch (err: any) {
        console.warn(`Assistant model ${modelName} failed:`, err?.status || err?.message || err);
        lastError = err;
      }
    }

    if (!reply) {
      throw lastError || new Error("Failed to generate response across models.");
    }

    return NextResponse.json({ reply: reply.trim() });
  } catch (error: any) {
    console.error("Chatbot assistant error:", error);
    return NextResponse.json(
      {
        reply: "I am having trouble connecting right now. Please check that you are connected to the network or try again in a moment."
      },
      { status: 200 }
    );
  }
}
