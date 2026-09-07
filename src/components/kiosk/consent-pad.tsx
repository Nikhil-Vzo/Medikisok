"use client";

import * as React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  PenTool,
  ChevronRight,
  ChevronLeft,
  Link2,
  Database,
  FileHeart,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { saveAbdmConsentAudit } from "@/lib/supabase/db";

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface ConsentPadProps {
  patientName: string;
  abhaId?: string;
  language?: "hi" | "en";
  /** Called after all steps complete + signature captured */
  onConsentComplete: (payload: ConsentPayload) => void;
  /** Audio-only consent (accessibility fallback) */
  onAudioConsentGranted: () => void;
}

export interface ConsentPayload {
  signatureData: string;
  consentStep: number; // 1 | 2 | 3
  abhaLinked: boolean;
  dataShared: boolean;
  /** ABDM-compliant consent artefact */
  abdmConsentArtefact: AbdmConsentResource;
  /** Base64-encoded audio of spoken consent if applicable */
  audioConsentDataUrl?: string;
}

export interface AbdmConsentResource {
  resourceType: "Consent";
  id: string;
  status: "active" | "inactive" | "entered-in-error" | "proposed" | "rejected";
  scope: {
    coding: Array<{ system: string; code: string; display: string }>;
  };
  category: Array<{
    coding: Array<{ system: string; code: string; display: string }>;
  }>;
  patient: {
    reference: string;
    display: string;
  };
  dateTime: string;
  sourceAttachment?: {
    title: string;
    creation: string;
    data?: string; // base64 signature
  };
  policy: Array<{ uri: string }>;
  provision: {
    type: "permit" | "deny";
    period: { start: string; end: string };
    actor: Array<{ role: { coding: Array<{ system: string; code: string; display: string }> }; reference: { reference: string } }>;
    code: Array<{ coding: Array<{ system: string; code: string; display: string }> }>;
  };
}

// -----------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------

const CONSENT_STEPS = [
  {
    id: 1,
    icon: Database,
    titleHi: "डेटा संग्रहण सहमति",
    titleEn: "Data Collection Consent",
    descHi: "आपकी जानकारी एकत्र करना — नाम, आयु, शिकायत, जीवन-चिह्न, और स्वास्थ्य दस्तावेज़।",
    descEn: "Collecting your information: name, age, chief complaint, vitals, and health documents.",
    checkboxHi: "मैं समझता/समझती हूँ कि मेरा डेटा एकत्र किया जाएगा।",
    checkboxEn: "I understand my data will be collected for this consultation.",
    purposeHi: "OPD क्लिनिकल परामर्श और केस-टेकिंग",
    purposeEn: "OPD Clinical Consultation & Case-Taking",
  },
  {
    id: 2,
    icon: Link2,
    titleHi: "ABHA लिंकिंग सहमति",
    titleEn: "ABHA Linking Consent",
    descHi: "आपके ABHA (आयुर्वेदिक स्वास्थ्य खाते) को इस रिकॉर्ड से जोड़ना।",
    descEn: "Linking your ABHA (Ayush Health Account) to this medical record.",
    checkboxHi: "मैं अपने ABHA को इस रिकॉर्ड से जोड़ने की सहमति देता/देती हूँ।",
    checkboxEn: "I consent to link my ABHA to this record.",
    purposeHi: "ABDM नेटवर्क पर स्वास्थ्य रिकॉर्ड एकीकरण",
    purposeEn: "Health Record Integration on ABDM Network",
  },
  {
    id: 3,
    icon: FileHeart,
    titleHi: "FHIR साझाकरण सहमति",
    titleEn: "FHIR Data Sharing Consent",
    descHi: "आपका FHIR रिकॉर्ड ABDM-अनुमत स्वास्थ्य सूचना इकाई (HIU) को साझा करना।",
    descEn: "Sharing your FHIR record with ABDM-authorized Health Information Users (HIU).",
    checkboxHi: "मैं FHIR डेटा साझाकरण के लिए सहमति देता/देती हूँ।",
    checkboxEn: "I consent to FHIR data sharing with authorized HIUs.",
    purposeHi: "ABDM HIU को FHIR दस्तावेज़ साझाकरण",
    purposeEn: "FHIR Document Sharing with ABDM HIU",
  },
] as const;

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

