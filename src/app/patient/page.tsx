"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User, ShieldCheck, QrCode, FileText, Activity, Clock,
  ArrowRight, PhoneCall, Stethoscope, Mic, Download,
  CheckCircle2, AlertTriangle, Pill, ChevronRight, X,
  ExternalLink, Calendar, MapPin, RefreshCw, Eye, HeartPulse,
  Share2, Shield, Layers, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/* ─── Mock Data ────────────────────────────────────────────────────────── */

interface PrescriptionItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  prescribedBy: string;
  hospital: string;
  date: string;
  category: "allopathy" | "ayurveda";
}

interface LabItem {
  test: string;
  value: string;
  unit: string;
  normalRange: string;
  status: "high" | "normal" | "low";
  date: string;
}

const MOCK_PRESCRIPTIONS: PrescriptionItem[] = [
  {
    id: "rx-1",
    name: "Tab Paracetamol",
    dosage: "650mg",
    frequency: "TDS (Thrice daily)",
    duration: "5 Days",
    prescribedBy: "Dr. Rajesh Mehra (MD Gen Med)",
    hospital: "All India Institute of Ayurveda (AIIA)",
    date: "04 Sep 2026",
    category: "allopathy"
  },
  {
    id: "rx-2",
    name: "Tab Cefixime",
    dosage: "200mg",
    frequency: "BD (Twice daily)",
    duration: "7 Days",
    prescribedBy: "Dr. Rajesh Mehra (MD Gen Med)",
    hospital: "All India Institute of Ayurveda (AIIA)",
    date: "04 Sep 2026",
    category: "allopathy"
  },
  {
    id: "rx-3",
    name: "Sudarshan Vati",
    dosage: "2 Tabs",
    frequency: "BD with lukewarm water",
    duration: "10 Days",
    prescribedBy: "Dr. Ananya Sharma (MD Ayur)",
    hospital: "AIIA Ayush OPD",
    date: "28 Aug 2026",
    category: "ayurveda"
  },
  {
    id: "rx-4",
    name: "Tab Telmisartan",
    dosage: "40mg",
    frequency: "OD (Morning after food)",
    duration: "30 Days (Chronic)",
    prescribedBy: "Dr. V. K. Shastri",
    hospital: "Apex OPD Corridor 2",
    date: "15 Aug 2026",
    category: "allopathy"
  },
];

const MOCK_LABS: LabItem[] = [
  {
    test: "Fasting Blood Sugar (FBS)",
    value: "168",
    unit: "mg/dL",
    normalRange: "70 - 100",
    status: "high",
    date: "04 Sep 2026"
  },
  {
    test: "Glycated Hemoglobin (HbA1c)",
    value: "8.4",
    unit: "%",
    normalRange: "< 5.7 (Normal)",
    status: "high",
    date: "04 Sep 2026"
  },
  {
    test: "Serum Creatinine",
    value: "0.9",
    unit: "mg/dL",
    normalRange: "0.6 - 1.2",
    status: "normal",
    date: "04 Sep 2026"
  },
  {
    test: "Blood Pressure (Systolic/Diastolic)",
    value: "138/86",
    unit: "mmHg",
    normalRange: "< 120/80",
    status: "high",
    date: "04 Sep 2026"
  },
];

/* ─── Main Component ────────────────────────────────────────────────────── */

function PatientPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Profile data from query or default
  const paramAbha = searchParams.get("abha") || "91-4523-8819-2041";
  const paramName = searchParams.get("name") || "Kamla Devi";
  const paramGender = searchParams.get("gender") || "Female";
  const paramAge = searchParams.get("age") || "62";

  const [lang, setLang] = React.useState<"hi" | "en">("hi");
  const [showAbhaModal, setShowAbhaModal] = React.useState(false);
  const [showRxModal, setShowRxModal] = React.useState(false);
  const [showLabsModal, setShowLabsModal] = React.useState(false);
  const [showFhirModal, setShowFhirModal] = React.useState(false);
  const [liveQueueServing, setLiveQueueServing] = React.useState(38);
  const [isRefreshingQueue, setIsRefreshingQueue] = React.useState(false);

  // Build kiosk launch query
  const kioskParams = new URLSearchParams({
    abha: paramAbha,
    name: paramName,
    gender: paramGender,
    age: paramAge,
  }).toString();

  const refreshQueue = () => {
    setIsRefreshingQueue(true);
    setTimeout(() => {
      setLiveQueueServing((prev) => (prev < 41 ? prev + 1 : prev));
      setIsRefreshingQueue(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F6FAF7] text-slate-900 flex flex-col antialiased selection:bg-emerald-100 selection:text-emerald-950 font-sans">
      {/* ── Top Government Header ────────────────────────────────────────── */}
      <header className="border-b border-emerald-100 bg-white/95 backdrop-blur-sm sticky top-0 z-40 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                M
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 tracking-tight">MediKiosk</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold">
                    ABDM Enabled
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">National Health Authority · Ayush HMIS</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Toggle */}
            <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setLang("hi")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  lang === "hi" ? "bg-white text-emerald-800 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  lang === "en" ? "bg-white text-emerald-800 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                English
              </button>
            </div>

            {/* Switch User Link */}
            <Link href="/login/patient">
              <Button variant="ghost" size="sm" className="text-xs text-slate-600 hover:text-emerald-800 font-medium">
                {lang === "hi" ? "बदलें" : "Switch User"}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Content Container ───────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* ── 1. Official Patient Identity & UMID Card Strip ───────────────── */}
        <div className="rounded-2xl border border-emerald-200/90 bg-white shadow-xs overflow-hidden">
          {/* Top National Health Bar */}
          <div className="bg-linear-to-r from-emerald-800 to-teal-800 text-white px-5 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Ayushman Bharat Health Account (ABHA) · Registered Patient</span>
            </div>
            <span className="text-[11px] text-emerald-200 font-medium hidden sm:inline">
              CRN: 229152300039896
            </span>
          </div>

          {/* Profile Body */}
          <div className="p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-2xl shrink-0 shadow-2xs">
                <User className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">{paramName}</h2>
                  <Badge variant="success" className="text-[11px] px-2 py-0.5 bg-emerald-100/80 text-emerald-800 border-emerald-200 font-semibold">
                    ✓ Verified M1/M2
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 font-medium">
                  <span>ABHA ID: <strong className="text-slate-800 font-semibold">{paramAbha}</strong></span>
                  <span>·</span>
                  <span>{paramGender}, {paramAge} Years</span>
                  <span>·</span>
                  <span className="text-slate-500">CRN: 229152300039896</span>
                </div>
              </div>
            </div>

            {/* Quick Actions for Profile */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAbhaModal(true)}
                className="h-10 px-3.5 text-xs font-semibold border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 hover:text-emerald-900 shadow-2xs whitespace-nowrap"
              >
                <QrCode className="w-4 h-4 mr-1.5 text-emerald-700 shrink-0" />
                <span>{lang === "hi" ? "ABHA कार्ड देखें" : "View ABHA Card"}</span>
              </Button>

              <Link href={`/kiosk?${kioskParams}`} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-10 px-4 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
                  <Stethoscope className="w-4 h-4 shrink-0" />
                  <span>{lang === "hi" ? "ओपीडी इनटेक शुरू करें" : "Start OPD Intake"}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5 shrink-0" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ── 2. Four Core Real Feature Cards Grid ─────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* ── Card 1: Services (OPD Self Registration & AI Intake) ───────── */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-emerald-900 font-bold text-base">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <h3>{lang === "hi" ? "ओपीडी सेवाएं एवं AI इनटेक" : "OPD Services & AI Intake"}</h3>
                </div>
                <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-200 bg-emerald-50 font-semibold">
                  Module A & B
                </Badge>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {lang === "hi"
                  ? "डॉक्टर के कमरे में जाने से पहले अपनी बीमारी की पूरी जानकारी हिंदी या क्षेत्रीय भाषा में बोलें, और पुराने पर्चे स्कैन करें।"
                  : "Complete your voice-driven history intake in 8 Indic languages and scan paper records before entering the consultation room."}
              </p>

              {/* Quick Feature Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                  🎤 {lang === "hi" ? "आवाज द्वारा संवाद" : "Voice Dialogue (Bhashini)"}
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                  📄 {lang === "hi" ? "पुराने पर्चे OCR" : "Prescription OCR"}
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                  🌿 {lang === "hi" ? "दशविध परीक्षा" : "Dashavidha Pariksha"}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <Link href={`/kiosk?${kioskParams}`} className="flex-1">
                <Button className="w-full h-10 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs inline-flex items-center justify-center gap-1.5">
                  <Mic className="w-3.5 h-3.5" />
                  <span>{lang === "hi" ? "आवाज से इनटेक शुरू करें" : "Start Voice Intake"}</span>
                </Button>
              </Link>
              <Link href={`/kiosk?step=scan&${kioskParams}`} className="sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto h-10 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50">
                  {lang === "hi" ? "पर्चे स्कैन करें" : "Scan Records"}
                </Button>
              </Link>
            </div>
          </div>

          {/* ── Card 2: Health Records & Referrals (Prescriptions & Labs) ──── */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-emerald-900 font-bold text-base">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-800">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3>{lang === "hi" ? "डिजिटल स्वास्थ्य रिकॉर्ड एवं पर्चे" : "Health Records & Prescriptions"}</h3>
                </div>
                <Badge variant="outline" className="text-[10px] text-teal-700 border-teal-200 bg-teal-50 font-semibold">
                  FHIR Timeline
                </Badge>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {lang === "hi"
                  ? "AI द्वारा स्कैन किए गए पुराने पर्चे, चालू दवाइयां, जांच रिपोर्ट एवं एब्नॉर्मल लैब मान सीधे अपने फोन या स्क्रीन पर देखें।"
                  : "View AI-digitized past prescriptions, active ongoing medications, and laboratory investigation findings."}
              </p>

              {/* Active Medication Summary Preview */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-emerald-700" />
                    {lang === "hi" ? "चालू दवाएं (4 सक्रिय)" : "Active Medications (4 Active)"}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-medium">AIIA OPD</span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  Tab Paracetamol 650mg, Tab Cefixime 200mg, Sudarshan Vati...
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRxModal(true)}
                className="flex-1 h-10 text-xs font-semibold border-slate-200 text-slate-800 hover:border-emerald-300 hover:bg-emerald-50/40"
              >
                <Eye className="w-3.5 h-3.5 mr-1.5 text-emerald-700" />
                {lang === "hi" ? "दवाई पर्चे देखें" : "View Prescriptions"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowLabsModal(true)}
                className="flex-1 h-10 text-xs font-semibold border-slate-200 text-slate-800 hover:border-emerald-300 hover:bg-emerald-50/40"
              >
                <Activity className="w-3.5 h-3.5 mr-1.5 text-teal-700" />
                {lang === "hi" ? "जांच रिपोर्ट" : "Lab Reports"}
              </Button>
            </div>
          </div>

          {/* ── Card 3: Transaction Status / Live OPD Q-Slip ────────────────── */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-emerald-900 font-bold text-base">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-800">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h3>{lang === "hi" ? "ओपीडी लाइव टोकन एवं पर्ची" : "Live OPD Q-Slip & Status"}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshQueue}
                  disabled={isRefreshingQueue}
                  className="h-7 px-2 text-[11px] text-slate-500 hover:text-emerald-800"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${isRefreshingQueue ? "animate-spin" : ""}`} />
                  {lang === "hi" ? "रिफ्रेश" : "Refresh"}
                </Button>
              </div>

              {/* Live Token Ticket Box */}
              <div className="p-4 bg-linear-to-br from-emerald-50/80 to-teal-50/60 rounded-xl border border-emerald-200/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
                      {lang === "hi" ? "आपका टोकन नंबर" : "Your Token Number"}
                    </span>
                    <span className="text-2xl font-black text-emerald-950">Token #42</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
                      {lang === "hi" ? "ओपीडी कमरा" : "Consultation Room"}
                    </span>
                    <span className="text-sm font-extrabold text-emerald-900">Room 104</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60 text-xs">
                  <span className="text-slate-600 font-medium">
                    {lang === "hi" ? "वर्तमान में सेवारत:" : "Currently Serving:"}{" "}
                    <strong className="text-emerald-800 font-bold">#{liveQueueServing}</strong>
                  </span>
                  <span className="text-xs font-semibold text-emerald-700">
                    ~{Math.max(0, (42 - liveQueueServing) * 2)} {lang === "hi" ? "मिनट शेष" : "mins wait"}
                  </span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-100/50 p-2.5 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  {lang === "hi"
                    ? "क्लिनिकल समरी डॉक्टर के कंप्यूटर पर भेज दी गई है"
                    : "Intake Summary Transmitted to Doctor Desk"}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                onClick={() => setShowFhirModal(true)}
                className="w-full h-10 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 inline-flex items-center justify-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-700" />
                <span>{lang === "hi" ? "ABDM FHIR बंडल स्थिति देखें" : "View ABDM FHIR Bundle Status"}</span>
              </Button>
            </div>
          </div>

          {/* ── Card 4: Hospital Enquiry & 24x7 Emergency ───────────────────── */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-emerald-900 font-bold text-base">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-800">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <h3>{lang === "hi" ? "अस्पताल पूछताछ एवं आपातकालीन" : "Hospital Enquiry & Emergency"}</h3>
                </div>
                <Badge variant="outline" className="text-[10px] text-rose-700 border-rose-200 bg-rose-50 font-semibold">
                  24x7 Helpline
                </Badge>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {lang === "hi"
                  ? "आज की सक्रिय ओपीडी विशेषज्ञताएं, इमरजेंसी सहायता, और राष्ट्रीय स्वास्थ्य हेल्पलाइन नंबर।"
                  : "Today's active clinical OPD specialities roster and 24x7 national emergency emergency helplines."}
              </p>

              {/* Speciality Roster Snippet */}
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="font-semibold">🌿 {lang === "hi" ? "कायाचिकित्सा (आयुर्वेद ओपीडी)" : "Kayachikitsa (Ayurveda)"}</span>
                  <span className="text-emerald-700 font-semibold text-[11px]">Room 104 · Active</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="font-semibold">🩺 {lang === "hi" ? "सामान्य चिकित्सा (एलोपैथी)" : "General Medicine"}</span>
                  <span className="text-emerald-700 font-semibold text-[11px]">Room 102 · Active</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="font-semibold">🧘 {lang === "hi" ? "पंचकर्म चिकित्सा इकाई" : "Panchakarma Unit"}</span>
                  <span className="text-emerald-700 font-semibold text-[11px]">Room 108 · Active</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <a href="tel:108" className="flex-1">
                <Button className="w-full h-10 text-xs font-semibold bg-rose-700 hover:bg-rose-800 text-white shadow-xs inline-flex items-center justify-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{lang === "hi" ? "108 एम्बुलेंस" : "108 Ambulance"}</span>
                </Button>
              </a>
              <a href="tel:14416" className="sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto h-10 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50">
                  <span>{lang === "hi" ? "Tele-MANAS" : "Tele-MANAS"}</span>
                </Button>
              </a>
            </div>
          </div>

        </div>

      </main>

      {/* ── MODAL 1: Digital ABHA Health Card ────────────────────────────── */}
      {showAbhaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-emerald-800 to-teal-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-sm">Ayushman Bharat Digital Mission (ABDM)</h3>
              </div>
              <button
                onClick={() => setShowAbhaModal(false)}
                className="text-emerald-200 hover:text-white p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Official Card Body */}
            <div className="p-6 space-y-5">
              <div className="border-2 border-emerald-700 rounded-xl p-5 bg-linear-to-b from-white to-emerald-50/40 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800 block">
                      National Health Authority
                    </span>
                    <span className="text-xs font-semibold text-slate-600">Ministry of Health & Family Welfare</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold border-emerald-300 text-emerald-800 bg-white">
                    ABHA CARD
                  </Badge>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-slate-900">{paramName}</h4>
                    <p className="text-xs text-slate-500 font-medium">ABHA Number: <strong className="text-slate-800">{paramAbha}</strong></p>
                    <p className="text-xs text-slate-500 font-medium">ABHA Address: <strong className="text-emerald-800 font-semibold">{paramName.toLowerCase().replace(/\s+/g, ".")}@abdm</strong></p>
                    <div className="text-xs text-slate-600 pt-1 flex gap-3 font-medium">
                      <span>Gender: <strong>{paramGender}</strong></span>
                      <span>·</span>
                      <span>YOB: <strong>{new Date().getFullYear() - Number(paramAge)}</strong></span>
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-lg bg-white border border-slate-300 p-1 flex items-center justify-center shrink-0 shadow-2xs">
                    <QrCode className="w-14 h-14 text-slate-800" />
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 border-t border-emerald-100 pt-2 flex items-center justify-between">
                  <span>CRN: 229152300039896</span>
                  <span className="text-emerald-700 font-semibold">Status: ACTIVE</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setShowAbhaModal(false)}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold h-10"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  {lang === "hi" ? "कार्ड डाउनलोड करें" : "Download Card"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAbhaModal(false)}
                  className="h-10 px-4 text-xs font-semibold border-slate-200"
                >
                  {lang === "hi" ? "बंद करें" : "Close"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Prescriptions Modal ─────────────────────────────────── */}
      {showRxModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-emerald-800 text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-300" />
                <h3 className="font-bold text-sm">Digitized Prescriptions & Active Medications</h3>
              </div>
              <button onClick={() => setShowRxModal(false)} className="text-emerald-200 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              <p className="text-xs text-slate-500 font-medium">
                Prescriptions extracted by MediKiosk Document OCR and linked to ABHA profile:
              </p>

              {MOCK_PRESCRIPTIONS.map((rx) => (
                <div key={rx.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{rx.name}</h4>
                      <p className="text-slate-600 font-medium">Dosage: <strong>{rx.dosage}</strong> · {rx.frequency}</p>
                    </div>
                    <Badge variant={rx.category === "ayurveda" ? "success" : "default"} className="text-[10px] uppercase font-bold">
                      {rx.category}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>{rx.prescribedBy}</span>
                    <span>{rx.date}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <Button onClick={() => setShowRxModal(false)} className="bg-emerald-700 text-white text-xs font-semibold h-9 px-4">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Labs Modal ─────────────────────────────────────────── */}
      {showLabsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-teal-800 text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-300" />
                <h3 className="font-bold text-sm">Laboratory Investigations & Vitals</h3>
              </div>
              <button onClick={() => setShowLabsModal(false)} className="text-teal-200 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              <p className="text-xs text-slate-500 font-medium">
                Structured laboratory results with automated normal/abnormal severity detection:
              </p>

              {MOCK_LABS.map((lab, i) => (
                <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{lab.test}</h4>
                    <p className="text-slate-500 text-[11px]">Normal Range: {lab.normalRange} {lab.unit}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-900">{lab.value} {lab.unit}</span>
                    <Badge variant={lab.status === "high" ? "danger" : "success"} className="text-[10px] block mt-0.5 font-bold">
                      {lab.status === "high" ? "ELEVATED ⚠️" : "NORMAL ✓"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <Button onClick={() => setShowLabsModal(false)} className="bg-teal-700 text-white text-xs font-semibold h-9 px-4">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: FHIR Bundle Status ─────────────────────────────────── */}
      {showFhirModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-indigo-900 text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-300" />
                <h3 className="font-bold text-sm">HL7 FHIR R4 Bundle Validation (ABDM)</h3>
              </div>
              <button onClick={() => setShowFhirModal(false)} className="text-indigo-200 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>FHIR Bundle Structure: 100% Valid HL7 R4 Clinical Document</span>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-700 block">Generated Resources:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li><strong>Bundle.type:</strong> document</li>
                  <li><strong>Composition:</strong> Clinical Intake & Case Summary (LOINC 11506-3)</li>
                  <li><strong>Patient:</strong> {paramName} ({paramAbha})</li>
                  <li><strong>Condition:</strong> Primary Diagnosis & Chief Complaints</li>
                  <li><strong>MedicationStatement:</strong> 4 Structured Entities</li>
                  <li><strong>Observation:</strong> SOCRATES & Pariksha Vitals</li>
                </ul>
              </div>

              <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[10px] overflow-x-auto">
{`{
  "resourceType": "Bundle",
  "id": "medikiosk-bundle-2026",
  "type": "document",
  "timestamp": "${new Date().toISOString()}",
  "entry": [
    { "resource": { "resourceType": "Patient", "id": "${paramAbha}" } },
    { "resource": { "resourceType": "Condition", "code": "Pyrexia / Fever" } }
  ]
}`}
              </pre>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <Button onClick={() => setShowFhirModal(false)} className="bg-indigo-700 text-white text-xs font-semibold h-9 px-4">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function PatientPortalPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F6FAF7] flex items-center justify-center text-xs text-slate-500 font-semibold">
          Loading Patient Portal...
        </div>
      }
    >
      <PatientPortalContent />
    </React.Suspense>
  );
}
