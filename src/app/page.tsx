"use client";

import * as React from "react";
import Link from "next/link";
import {
  UserCheck, Stethoscope, ArrowRight, ShieldCheck,
  Mic, ScanLine, FileText, Languages, Zap, Lock,
  CheckCircle2, Activity, ChevronRight, Building2, Landmark
} from "lucide-react";

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
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/desk" className="hover:text-emerald-800 transition font-medium">
              Hospital Desk
            </Link>
            <Link href="/doctor" className="hover:text-emerald-800 transition font-medium">
              Doctor OPD
            </Link>
            <Link href="/admin" className="hover:text-emerald-800 transition font-medium">
              Ministry Portal
            </Link>
            <a href="#system" className="hover:text-emerald-800 transition">System</a>
            <a href="#trust" className="hover:text-emerald-800 transition">Trust</a>
          </nav>
          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 px-3 h-9 rounded-md bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:border-emerald-300 hover:text-emerald-900 transition shadow-xs"
            >
              <span>Portals</span>
            </Link>
            <Link
              href="/login/patient"
              className="inline-flex items-center gap-1.5 px-4 h-9 rounded-md bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition shadow-xs"
            >
              <span>Launch Kiosk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ============================= HERO ============================= */}
      <section className="border-b border-emerald-100/70">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 pt-16 pb-20 lg:pt-22 lg:pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 mb-6 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            All India Institute of Ayurveda · Ministry of Ayush · SIH 2026
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.1] font-bold text-slate-900 max-w-3xl mx-auto tracking-tight">
            India's OPD has two minutes.
            <br />
            <span className="text-emerald-700">MediKiosk returns them.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg leading-relaxed text-slate-600 max-w-2xl mx-auto font-normal">
            A self-service multimodal AI clinical intake platform that captures a complete patient history
            in 8 Indian languages, digitizes physical prescriptions with
            vision AI, and delivers a structured clinical summary to the
            doctor's screen before the patient enters the consultation room.
          </p>

          {/* 4 Interactive Portal Entry Cards */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <Link
              href="/login/patient"
              className="group p-5 bg-white rounded-xl border border-slate-200/90 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center mb-3.5 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">Patient Kiosk</h3>
                <p className="text-xs text-slate-500 mt-1 leading-snug">
                  Multimodal voice & touch intake in 8 Indian languages with prescription OCR.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
                <span>Launch Intake</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/desk"
              className="group p-5 bg-white rounded-xl border border-slate-200/90 hover:border-teal-500 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center mb-3.5 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors">Hospital Desk</h3>
                <p className="text-xs text-slate-500 mt-1 leading-snug">
                  Nurse lobby triage station, doctor & room allotment, and physical vitals logger.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-teal-700">
                <span>Open Lobby Desk</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/doctor"
              className="group p-5 bg-white rounded-xl border border-slate-200/90 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center mb-3.5 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">Doctor OPD</h3>
                <p className="text-xs text-slate-500 mt-1 leading-snug">
                  Live queue, pre-consultation SOAP & Ayush Pariksha, and Rx order sets.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
                <span>Consultation Room</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/admin"
              className="group p-5 bg-white rounded-xl border border-slate-200/90 hover:border-indigo-500 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 flex items-center justify-center mb-3.5 group-hover:bg-indigo-700 group-hover:text-white transition-colors">
                  <Landmark className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-800 transition-colors">Ministry Admin</h3>
                <p className="text-xs text-slate-500 mt-1 leading-snug">
                  National disease surveillance, tri-dosha analytics, and ABDM FHIR exports.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-700">
                <span>Access Command</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap justify-center items-center gap-x-6 gap-y-3 text-xs font-medium text-slate-600">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs">
              <Languages className="w-3.5 h-3.5 text-emerald-600" />
              Hindi + 7 Indic languages
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              DPDP Act 2023 Compliant
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              Realtime HIS Sync
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% ABDM M1/M2/M3 Ready
            </span>
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

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/login/patient"
                className="inline-flex items-center gap-2 px-5 h-11 rounded-md bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition shadow-sm"
              >
                <UserCheck className="w-4 h-4" />
                Patient Kiosk
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
              <Link
                href="/desk"
                className="inline-flex items-center gap-2 px-5 h-11 rounded-md bg-white text-teal-950 text-sm font-semibold border border-teal-200 hover:border-teal-400 hover:bg-teal-50 transition shadow-xs"
              >
                <Building2 className="w-4 h-4 text-teal-700" />
                Hospital Desk
              </Link>
              <Link
                href="/doctor"
                className="inline-flex items-center gap-2 px-5 h-11 rounded-md bg-white text-emerald-950 text-sm font-semibold border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 transition shadow-xs"
              >
                <Stethoscope className="w-4 h-4 text-emerald-700" />
                Doctor Workspace
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-5 h-11 rounded-md bg-white text-indigo-950 text-sm font-semibold border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition shadow-xs"
              >
                <Landmark className="w-4 h-4 text-indigo-700" />
                Ministry Admin
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
