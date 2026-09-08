"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, ShieldCheck,
  Mic, ScanLine, FileText,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col bg-[#F8FAF9] text-slate-900 antialiased overflow-hidden selection:bg-emerald-100 selection:text-emerald-900">

      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-emerald-100/50 via-teal-50/30 to-transparent blur-3xl opacity-70" />
      </div>

      {/* ============================= NAV ============================= */}
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-50 border-b border-emerald-100/80 bg-[#F8FAF9]/85 backdrop-blur-md"
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center shadow-xs group-hover:bg-emerald-800 transition-colors">
              <span className="text-white text-xs font-bold tracking-tight">M</span>
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900">MediKiosk</span>
            <span className="hidden sm:inline-block ml-1.5 text-[11px] font-semibold text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200 bg-emerald-50/90">
              SIH 2026
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/desk" className="hover:text-emerald-800 transition-colors">
              Hospital Desk
            </Link>
            <Link href="/doctor" className="hover:text-emerald-800 transition-colors">
              Doctor OPD
            </Link>
            <Link href="/admin" className="hover:text-emerald-800 transition-colors">
              Ministry Portal
            </Link>
            <a href="#system" className="hover:text-emerald-800 transition-colors">System</a>
            <a href="#trust" className="hover:text-emerald-800 transition-colors">Trust</a>
          </nav>
          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 px-3.5 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:border-emerald-300 hover:text-emerald-900 transition-all shadow-2xs"
            >
              <span>Portals</span>
            </Link>
            <Link
              href="/login/patient"
              className="inline-flex items-center gap-1.5 px-4 h-9 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-all shadow-xs hover:shadow-sm"
            >
              <span>Launch Kiosk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </motion.header>

      {/* ============================= HERO (DECLUTTERED & ANIMATED) ============================= */}
      <section className="relative overflow-hidden min-h-[100vh] w-full flex flex-col">
        {/* Ayurvedic Botanical Motif Background */}
        <div
          className="absolute inset-0 pointer-events-none select-none bg-cover bg-center opacity-65 mix-blend-multiply"
          style={{ backgroundImage: "url('/bg.png')" }}
        />
        {/* Soft atmospheric gradient to maintain optimal text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAF9]/55 via-[#F8FAF9]/20 to-[#F8FAF9]/70 pointer-events-none select-none" />

        {/* Centered headline block */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full px-6 lg:px-8 text-center relative z-10 -translate-y-48">

          {/* Institutional Badge */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-900 bg-emerald-50/90 border border-emerald-200/90 mb-6 shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            All India Institute of Ayurveda · Ministry of Ayush · SIH 2026
          </motion.div>

          {/* Punchy Hero Headline */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl leading-[1.08] font-black text-slate-900 max-w-3xl mx-auto tracking-tight"
          >
            India's OPD has two minutes.
            <br />
            <span className="text-emerald-700">MediKiosk returns them.</span>
          </motion.h1>
        </div>

        {/* Launch Kiosk — pinned to bottom center */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="absolute bottom-32 left-0 right-0 flex flex-col items-center gap-2 z-10"
        >
          <Link
            href="/login/patient"
            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-emerald-700 text-white text-sm font-bold shadow-md hover:bg-emerald-800 hover:shadow-lg active:scale-[0.98] transition-all duration-150"
          >
            Launch Kiosk
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <span className="text-xs text-slate-500 font-medium">
            Patient self-service · 8 Indic languages · Voice &amp; Touch
          </span>
        </motion.div>

      </section>


      {/* ============================= CLINICAL SPEED & ROI ============================= */}
      <section id="problem" className="border-b border-emerald-100/60 bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="grid sm:grid-cols-3 gap-6 text-center"
          >
            <div className="p-6 rounded-xl bg-[#F8FAF9] border border-emerald-100/80">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-800">2 min</div>
              <div className="text-xs font-bold text-slate-900 mt-2">Average Indian OPD Consult</div>
              <p className="text-[11px] text-slate-500 mt-1">High volume outpatient pressure across AIIMS & apex centers</p>
            </div>
            <div className="p-6 rounded-xl bg-emerald-50/70 border border-emerald-200/90 shadow-xs">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700">&lt; 15s</div>
              <div className="text-xs font-bold text-emerald-950 mt-2">Pre-Screened Case Delivery</div>
              <p className="text-[11px] text-emerald-800/80 mt-1">Structured SOAP, Ayush Pariksha & vitals ready on doctor's desk</p>
            </div>
            <div className="p-6 rounded-xl bg-[#F8FAF9] border border-emerald-100/80">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-800">+82 hrs</div>
              <div className="text-xs font-bold text-slate-900 mt-2">Daily Clinical Time Returned</div>
              <p className="text-[11px] text-slate-500 mt-1">Direct physician bandwidth redirected back to critical diagnosis</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================= SYSTEM (4 CORE INNOVATIONS) ============================= */}
      <section id="system" className="border-b border-emerald-100/60">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl mb-12"
          >
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
              Clinical Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Four modules. One seamless consultation.
            </h2>
            <p className="mt-2 text-sm text-slate-600 font-normal">
              Built for apex government outpatient hospitals — structured, consented, and clinical-grade.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              {
                n: "01",
                icon: Mic,
                title: "Multimodal Voice & Touch Intake",
                desc: "Patients speak naturally in Hindi or 8 regional Indian languages. Adaptive SOCRATES questioning for allopathy and 10-parameter Dashavidha Pariksha for Ayurvedic OPDs.",
                meta: "Voice · Touch · 8 Indic Languages"
              },
              {
                n: "02",
                icon: ScanLine,
                title: "Document AI & Vision OCR",
                desc: "Digitizes crumpled handwritten prescriptions into a verified chronological timeline. Vision AI extracts drugs, dosages, and abnormal lab values automatically.",
                meta: "Grok Vision + Gemini Flash OCR"
              },
              {
                n: "03",
                icon: FileText,
                title: "Pre-Structured SOAP & Ayush Summary",
                desc: "Generates an instant clinical summary on the physician's screen before the patient enters. Integrates cross-system drug-herb safety alerts and one-click order sets.",
                meta: "<15s Case Delivery · FHIR R4"
              },
              {
                n: "04",
                icon: ShieldCheck,
                title: "Consent & ABDM Integration",
                desc: "14-digit ABHA authentication, audio-guided DPDP Act 2023 digital signature, and consent-enforced row-level security with ALCOA+ audit trails.",
                meta: "DPDP 2023 · ABDM M1/M2/M3"
              },
            ].map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -3 }}
                className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200/80 hover:border-emerald-300 transition-all shadow-xs group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                    <m.icon className="w-5 h-5 stroke-[2]" />
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">{m.n}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-emerald-800 transition-colors">
                  {m.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 font-normal">
                  {m.desc}
                </p>
                <div className="text-xs font-semibold text-emerald-800 pt-3 border-t border-slate-100">
                  {m.meta}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================= CONTINUITY ENGINE ============================= */}
      <section id="continuity" className="border-b border-emerald-100/60 bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-6"
            >
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                Longitudinal Intelligence
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
                Returning patients never start from zero.
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                MediKiosk tracks elapsed time since the patient's last hospital visit. Returning patients skip repetitive baseline questionnaires and jump straight to medication adherence and symptom progression.
              </p>

              <div className="space-y-2.5">
                {[
                  { range: "Under 30 days", label: "Delta Triage Protocol", note: "Adherence check + symptom change" },
                  { range: "30 to 90 days", label: "Targeted Systems Review", note: "Delta + review of organ systems" },
                  { range: "Over 90 days", label: "Full Clinical Intake", note: "Comprehensive SOCRATES / Dashavidha" },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 border border-slate-200/80 rounded-lg bg-[#F8FAF9] hover:border-emerald-200 transition-colors">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">{r.range}</span>
                      <div className="text-xs font-bold text-slate-900 mt-0.5">{r.label}</div>
                    </div>
                    <div className="text-xs text-slate-500 text-right font-medium">
                      {r.note}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-6"
            >
              <div className="rounded-xl border border-emerald-200/80 bg-[#F8FAF9] p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-950">Follow-Up Dialogue · 45-Day Interval</span>
                  </div>
                  <span className="text-[11px] text-emerald-800 font-bold bg-emerald-100/70 px-2 py-0.5 rounded">Delta Protocol</span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                    <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1">Medication Adherence</div>
                    <p className="text-xs text-slate-800 font-medium">
                      "Are you still taking Tab Metformin 500mg prescribed at your last visit?"
                    </p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                    <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1">Symptom Evolution</div>
                    <p className="text-xs text-slate-800 font-medium">
                      "Is your chest discomfort better, unchanged, or worse compared to last month?"
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 font-medium pt-1">
                  Prevents patient interview fatigue while giving the clinician an exact longitudinal trajectory.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
