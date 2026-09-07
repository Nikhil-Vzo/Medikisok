"use client";

import * as React from "react";
import {
  Camera,
  RefreshCw,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Image as ImageIcon,
  ScanLine,
  ShieldOff,
  Type,
  FileSearch
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

export interface ExtractedDocResult {
  docType: string;
  documentDate?: string;
  medications: Array<{ name: string; dosage: string; frequency: string; duration?: string; confidence: number }>;
  labValues: Array<{ test: string; value: string; range: string; abnormal: boolean }>;
  diagnoses: string[];
  proceduresSurgeries?: string[];
  allergies?: string[];
  summaryText?: string;
  previewUrl: string;
  fileName: string;
  rawOcrText?: string;
}

export interface CameraScannerProps {
  onDocumentExtracted: (result: ExtractedDocResult) => void;
  className?: string;
}

type OcrMode = "camera" | "upload";
type DocTypeHint = "prescription" | "lab_report";
type OcrStatus = "checking" | "ready" | "no_credentials";

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onDocumentExtracted,
  className
}) => {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // OCR mode toggle
  const [ocrMode, setOcrMode] = React.useState<OcrMode>("camera");
  // Document type hint (affects the upload prompt)
  const [docTypeHint, setDocTypeHint] = React.useState<DocTypeHint>("prescription");
  // OCR engine availability
  const [ocrStatus, setOcrStatus] = React.useState<OcrStatus>("checking");
  // Camera state
  const [isCameraActive, setIsCameraActive] = React.useState(false);
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  // Extracted text panel
  const [extractedText, setExtractedText] = React.useState<string | null>(null);
  const [extractionError, setExtractionError] = React.useState<string | null>(null);

  // Check OCR credentials availability on mount
  React.useEffect(() => {
    const checkOcrStatus = async () => {
      try {
        const res = await fetch("/api/ocr/status");
        const data = await res.json();
        setOcrStatus(data.configured ? "ready" : "no_credentials");
      } catch {
        setOcrStatus("no_credentials");
      }
    };
    checkOcrStatus();
  }, []);

  // Start Video Stream
  const startCamera = async () => {
    if (ocrStatus === "no_credentials") return;
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.warn("Camera access failed:", err);
      setCameraError("Camera access denied or unavailable. You can upload an image file directly.");
      setIsCameraActive(false);
    }
  };

  // Stop Video Stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Reset extracted text when a new capture/upload starts
  const resetState = () => {
    setExtractedText(null);
    setExtractionError(null);
  };

  // Capture Snapshot from Video
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedImage(base64);
      stopCamera();
      resetState();
      processOcr(base64, `Camera_Capture_${Date.now()}.jpg`);
    }
  };

  // Handle File Upload Drop
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    resetState();
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCapturedImage(base64);
      processOcr(base64, file.name);
    };
    reader.readAsDataURL(file);
  };

  // Call OCR API
  const processOcr = async (base64Data: string, fileName: string) => {
    setIsProcessing(true);
    setExtractionError(null);
    try {
      const res = await fetch("/api/ocr/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64Data, mimeType: "image/jpeg" })
      });
      const data = await res.json();

      if (data.error === "requires_credentials") {
        setOcrStatus("no_credentials");
        setExtractionError(data.message ?? "OCR credentials not configured. Please contact the administrator.");
        setIsProcessing(false);
        return;
      }

      if (data.success && data.extracted) {
        // Surface raw OCR text in the readable panel
        const raw = data.extracted.rawOcrText ?? data.extracted.summaryText ?? "";
        setExtractedText(raw);
        onDocumentExtracted({
          ...data.extracted,
          previewUrl: base64Data,
          fileName: fileName
        });
      } else {
        setExtractionError(data.message ?? "Failed to extract text from document.");
      }
    } catch (err) {
      console.error("OCR API error:", err);
      setExtractionError("Network error during OCR. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const docTypeLabel = docTypeHint === "prescription" ? "Prescription" : "Lab Report";
  const docTypeIcon = docTypeHint === "prescription" ? <FileText className="w-4 h-4" /> : <ScanLine className="w-4 h-4" />;

  return (
    <div className={cn("bg-white rounded-xl border border-slate-200 p-6 space-y-5", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[15px] font-semibold tracking-tight text-slate-900">Medical Document Vision AI</h4>
            <p className="text-xs text-slate-500 font-normal">
              {ocrStatus === "checking" ? "Checking OCR status..." :
               ocrStatus === "no_credentials" ? "OCR not configured" :
               "High-fidelity prescription & laboratory report digitization"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {ocrStatus === "ready" && (
            <Badge variant="default" className="text-xs font-medium">
              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
              Vision AI Ready
            </Badge>
          )}
          {ocrStatus === "no_credentials" && (
            <Badge variant="danger" className="text-xs font-medium">
              <ShieldOff className="w-3 h-3 mr-1" />
              Setup Required
            </Badge>
          )}
        </div>
      </div>

      {/* OCR Mode Toggle & Demo Sample Presets */}
      {ocrStatus !== "checking" && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 p-1 bg-emerald-50/50 rounded-lg w-fit border border-emerald-200/60">
            <button
              onClick={() => { setOcrMode("camera"); resetState(); setCapturedImage(null); stopCamera(); }}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all",
                ocrMode === "camera"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-emerald-950"
              )}
            >
              <Camera className="w-3.5 h-3.5" />
              Camera Scanner
            </button>
            <button
              onClick={() => { setOcrMode("upload"); resetState(); setCapturedImage(null); stopCamera(); }}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all",
                ocrMode === "upload"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-emerald-950"
              )}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload File
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                resetState();
                onDocumentExtracted({
                  docType: "prescription",
                  documentDate: "2026-06-15",
                  fileName: "Sample_Rx_DrVerma.jpg",
                  previewUrl: "",
                  medications: [
                    { name: "Tab Metformin", dosage: "500mg", frequency: "BD (Twice Daily)", duration: "30 Days", confidence: 0.96 },
                    { name: "Tab Telmisartan", dosage: "40mg", frequency: "OD (Once Daily)", duration: "30 Days", confidence: 0.94 }
                  ],
                  labValues: [],
                  diagnoses: ["Type 2 Diabetes Mellitus", "Essential Hypertension"],
                  proceduresSurgeries: ["Appendectomy (2018)"],
                  allergies: ["No Known Drug Allergies"],
                  summaryText: "Sample Prescription Dr. Verma: Metformin 500mg BD + Telmisartan 40mg OD."
                });
              }}
              className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-md transition-all flex items-center gap-1"
            >
              <FileText className="w-3 h-3 text-emerald-700" />
              Demo: Load Sample Rx
            </button>
            <button
              type="button"
              onClick={() => {
                resetState();
                onDocumentExtracted({
                  docType: "lab_report",
                  documentDate: "2026-07-02",
                  fileName: "Sample_BloodReport_Thyrocare.pdf",
                  previewUrl: "",
                  medications: [],
                  labValues: [
                    { test: "Fasting Blood Sugar", value: "168 mg/dL", range: "70-100 mg/dL", abnormal: true },
                    { test: "HbA1c", value: "8.4%", range: "< 5.7%", abnormal: true }
                  ],
                  diagnoses: ["Uncontrolled Hyperglycemia"],
                  summaryText: "Sample Blood Profile: Elevated FBS (168 mg/dL) and HbA1c (8.4%)."
                });
              }}
              className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-md transition-all flex items-center gap-1"
            >
              <ScanLine className="w-3 h-3 text-emerald-700" />
              Demo: Load Sample Lab
            </button>
          </div>
        </div>
      )}

      {/* No Credentials Warning Banner */}
      {ocrStatus === "no_credentials" && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <ShieldOff className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-sm font-bold text-amber-900">OCR Not Configured</h5>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              Set <code className="bg-amber-100 px-1 rounded text-amber-900 font-semibold">PADDLEOCR_API_KEY</code> or{" "}
              <code className="bg-amber-100 px-1 rounded text-amber-900 font-semibold">GEMINI_API_KEY</code> in your{" "}
              <code className="bg-amber-100 px-1 rounded text-amber-900 font-semibold">.env.local</code> to enable document scanning.
              The camera and upload buttons below still work — extracted text will appear here once credentials are configured.
            </p>
          </div>
        </div>
      )}

      {/* Hidden File Input & Canvas */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Scanner Viewport */}
      <div className={cn(
        "relative rounded-xl min-h-[280px] sm:min-h-[340px] flex flex-col items-center justify-center overflow-hidden transition-colors",
        capturedImage || isCameraActive
          ? "bg-emerald-50/80 border border-emerald-300"
          : "bg-emerald-50/40 border border-emerald-200"
      )}>

        {/* ── Camera Live Mode ─────────────────────────────────────── */}
        {ocrMode === "camera" && isCameraActive ? (
          <div className="relative w-full h-full">
            <video ref={videoRef} playsInline autoPlay muted className="w-full h-[340px] object-cover" />
            {/* Document Guide Overlay */}
            <div className="absolute inset-4 sm:inset-8 border border-dashed border-emerald-400/80 rounded-xl pointer-events-none flex items-center justify-center">
              <span className="bg-emerald-900 text-white text-xs px-3 py-1.5 rounded-lg font-semibold">
                Align {docTypeLabel} inside the box
              </span>
            </div>
            {/* Action Bar */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={capturePhoto}
                className="font-semibold text-sm bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
                disabled={isProcessing}
              >
                <Camera className="w-4 h-4 mr-2" />
                Capture {docTypeLabel}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={stopCamera}
                className="bg-white/95 text-slate-900 text-xs font-semibold"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) :

        /* ── Captured / Uploaded Image Preview ─────────────────────── */
        capturedImage ? (
          <div className="relative w-full h-[340px] bg-emerald-50/50 flex items-center justify-center">
            <img
              src={capturedImage}
              alt="Captured Document"
              className="max-h-full max-w-full object-contain"
            />
            {/* Processing Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-emerald-950/75 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
                <p className="text-sm font-semibold">Extracting medications & lab values...</p>
                <p className="text-xs text-emerald-200">PaddleOCR / Gemini Vision AI</p>
              </div>
            )}
            {/* Clear button */}
            <button
              onClick={() => { setCapturedImage(null); resetState(); }}
              className="absolute top-3 right-3 p-2 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 transition-colors shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) :

        /* ── Idle State — Camera or Upload prompt ─────────────────── */
        (
          <div className="p-8 text-center space-y-4 text-slate-600">
            <div className="w-16 h-16 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center mx-auto">
              <ImageIcon className="w-8 h-8" />
            </div>
            <div>
              <h5 className="text-base font-bold text-slate-900">
                {ocrMode === "camera" ? "Place Document in Frame" : "Upload Document Photo"}
              </h5>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                {ocrMode === "camera"
                  ? "Turn on the camera to photograph the prescription or lab report."
                  : "Select a clear photo of the document to extract medications automatically."}
              </p>
            </div>

            {/* Document type hint pills — always visible in upload mode */}
            {ocrMode === "upload" && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Scanning:</span>
                <button
                  onClick={() => setDocTypeHint("prescription")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all",
                    docTypeHint === "prescription"
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                      : "bg-white text-slate-700 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/50"
                  )}
                >
                  {docTypeIcon}
                  Prescription
                </button>
                <button
                  onClick={() => setDocTypeHint("lab_report")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all",
                    docTypeHint === "lab_report"
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                      : "bg-white text-slate-700 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/50"
                  )}
                >
                  <ScanLine className="w-4 h-4" />
                  Lab Report
                </button>
              </div>
            )}

            {cameraError && (
              <p className="text-xs text-red-600 font-semibold bg-red-50 p-2 rounded-lg border border-red-200">
                {cameraError}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {ocrMode === "camera" ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={startCamera}
                  className="font-semibold text-xs bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
                  disabled={ocrStatus === "checking"}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Open Kiosk Camera
                </Button>
              ) : null}
              <Button
                variant="outline"
                size="md"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white text-emerald-950 border-emerald-300 hover:bg-emerald-50 font-semibold text-xs shadow-xs"
              >
                <Upload className="w-4 h-4 mr-2 text-emerald-700" />
                {ocrMode === "upload"
                  ? `Upload ${docTypeLabel} Photo`
                  : "Upload from Gallery"}
              </Button>
            </div>

            {/* Scannable document hints */}
            <div className="flex items-center justify-center gap-4 pt-1">
              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                Prescription
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                <ScanLine className="w-3.5 h-3.5 text-emerald-600" />
                Lab Report
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                <FileSearch className="w-3.5 h-3.5 text-emerald-600" />
                Discharge Summary
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Extracted Text Panel ──────────────────────────────────── */}
      {(extractedText || extractionError) && (
        <div className="space-y-3">
          {/* Error state */}
          {extractionError && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-sm font-bold text-red-900">Extraction Failed</h5>
                <p className="text-xs text-red-700 mt-0.5">{extractionError}</p>
              </div>
            </div>
          )}

          {/* Extracted text panel */}
          {extractedText && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-emerald-700" />
                <h5 className="text-sm font-bold text-slate-900">Extracted Text</h5>
                {ocrStatus === "ready" && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <div className="bg-emerald-50/40 border border-emerald-200 rounded-xl p-4">
                <pre className="text-sm text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
                  {extractedText}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
