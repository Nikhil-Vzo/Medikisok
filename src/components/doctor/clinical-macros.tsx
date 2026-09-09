"use client";

import * as React from "react";
import { Zap, Plus, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface MacroOrderSet {
  id: string;
  name: string;
  category: "Ayurveda" | "Allopathy" | "Emergency";
  medications: Array<{ name: string; dosage: string; frequency: string; duration: string }>;
  investigations: string[];
  dietaryAdvice: string;
}

export const INSTITUTIONAL_ORDER_SETS: MacroOrderSet[] = [
  {
    id: "macro-1",
    name: "AIIA Amlapitta & Agnimandya Protocol",
    category: "Ayurveda",
    medications: [
      { name: "Avipattikar Churna", dosage: "5g", frequency: "1-0-1 (BD)", duration: "15 Days" },
      { name: "Kamdudha Ras (Moti Yukta)", dosage: "250mg", frequency: "1-0-1 (BD)", duration: "15 Days" },
      { name: "Sutshekhar Ras", dosage: "125mg", frequency: "1-0-0 (OD)", duration: "10 Days" }
    ],
    investigations: ["Upper GI Endoscopy if symptoms persist > 4 weeks", "USG Whole Abdomen"],
    dietaryAdvice: "Avoid sour, spicy (Katu-Amla) foods, late night meals, and excessive tea/coffee."
  },
  {
    id: "macro-2",
    name: "T2DM Glycemic Optimization Protocol",
    category: "Allopathy",
    medications: [
      { name: "Tab Metformin (Extended Release)", dosage: "1000mg", frequency: "0-0-1 (OD)", duration: "30 Days" },
      { name: "Tab Teneligliptin", dosage: "20mg", frequency: "1-0-0 (OD)", duration: "30 Days" }
    ],
    investigations: ["Repeat HbA1c in 3 months", "Urine Microalbumin/Creatinine Ratio"],
    dietaryAdvice: "Low glycemic index diet, 30 mins daily brisk walking, self-monitoring of blood glucose."
  },
  {
    id: "macro-3",
    name: "ACS Acute Coronary Stabilization",
    category: "Emergency",
    medications: [
      { name: "Tab Aspirin (Dispersible)", dosage: "300mg", frequency: "Stat", duration: "Immediate" },
      { name: "Tab Clopidogrel", dosage: "300mg", frequency: "Stat", duration: "Immediate" },
      { name: "Tab Atorvastatin", dosage: "80mg", frequency: "Stat", duration: "Immediate" }
    ],
    investigations: ["Immediate 12-Lead ECG", "High-Sensitivity Troponin I", "Echocardiogram"],
    dietaryAdvice: "NPO (Nil per os) pending emergency cardiology evaluation."
  }
];

export interface ClinicalMacrosProps {
  onApplyMacro: (macro: MacroOrderSet) => void;
}

export const ClinicalMacros: React.FC<ClinicalMacrosProps> = ({ onApplyMacro }) => {
  const [appliedId, setAppliedId] = React.useState<string | null>(null);

  const handleApply = (macro: MacroOrderSet) => {
    setAppliedId(macro.id);
    onApplyMacro(macro);
    setTimeout(() => setAppliedId(null), 2000);
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl border border-slate-200 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[14px] sm:text-[15px] font-semibold tracking-tight text-slate-900">Institutional Order Sets</h4>
            <p className="text-xs text-slate-500 font-normal hidden sm:block">Standardized AIIA Clinical Protocols & fast prescription macros</p>
          </div>
        </div>
        <Badge variant="default" className="text-xs font-medium">
          Protocols
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        {INSTITUTIONAL_ORDER_SETS.map((macro) => (
          <div
            key={macro.id}
            className="p-3.5 rounded-lg bg-emerald-50/40 border border-emerald-100 hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">{macro.name}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-white border border-emerald-200 text-emerald-800">
                  {macro.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-normal leading-snug">
                {macro.medications.map((m) => m.name).join(", ")}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleApply(macro)}
              className={`w-full h-8 px-3 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                appliedId === macro.id
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-white border border-emerald-200 text-emerald-950 hover:bg-emerald-700 hover:text-white"
              }`}
            >
              {appliedId === macro.id ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Applied</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Apply Order Set</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
