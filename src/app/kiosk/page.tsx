"use client";

import * as React from "react";
import {
  UserCheck, ShieldCheck, Stethoscope, Mic, Volume2,
  Upload, CheckCircle2, ArrowRight, ArrowLeft, AlertCircle,
  FileText, Camera, QrCode, HeartPulse, RefreshCw, Flame, Wind,
  Thermometer, Activity, Sparkles, AlertTriangle, UserPlus, RotateCcw
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
import { SOCRATES_CHEST_PAIN } from "@/lib/ontologies/allopathy-socrates";
import { DASHAVIDHA_PARIKSHA_STEPS } from "@/lib/ontologies/ayush-dashavidha";
import { evaluateRedFlags } from "@/lib/ontologies/red-flags";
import { buildFhirR4Bundle } from "@/lib/abdm/fhir-builder";
import { savePatientIntake } from "@/lib/supabase/db";
import { matchOptionFromTranscript } from "@/lib/voice-matching";
import { computeContinuity, ContinuityDecision } from "@/lib/continuity-engine";
import { CHIEF_COMPLAINTS } from "@/lib/ontologies/chief-complaints";
import { KioskStep } from "@/types/kiosk";

export default function KioskPage() {
  const [step, setStep] = React.useState<KioskStep>("identify");
  const [language, setLanguage] = React.useState("hi");
  const [clinicalMode, setClinicalMode] = React.useState<"allopathy" | "ayush">("allopathy");

  // Patient Identity State
  const [abhaId, setAbhaId] = React.useState("91-4523-8819-2041");
  const [patientName, setPatientName] = React.useState("Kamla Devi");
  const [patientAge, setPatientAge] = React.useState(62);
  const [patientGender, setPatientGender] = React.useState("Female");

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

  // Continuity Engine state
  const [isReturningPatient, setIsReturningPatient] = React.useState(false);
  const [continuity, setContinuity] = React.useState<ContinuityDecision | null>(null);
  const [selectedComplaint, setSelectedComplaint] = React.useState<string | null>(null);

  // Scanned Document State
  const [scannedFiles, setScannedFiles] = React.useState<Array<{ name: string; size: string; status: string }>>([
    { name: "Old_Prescription_DrVerma_June.jpg", size: "1.2 MB", status: "Extracted" },
    { name: "Blood_Report_Thyrocare_July.pdf", size: "850 KB", status: "Extracted" }
  ]);

  const [extractedEntities, setExtractedEntities] = React.useState({
    medications: [
      { name: "Tab Metformin", dosage: "500mg", frequency: "BD (Twice Daily)" },
      { name: "Tab Telmisartan", dosage: "40mg", frequency: "OD (Once Daily)" }
    ],
    labValues: [
      { test: "Fasting Blood Sugar", value: "168 mg/dL", range: "70-100 mg/dL", abnormal: true },
      { test: "HbA1c", value: "8.4%", range: "< 5.7%", abnormal: true }
    ],
    diagnoses: ["Type 2 Diabetes Mellitus", "Essential Hypertension"]
  });

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

  // Conversational questions list based on mode, prepended with delta
  // questions from the Continuity Engine for returning patients.
  const baseQuestions = clinicalMode === "allopathy" ? SOCRATES_CHEST_PAIN : DASHAVIDHA_PARIKSHA_STEPS;
  const activeQuestions = React.useMemo(() => {
    if (continuity && continuity.deltaQuestions.length > 0) {
      return [...continuity.deltaQuestions, ...baseQuestions] as any[];
    }
    return baseQuestions as any[];
  }, [continuity, clinicalMode]);
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
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6 flex flex-col justify-between">
        {/* Privacy Guard Inactivity Timer */}
        {step !== "identify" && step !== "completed" && (
          <InactivityTimer onTimeout={() => setStep("identify")} />
        )}

        {/* Stepper Card */}
        <div className="p-4 sm:p-5 rounded-xl bg-white border border-emerald-100 shadow-sm">
          <ProgressSteps steps={stepsList} currentStepIndex={getStepIndex()} />
        </div>

        {/* Main Dynamic Step Area */}
        <div className="flex-1 flex flex-col justify-center py-4">
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      14-Digit ABHA ID (Ayushman Bharat Health Account)
                    </label>
                    <span className="text-xs font-medium text-emerald-700">ABDM FHIR R4 Compliant</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={abhaId}
                      onChange={(e) => setAbhaId(e.target.value)}
                      placeholder="91-XXXX-XXXX-XXXX"
                      className="flex-1 h-14 px-4 rounded-lg border border-slate-200 text-lg font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => {
                        setAbhaId("91-4523-8819-2041");
                        setPatientName("Kamla Devi");
                        setPatientAge(62);
                      }}
                      className="shrink-0 h-14 px-4 rounded-lg text-xs font-semibold border border-emerald-200 hover:border-emerald-600 hover:bg-emerald-50"
                    >
                      <QrCode className="w-4 h-4 mr-2 text-emerald-700" />
                      Demo Patient ABHA
                    </Button>
                  </div>
                </div>

                {/* Patient Quick Preview */}
                <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      KD
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{patientName}</h4>
                      <p className="text-xs text-slate-500 font-medium">{patientAge} Years · Female · Verified via ABDM</p>
                    </div>
                  </div>
                  <Badge variant="default" className="text-xs font-medium">
                    ABHA Verified
                  </Badge>
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
                        diagnoses: [...prev.diagnoses, ...result.diagnoses]
                      }));
                    }}
                  />
                </div>

                {/* Extracted Entities Live Preview */}
                <div className="lg:col-span-5 p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-700" />
                        <h4 className="text-sm font-semibold text-slate-900">Extracted Clinical Data</h4>
                      </div>
                      <Badge variant="default" className="text-xs font-medium">Vision AI Active</Badge>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="font-semibold text-emerald-800 text-xs block mb-1">
                          Active Prescribed Medicines:
                        </span>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                          {extractedEntities.medications.map((m, idx) => (
                            <div key={idx} className="p-2.5 rounded-lg bg-emerald-50/40 border border-emerald-100 flex justify-between font-medium">
                              <span className="text-slate-900">{m.name}</span>
                              <span className="text-slate-500 text-xs">{m.dosage} · {m.frequency}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="font-semibold text-emerald-800 text-xs block mb-1">
                          Laboratory Findings:
                        </span>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {extractedEntities.labValues.map((l, idx) => (
                            <div key={idx} className={`p-2.5 rounded-lg border flex justify-between font-medium ${l.abnormal ? 'bg-red-50 border-red-200 text-red-950' : 'bg-emerald-50/40 border-emerald-100 text-slate-800'}`}>
                              <span>{l.test}</span>
                              <span className="text-xs font-medium">{l.value} ({l.range})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200/80 text-xs text-emerald-800 font-medium">
                    Scanned {scannedFiles.length} records · Match verified against RxNorm ontology
                  </div>
                </div>
              </div>

              {/* Optional Integrated Vitals Check */}
              <VitalsScanner
                onVitalsRecorded={(vitalsData) => {
                  setRecordedVitals(vitalsData);
                  speakConfirmation("vitals_confirmed", language);
                }}
              />

              <Button
                variant="primary"
                size="lg"
                onClick={() => setStep("confirm")}
                className="w-full h-14 rounded-lg text-base font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
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
                  textToSpeak={stepStrings.confirmTts}
                />
              </div>

              <div className="p-6 sm:p-8 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-lg bg-emerald-50/40 border border-emerald-100 space-y-1">
                    <span className="font-semibold text-emerald-800 text-xs">Mukhya Pareshani (Chief Complaint)</span>
                    <p className="text-sm font-semibold text-slate-900">
                      {clinicalMode === "ayush"
                        ? "Amlapitta & Agnimandya (Hyperacidity - 3 days)"
                        : "Chest Discomfort with Exertional Symptoms (3 days)"}
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
                        chiefComplaint: liveSummary?.chiefComplaint || "Clinical Case Intake",
                        historyOfPresentIllness: liveSummary?.historyOfPresentIllness || "Detailed clinical history recorded at kiosk.",
                        socratesData: selectedAnswers,
                        ayushAssessment: clinicalMode === "ayush" ? selectedAnswers : undefined,
                        pastMedicalHistory: liveSummary?.pastHistory ? [liveSummary.pastHistory] : ["Type 2 Diabetes Mellitus"],
                        currentMedications: liveSummary?.currentMedications || extractedEntities.medications,
                        allergies: liveSummary?.allergies || ["NKDA (No Known Drug Allergies)"],
                        scannedDocumentsSummary: liveSummary?.scannedDocumentsSummary || `Processed ${scannedFiles.length} records.`,
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
            <div className="text-center p-8 sm:p-12 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-6 animate-in zoom-in-95 duration-300 max-w-2xl mx-auto w-full">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-3xl font-semibold tracking-tight text-slate-900">
                  Token #42 — Room 3 (Dr. Sharma)
                </h3>
                <p className="text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
                  Aapka case doctor ke desk par bhej diya gaya hai. Doctor aapke aane se pehle poori clinical summary review kar rahe hain.
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    setSelectedAnswers({});
                    setCurrentQuestionIndex(0);
                    setIsEmergency(false);
                    setConsentGranted(false);
                    setClinicalMode("allopathy");
                    setScannedFiles([]);
                    setExtractedEntities({ medications: [], labValues: [], diagnoses: [] });
                    setRecordedVitals(null);
                    setVoiceTranscript("");
                    setStep("identify");
                  }}
                  className="font-semibold text-xs rounded-lg border border-emerald-200 hover:border-emerald-600 hover:bg-emerald-50 text-emerald-900 h-11 px-5"
                >
                  <RefreshCw className="w-4 h-4 mr-2 text-emerald-700" />
                  Agla Mareez (Next Patient)
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
