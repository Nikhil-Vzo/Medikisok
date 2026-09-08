"use client";

import * as React from "react";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface TimelineRecord {
  id: string;
  date: string;
  facility: string;
  docType: "Prescription" | "Lab Report" | "Discharge Summary";
  doctor: string;
  keyFindings: string[];
  medications: string[];
  isAbnormal?: boolean;
}

const SAMPLE_TIMELINE: TimelineRecord[] = [
  {
    id: "rec-1",
    date: "15 July 2026",
    facility: "Thyrocare Central Laboratory",
    docType: "Lab Report",
    doctor: "Dr. K. Mehta, MD (Pathology)",
    keyFindings: ["Fasting Blood Sugar: 168 mg/dL [High]", "HbA1c: 8.4% [Poor Control]", "Serum Creatinine: 0.9 mg/dL [Normal]"],
    medications: [],
    isAbnormal: true,
  },
  {
    id: "rec-2",
    date: "10 June 2026",
    facility: "Max Super Speciality Hospital, New Delhi",
    docType: "Prescription",
    doctor: "Dr. Rajesh Verma, MD (Internal Medicine)",
    keyFindings: ["Diagnosed: Type 2 Diabetes Mellitus & Essential Hypertension"],
    medications: ["Tab Metformin 500mg BD", "Tab Telmisartan 40mg OD", "Tab Atorvastatin 10mg HS"],
  },
  {
    id: "rec-3",
    date: "22 January 2026",
    facility: "AIIA Ayurvedic Hospital OPD",
    docType: "Prescription",
    doctor: "Dr. Sharma, MD (AIIA OPD 3)",
    keyFindings: ["Amlapitta & Agnimandya (Hyperacidity with sluggish Agni)"],
    medications: ["Avipattikar Churna 5g BD", "Kamdudha Ras 250mg BD with milk"],
  }
];

export const PatientRecordsTimeline: React.FC<{ records?: TimelineRecord[] }> = ({ records = [] }) => {
  return (
    <div className="p-6 bg-white rounded-xl border border-slate-200 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[15px] font-semibold tracking-tight text-slate-900">Medical Records Timeline</h4>
            <p className="text-xs text-slate-500 font-normal">Chronological clinical documents from scanned prescriptions & laboratory reports</p>
          </div>
        </div>
        <Badge variant="default" className="text-xs font-medium">
          Timeline
        </Badge>
      </div>

      {records.length === 0 ? (
        <div className="p-8 text-center text-slate-400 space-y-2 bg-slate-50/50 rounded-xl border border-slate-100">
          <Calendar className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
          <p className="text-xs font-semibold text-slate-700">No Historical Records On File</p>
          <p className="text-[11px] text-slate-500">Scanned prescriptions and laboratory reports linked via ABDM will appear here.</p>
        </div>
      ) : (
        /* Timeline List */
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-emerald-100">
          {records.map((rec) => (
          <div key={rec.id} className="relative group">
            {/* Timeline Dot */}
            <div className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full border-4 border-white shadow-sm ${rec.isAbnormal ? 'bg-red-600 ring-2 ring-red-200' : 'bg-emerald-700'}`} />

            <div className="p-5 rounded-xl bg-emerald-50/30 border border-emerald-100/80 hover:border-emerald-300 transition-colors space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{rec.date}</span>
                  <Badge variant={rec.docType === "Lab Report" ? "warning" : "default"} className="text-xs font-medium">
                    {rec.docType}
                  </Badge>
                  {rec.isAbnormal && (
                    <Badge variant="danger" className="text-xs font-medium">
                      Out-of-Range Flags
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-slate-500 font-medium">{rec.facility}</span>
              </div>

              <p className="text-xs text-slate-600 font-medium">
                Prescribing / Reporting Physician: <strong className="text-slate-800">{rec.doctor}</strong>
              </p>

              {/* Findings */}
              <div className="space-y-1">
                {rec.keyFindings.map((finding, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>{finding}</span>
                  </div>
                ))}
              </div>

              {/* Medications */}
              {rec.medications.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {rec.medications.map((med, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-xs font-semibold text-emerald-950">
                      {med}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
};
