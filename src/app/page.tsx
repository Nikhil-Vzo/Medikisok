"use client";

import * as React from "react";
import Link from "next/link";
import {
  UserCheck, Stethoscope, ArrowRight, ShieldCheck,
  Mic, ScanLine, FileText, Languages, Zap, Lock,
  CheckCircle2, Activity, ChevronRight
} from "lucide-react";
import { AnimatedTerminal } from "@/components/landing/animated-terminal";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col bg-[#F7FAF8] text-slate-900 antialiased">

      {/* ============================= NAV ============================= */}
      <header className="sticky top-0 z-50 border-b border-emerald-100 bg-[#F7FAF8]/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-emerald-600 flex items-center justify-center shadow-xs">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <span className="text-base font-semibold tracking-tight text-slate-900">MediKiosk</span>
            <span className="hidden sm:inline-block ml-2 text-xs font-medium text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200 bg-emerald-50">
              SIH 2026
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#problem" className="hover:text-emerald-800 transition">Problem</a>
            <a href="#system" className="hover:text-emerald-800 transition">System</a>
            <a href="#continuity" className="hover:text-emerald-800 transition">Continuity</a>
            <a href="#trust" className="hover:text-emerald-800 transition">Trust</a>
          </nav>
          <Link
            href="/login/patient"
            className="inline-flex items-center gap-1.5 px-4 h-9 rounded-md bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition shadow-xs"
          >
            <span>Launch Kiosk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ============================= HERO ============================= */}
      <section className="border-b border-emerald-100/70">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-7 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 mb-6">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                All India Institute of Ayurveda · Ministry of Ayush
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.08] font-bold text-slate-900">
                India's OPD has two minutes.
                <br />
                <span className="text-emerald-700">MediKiosk returns them.</span>
              </h1>

              <p className="mt-6 text-base sm:text-lg leading-relaxed text-slate-600 max-w-2xl font-normal">
                A self-service multimodal terminal that captures a complete patient history
                in 8 Indian languages, digitizes physical prescriptions with
                vision AI, and delivers a structured clinical summary to the
                doctor's screen before the patient enters the consultation room.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-start gap-3">
                <Link
                  href="/login/patient"
                  className="inline-flex items-center gap-2 px-5 h-11 rounded-md bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition shadow-sm"
                >
                  <UserCheck className="w-4 h-4" />
                  Try the patient kiosk
                </Link>
                <Link
                  href="/login/doctor"
                  className="inline-flex items-center gap-2 px-5 h-11 rounded-md bg-white text-emerald-950 text-sm font-semibold border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 transition shadow-xs"
                >
                  <Stethoscope className="w-4 h-4 text-emerald-700" />
                  Open the doctor workspace
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-slate-600">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200">
                  <Languages className="w-3.5 h-3.5 text-emerald-600" />
                  Hindi + 7 Indic languages
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  DPDP Act 2023 Compliant
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  Realtime HIS sync
                </span>
              </div>
            </div>

            <div className="lg:col-span-5">
              <AnimatedTerminal />
            </div>
          </div>
        </div>
      </section>

      {/* ============================= PROBLEM ============================= */}
      <section id="problem" className="border-b border-emerald-100/70">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <div className="text-xs font-semibold text-emerald-800 mb-3">
                Clinical Context
              </div>
              <h2 className="text-3xl sm:text-4xl leading-[1.15] font-bold text-slate-900">
                Diagnosis takes 80% of the visit.
                <br />
                <span className="text-slate-500 font-medium">The visit lasts 2 minutes.</span>
              </h2>
            </div>

            <div className="lg:col-span-8 space-y-8">
              <p className="text-base leading-relaxed text-slate-600 max-w-xl">
                At India's apex government hospitals — AIIMS, AIIA — over
                10,000 patients pass through outpatient departments every
                day. The clinical interview, the crucial step that produces
                an accurate diagnosis, is what gets compressed under time pressure.
              </p>

              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { v: "2 min", l: "Average Indian OPD consult" },
                  { v: "10,000+", l: "Daily OPD at apex hospitals" },
                  { v: "< 15s", l: "Case delivery to doctor" },
                ].map((s, i) => (
                  <div key={i} className="bg-white p-5 rounded-xl border border-emerald-100 shadow-xs">
                    <div className="text-2xl sm:text-3xl font-bold text-emerald-800">
                      {s.v}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 font-medium">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================= SYSTEM (4 MODULES) ============================= */}
      <section id="system" className="border-b border-emerald-100/70">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-semibold text-emerald-800 mb-2">
              Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Four modules. One seamless consultation.
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              From the hospital doorstep to the doctor's desk, every
              MediKiosk deployment is structured, consented, and clinical-grade.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              {
                n: "01",
                icon: Mic,
                title: "Multimodal history engine",
                desc: "Patients speak naturally in Hindi or 8 regional Indian languages. Adaptive SOCRATES questioning for allopathy, full 10-parameter Dashavidha Pariksha for Ayurvedic OPDs.",
                meta: "Voice · Touch · 8 Indic languages"
              },
              {
                n: "02",
                icon: ScanLine,
                title: "Document AI & Vision OCR",
                desc: "Transforms crumpled physical prescriptions into a clean chronological timeline. Vision AI extracts drugs, dosages, and abnormal lab values automatically.",
                meta: "Handwriting + print OCR"
              },
              {
                n: "03",
                icon: FileText,
                title: "Pre-structured clinical summary",
                desc: "Generates a structured SOAP note draft on the physician's screen before the patient enters. Integrates AYUSH-Allopathy drug safety alerts and order sets.",
                meta: "1-click PDF export & HIS push"
              },
              {
                n: "04",
                icon: ShieldCheck,
                title: "Consent & ABDM Integration",
                desc: "14-digit ABHA authentication, audio-guided DPDP Act 2023 digital signature, and consent-enforced row-level security with ALCOA+ audit trails.",
                meta: "FHIR R4 · DPDP 2023 Compliant"
              },
            ].map((m, i) => (
              <div key={i} className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200/80 hover:border-emerald-300 transition shadow-xs group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700">
                    <m.icon className="w-5 h-5 stroke-[2]" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">{m.n}</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {m.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4 font-normal">
                  {m.desc}
                </p>
                <div className="text-xs font-medium text-emerald-800 pt-3 border-t border-slate-100">
                  {m.meta}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================= CONTINUITY ENGINE ============================= */}
      <section id="continuity" className="border-b border-emerald-100/70 bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <div className="text-xs font-semibold text-emerald-800 mb-2">
                Continuity Engine
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Returning patients never start from zero.
              </h2>
              <p className="text-base text-slate-600 leading-relaxed mb-6 font-normal">
                MediKiosk calculates the interval since a patient's last
                hospital visit. The interview adapts to avoid repetitive
                baseline history and focuses directly on symptom evolution and
                medication adherence.
              </p>

              <div className="space-y-2.5">
                {[
                  { range: "Under 30 days", label: "Delta triage only", note: "Medication adherence + symptom change" },
                  { range: "30 to 90 days", label: "Targeted review", note: "Delta + review of systems" },
                  { range: "Over 90 days", label: "Full clinical intake", note: "Comprehensive SOCRATES / Dashavidha" },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 border border-slate-200/80 rounded-lg bg-[#F7FAF8]">
                    <div>
                      <div className="text-xs font-semibold text-emerald-800">{r.range}</div>
                      <div className="text-sm font-semibold text-slate-900 mt-0.5">{r.label}</div>
                    </div>
                    <div className="text-xs text-slate-500 text-right max-w-[180px] font-medium">
                      {r.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-xl border border-emerald-200/80 bg-[#F7FAF8] p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-emerald-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-950">Follow-up Dialogue · 45-Day Interval</span>
                  </div>
                  <span className="text-xs text-emerald-800 font-medium bg-emerald-100/60 px-2 py-0.5 rounded">Delta Protocol</span>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs">
                    <div className="text-xs font-semibold text-emerald-800 mb-1">Kiosk Prompt</div>
                    <p className="text-sm text-slate-800 font-medium">
                      Are you still taking Tab Metformin 500mg prescribed on 15 July?
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs">
                    <div className="text-xs font-semibold text-emerald-800 mb-1">Kiosk Prompt</div>
                    <p className="text-sm text-slate-800 font-medium">
                      Is your chest discomfort better, unchanged, or worse compared to last month?
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs">
                    <div className="text-xs font-semibold text-emerald-800 mb-1">Kiosk Prompt</div>
                    <p className="text-sm text-slate-800 font-medium">
                      Have you developed any new symptoms since your last consultation?
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-emerald-100 text-xs text-slate-500 font-medium">
                  Prevents patient fatigue while producing an accurate longitudinal progress record for the clinician.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================= TRUST ============================= */}
      <section id="trust" className="border-b border-emerald-100/70">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { k: "Compliance", v: "DPDP Act 2023" },
              { k: "Identity", v: "ABDM · ABHA Verified" },
              { k: "Interoperability", v: "HL7 FHIR R4 Bundle" },
              { k: "Audit", v: "ALCOA+ Compliance" },
            ].map((t, i) => (
              <div key={i} className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
                <div className="text-xs font-semibold text-emerald-800">
                  {t.k}
                </div>
                <div className="mt-1.5 text-base font-semibold text-slate-900">
                  {t.v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================= FINAL CTA ============================= */}
      <section className="bg-[#F7FAF8]">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Try the patient kiosk.
              <br />
              <span className="text-emerald-700">Then open the doctor workspace.</span>
            </h2>
            <p className="mt-3 text-base text-slate-600 max-w-xl font-normal">
              Patient intake and physician review are two ends of the same
              workflow. Both run live in this build.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-start gap-3">
              <Link
                href="/login/patient"
                className="inline-flex items-center gap-2 px-5 h-11 rounded-md bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition shadow-sm"
              >
                <UserCheck className="w-4 h-4" />
                Patient kiosk
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
              <Link
                href="/doctor"
                className="inline-flex items-center gap-2 px-5 h-11 rounded-md bg-white text-emerald-950 text-sm font-semibold border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 transition shadow-xs"
              >
                <Stethoscope className="w-4 h-4 text-emerald-700" />
                Doctor workspace
              </Link>
              <Link
                href="/triage"
                className="inline-flex items-center gap-2 px-5 h-11 rounded-md bg-white text-slate-700 text-sm font-semibold border border-slate-200 hover:border-slate-300 transition shadow-xs"
              >
                <Activity className="w-4 h-4 text-slate-600" />
                Triage monitor
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-emerald-100">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div>MediKiosk · All India Institute of Ayurveda · Ministry of Ayush</div>
            <div>SIH 2026 · v0.1</div>
          </div>
        </div>
      </section>
    </div>
  );
}
