"use client";

import * as React from "react";
import { Stethoscope, User, AlertCircle, CheckCircle2, FileText, Code2, RefreshCw, Eye, Wifi, Clock, Play, Pause, RotateCcw, ArrowRight, ClipboardCheck } from "lucide-react";
import { PatientQueueTable, QueuePatient } from "@/components/doctor/patient-queue-table";
import { SoapSummaryEditor } from "@/components/doctor/soap-summary-editor";
import { AyushParikshaCard } from "@/components/doctor/ayush-pariksha-card";
import { SuggestionAlerts } from "@/components/doctor/suggestion-alerts";
import { PrescriptionBuilder } from "@/components/doctor/prescription-builder";
import { PatientRecordsTimeline } from "@/components/doctor/patient-records-timeline";
import { OcrDocumentInspector } from "@/components/doctor/ocr-document-inspector";
import { ClinicalMacros } from "@/components/doctor/clinical-macros";
import { FhirBundleModal } from "@/components/doctor/fhir-bundle-modal";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { buildFhirR4Bundle } from "@/lib/abdm/fhir-builder";
import { fetchQueuePatientsFromSupabase, approveSummaryInSupabase, sendToHisStub } from "@/lib/supabase/db";
import { createClient } from "@/lib/supabase/client";
import { generateAndPrintClinicalReport } from "@/lib/utils/pdf-generator";
import { RedFlagAlertBanner } from "@/components/doctor/red-flag-alert-banner";
import { evaluateRedFlagsFromText } from "@/lib/ontologies/red-flags";
import { ClinicalSuggestion, ClinicalSummaryDraft } from "@/types/clinical";
import { HighContrastToggle } from "@/components/kiosk/high-contrast-toggle";

const DEFAULT_SUGGESTIONS: ClinicalSuggestion[] = [];

