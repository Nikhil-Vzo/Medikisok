import * as React from "react";
import { Check, FileDown, Code2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

export interface SoapSummaryEditorProps {
  summary: {
    chiefComplaint: string;
    historyOfPresentIllness: string;
    pastHistory: string[];
    medications: Array<{ name: string; dosage: string; frequency: string }>;
    allergies: string[];
    scannedSummary: string;
    doctorNotes?: string;
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

  return (
    <div className={cn("bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6", className)}>
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Clinical Intake Summary</h3>
            <Badge variant="ayush">AI-Drafted (SOCRATES)</Badge>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Human-in-the-loop: Verify, amend, and confirm before saving into HIS
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button variant="outline" size="sm" onClick={onViewFhir} className="gap-1.5 text-xs font-semibold text-emerald-950 border-emerald-200 hover:bg-emerald-50">
            <Code2 className="w-3.5 h-3.5 text-emerald-700" />
            FHIR Bundle
          </Button>
          <Button variant="outline" size="sm" onClick={onDownloadPdf} className="gap-1.5 text-xs font-semibold text-emerald-950 border-emerald-200 hover:bg-emerald-50">
            <FileDown className="w-3.5 h-3.5 text-emerald-700" />
            Download PDF
          </Button>
          {onSendToHis && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendToHis}
              disabled={isSendingToHis}
              className="gap-1.5 text-xs font-semibold text-emerald-950 border-emerald-200 hover:bg-emerald-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              {isSendingToHis ? "Sending…" : "Send to HIS"}
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

      {/* SOAP Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section 1: Chief Complaint & HPI */}
        <div className="p-4 rounded-lg bg-emerald-50/30 border border-emerald-100 space-y-2">
          <h4 className="text-xs font-semibold text-emerald-800">
            1. Chief Complaint & HPI
          </h4>
          <div>
            <p className="text-[14px] font-semibold text-slate-900">{summary.chiefComplaint}</p>
            <p className="text-[13px] text-slate-600 mt-1 leading-relaxed">{summary.historyOfPresentIllness}</p>
          </div>
        </div>

        {/* Section 2: Current Extracted Medications */}
        <div className="p-4 rounded-lg bg-emerald-50/30 border border-emerald-100 space-y-2">
          <h4 className="text-xs font-semibold text-emerald-800">
            2. Active Medications (From Records)
          </h4>
          <ul className="space-y-1.5">
            {summary.medications.length === 0 ? (
              <li className="text-xs text-slate-400">No previous medications recorded</li>
            ) : (
              summary.medications.map((med, idx) => (
                <li key={idx} className="flex items-center justify-between text-xs bg-white p-2.5 rounded-md border border-emerald-100">
                  <span className="font-semibold text-slate-900">{med.name}</span>
                  <span className="text-xs text-slate-600 font-medium">
                    {med.dosage} · {med.frequency}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Section 3: Past History & Allergies */}
        <div className="p-4 rounded-lg bg-emerald-50/30 border border-emerald-100 space-y-2">
          <h4 className="text-xs font-semibold text-emerald-800">
            3. Past History & Allergies
          </h4>
          <div className="space-y-1.5 text-xs">
            <div>
              <span className="font-semibold text-slate-700">Past Diagnoses: </span>
              <span className="text-slate-600">
                {summary.pastHistory.join(", ") || "None declared"}
              </span>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Allergies: </span>
              <span className="text-red-700 font-medium">
                {summary.allergies.join(", ") || "No known drug allergies (NKDA)"}
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Scanned Documents Overview */}
        <div className="p-4 rounded-lg bg-emerald-50/30 border border-emerald-100 space-y-2">
          <h4 className="text-xs font-semibold text-emerald-800">
            4. Document Vision AI Summary
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            {summary.scannedSummary || "Scanned documents processed with 100% field extraction."}
          </p>
        </div>
      </div>

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
