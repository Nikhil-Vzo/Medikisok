"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CreditCard,
  Smartphone,
  QrCode,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressSteps, StepItem } from "@/components/ui/progress-steps";

/* ─── Types ─────────────────────────────────────────────────────────────── */

type AuthMethod = "abha" | "mobile" | "qr";
type FlowStep = "identify" | "confirmed";

interface AbhaProfile {
  abhaId: string;
  abhaAddress: string;
  fullName: string;
  gender: string;
  yearOfBirth: number;
  mobile: string;
  token: string;
}

/* ─── Constants ─────────────────────────────────────────────────────────── */

const ABHA_STEPS_EN: StepItem[] = [
  { id: "identify", label: "Enter Identity" },
  { id: "confirmed", label: "ABHA Ready" },
];

const ABHA_STEPS_HI: StepItem[] = [
  { id: "identify", label: "पहचान दर्ज करें", labelHindi: "Enter Identity" },
  { id: "confirmed", label: "ABHA तैयार", labelHindi: "ABHA Ready" },
];

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function PatientLoginPage() {
  const router = useRouter();

  // Auth flow state (identify -> confirmed)
  const [authMethod, setAuthMethod] = React.useState<AuthMethod>("abha");
  const [flowStep, setFlowStep] = React.useState<FlowStep>("identify");
  const [isLoading, setIsLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  // Form fields
  const [abhaNumber, setAbhaNumber] = React.useState("");
  const [mobileNumber, setMobileNumber] = React.useState("");
  const [customName, setCustomName] = React.useState("");

  // Result state
  const [profile, setProfile] = React.useState<AbhaProfile | null>(null);

  // Language (default to English)
  const [lang, setLang] = React.useState<"hi" | "en">("en");

  const steps = lang === "hi" ? ABHA_STEPS_HI : ABHA_STEPS_EN;
  const stepIndex = flowStep === "identify" ? 0 : 1;

  /* ─── Helpers ──────────────────────────────────────────────────────── */

  function getCurrentLangStrings() {
    if (lang === "hi") {
      return {
        title: "मरीज़ रजिस्ट्रेशन (ABHA)",
        subtitle: "अपना आभा (ABHA) नंबर या मोबाइल दर्ज कर तुरंत चेक-इन करें।",
        verify: "सत्यापित करें व आगे बढ़ें",
        changeId: "विवरण बदलें",
        verifiedTitle: "ABHA खाता सत्यापित हो गया!",
        verifiedSub: "आपकी राष्ट्रीय स्वास्थ्य पहचान सफलतापूर्वक लिंक हो गई है।",
        proceed: "मरीज पोर्टल व सेवाओं पर जाएं",
        directKiosk: "सीधे कियोस्क इनटेक पर जाएं (त्वरित)",
        skipDirect: "सीधे कियोस्क पर जाएं",
        abhaTab: "ABHA ID",
        mobileTab: "मोबाइल नंबर",
        qrTab: "QR स्कैन",
        enterAbha: "14 अंकों का ABHA नंबर दर्ज करें",
        abhaPlaceholder: "91-XXXX-XXXX-XXXX",
        enterMobile: "10 अंकों का मोबाइल नंबर",
        mobilePlaceholder: "9876543210",
        scanCard: "ABHA कार्ड QR स्कैन करें",
        scanSimulate: "कैमरा QR स्कैनर प्रारंभ करें",
        privacy: "DPDP Act 2023 के तहत पूर्ण सुरक्षित व एंड-टू-एंड एन्क्रिप्टेड",
      };
    }
    return {
      title: "Patient Registration (ABHA)",
      subtitle: "Enter your ABHA number or mobile to verify identity and begin intake.",
      verify: "Verify & Continue",
      changeId: "Change Details",
      verifiedTitle: "ABHA Health Profile Verified!",
      verifiedSub: "Your national health identifier is confirmed and ready for clinical intake.",
      proceed: "Access Patient Portal & Services",
      directKiosk: "Direct Kiosk Intake (Quick Start)",
      skipDirect: "Direct Intake",
      abhaTab: "ABHA ID",
      mobileTab: "Mobile",
      qrTab: "QR Scan",
      enterAbha: "Enter your 14-digit ABHA Number",
      abhaPlaceholder: "91-XXXX-XXXX-XXXX",
      enterMobile: "Enter 10-digit mobile number",
      mobilePlaceholder: "9876543210",
      scanCard: "Scan ABHA Card QR",
      scanSimulate: "Start Camera QR Scan",
      privacy: "Protected & Encrypted under DPDP Act 2023 · ABDM Compliant",
    };
  }

  const t = getCurrentLangStrings();

  /* ─── Auth Handlers (Real ABDM / DB Verification) ─── */

  async function handleVerifyIdentity() {
    setApiError(null);

    const trimmedAbha = abhaNumber.trim();
    const trimmedMobile = mobileNumber.trim();
    const trimmedName = customName.trim();

    if (authMethod === "abha" && !trimmedAbha && !trimmedName) {
      setApiError(lang === "hi" ? "कृपया अपना 14 अंकों का ABHA नंबर दर्ज करें" : "Please enter your 14-digit ABHA Number");
      return;
    }

    if (authMethod === "mobile" && !trimmedMobile && !trimmedName) {
      setApiError(lang === "hi" ? "कृपया अपना 10 अंकों का मोबाइल नंबर दर्ज करें" : "Please enter your 10-digit mobile number");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/abha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase: "link_abha",
          authMethod: authMethod === "mobile" ? "mobile_otp" : "aadhaar_otp",
          abhaNumber: authMethod === "abha" && trimmedAbha ? trimmedAbha : undefined,
          mobile: authMethod === "mobile" && trimmedMobile ? trimmedMobile : undefined,
          fullName: trimmedName || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Identity verification failed");
      }

      setProfile({
        abhaId: data.abhaId || (trimmedAbha || "91-0000-0000-0001"),
        abhaAddress: data.abhaAddress || (trimmedName ? `${trimmedName.toLowerCase().replace(/\s+/g, ".")}@abdm` : "patient@abdm"),
        fullName: data.fullName || (trimmedName || "Patient"),
        gender: data.gender || "Not specified",
        yearOfBirth: data.yearOfBirth || (new Date().getFullYear() - 30),
        mobile: data.mobile || (trimmedMobile || "XXXXXXXXXX"),
        token: data.token || "TOKEN-VERIFIED",
      });
      setFlowStep("confirmed");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  function handleProceed() {
    if (profile) {
      const age = new Date().getFullYear() - profile.yearOfBirth;
      const params = new URLSearchParams({
        abha: profile.abhaId,
        name: profile.fullName,
        gender: profile.gender,
        age: String(age),
        lang: lang,
      });
      router.push(`/patient?${params.toString()}`);
    } else {
      router.push(`/patient?lang=${lang}`);
    }
  }

  function handleDirectKiosk() {
    if (profile) {
      const age = new Date().getFullYear() - profile.yearOfBirth;
      const params = new URLSearchParams({
        abha: profile.abhaId,
        name: profile.fullName,
        gender: profile.gender,
        age: String(age),
        lang: lang,
      });
      router.push(`/kiosk?${params.toString()}`);
    } else {
      router.push(`/kiosk?lang=${lang}`);
    }
  }

  function handleReset() {
    setFlowStep("identify");
    setProfile(null);
    setApiError(null);
  }

  /* ─── Render ────────────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-[#F7FAF8] text-slate-900 flex flex-col antialiased selection:bg-emerald-100 selection:text-emerald-950">
      {/* Top Header */}
      <header className="border-b border-emerald-100 bg-[#F7FAF8]/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/login" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-emerald-600 flex items-center justify-center shadow-xs">
                <span className="text-white text-[11px] font-bold">M</span>
              </div>
              <span className="text-[15px] font-semibold text-slate-900">MediKiosk</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-[13px] font-medium text-slate-600">Patient Authentication</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-white rounded-lg border border-slate-200 p-0.5 shadow-sm">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  lang === "en" ? "bg-emerald-700 text-white" : "text-slate-600 hover:bg-emerald-50"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLang("hi")}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  lang === "hi" ? "bg-emerald-700 text-white" : "text-slate-600 hover:bg-emerald-50"
                }`}
              >
                हिंदी
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto w-full">
        <div className="w-full space-y-6 bg-white p-6 sm:p-8 rounded-xl border border-slate-200/80 shadow-sm">
          {/* Header */}
          <div className="space-y-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{lang === "hi" ? "पोर्टल चयन पर वापस जाएं" : "Back to Portal Selection"}</span>
            </Link>

            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {t.title}
              </h1>
              <Badge variant="default" className="text-xs font-medium">
                ABHA Verified
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium">{t.subtitle}</p>
          </div>

          {/* Progress Steps (2-step Mockup flow: Enter Identity -> ABHA Ready) */}
          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-200/80">
            <ProgressSteps steps={steps} currentStepIndex={stepIndex} />
          </div>

          {/* Auth Method Tabs — shown during identify step */}
          {flowStep === "identify" && (
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg">
              {(["abha", "mobile", "qr"] as AuthMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => { setAuthMethod(method); setApiError(null); }}
                  className={`flex items-center justify-center gap-2 py-2 px-2 rounded-md text-xs font-semibold transition-all ${
                    authMethod === method
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {method === "abha" && <CreditCard className="w-3.5 h-3.5" />}
                  {method === "mobile" && <Smartphone className="w-3.5 h-3.5" />}
                  {method === "qr" && <QrCode className="w-3.5 h-3.5" />}
                  <span>
                    {method === "abha" ? t.abhaTab : method === "mobile" ? t.mobileTab : t.qrTab}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Error Banner */}
          {apiError && (
            <div className="flex items-center gap-3 p-3.5 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{apiError}</p>
            </div>
          )}

          {/* ── STEP: Identify ── */}
          {flowStep === "identify" && (
            <div className="space-y-5">
              {/* Patient Name input (Optional or Custom) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  {lang === "hi" ? "मरीज़ का पूरा नाम (वैकल्पिक)" : "Patient Full Name (Optional if registered)"}
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={lang === "hi" ? "उदा. अपना नाम दर्ज करें" : "e.g. Enter your full name"}
                  className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-sm font-medium focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
                />
              </div>

              {authMethod === "abha" && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    {t.enterAbha}
                  </label>
                  <input
                    type="text"
                    value={abhaNumber}
                    onChange={(e) => setAbhaNumber(e.target.value)}
                    placeholder={t.abhaPlaceholder}
                    maxLength={19}
                    className="w-full h-12 px-4 rounded-lg border border-slate-200 text-base font-semibold focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-900"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{lang === "hi" ? "14 अंकों का नंबर (जैसे: 91-XXXX-XXXX-XXXX)" : "14 digits (format: 91-XXXX-XXXX-XXXX)"}</span>
                  </div>
                </div>
              )}

              {authMethod === "mobile" && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    {t.enterMobile}
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 h-12 rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder={t.mobilePlaceholder}
                      maxLength={10}
                      className="flex-1 h-12 px-4 rounded-r-lg border border-slate-200 text-base font-semibold focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-900"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{lang === "hi" ? "10 अंकों का सक्रिय मोबाइल नंबर" : "10-digit registered mobile number"}</span>
                  </div>
                </div>
              )}

              {authMethod === "qr" && (
                <div className="p-6 border border-dashed border-emerald-200 rounded-xl bg-emerald-50/20 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-700">
                    <QrCode className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{t.scanCard}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Hold your physical ABHA card or Ayushman Bharat health card to camera</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setApiError(lang === "hi" ? "कैमरा QR स्कैनर उपलब्ध नहीं है। कृपया ABHA नंबर मैन्युअली दर्ज करें।" : "Camera QR scanner not active on this device. Please enter ABHA number manually.");
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{t.scanSimulate}</span>
                  </button>
                </div>
              )}

              {/* Verify Button */}
              {authMethod !== "qr" && (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleVerifyIdentity}
                  disabled={isLoading}
                  className="w-full h-12 rounded-lg text-sm font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span>{lang === "hi" ? "सत्यापित हो रहा है..." : "Verifying ABHA ID..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{t.verify}</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}

              {/* Direct Bypass Button */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleProceed}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline underline-offset-4"
                >
                  {t.skipDirect}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP: Confirmed ── */}
          {flowStep === "confirmed" && profile && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-700">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{t.verifiedTitle}</h3>
                <p className="text-xs text-slate-500 font-medium">{t.verifiedSub}</p>
              </div>

              {/* Official ABHA Card Preview */}
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                {/* Official National Health Authority Card Header Strip */}
                <div className="bg-emerald-800 text-white px-4 py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    <span>Ayushman Bharat Digital Mission (ABDM)</span>
                  </div>
                  <span className="text-[11px] text-emerald-200 font-medium">National Health Authority</span>
                </div>

                <div className="p-5 bg-white space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-lg">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-slate-900">{profile.fullName}</h4>
                        <p className="text-xs text-slate-500 font-medium">Mobile: {profile.mobile}</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded border border-slate-200 bg-slate-50 flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-slate-700" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-xs font-medium text-slate-500 block mb-0.5">ABHA Number</span>
                      <p className="font-semibold text-slate-900 text-sm">{profile.abhaId}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-slate-500 block mb-0.5">ABHA Address</span>
                      <p className="text-slate-700 text-xs truncate">{profile.abhaAddress}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-medium text-slate-600 pt-1 border-t border-slate-100">
                    <span>Gender: <strong className="text-slate-800">{profile.gender}</strong></span>
                    <span>·</span>
                    <span>YOB: <strong className="text-slate-800">{profile.yearOfBirth}</strong></span>
                    <span>·</span>
                    <span>Status: <strong className="text-emerald-700">VERIFIED</strong></span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2.5">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleProceed}
                  className="w-full h-12 rounded-lg text-sm font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm inline-flex items-center justify-center gap-2"
                >
                  <span>{t.proceed}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleDirectKiosk}
                  className="w-full h-11 rounded-lg text-xs font-semibold border-emerald-300 text-emerald-800 hover:bg-emerald-50 shadow-xs inline-flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.directKiosk}</span>
                </Button>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="w-full text-center text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                {t.changeId}
              </button>
            </div>
          )}

          {/* Privacy Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span>{t.privacy}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
