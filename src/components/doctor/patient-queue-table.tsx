import * as React from "react";
import { User, AlertCircle, Clock, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

export interface QueuePatient {
  id: string;
  visitId: string;
  summaryId?: string;
  name: string;
  age: number;
  gender: string;
  abhaId: string;
  abhaAddress?: string;   // ABHA Address e.g. "kamla.devi@abdm"
  chiefComplaint: string;
  clinicalMode: "allopathy" | "ayush";
  isEmergency: boolean;
  waitTimeMins: number;
  status: "waiting" | "in_consultation" | "completed";
  tokenNumber?: number;
  assignedDoctor?: string;
  assignedRoom?: string;
  nurseVitals?: {
    bloodPressure?: string;
    pulseRate?: number;
    spo2?: number;
    temperature?: number;
    respiratoryRate?: number;
    weightKg?: number;
    bloodSugar?: number;
    recordedAt?: string;
    nurseName?: string;
    triageNotes?: string;
  };
  nurseNotes?: string;
  isCalled?: boolean;
  verifiedMedications?: any[];
  draftSummary?: any;
  fhirBundle?: any;
  suggestions?: any[];
  scannedDocuments?: any[];
}

export interface PatientQueueTableProps {
  patients: QueuePatient[];
  selectedVisitId?: string;
  onSelectPatient: (patient: QueuePatient) => void;
  className?: string;
}

export const PatientQueueTable: React.FC<PatientQueueTableProps> = ({
  patients,
  selectedVisitId,
  onSelectPatient,
  className
}) => {
  return (
    <div className={cn("bg-white rounded-xl border border-slate-200 overflow-hidden", className)}>
      <div className="p-4 sm:p-5 border-b border-emerald-100 flex items-center justify-between bg-emerald-50/40">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight text-slate-900">OPD Patient Queue</h3>
          <p className="text-xs text-slate-500 font-normal">Consented clinical cases ready for consultation</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800">
          {patients.length} Waiting
        </span>
      </div>

      <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
        {patients.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <User className="w-10 h-10 mx-auto stroke-[1.5] mb-2 opacity-40" />
            <p className="text-sm font-semibold text-slate-700">No patients in queue</p>
            <p className="text-xs text-slate-500 mt-0.5">Patients will appear here once intake is completed at the Kiosk</p>
          </div>
        ) : (
          patients.map((patient) => {
            const isSelected = selectedVisitId === patient.visitId;
            return (
              <button
                key={patient.visitId}
                onClick={() => onSelectPatient(patient)}
                className={cn(
                  "w-full p-4 sm:p-5 text-left flex items-center justify-between transition-colors focus:outline-none select-none",
                  isSelected
                    ? "bg-emerald-50/70 border-l-2 border-emerald-700"
                    : "hover:bg-emerald-50/30 border-l-2 border-transparent",
                  patient.isEmergency && !isSelected && "bg-red-50/30 hover:bg-red-50/50 border-l-2 border-red-600"
                )}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-md flex items-center justify-center shrink-0 font-semibold text-xs",
                      patient.isEmergency
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-emerald-50 text-emerald-800 border border-emerald-200/80"
                    )}
                  >
                    {patient.isEmergency ? <AlertCircle className="w-4 h-4 text-red-600" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-[14px] font-semibold text-slate-900 truncate">{patient.name}</h4>
                      <span className="text-xs text-slate-500 font-medium">
                        {patient.age}y / {patient.gender}
                      </span>
                      {patient.isEmergency && (
                        <Badge variant="danger" className="text-xs py-0 px-2 font-semibold">
                          Red Flag
                        </Badge>
                      )}
                      <Badge variant={patient.clinicalMode === "ayush" ? "vedic" : "default"} className="text-xs py-0 px-2 font-medium">
                        {patient.clinicalMode === "ayush" ? "Ayush" : "Allopathy"}
                      </Badge>
                      {patient.assignedRoom && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100/80 text-emerald-900 border border-emerald-200">
                          {patient.assignedRoom}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 truncate mt-1">
                      <span className="text-slate-400 font-medium">CC:</span> {patient.chiefComplaint}
                    </p>

                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">{patient.abhaId}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-slate-400" /> {patient.waitTimeMins}m wait
                      </span>
                    </div>
                  </div>
                </div>

                <ChevronRight className={cn("w-4 h-4 shrink-0 transition-transform ml-2", isSelected ? "text-emerald-800 translate-x-0.5" : "text-slate-300")} />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