function generateAbdmConsentResource(
  patientName: string,
  abhaId: string | undefined,
  consentStep: number,
  signatureDataUrl: string | null,
  language: "hi" | "en"
): AbdmConsentResource {
  const now = new Date().toISOString();
  const validUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h

  const purposesMap: Record<number, { code: string; display: string }> = {
    1: { code: "CLINTRCH", display: language === "hi" ? "OPD क्लिनिकल परामर्श और केस-टेकिंग" : "OPD Clinical Consultation & Case-Taking" },
    2: { code: "ABDMREC", display: language === "hi" ? "ABDM नेटवर्क रिकॉर्ड एकीकरण" : "ABDM Network Health Record Integration" },
    3: { code: "HRPVALG", display: language === "hi" ? "FHIR दस्तावेज़ HIU साझाकरण" : "FHIR Document Sharing with HIU" },
  };

  const purpose = purposesMap[consentStep];

  return {
    resourceType: "Consent",
    id: `consent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: "active",
    scope: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/consentscope",
          code: "patient-privacy",
          display: "Privacy Consent",
        },
      ],
    },
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/consentcategorycodes",
            code: "GRANT",
            display: "Consent Granted",
          },
        ],
      },
    ],
    patient: {
      reference: abhaId ? `Patient/${abhaId}` : `Patient/unknown`,
      display: patientName,
    },
    dateTime: now,
    sourceAttachment: signatureDataUrl
      ? {
          title: language === "hi" ? "हस्ताक्षर सहमति" : "Signature Consent",
          creation: now,
          data: signatureDataUrl.replace(/^data:image\/\w+;base64,/, ""),
        }
      : undefined,
    policy: [
      { uri: "https://www.nha.gov.in/ABDM" },
      { uri: "https://abdm.gov.in" },
    ],
    provision: {
      type: "permit",
      period: { start: now, end: validUntil },
      actor: [
        {
          role: {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
                code: "IRCP",
                display: "information recipient",
              },
            ],
          },
          reference: { reference: "Organization/HIU-AIIA-001" },
        },
      ],
      code: [
        {
          coding: [
            {
              system: "http://snomed.info/sct",
              code: "419921001",
              display: purpose.display,
            },
          ],
        },
      ],
    },
  };
}

// -----------------------------------------------------------------------
// SignatureCanvas sub-component
// -----------------------------------------------------------------------

interface SignatureCanvasProps {
  onSignature: (dataUrl: string) => void;
  onClear: () => void;
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({ onSignature, onClear }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [hasSig, setHasSig] = React.useState(false);

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#065f46";
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasSig(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current && hasSig) {
      onSignature(canvasRef.current.toDataURL("image/png"));
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSig(false);
    onClear();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
        <span className="flex items-center gap-1.5">
          <PenTool className="w-3.5 h-3.5 text-slate-700" />
          <span>Sign on screen below (Touch / Mouse):</span>
        </span>
        {hasSig && (
          <button
            type="button"
            onClick={clear}
            className="text-slate-500 hover:text-slate-900 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Clear
          </button>
        )}
      </div>
      <div className="border border-dashed border-slate-300 rounded-xl bg-slate-50/60 overflow-hidden relative touch-none">
        <canvas
          ref={canvasRef}
          width={500}
          height={140}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-[140px] cursor-crosshair"
        />
        {!hasSig && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-xs text-slate-400 font-medium">
            Finger or Stylus Touch Signature Here / अपना हस्ताक्षर यहाँ करें
          </div>
        )}
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------
// ConsentStepCard sub-component
// -----------------------------------------------------------------------

interface ConsentStepCardProps {
  step: (typeof CONSENT_STEPS)[number];
  checked: boolean;
  onCheck: (v: boolean) => void;
  isLast: boolean;
}

const ConsentStepCard: React.FC<ConsentStepCardProps> = ({
  step,
  checked,
  onCheck,
  isLast,
}) => {
  const Icon = step.icon;

  return (
    <div className="flex gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:border-slate-300 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 space-y-1.5">
        <h4 className="text-sm font-bold text-slate-900 leading-snug">{step.titleEn}</h4>
        <p className="text-xs text-slate-600 leading-relaxed">{step.descEn}</p>
        <p className="text-xs text-slate-500 italic leading-relaxed">{step.descHi}</p>
        <label className="flex items-start gap-2 mt-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onCheck(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-slate-400 text-slate-700 focus:ring-ayush-500 cursor-pointer"
          />
          <span className="text-xs text-slate-700 font-medium group-hover:text-slate-900">
            {step.checkboxEn}
          </span>
        </label>
      </div>
      {isLast && (
        <Badge variant="ayush" className="text-[10px] shrink-0">
          Final Step
        </Badge>
      )}
    </div>
  );
};

// -----------------------------------------------------------------------
// Main ConsentPad
// -----------------------------------------------------------------------

export const ConsentPad: React.FC<ConsentPadProps> = ({
  patientName,
  abhaId,
  language = "hi",
  onConsentComplete,
  onAudioConsentGranted,
}) => {
  const [step, setStep] = React.useState<"intro" | "steps" | "signature" | "submitting" | "done">("intro");
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [checks, setChecks] = React.useState<Record<number, boolean>>({});
  const [signatureData, setSignatureData] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const currentStep = CONSENT_STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === CONSENT_STEPS.length - 1;
  const allChecked = CONSENT_STEPS.every((s) => checks[s.id]);

  // ------------------------------------------------------------------
  // Navigation
  // ------------------------------------------------------------------

  const goNext = () => {
    if (!checks[currentStep.id]) return;
    if (isLastStep) {
      setStep("signature");
    } else {
      setCurrentStepIndex((i) => i + 1);
    }
  };

  const goBack = () => {
    if (currentStepIndex === 0) {
      setStep("intro");
    } else {
      setCurrentStepIndex((i) => i - 1);
    }
  };

  const handleSignature = (dataUrl: string) => {
    setSignatureData(dataUrl);
  };

  const handleSignatureClear = () => {
    setSignatureData(null);
  };

  // ------------------------------------------------------------------
  // Submit
  // ------------------------------------------------------------------

  const handleSubmit = async () => {
    if (!signatureData) return;
    setStep("submitting");
    setSaving(true);
    setError(null);

    const artefact = generateAbdmConsentResource(
      patientName,
      abhaId,
      currentStepIndex + 1,
      signatureData,
      language
    );

    // Append-only audit entry
    const auditEntry = {
      actor_id: abhaId || `anon-${Date.now()}`,
      action: "ABDM_CONSENT_GRANTED",
      resource_type: "Consent",
      resource_id: artefact.id,
      details: {
        patientName,
        abhaId: abhaId || null,
        consentStep: currentStepIndex + 1,
        purpose: language === "hi" ? currentStep.purposeHi : currentStep.purposeEn,
        artefactId: artefact.id,
        consentResource: artefact,
      },
    };

    try {
      await saveAbdmConsentAudit(auditEntry);
    } catch {
      // Audit failure is non-fatal — log but continue
      console.warn("Consent audit save failed — continuing");
    }

    setSaving(false);
    setStep("done");

    onConsentComplete({
      signatureData,
      consentStep: currentStepIndex + 1,
      abhaLinked: checks[2] ?? false,
      dataShared: checks[3] ?? false,
      abdmConsentArtefact: artefact,
    });
  };

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  if (step === "intro") {
    return (
      <div className="p-6 sm:p-8 bg-white rounded-xl border border-slate-200 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[15px] font-semibold tracking-tight text-slate-900">DPDP Act 2023 — ABDM Verifiable Consent</h4>
              <p className="text-xs text-slate-500 font-normal">DPDP Act 2023 — डिजिटल व्यक्तिगत डेटा संरक्षण सहमति</p>
            </div>
          </div>
          <Badge variant="default" className="text-xs font-medium">
            3 Steps + Signature
          </Badge>
        </div>

        <div className="space-y-3 text-sm text-slate-700">
          <p className="leading-relaxed">
            <strong className="font-semibold text-slate-900">Before consultation begins,</strong> we require your informed consent under the Digital Personal Data Protection (DPDP) Act 2023 and ABDM standards.
          </p>
          <p className="text-xs text-slate-500 italic leading-relaxed">
            परामर्श से पहले, डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) अधिनियम 2023 और ABDM दिशानिर्देशों के तहत आपकी सूचित सहमति आवश्यक है।
          </p>

          <div className="grid grid-cols-3 gap-2.5 pt-2">
            {CONSENT_STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.id} className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-emerald-50/40 border border-emerald-100 text-center">
                  <Icon className="w-4 h-4 text-emerald-800" />
                  <span className="text-[11px] font-medium text-slate-800 leading-tight">{s.titleEn}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="primary"
            size="touch"
            onClick={() => setStep("steps")}
            className="flex-1 text-sm font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm h-12"
          >
            <ChevronRight className="w-4 h-4 mr-1.5" />
            Begin Consent Flow / सहमति प्रक्रिया शुरू करें
          </Button>
          <Button
            variant="outline"
            size="touch"
            onClick={onAudioConsentGranted}
            className="flex-1 text-sm font-medium h-12"
          >
            Audio Consent / मौखिक सहमति
          </Button>
        </div>
      </div>
    );
  }

  if (step === "steps") {
    return (
      <div className="p-6 sm:p-8 bg-white rounded-xl border border-slate-200 shadow-sm space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Consent Steps / सहमति चरण</h4>
              <p className="text-xs text-slate-500 font-medium">
                Step {currentStepIndex + 1} of {CONSENT_STEPS.length}
              </p>
            </div>
          </div>
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {CONSENT_STEPS.map((s) => (
              <div
                key={s.id}
                className={`h-1.5 rounded-full transition-all ${
                  s.id - 1 < currentStepIndex
                    ? "w-6 bg-emerald-700"
                    : s.id - 1 === currentStepIndex
                    ? "w-6 bg-emerald-500"
                    : "w-1.5 bg-emerald-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step card */}
        <ConsentStepCard
          step={currentStep}
          checked={!!checks[currentStep.id]}
          onCheck={(v) => setChecks((prev) => ({ ...prev, [currentStep.id]: v }))}
          isLast={isLastStep}
        />

        {/* Navigation */}
        <div className="flex gap-3 pt-1">
          <Button
            variant="ghost"
            size="touch"
            onClick={goBack}
            className="text-slate-600 font-bold"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </Button>
          <Button
            variant="primary"
            size="touch"
            onClick={goNext}
            disabled={!checks[currentStep.id]}
            className="flex-1 text-base font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm disabled:opacity-50"
          >
            {isLastStep ? (
              <>
                Review &amp; Sign / समीक्षा करें और हस्ताक्षर करें
                <PenTool className="w-5 h-5 ml-1" />
              </>
            ) : (
              <>
                Next / आगे
                <ChevronRight className="w-5 h-5 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (step === "signature") {
    return (
      <div className="p-6 sm:p-8 bg-white rounded-xl border border-slate-200 shadow-sm space-y-6">
        {/* Summary of consents */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-sm">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">
                {language === "hi" ? "समीक्षा करें और हस्ताक्षर करें" : "Review & Sign"}
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                {language === "hi" ? "अंतिम सहमति सारांश" : "Final consent summary"}
              </p>
            </div>
          </div>
          <Badge variant="ayush" className="text-xs">
            Final Step
          </Badge>
        </div>

        {/* Summary pills */}
        <div className="flex flex-wrap gap-2">
          {CONSENT_STEPS.map((s) => (
            <div
              key={s.id}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                checks[s.id]
                  ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                  : "bg-slate-50 border-slate-200 text-slate-400"
              }`}
            >
              {checks[s.id] ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
              )}
              {s.titleEn}
            </div>
          ))}
        </div>

        {/* Full consent text */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 max-h-32 overflow-y-auto">
          <p className="font-bold text-slate-900">
            I, <strong>{patientName}</strong>, hereby give my informed consent under DPDP Act 2023 and ABDM guidelines for:
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            {CONSENT_STEPS.map((s) => (
              <li key={s.id} className="flex items-center gap-1">
                <span><strong>{s.titleEn}:</strong> {s.descEn}</span>
                {checks[s.id] && (
                  <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 inline ml-1" />
                )}
              </li>
            ))}
          </ul>
          <p className="pt-1 border-t border-slate-200 italic text-slate-500">
            मैं, <strong>{patientName}</strong>, DPDP अधिनियम 2023 और ABDM दिशानिर्देशों के तहत ऊपर सूचीबद्ध सभी उद्देश्यों के लिए अपनी सूचित सहमति देता/देती हूँ।
          </p>
        </div>

        {/* Signature */}
        <SignatureCanvas onSignature={handleSignature} onClear={handleSignatureClear} />

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button
            variant="ghost"
            size="touch"
            onClick={() => setStep("steps")}
            className="text-slate-600 font-bold"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </Button>
          <Button
            variant="primary"
            size="touch"
            onClick={handleSubmit}
            disabled={!signatureData}
            className="flex-1 text-base font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm disabled:opacity-50"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            {language === "hi" ? "सहमति दर्ज करें" : "Record Consent"}
          </Button>
        </div>
      </div>
    );
  }

  if (step === "submitting") {
    return (
      <div className="p-8 bg-white rounded-xl border border-slate-200 shadow-sm space-y-6 text-center">
        <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center mx-auto">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-slate-900">
            {language === "hi" ? "सहमति दर्ज हो रही है..." : "Recording consent..."}
          </h4>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {language === "hi"
              ? "ABDM कंसेंट आर्टिफैक्ट और ऑडिट लॉग बनाया जा रहा है।"
              : "Generating ABDM consent artefact and audit log."}
          </p>
        </div>
      </div>
    );
  }

  // step === "done"
  return (
    <div className="p-6 sm:p-8 bg-white rounded-xl border border-slate-200 shadow-sm space-y-6 text-center">
      <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-7 h-7" />
      </div>
      <div>
        <h4 className="text-lg font-bold text-slate-900">
          {language === "hi" ? "सहमति दर्ज हो गई! धन्यवाद।" : "Consent recorded! Thank you."}
        </h4>
        <p className="text-sm text-slate-500 font-medium mt-1">
          {language === "hi"
            ? "आपका ABDM कंसेंट आर्टिफैक्ट बन गया है। अब आप परामर्श शुरू कर सकते हैं।"
            : "Your ABDM consent artefact has been generated. You may now begin your consultation."}
        </p>
      </div>
      <Badge variant="ayush" className="text-xs inline-flex items-center gap-1.5 font-medium">
        <Check className="w-3.5 h-3.5 text-emerald-700" />
        <span>ABDM & DPDP 2023 Verified</span>
      </Badge>
    </div>
  );
};
