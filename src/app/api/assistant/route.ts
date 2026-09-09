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

MANDATORY STRUCTURAL FORMATTING RULES:
1. NEVER output a dense wall of unstructured text or rambling essay paragraphs.
2. ALWAYS divide your answer into clean, distinct sections using '### [Emoji] [Section Title]'.
3. Use bullet points (•) with bold concept titles for features, advantages, or details:
   • **Concept Name**: Crisp 1-2 sentence explanation.
4. When giving steps or workflows, use numbered lists:
   1. **Step Name**: Concise explanation.
5. Limit every paragraph to a maximum of 2 sentences.
6. ALWAYS end your response with an actionable callout:
   👉 **Next Step**: [Specific action user can take on their current screen].
7. Avoid conversational filler like "As you can see on our homepage..." or "Welcome to...". Provide direct, high-value, organized information.
8. Answer in the same language as the user (Hindi or English).`;

// Curated high-precision structured fallback responses for common queries
const STRUCTURED_FALLBACKS: Record<string, string> = {
  "what is medikiosk and how does it help": `### 🌟 What is MediKiosk (Sanjivani)?
MediKiosk is an AI-powered clinical intake and medical digitization platform designed specifically for high-volume Indian hospital OPDs, the **Ministry of Ayush**, and the **All India Institute of Ayurveda (AIIA)**.

### ⏱️ Key Problems It Solves
- **Rushed Consultations**: Indian OPD doctors typically have under 2 minutes per patient. MediKiosk performs pre-consultation intake to give doctors 10–15 valuable minutes back.
- **Paperless Digitization**: Turns paper prescriptions and lab slips into structured FHIR R4 health records in under 5 seconds.
- **Dual Allopathy & Ayush**: Combines acute allopathic symptom triage (SOCRATES) with traditional Ayush constitutional assessment (Dashavidha Pariksha).

### 🚀 Core Modules
1. **Self-Service Kiosk (\`/kiosk\`)**: Multilingual voice intake (8 Indic languages via Bhashini) & live camera prescription scanner.
2. **Doctor Desk (\`/doctor\`)**: Pre-compiled SOAP summaries, AI differential diagnosis, and herb-drug interaction warnings.
3. **Queue Desk (\`/desk\`)**: Live token dispatch and audio announcements.
4. **Patient Portal (\`/patient\`)**: Downloadable digital prescription PDF and ABHA longitudinal timeline.

👉 **Next Step**: Click on the **Launch Patient Kiosk** button or explore the navigation bar at the top to test any portal.`,

  "how can i download this as a web app": `### 📱 Installing MediKiosk as a Progressive Web App (PWA)
MediKiosk is fully PWA-enabled and can be installed as a native app on Android, iOS, Windows touch screens, and hospital kiosk hardware.

### 📲 Step-by-Step Installation
1. **Google Chrome / Edge (Desktop/Kiosk)**:
   - Look at the right side of the address bar for the **Install** icon (a monitor with a down arrow).
   - Click **Install MediKiosk** to run it in dedicated full-screen kiosk mode.
2. **Android (Chrome)**:
   - Tap the **three vertical dots (⋮)** in the top-right corner.
   - Tap **Add to Home screen** or **Install app**.
3. **iPhone / iPad (Safari)**:
   - Tap the **Share** button (box with an upward arrow) at the bottom.
   - Scroll down and tap **Add to Home Screen**.

### ⚡ Key PWA Benefits
- **Offline Resilient**: Works smoothly even during intermittent hospital Wi-Fi outages.
- **Full Screen Display**: No browser URL bar or distractions for patients at physical kiosk stands.

👉 **Next Step**: Open your browser menu now and tap **Add to Home screen** / **Install** to test offline operation.`,

  "how does the dual allopathy": `### 🌿 Dual-System Clinical Intake Architecture
MediKiosk bridges modern Western medicine with traditional Indian systems of medicine in a unified clinical intake flow.

### 🔬 Allopathic Intake (SOCRATES Protocol)
- **Systematic Triage**: Evaluates Site, Onset, Character, Radiation, Associations, Timing, Exacerbating factors, and Severity (1–10).
- **Red-Flag Emergency Triggers**: Instantly alerts doctors if symptoms indicate acute coronary syndrome, stroke, or severe respiratory distress.

### 🍃 Ayush Assessment (Dashavidha Pariksha)
- **Constitutional Analysis**: Evaluates Prakriti (Vata, Pitta, Kapha balance), Vikriti (current dosha imbalance), Agni (digestive fire), and Satmya (adaptability).
- **AIIA 8-Part History**: Prepares classical Ayurvedic case presentation for AIIA clinicians.

### 🛡️ Cross-System Herb-Drug Safety Engine
- Automatically flags interactions (e.g. concurrent Metformin with hypoglycemic Ayurvedic formulations like Vijaysar or Gudmar).

👉 **Next Step**: Navigate to **/kiosk** and select your symptoms to see both Allopathic and Ayush questions in action.`,

  "what are the abdm milestones": `### 🇮🇳 Ayushman Bharat Digital Mission (ABDM) Compliance
MediKiosk fulfills all 3 core milestones specified by the National Health Authority (NHA):

### 📋 ABDM Milestones Summary
- **Milestone M1 (ABHA Creation & Verification)**:
  - Patients can verify their 14-digit ABHA number or scan their Ayushman Bharat QR code.
  - Verifies credentials via OTP through ABDM Sandbox.
- **Milestone M2 (HIP - Health Information Provider)**:
  - Digitizes OPD prescriptions and clinical summaries into standard **HL7 FHIR R4** bundles.
  - Links generated medical records to the patient's ABHA address.
- **Milestone M3 (HIU - Health Information User)**:
  - Retrieves longitudinal health records and past hospital visits with patient digital consent under DPDP Act 2023.

👉 **Next Step**: Go to **/login/patient** to test instant ABHA OTP authentication and digital health record retrieval.`
};

