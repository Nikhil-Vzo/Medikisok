"use client";

import * as React from "react";
import { ZoomIn, ZoomOut, RotateCw, CheckCircle2, Eye, FileText, AlertCircle, Sparkles, ChevronDown, ChevronUp, Pill } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface OcrDocumentInspectorProps {
  documentTitle?: string;
  imageSrc?: string;
  summaryText?: string;
  rawOcrText?: string;
  extractedData?: {
    medications: Array<{ name: string; dosage: string; frequency: string; duration?: string }>;
    labValues: Array<{ test: string; value: string; range: string; abnormal: boolean }>;
    diagnoses: string[];
  };
}

export const OcrDocumentInspector: React.FC<OcrDocumentInspectorProps> = ({
  documentTitle = "Clinical Prescription Document",
  imageSrc,
  summaryText,
  rawOcrText,
  extractedData = {
    medications: [],
    labValues: [],
    diagnoses: []
  }
}) => {
  const [zoomLevel, setZoomLevel] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const [showRawOcr, setShowRawOcr] = React.useState(false);

  const medications = extractedData?.medications || [];
  const labValues = extractedData?.labValues || [];
  const diagnoses = extractedData?.diagnoses || [];

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
        <div className="lg:col-span-6 bg-emerald-950 rounded-xl p-4 flex flex-col justify-between overflow-hidden relative min-h-[360px]">
          {/* Controls Bar */}
          <div className="flex items-center justify-between z-10 bg-emerald-900/90 backdrop-blur-md p-2 rounded-xl border border-emerald-800 text-xs text-white">
            <span className="font-semibold truncate max-w-[180px]">{documentTitle}</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5))}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75))}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                title="Rotate Page"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Scaled Image / Document Content */}
          <div className="flex-1 flex items-center justify-center my-4 overflow-auto min-h-[260px]">
            <div
              className="transition-transform duration-200"
              style={{
                transform: `scale(${zoomLevel}) rotate(${rotation}deg)`
              }}
            >
              {imageSrc ? (
                <div className="max-w-[340px] sm:max-w-[420px] rounded-lg overflow-hidden border border-emerald-800 shadow-2xl bg-white">
                  <img
                    src={imageSrc}
                    alt={documentTitle}
                    className="w-full h-auto max-h-[460px] object-contain block mx-auto"
                  />
                </div>
              ) : (
                <div className="w-[280px] sm:w-[340px] p-4 bg-amber-50/95 rounded-xl shadow-2xl border border-amber-200 text-slate-900 text-xs leading-relaxed space-y-3">
                  <div className="border-b border-amber-300 pb-2">
                    <h5 className="font-bold text-sm text-slate-900">{documentTitle}</h5>
                    <p className="text-[11px] text-slate-600">Prescription Digitization · OPD Intake Feed</p>
                  </div>

                  {diagnoses.length > 0 && (
                    <div>
                      <span className="font-bold text-[11px] text-slate-700 block uppercase">Provisional Diagnosis:</span>
                      <p className="font-semibold text-slate-900">{diagnoses.join(", ")}</p>
                    </div>
                  )}

                  <div className="space-y-1.5 text-xs">
                    <p className="font-bold text-[11px] text-slate-700 uppercase">Prescriptions (Rx):</p>
                    {medications.length > 0 ? (
                      medications.map((m, idx) => (
                        <p key={idx} className="text-slate-800">
                          {idx + 1}. <strong className="text-slate-950">{m.name}</strong> {m.dosage} — {m.frequency}
                        </p>
                      ))
                    ) : (
                      <p className="text-slate-500 italic">No specific medications recorded</p>
                    )}
                  </div>

                  {labValues.length > 0 && (
                    <div className="pt-2 border-t border-amber-200 text-red-950 font-medium text-[11px]">
                      <span className="font-bold block uppercase text-red-900">Lab Values:</span>
                      {labValues.map((l, idx) => (
                        <span key={idx} className="block">{l.test}: {l.value} ({l.range})</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="text-xs text-emerald-300/70 text-center font-medium">
            {imageSrc ? "Original Patient Upload Scan · High DPI Document Feed" : "Digitized Prescription Document View"}
          </div>
        </div>

        {/* Right Side: AI Extracted Verified Entities */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-semibold text-slate-700">
              Extracted & Normalized Entities
            </h5>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Vision AI Match
            </span>
          </div>

          {/* Diagnoses List */}
          {diagnoses.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-slate-500 block">
                Clinical Diagnoses & Indications:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {diagnoses.map((d, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Medications Table */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-500 block">
              Active Prescriptions (Normalized to RxNorm):
            </span>
            {medications.length > 0 ? (
              <div className="space-y-1.5">
                {medications.map((med, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-100 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-semibold text-slate-900">{med.name}</span>
                    </div>
                    <span className="text-xs text-slate-600 font-semibold">
                      {med.dosage} {med.frequency ? `(${med.frequency})` : ""}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-500 text-xs">
                No active medications extracted from this scan
              </div>
            )}
          </div>

          {/* Lab Tests */}
          {labValues.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-500 block">
                Diagnostic Lab Highlights:
              </span>
              <div className="space-y-1.5">
                {labValues.map((lab, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                      lab.abnormal ? "bg-red-50 border-red-200 text-red-950" : "bg-emerald-50/40 border-emerald-100 text-slate-900"
                    }`}
                  >
                    <span className="font-semibold">{lab.test}</span>
                    <span className="font-bold">
                      {lab.value} <span className="font-normal text-slate-600">({lab.range})</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Clinical Summary (Multilingual) */}
          {summaryText && (
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-900 font-semibold text-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>AI Clinical Document Summary</span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-line">
                {summaryText}
              </p>
            </div>
          )}

          {/* Collapsible Raw OCR Text */}
          {rawOcrText && (
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setShowRawOcr(!showRawOcr)}
                className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-slate-700 font-medium cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Raw OCR Extracted Text</span>
                </div>
                {showRawOcr ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {showRawOcr && (
                <div className="p-3 bg-white max-h-40 overflow-y-auto text-[11px] text-slate-600 font-mono leading-relaxed whitespace-pre-wrap">
                  {rawOcrText}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

