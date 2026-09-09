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
  Calendar, CheckCircle, ChevronDown, ChevronUp, Sparkles, Link2, ExternalLink, Eye
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
import { PatientVisitRecord } from "@/app/api/patient/records/route";

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
  const paramMobile = searchParams.get("mobile") || "";
  const paramGuest = searchParams.get("guest") === "true";

  const [activeAbha, setActiveAbha] = React.useState(paramAbha);
  const [activeName, setActiveName] = React.useState(paramName);
  const [activeGender, setActiveGender] = React.useState(paramGender);
  const [activeAge, setActiveAge] = React.useState(paramAge);
  const [activeMobile, setActiveMobile] = React.useState(paramMobile);
  const [isGuest, setIsGuest] = React.useState(paramGuest);
  const [isAbhaLinked, setIsAbhaLinked] = React.useState(false);

  // 3-Category Patient Data & History
  const [pastRecords, setPastRecords] = React.useState<PatientVisitRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = React.useState(true);
  const [selectedRecordId, setSelectedRecordId] = React.useState<string | null>(null);
  const [viewingRxRecord, setViewingRxRecord] = React.useState<PatientVisitRecord | null>(null);

  // Retrospective ABHA Linking Modal state
  const [showLinkAbhaModal, setShowLinkAbhaModal] = React.useState(false);
  const [linkAbhaInput, setLinkAbhaInput] = React.useState("");
  const [linkOtpInput, setLinkOtpInput] = React.useState("123456");
  const [isLinking, setIsLinking] = React.useState(false);
  const [linkError, setLinkError] = React.useState<string | null>(null);
  const [linkSuccessBanner, setLinkSuccessBanner] = React.useState<string | null>(null);

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

  // Load past records for Old Patient & Guest Patient
  React.useEffect(() => {
    async function loadPastRecords() {
      const effectiveAbha = activeAbha || paramAbha;
      const effectivePhone = activeMobile || paramMobile;
      setIsLoadingRecords(true);
      try {
        const query = new URLSearchParams();
        if (effectiveAbha) query.set("abhaId", effectiveAbha);
        if (effectivePhone) query.set("phone", effectivePhone);
        const res = await fetch(`/api/patient/records?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.records && Array.isArray(data.records)) {
            setPastRecords(data.records);
            if (data.records.length > 0) {
              setSelectedRecordId(data.records[0].id);
              // Consolidate past prescriptions
              const allRx: PrescriptionItem[] = [];
              data.records.forEach((r: PatientVisitRecord) => {
                if (r.prescriptions) {
                  r.prescriptions.forEach((p) => {
                    allRx.push({
                      id: p.id,
                      name: p.name,
                      dosage: p.dosage,
                      frequency: p.frequency,
                      duration: p.duration,
                      prescribedBy: r.doctorName,
                      hospital: r.department,
                      date: r.visitDate,
                      category: p.category,
                    });
                  });
                }
              });
              if (allRx.length > 0) {
                setPrescriptions(allRx);
              }
            }
          }
        }
      } catch (err) {
        console.warn("Error fetching patient records:", err);
      } finally {
        setIsLoadingRecords(false);
      }
    }
    loadPastRecords();
  }, [activeAbha, paramAbha, activeMobile, paramMobile]);

  const handleLinkAbha = async () => {
    if (!linkAbhaInput || linkAbhaInput.trim().length < 10) {
      setLinkError(lang === "hi" ? "कृपया मान्य 14-अंकों की ABHA आईडी दर्ज करें" : "Please enter a valid 14-digit ABHA ID");
      return;
    }
    setIsLinking(true);
    setLinkError(null);
    try {
      const res = await fetch("/api/patient/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "link_abha",
          phone: activeMobile || paramMobile || "9876543210",
          abhaId: linkAbhaInput.trim(),
          fullName: activeName || paramName || "Patient",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to link ABHA ID");
      }
      setActiveAbha(linkAbhaInput.trim());
      setIsAbhaLinked(true);
      setIsGuest(false);
      setShowLinkAbhaModal(false);
      setLinkSuccessBanner(
        lang === "hi"
          ? `ABHA आईडी (${linkAbhaInput.trim()}) सफलतापूर्वक लिंक हो गई! आपके मोबाइल से जुड़े सभी पुराने रिकॉर्ड अब आयुष्मान भारत डिजिटल मिशन में सुरक्षित हैं।`
          : `ABHA ID (${linkAbhaInput.trim()}) linked successfully! All hospital records and prescriptions are now securely bound to your verified ABDM account.`
      );
      if (data.records && data.records.length > 0) {
        setPastRecords(data.records);
        setSelectedRecordId(data.records[0].id);
      }
    } catch (err: any) {
      setLinkError(err.message || "Failed to link ABHA ID. Please try again.");
    } finally {
      setIsLinking(false);
    }
  };

  const isOldPatient = pastRecords.length > 0;
  const isGuestPatient = Boolean(
    (isGuest || paramGuest || (!activeAbha && activeMobile) || activeAbha.startsWith("CRN-") || activeAbha.startsWith("GUEST-")) &&
    !isAbhaLinked
  );
  const isNewPatient = !isOldPatient && !isGuestPatient;

  // Build kiosk launch query with authenticated session so kiosk skips redundant login
  const kioskParams = new URLSearchParams({
    abha: activeAbha || paramAbha,
    name: activeName || paramName,
    gender: activeGender || paramGender,
    age: activeAge || paramAge,
    lang: lang,
    authenticated: "true",
    from: "portal",
    ...(activeMobile ? { mobile: activeMobile } : {}),
    ...(isGuestPatient ? { guest: "true" } : {})
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
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
              isGuestPatient
                ? "bg-amber-50 text-amber-900 border-amber-200"
                : isOldPatient
                ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                : "bg-blue-50 text-blue-900 border-blue-200"
            }`}>
              {isGuestPatient ? (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  {lang === "hi" ? "अतिथि ओपीडी मरीज़ · मोबाइल पंजीकृत" : "Guest OPD Patient · Mobile Registered"}
                </>
              ) : isOldPatient ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  {lang === "hi" ? "पुराना मरीज़ · पूर्व रिकॉर्ड उपलब्ध" : "Old Patient · Prior Records Verified"}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  {lang === "hi" ? "नया मरीज़ · सत्यापित ABHA ID" : "New Patient · Verified ABHA"}
                </>
              )}
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
                  {activeMobile && (
                    <>
                      <span>·</span>
                      <span className="text-slate-700 font-semibold font-mono">📱 {activeMobile}</span>
                    </>
                  )}
                  <span>·</span>
                  <span className="text-slate-500">
                    {(activeName || paramName) ? `${(activeName || paramName).toLowerCase().replace(/\s+/g, ".")}@abdm` : "patient@abdm"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
              {isGuestPatient ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLinkAbhaModal(true)}
                  className="h-12 px-5 text-xs sm:text-sm font-bold border-amber-300 hover:border-amber-400 bg-amber-50/80 hover:bg-amber-100 text-amber-950 rounded-2xl shadow-xs cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <Link2 className="w-4 h-4 text-amber-700 shrink-0" strokeWidth={2} />
                  <span>{lang === "hi" ? "ABHA आईडी लिंक करें" : "Link ABHA ID"}</span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAbhaModal(true)}
                  className="h-12 px-5 text-xs sm:text-sm font-bold border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-800 rounded-2xl shadow-xs cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4 text-slate-700 shrink-0" strokeWidth={1.75} />
                  <span>{lang === "hi" ? "ABHA कार्ड देखें" : "View ABHA Card"}</span>
                </Button>
              )}

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

        {/* Success Banner after Linking ABHA */}
        {linkSuccessBanner && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center justify-between gap-3 animate-in fade-in duration-200 shadow-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <p className="text-xs sm:text-sm font-semibold">{linkSuccessBanner}</p>
            </div>
            <button
              onClick={() => setLinkSuccessBanner(null)}
              className="text-emerald-700 hover:text-emerald-950 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── DYNAMIC 3-CATEGORY WORKFLOW SECTION ───────────────────────── */}

        {/* ── CATEGORY 3: GUEST PATIENT (Mobile Walk-in without ABHA) ─────── */}
        {isGuestPatient && (
          <div className="rounded-3xl bg-gradient-to-r from-amber-50/80 via-white to-orange-50/60 border-2 border-amber-200/90 shadow-sm p-6 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wide">
                    {lang === "hi" ? "अतिथि / अस्थायी ओपीडी खाता" : "Guest / Temporary OPD Account"}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Mobile: <strong className="text-slate-900 font-mono font-bold">{activeMobile || "Verified Walk-in"}</strong>
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-950">
                  {lang === "hi" ? "अस्पताल में स्थानीय रिकॉर्ड सुरक्षित हैं" : "Hospital Encounter Saved by Mobile Number"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                  {lang === "hi"
                    ? "आपकी जांच और पर्चे स्थानीय अस्पताल CRN में सुरक्षित हैं। जब भी आप अपनी 14-अंकों की ABHA आईडी बनाएंगे या लिंक करेंगे, आपके सभी रिकॉर्ड स्वतः राष्ट्रीय आयुष्मान भारत में स्थानांतरित हो जाएंगे।"
                    : "Your medical consultations and prescriptions are safely preserved in the hospital database under this mobile number. When you create or link an ABHA ID, all records will be automatically bound to your national Ayushman Bharat health account."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                <Button
                  onClick={() => setShowLinkAbhaModal(true)}
                  className="h-11 px-5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Link2 className="w-4 h-4" />
                  <span>{lang === "hi" ? "ABHA आईडी लिंक करें" : "Link ABHA ID Now"}</span>
                </Button>
                <Link
                  href={`/kiosk?${kioskParams}&step=complaint_select`}
                  className="h-11 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>{lang === "hi" ? "अतिथि परामर्श जारी रखें" : "Proceed as Guest"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── CATEGORY 1: OLD PATIENT (Has Medical History in DB) ─────────── */}
        {isOldPatient && (
          <div className="space-y-4">
            {/* Top Prompt: "Do you have a new problem?" Card */}
            <div className="rounded-3xl bg-gradient-to-r from-emerald-50/70 via-white to-teal-50/50 border border-emerald-200 p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xs">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  {lang === "hi" ? "फॉलो-अप या नई समस्या?" : "Follow-up or Fresh Problem?"}
                </span>
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-slate-950">
                  {lang === "hi" ? "क्या आज आपको कोई नई तकलीफ या बीमारी है?" : "Do you have a new health problem today?"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                  {lang === "hi"
                    ? "यदि आप किसी नई समस्या के लिए डॉक्टर से मिलना चाहते हैं, तो 'नई बीमारी के लिए परामर्श' चुनें। यदि पुरानी बीमारी का फॉलो-अप है, तो नीचे दिए गए रिकॉर्ड से जारी रखें।"
                    : "If you want consultation for a fresh illness, start a new intake. To consult regarding your previous ongoing treatment, select the visit below."}
                </p>
              </div>

              <div className="shrink-0">
                <Link
                  href={`/kiosk?${kioskParams}&step=complaint_select&visit_type=fresh`}
                  className="h-12 px-6 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <span>{lang === "hi" ? "नई बीमारी के लिए परामर्श लें →" : "Consult for a New Problem →"}</span>
                </Link>
              </div>
            </div>

            {/* Previous Consultations & Medical History Section */}
            <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-950 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-800" />
                    <span>{lang === "hi" ? "पिछले परामर्श और मेडिकल रिकॉर्ड" : "Previous Consultations & Medical Records"}</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {lang === "hi"
                      ? "दवाइयां देखने या उसी बीमारी के फॉलो-अप के लिए संबंधित रिकॉर्ड पर क्लिक करें:"
                      : "Click any record to inspect prescriptions, doctor advice, or continue treatment for that condition:"}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs font-bold text-slate-700 w-fit">
                  {pastRecords.length} {lang === "hi" ? "विज़िट रिकॉर्ड दर्ज" : "Visits Recorded"}
                </Badge>
              </div>

              {/* Accordion list of prior visits */}
              <div className="space-y-3.5">
                {pastRecords.map((record) => {
                  const isExpanded = selectedRecordId === record.id;
                  return (
                    <div
                      key={record.id}
                      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                        isExpanded
                          ? "border-emerald-600 bg-emerald-50/20 shadow-xs ring-1 ring-emerald-600/30"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-slate-50"
                      }`}
                    >
                      {/* Accordion Header */}
                      <button
                        type="button"
                        onClick={() => setSelectedRecordId(isExpanded ? null : record.id)}
                        className="w-full p-4 sm:p-5 text-left flex items-start sm:items-center justify-between gap-4 cursor-pointer"
                      >
                        <div className="space-y-2 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                              📅 {record.visitDate}
                            </span>
                            {record.diseaseDuration && (
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-teal-100/80 text-teal-950 border border-teal-300">
                                ⏱️ {lang === "hi" ? "अवधि:" : "Duration:"} {record.diseaseDuration}
                              </span>
                            )}
                            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                              🩺 {record.doctorName} ({record.roomNumber})
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">
                              {record.prescriptions?.length || 0} {lang === "hi" ? "दवाइयां" : "Prescriptions"}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-base sm:text-lg font-black text-slate-950">
                              {record.chiefComplaint}
                            </h4>
                            <p className="text-xs text-slate-600 mt-0.5">
                              <strong className="text-slate-800">{lang === "hi" ? "निदान (Disease / Diagnosis):" : "Clinical Diagnosis:"}</strong> {record.diagnosis}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold text-emerald-800 hidden sm:inline">
                            {isExpanded ? (lang === "hi" ? "विवरण छुपाएं" : "Collapse") : (lang === "hi" ? "पर्चा व दवाइयां देखें" : "View Rx & Details")}
                          </span>
                          <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </button>

                      {/* Accordion Expanded Body */}
                      {isExpanded && (
                        <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-emerald-200/80 bg-white space-y-4 animate-in fade-in duration-150">
                          {/* Doctor Consulted & OPD Details */}
                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div>
                              <span className="text-slate-500 block">{lang === "hi" ? "परामर्शदाता चिकित्सक:" : "Consulting Doctor & OPD Room:"}</span>
                              <strong className="text-slate-950 text-sm font-bold">{record.doctorName}</strong>
                              <span className="text-slate-600 block">{record.department} · {record.roomNumber}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-500 block">{lang === "hi" ? "परामर्श तिथि:" : "Encounter Date:"}</span>
                              <strong className="text-slate-900 font-mono">{record.visitDate}</strong>
                            </div>
                          </div>

                          {/* Current / Last Medication Used (with When Used & Timing) */}
                          {(record.lastMedicationUsed || (record.prescriptions && record.prescriptions.length > 0)) && (
                            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-emerald-800" />
                                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                                  {lang === "hi" ? "वर्तमान / अंतिम ली गई दवाई (Current / Last Medication Used):" : "Current or Last Medication Used & Timing:"}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div>
                                  <span className="text-slate-500 block">{lang === "hi" ? "दवाई का नाम व मात्रा:" : "Medicine & Dosage:"}</span>
                                  <strong className="text-slate-950 text-sm">
                                    {record.lastMedicationUsed?.name || record.prescriptions[0]?.name}
                                  </strong>
                                  <p className="text-slate-600 font-medium">
                                    {record.lastMedicationUsed?.dosage || record.prescriptions[0]?.dosage}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-slate-500 block">{lang === "hi" ? "कब ली गई / समय (When Used):" : "When Used / Last Taken:"}</span>
                                  <span className="text-emerald-900 font-bold bg-white px-2.5 py-1 rounded-md border border-emerald-200 inline-block shadow-2xs mt-0.5">
                                    {record.lastMedicationUsed?.whenUsed || record.prescriptions[0]?.whenUsed || "Daily after meals"}
                                  </span>
                                  {record.lastMedicationUsed?.instructions && (
                                    <p className="text-[11px] text-slate-500 italic mt-1">
                                      💡 {record.lastMedicationUsed.instructions}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Prescription Document Image Preview */}
                          {record.prescriptionImageUrl && (
                            <div className="space-y-2 pt-1">
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                                {lang === "hi" ? "मेडिकल पर्चा चित्र (Medical Prescription Document):" : "Medical Prescription Slip / Image:"}
                              </span>
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-slate-50/90 border border-slate-200">
                                <div
                                  onClick={() => setViewingRxRecord(record)}
                                  className="w-36 h-48 sm:w-44 sm:h-56 rounded-xl overflow-hidden border-2 border-emerald-500/50 shadow-md cursor-pointer group relative shrink-0 bg-white"
                                  title="Click to zoom prescription"
                                >
                                  <img
                                    src={record.prescriptionImageUrl}
                                    alt="Prescription Document Preview"
                                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                                  />
                                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold gap-1">
                                    <Eye className="w-5 h-5" />
                                    <span>{lang === "hi" ? "ज़ूम करें" : "Click to Zoom"}</span>
                                  </div>
                                </div>

                                <div className="space-y-2 flex-1">
                                  <h5 className="text-sm font-bold text-slate-950">
                                    {lang === "hi" ? "डिजिटल ओपीडी पर्ची (ABDM सत्यापित)" : "Digital OPD Prescription Slip (ABDM Verified)"}
                                  </h5>
                                  <p className="text-xs text-slate-600 leading-relaxed">
                                    {lang === "hi"
                                      ? `यह पर्चा ${record.doctorName} द्वारा ${record.visitDate} को जारी किया गया था। इसमें पूर्ण निदान, दवाइयां, खान-पान निर्देश और डिजिटल डॉक्टर मुहर शामिल है।`
                                      : `Official hospital prescription issued by ${record.doctorName} on ${record.visitDate}. Includes clinical diagnosis, drug regimen, dietary guidance, and authenticated stamp.`}
                                  </p>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setViewingRxRecord(record)}
                                    className="text-xs font-bold border-emerald-300 text-emerald-950 hover:bg-emerald-50 rounded-xl cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5 mr-1.5 text-emerald-700" />
                                    {lang === "hi" ? "पूरा पर्चा खोलें / प्रिंट करें" : "Open Full Prescription & Print"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Full Prescriptions List */}
                          <div className="space-y-2.5 pt-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                              {lang === "hi" ? "सभी दवाइयां (All Prescribed Medicines):" : "All Prescribed Medicines:"}
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {record.prescriptions.map((rx) => (
                                <div
                                  key={rx.id}
                                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-1.5"
                                >
                                  <div className="flex items-start justify-between">
                                    <h5 className="font-bold text-slate-950 text-sm">{rx.name}</h5>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                                      {rx.category === "ayurveda" ? "Ayurveda" : "Allopathy"}
                                    </span>
                                  </div>
                                  <p className="text-slate-700 font-semibold">
                                    {rx.dosage} · <span className="text-slate-900 font-bold">{rx.frequency}</span> ({rx.duration})
                                  </p>
                                  {rx.instructions && (
                                    <p className="text-[11px] text-slate-500 italic">
                                      💡 {rx.instructions}
                                    </p>
                                  )}
                                  {rx.whenUsed && (
                                    <p className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded w-fit">
                                      🕒 {rx.whenUsed}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Doctor Advice if available */}
                          {record.doctorAdvice && (
                            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-0.5">
                              <span className="font-bold text-amber-900 block">
                                {lang === "hi" ? "चिकित्सक सलाह व खान-पान:" : "Doctor's Advice & Lifestyle Guidance:"}
                              </span>
                              <p className="text-slate-700">{record.doctorAdvice}</p>
                            </div>
                          )}

                          {/* Action Buttons for this Record */}
                          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewingRxRecord(record)}
                              className="h-10 text-xs font-bold border-slate-300 text-slate-800 hover:bg-slate-50 rounded-xl cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5 mr-1.5" />
                              {lang === "hi" ? "पर्चा प्रिंट करें" : "Print Prescription Slip"}
                            </Button>

                            <Link
                              href={`/kiosk?${kioskParams}&step=complaint_select&visit_type=followup&complaint=${encodeURIComponent(record.chiefComplaint)}`}
                              className="h-10 px-5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <Stethoscope className="w-3.5 h-3.5" />
                              <span>{lang === "hi" ? "इसी समस्या के लिए फॉलो-अप परामर्श लें" : "Continue with this condition (Follow-up)"}</span>
                              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── CATEGORY 2: NEW PATIENT (Verified ABHA with 0 Past Records) ── */}
        {isNewPatient && (
          <div className="rounded-3xl bg-gradient-to-r from-blue-50/70 via-white to-indigo-50/50 border border-blue-200 p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-md border border-blue-200">
                  <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                  {lang === "hi" ? "नया मरीज़ इनटेक (First OPD Visit)" : "New Patient Intake (First OPD Visit)"}
                </span>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
                  {lang === "hi" ? `स्वागत है, ${activeName || "मरीज़"}!` : `Welcome to MediKiosk, ${activeName || "Patient"}!`}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                  {lang === "hi"
                    ? "आपकी ABHA आईडी सत्यापित है। इस अस्पताल में आपका कोई पुराना मेडिकल रिकॉर्ड दर्ज नहीं है। आज अपना पहला ओपीडी परामर्श शुरू करें—अपनी भाषा में बोलकर लक्षण बताएं या अन्य अस्पताल का पर्चा स्कैन करें।"
                    : "Your ABHA ID is verified. You have no previous medical records at this hospital. Start your first OPD consultation today using our bilingual voice triage or by scanning external prescriptions."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                <Link
                  href={`/kiosk?${kioskParams}&step=complaint_select`}
                  className="h-12 px-6 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>{lang === "hi" ? "परामर्श प्रारंभ करें" : "Start Doctor Consultation"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href={`/kiosk?${kioskParams}&step=scan`}
                  className="h-12 px-4 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>{lang === "hi" ? "पर्चा स्कैन करें" : "Scan Rx"}</span>
                </Link>
              </div>
            </div>
          </div>
        )}

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

      {/* ── MODAL 5: Retrospective Link ABHA ID Modal ────────────────────── */}
      {showLinkAbhaModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-amber-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Link2 className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">
                  {lang === "hi" ? "ABHA आईडी लिंक करें" : "Link Ayushman Bharat (ABHA) ID"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowLinkAbhaModal(false);
                  setLinkError(null);
                }}
                className="text-amber-200 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-7 space-y-5">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1">
                <p className="font-bold">
                  {lang === "hi" ? "स्थानीय अस्पताल रिकॉर्ड का एकीकरण" : "Retrospective Hospital Record Binding"}
                </p>
                <p className="text-slate-600 leading-relaxed">
                  {lang === "hi"
                    ? `मोबाइल नंबर (${activeMobile || paramMobile || "पंजीकृत"}) के तहत संग्रहीत आपके सभी परामर्श रिकॉर्ड आपकी नई ABHA आईडी से स्थायी रूप से जुड़ जाएंगे।`
                    : `All consultations, prescriptions, and lab reports stored under mobile number (${activeMobile || paramMobile || "registered"}) will be permanently bound to your ABDM health account.`}
                </p>
              </div>

              {linkError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{linkError}</span>
                </div>
              )}

              {/* Form Inputs */}
              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block">
                    {lang === "hi" ? "14-अंकों की ABHA आईडी दर्ज करें:" : "Enter 14-Digit ABHA Number:"}
                  </label>
                  <input
                    type="text"
                    value={linkAbhaInput}
                    onChange={(e) => setLinkAbhaInput(e.target.value)}
                    placeholder="14-5555-6666-7777"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 font-mono text-sm font-semibold focus:outline-emerald-700 focus:border-emerald-700"
                  />
                  {/* Demo Quick Fill */}
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                    <span>Quick Fill:</span>
                    <button
                      type="button"
                      onClick={() => setLinkAbhaInput("14-5555-6666-7777")}
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      Ramesh Sharma (14-5555...)
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setLinkAbhaInput("14-9999-8888-1111")}
                      className="text-blue-700 font-bold hover:underline"
                    >
                      Pooja Gupta (14-9999...)
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block">
                    {lang === "hi" ? "सत्यापन कोड (Aadhaar / Mobile OTP):" : "Verification OTP (Sent to mobile):"}
                  </label>
                  <input
                    type="text"
                    value={linkOtpInput}
                    onChange={(e) => setLinkOtpInput(e.target.value)}
                    placeholder="123456"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 font-mono text-sm tracking-widest font-semibold focus:outline-emerald-700 focus:border-emerald-700"
                  />
                  <p className="text-[11px] text-slate-500">
                    {lang === "hi" ? "परीक्षण के लिए डिफ़ॉल्ट OTP: 123456" : "Demo environment default OTP: 123456"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleLinkAbha}
                  disabled={isLinking}
                  className="flex-1 bg-amber-700 hover:bg-amber-800 text-white font-bold h-12 rounded-2xl cursor-pointer text-xs sm:text-sm"
                >
                  {isLinking ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  <span>{lang === "hi" ? "सत्यापित करें और लिंक करें" : "Verify & Link ABHA"}</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowLinkAbhaModal(false);
                    setLinkError(null);
                  }}
                  className="h-12 px-5 text-xs sm:text-sm font-semibold border-slate-300 rounded-2xl cursor-pointer"
                >
                  {lang === "hi" ? "रद्द करें" : "Cancel"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 6: Single Past Visit Prescription Slip Modal ────────────── */}
      {viewingRxRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base">
                  {lang === "hi" ? "डिजिटल ओपीडी पर्चा" : "Digital OPD Prescription Record"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingRxRecord(null)}
                className="text-emerald-200 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slip Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-800">
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-950 text-sm">{viewingRxRecord.department}</h4>
                    <p className="text-slate-500 text-[11px]">{viewingRxRecord.doctorName} · {viewingRxRecord.roomNumber}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 block">
                      📅 {viewingRxRecord.visitDate}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Chief Complaint & Diagnosis:</span>
                  <p className="font-bold text-slate-950 text-sm">{viewingRxRecord.chiefComplaint}</p>
                  <p className="text-slate-600 font-medium">{viewingRxRecord.diagnosis}</p>
                </div>
              </div>

              {/* Prescriptions */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-950 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-emerald-800" />
                  <span>{lang === "hi" ? "दवाइयां और सेवन विधि:" : "Prescribed Medicines & Dosage:"}</span>
                </h4>
                <div className="space-y-2.5">
                  {viewingRxRecord.prescriptions.map((rx) => (
                    <div key={rx.id} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1 shadow-2xs">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-950 text-sm">{rx.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {rx.category === "ayurveda" ? "Ayurveda" : "Allopathy"}
                        </span>
                      </div>
                      <p className="text-slate-700 font-semibold">
                        {rx.dosage} · <span className="text-slate-900 font-bold">{rx.frequency}</span> ({rx.duration})
                      </p>
                      {rx.instructions && (
                        <p className="text-[11px] text-slate-500 italic">💡 {rx.instructions}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Doctor Advice */}
              {viewingRxRecord.doctorAdvice && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                  <span className="font-bold text-amber-900 block">
                    {lang === "hi" ? "चिकित्सक सलाह:" : "Doctor's Advice:"}
                  </span>
                  <p className="text-slate-700 leading-relaxed">{viewingRxRecord.doctorAdvice}</p>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
              <Link
                href={`/kiosk?${kioskParams}&step=complaint_select&visit_type=followup&complaint=${encodeURIComponent(viewingRxRecord.chiefComplaint)}`}
                className="h-11 px-5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>{lang === "hi" ? "फॉलो-अप परामर्श लें" : "Follow-up for this Complaint"}</span>
              </Link>
              <Button
                variant="outline"
                onClick={() => setViewingRxRecord(null)}
                className="h-11 px-5 rounded-xl text-xs font-semibold border-slate-300 cursor-pointer"
              >
                {lang === "hi" ? "बंद करें" : "Close"}
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
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-xs text-slate-500 font-semibold">
          Loading Patient Portal...
        </div>
      }
    >
      <PatientPortalContent />
    </React.Suspense>
  );
}
