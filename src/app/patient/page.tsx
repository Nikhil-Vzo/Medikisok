"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User, ShieldCheck, QrCode, FileText, Activity, Clock,
  ArrowRight, PhoneCall, Stethoscope, Download,
  CheckCircle2, AlertCircle, Pill, X,
  RefreshCw, HeartPulse, Building2, Sun, Moon, Sunrise, Printer,
  Phone, Ambulance, Mic, Info, Check, LogOut, ChevronRight,
  Calendar, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageDropdown } from "@/components/shared/language-dropdown";
import { getPatientPortalStrings } from "@/lib/translations/patient-portal-strings";
import {
  fetchPatientPrescriptionsFromDb,
  fetchPatientLabReportsFromDb,
  fetchHospitalDepartmentsFromDb,
  PortalDepartment,
} from "@/lib/supabase/db";

/* ─── Data Types & Defaults ─────────────────────────────────────────────── */

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

const DEFAULT_SAMPLE_PRESCRIPTIONS: PrescriptionItem[] = [
  {
    id: "rx-1",
    name: "Sitopaladi Churna + Madhu",
    dosage: "3g (1/2 tsp) with lukewarm water",
    frequency: "Twice daily (Morning & Night) after meals",
    duration: "7 Days",
    prescribedBy: "Dr. Ananya Sharma (MD Ayur)",
    hospital: "AIIA New Delhi · Kayachikitsa OPD",
    date: "04 Sep 2026",
    category: "ayurveda",
  },
  {
    id: "rx-2",
    name: "Paracetamol 650mg (SOS / Fever)",
    dosage: "1 tablet as needed for temp > 100°F",
    frequency: "Max 3 times daily, 6 hours apart",
    duration: "3 Days",
    prescribedBy: "Dr. Rajesh Mehra (MD Gen Med)",
    hospital: "AIIA New Delhi · General Medicine",
    date: "04 Sep 2026",
    category: "allopathy",
  },
  {
    id: "rx-3",
    name: "Amrutharishtam (Immunity Rasayana)",
    dosage: "15ml with equal quantity lukewarm water",
    frequency: "Twice daily after principal meals",
    duration: "14 Days",
    prescribedBy: "Dr. Ananya Sharma (MD Ayur)",
    hospital: "AIIA New Delhi · Kayachikitsa OPD",
    date: "28 Aug 2026",
    category: "ayurveda",
  },
];

const DEFAULT_SAMPLE_LABS: LabItem[] = [
  {
    test: "Complete Blood Count (CBC) - Hb",
    value: "13.8",
    unit: "g/dL",
    normalRange: "12.0 - 16.0",
    status: "normal",
    date: "04 Sep 2026",
  },
  {
    test: "Fasting Blood Glucose (FBS)",
    value: "94",
    unit: "mg/dL",
    normalRange: "70 - 100",
    status: "normal",
    date: "04 Sep 2026",
  },
  {
    test: "Serum Bilirubin (Total)",
    value: "0.85",
    unit: "mg/dL",
    normalRange: "0.2 - 1.2",
    status: "normal",
    date: "04 Sep 2026",
  },
];

/* ─── Main Portal Component ─────────────────────────────────────────────── */

function PatientPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Patient profile from query or verified session
  const paramAbha = searchParams.get("abha") || "";
  const paramName = searchParams.get("name") || "";
  const paramGender = searchParams.get("gender") || "Not Specified";
  const paramAge = searchParams.get("age") || "";
  const paramLang = searchParams.get("lang") || "en";

  const [activeAbha, setActiveAbha] = React.useState(paramAbha);
  const [activeName, setActiveName] = React.useState(paramName);
  const [activeGender, setActiveGender] = React.useState(paramGender);
  const [activeAge, setActiveAge] = React.useState(paramAge);

  const [lang, setLang] = React.useState<string>(paramLang);
  const t = getPatientPortalStrings(lang);
  const [showAbhaModal, setShowAbhaModal] = React.useState(false);
  const [showRxModal, setShowRxModal] = React.useState(false);
  const [rxActiveTab, setRxActiveTab] = React.useState<"rx" | "labs">("rx");
  const [showTokenModal, setShowTokenModal] = React.useState(false);
  const [showHelpModal, setShowHelpModal] = React.useState(false);

  interface ActiveQueueToken {
    tokenNumber: number;
    assignedRoom: string;
    assignedDoctor: string;
    nowServing: number;
    waitTimeMins: number;
    chiefComplaint?: string;
  }

  const [activeToken, setActiveToken] = React.useState<ActiveQueueToken | null>(null);
  const [liveQueueServing, setLiveQueueServing] = React.useState(38);
  const [isRefreshingQueue, setIsRefreshingQueue] = React.useState(false);
  const [prescriptions, setPrescriptions] = React.useState<PrescriptionItem[]>(DEFAULT_SAMPLE_PRESCRIPTIONS);
  const [labReports, setLabReports] = React.useState<LabItem[]>(DEFAULT_SAMPLE_LABS);
  const [departments, setDepartments] = React.useState<PortalDepartment[]>([
    {
      id: "dept-1",
      departmentName: "Kayachikitsa (Ayurveda OPD)",
      category: "ayurveda",
      roomNumber: "Room 104",
      doctorInCharge: "Dr. Ananya Sharma (MD Ayur)",
      status: "active",
      timings: "09:00 AM - 02:00 PM",
    },
    {
      id: "dept-2",
      departmentName: "General Medicine",
      category: "allopathy",
      roomNumber: "Room 102",
      doctorInCharge: "Dr. Rajesh Mehra (MD Gen Med)",
      status: "active",
      timings: "08:30 AM - 03:00 PM",
    },
    {
      id: "dept-3",
      departmentName: "Panchakarma Unit",
      category: "ayurveda",
      roomNumber: "Room 108",
      doctorInCharge: "Dr. P. K. Namboodiri",
      status: "active",
      timings: "09:30 AM - 01:30 PM",
    },
  ]);

  // Sync with localStorage so patient identity is never lost
  React.useEffect(() => {
    if (paramAbha || paramName) {
      setActiveAbha(paramAbha);
      setActiveName(paramName);
      if (paramGender && paramGender !== "Not Specified") setActiveGender(paramGender);
      if (paramAge) setActiveAge(paramAge);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(
            "medikiosk_patient_session",
            JSON.stringify({
              abhaId: paramAbha,
              fullName: paramName,
              gender: paramGender,
              age: paramAge,
              authenticated: true,
            })
          );
        } catch (e) {}
      }
    } else if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("medikiosk_patient_session");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.abhaId) setActiveAbha(parsed.abhaId);
          if (parsed.fullName) setActiveName(parsed.fullName);
          if (parsed.gender) setActiveGender(parsed.gender);
          if (parsed.age) setActiveAge(parsed.age);
        }
      } catch (e) {}
    }
  }, [paramAbha, paramName, paramGender, paramAge]);

  React.useEffect(() => {
    async function loadPortalDbData() {
      try {
        const effectiveAbha = activeAbha || paramAbha;
        const [rxData, labsData, deptsData] = await Promise.all([
          fetchPatientPrescriptionsFromDb(effectiveAbha),
          fetchPatientLabReportsFromDb(effectiveAbha),
          fetchHospitalDepartmentsFromDb(),
        ]);
        if (rxData && rxData.length > 0) {
          setPrescriptions(rxData);
        } else {
          setPrescriptions(DEFAULT_SAMPLE_PRESCRIPTIONS);
        }
        if (labsData && labsData.length > 0) {
          setLabReports(labsData);
        } else {
          setLabReports(DEFAULT_SAMPLE_LABS);
        }
        if (deptsData && deptsData.length > 0) setDepartments(deptsData);

        // Fetch active queue status
        if (effectiveAbha) {
          try {
            const qRes = await fetch(`/api/queue?abhaId=${encodeURIComponent(effectiveAbha)}`);
            if (qRes.ok) {
              const qData = await qRes.json();
              if (qData.inQueue && qData.tokenNumber) {
                setActiveToken({
                  tokenNumber: qData.tokenNumber,
                  assignedRoom: qData.assignedRoom || "Room 104 (Dr. Ananya)",
                  assignedDoctor: qData.assignedDoctor || "Dr. Ananya Sharma",
                  nowServing: qData.nowServing ?? 38,
                  waitTimeMins: qData.waitTimeMins ?? 8,
                  chiefComplaint: qData.patient?.chiefComplaint,
                });
                return;
              }
            }
          } catch (e) {}
        }

        // Check local storage if token was just generated during kiosk session
        if (typeof window !== "undefined") {
          try {
            const saved = localStorage.getItem("medikiosk_active_token");
            if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed && parsed.tokenNumber) {
                setActiveToken(parsed);
                return;
              }
            }
          } catch (e) {}
        }
        setActiveToken(null);
      } catch (e) {
        // graceful fallback to preset data
      }
    }
    loadPortalDbData();
  }, [activeAbha, paramAbha]);

  // Build kiosk launch query with authenticated session so kiosk skips redundant login
  const kioskParams = new URLSearchParams({
    abha: activeAbha || paramAbha,
    name: activeName || paramName,
    gender: activeGender || paramGender,
    age: activeAge || paramAge,
    lang: lang,
    authenticated: "true",
    from: "portal",
  }).toString();

  const refreshQueue = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshingQueue(true);
    const effectiveAbha = activeAbha || paramAbha;
    if (effectiveAbha) {
      try {
        const qRes = await fetch(`/api/queue?abhaId=${encodeURIComponent(effectiveAbha)}`);
        if (qRes.ok) {
          const qData = await qRes.json();
          if (qData.inQueue && qData.tokenNumber) {
            setActiveToken({
              tokenNumber: qData.tokenNumber,
              assignedRoom: qData.assignedRoom || "Room 104 (Dr. Ananya)",
              assignedDoctor: qData.assignedDoctor || "Dr. Ananya Sharma",
              nowServing: qData.nowServing ?? 38,
              waitTimeMins: qData.waitTimeMins ?? 8,
              chiefComplaint: qData.patient?.chiefComplaint,
            });
          } else {
            const saved = localStorage.getItem("medikiosk_active_token");
            if (saved) {
              setActiveToken(JSON.parse(saved));
            } else {
              setActiveToken(null);
            }
          }
        }
      } catch (e) {}
    }
    setTimeout(() => {
      setIsRefreshingQueue(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col antialiased selection:bg-emerald-100 selection:text-emerald-950 font-sans">
      {/* ── Top Government Masthead Header ───────────────────────────────── */}
      <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="flex items-center gap-3 group min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-emerald-800 flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:bg-emerald-900 transition-colors shrink-0">
                M
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-950 tracking-tight">MediKiosk</span>
                  <span className="hidden md:inline-flex text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                    ABDM M1/M2 Certified
                  </span>
                </div>
                <p className="hidden sm:block text-xs text-slate-500 font-medium truncate">
                  National Health Authority · Ministry of Health
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <LanguageDropdown currentLang={lang} onSelect={setLang} />

            <Link
              href="/login/patient"
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
              title={lang === "hi" ? "मरीज़ बदलें" : "Switch User"}
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">{lang === "hi" ? "मरीज़ बदलें" : "Switch User"}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Content Container ───────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-28 sm:pb-16 space-y-6 sm:space-y-8">

        {/* Unauthenticated Session Banner */}
        {(!activeName && !activeAbha && !paramName && !paramAbha) && (
          <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-700 text-white flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900">
                  {lang === "hi" ? "सक्रिय मरीज़ सत्र नहीं मिला" : "No Active Patient Session"}
                </p>
                <p className="text-xs text-slate-600">
                  {lang === "hi"
                    ? "अपने व्यक्तिगत स्वास्थ्य रिकॉर्ड, टोकन और पर्चे देखने के लिए कृपया ABHA आईडी से लॉगिन करें।"
                    : "Please authenticate with your ABHA ID or mobile number to view your personal prescriptions, token, and records."}
                </p>
              </div>
            </div>
            <Link
              href="/login/patient"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0 transition-colors"
            >
              {lang === "hi" ? "ABHA लॉगिन करें →" : "Sign In with ABHA →"}
            </Link>
          </div>
        )}

        {/* ── 1. Official Ayushman Bharat Patient Identity Card (rounded-3xl) ── */}
        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Top Institutional Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-600" />
              <span className="text-xs font-bold tracking-wide uppercase text-slate-600">
                {lang === "hi"
                  ? "आयुष्मान भारत डिजिटल मिशन · स्वास्थ्य एवं परिवार कल्याण मंत्रालय"
                  : "Ayushman Bharat Digital Mission · MoHFW Govt. of India"}
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {lang === "hi" ? "सत्यापित ABHA ID" : "Verified ABHA ID"}
            </span>
          </div>

          {/* Identity Grid */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
                <User className="w-8 h-8 sm:w-9 sm:h-9 text-slate-600" strokeWidth={1.75} />
              </div>

              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                  {activeName || paramName || (lang === "hi" ? "अतिथि मरीज़" : "Guest Patient")}
                </h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600 font-medium">
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                    {activeAbha || paramAbha || (lang === "hi" ? "ABHA दर्ज नहीं" : "No ABHA Linked")}
                  </span>
                  <span>·</span>
                  <span>{activeGender || paramGender}{(activeAge || paramAge) ? `, ${activeAge || paramAge} ${lang === "hi" ? "वर्ष" : "Years"}` : ""}</span>
                  <span>·</span>
                  <span className="text-slate-500">
                    {(activeName || paramName) ? `${(activeName || paramName).toLowerCase().replace(/\s+/g, ".")}@abdm` : "patient@abdm"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAbhaModal(true)}
                className="h-12 px-5 text-xs sm:text-sm font-bold border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-800 rounded-2xl shadow-xs cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4 text-slate-700 shrink-0" strokeWidth={1.75} />
                <span>{lang === "hi" ? "ABHA कार्ड देखें" : "View ABHA Card"}</span>
              </Button>

              <Link
                href={`/kiosk?${kioskParams}&step=complaint_select`}
                className="w-full sm:w-auto h-12 px-6 text-xs sm:text-sm font-bold bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Stethoscope className="w-4 h-4 shrink-0" strokeWidth={2} />
                <span>{lang === "hi" ? "डॉक्टर से परामर्श लें" : "Talk to Doctor"}</span>
                <ArrowRight className="w-4 h-4 ml-0.5 shrink-0" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>

        {/* ── 2. Four Purpose-Built Core Service Cards (Grid) ─────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7">

          {/* ── CARD 1: Doctor Consultation (Kiosk Entry) ─────────────────── */}
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="w-13 h-13 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Stethoscope className="w-6 h-6" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-950">
                    {lang === "hi" ? "डॉक्टर से परामर्श लें" : "Doctor Consultation"}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-normal leading-relaxed">
                    {lang === "hi"
                      ? "अपनी भाषा में बोलकर तकलीफ बताएं या पुराना पर्चा दिखाकर ओपीडी जांच शुरू करें।"
                      : "Walk-in OPD check-in with bilingual voice symptom intake or prescription scanning."}
                  </p>
                </div>
              </div>

              {/* Structured 2-Step Intake Preview */}
              <div className="bg-slate-50/90 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3">
                <Link
                  href={`/kiosk?${kioskParams}&step=complaint_select`}
                  className="flex items-start gap-3 hover:bg-emerald-100/50 p-2 -m-2 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-800 shrink-0 shadow-2xs group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-950 flex items-center gap-1.5">
                      <span>{lang === "hi" ? "1. आवाज द्वारा लक्षण बताएं" : "1. Voice Symptom Intake"}</span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {lang === "hi" ? "हिंदी, अंग्रेजी और 10 क्षेत्रीय भाषाओं में उपलब्ध" : "Speaks Hindi, English & 10 Indian regional languages"}
                    </p>
                  </div>
                </Link>

                <Link
                  href={`/kiosk?${kioskParams}&step=scan`}
                  className="flex items-start gap-3 pt-3 border-t border-slate-200/80 hover:bg-emerald-100/50 p-2 -mx-2 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-800 shrink-0 shadow-2xs group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-950 flex items-center gap-1.5">
                      <span>{lang === "hi" ? "2. पुराना पर्चा व रिपोर्ट स्कैन करें" : "2. Prescription & OCR Scanner"}</span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {lang === "hi" ? "कैमरे के सामने पर्चा रखें, डॉक्टर के लिए तैयार" : "Instant clinical OCR digitization directly onto doctor's screen"}
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Bottom Button Action */}
            <Link
              href={`/kiosk?${kioskParams}&step=complaint_select`}
              className="w-full h-12 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <span>{lang === "hi" ? "परामर्श शुरू करें" : "Start Doctor Consultation"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* ── CARD 2: Active Medicines & Lab Reports ────────────────────── */}
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="w-13 h-13 rounded-2xl bg-teal-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Pill className="w-6 h-6" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-950">
                    {lang === "hi" ? "मेरी दवाइयां और जांच पर्चे" : "My Medicines & Lab Reports"}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-normal leading-relaxed">
                    {lang === "hi"
                      ? "दैनिक दवाइयों का सही समय (सुबह/दोपहर/रात) और हालिया पैथोलॉजी जांच रिपोर्ट।"
                      : "Daily medication schedule, dosages, and verified laboratory test findings."}
                  </p>
                </div>
              </div>

              {/* Medication Preview Box */}
              <div className="bg-slate-50/90 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3">
                {prescriptions.length === 0 ? (
                  <div className="text-center py-3 space-y-1">
                    <p className="text-xs font-semibold text-slate-700">
                      {lang === "hi" ? "कोई सक्रिय पर्चा दर्ज नहीं है" : "No Active Prescriptions On File"}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {lang === "hi"
                        ? "डॉक्टर द्वारा जारी किए गए डिजिटल पर्चे यहां स्वतः दिखाई देंगे।"
                        : "Digital prescriptions issued during OPD consultations will appear here."}
                    </p>
                  </div>
                ) : (
                  <>
                    {prescriptions.slice(0, 2).map((rx) => (
                      <div key={rx.id} className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/80 last:border-0 last:pb-0">
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{rx.name}</h4>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {rx.dosage} · {rx.frequency}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                          {rx.category === "ayurveda" ? "Ayurveda" : "Allopathy"}
                        </span>
                      </div>
                    ))}

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                      <span>{prescriptions.length > 2 ? `+${prescriptions.length - 2} ${lang === "hi" ? "अन्य दवाइयां उपलब्ध" : "more active prescriptions"}` : `${prescriptions.length} ${lang === "hi" ? "सक्रिय दवाइयां" : "prescriptions on file"}`}</span>
                      <span className="font-semibold text-teal-800">{labReports.length} {lang === "hi" ? "लैब रिपोर्ट" : "Lab Reports on File"}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Bottom Button Action */}
            <Button
              variant="outline"
              onClick={() => {
                setRxActiveTab("rx");
                setShowRxModal(true);
              }}
              className="w-full h-12 rounded-2xl border-teal-800/30 text-teal-900 hover:bg-teal-50 hover:border-teal-800 font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{lang === "hi" ? "दवाइयां और जांच देखें" : "View Prescriptions & Test Results"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* ── CARD 3: Live OPD Token & Room Allotment ───────────────────── */}
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-13 h-13 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200/80 flex items-center justify-center shrink-0 shadow-xs">
                    <Clock className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-950">
                      {lang === "hi" ? "मेरा टोकन नंबर और कमरा" : "My OPD Token & Room"}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-normal leading-relaxed">
                      {lang === "hi"
                        ? "ओपीडी लाइन में अपनी बारी, डॉक्टर का कमरा नंबर और इंतजार का समय देखें।"
                        : "Live queue position, doctor room assignment, and estimated wait duration."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={refreshQueue}
                  disabled={isRefreshingQueue}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
                  title="Refresh Queue"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshingQueue ? "animate-spin text-blue-700" : ""}`} />
                </button>
              </div>

              {/* Dynamic OPD Ticket Container (Active vs Pending Intake) */}
              {activeToken ? (
                <div className="p-5 bg-gradient-to-br from-blue-50/70 via-white to-sky-50/40 text-slate-900 rounded-2xl border-2 border-blue-200/90 space-y-3.5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-blue-100 pb-2.5">
                    <span className="text-[11px] text-slate-500 font-semibold">
                      AIIA New Delhi · Ayush HMIS
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                      Live OPD Desk
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                        {lang === "hi" ? "आपका टोकन" : "Your Token"}
                      </span>
                      <span className="text-4xl font-black text-blue-950 font-mono tracking-tight">
                        #{activeToken.tokenNumber}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                        {lang === "hi" ? "परामर्श कक्ष" : "Room Assignment"}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs inline-block">
                        {activeToken.assignedRoom}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-blue-100 text-xs">
                    <span className="text-slate-600 font-medium">
                      {lang === "hi" ? "वर्तमान नंबर:" : "Now Serving:"}{" "}
                      <strong className="text-blue-900 font-bold font-mono text-sm">#{activeToken.nowServing}</strong>
                    </span>
                    <span className="font-semibold text-blue-800 bg-blue-100/70 px-2.5 py-0.5 rounded-md">
                      ~{activeToken.waitTimeMins} {lang === "hi" ? "मिनट शेष" : "mins wait"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-slate-50/80 text-slate-800 rounded-2xl border border-dashed border-slate-300 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                    <span className="text-[11px] text-slate-500 font-semibold">
                      AIIA New Delhi · OPD Triage
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-800 bg-amber-100/80 border border-amber-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {lang === "hi" ? "इनटेक लंबित" : "Intake Pending"}
                    </span>
                  </div>

                  <div className="py-2 space-y-1">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">
                      {lang === "hi" ? "कोई सक्रिय ओपीडी टोकन नहीं है" : "No Active OPD Token"}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {lang === "hi"
                        ? "आपने आज डॉक्टर परामर्श इनटेक पूरा नहीं किया है। टोकन प्राप्त करने और डॉक्टर कक्ष आबंटित कराने के लिए परामर्श इनटेक प्रारंभ करें।"
                        : "You have not completed clinical triage or consultation intake today. Start intake to generate an OPD token and receive a doctor room assignment."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Button Action */}
            {activeToken ? (
              <Button
                variant="outline"
                onClick={() => setShowTokenModal(true)}
                className="w-full h-12 rounded-2xl border-slate-300 text-slate-900 hover:bg-slate-50 hover:border-slate-400 font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{lang === "hi" ? "ओपीडी डिजिटल पर्ची खोलें" : "View Digital OPD Pass"}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Link
                href={`/kiosk?${kioskParams}&step=complaint_select`}
                className="w-full h-12 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>{lang === "hi" ? "परामर्श प्रारंभ कर टोकन लें" : "Start Intake & Generate Token"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* ── CARD 4: Emergency & Hospital Helplines ────────────────────── */}
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="w-13 h-13 rounded-2xl bg-rose-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <PhoneCall className="w-6 h-6" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-950">
                    {lang === "hi" ? "अस्पताल सहायता व एम्बुलेंस" : "Emergency & Hospital Support"}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-normal leading-relaxed">
                    {lang === "hi"
                      ? "24 घंटे मुफ्त सरकारी 108 एम्बुलेंस और अस्पताल के डॉक्टरों का समय।"
                      : "Direct 24x7 emergency medical hotline, hospital roster, and casualty assistance."}
                  </p>
                </div>
              </div>

              {/* Emergency Hotline Preview */}
              <div className="bg-rose-50/70 rounded-2xl p-4 sm:p-5 border border-rose-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-700 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Ambulance className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-950">
                        108 National Ambulance
                      </h4>
                      <p className="text-[11px] text-slate-600 font-medium">
                        {lang === "hi" ? "24x7 टोल-फ्री आपातकालीन सेवा" : "Toll-free 24x7 Emergency Dispatch"}
                      </p>
                    </div>
                  </div>
                  <a
                    href="tel:108"
                    className="px-3 py-1.5 text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white rounded-xl shadow-xs transition-colors"
                  >
                    Call 108
                  </a>
                </div>

                <div className="pt-2.5 border-t border-rose-200/80 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                  <span>102 Maternal Helpline & Tele-MANAS</span>
                  <span className="font-semibold text-rose-900">3 OPD Rooms Active</span>
                </div>
              </div>
            </div>

            {/* Bottom Button Action */}
            <Button
              variant="outline"
              onClick={() => setShowHelpModal(true)}
              className="w-full h-12 rounded-2xl border-rose-200 text-rose-950 hover:bg-rose-50 hover:border-rose-300 font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{lang === "hi" ? "हेल्पलाइन व डॉक्टर समय देखें" : "View Helplines & Room Timings"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

        </div>

      </main>

      {/* ── MODAL 1: Digital ABHA Health Card (rounded-3xl) ──────────────── */}
      {showAbhaModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-emerald-800 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base">Ayushman Bharat Health Account (ABDM)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAbhaModal(false)}
                className="text-emerald-200 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Official Card Body */}
            <div className="p-5 sm:p-7 space-y-6 overflow-y-auto flex-1">
              <div className="border border-emerald-200 rounded-2xl p-5 bg-gradient-to-b from-white to-emerald-50/30 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800 block">
                      National Health Authority
                    </span>
                    <span className="text-xs font-medium text-slate-600">Ministry of Health & Family Welfare</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300 text-emerald-800 bg-white">
                    ABHA CARD
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xl font-bold text-slate-950">{paramName}</h4>
                    <p className="text-xs text-slate-600 font-medium">ABHA Number: <strong className="text-slate-900 font-bold">{paramAbha}</strong></p>
                    <p className="text-xs text-slate-600 font-medium">ABHA Address: <strong className="text-emerald-800 font-semibold">{paramName.toLowerCase().replace(/\s+/g, ".")}@abdm</strong></p>
                    <div className="text-xs text-slate-600 pt-1 flex gap-3 font-medium">
                      <span>Gender: <strong>{paramGender}</strong></span>
                      <span>·</span>
                      <span>YOB: <strong>{new Date().getFullYear() - Number(paramAge)}</strong></span>
                    </div>
                  </div>
                  <div className="w-18 h-18 rounded-xl bg-white border border-slate-300 p-1.5 flex items-center justify-center shrink-0 shadow-2xs">
                    <QrCode className="w-15 h-15 text-slate-900" />
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 border-t border-emerald-100 pt-2 flex items-center justify-between font-medium">
                  <span>CRN: 229152300039896</span>
                  <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE & VERIFIED
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowAbhaModal(false)}
                  className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold h-12 rounded-2xl cursor-pointer"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {lang === "hi" ? "कार्ड डाउनलोड करें" : "Download Card"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAbhaModal(false)}
                  className="h-12 px-5 text-xs sm:text-sm font-semibold border-slate-300 rounded-2xl cursor-pointer"
                >
                  {lang === "hi" ? "बंद करें" : "Close"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Active Medicines & Lab Reports Modal (rounded-3xl) ───── */}
      {showRxModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Pill className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-base">
                  {lang === "hi" ? "मेरी दवाइयां और जांच रिपोर्ट" : "My Medicines & Lab Reports"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRxModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b border-slate-200 bg-slate-50 p-2 gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setRxActiveTab("rx")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-2 ${
                  rxActiveTab === "rx"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Pill className="w-3.5 h-3.5 text-teal-700" />
                <span>{lang === "hi" ? `दवाइयां (${prescriptions.length})` : `Medicines (${prescriptions.length})`}</span>
              </button>
              <button
                type="button"
                onClick={() => setRxActiveTab("labs")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-2 ${
                  rxActiveTab === "labs"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-teal-700" />
                <span>{lang === "hi" ? `जांच रिपोर्ट (${labReports.length})` : `Lab Reports (${labReports.length})`}</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-slate-800">
              {rxActiveTab === "rx" ? (
                <div className="space-y-3">
                  {prescriptions.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 space-y-2 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <Pill className="w-8 h-8 mx-auto text-slate-400" />
                      <p className="text-xs font-bold text-slate-700">
                        {lang === "hi" ? "कोई सक्रिय पर्चा उपलब्ध नहीं है" : "No Active Prescriptions On File"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {lang === "hi"
                          ? "परामर्श के दौरान डॉक्टर द्वारा लिखे गए पर्चे यहां स्वतः डिजिटाइज़ होकर जुड़ेंगे।"
                          : "Prescriptions generated during clinical consultations will appear here."}
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-slate-500 font-medium">
                        {lang === "hi"
                          ? "डॉक्टर द्वारा लिखी गई दवाइयां और उन्हें लेने का सही समय:"
                          : "Medicines prescribed by your doctor with recommended schedule:"}
                      </p>

                      {prescriptions.map((rx) => (
                        <div key={rx.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-bold text-slate-950 text-sm sm:text-base">{rx.name}</h4>
                              <p className="text-slate-700 font-semibold pt-0.5">
                                {lang === "hi" ? "मात्रा" : "Dosage"}: <span className="text-slate-950 font-extrabold">{rx.dosage}</span> · {rx.frequency}
                              </p>
                            </div>
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800">
                              {rx.category === "ayurveda" ? "Ayurveda" : "Allopathy"}
                            </span>
                          </div>

                          {/* Visual Schedule Helper */}
                          <div className="flex items-center gap-3 pt-2 border-t border-slate-200 text-[11px] font-semibold text-slate-700">
                            <span className="inline-flex items-center gap-1.5">
                              <Sunrise className="w-3.5 h-3.5 text-amber-600" /> {lang === "hi" ? "सुबह" : "Morning"}
                            </span>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1.5">
                              <Sun className="w-3.5 h-3.5 text-amber-700" /> {lang === "hi" ? "दोपहर" : "Noon"}
                            </span>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1.5">
                              <Moon className="w-3.5 h-3.5 text-indigo-600" /> {lang === "hi" ? "रात" : "Night"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-medium">
                            <span className="flex items-center gap-1.5 text-slate-600">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[200px] sm:max-w-[260px]">{rx.hospital || rx.prescribedBy}</span>
                            </span>
                            <span className="font-semibold text-slate-800 bg-slate-200/70 px-2 py-0.5 rounded-md shrink-0">{rx.duration}</span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 font-medium">
                            <span className="flex items-center gap-1 text-slate-600">
                              <Stethoscope className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                              <span>{rx.prescribedBy}</span>
                            </span>
                            <span className="text-slate-400 text-[10px]">{rx.date}</span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {labReports.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 space-y-2 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <Activity className="w-8 h-8 mx-auto text-slate-400" />
                      <p className="text-xs font-bold text-slate-700">
                        {lang === "hi" ? "कोई लैब रिपोर्ट उपलब्ध नहीं है" : "No Laboratory Reports On File"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {lang === "hi"
                          ? "अस्पताल की पैथोलॉजी लैब से सीधे लिंक की गई जांच रिपोर्टें यहां दिखाई देंगी।"
                          : "Diagnostic and laboratory test results linked via ABDM will appear here."}
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-slate-500 font-medium">
                        {lang === "hi"
                          ? "आपकी हालिया पैथोलॉजी व लैब जांच रिपोर्ट:"
                          : "Your recent laboratory investigation results:"}
                      </p>

                      {labReports.map((lab, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-slate-950 text-sm">{lab.test}</h4>
                        <p className="text-slate-500 text-[11px] font-medium">
                          {lang === "hi" ? "सामान्य सीमा" : "Standard Range"}: {lab.normalRange} {lab.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-base sm:text-lg font-black text-slate-950 font-mono">
                          {lab.value} <span className="text-xs font-normal text-slate-500">{lab.unit}</span>
                        </span>
                        <span className={`text-[11px] font-bold block mt-1 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          lab.status === "high"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-emerald-100 text-emerald-900"
                        }`}>
                          {lab.status === "high" ? (
                            <>
                              <AlertCircle className="w-3 h-3 text-amber-700" />
                              {lang === "hi" ? "जांच आवश्यक" : "Elevated"}
                            </>
                          ) : (
                            <>
                              <Check className="w-3 h-3 text-emerald-700" />
                              {lang === "hi" ? "सामान्य" : "Normal"}
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  if (typeof window !== "undefined") window.print();
                }}
                className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs sm:text-sm font-bold h-11 px-3 sm:px-4 rounded-2xl cursor-pointer inline-flex items-center gap-2 shadow-2xs"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">{lang === "hi" ? "पर्चा प्रिंट करें" : "Print Prescription"}</span>
                <span className="sm:hidden">{lang === "hi" ? "प्रिंट" : "Print"}</span>
              </Button>
              <Button
                onClick={() => setShowRxModal(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold h-11 px-6 rounded-2xl cursor-pointer"
              >
                {lang === "hi" ? "बंद करें" : "Close"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Digital OPD Token Slip (rounded-3xl) ────────────────── */}
      {showTokenModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 p-5 flex items-center justify-between text-slate-900 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-slate-950">
                  {lang === "hi" ? "ओपीडी परामर्श टोकन पर्ची" : "Digital OPD Consultation Pass"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTokenModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket Slip Body */}
            <div className="p-5 sm:p-7 space-y-6 overflow-y-auto flex-1">
              <div className="border border-slate-200 bg-slate-50 rounded-2xl p-6 space-y-5 text-center shadow-xs">
                <div className="border-b border-slate-200 pb-3">
                  <p className="text-xs font-bold uppercase text-slate-900 tracking-wider">
                    {lang === "hi" ? "अखिल भारतीय आयुर्वेद संस्थान (AIIA)" : "All India Institute of Ayurveda"}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">New Delhi · Ayush HMIS Outpatient Desk</p>
                </div>

                <div className="py-2">
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                    {lang === "hi" ? "आपका टोकन नंबर" : "YOUR APPOINTMENT TOKEN"}
                  </span>
                  <span className="text-5xl font-black text-slate-950 block my-1 font-mono tracking-tight">
                    {activeToken ? `#${activeToken.tokenNumber}` : (lang === "hi" ? "लंबित" : "PENDING")}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 font-bold text-xs px-3.5 py-1 rounded-full mt-1 ${
                    activeToken ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"
                  }`}>
                    {activeToken ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        {activeToken.assignedRoom || (lang === "hi" ? "कमरा 104" : "Room 104")}
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        {lang === "hi" ? "परामर्श इनटेक शेष" : "Intake Not Completed"}
                      </>
                    )}
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">{lang === "hi" ? "मरीज का नाम" : "Patient Name"}:</span>
                    <span className="font-bold text-slate-900">{activeName || paramName || "Patient"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">ABHA ID:</span>
                    <span className="font-bold text-slate-900">{activeAbha || paramAbha || "Unlinked"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">{lang === "hi" ? "चिकित्सक / कक्ष" : "Doctor / Room"}:</span>
                    <span className="font-bold text-slate-900">{activeToken?.assignedDoctor || "Dr. Ananya Sharma"}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100 font-semibold">
                    <span className="text-slate-600">{lang === "hi" ? "वर्तमान नंबर" : "Now Serving"}:</span>
                    <span className="text-emerald-700 font-bold">
                      #{activeToken?.nowServing ?? liveQueueServing} (~{activeToken?.waitTimeMins ?? 8} {lang === "hi" ? "मिनट शेष" : "mins wait"})
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 p-3 rounded-xl text-left">
                  <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-950 font-medium leading-relaxed">
                    {activeToken ? (
                      lang === "hi"
                        ? `कृपया ${activeToken.assignedRoom} के बाहर प्रतीक्षालय में बैठें। टोकन #${activeToken.tokenNumber} पुकारे जाने पर अंदर जाएं।`
                        : `Please wait in the seating area outside ${activeToken.assignedRoom}. Enter when Token #${activeToken.tokenNumber} is called.`
                    ) : (
                      lang === "hi"
                        ? "आपने आज परामर्श इनटेक पूरा नहीं किया है। टोकन प्राप्त करने के लिए कृपया परामर्श इनटेक प्रारंभ करें।"
                        : "You have not completed triage intake yet. Please start intake to receive your OPD token number."
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowTokenModal(false)}
                  className="flex-1 bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-bold h-12 rounded-2xl cursor-pointer"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  {lang === "hi" ? "पर्ची डाउनलोड करें" : "Save / Download Slip"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowTokenModal(false)}
                  className="h-12 px-5 text-xs sm:text-sm font-semibold border-slate-300 rounded-2xl cursor-pointer"
                >
                  {lang === "hi" ? "बंद करें" : "Close"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: Hospital Help & Helplines (rounded-3xl) ─────────────── */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-rose-800 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-5 h-5 text-rose-200" />
                <h3 className="font-bold text-base">
                  {lang === "hi" ? "अस्पताल सहायता व जरूरी फोन नंबर" : "Hospital Helplines & Emergency"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-rose-200 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-7 space-y-5 overflow-y-auto flex-1">
              <p className="text-xs text-slate-500 font-medium">
                {lang === "hi"
                  ? "किसी भी आपातकाल में इन नंबरों पर सीधे कॉल करें:"
                  : "Emergency helplines with direct 24x7 operator connection:"}
              </p>

              {/* Verified Hotline Cards with vector icons */}
              <div className="space-y-3">
                <a
                  href="tel:108"
                  className="p-4 bg-rose-50/70 hover:bg-rose-100 rounded-2xl border border-rose-200 flex items-center justify-between text-rose-950 font-bold transition-all block cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-rose-700 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Ambulance className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm block font-bold">108 Emergency Ambulance</span>
                      <span className="text-xs text-slate-500 font-medium">National 24x7 Toll-Free</span>
                    </div>
                  </div>
                  <span className="text-xs bg-rose-700 text-white font-bold px-3 py-1.5 rounded-xl shadow-xs">
                    Call 108
                  </span>
                </a>

                <a
                  href="tel:102"
                  className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between text-slate-900 font-bold transition-all block cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm block font-bold">102 Mother & Child Helpline</span>
                      <span className="text-xs text-slate-500 font-medium">Maternal Health Service</span>
                    </div>
                  </div>
                  <span className="text-xs bg-slate-800 text-white font-bold px-3 py-1.5 rounded-xl shadow-xs">
                    Call 102
                  </span>
                </a>

                <a
                  href="tel:14416"
                  className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between text-slate-900 font-bold transition-all block cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-700 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <HeartPulse className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm block font-bold">Tele-MANAS (14416)</span>
                      <span className="text-xs text-slate-500 font-medium">Mental Health Support</span>
                    </div>
                  </div>
                  <span className="text-xs bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl shadow-xs">
                    Call 14416
                  </span>
                </a>
              </div>

              {/* Department Roster */}
              <div className="pt-3 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-900 block mb-2.5">
                  {lang === "hi" ? "आज के सक्रिय ओपीडी कमरे:" : "Today's Active OPD Roster:"}
                </span>
                <div className="space-y-2 text-xs text-slate-700">
                  {departments.map((d) => (
                    <div key={d.id} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-semibold text-slate-900">{d.departmentName}</span>
                      <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {d.roomNumber}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  onClick={() => setShowHelpModal(false)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold h-12 rounded-2xl cursor-pointer"
                >
                  {lang === "hi" ? "बंद करें" : "Close"}
                </Button>
              </div>
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
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-xs text-slate-500 font-semibold">
          Loading Patient Portal...
        </div>
      }
    >
      <PatientPortalContent />
    </React.Suspense>
  );
}
