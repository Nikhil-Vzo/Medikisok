"use client";

import * as React from "react";
import { ZoomIn, ZoomOut, RotateCw, CheckCircle2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface OcrDocumentInspectorProps {
  documentTitle?: string;
  imageSrc?: string;
  extractedData?: {
    medications: Array<{ name: string; dosage: string; frequency: string }>;
    labValues: Array<{ test: string; value: string; range: string; abnormal: boolean }>;
    diagnoses: string[];
  };
}

export const OcrDocumentInspector: React.FC<OcrDocumentInspectorProps> = ({
  documentTitle = "Historical Prescription (Dr. Rajesh Verma, MD)",
  extractedData = {
    medications: [
      { name: "Tab Metformin", dosage: "500mg", frequency: "1-0-1 (BD)" },
      { name: "Tab Telmisartan", dosage: "40mg", frequency: "1-0-0 (OD)" },
      { name: "Tab Atorvastatin", dosage: "10mg", frequency: "0-0-1 (HS)" }
    ],
    labValues: [
      { test: "Fasting Blood Sugar", value: "168 mg/dL", range: "70-100 mg/dL", abnormal: true },
      { test: "HbA1c", value: "8.4%", range: "< 5.7%", abnormal: true }
    ],
    diagnoses: ["Type 2 Diabetes Mellitus", "Essential Hypertension"]
  }
}) => {
  const [zoomLevel, setZoomLevel] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);

  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl border border-slate-200 space-y-4 sm:space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[14px] sm:text-[15px] font-semibold tracking-tight text-slate-900">OCR Split-View Verification</h4>
            <p className="text-xs text-slate-500 font-normal hidden sm:block">Audit original clinical document scan against structured AI extraction</p>
          </div>
        </div>
        <Badge variant="default" className="text-xs font-medium">
          Visual Audit
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Document Viewport with Zoom Controls */}
        <div className="lg:col-span-6 bg-emerald-950 rounded-xl p-4 flex flex-col justify-between overflow-hidden relative min-h-[320px]">
          {/* Controls Bar */}
          <div className="flex items-center justify-between z-10 bg-emerald-900/90 backdrop-blur-md p-2 rounded-xl border border-emerald-800 text-xs text-white">
            <span className="font-semibold truncate max-w-[180px]">{documentTitle}</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5))}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75))}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20"
                title="Rotate Page"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Scaled Image */}
          <div className="flex-1 flex items-center justify-center my-4 overflow-auto">
            <div
              className="transition-transform duration-200"
              style={{
                transform: `scale(${zoomLevel}) rotate(${rotation}deg)`
              }}
            >
              <div className="w-[280px] sm:w-[320px] p-4 bg-amber-50/95 rounded-xl shadow-2xl border border-amber-200 text-slate-900 text-xs leading-relaxed">
                <div className="border-b border-amber-300 pb-2 mb-3">
                  <h5 className="font-bold text-sm text-slate-900">Dr. Rajesh Verma, MD</h5>
                  <p className="text-[11px] text-slate-600">Consultant Physician · Reg: DMC-48910</p>
                </div>
                <div className="space-y-2 text-xs">
                  <p className="font-semibold">Rx:</p>
                  <p>1. Tab Metformin 500mg — 1 tab BD pc</p>
                  <p>2. Tab Telmisartan 40mg — 1 tab OD am</p>
                  <p>3. Tab Atorvastatin 10mg — 1 tab HS</p>
                  <p className="mt-3 text-red-950 font-medium">Inv: FBS: 168 mg/dL | HbA1c: 8.4%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-emerald-300/70 text-center font-medium">
            Original Handwritten Scan · High DPI Document Feed
          </div>
        </div>

        {/* Right Side: AI Extracted Verified Entities */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-semibold text-slate-700">
              Extracted & Normalized Entities
            </h5>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 100% Confidence Match
            </span>
          </div>

          {/* Medications Table */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-500 block">
              Active Prescriptions (Normalized to RxNorm):
            </span>
            <div className="space-y-1.5">
              {extractedData.medications.map((med, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-slate-900">{med.name}</span>
                  </div>
                  <span className="text-xs text-slate-600 font-semibold">{med.dosage} ({med.frequency})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lab Tests */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-500 block">
              Diagnostic Lab Highlights:
            </span>
            <div className="space-y-1.5">
              {extractedData.labValues.map((lab, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between text-xs text-red-950"
                >
                  <span className="font-semibold">{lab.test}</span>
                  <span className="font-bold">{lab.value} <span className="font-normal text-red-700">({lab.range})</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
