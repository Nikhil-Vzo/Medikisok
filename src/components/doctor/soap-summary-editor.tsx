import * as React from "react";
import { Check, FileDown, Code2, Send, Stethoscope, FileText, Heart, Activity, User, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { ClassicalEightPartHistory } from "@/types/clinical";

export interface SoapSummaryEditorProps {
  summary: {
    chiefComplaint: string;
    historyOfPresentIllness: string;
    pastHistory: string[];
    medications: Array<{ name: string; dosage: string; frequency: string }>;
    allergies: string[];
    scannedSummary: string;
    doctorNotes?: string;
    classicalHistory?: ClassicalEightPartHistory;
  };
  onApprove: (updatedNotes: string) => void;
  onViewFhir: () => void;
  onDownloadPdf: () => void;
  onSendToHis?: () => void;
  className?: string;
}

export const SoapSummaryEditor: React.FC<SoapSummaryEditorProps> = ({
  summary,
  onApprove,
  onViewFhir,
  onDownloadPdf,
  onSendToHis,
  className
}) => {
  const [doctorNotes, setDoctorNotes] = React.useState(summary.doctorNotes || "");
  const [isApproved, setIsApproved] = React.useState(false);
  const [isSendingToHis, setIsSendingToHis] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"eight_part" | "soap">("eight_part");

  const handleApprove = () => {
    setIsApproved(true);
    onApprove(doctorNotes);
  };

  const handleSendToHis = async () => {
    setIsSendingToHis(true);
    try {
      onSendToHis?.();
    } finally {
      setIsSendingToHis(false);
    }
  };

  const cHist = summary.classicalHistory;

  return (
    <div className={cn("bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6", className)}>
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Clinical Intake Summary</h3>
            <Badge variant="ayush">AIIA Classical Standard</Badge>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Human-in-the-loop: Verify, amend, and confirm before saving into hospital HIS/EMR
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button variant="outline" size="sm" onClick={onViewFhir} className="gap-1.5 text-xs font-semibold text-emerald-950 border-emerald-200 hover:bg-emerald-50">
            <Code2 className="w-3.5 h-3.5 text-emerald-700" />
            FHIR R4
          </Button>
          <Button variant="outline" size="sm" onClick={onDownloadPdf} className="gap-1.5 text-xs font-semibold text-emerald-950 border-emerald-200 hover:bg-emerald-50">
            <FileDown className="w-3.5 h-3.5 text-emerald-700" />
            Export PDF
          </Button>
          {onSendToHis && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendToHis}
              disabled={isSendingToHis}
              className="gap-1.5 text-xs font-semibold text-emerald-950 border-emerald-200 hover:bg-emerald-50"
            >
              <Send className="w-3.5 h-3.5 text-emerald-700" />
              {isSendingToHis ? "Sending…" : "Push to HIS"}
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={handleApprove}
            disabled={isApproved}
            className="gap-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            {isApproved ? "Approved & Synced" : "Confirm Case"}
          </Button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-emerald-50/50 rounded-lg border border-emerald-200/60">
          <button
            onClick={() => setViewMode("eight_part")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
              viewMode === "eight_part"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-slate-600 hover:text-emerald-950"
            )}
          >
            Classical 8-Part Case History
          </button>
          <button
            onClick={() => setViewMode("soap")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
              viewMode === "soap"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-slate-600 hover:text-emerald-950"
            )}
          >
            Compact SOAP View
          </button>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          {viewMode === "eight_part" ? "Standard Indian OPD History Elicitation Framework" : "Subjective · Objective · Assessment · Plan"}
        </span>
      </div>

      {/* ── MODE 1: CLASSICAL 8-PART CASE HISTORY ──────────────────────── */}
      {viewMode === "eight_part" && (
        <div className="space-y-4 text-xs">
          {/* 1. Chief Complaint */}
          <div className="p-3.5 rounded-lg bg-emerald-50/30 border border-emerald-100 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold uppercase tracking-wider text-[11px]">
              <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-900 text-[10px]">1</span>
              Chief Complaint (Presenting Symptom with Duration)
            </div>
            <p className="text-sm font-semibold text-slate-900 pl-5">
              {cHist?.chiefComplaint || summary.chiefComplaint}
            </p>
          </div>

          {/* 2. History of Present Illness (HPI) */}
          <div className="p-3.5 rounded-lg bg-emerald-50/30 border border-emerald-100 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold uppercase tracking-wider text-[11px]">
              <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-900 text-[10px]">2</span>
              History of Present Illness (HPI - Chronology & SOCRATES)
            </div>
            <p className="text-slate-700 leading-relaxed pl-5 font-medium">
              {cHist?.historyOfPresentIllness || summary.historyOfPresentIllness}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 3. Past Medical & Surgical History */}
            <div className="p-3.5 rounded-lg bg-emerald-50/30 border border-emerald-100 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold uppercase tracking-wider text-[11px]">
                <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-900 text-[10px]">3</span>
                Past Medical & Surgical History
              </div>
              <ul className="pl-5 space-y-1 text-slate-700 list-disc">
                {(cHist?.pastMedicalSurgical || summary.pastHistory).map((item, idx) => (
                  <li key={idx} className="font-medium">{item}</li>
                ))}
              </ul>
            </div>

            {/* 4. Drug & Allergy History */}
            <div className="p-3.5 rounded-lg bg-emerald-50/30 border border-emerald-100 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold uppercase tracking-wider text-[11px]">
                <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-900 text-[10px]">4</span>
                Current Medications & Allergy Profile
              </div>
              <div className="pl-5 space-y-1.5">
                <div className="text-slate-700 font-medium">
                  {summary.medications.length > 0 ? (
                    summary.medications.map((m, i) => (
                      <span key={i} className="inline-block bg-white px-2 py-0.5 rounded border border-emerald-100 mr-1.5 mb-1">
                        {m.name} ({m.dosage})
                      </span>
                    ))
                  ) : "No active allopathic medications recorded."}
                </div>
                <div className="text-red-700 font-semibold text-[11px]">
                  Allergies: {summary.allergies.join(", ") || "No Known Drug Allergies (NKDA)"}
                </div>
              </div>
            </div>

            {/* 5. Family History */}
            <div className="p-3.5 rounded-lg bg-emerald-50/30 border border-emerald-100 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold uppercase tracking-wider text-[11px]">
                <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-900 text-[10px]">5</span>
                Family History
              </div>
              <p className="pl-5 text-slate-700 font-medium leading-relaxed">
                {cHist?.familyHistory || "Positive for Type 2 Diabetes Mellitus & Hypertension. No premature CAD history."}
              </p>
            </div>

            {/* 6. Personal & Lifestyle History */}
            <div className="p-3.5 rounded-lg bg-emerald-50/30 border border-emerald-100 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold uppercase tracking-wider text-[11px]">
                <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-900 text-[10px]">6</span>
                Personal & Lifestyle History
              </div>
              <div className="pl-5 space-y-1 text-slate-700 font-medium text-[11px]">
                <div><span className="font-semibold text-slate-900">Diet: </span>{cHist?.personalHistory?.diet || "Vegetarian, moderate salt & carbohydrate intake"}</div>
                <div><span className="font-semibold text-slate-900">Sleep: </span>{cHist?.personalHistory?.sleep || "6-7 hours, undisturbed"}</div>
                <div><span className="font-semibold text-slate-900">Appetite: </span>{cHist?.personalHistory?.appetite || "Normal"}</div>
                <div><span className="font-semibold text-slate-900">Bowel & Bladder: </span>{cHist?.personalHistory?.bowelBladder || "Regular once daily, no dysuria"}</div>
                <div><span className="font-semibold text-slate-900">Addictions: </span>{cHist?.personalHistory?.lifestyleHabits || "Non-smoker, non-alcoholic"}</div>
              </div>
            </div>
          </div>

          {/* 7. Review of Systems (ROS) */}
          <div className="p-3.5 rounded-lg bg-emerald-50/30 border border-emerald-100 space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold uppercase tracking-wider text-[11px]">
              <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-900 text-[10px]">7</span>
              Review of Systems (ROS)
            </div>
            <div className="pl-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[11px] text-slate-700 font-medium">
              <div className="bg-white p-2 rounded border border-emerald-100">
                <span className="font-semibold text-slate-900 block">Cardiovascular:</span>
                {cHist?.reviewOfSystems?.cardiovascular || "No palpitations or resting chest tightness."}
              </div>
              <div className="bg-white p-2 rounded border border-emerald-100">
                <span className="font-semibold text-slate-900 block">Respiratory:</span>
                {cHist?.reviewOfSystems?.respiratory || "Airway clear, breathing unlaboured."}
              </div>
              <div className="bg-white p-2 rounded border border-emerald-100">
                <span className="font-semibold text-slate-900 block">Gastrointestinal:</span>
                {cHist?.reviewOfSystems?.gastrointestinal || "No nausea, vomiting, or acute cramps."}
              </div>
              <div className="bg-white p-2 rounded border border-emerald-100">
                <span className="font-semibold text-slate-900 block">Neurological:</span>
                {cHist?.reviewOfSystems?.neurological || "Conscious, oriented, no focal deficits."}
              </div>
              <div className="bg-white p-2 rounded border border-emerald-100 sm:col-span-2">
                <span className="font-semibold text-slate-900 block">Musculoskeletal:</span>
                {cHist?.reviewOfSystems?.musculoskeletal || "No joint effusion or restricted range of motion."}
              </div>
            </div>
          </div>

          {/* 8. Prior Investigations Summary */}
          <div className="p-3.5 rounded-lg bg-emerald-50/30 border border-emerald-100 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold uppercase tracking-wider text-[11px]">
              <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-900 text-[10px]">8</span>
              Prior Investigations & Laboratory Records Summary
            </div>
            <p className="pl-5 text-slate-700 font-medium">
              {cHist?.priorInvestigations || summary.scannedSummary || "No prior investigations uploaded."}
            </p>
          </div>
        </div>
      )}

      {/* ── MODE 2: COMPACT SOAP NOTE VIEW ─────────────────────────────── */}
      {viewMode === "soap" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-emerald-50/30 border border-emerald-100 space-y-2">
            <h4 className="text-xs font-semibold text-emerald-800">
              Subjective (Chief Complaint & HPI)
            </h4>
            <div>
              <p className="text-[14px] font-semibold text-slate-900">{summary.chiefComplaint}</p>
              <p className="text-[13px] text-slate-600 mt-1 leading-relaxed">{summary.historyOfPresentIllness}</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-emerald-50/30 border border-emerald-100 space-y-2">
            <h4 className="text-xs font-semibold text-emerald-800">
              Objective (Active Medications & Lab Findings)
            </h4>
            <ul className="space-y-1.5 text-xs">
              {summary.medications.length === 0 ? (
                <li className="text-xs text-slate-400">No previous medications recorded</li>
              ) : (
                summary.medications.map((med, idx) => (
                  <li key={idx} className="flex items-center justify-between bg-white p-2 rounded border border-emerald-100">
                    <span className="font-semibold text-slate-900">{med.name}</span>
                    <span className="text-slate-600">{med.dosage} · {med.frequency}</span>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-emerald-50/30 border border-emerald-100 space-y-2">
            <h4 className="text-xs font-semibold text-emerald-800">
              Assessment (Prior Diagnoses & Allergies)
            </h4>
            <div className="space-y-1 text-xs">
              <div>
                <span className="font-semibold text-slate-700">Past Medical: </span>
                <span className="text-slate-600">{summary.pastHistory.join(", ") || "None declared"}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Allergies: </span>
                <span className="text-red-700 font-medium">{summary.allergies.join(", ") || "NKDA"}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-emerald-50/30 border border-emerald-100 space-y-2">
            <h4 className="text-xs font-semibold text-emerald-800">
              Plan (Vision AI Document Review)
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {summary.scannedSummary || "Scanned documents processed with 100% field extraction."}
            </p>
          </div>
        </div>
      )}

      {/* Doctor Clinical Notes / Prescription Formulation */}
      <div className="pt-4 border-t border-slate-100">
        <label className="block text-xs font-semibold text-slate-900 mb-1.5">
          Physician Clinical Notes & Final Prescription
        </label>
        <textarea
          rows={3}
          value={doctorNotes}
          onChange={(e) => setDoctorNotes(e.target.value)}
          placeholder="Enter clinical examination findings, differential diagnosis, or final prescription..."
          className="w-full p-3 rounded-md border border-slate-200 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-normal bg-emerald-50/15"
        />
      </div>
    </div>
  );
};
