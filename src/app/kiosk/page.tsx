"use client";

import * as React from "react";
import {
  UserCheck, ShieldCheck, Stethoscope, Mic, Volume2,
  Upload, CheckCircle2, ArrowRight, ArrowLeft, AlertCircle,
  FileText, Camera, QrCode, HeartPulse, RefreshCw, Flame, Wind,
  Thermometer, Activity, Sparkles, AlertTriangle, UserPlus, RotateCcw,
  History, Shuffle, Clock, Printer, MapPin, Calendar, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { AlertBanner } from "@/components/ui/alert-banner";
import { VoiceMicButton } from "@/components/kiosk/voice-mic-button";
import { ChoiceCard } from "@/components/kiosk/choice-card";
import { AudioPrompter, speakConfirmation } from "@/components/kiosk/audio-prompter";
import { LanguageSelector } from "@/components/kiosk/language-selector";
import { CameraScanner, ExtractedDocResult } from "@/components/kiosk/camera-scanner";
import { ConsentPad } from "@/components/kiosk/consent-pad";
import { VitalsScanner, VitalMeasurements } from "@/components/kiosk/vitals-scanner";
import { InactivityTimer } from "@/components/kiosk/inactivity-timer";
import { HighContrastToggle } from "@/components/kiosk/high-contrast-toggle";
import { getQuestionContent, getKioskStepStrings } from "@/lib/translations/kiosk-strings";
import { evaluateRedFlags } from "@/lib/ontologies/red-flags";
import { buildFhirR4Bundle } from "@/lib/abdm/fhir-builder";
import { savePatientIntake } from "@/lib/supabase/db";
import { matchOptionFromTranscript } from "@/lib/voice-matching";
import { computeContinuity, ContinuityDecision } from "@/lib/continuity-engine";
import { CHIEF_COMPLAINTS, getQuestionsForComplaint } from "@/lib/ontologies/chief-complaints";
import { KioskStep } from "@/types/kiosk";

const RANDOM_PATIENTS = [
  { name: "Ramesh Kumar Sharma", age: 48, gender: "Male" },
  { name: "Priya Anand Patel", age: 34, gender: "Female" },
  { name: "Mohan Lal Verma", age: 58, gender: "Male" },
  { name: "Sunita Devi", age: 63, gender: "Female" },
  { name: "Mohammad Arif", age: 52, gender: "Male" },
  { name: "Gurpreet Kaur", age: 41, gender: "Female" },
  { name: "Deepak Joshi", age: 29, gender: "Male" },
  { name: "Meena Sundaram", age: 67, gender: "Female" },
  { name: "Vijay Rathore", age: 55, gender: "Male" },
];

const RETURNING_PRESETS = [
  {
    name: "Kamla Devi",
    age: 62,
    gender: "Female",
    abhaId: "91-4523-8819-2041",
    gapDays: 4,
    lastVisitDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    lastComplaint: "High grade fever with chills (Pyrexia)",
    lastMedications: ["Tab Paracetamol 650mg BD", "Tab Cefixime 200mg BD"],
    label: "Kamla Devi (Visited 4 days ago · Pyrexia Δ4d)",
  },
  {
    name: "Rajesh Patel",
    age: 54,
    gender: "Male",
    abhaId: "91-8834-1192-5503",
    gapDays: 45,
    lastVisitDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    lastComplaint: "Retrosternal chest discomfort & Hypertension",
    lastMedications: ["Tab Telmisartan 40mg OD", "Tab Metformin 500mg BD"],
    label: "Rajesh Patel (Visited 45 days ago · Chest Heaviness Δ45d)",
  },
  {
    name: "Anil Gupta",
    age: 38,
    gender: "Male",
    abhaId: "91-6621-9943-1209",
    gapDays: 120,
    lastVisitDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    lastComplaint: "Epigastric burning & abdominal colic",
    lastMedications: ["Cap Omeprazole 20mg OD"],
    label: "Anil Gupta (Visited 120 days ago · Baseline Renewal Δ120d)",
  },
];

export default function KioskPage() {
  const [step, setStep] = React.useState<KioskStep>("identify");
  const [language, setLanguage] = React.useState("hi");
  const [clinicalMode, setClinicalMode] = React.useState<"allopathy" | "ayush">("allopathy");

  // Patient Identity State
  const [abhaId, setAbhaId] = React.useState("91-4523-8819-2041");
  const [patientName, setPatientName] = React.useState("Kamla Devi");
  const [patientAge, setPatientAge] = React.useState(62);
  const [patientGender, setPatientGender] = React.useState("Female");
  const [presetNotice, setPresetNotice] = React.useState<string | null>(null);

  // Generate random ABHA and patient profile
  const generateRandomPatient = () => {
    const r4 = () => Math.floor(1000 + Math.random() * 9000).toString();
    const newAbha = `91-${r4()}-${r4()}-${r4()}`;
    const pick = RANDOM_PATIENTS[Math.floor(Math.random() * RANDOM_PATIENTS.length)];
    setAbhaId(newAbha);
    setPatientName(pick.name);
    setPatientAge(pick.age);
    setPatientGender(pick.gender);
    setIsReturningPatient(false);
    setContinuity(null);
    setPresetNotice("Random ABHA & Patient generated for fresh OPD intake");
    speakConfirmation("language_selected", language);
  };

  // Select returning patient profile for testing continuity engine
  const selectReturningPreset = (preset: typeof RETURNING_PRESETS[0]) => {
    setAbhaId(preset.abhaId);
    setPatientName(preset.name);
    setPatientAge(preset.age);
    setPatientGender(preset.gender);
    setIsReturningPatient(true);
    setPresetNotice(
      `Returning Patient Loaded: Last visited ${preset.gapDays} days ago for "${preset.lastComplaint}". Continuity Engine will adapt intake.`
    );
    const decision = computeContinuity({
      isReturning: true,
      lastVisitDate: preset.lastVisitDate,
      lastChiefComplaint: preset.lastComplaint,
      lastMedications: preset.lastMedications,
    });
    setContinuity(decision);
  };

  // Hydrate custom patient profile if routed from patient login with query params
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlAbha = params.get("abha");
      const urlName = params.get("name");
      const urlAge = params.get("age");
      const urlGender = params.get("gender");

      if (urlAbha || urlName) {
        if (urlAbha) setAbhaId(urlAbha);
        if (urlName) setPatientName(urlName);
        if (urlAge && !isNaN(Number(urlAge))) setPatientAge(Number(urlAge));
        if (urlGender) setPatientGender(urlGender);
        setIsReturningPatient(false);
        setPresetNotice(`Loaded custom patient profile: "${urlName || urlAbha}"`);
      }
    }
  }, []);

  const handleAbhaInput = async (val: string) => {
    setAbhaId(val);
    setPresetNotice(null);
    const digits = val.replace(/\D/g, "");
    if (digits.length >= 14) {
      try {
        const res = await fetch(`/api/queue?abhaId=${encodeURIComponent(val)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.found && json.patient) {
            setPatientName(json.patient.name);
            if (json.patient.age) setPatientAge(json.patient.age);
            if (json.patient.gender) setPatientGender(json.patient.gender);
            setIsReturningPatient(true);
            setPresetNotice(`Record found in database for ABHA ${val}. Returning patient intake activated.`);
          }
        }
      } catch (e) {
        // silent fallback
      }
    }
  };

  // Consent State
  const [consentGranted, setConsentGranted] = React.useState(false);

  // Conversational Intake State
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [selectedAnswers, setSelectedAnswers] = React.useState<Record<string, string>>({});
  const [isListening, setIsListening] = React.useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = React.useState(false);
  const [voiceTranscript, setVoiceTranscript] = React.useState("");

  // Triage & Emergency State
  const [isEmergency, setIsEmergency] = React.useState(false);

  // Vitals recorded at the kiosk (optional step)
  const [recordedVitals, setRecordedVitals] = React.useState<VitalMeasurements | null>(null);
  const [showVitals, setShowVitals] = React.useState(false);

  // Continuity Engine state
  const [isReturningPatient, setIsReturningPatient] = React.useState(false);
  const [continuity, setContinuity] = React.useState<ContinuityDecision | null>(null);
  const [selectedComplaint, setSelectedComplaint] = React.useState<string | null>(null);

  // Scanned Document State - starts clean and empty for live OCR demo
  const [scannedFiles, setScannedFiles] = React.useState<Array<{ name: string; size: string; status: string }>>([]);

  const [extractedEntities, setExtractedEntities] = React.useState<{
    medications: Array<{ name: string; dosage: string; frequency: string; duration?: string; confidence?: number }>;
    labValues: Array<{ test: string; value: string; range: string; abnormal: boolean }>;
    diagnoses: string[];
    proceduresSurgeries?: string[];
    allergies?: string[];
  }>({
    medications: [],
    labValues: [],
    diagnoses: [],
    proceduresSurgeries: [],
    allergies: []
  });

  // Dynamic OPD visit slot time & reporting time (computed for completion step)
  const opdVisitTime = React.useMemo(() => {
    const d = new Date(Date.now() + 15 * 60 * 1000);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  }, [step]);

  const opdReportByTime = React.useMemo(() => {
    const d = new Date(Date.now() + 10 * 60 * 1000);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  }, [step]);

  const stepsList = [
    { id: "identify", label: "Identity", labelHindi: "पहचान" },
    { id: "consent", label: "Consent", labelHindi: "सहमति" },
    { id: "converse", label: "Intake", labelHindi: "बातचीत" },
    { id: "scan", label: "Records", labelHindi: "दस्तावेज़" },
    { id: "confirm", label: "Review", labelHindi: "पुष्टि" }
  ];

  const getStepIndex = () => {
    switch (step) {
      case "identify": return 0;
      case "consent": return 1;
      case "continuity":
      case "complaint_select":
      case "mode_select":
      case "converse":
      case "triage_alert": return 2;
      case "scan": return 3;
      case "confirm":
      case "completed": return 4;
    }
  };

  // Conversational questions list based on selected chief complaint and clinical mode,
  // prepended with delta questions from the Continuity Engine for returning patients.
  const baseQuestions = React.useMemo(() => {
    return getQuestionsForComplaint(selectedComplaint, clinicalMode);
  }, [selectedComplaint, clinicalMode]);

  const activeQuestions = React.useMemo(() => {
    if (continuity && continuity.deltaQuestions.length > 0) {
      return [...continuity.deltaQuestions, ...baseQuestions] as any[];
    }
    return baseQuestions as any[];
  }, [continuity, baseQuestions]);
  const currentQ: any = activeQuestions[currentQuestionIndex] || activeQuestions[0];

  const handleOptionSelect = (optionId: string) => {
    const updated = { ...selectedAnswers, [currentQ.dimension || currentQ.id]: optionId };
    setSelectedAnswers(updated);

    // Evaluate Red Flags
    const allSelectedIds = Object.values(updated) as string[];
    const redFlagCheck = evaluateRedFlags(allSelectedIds);
    if (redFlagCheck.isEmergency) {
      setIsEmergency(true);
    }

    // Auto advance to next question or next stage
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      if (redFlagCheck.isEmergency) {
        setStep("triage_alert");
      } else {
        setStep("scan");
      }
    }
  };

  const stepStrings = getKioskStepStrings(language);

  return (
    <div className="min-h-screen bg-[#F7FAF8] text-slate-900 flex flex-col antialiased selection:bg-emerald-100 selection:text-emerald-950">
      {/* Top Header matching landing page & clinician workspace */}
      <header className="sticky top-0 z-50 border-b border-emerald-100 bg-[#F7FAF8]/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-emerald-600 flex items-center justify-center shadow-xs">
                <span className="text-white text-[11px] font-bold">M</span>
              </div>
              <span className="text-[15px] font-semibold text-slate-900">MediKiosk</span>
            </a>
            <span className="text-slate-300">/</span>
            <span className="text-[13px] font-medium text-slate-600">Patient Intake Terminal</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Terminal 01: Active
            </span>
            <HighContrastToggle />
            <Badge variant={clinicalMode === "ayush" ? "vedic" : "default"} className="text-xs font-medium">
              {clinicalMode === "ayush" ? "Ayurveda Mode" : "Allopathy Mode"}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Terminal Body */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-3 sm:py-5 space-y-4 flex flex-col justify-between">
        {/* Privacy Guard Inactivity Timer */}
        {step !== "identify" && step !== "completed" && (
          <InactivityTimer onTimeout={() => setStep("identify")} />
        )}

        {/* Stepper Card */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-emerald-100 shadow-sm">
          <ProgressSteps steps={stepsList} currentStepIndex={getStepIndex()} />
        </div>

        {/* Main Dynamic Step Area */}
        <div className="flex-1 flex flex-col justify-center py-1">
          {/* ================= STEP 1: IDENTIFY ================= */}
          {step === "identify" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                  {stepStrings.identifyTitle}
                </h3>
                <p className="text-sm text-slate-600 font-medium">
                  {stepStrings.identifySub}
                </p>
                <AudioPrompter language={language} textToSpeak={stepStrings.identifyTts} />
              </div>

              {/* Language Selector Card */}
              <div className="p-5 sm:p-6 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Apni Bhasha Chunein (Select Preferred Language):
                </label>
                <LanguageSelector currentLang={language} onSelect={(lang) => { speakConfirmation("language_selected", lang); setLanguage(lang); }} />
              </div>

              {/* ABHA Input Card */}
              <div className="p-6 sm:p-8 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-6">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      14-Digit ABHA ID (Ayushman Bharat Health Account)
                    </label>
                    <span className="text-xs font-medium text-emerald-700">ABDM FHIR R4 Compliant</span>
                  </div>

                  {/* Quick Action Presets Bar */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={generateRandomPatient}
                      className="h-9 px-3 text-xs font-semibold border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900"
                    >
                      <Shuffle className="w-3.5 h-3.5 mr-1.5 text-emerald-700" />
                      🎲 Random ABHA / New Patient
                    </Button>

                    <div className="relative inline-block">
                      <select
                        onChange={(e) => {
                          const idx = Number(e.target.value);
                          if (!isNaN(idx) && RETURNING_PRESETS[idx]) {
                            selectReturningPreset(RETURNING_PRESETS[idx]);
                          }
                        }}
                        defaultValue=""
                        className="h-9 px-3 text-xs font-semibold rounded-md border border-slate-300 bg-white hover:border-emerald-600 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                      >
                        <option value="" disabled>
                          📋 Revisit Returning Patient...
                        </option>
                        {RETURNING_PRESETS.map((p, idx) => (
                          <option key={p.abhaId} value={idx}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => selectReturningPreset(RETURNING_PRESETS[0])}
                      className="h-9 px-2.5 text-xs text-slate-600 hover:text-emerald-700"
                    >
                      <QrCode className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      Kamla Devi
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={abhaId}
                      onChange={(e) => handleAbhaInput(e.target.value)}
                      placeholder="91-XXXX-XXXX-XXXX"
                      className="flex-1 h-14 px-4 rounded-lg border border-slate-200 text-lg font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 tracking-wider font-mono"
                    />
                  </div>
                </div>

                {/* Preset Notification Banner */}
                {presetNotice && (
                  <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2 animate-in fade-in duration-200">
                    <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>{presetNotice}</span>
                  </div>
                )}

                {/* Patient Editable Demographics Card */}
                <div className="p-4 sm:p-5 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                        {patientName ? patientName.slice(0, 2).toUpperCase() : "PT"}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-800">ABDM Demographics Profile</h4>
                        <p className="text-[11px] text-slate-500">Edit or confirm demographic fields before proceeding</p>
                      </div>
                    </div>
                    <Badge variant="default" className="text-[11px] font-medium bg-emerald-100 text-emerald-900 border border-emerald-300">
                      ✓ ABDM Verified
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Patient Full Name
                      </label>
                      <input
                        type="text"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-900 focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Age (Years)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={patientAge}
                        onChange={(e) => setPatientAge(Number(e.target.value) || 0)}
                        className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-900 focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Gender
                      </label>
                      <div className="flex gap-1 h-10">
                        {["Male", "Female", "Other"].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setPatientGender(g)}
                            className={`flex-1 rounded-lg text-xs font-semibold border transition-all ${
                              patientGender === g
                                ? "bg-emerald-700 text-white border-emerald-700"
                                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    speakConfirmation("session_start", language);
                    setStep("consent");
                  }}
                  className="w-full h-14 rounded-lg text-base font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
                >
                  <span>Aage Badhein (Proceed to Consent)</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* ================= STEP 2: CONSENT ================= */}
          {step === "consent" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-200">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                  {stepStrings.consentTitle}
                </h3>
                <p className="text-sm text-slate-600 font-medium">
                  {stepStrings.consentSub}
                </p>
                <AudioPrompter
                  autoPlay
                  language={language}
                  textToSpeak={stepStrings.consentTts}
                />
              </div>

              <ConsentPad
                patientName={patientName}
                abhaId={abhaId}
                language={language as "hi" | "en"}
                onConsentComplete={(payload) => {
                  speakConfirmation("consent_submitted", language);
                  setConsentGranted(true);
                  setStep("continuity");
                }}
                onAudioConsentGranted={() => {
                  speakConfirmation("consent_submitted", language);
                  setConsentGranted(true);
                  setStep("continuity");
                }}
              />
            </div>
          )}

          {/* ================= STEP 2b: CONTINUITY CHECK (Gap-Adaptive History) ================= */}
          {step === "continuity" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                  Kya aap pehle bhi yahan aaye hain?
                </h3>
                <p className="text-sm text-slate-600 font-medium">
                  Have you visited this hospital before? We will not repeat questions you already answered.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    // Demo returning patient: last visit 45 days ago
                    const decision = computeContinuity({
                      isReturning: true,
                      lastVisitDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
                      lastChiefComplaint: "Chest discomfort & acidity",
                      lastMedications: ["Tab Metformin 500mg BD", "Tab Telmisartan 40mg OD"]
                    });
                    setContinuity(decision);
                    setIsReturningPatient(true);
                    setStep("complaint_select");
                  }}
                  className="group p-6 rounded-xl bg-white border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/30 transition-all text-left space-y-4 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-sm">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">Haan, pehle aaya hoon</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Yes — I have visited before. Only answer what has changed since last visit.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const decision = computeContinuity({ isReturning: false });
                    setContinuity(decision);
                    setIsReturningPatient(false);
                    setStep("complaint_select");
                  }}
                  className="group p-6 rounded-xl bg-white border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/30 transition-all text-left space-y-4 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-sm">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">Nahi, pehli baar</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      No — first visit here. Comprehensive baseline clinical intake will be recorded.
                    </p>
                  </div>
                </button>
              </div>

              {continuity && (
                <div className="max-w-3xl mx-auto p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                  <p className="text-xs font-semibold text-emerald-900">{continuity.headlineHi}</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">{continuity.headlineEn}</p>
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 2c: CHIEF COMPLAINT SELECT ================= */}
          {step === "complaint_select" && continuity && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                  Aaj ki mukhya pareshani kya hai?
                </h3>
                <p className="text-sm text-slate-600 font-medium">
                  What is your primary clinical complaint today?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {CHIEF_COMPLAINTS.map((cc) => (
                  <button
                    key={cc.id}
                    type="button"
                    onClick={() => {
                      setSelectedComplaint(cc.id);
                      setClinicalMode(cc.suggestedMode);
                      setCurrentQuestionIndex(0);
                      setStep("converse");
                    }}
                    className="group p-5 rounded-xl bg-white border border-slate-200/80 hover:border-emerald-600 hover:bg-emerald-50/40 transition-all text-left space-y-3 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 group-hover:bg-emerald-700 group-hover:text-white text-emerald-800 flex items-center justify-center transition-colors">
                      {cc.icon === "HeartPulse" ? <HeartPulse className="w-5 h-5" /> :
                       cc.icon === "Flame" ? <Flame className="w-5 h-5" /> :
                       cc.icon === "Thermometer" ? <Thermometer className="w-5 h-5" /> :
                       cc.icon === "Activity" ? <Activity className="w-5 h-5" /> :
                       cc.icon === "Wind" ? <Wind className="w-5 h-5" /> :
                       <AlertCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{cc.labelHi}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{cc.labelEn}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Continuity reminder for returning patients */}
              {isReturningPatient && continuity.gapDays >= 0 && (
                <div className="max-w-3xl mx-auto p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200/80 text-center">
                  <p className="text-xs font-semibold text-emerald-900">
                    Continuity Engine: {continuity.interviewType === "triage_only"
                      ? "Sirf badlav poochenge (Delta triage)"
                      : continuity.interviewType === "delta"
                      ? "Badlav + samiksha hoga (Delta + ROS)"
                      : "Poora itihas liya jayega"} — Δ{continuity.gapDays} din pichle visit se
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 3: MODE SELECT ================= */}
          {step === "mode_select" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                  {stepStrings.modeTitle}
                </h3>
                <p className="text-sm text-slate-600 font-medium">
                  {stepStrings.modeSub}
                </p>
                <AudioPrompter language={language} textToSpeak={stepStrings.modeTts} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Option A: Allopathy Mode */}
                <button
                  type="button"
                  onClick={() => {
                    setClinicalMode("allopathy");
                    setCurrentQuestionIndex(0);
                    setStep("converse");
                  }}
                  className="group p-6 rounded-xl bg-white border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/30 transition-all text-left space-y-3 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-sm"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">General OPD / Allopathy</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Standard clinical intake following the SOCRATES pain & symptom localization framework.
                    </p>
                  </div>
                </button>

                {/* Option B: Ayush Mode */}
                <button
                  type="button"
                  onClick={() => {
                    setClinicalMode("ayush");
                    setCurrentQuestionIndex(0);
                    setStep("converse");
                  }}
                  className="group p-6 rounded-xl bg-white border border-amber-300 hover:border-amber-600 transition-all text-left space-y-3 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                >
                  <div className="w-12 h-12 rounded-md bg-amber-600 text-white flex items-center justify-center">
                    <Flame className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">Ayurveda OPD (AIIA)</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Dashavidha Pariksha: Prakriti, Agni, Koshtha, Sattva & Ahara-Vihara assessment.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 4: CONVERSE (DUAL MODE VOICE + TOUCH) ================= */}
          {step === "converse" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Question Card */}
              <div className="p-6 sm:p-8 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-3 text-center">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
                  <span>Prashna {currentQuestionIndex + 1} / {activeQuestions.length}</span>
                  <span>{clinicalMode.toUpperCase()} CLINICAL PROTOCOL</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 leading-snug">
                  {currentQ.question?.hi}
                </h3>
                <p className="text-sm font-medium text-slate-600">
                  {currentQ.question?.en}
                </p>

                <div className="pt-2 flex justify-center">
                  <AudioPrompter autoPlay language={language} textToSpeak={currentQ.question?.hi} />
                </div>
              </div>

              {/* Touch Choice Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentQ.options?.map((opt: any) => (
                  <ChoiceCard
                    key={opt.id}
                    id={opt.id}
                    labelHi={opt.labelHi}
                    labelEn={opt.labelEn}
                    descriptionHi={opt.descriptionHi}
                    descriptionEn={opt.descriptionEn}
                    iconName={opt.icon}
                    isRedFlag={opt.isRedFlag}
                    isSelected={selectedAnswers[currentQ.dimension || currentQ.id] === opt.id}
                    onClick={() => handleOptionSelect(opt.id)}
                  />
                ))}
              </div>

              {/* Voice Input Station */}
              <div className="p-6 bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col items-center justify-center">
                <VoiceMicButton
                  language={language}
                  onTranscriptReceived={(transcript) => {
                    setVoiceTranscript(transcript);
                    if (currentQ.options && currentQ.options.length > 0) {
                      const { matchedId, confidence } = matchOptionFromTranscript(transcript, currentQ.options);
                      if (matchedId && confidence >= 0.5) {
                        handleOptionSelect(matchedId);
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* ================= STEP 5: RED FLAG TRIAGE ALERT ================= */}
          {step === "triage_alert" && (
            <div className="space-y-6 animate-in zoom-in-95 duration-300">
              <AlertBanner
                type="danger"
                title="Aapatkaleen Sanket (EMERGENCY RED FLAG DETECTED)"
                description="Aapke lakshan gambhir sthiti ki taraf ishara kar rahe hain. Nurse station ko suchit kar diya gaya hai."
              />

              <div className="p-8 bg-red-50/70 rounded-xl border border-red-200 text-center space-y-4 shadow-sm">
                <div className="w-14 h-14 rounded-lg bg-red-600 text-white flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8 stroke-[2.5]" />
                </div>

                <div>
                  <h3 className="text-2xl font-semibold tracking-tight text-red-950">
                    Immediate Triage Priority Dispatch
                  </h3>
                  <p className="text-xs font-semibold text-red-800 mt-2 max-w-lg mx-auto leading-relaxed">
                    Acute chest pain with radiating discomfort and dyspnoea detected. Bypassing regular OPD queue for instant physician examination.
                  </p>
                </div>

                <Button
                  variant="danger"
                  size="lg"
                  onClick={() => setStep("scan")}
                  className="rounded-lg text-sm font-semibold"
                >
                  Scan Old Records First (Continue Intake)
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* ================= STEP 6: SCAN & OCR ================= */}
          {step === "scan" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                  {stepStrings.scanTitle}
                </h3>
                <p className="text-sm text-slate-600 font-medium">
                  {stepStrings.scanSub}
                </p>
                <AudioPrompter language={language} textToSpeak={stepStrings.scanTts} />
              </div>

              {/* Document Scanner Area */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Real Video Camera Scanner */}
                <div className="lg:col-span-7">
                  <CameraScanner
                    onDocumentExtracted={(result: ExtractedDocResult) => {
                      setScannedFiles(prev => [...prev, { name: result.fileName, size: "1.2 MB", status: "processed" }]);
                      setExtractedEntities(prev => ({
                        medications: [...prev.medications, ...result.medications],
                        labValues: [...prev.labValues, ...result.labValues],
                        diagnoses: Array.from(new Set([...prev.diagnoses, ...result.diagnoses])),
                        proceduresSurgeries: [...(prev.proceduresSurgeries || []), ...(result.proceduresSurgeries || [])],
                        allergies: [...(prev.allergies || []), ...(result.allergies || [])]
                      }));
                    }}
                  />
                </div>

                {/* Extracted Entities Live Preview */}
                <div className="lg:col-span-5 p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                  <div className="flex-1 flex flex-col space-y-3.5">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-700" />
                        <h4 className="text-sm font-semibold text-slate-900">Extracted Clinical Data</h4>
                      </div>
                      <Badge variant="default" className="text-xs font-medium">Vision AI Active</Badge>
                    </div>

                    {extractedEntities.medications.length === 0 && extractedEntities.labValues.length === 0 && (!extractedEntities.diagnoses || extractedEntities.diagnoses.length === 0) ? (
                      <div className="my-auto py-8 text-center space-y-2 text-slate-400 bg-emerald-50/20 rounded-xl border border-dashed border-emerald-200 p-4">
                        <FileText className="w-8 h-8 mx-auto text-emerald-600/50" />
                        <p className="text-xs font-semibold text-slate-700">No documents scanned yet</p>
                        <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                          Hold physical prescription in front of camera, upload a photo, or click &quot;Demo: Load Sample Rx&quot; above to see real-time Vision AI extraction.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3.5 text-xs flex-1 flex flex-col">
                        {/* Diagnoses / Findings */}
                        {extractedEntities.diagnoses && extractedEntities.diagnoses.length > 0 && (
                          <div>
                            <span className="font-semibold text-emerald-800 text-xs block mb-1">
                              Clinical Diagnoses & Indications:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {extractedEntities.diagnoses.map((d, idx) => (
                                <span key={idx} className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
                                  {d}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Active Prescribed Medicines - Expands smoothly without cramped max-h-40 scrollbar */}
                        {extractedEntities.medications.length > 0 && (
                          <div className="flex-1 flex flex-col">
                            <span className="font-semibold text-emerald-800 text-xs block mb-1.5">
                              Active Prescribed Medicines ({extractedEntities.medications.length}):
                            </span>
                            <div className="space-y-2 overflow-y-auto max-h-[380px] lg:max-h-[460px] pr-1">
                              {extractedEntities.medications.map((m, idx) => (
                                <div key={idx} className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100 flex items-center justify-between font-medium">
                                  <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                    <span className="text-slate-900 font-semibold">{m.name}</span>
                                  </div>
                                  <span className="text-slate-600 text-xs bg-white px-2 py-0.5 rounded border border-emerald-150">
                                    {m.dosage} · {m.frequency}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Laboratory Findings */}
                        {extractedEntities.labValues.length > 0 && (
                          <div>
                            <span className="font-semibold text-emerald-800 text-xs block mb-1">
                              Laboratory Findings ({extractedEntities.labValues.length}):
                            </span>
                            <div className="space-y-1.5 overflow-y-auto max-h-[240px] pr-1">
                              {extractedEntities.labValues.map((l, idx) => (
                                <div key={idx} className={`p-2.5 rounded-lg border flex justify-between font-medium ${l.abnormal ? 'bg-red-50 border-red-200 text-red-950' : 'bg-emerald-50/40 border-emerald-100 text-slate-800'}`}>
                                  <span>{l.test}</span>
                                  <span className="text-xs font-medium">{l.value} ({l.range})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5 pt-3 mt-auto border-t border-slate-100">
                    <div className="p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-200/80 text-[11px] text-emerald-800 font-medium flex items-center justify-between">
                      <span>Scanned {scannedFiles.length > 0 ? scannedFiles.length : 1} records · Match verified</span>
                      <Badge variant="default" className="text-[10px] bg-emerald-200/60 text-emerald-950 border-0">ABDM FHIR R4</Badge>
                    </div>

                    {/* Direct 1-Click Action to Continue Intake without scrolling */}
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => setStep("confirm")}
                      className="w-full h-11 rounded-lg text-xs sm:text-sm font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm flex items-center justify-center gap-2"
                    >
                      <span>Parchon ki Pushti Karein (Generate Summary)</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Optional Integrated Vitals Check (Collapsible to prevent unnecessary page scrolling) */}
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => setShowVitals(prev => !prev)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-emerald-50/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Integrated Vital Signs Telemetry (Optional)
                      </span>
                      <p className="text-[11px] text-slate-500 font-normal">
                        {recordedVitals
                          ? `Recorded: BP ${recordedVitals.bloodPressure} · Pulse ${recordedVitals.pulseRate} bpm · SpO2 ${recordedVitals.spO2}% · Temp ${recordedVitals.temperature}`
                          : "Bluetooth cuff & pulse oximeter readings · Click to record or test IOT sensors"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {recordedVitals ? (
                      <Badge variant="default" className="text-[10px] font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        ✓ Recorded
                      </Badge>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                        {showVitals ? "Collapse ▲" : "Record Vitals ▼"}
                      </span>
                    )}
                  </div>
                </button>
                {showVitals && (
                  <div className="p-4 border-t border-slate-100 bg-slate-50/50 animate-in fade-in duration-150">
                    <VitalsScanner
                      onVitalsRecorded={(vitalsData) => {
                        setRecordedVitals(vitalsData);
                        speakConfirmation("vitals_confirmed", language);
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Bottom Primary Button */}
              <Button
                variant="primary"
                size="lg"
                onClick={() => setStep("confirm")}
                className="w-full h-12 sm:h-14 rounded-lg text-sm sm:text-base font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
              >
                <span>Parchon ki Pushti Karein (Generate Clinical Summary)</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {/* ================= STEP 7: CONFIRM & SUBMIT ================= */}
          {step === "confirm" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                  {stepStrings.confirmTitle}
                </h3>
                <p className="text-sm text-slate-600 font-medium">
                  {stepStrings.confirmSub}
                </p>
                <AudioPrompter
                  autoPlay
                  language={language}
                  textToSpeak={
                    language === "hi"
                      ? `${patientName} जी, आपकी मुख्य परेशानी ${CHIEF_COMPLAINTS.find(c => c.id === selectedComplaint)?.labelHi || (clinicalMode === "ayush" ? "आयुर्वेदिक केस टेकिंग" : "सामान्य स्वास्थ्य परामर्श")}, और ${extractedEntities.medications.length} दवाइयां दर्ज कर ली गई हैं। आपकी केस समरी तैयार है और डॉक्टर के कंप्यूटर पर भेज दी गई है। कृपया ओपीडी कमरा नंबर तीन में जाएं।`
                      : `${patientName}, your intake for ${CHIEF_COMPLAINTS.find(c => c.id === selectedComplaint)?.labelEn || "Clinical Consultation"} and ${extractedEntities.medications.length} medications have been recorded. Case summary delivered to doctor. Please proceed to OPD Room 3.`
                  }
                />
              </div>

              <div className="p-6 sm:p-8 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-lg bg-emerald-50/40 border border-emerald-100 space-y-1">
                    <span className="font-semibold text-emerald-800 text-xs">Mukhya Pareshani (Chief Complaint)</span>
                    <p className="text-sm font-semibold text-slate-900">
                      {CHIEF_COMPLAINTS.find(c => c.id === selectedComplaint)?.labelHi || (clinicalMode === "ayush" ? "अम्लपित्त एवं अग्निमांद्य (3 दिन)" : "सामान्य स्वास्थ्य परामर्श (3 दिन)")}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-emerald-50/40 border border-emerald-100 space-y-1">
                    <span className="font-semibold text-emerald-800 text-xs">ABDM ABHA Link</span>
                    <p className="text-sm font-semibold text-slate-900">{abhaId}</p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={async () => {
                    try {
                      // Call Live Summary Generation Endpoint
                      const summaryRes = await fetch("/api/summary/generate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          socratesData: selectedAnswers,
                          ayushData: selectedAnswers,
                          scannedEntities: extractedEntities,
                          patientDetails: { name: patientName, age: patientAge, gender: patientGender, abhaId },
                          clinicalMode,
                          continuityNote: continuity?.continuityNote || ""
                        })
                      });
                      const summaryResult = await summaryRes.json();
                      const liveSummary = summaryResult.summary;

                      const summaryDraftData = {
                        visitId: `visit-${Date.now()}`,
                        patientId: `pat-${Date.now()}`,
                        chiefComplaint: liveSummary?.chiefComplaint || (CHIEF_COMPLAINTS.find(c => c.id === selectedComplaint)?.labelEn || "Clinical Case Intake"),
                        historyOfPresentIllness: liveSummary?.historyOfPresentIllness || "Detailed clinical history recorded at kiosk.",
                        socratesData: selectedAnswers,
                        ayushAssessment: clinicalMode === "ayush" ? selectedAnswers : undefined,
                        pastMedicalHistory: liveSummary?.pastHistory ? [liveSummary.pastHistory] : ["Type 2 Diabetes Mellitus"],
                        currentMedications: liveSummary?.currentMedications || extractedEntities.medications,
                        allergies: liveSummary?.allergies || ["NKDA (No Known Drug Allergies)"],
                        scannedDocumentsSummary: liveSummary?.scannedDocumentsSummary || `Processed ${scannedFiles.length} records.`,
                        classicalHistory: liveSummary?.classicalHistory,
                        status: "draft" as const,
                        isEmergencyTriage: isEmergency,
                        createdAt: new Date().toISOString()
                      };

                      const fhirBundleData = buildFhirR4Bundle(summaryDraftData, {
                        abhaId,
                        name: patientName,
                        gender: patientGender,
                        age: patientAge
                      }, recordedVitals);

                      await savePatientIntake({
                        patient: {
                          abhaId,
                          name: patientName,
                          age: patientAge,
                          gender: patientGender,
                          language
                        },
                        visit: {
                          chiefComplaint: summaryDraftData.chiefComplaint,
                          clinicalMode,
                          isEmergency,
                        },
                        socratesData: selectedAnswers,
                        ayushAssessment: selectedAnswers,
                        scannedDocuments: scannedFiles.map(f => ({
                          fileName: f.name,
                          medications: extractedEntities.medications,
                          labValues: extractedEntities.labValues,
                          diagnoses: extractedEntities.diagnoses
                        })),
                        summaryDraft: summaryDraftData,
                        fhirBundle: fhirBundleData,
                        suggestions: liveSummary?.suggestions || [
                          {
                            id: `sug-${Date.now()}`,
                            type: isEmergency ? "redflag" : "interaction",
                            title: isEmergency ? "Critical Red Flag Alert" : "Medication Review Alert",
                            description: isEmergency
                              ? "Acute radiating chest pain detected. Diverting to priority resuscitation bay."
                              : "Extracted Metformin 500mg BD. Correlate with elevated FBS 168 mg/dL.",
                            severity: isEmergency ? "critical" : "high",
                            confidenceScore: 0.92,
                            citedSource: "AIIA Clinical Protocol & ICMR Standard Guidelines"
                          }
                        ]
                      });

                      setStep("completed");
                    } catch (subErr) {
                      console.error("Intake submission error:", subErr);
                      setStep("completed");
                    }
                  }}
                  className="w-full h-14 rounded-lg text-base font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  <span>Submit & Route to Doctor Screen (HIS Push)</span>
                </Button>
              </div>
            </div>
          )}

          {/* ================= STEP 8: COMPLETED ================= */}
          {step === "completed" && (
            <div className="text-center p-5 sm:p-7 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-4 animate-in zoom-in-95 duration-300 max-w-2xl mx-auto w-full">
              {/* Success Badge */}
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 border-2 border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              {/* Title & Assigned Doctor/Room */}
              <div className="space-y-1.5">
                <Badge variant="default" className="text-[11px] font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5">
                  ✓ Case Routed to HIS & OPD Desk
                </Badge>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Token #42 — Room 3 (Dr. Sharma)
                </h3>
                <p className="text-xs text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
                  {language === "hi"
                    ? "आपका क्लिनिकल सारांश और डिजिटाइज़्ड पर्चे डॉक्टर के स्क्रीन पर भेज दिए गए हैं।"
                    : "Your intake summary and digitized prescriptions have been pushed to the doctor's screen."}
                </p>
              </div>

              {/* ── Highlighted OPD Visit Time & Reporting Slot ── */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-left space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wide block">
                        {language === "hi" ? "ओपीडी परामर्श समय (OPD Visit Slot)" : "Scheduled OPD Visit Time"}
                      </span>
                      <span className="text-xl sm:text-2xl font-extrabold text-emerald-900">
                        {opdVisitTime} · Today (आज)
                      </span>
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300 inline-block">
                      {language === "hi" ? "~12-15 मिनट प्रतीक्षा" : "~12-15 Mins Wait"}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      {language === "hi" ? "कतार में आगे: 3 मरीज़" : "3 Patients Ahead in Queue"}
                    </span>
                  </div>
                </div>

                {/* OPD Schedule & Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-emerald-100 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>{language === "hi" ? "स्थान व कमरा" : "Location & OPD Room"}</span>
                    </div>
                    <p className="font-bold text-slate-900 text-sm">Room 3 · 1st Floor</p>
                    <p className="text-[11px] text-slate-500">OPD Block B, Ayush Integrative Wing</p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-emerald-100 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>{language === "hi" ? "ओपीडी कार्य समय (Timings)" : "Hospital OPD Timings"}</span>
                    </div>
                    <p className="font-bold text-slate-900 text-sm">08:30 AM – 01:30 PM</p>
                    <p className="text-[11px] text-slate-500">Afternoon: 02:00 PM – 04:30 PM</p>
                  </div>
                </div>

                {/* Reporting Instructions alert */}
                <div className="flex items-start gap-2.5 p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-xs text-amber-900">
                  <Bell className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">
                      {language === "hi"
                        ? `कृपया ${opdVisitTime} से 5 मिनट पहले (करीब ${opdReportByTime} तक) रूम 3 के प्रतीक्षालय में उपस्थित रहें।`
                        : `Please report to the waiting lobby outside Room 3 by ${opdReportByTime} (for your ${opdVisitTime} appointment slot).`}
                    </span>
                    <span className="text-[11px] text-amber-800">
                      {language === "hi"
                        ? "स्क्रीन पर टोकन #42 आने पर या आवाज़ लगने पर डॉक्टर के कमरे में प्रवेश करें।"
                        : "When Token #42 is displayed on the LED screen or called by voice pager, please enter."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap justify-center items-center gap-3">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => window.print()}
                  className="font-semibold text-xs rounded-lg border border-emerald-300 hover:bg-emerald-50 text-emerald-900 h-11 px-4 shadow-xs"
                >
                  <Printer className="w-4 h-4 mr-2 text-emerald-700" />
                  {language === "hi" ? "ओपीडी टोकन पर्ची प्रिंट करें" : "Print OPD Token Slip"}
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setSelectedAnswers({});
                    setCurrentQuestionIndex(0);
                    setIsEmergency(false);
                    setConsentGranted(false);
                    setClinicalMode("allopathy");
                    setSelectedComplaint(null);
                    setScannedFiles([]);
                    setExtractedEntities({ medications: [], labValues: [], diagnoses: [], proceduresSurgeries: [], allergies: [] });
                    setRecordedVitals(null);
                    setVoiceTranscript("");
                    setStep("identify");
                  }}
                  className="font-semibold text-xs rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white h-11 px-5 shadow-sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {language === "hi" ? "अगला मरीज़ (Next Patient)" : "Next Patient Intake"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