export async function POST(req: NextRequest) {
  try {
    const { messages, screenContext } = await req.json();

    const userMessage = messages && messages.length > 0
      ? messages[messages.length - 1].content
      : "Hello";

    // Quick match against structured fallback dictionary for instant, perfect response
    const normalizedUserMsg = userMessage.toLowerCase().replace(/[^a-z0-9 ]/g, " ").trim();
    for (const [key, answer] of Object.entries(STRUCTURED_FALLBACKS)) {
      if (normalizedUserMsg.includes(key) || key.includes(normalizedUserMsg)) {
        return NextResponse.json({ reply: answer.trim() });
      }
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json({
        reply: `### ⚠️ Offline Mode Active
MediKiosk Assistant is operating in local mode.

### 💡 Available Features
• All platform screens, Kiosk intake, Doctor portal, and Desk queue are fully functional.
• To enable dynamic live reasoning, configure \`GEMINI_API_KEY\` in your \`.env.local\` file.

👉 **Next Step**: Select any suggestion chip below for quick guided help on this screen.`
      });
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const candidateModels = [
      "gemini-flash-lite-latest",
      "gemini-3.5-flash-lite",
      "gemini-3.7-flash",
      process.env.GEMINI_MODEL || "gemini-3.6-flash",
      "gemini-flash-latest",
    ];

    const currentScreenPrompt = screenContext ? `
[CURRENT USER SCREEN CONTEXT]:
- Page Path: ${screenContext.pathname || "/"}
- Screen Name: ${screenContext.name || "MediKiosk Screen"}
- Category: ${screenContext.category || "General"}
- Screen Summary: ${screenContext.summary || "General navigation"}
- Visible Headings/Sections: ${Array.isArray(screenContext.visibleHeadings) ? screenContext.visibleHeadings.join(", ") : "N/A"}
` : "";

    const formatDirective = `
[MANDATORY FORMAT DIRECTIVE]:
You MUST strictly follow these formatting rules:
- Divide your answer into 2 to 3 visual sections with '### [Emoji] [Title]'.
- Use '• **Bold Concept**:' bullet points for any lists or explanations (max 2 sentences per bullet).
- Never output an unstructured wall of text or long unbroken paragraphs.
- End your response with:
👉 **Next Step**: [Clear action recommendation for the user on this screen]`;

    const contents = [
      {
        role: "user",
        parts: [
          {
            text: `${SYSTEM_KNOWLEDGE}\n\n${currentScreenPrompt}\n\n${formatDirective}\n\nUser Question: ${userMessage}`
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
      // If models failed, provide a structured fallback
      reply = `### 🌟 MediKiosk Assistant
I can help guide you through **${screenContext?.name || "MediKiosk"}**.

### 💡 What You Can Do Here:
• **Interactive Intake**: Tap through symptom questions or use the microphone to speak.
• **Prescription Scan**: Use your device camera to extract medicine and lab details.
• **Portal Navigation**: Switch between Patient Kiosk, Doctor Desk, and Hospital Reception.

👉 **Next Step**: Tap one of the suggestion chips below or ask a specific question about this screen!`;
    }

    return NextResponse.json({ reply: reply.trim() });
  } catch (error: any) {
    console.error("Chatbot assistant error:", error);
    return NextResponse.json(
      {
        reply: `### ⚠️ Connection Temporarily Busy
The assistant encountered a temporary network delay.

### 💡 Quick Navigation
• **Kiosk Intake**: Access via \`/kiosk\` for patient check-in and camera scan.
• **Doctor Portal**: Access via \`/doctor\` for clinical summaries and queue.
• **Patient Health Pass**: Access via \`/patient\` to view prescriptions.

👉 **Next Step**: Try asking again or tap one of the suggestion chips below.`
      },
      { status: 200 }
    );
  }
}
