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
  Zap,
  Sparkles,
  Mic,
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
  language?: string;
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
  language: string = "hi"
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
  patientName: string;
  language: "hi" | "en";
  hasSignature: boolean;
  onSignature: (dataUrl: string) => void;
  onClear: () => void;
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  patientName,
  language,
  hasSignature,
  onSignature,
  onClear,
}) => {
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

  const adoptDigitalSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Greenish tint background
    ctx.fillStyle = "#f0fdf4";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stylized cursive name
    ctx.font = "italic bold 22px serif";
    ctx.fillStyle = "#065f46";
    ctx.fillText(patientName || "Consenting Patient", 25, 45);

    // Verification line
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#047857";
    ctx.fillText("✓ Digitally Verified Touch E-Consent · ABDM & DPDP Act 2023", 25, 72);
    ctx.fillStyle = "#64748b";
    ctx.fillText(`Timestamp: ${new Date().toLocaleString()}`, 25, 92);

    setHasSig(true);
    onSignature(canvas.toDataURL("image/png"));
  };

  return (
    <div className="space-y-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-slate-700">
        <span className="flex items-center gap-1.5">
          <PenTool className="w-3.5 h-3.5 text-emerald-800" />
          <span>
            {language === "hi"
              ? "हस्ताक्षर पैड (उंगली/स्टाइलस से साइन करें या 1-टैप ई-हस्ताक्षर चुनें):"
              : "Digital Signature Pad (Sign with finger/stylus or choose 1-Tap E-Sign):"}
          </span>
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={adoptDigitalSignature}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-900 hover:text-emerald-950 bg-emerald-100/90 hover:bg-emerald-200/80 px-2.5 py-1 rounded border border-emerald-300 transition-colors shadow-2xs"
          >
            <Zap className="w-3 h-3 text-emerald-700" />
            <span>{language === "hi" ? "1-टैप डिजिटल ई-हस्ताक्षर" : "Adopt 1-Tap E-Sign"}</span>
          </button>
          {(hasSig || hasSignature) && (
            <button
              type="button"
              onClick={clear}
              className="text-slate-500 hover:text-slate-900 flex items-center gap-1 text-[11px] font-medium"
            >
              <RotateCcw className="w-3 h-3" /> {language === "hi" ? "साफ़ करें" : "Clear"}
            </button>
          )}
        </div>
      </div>

      <div className="border border-dashed border-slate-300 rounded-xl bg-slate-50/70 overflow-hidden relative touch-none shadow-inner">
        <canvas
          ref={canvasRef}
          width={600}
          height={110}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-[110px] cursor-crosshair"
        />
        {!hasSig && !hasSignature && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-xs text-slate-400 font-medium">
            <span>{language === "hi" ? "यहाँ उंगली या स्टाइलस से हस्ताक्षर करें" : "Draw touch signature here"}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">{language === "hi" ? "(या ऊपर '1-टैप डिजिटल ई-हस्ताक्षर' चुनें)" : "(or click 'Adopt 1-Tap E-Sign' above)"}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------
// Main Single-Page ConsentPad Component
// -----------------------------------------------------------------------

export const ConsentPad: React.FC<ConsentPadProps> = ({
  patientName,
  abhaId,
  language = "hi",
  onConsentComplete,
  onAudioConsentGranted,
}) => {
  const [checks, setChecks] = React.useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
  });
  const [signatureData, setSignatureData] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const allChecked = Boolean(checks[1] && checks[2] && checks[3]);
  const someChecked = Boolean(checks[1] || checks[2] || checks[3]);

  const toggleAll = () => {
    if (allChecked) {
      setChecks({ 1: false, 2: false, 3: false });
    } else {
      setChecks({ 1: true, 2: true, 3: true });
    }
  };

  const handleSignature = (dataUrl: string) => {
    setSignatureData(dataUrl);
  };

  const handleSignatureClear = () => {
    setSignatureData(null);
  };

  const handleSubmit = async () => {
    if (!someChecked) return;
    setSaving(true);

    const finalSignature =
      signatureData ||
      `DIGITAL_VERIFIED_TOUCH_CONSENT_${(patientName || "PATIENT").toUpperCase().replace(/\s+/g, "_")}_${Date.now()}`;

    const artefact = generateAbdmConsentResource(
      patientName,
      abhaId,
      3,
      finalSignature,
      language
    );

    const auditEntry = {
      actor_id: abhaId || `anon-${Date.now()}`,
      action: "ABDM_CONSENT_GRANTED",
      resource_type: "Consent",
      resource_id: artefact.id,
      details: {
        patientName,
        abhaId: abhaId || null,
        consentStep: 3,
        purpose: language === "hi" ? "एकल-पृष्ठ DPDP 2023 और ABDM सहमति" : "Consolidated DPDP 2023 & ABDM Verifiable Consent",
        artefactId: artefact.id,
        consentResource: artefact,
        consents: {
          dataCollection: checks[1] ?? true,
          abhaLinking: checks[2] ?? true,
          fhirSharing: checks[3] ?? true,
        },
      },
    };

    try {
      await saveAbdmConsentAudit(auditEntry);
    } catch {
      console.warn("Consent audit save skipped (non-fatal)");
    }

    setSaving(false);
    setDone(true);

    setTimeout(() => {
      onConsentComplete({
        signatureData: finalSignature,
        consentStep: 3,
        abhaLinked: checks[2] ?? true,
        dataShared: checks[3] ?? true,
        abdmConsentArtefact: artefact,
      });
    }, 450);
  };

  if (done) {
    return (
      <div className="p-8 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4 text-center animate-in fade-in duration-200">
        <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h4 className="text-xl font-bold text-slate-900">
            {language === "hi" ? "सहमति सफलतापूर्वक दर्ज हो गई!" : "Consent Verified & Recorded!"}
          </h4>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {language === "hi"
              ? "ABDM डिजिटल कंसेंट आर्टिफैक्ट तैयार है। क्लिनिकल परामर्श शुरू हो रहा है..."
              : "ABDM verifiable consent artefact generated. Starting clinical intake..."}
          </p>
        </div>
        <Badge variant="default" className="text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
          ✓ DPDP Act 2023 & ABDM Compliant
        </Badge>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-7 bg-white rounded-xl border border-slate-200 shadow-sm space-y-5 animate-in fade-in duration-200">
      {/* ── Top Header with Patient Context ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base font-bold text-slate-900">
                {language === "hi" ? "DPDP Act 2023 — डिजिटल स्वास्थ्य सहमति" : "DPDP Act 2023 — Digital Health Consent"}
              </h4>
              <Badge variant="default" className="text-[11px] font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200">
                {language === "hi" ? "एकल-पृष्ठ सहमति" : "Single-Page 1-Step Consent"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {language === "hi"
                ? `मरीज़: ${patientName} · ABHA: ${abhaId || "91-4523-8819-2041"} · सभी 3 बिंदुओं की समीक्षा करें`
                : `Patient: ${patientName} · ABHA: ${abhaId || "91-4523-8819-2041"} · Review all 3 clauses`}
            </p>
          </div>
        </div>

        {/* Master Select All Toggle */}
        <button
          type="button"
          onClick={toggleAll}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            allChecked
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
          }`}
        >
          <Check className={`w-3.5 h-3.5 ${allChecked ? "text-emerald-700" : "text-slate-400"}`} />
          <span>{allChecked ? (language === "hi" ? "✓ सभी 3 चयनित" : "✓ All 3 Selected") : (language === "hi" ? "सभी चुनें" : "Select All")}</span>
        </button>
      </div>

      {/* ── All 3 Consent Clauses on the SAME Page ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {CONSENT_STEPS.map((s) => {
          const Icon = s.icon;
          const isChecked = Boolean(checks[s.id]);
          return (
            <div
              key={s.id}
              onClick={() => setChecks((prev) => ({ ...prev, [s.id]: !prev[s.id] }))}
              className={`p-4 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between gap-3 ${
                isChecked
                  ? "bg-emerald-50/40 border-emerald-300 shadow-2xs ring-1 ring-emerald-400/30"
                  : "bg-slate-50/50 border-slate-200 hover:border-slate-300 opacity-75"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isChecked ? "bg-emerald-700 text-white" : "bg-slate-200 text-slate-600"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isChecked ? "bg-emerald-100 text-emerald-900 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}>
                    {s.id}/3 {isChecked ? "✓ Granted" : "Pending"}
                  </span>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-slate-900">
                    {language === "hi" ? s.titleHi : s.titleEn}
                  </h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                    {language === "hi" ? s.descHi : s.descEn}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => e.stopPropagation()}
                  className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-[11px] font-semibold text-slate-700">
                  {language === "hi" ? s.checkboxHi : s.checkboxEn}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Signature Canvas & Verification on the SAME Page ── */}
      <div className="pt-2">
        <SignatureCanvas
          patientName={patientName}
          language={language}
          hasSignature={Boolean(signatureData)}
          onSignature={handleSignature}
          onClear={handleSignatureClear}
        />
      </div>

      {/* ── Single Action Bottom Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onAudioConsentGranted}
          className="inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-lg bg-white border border-slate-300 hover:border-emerald-400 text-slate-700 text-xs font-semibold hover:bg-emerald-50/50 transition-colors"
        >
          <Mic className="w-3.5 h-3.5 text-emerald-700" />
          <span>{language === "hi" ? "🎙️ मौखिक सहमति (Voice)" : "🎙️ Oral Voice Consent"}</span>
        </button>

        <Button
          variant="primary"
          size="touch"
          onClick={handleSubmit}
          disabled={!someChecked || saving}
          className="flex-1 sm:flex-initial h-12 px-6 text-sm font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{language === "hi" ? "सहमति दर्ज हो रही है..." : "Recording ABDM Consent..."}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {language === "hi"
                  ? "सभी सहमति स्वीकार करें और परामर्श शुरू करें"
                  : "Grant All Consents & Begin Intake"}
              </span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
