"use client";

import * as React from "react";
import { Plus, Trash2, Pill, Check, Search, AlertTriangle, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { checkIntegrativeInteractions, InteractionWarning } from "@/lib/ontologies/ayush-interactions";
import { generateAndPrintClinicalReport } from "@/lib/utils/pdf-generator";
import { ClinicalSummaryDraft } from "@/types/clinical";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PrescribedItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface PrescriptionBuilderProps {
  initialMedications?: Array<{ name: string; dosage: string; frequency: string }>;
  onPrescriptionChange?: (meds: PrescribedItem[]) => void;
}

// ─── Drug formulary (Allopathic + Ayurvedic) ────────────────────────────────

const DRUG_FORMULARY: Array<{ name: string; category: "allo" | "ayush"; dosage: string }> = [
  // Allopathic — common OPD
  { name: "Tab Metformin", category: "allo", dosage: "500mg" },
  { name: "Tab Metformin", category: "allo", dosage: "850mg" },
  { name: "Tab Metformin", category: "allo", dosage: "1000mg" },
  { name: "Tab Glimepride", category: "allo", dosage: "1mg" },
  { name: "Tab Glimepride", category: "allo", dosage: "2mg" },
  { name: "Tab Atorvastatin", category: "allo", dosage: "10mg" },
  { name: "Tab Atorvastatin", category: "allo", dosage: "20mg" },
  { name: "Tab Telmisartan", category: "allo", dosage: "40mg" },
  { name: "Tab Telmisartan", category: "allo", dosage: "80mg" },
  { name: "Tab Amlodipine", category: "allo", dosage: "5mg" },
  { name: "Tab Amlodipine", category: "allo", dosage: "10mg" },
  { name: "Tab Pantoprazole", category: "allo", dosage: "40mg" },
  { name: "Cap Amoxicillin", category: "allo", dosage: "500mg" },
  { name: "Tab Ibuprofen", category: "allo", dosage: "400mg" },
  { name: "Tab Paracetamol", category: "allo", dosage: "500mg" },
  { name: "Tab Paracetamol", category: "allo", dosage: "650mg" },
  { name: "Tab Diclofenac", category: "allo", dosage: "50mg" },
  { name: "Tab Metoprolol", category: "allo", dosage: "25mg" },
  { name: "Tab Metoprolol", category: "allo", dosage: "50mg" },
  { name: "Tab Atenolol", category: "allo", dosage: "50mg" },
  { name: "Tab Losartan", category: "allo", dosage: "50mg" },
  { name: "Tab Omeprazole", category: "allo", dosage: "20mg" },
  { name: "Tab Ranitidine", category: "allo", dosage: "150mg" },
  { name: "Syrup Cefixime", category: "allo", dosage: "100mg/5ml" },
  { name: "Tab Azithromycin", category: "allo", dosage: "500mg" },
  { name: "Tab Levofloxacin", category: "allo", dosage: "500mg" },
  { name: "Tab Domperidone", category: "allo", dosage: "10mg" },
  { name: "Tab Ondansetron", category: "allo", dosage: "4mg" },
  { name: "Tab Alprazolam", category: "allo", dosage: "0.5mg" },
  { name: "Tab Clonazepam", category: "allo", dosage: "0.5mg" },
  // Ayurvedic formulations
  { name: "Ashwagandha Churna", category: "ayush", dosage: "3g" },
  { name: "Ashwagandha Tablet", category: "ayush", dosage: "500mg" },
  { name: "Triphala Churna", category: "ayush", dosage: "3g" },
  { name: "Guggulu Tablet", category: "ayush", dosage: "250mg" },
  { name: "Karela Juice", category: "ayush", dosage: "30ml" },
  { name: "Jamun Swarasa", category: "ayush", dosage: "30ml" },
  { name: "Arjuna Churna", category: "ayush", dosage: "3g" },
  { name: "Avipattikar Churna", category: "ayush", dosage: "3g" },
  { name: "Chyawanprash", category: "ayush", dosage: "10g" },
  { name: "Brahmi Ghrita", category: "ayush", dosage: "5g" },
  { name: "Punarnavasava", category: "ayush", dosage: "15ml" },
  { name: "Mahalaxmi Vilas Rasa", category: "ayush", dosage: "125mg" },
  { name: "Shankhapushpi Syrup", category: "ayush", dosage: "10ml" },
];

const FREQUENCY_OPTIONS = [
  "1-0-0 (OD — Once daily)",
  "1-0-1 (BD — Twice daily)",
  "1-1-1 (TDS — Three times daily)",
  "0-1-0 (Night — HS)",
  "0-0-1 (SOS — As needed)",
  "1-1-0 (Morning & Afternoon)",
];

// ─── Interaction Alert Component ─────────────────────────────────────────────

function InteractionAlert({ warning, onDismiss }: { warning: InteractionWarning; onDismiss: () => void }) {
  const colorMap = {
    critical: "bg-red-50 border-red-300 text-red-900",
    high: "bg-amber-50 border-amber-300 text-amber-900",
    moderate: "bg-yellow-50 border-yellow-300 text-yellow-900",
  };
  const badgeMap = {
    critical: "bg-red-600 text-white",
    high: "bg-amber-500 text-white",
    moderate: "bg-yellow-500 text-slate-900",
  };

  return (
    <div className={`rounded-xl border p-4 ${colorMap[warning.severity]}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={`w-5 h-5 mt-0.5 shrink-0 ${warning.severity === "critical" ? "text-red-600" : "text-amber-600"}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm">{warning.ayurvedicDrug} + {warning.allopathicDrug}</span>
            <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${badgeMap[warning.severity]}`}>
              {warning.severity === "critical" ? "Critical Risk" : warning.severity === "high" ? "High Risk" : "Moderate Risk"}
            </span>
          </div>
          <p className="text-xs mt-1 font-medium">{warning.mechanism}</p>
          <p className="text-xs mt-1 font-semibold italic">{warning.clinicalAdvice}</p>
          <p className="text-xs mt-1 text-slate-600">{warning.reference}</p>
        </div>
        <button onClick={onDismiss} className="shrink-0 p-1 hover:bg-emerald-100 rounded text-slate-500 hover:text-slate-800" aria-label="Dismiss">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export const PrescriptionBuilder: React.FC<PrescriptionBuilderProps> = ({
  initialMedications = [],
  onPrescriptionChange,
}) => {
  const [medications, setMedications] = React.useState<PrescribedItem[]>(() => {
    if (initialMedications.length > 0) {
      return initialMedications.map((m, idx) => ({
        id: `med-${idx}`,
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: "14 Days",
        instructions: "After meals (post-prandial)",
      }));
    }
    return [
      {
        id: "med-1",
        name: "Tab Metformin",
        dosage: "500mg",
        frequency: "1-0-1 (BD — Twice daily)",
        duration: "30 Days",
        instructions: "With breakfast and dinner",
      },
    ];
  });

  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<typeof DRUG_FORMULARY>([]);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [interactions, setInteractions] = React.useState<InteractionWarning[]>([]);
  const [dismissedIds, setDismissedIds] = React.useState<Set<string>>(new Set());
  const [newMedFreq, setNewMedFreq] = React.useState("1-0-1 (BD — Twice daily)");
  const searchRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Check interactions whenever medications change
  React.useEffect(() => {
    const names = medications.map((m) => m.name);
    const found = checkIntegrativeInteractions(names);
    setInteractions(found);
    setDismissedIds(new Set());
  }, [medications]);

  // Drug search
  function handleSearchChange(query: string) {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const q = query.toLowerCase();
    const results = DRUG_FORMULARY.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q)
    ).slice(0, 8);
    setSearchResults(results);
    setShowDropdown(true);
  }

  function selectDrug(drug: { name: string; dosage: string }) {
    const exists = medications.some((m) => m.name === drug.name && m.dosage === drug.dosage);
    if (exists) {
      setSearchQuery("");
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const updated: PrescribedItem[] = [
      ...medications,
      {
        id: `med-${Date.now()}`,
        name: drug.name,
        dosage: drug.dosage,
        frequency: newMedFreq,
        duration: "14 Days",
        instructions: "After meals",
      },
    ];
    setMedications(updated);
    onPrescriptionChange?.(updated);
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
  }

  function removeMedication(id: string) {
    const updated = medications.filter((m) => m.id !== id);
    setMedications(updated);
    onPrescriptionChange?.(updated);
  }

  function dismissInteraction(key: string) {
    setDismissedIds((prev) => new Set(Array.from(prev).concat(key)));
  }

  function downloadPdf() {
    const summary: ClinicalSummaryDraft = {
      visitId: "preview",
      patientId: "preview",
      chiefComplaint: "",
      historyOfPresentIllness: "",
      socratesData: {},
      currentMedications: medications.map((m) => ({
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency.split("—")[0].trim(),
        confidence: 1,
      })),
      pastMedicalHistory: [],
      allergies: [],
      scannedDocumentsSummary: "",
      status: "draft",
      isEmergencyTriage: false,
      createdAt: new Date().toISOString(),
    };
    generateAndPrintClinicalReport(summary, {
      name: "",
    });
  }

  const visibleInteractions = interactions.filter(
    (i) => !dismissedIds.has(`${i.ayurvedicDrug}|${i.allopathicDrug}`)
  );
  const alloCount = medications.filter((m) =>
    DRUG_FORMULARY.some((d) => d.name === m.name && d.category === "allo")
  ).length;
  const ayushCount = medications.filter((m) =>
    DRUG_FORMULARY.some((d) => d.name === m.name && d.category === "ayush")
  ).length;

  return (
    <div className="p-6 bg-white rounded-xl border border-slate-200 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
            <Pill className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[15px] font-semibold tracking-tight text-slate-900">Active OPD Prescription & Ayush Formulations</h4>
            <p className="text-xs text-slate-500 font-normal">Drug search, interaction safety checks & PDF export</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {alloCount > 0 && (
            <Badge variant="default" className="text-xs font-medium">
              {alloCount} Allopathic
            </Badge>
          )}
          {ayushCount > 0 && (
            <Badge variant="vedic" className="text-xs font-medium">
              {ayushCount} Ayurvedic
            </Badge>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={downloadPdf}
            className="text-xs font-semibold gap-1.5 text-emerald-950 border-emerald-200 hover:bg-emerald-50"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Drug Interaction Alerts */}
      {visibleInteractions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold text-amber-800">
              {visibleInteractions.length} Interaction{visibleInteractions.length > 1 ? "s" : ""} Detected
            </span>
          </div>
          {visibleInteractions.map((warning) => {
            const key = `${warning.ayurvedicDrug}|${warning.allopathicDrug}`;
            return (
              <InteractionAlert
                key={key}
                warning={warning}
                onDismiss={() => dismissInteraction(key)}
              />
            );
          })}
        </div>
      )}

      {/* Medication List */}
      <div className="space-y-3">
        {medications.map((med) => (
          <div
            key={med.id}
            className="p-4 rounded-xl bg-emerald-50/30 border border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-900 text-sm">{med.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-semibold">
                  {med.dosage}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                  {med.frequency}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                  {med.duration}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{med.instructions}</p>
            </div>
            <button
              onClick={() => removeMedication(med.id)}
              className="p-2 text-slate-400 hover:text-red-600 transition-colors self-end sm:self-center rounded hover:bg-red-50"
              title="Remove medicine"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {medications.length === 0 && (
          <div className="text-center py-6 text-slate-400 text-sm font-medium border border-dashed border-emerald-200 rounded-xl bg-emerald-50/20">
            No medications added yet — use the search below
          </div>
        )}
      </div>

      {/* Drug Search + Add Row */}
      <div className="p-4 rounded-xl bg-white border border-dashed border-emerald-200 space-y-3">
        <span className="text-xs font-semibold text-slate-700 block">
          Add Medicine / Ayurvedic Aushadhi
        </span>

        <div className="relative" ref={searchRef}>
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search drug name (e.g. Metformin, Ashwagandha, Guggulu)..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => searchQuery && setShowDropdown(true)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-300 text-sm font-medium focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              autoComplete="off"
            />
          </div>

          {/* Autocomplete dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
              {searchResults.map((drug, idx) => (
                <button
                  key={idx}
                  onClick={() => selectDrug(drug)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-emerald-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-emerald-700" />
                    <span className="text-sm font-semibold text-slate-900">{drug.name}</span>
                    <span className="text-xs text-slate-500">{drug.dosage}</span>
                  </div>
                  <Badge
                    variant={drug.category === "ayush" ? "ayush" : "outline"}
                    className="text-xs font-medium"
                  >
                    {drug.category === "ayush" ? "Ayurvedic" : "Allopathic"}
                  </Badge>
                </button>
              ))}
            </div>
          )}

          {showDropdown && searchQuery && searchResults.length === 0 && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm text-slate-500 font-medium">
              No drugs found for &ldquo;{searchQuery}&rdquo;
            </div>
          )}
        </div>

        {/* Frequency selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">Frequency:</label>
          <select
            value={newMedFreq}
            onChange={(e) => setNewMedFreq(e.target.value)}
            className="flex-1 min-w-[200px] h-10 px-3 rounded-xl border border-slate-300 text-xs font-medium focus:border-emerald-600 focus:outline-none bg-white"
          >
            {FREQUENCY_OPTIONS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {/* Quick-add buttons for common drugs */}
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Tab Metformin", dosage: "500mg" },
            { name: "Tab Atorvastatin", dosage: "20mg" },
            { name: "Tab Telmisartan", dosage: "40mg" },
            { name: "Ashwagandha Churna", dosage: "3g" },
            { name: "Triphala Churna", dosage: "3g" },
          ].map((quick) => {
            const disabled = medications.some(
              (m) => m.name === quick.name && m.dosage === quick.dosage
            );
            return (
              <button
                key={`${quick.name}-${quick.dosage}`}
                disabled={disabled}
                onClick={() => selectDrug(quick)}
                className={`text-xs px-3 py-1.5 rounded-full border font-semibold inline-flex items-center gap-1 transition-colors ${
                  disabled
                    ? "border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed"
                    : "border-emerald-200 text-emerald-800 bg-emerald-50/60 hover:bg-emerald-100 hover:border-emerald-300"
                }`}
              >
                {disabled ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                <span>{quick.name} {quick.dosage}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
