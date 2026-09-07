import { NextRequest, NextResponse } from "next/server";

/**
 * SOAP note shape returned by Groq Llama 3.1 inference.
 */
export interface SoapNote {
  subjective: {
    chiefComplaint: string;
    historyOfPresentIllness: string;
    pastHistory: string[];
    allergies: string[];
    currentMedications: Array<{ name: string; dosage: string; frequency: string; duration: string }>;
  };
  objective: {
    vitals?: Record<string, string | number>;
    physicalExamination?: Record<string, string>;
    labResults?: Record<string, string>;
    scannedFindings?: string[];
  };
  assessment: {
    diagnoses: Array<{ code?: string; label: string; confidence: number }>;
    differentials: string[];
    clinicalImpression: string;
  };
  plan: {
    investigations: string[];
    medications: Array<{ name: string; dosage: string; frequency: string; duration: string; route: string }>;
    lifestyleAdvice: string[];
    followUp: string;
    referrals?: string[];
  };
}

interface ClinicalIntake {
  patientDetails?: {
    name?: string;
    age?: number;
    gender?: string;
    abhaId?: string;
  };
  chiefComplaint?: string;
  socratesData?: Record<string, string>;
  vitals?: Record<string, string | number>;
  pastHistory?: string[];
  allergies?: string[];
  currentMedications?: Array<{ name: string; dosage: string; frequency: string; duration: string }>;
  scannedEntities?: {
    prescriptions?: string[];
    labValues?: Array<{ test: string; value: string; unit?: string; range?: string }>;
    clinicalNotes?: string[];
  };
  ayushData?: Record<string, string>;
  clinicalMode?: "allopathy" | "ayush" | "integrative";
  continuityNote?: string;
}

/** Deterministic placeholder SOAP note when GROQ_API_KEY is absent. */
function buildPlaceholderSoap(intake: ClinicalIntake): SoapNote {
  const mode = intake.clinicalMode ?? "allopathy";
  const cc = intake.chiefComplaint ?? "Not documented";
  const meds = intake.currentMedications ?? [];
  const vitals = intake.vitals ?? {};
  const socrates = intake.socratesData ?? {};

  return {
    subjective: {
      chiefComplaint: cc,
      historyOfPresentIllness:
        (socrates.site ? `Site: ${socrates.site}. ` : "") +
        (socrates.onset ? `Onset: ${socrates.onset}. ` : "") +
        (socrates.character ? `Character: ${socrates.character}. ` : "") +
        (socrates.radiation ? `Radiation: ${socrates.radiation}. ` : "") +
        (intake.continuityNote ?? ""),
      pastHistory: intake.pastHistory ?? [],
      allergies: intake.allergies ?? ["NKDA"],
      currentMedications: meds,
    },
    objective: {
      vitals,
      physicalExamination: {},
      labResults:
        intake.scannedEntities?.labValues?.reduce<Record<string, string>>((acc, l) => {
          acc[l.test] = `${l.value}${l.unit ? " " + l.unit : ""}${l.range ? " (ref: " + l.range + ")" : ""}`;
          return acc;
        }, {}) ?? {},
      scannedFindings: intake.scannedEntities?.clinicalNotes ?? [],
    },
    assessment: {
      diagnoses: [],
      differentials: [],
      clinicalImpression:
        mode === "ayush"
          ? `AYUSH-integrated assessment pending. Prakriti: ${intake.ayushData?.prakriti ?? "not determined"}.`
          : "Clinical assessment pending physician review.",
    },
    plan: {
      investigations: [],
      medications: [],
      lifestyleAdvice: [],
      followUp: "Review as needed.",
      referrals: [],
    },
  };
}

/** Build the SOAP prompt for Groq Llama 3.1. */
function buildSoapPrompt(intake: ClinicalIntake): string {
  return `You are a clinical documentation specialist for an Indian hospital OPD.
Given the structured patient intake below, produce a detailed SOAP (Subjective, Objective, Assessment, Plan) clinical note.

Return ONLY valid JSON — no markdown fences, no commentary — matching this exact schema:
{
  "subjective": {
    "chiefComplaint": "string",
    "historyOfPresentIllness": "string",
    "pastHistory": ["string"],
    "allergies": ["string"],
    "currentMedications": [{ "name": "string", "dosage": "string", "frequency": "string", "duration": "string" }]
  },
  "objective": {
    "vitals": { "key": "value" },
    "physicalExamination": { "system": "finding" },
    "labResults": { "test_name": "result (ref: range)" },
    "scannedFindings": ["string"]
  },
  "assessment": {
    "diagnoses": [{ "code": "ICD-10 string", "label": "string", "confidence": 0.95 }],
    "differentials": ["string"],
    "clinicalImpression": "string"
  },
  "plan": {
    "investigations": ["string"],
    "medications": [{ "name": "string", "dosage": "string", "frequency": "string", "duration": "string", "route": "string" }],
    "lifestyleAdvice": ["string"],
    "followUp": "string",
    "referrals": ["string"]
  }
}

Patient intake:
${JSON.stringify(intake, null, 2)}`;
}

/** Call Groq Llama 3.1 8B via the chat completions endpoint. */
async function callGroqLlama(prompt: string, apiKey: string): Promise<SoapNote> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const raw: string = data?.choices?.[0]?.message?.content ?? "";
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(cleaned) as SoapNote;
}

export async function POST(req: NextRequest) {
  try {
    const intake: ClinicalIntake = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    // ── Graceful placeholder ─────────────────────────────────────────────────
    if (!apiKey) {
      console.warn("[clinical/summary] GROQ_API_KEY not set — returning placeholder SOAP note.");
      return NextResponse.json(
        {
          success: true,
          source: "placeholder",
          soap: buildPlaceholderSoap(intake),
          warning: "GROQ_API_KEY is not configured. This is a deterministic placeholder; replace with a real API key for AI-generated summaries.",
        },
        { status: 200 }
      );
    }

    // ── Live Groq inference ───────────────────────────────────────────────────
    const prompt = buildSoapPrompt(intake);
    const soap = await callGroqLlama(prompt, apiKey);

    return NextResponse.json({ success: true, source: "groq-llama-3.1-8b-instant", soap });
  } catch (error: any) {
    console.error("[clinical/summary] Error:", error?.message ?? error);

    // If the LLM call fails mid-flight, fall back to the placeholder rather than
    // propagating a 500 that would block the doctor-facing UI.
    try {
      const intake: ClinicalIntake = await req.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: true,
          source: "placeholder",
          soap: buildPlaceholderSoap(intake),
          warning: `Groq inference failed (${error?.message}). Returning placeholder.`,
        },
        { status: 200 }
      );
    } catch {
      return NextResponse.json({ success: false, error: error?.message ?? "Unknown error" }, { status: 500 });
    }
  }
}
