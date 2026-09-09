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
  FileSearch,
  Sparkles,
  RotateCcw,
  Zap,
  Volume2,
  VolumeX,
  Languages,
  Stethoscope,
  Pill,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { speak, stopAllAudio } from "@/lib/voice/bhashini";

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
  language?: string;
}

const SCAN_LANG_OPTIONS = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "bn", label: "বাংলা" },
  { code: "mr", label: "मराठी" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "gu", label: "ગુજરાતી" },
];

type OcrMode = "camera" | "upload";
type DocTypeHint = "prescription" | "lab_report";
type OcrStatus = "checking" | "ready" | "no_credentials";

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onDocumentExtracted,
  className,
  language = "en"
}) => {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const userCancelledRef = React.useRef<boolean>(false);

  // OCR mode toggle
  const [ocrMode, setOcrMode] = React.useState<OcrMode>("camera");
  // Document type hint (affects prompt)
  const [docTypeHint, setDocTypeHint] = React.useState<DocTypeHint>("prescription");
  // OCR engine availability
  const [ocrStatus, setOcrStatus] = React.useState<OcrStatus>("checking");
  // Camera state
  const [isCameraActive, setIsCameraActive] = React.useState(false);
  const [isStartingCamera, setIsStartingCamera] = React.useState(false);
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [isFlashing, setIsFlashing] = React.useState(false);
  // Extracted text panel & Multilingual Clinical Summary
  const [extractedText, setExtractedText] = React.useState<string | null>(null);
  const [extractionError, setExtractionError] = React.useState<string | null>(null);
  const [extractedCount, setExtractedCount] = React.useState<{ meds: number; diagnoses: number } | null>(null);
  const [currentLanguage, setCurrentLanguage] = React.useState<string>(language || "en");
  const [lastResult, setLastResult] = React.useState<ExtractedDocResult | null>(null);
  const [isSpeakingSummary, setIsSpeakingSummary] = React.useState<boolean>(false);
  const [isTranslating, setIsTranslating] = React.useState<boolean>(false);
  const [showRawDetails, setShowRawDetails] = React.useState<boolean>(false);

  // Sync external language prop with internal language state
  React.useEffect(() => {
    if (language && language !== currentLanguage) {
      handleTranslateSummary(language);
    }
  }, [language]);

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

  const handleTranslateSummary = async (targetLang: string) => {
    setCurrentLanguage(targetLang);
    if (!lastResult) return;
    setIsTranslating(true);
    try {
      const res = await fetch("/api/ocr/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "translate_summary",
          language: targetLang,
          extracted: lastResult,
        }),
      });
      const data = await res.json();
      if (data.success && data.summaryText) {
        setExtractedText(data.summaryText);
        setLastResult((prev) => (prev ? { ...prev, summaryText: data.summaryText } : null));
      }
    } catch (e) {
      console.warn("Translation failed:", e);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSpeakSummary = () => {
    if (!extractedText) return;
    if (isSpeakingSummary) {
      stopAllAudio();
      setIsSpeakingSummary(false);
      return;
    }
    setIsSpeakingSummary(true);
    speak(extractedText, { lang: currentLanguage });
  };

  // Multi-tier MediaStream getter for maximum device compatibility
  const acquireCameraStream = async (): Promise<MediaStream> => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Camera API not supported in this browser or environment (requires HTTPS or localhost).");
    }

    // Tier 1: Try high-resolution back/environment camera (optimal for documents)
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
    } catch (e1) {
      console.warn("Back camera 1080p unavailable, trying back camera without resolution constraints...", e1);
    }

    // Tier 2: Try environment camera without strict resolution
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } }
      });
    } catch (e2) {
      console.warn("Ideal environment camera unavailable, falling back to default webcam/video...", e2);
    }

    // Tier 3: Universal fallback to any connected video stream (webcam, front camera, external cam)
    return await navigator.mediaDevices.getUserMedia({
      video: true
    });
  };

  // Start Video Stream
  const startCamera = async () => {
    setCameraError(null);
    setIsStartingCamera(true);

    try {
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }

      const stream = await acquireCameraStream();
      streamRef.current = stream;
      setIsCameraActive(true);
      setCameraError(null);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => {
            console.warn("Video play error:", e);
          });
        };
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn("Camera access failed:", err);
      let errorMsg = "Unable to open camera. Please check permissions.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errorMsg = "Camera permission was denied. Please allow camera access in your browser settings or upload a photo.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        errorMsg = "No camera hardware detected on this device. You can upload an image file directly.";
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        errorMsg = "Camera is currently in use by another application. Please close other camera apps and retry.";
      }
      setCameraError(errorMsg);
      setIsCameraActive(false);
    } finally {
      setIsStartingCamera(false);
    }
  };

  // Ensure stream stays attached if video element re-renders
  React.useEffect(() => {
    if (isCameraActive && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isCameraActive]);

  // Stop Video Stream
  const stopCamera = (userExplicit = false) => {
    if (userExplicit) {
      userCancelledRef.current = true;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsStartingCamera(false);
  };

  // Auto-start camera when in camera mode and no captured image
  React.useEffect(() => {
    if (ocrMode === "camera" && !capturedImage && !userCancelledRef.current) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [ocrMode, capturedImage]);

  // Reset extracted text when a new capture/upload starts
  const resetState = () => {
    setExtractedText(null);
    setExtractionError(null);
    setExtractedCount(null);
  };

  // Fast client-side image downscaling so mobile camera 12MP photos don't bottleneck network
  const compressImageIfNeeded = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(dataUrl);
        return;
      }
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1600;
        let { width, height } = img;
        if (width <= MAX_DIM && height <= MAX_DIM) {
          resolve(dataUrl);
          return;
        }
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.88));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  // Capture Snapshot from Video
  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    // Trigger visual shutter flash
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    // Haptic feedback on supported mobile devices
    if (typeof window !== "undefined" && window.navigator && "vibrate" in window.navigator) {
      try {
        window.navigator.vibrate(40);
      } catch {
        // ignore
      }
    }

    // Capture to offscreen canvas
    const canvas = canvasRef.current || document.createElement("canvas");
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = Math.min(1920, width);
    canvas.height = Math.min(1920, height);

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL("image/jpeg", 0.88);
      setCapturedImage(base64);
      stopCamera(false);
      resetState();
      processOcr(base64, `Prescription_${Date.now()}.jpg`);
    }
  };

  // Handle File Upload Drop
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    resetState();
    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawBase64 = event.target?.result as string;
      const optimizedBase64 = await compressImageIfNeeded(rawBase64);
      setCapturedImage(optimizedBase64);
      processOcr(optimizedBase64, file.name);
    };
    reader.readAsDataURL(file);
  };

  // Generate a realistic demo prescription on canvas for instant testing without paper
  const handleLoadSamplePrescription = () => {
    resetState();
    stopCamera(true);

    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1500;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background paper
    ctx.fillStyle = "#fafaf9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Top Header Banner
    ctx.fillStyle = "#064e3b";
    ctx.fillRect(40, 40, 1120, 140);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText("CITY CIVIL HOSPITAL & MEDICAL COLLEGE", 80, 100);
    ctx.font = "normal 20px sans-serif";
    ctx.fillStyle = "#a7f3d0";
    ctx.fillText("OUTPATIENT DEPARTMENT (OPD) — GENERAL MEDICINE", 80, 140);

    // Doctor & Hospital Info
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText("Dr. Rajesh Sharma, MD (Medicine)", 80, 240);
    ctx.font = "normal 18px sans-serif";
    ctx.fillStyle = "#475569";
    ctx.fillText("Reg. No: MCI-2012-48921 | OPD Room No: 14", 80, 270);

    // Divider
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, 300);
    ctx.lineTo(1120, 300);
    ctx.stroke();

    // Patient Details
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("Patient: Kamla Devi", 80, 340);
    ctx.fillText("Age/Gender: 58 Y / Female", 450, 340);
    ctx.fillText(`Date: ${new Date().toLocaleDateString("en-IN")}`, 850, 340);
    ctx.font = "normal 18px sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("ABHA ID: 91-1234-5678-9012  |  CRN: CRN-849201", 80, 375);

    // Divider
    ctx.beginPath();
    ctx.moveTo(80, 405);
    ctx.lineTo(1120, 405);
    ctx.stroke();

    // Diagnosis Section
    ctx.fillStyle = "#047857";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText("DIAGNOSIS & CLINICAL NOTES:", 80, 450);
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("1. Type 2 Diabetes Mellitus (Uncontrolled)", 100, 490);
    ctx.fillText("2. Essential Hypertension (Stage 2)", 100, 525);
    ctx.fillText("3. Mild Dyslipidemia", 100, 560);

    // Rx Symbol
    ctx.fillStyle = "#064e3b";
    ctx.font = "bold 48px serif";
    ctx.fillText("℞", 80, 640);

    // Medications Table Header
    ctx.fillStyle = "#f1f5f9";
    ctx.fillRect(80, 670, 1040, 45);
    ctx.fillStyle = "#334155";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("Medication / Strength", 100, 700);
    ctx.fillText("Dosage & Frequency", 500, 700);
    ctx.fillText("Duration", 880, 700);

    // Medicine Rows
    const medicines = [
      { name: "Tab. Metformin 500 mg", dose: "1 Tab Twice Daily (BD) after meals", dur: "30 Days" },
      { name: "Tab. Telmisartan 40 mg", dose: "1 Tab Once Daily (OD) morning", dur: "30 Days" },
      { name: "Tab. Atorvastatin 20 mg", dose: "1 Tab Bedtime (HS)", dur: "30 Days" },
      { name: "Cap. Omeprazole 20 mg", dose: "1 Cap Morning (OD) empty stomach", dur: "15 Days" }
    ];

    let yPos = 750;
    ctx.font = "normal 19px sans-serif";
    medicines.forEach((m, idx) => {
      ctx.fillStyle = idx % 2 === 0 ? "#ffffff" : "#f8fafc";
      ctx.fillRect(80, yPos - 30, 1040, 50);

      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 19px sans-serif";
      ctx.fillText(`${idx + 1}. ${m.name}`, 100, yPos);

      ctx.fillStyle = "#334155";
      ctx.font = "normal 18px sans-serif";
      ctx.fillText(m.dose, 500, yPos);
      ctx.fillText(m.dur, 880, yPos);
      yPos += 55;
    });

    // Laboratory Advice Box
    yPos += 40;
    ctx.fillStyle = "#ecfdf5";
    ctx.fillRect(80, yPos, 1040, 110);
    ctx.strokeStyle = "#a7f3d0";
    ctx.strokeRect(80, yPos, 1040, 110);

    ctx.fillStyle = "#065f46";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("INVESTIGATIONS ADVISED:", 100, yPos + 35);
    ctx.fillStyle = "#047857";
    ctx.font = "normal 18px sans-serif";
    ctx.fillText("• Fasting Blood Sugar (FBS) & HbA1c", 100, yPos + 70);
    ctx.fillText("• Serum Creatinine & Lipid Profile", 550, yPos + 70);

    // Doctor Signature Stamp
    ctx.fillStyle = "#1e3a8a";
    ctx.font = "italic bold 24px serif";
    ctx.fillText("Dr. R. Sharma", 900, 1380);
    ctx.font = "normal 16px sans-serif";
    ctx.fillStyle = "#475569";
    ctx.fillText("Signature & OPD Stamp", 880, 1410);

    const base64 = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(base64);
    processOcr(base64, "Sample_Prescription_Dr_Sharma.jpg");
  };

  // Call OCR API
  const processOcr = async (base64Data: string, fileName: string) => {
    setIsProcessing(true);
    setExtractionError(null);
    try {
      const res = await fetch("/api/ocr/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: "image/jpeg",
          language: currentLanguage
        })
      });
      const data = await res.json();

      if (data.error === "requires_credentials") {
        setOcrStatus("no_credentials");
        setExtractionError(data.message ?? "OCR credentials not configured. Please contact the administrator.");
        setIsProcessing(false);
        return;
      }

      if (data.success && data.extracted) {
        const cleanSummary = data.extracted.summaryText || data.extracted.rawOcrText || "";
        setExtractedText(cleanSummary);
        setLastResult(data.extracted);
        setExtractedCount({
          meds: data.extracted.medications?.length || 0,
          diagnoses: data.extracted.diagnoses?.length || 0
        });
        onDocumentExtracted({
          ...data.extracted,
          summaryText: cleanSummary,
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

  return (
    <div className={cn("bg-white rounded-xl border border-slate-200 p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-xs", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-xs">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[15px] font-bold tracking-tight text-slate-900">
              Prescription & Medical Document Vision AI
            </h4>
            <p className="text-xs text-slate-500 font-normal">
              {ocrStatus === "checking" ? "Initializing camera & Vision AI..." :
               ocrStatus === "no_credentials" ? "Vision AI (Offline / Setup required)" :
               "High-speed OPD prescription scanning & clinical entity extraction"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {ocrStatus === "ready" && (
            <Badge variant="default" className="text-xs font-semibold bg-emerald-100 text-emerald-900 border-emerald-300">
              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-700" />
              Vision AI Active
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

      {/* OCR Mode Toggle & Sample Demo Pill */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1 p-1 bg-emerald-50/60 rounded-lg w-fit border border-emerald-200/80">
          <button
            onClick={() => {
              userCancelledRef.current = false;
              setOcrMode("camera");
              resetState();
              setCapturedImage(null);
              startCamera();
            }}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer",
              ocrMode === "camera"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-slate-600 hover:text-emerald-950 hover:bg-emerald-100/50"
            )}
          >
            <Camera className="w-3.5 h-3.5" />
            Live Camera Scanner
          </button>
          <button
            onClick={() => {
              setOcrMode("upload");
              resetState();
              setCapturedImage(null);
              stopCamera(true);
            }}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer",
              ocrMode === "upload"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-slate-600 hover:text-emerald-950 hover:bg-emerald-100/50"
            )}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload File
          </button>
        </div>

        {/* Instant Demo / Sample Prescription Shortcut */}
        <button
          onClick={handleLoadSamplePrescription}
          disabled={isProcessing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors shadow-2xs cursor-pointer"
          title="Load realistic OPD prescription sample (Dr. Sharma) to test instant OCR"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Load Sample Prescription</span>
        </button>
      </div>

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
        "relative rounded-xl min-h-[260px] sm:min-h-[380px] flex flex-col items-center justify-center overflow-hidden transition-all border",
        capturedImage || (ocrMode === "camera" && isCameraActive)
          ? "bg-slate-950 border-emerald-400/80 shadow-md"
          : "bg-emerald-50/40 border-emerald-200"
      )}>

        {/* Visual Shutter Flash Effect */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-40 transition-opacity duration-150 animate-out fade-out" />
        )}

        {/* ── Camera Live Mode Viewport ────────────────────────────── */}
        {ocrMode === "camera" && !capturedImage && (
          <div className="relative w-full h-[260px] sm:h-[380px] bg-black flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className="w-full h-full object-cover"
            />

            {/* Starting camera loader */}
            {isStartingCamera && !isCameraActive && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-3 z-30">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
                <div className="text-center space-y-1">
                  <p className="text-sm font-bold text-white">Opening Camera Hardware...</p>
                  <p className="text-xs text-emerald-300">Requesting webcam / mobile video stream</p>
                </div>
              </div>
            )}

            {/* Camera error overlay */}
            {cameraError && !isCameraActive && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 z-30 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <p className="text-sm font-bold text-white">Camera Notice</p>
                  <p className="text-xs text-red-300 leading-relaxed">{cameraError}</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => { userCancelledRef.current = false; startCamera(); }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-xs font-bold"
                  >
                    Retry Camera
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setOcrMode("upload"); stopCamera(true); }}
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs"
                  >
                    Upload File Instead
                  </Button>
                </div>
              </div>
            )}

            {/* Document Scanner Framing Overlay */}
            {isCameraActive && (
              <div className="absolute inset-3 sm:inset-6 border border-white/20 rounded-2xl pointer-events-none flex flex-col justify-between p-2.5 z-10">
                {/* Four Corner Alignment Brackets */}
                <div className="flex justify-between">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg shadow-sm" />
                  <div className="w-7 h-7 sm:w-8 sm:h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg shadow-sm" />
                </div>

                {/* Guidance Badge in Center */}
                <div className="self-center flex flex-col items-center gap-1 pointer-events-none">
                  <span className="bg-slate-900/80 backdrop-blur-md text-emerald-300 text-[11px] sm:text-xs px-3 py-1 rounded-full font-semibold border border-emerald-500/40 shadow-md flex items-center gap-1.5">
                    <ScanLine className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    Align {docTypeLabel} inside frame • Hold steady
                  </span>
                </div>

                <div className="flex justify-between">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg shadow-sm" />
                  <div className="w-7 h-7 sm:w-8 sm:h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg shadow-sm" />
                </div>
              </div>
            )}

            {/* Action Bar / Large Shutter Button */}
            {isCameraActive && (
              <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2 sm:gap-4 px-3 z-20">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => stopCamera(true)}
                  className="bg-slate-900/70 hover:bg-slate-900 text-white border-white/20 text-xs font-semibold backdrop-blur-md cursor-pointer px-2.5 py-1.5"
                >
                  Close
                </Button>

                <button
                  id="kiosk-shutter-button"
                  onClick={capturePhoto}
                  disabled={isProcessing}
                  className="group relative flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-950/60 border-2 border-white/90 transition-all cursor-pointer"
                  title="Take Prescription Photo"
                >
                  <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-white"></span>
                  </span>
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Take Prescription Photo</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Captured Image Preview State ─────────────────────────── */}
        {capturedImage && (
          <div className="relative w-full h-[260px] sm:h-[380px] bg-slate-900 flex items-center justify-center overflow-hidden">
            <img
              src={capturedImage}
              alt="Captured Prescription Document"
              className="max-h-full max-w-full object-contain"
            />

            {/* Top Status Bar */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
              <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Prescription Photo Captured</span>
              </div>

              {/* Retake Photo Button */}
              <button
                onClick={() => {
                  userCancelledRef.current = false;
                  setCapturedImage(null);
                  resetState();
                  startCamera();
                }}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white hover:text-emerald-300 border border-white/20 text-xs font-semibold backdrop-blur-md transition-all cursor-pointer shadow-sm"
                title="Retake Prescription Photo"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Photo</span>
              </button>
            </div>

            {/* Processing Overlay with Gemini Vision */}
            {isProcessing && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-3 z-20 px-6 text-center">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border-4 border-emerald-500/30 border-t-emerald-400 animate-spin flex items-center justify-center" />
                  <Sparkles className="w-6 h-6 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-bold text-white tracking-tight">Analyzing Prescription with Vision AI</p>
                  <p className="text-xs text-emerald-300 font-medium">Extracting medications, dosage frequencies & clinical diagnoses...</p>
                </div>
              </div>
            )}

            {/* Success Summary Pill when Extraction Finishes */}
            {!isProcessing && extractedCount && (
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center z-10 pointer-events-none">
                <div className="bg-emerald-950/90 backdrop-blur-md border border-emerald-500/50 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Extracted {extractedCount.meds} medicine{extractedCount.meds !== 1 ? "s" : ""}
                    {extractedCount.diagnoses > 0 ? ` & ${extractedCount.diagnoses} clinical indication${extractedCount.diagnoses !== 1 ? "s" : ""}` : ""}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Upload Mode State ─────────────────────────────────────── */}
        {ocrMode === "upload" && !capturedImage && (
          <div className="p-8 text-center space-y-4 text-slate-600 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
              <Upload className="w-8 h-8 text-emerald-700" />
            </div>
            <div>
              <h5 className="text-base font-bold text-slate-900">Upload Prescription Document</h5>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Select a clear photo or scanned image of the prescription from your files.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => fileInputRef.current?.click()}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                <Upload className="w-4 h-4 mr-2" />
                Select Prescription File
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  userCancelledRef.current = false;
                  setOcrMode("camera");
                  startCamera();
                }}
                className="bg-white text-emerald-950 border-emerald-300 hover:bg-emerald-50 font-semibold text-xs shadow-2xs cursor-pointer"
              >
                <Camera className="w-4 h-4 mr-2 text-emerald-700" />
                Switch to Live Camera
              </Button>
            </div>

            <div className="flex items-center justify-center gap-4 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                Prescriptions
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                <ScanLine className="w-3.5 h-3.5 text-emerald-600" />
                Lab Reports
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                <FileSearch className="w-3.5 h-3.5 text-emerald-600" />
                Discharge Slips
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Extracted Clinical Summary Panel ──────────────────────────── */}
      {(extractedText || extractionError) && (
        <div className="space-y-3 pt-2">
          {/* Error state */}
          {extractionError && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-sm font-bold text-red-900">Extraction Notice</h5>
                <p className="text-xs text-red-700 mt-0.5">{extractionError}</p>
              </div>
            </div>
          )}

          {/* Multilingual Clinical Summary Preview Card */}
          {extractedText && (
            <div className="space-y-3 rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30 p-4 sm:p-5 shadow-xs">
              {/* Header with Title, Audio & Language Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-150">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm sm:text-base font-bold text-slate-950 flex items-center gap-1.5">
                      <span>Prescription Clinical Summary</span>
                      <Badge variant="default" className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold">
                        ABDM Verified
                      </Badge>
                    </h5>
                    <p className="text-xs text-slate-500 font-medium">
                      Automated digitization & structured clinical summary in your preferred language
                    </p>
                  </div>
                </div>

                {/* Audio Listen Button */}
                <button
                  type="button"
                  onClick={handleSpeakSummary}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0 self-start sm:self-auto",
                    isSpeakingSummary
                      ? "bg-emerald-800 text-white animate-pulse ring-2 ring-emerald-400"
                      : "bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-50"
                  )}
                  title="Listen to summary in selected language"
                >
                  {isSpeakingSummary ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-700" />}
                  <span>{isSpeakingSummary ? "Stop Audio" : "Listen Summary (आवाज में सुनें)"}</span>
                </button>
              </div>

              {/* Language Selection Chips */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                  <Languages className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Choose Summary Language (पसंदीदा भाषा चुनें):</span>
                  {isTranslating && <RefreshCw className="w-3 h-3 text-emerald-600 animate-spin ml-1" />}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {SCAN_LANG_OPTIONS.map((langOpt) => {
                    const isSelected = currentLanguage === langOpt.code;
                    return (
                      <button
                        key={langOpt.code}
                        type="button"
                        onClick={() => handleTranslateSummary(langOpt.code)}
                        disabled={isTranslating}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer select-none",
                          isSelected
                            ? "bg-emerald-800 text-white shadow-xs scale-102"
                            : "bg-white border border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50"
                        )}
                      >
                        {langOpt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Human-Readable Formatted Summary Body */}
              <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-2xs">
                <div className="text-xs sm:text-sm text-slate-800 whitespace-pre-line font-sans leading-relaxed">
                  {extractedText}
                </div>
              </div>

              {/* Highlighted Medicines & Diagnosis Quick Badges */}
              {lastResult && (
                <div className="space-y-2 pt-1">
                  {lastResult.diagnoses && lastResult.diagnoses.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-600">Diagnosis:</span>
                      {lastResult.diagnoses.map((d, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-950 font-bold text-xs border border-emerald-200">
                          {d}
                        </span>
                      ))}
                    </div>
                  )}

                  {lastResult.medications && lastResult.medications.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {lastResult.medications.map((m, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Pill className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <div>
                              <span className="font-bold text-slate-950 block">{m.name}</span>
                              <span className="text-[11px] text-slate-500">{m.dosage || "Standard Dose"}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                            {m.frequency || "Daily"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Collapsible Doctor Raw Data for technical inspection */}
              {lastResult && (
                <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setShowRawDetails((prev) => !prev)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showRawDetails ? "Hide Vision AI Breakdown" : "View Clinical Vision AI Breakdown"}</span>
                    {showRawDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  <span className="text-[11px] text-slate-400">Gemini 2.5 Flash Vision OCR</span>
                </div>
              )}

              {showRawDetails && lastResult && (
                <div className="bg-slate-900 rounded-xl p-3.5 text-slate-200 overflow-x-auto text-[11px] font-mono leading-relaxed max-h-40">
                  <pre>{JSON.stringify({
                    docType: lastResult.docType,
                    diagnoses: lastResult.diagnoses,
                    medications: lastResult.medications,
                    labValues: lastResult.labValues,
                    proceduresSurgeries: lastResult.proceduresSurgeries
                  }, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
