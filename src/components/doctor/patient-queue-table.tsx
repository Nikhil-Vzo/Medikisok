import * as React from "react";
import { User, AlertCircle, Clock, ChevronRight, Search, RefreshCw, X } from "lucide-react";
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
  abhaAddress?: string;   // ABHA Address e.g. "patient@abdm"
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
  socratesData?: any;
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
  onRefresh?: () => void;
  onClearQueue?: () => void;
  className?: string;
}

export const PatientQueueTable: React.FC<PatientQueueTableProps> = ({
  patients,
  selectedVisitId,
  onSelectPatient,
  onRefresh,
  onClearQueue,
  className
}) => {
  const [filter, setFilter] = React.useState<"all" | "waiting" | "emergency">("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const filtered = React.useMemo(() => {
    return patients.filter((p) => {
      // Filter tab
      if (filter === "emergency" && !p.isEmergency) return false;
      if (filter === "waiting" && p.status === "completed") return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name?.toLowerCase().includes(q);
        const matchAbha = p.abhaId?.toLowerCase().includes(q);
        const matchCc = p.chiefComplaint?.toLowerCase().includes(q);
        return matchName || matchAbha || matchCc;
      }
      return true;
    });
  }, [patients, filter, searchQuery]);

  const emergencyCount = patients.filter(p => p.isEmergency).length;
  const waitingCount = patients.filter(p => p.status !== "completed").length;

  return (
    <div className={cn("bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs", className)}>
      {/* Table Header */}
      <div className="p-4 border-b border-emerald-100/80 bg-emerald-50/40 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold tracking-tight text-slate-900">OPD Consultation Queue</h3>
            <p className="text-[11px] text-slate-500">Live consented clinical feed</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-300 bg-white text-emerald-900 shadow-2xs">
              {filtered.length} {filtered.length === 1 ? "Patient" : "Patients"}
            </span>
            {onRefresh && (
              <button
                type="button"
                onClick={handleRefresh}
                title="Refresh Queue"
                className="p-1.5 rounded-md hover:bg-white/80 text-emerald-800 border border-emerald-200/80 transition-colors"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin text-emerald-600")} />
              </button>
            )}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient, ABHA, chief complaint..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-white rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 shadow-2xs transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 bg-white/80 p-1 rounded-lg border border-emerald-200/60 text-xs">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "flex-1 py-1 rounded-md text-[11px] font-semibold transition-all",
              filter === "all" ? "bg-emerald-700 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
            )}
          >
            All ({patients.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("waiting")}
            className={cn(
              "flex-1 py-1 rounded-md text-[11px] font-semibold transition-all",
              filter === "waiting" ? "bg-emerald-700 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
            )}
          >
            Waiting ({waitingCount})
          </button>
          {emergencyCount > 0 && (
            <button
              type="button"
              onClick={() => setFilter("emergency")}
              className={cn(
                "flex-1 py-1 rounded-md text-[11px] font-semibold transition-all",
                filter === "emergency" ? "bg-red-600 text-white shadow-2xs" : "text-red-700 hover:text-red-900"
              )}
            >
              Red Flag ({emergencyCount})
            </button>
          )}
        </div>
      </div>

      {/* Patients List */}
      <div className="divide-y divide-slate-100 max-h-[580px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-400 space-y-2">
            <User className="w-8 h-8 mx-auto stroke-[1.5] opacity-40 text-slate-500" />
            <p className="text-xs font-semibold text-slate-700">No patients in queue</p>
            <p className="text-[11px] text-slate-500">Patients will appear here once intake is completed at the Kiosk</p>
          </div>
        ) : (
          filtered.map((patient) => {
            const isSelected = selectedVisitId === patient.visitId;
            return (
              <button
                key={patient.visitId}
                onClick={() => onSelectPatient(patient)}
                className={cn(
                  "w-full p-3.5 text-left flex items-center justify-between transition-colors focus:outline-none select-none",
                  isSelected
                    ? "bg-emerald-50/75 border-l-3 border-emerald-700"
                    : "hover:bg-slate-50 border-l-3 border-transparent",
                  patient.isEmergency && !isSelected && "bg-red-50/40 hover:bg-red-50/60 border-l-3 border-red-600"
                )}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs",
                      patient.isEmergency
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : "bg-emerald-100/80 text-emerald-900 border border-emerald-200"
                    )}
                  >
                    {patient.isEmergency ? <AlertCircle className="w-4 h-4 text-red-600" /> : patient.name.charAt(0)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 truncate max-w-[140px]">{patient.name}</h4>
                      <span className="text-[11px] text-slate-500">
                        {patient.age}y/{patient.gender.charAt(0)}
                      </span>
                      {patient.isEmergency && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-700 border border-red-200">
                          RED FLAG
                        </span>
                      )}
                      {patient.assignedRoom && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                          {patient.assignedRoom}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-600 truncate mt-0.5 leading-snug">
                      <span className="text-slate-400 font-medium">CC:</span> {patient.chiefComplaint}
                    </p>

                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                      <span className="font-semibold text-slate-700">{patient.abhaId}</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5 text-slate-400" /> {patient.waitTimeMins}m wait
                      </span>
                    </div>
                  </div>
                </div>

                <ChevronRight className={cn("w-3.5 h-3.5 shrink-0 transition-transform ml-1", isSelected ? "text-emerald-800 translate-x-0.5" : "text-slate-300")} />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