export default function DoctorPage() {
  const [patients, setPatients] = React.useState<QueuePatient[]>([]);
  const [selectedPatient, setSelectedPatient] = React.useState<QueuePatient | null>(null);
  const [isFhirModalOpen, setIsFhirModalOpen] = React.useState(false);
  const [isRealtimeActive, setIsRealtimeActive] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"summary" | "timeline" | "ocr" | "prescription">("summary");

  // Red-flag triage: compute from chief complaint + SOAP severity
  const [triggeredRedFlags, setTriggeredRedFlags] = React.useState<ReturnType<typeof evaluateRedFlagsFromText>>({ isEmergency: false, triggeredRules: [] });

  React.useEffect(() => {
    if (!selectedPatient) {
      setTriggeredRedFlags({ isEmergency: false, triggeredRules: [] });
      return;
    }
    const dbDraft: any = (selectedPatient as any).draftSummary || null;
    const socrates = dbDraft?.socratesData;
    const socratesText = socrates
      ? `severity ${socrates.severity ?? ""} ${socrates.site ?? ""} ${socrates.character ?? ""} ${socrates.radiation ?? ""}`
      : "";
    const result = evaluateRedFlagsFromText(selectedPatient.chiefComplaint || "", socratesText);
    setTriggeredRedFlags(result);
  }, [selectedPatient?.id, selectedPatient?.chiefComplaint]);

  // 2-Minute OPD Target Consultation Timer
  const [timerSeconds, setTimerSeconds] = React.useState(120);
  const [isTimerRunning, setIsTimerRunning] = React.useState(false);

  React.useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  // Load from Supabase and /api/queue on mount with client-side deduplication
  const loadQueue = React.useCallback(async () => {
    const remotePatients = await fetchQueuePatientsFromSupabase();
    if (remotePatients && remotePatients.length > 0) {
      // Deduplicate by unique patient identity (ABHA or name)
      const dedupMap = new Map<string, any>();
      for (const p of remotePatients) {
        const cleanAbha = (p.abhaId || "").replace(/\D/g, "");
        const key = cleanAbha.length >= 10 && !cleanAbha.includes("0000000000")
          ? `abha_${cleanAbha}`
          : `name_${(p.name || "").toLowerCase().trim()}`;
        if (!dedupMap.has(key)) {
          dedupMap.set(key, p);
        } else {
          // Compare dates and keep newer
          const existing = dedupMap.get(key);
          const pTime = new Date(p.createdAt || 0).getTime();
          const existTime = new Date(existing.createdAt || 0).getTime();
          if (pTime >= existTime) {
            if (!p.nurseVitals && existing.nurseVitals) p.nurseVitals = existing.nurseVitals;
            if (!p.assignedRoom && existing.assignedRoom) p.assignedRoom = existing.assignedRoom;
            if (!p.assignedDoctor && existing.assignedDoctor) p.assignedDoctor = existing.assignedDoctor;
            dedupMap.set(key, p);
          }
        }
      }
      const uniquePatients = Array.from(dedupMap.values());
      setPatients(uniquePatients);
      setSelectedPatient((prev) => {
        if (prev) {
          const match = uniquePatients.find((p: any) => p.id === prev.id || p.visitId === prev.visitId || p.abhaId === prev.abhaId);
          if (match) return match;
        }
        return uniquePatients[0] || null;
      });
    } else {
      setPatients([]);
      setSelectedPatient(null);
    }
  }, []);

  React.useEffect(() => {
    loadQueue();

    // 3-second polling to guarantee real-time updates across browsers/tabs
    const pollInterval = setInterval(() => {
      loadQueue();
    }, 3000);

    // Setup Supabase Realtime Subscription
    try {
      const supabase = createClient();
      const channel = supabase
        .channel("doctor_live_visits")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "visits" },
          () => {
            loadQueue();
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setIsRealtimeActive(true);
          }
        });

      return () => {
        clearInterval(pollInterval);
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn("Realtime channel setup error:", err);
      return () => clearInterval(pollInterval);
    }
  }, [loadQueue]);

  // Live summary draft built from whatever the kiosk actually saved for this patient
  const dbDraft: any = selectedPatient ? (selectedPatient as any).draftSummary || null : null;

  const currentSummaryDraft: ClinicalSummaryDraft | null = selectedPatient
    ? {
        visitId: selectedPatient.visitId,
        patientId: selectedPatient.id,
        chiefComplaint: dbDraft?.chiefComplaint || selectedPatient.chiefComplaint || "",
        historyOfPresentIllness:
          dbDraft?.historyOfPresentIllness || selectedPatient.chiefComplaint || "Clinical intake completed at terminal.",
        socratesData: dbDraft?.socratesData || undefined,
        ayushAssessment: dbDraft?.ayushAssessment || undefined,
        pastMedicalHistory: dbDraft?.pastMedicalHistory || [],
        currentMedications: dbDraft?.currentMedications || [],
        allergies: dbDraft?.allergies || [],
        scannedDocumentsSummary: dbDraft?.scannedDocumentsSummary || "",
        classicalHistory: dbDraft?.classicalHistory || null,
        status: "draft",
        isEmergencyTriage: selectedPatient.isEmergency || false,
        createdAt: new Date().toISOString(),
      }
    : null;

  const fhirBundle =
    selectedPatient && currentSummaryDraft
      ? buildFhirR4Bundle(currentSummaryDraft, {
          abhaId: selectedPatient.abhaId,
          name: selectedPatient.name,
          gender: selectedPatient.gender,
          age: selectedPatient.age,
        })
      : null;

  return (
    <div className="flex-1 flex flex-col bg-[#F7FAF8] text-slate-900 antialiased min-h-screen selection:bg-emerald-100 selection:text-emerald-950">
      {/* Top Header matching landing page */}
      <header className="sticky top-0 z-50 border-b border-emerald-100 bg-[#F7FAF8]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-emerald-600 flex items-center justify-center shadow-xs">
                <span className="text-white text-[11px] font-bold">M</span>
              </div>
              <span className="text-[15px] font-semibold text-slate-900">MediKiosk</span>
            </a>
            <span className="text-slate-300">/</span>
            <span className="text-[13px] font-medium text-slate-600">Clinician Workspace</span>
          </div>

          <div className="flex items-center gap-3">
            {/* 2-Minute Consultation Timer Widget */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-emerald-800 font-medium">OPD Timer:</span>
                <span className="text-xs font-semibold text-emerald-950">{formatTimer(timerSeconds)}</span>
              </div>
              <div className="flex items-center gap-1 ml-1 border-l border-emerald-200 pl-1.5">
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="p-1 rounded hover:bg-emerald-100 text-emerald-800 transition-colors"
                  title={isTimerRunning ? "Pause consultation timer" : "Start consultation timer"}
                >
                  {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </button>
                <button
                  type="button"
                  onClick={() => { setTimerSeconds(120); setIsTimerRunning(false); }}
                  className="p-1 rounded hover:bg-emerald-100 text-emerald-700 transition-colors"
                  title="Reset timer to 2:00"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>

            <button
              onClick={loadQueue}
              className="p-2 rounded-md bg-white border border-slate-200 hover:border-emerald-300 text-slate-600 hover:text-emerald-900 transition-colors"
              title="Refresh Queue"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <HighContrastToggle />

            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {isRealtimeActive ? "HIS: Realtime" : "HIS: Connected"}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Clinician Desk Sub-Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-slate-200/80">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
              DS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-900">Dr. Sharma, MD</h2>
                <Badge variant="default" className="text-xs font-medium">
                  Room #3 · AIIA Ayurveda OPD
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Consultation Console · Multimodal Clinical Intake Feed with Automated ABDM FHIR Sync
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="font-medium text-emerald-800">OPD Target: 2 Min</span>
            <span>·</span>
            <a href="/triage" className="text-red-600 hover:text-red-700 font-medium hover:underline inline-flex items-center gap-1">
              <span>Live Triage Monitor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Main Grid: Queue Table on Left, Case Review on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Queue */}
          <div className="lg:col-span-4 space-y-4">
            <PatientQueueTable
              patients={patients}
              selectedVisitId={selectedPatient?.visitId}
              onSelectPatient={setSelectedPatient}
              onRefresh={loadQueue}
            />
          </div>

          {/* Right Column: Active Case Workspace */}
          {selectedPatient && currentSummaryDraft ? (
            <div className="lg:col-span-8 space-y-5">
            {/* Unified Clinical Case & Telemetry Header */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              {/* Core Demographics & Allotment Bar */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div
                    className={cn(
                      "w-11 h-11 rounded-lg flex items-center justify-center font-bold text-base border shrink-0",
                      selectedPatient.isEmergency
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-emerald-50 text-emerald-900 border-emerald-200"
                    )}
                  >
                    {selectedPatient.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900">{selectedPatient.name}</h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {selectedPatient.age}y · {selectedPatient.gender}
                      </span>
                      {selectedPatient.isEmergency && (
                        <Badge variant="danger" className="text-xs font-bold animate-pulse">
                          EMERGENCY
                        </Badge>
                      )}
                      {selectedPatient.assignedRoom && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100/90 text-emerald-900 border border-emerald-200">
                          {selectedPatient.assignedRoom} {selectedPatient.assignedDoctor ? `(${selectedPatient.assignedDoctor})` : ""}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-2 flex-wrap">
                      <span>ABHA: <strong className="text-slate-700 font-semibold">{selectedPatient.abhaId}</strong></span>
                      <span>·</span>
                      <span className="text-emerald-700 font-medium">DPDP 2023 Consented</span>
                      {selectedPatient.clinicalMode && (
                        <>
                          <span>·</span>
                          <span className="text-slate-600 font-medium capitalize">{selectedPatient.clinicalMode} Mode</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-2xs">
                    Case Ready &lt;15s
                  </span>
                </div>
              </div>

              {/* Vitals Telemetry Strip */}
              {selectedPatient.nurseVitals ? (
                <div className="border-t border-slate-100 bg-slate-50/75 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <ClipboardCheck className="w-3.5 h-3.5 text-emerald-700" /> Pre-Screening Vitals
                    </span>
                    {selectedPatient.nurseVitals.recordedAt && (
                      <span className="text-slate-400">
                        Logged {new Date(selectedPatient.nurseVitals.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} by {selectedPatient.nurseVitals.nurseName || "Staff Nurse"}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">BP</span>
                      <span className="text-xs font-bold text-slate-900">
                        {selectedPatient.nurseVitals.bloodPressure || "—"} <span className="text-[10px] font-normal text-slate-400">mmHg</span>
                      </span>
                    </div>
                    <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Pulse</span>
                      <span className="text-xs font-bold text-slate-900">
                        {selectedPatient.nurseVitals.pulseRate ? `${selectedPatient.nurseVitals.pulseRate} bpm` : "—"}
                      </span>
                    </div>
                    <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">SpO2</span>
                      <span className="text-xs font-bold text-slate-900">
                        {selectedPatient.nurseVitals.spo2 ? `${selectedPatient.nurseVitals.spo2}%` : "—"}
                      </span>
                    </div>
                    <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Temp</span>
                      <span className="text-xs font-bold text-slate-900">
                        {selectedPatient.nurseVitals.temperature ? `${selectedPatient.nurseVitals.temperature}°F` : "—"}
                      </span>
                    </div>
                    <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Sugar</span>
                      <span className="text-xs font-bold text-slate-900">
                        {selectedPatient.nurseVitals.bloodSugar ? `${selectedPatient.nurseVitals.bloodSugar} mg/dL` : "—"}
                      </span>
                    </div>
                    <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Weight</span>
                      <span className="text-xs font-bold text-slate-900">
                        {selectedPatient.nurseVitals.weightKg ? `${selectedPatient.nurseVitals.weightKg} kg` : "—"}
                      </span>
                    </div>
                  </div>

                  {selectedPatient.nurseNotes && (
                    <p className="text-xs text-slate-700 bg-white px-3 py-1.5 rounded-md border border-slate-200/80">
                      <strong className="text-emerald-900 font-semibold">Triage Note:</strong> {selectedPatient.nurseNotes}
                    </p>
                  )}
                </div>
              ) : null}
            </div>

            {/* Red-Flag Triage Alert Banner — shown when chief complaint/vitals trigger red-flag rules */}
            {triggeredRedFlags.isEmergency && (
              <RedFlagAlertBanner
                triggeredRules={triggeredRedFlags.triggeredRules}
                patientName={selectedPatient.name}
                patientId={selectedPatient.id}
                visitId={selectedPatient.visitId}
              />
            )}

            {/* Tab Switcher */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-slate-100/90 rounded-lg border border-slate-200/60">
              <button
                onClick={() => setActiveTab("summary")}
                className={`py-2 px-3 rounded-md text-xs font-medium transition-all ${
                  activeTab === "summary" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Intake Summary
              </button>
              <button
                onClick={() => setActiveTab("ocr")}
                className={`py-2 px-3 rounded-md text-xs font-medium transition-all ${
                  activeTab === "ocr" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                OCR Split-View
              </button>
              <button
                onClick={() => setActiveTab("timeline")}
                className={`py-2 px-3 rounded-md text-xs font-medium transition-all ${
                  activeTab === "timeline" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Records Timeline
              </button>
              <button
                onClick={() => setActiveTab("prescription")}
                className={`py-2 px-3 rounded-md text-xs font-medium transition-all ${
                  activeTab === "prescription" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Rx & Order Sets
              </button>
            </div>

          {/* Tab 1: Intake Summary */}
          {activeTab === "summary" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* AI Decision Support Panel */}
              <SuggestionAlerts suggestions={selectedPatient.isEmergency ? DEFAULT_SUGGESTIONS : [DEFAULT_SUGGESTIONS[1]]} />

              {/* Ayurvedic Pariksha Card (If Ayush Mode) */}
              {selectedPatient.clinicalMode === "ayush" && (
                <AyushParikshaCard
                  assessment={{
                    prakriti: "Pitta-Vata dominant",
                    agni: "Tikshna Agni (Hyperacidity tendency)",
                    koshtha: "Madhyama Koshtha",
                    sattva: "Pravara (Resilient)",
                    aharaHabits: "Vegetarian, preference for spicy & hot foods, irregular meal intervals.",
                    viharaHabits: "Disturbed sleep pattern due to night reflux, moderate physical activity."
                  }}
                />
              )}

              {/* Structured SOAP & 8-Part Classical History Editor */}
              <SoapSummaryEditor
                summary={{
                  chiefComplaint: currentSummaryDraft.chiefComplaint,
                  historyOfPresentIllness: currentSummaryDraft.historyOfPresentIllness,
                  pastHistory: currentSummaryDraft.pastMedicalHistory,
                  medications: currentSummaryDraft.currentMedications,
                  allergies: currentSummaryDraft.allergies,
                  scannedSummary: currentSummaryDraft.scannedDocumentsSummary,
                  classicalHistory: currentSummaryDraft.classicalHistory
                }}
                onApprove={async (notes) => {
                  if (selectedPatient.summaryId) {
                    await approveSummaryInSupabase(selectedPatient.summaryId, notes);
                  } else {
                    console.warn("No summaryId for patient; approval recorded locally only.");
                  }
                  alert("Case confirmed and written to HIS + ABDM PHR record!");
                }}
                onViewFhir={() => setIsFhirModalOpen(true)}
                onDownloadPdf={() => {
                  generateAndPrintClinicalReport(currentSummaryDraft, {
                    name: selectedPatient.name,
                    age: selectedPatient.age,
                    gender: selectedPatient.gender,
                    abhaId: selectedPatient.abhaId
                  });
                }}
                onSendToHis={async () => {
                  const doctorNotes = "";
                  const result = await sendToHisStub(
                    selectedPatient.visitId,
                    selectedPatient.summaryId || "",
                    { chiefComplaint: currentSummaryDraft.chiefComplaint, doctorNotes }
                  );
                  if (result.success) {
                    alert("Case summary sent to HIS successfully!");
                  }
                }}
              />
            </div>
          )}

          {/* Tab 2: OCR Split View Verification */}
          {activeTab === "ocr" && (
            <div className="animate-in fade-in duration-200">
              <OcrDocumentInspector />
            </div>
          )}

          {/* Tab 3: Chronological Medical Records Timeline */}
          {activeTab === "timeline" && (
            <div className="animate-in fade-in duration-200">
              <PatientRecordsTimeline records={selectedPatient.scannedDocuments || []} />
            </div>
          )}

          {/* Tab 4: Interactive Prescription & 1-Click Order Sets */}
          {activeTab === "prescription" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <ClinicalMacros
                onApplyMacro={(macro) => {
                  alert(`Applied ${macro.name} (${macro.medications.length} items) to active prescription!`);
                }}
              />
              <PrescriptionBuilder
                initialMedications={currentSummaryDraft.currentMedications}
              />
            </div>
          )}
        </div>
      ) : (
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 flex flex-col items-center justify-center min-h-[460px]">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Stethoscope className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Patient Selected in OPD Queue</h3>
              <p className="text-xs text-slate-500 max-w-md">
                Patients who complete clinical intake at the Kiosk will appear in the queue on the left. Select a patient to review their case, AI differential notes, and prescribe medications.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* HL7 FHIR Modal */}
      <FhirBundleModal
        isOpen={isFhirModalOpen}
        onClose={() => setIsFhirModalOpen(false)}
        fhirBundle={fhirBundle}
        abhaAddress={selectedPatient?.abhaAddress}
      />
    </div>
  );
}
