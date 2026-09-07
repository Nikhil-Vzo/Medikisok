"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  UserCheck, Stethoscope, ArrowRight, ShieldCheck,
  Mic, ScanLine, FileText, Languages, Zap, Lock,
  CheckCircle2, Activity, ChevronRight, Building2, Landmark,
  Sparkles, Clock, Layers, ArrowUpRight
} from "lucide-react";

export default function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.09,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 350, damping: 25 },
    },
  };

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
      <section className="border-b border-emerald-100/60 relative">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 pt-16 pb-20 lg:pt-20 lg:pb-24 text-center">

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

          {/* 4 Interactive Portal Entry Cards (Staggered Animation) */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left"
          >
            {/* 1. Patient Kiosk */}
            <motion.div variants={itemVariants}>
              <Link
                href="/login/patient"
                className="group p-5 bg-white rounded-xl border border-slate-200/90 hover:border-emerald-500 hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between h-full relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200" />
                <div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 flex items-center justify-center mb-3.5 group-hover:bg-emerald-700 group-hover:text-white transition-colors shadow-2xs">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors flex items-center gap-1.5">
                    Patient Kiosk
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-700" />
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">
                    Multimodal voice & touch intake in 8 Indian languages with prescription OCR.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
                  <span>Launch Intake</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>

            {/* 2. Hospital Desk */}
            <motion.div variants={itemVariants}>
              <Link
                href="/desk"
                className="group p-5 bg-white rounded-xl border border-slate-200/90 hover:border-teal-500 hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between h-full relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-teal-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200" />
                <div>
                  <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200/80 text-teal-800 flex items-center justify-center mb-3.5 group-hover:bg-teal-700 group-hover:text-white transition-colors shadow-2xs">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors flex items-center gap-1.5">
                    Hospital Desk
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-teal-700" />
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">
                    Nurse lobby triage station, doctor & room allotment, and physical vitals logger.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-teal-700">
                  <span>Open Lobby Desk</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>

            {/* 3. Doctor OPD */}
            <motion.div variants={itemVariants}>
              <Link
                href="/doctor"
                className="group p-5 bg-white rounded-xl border border-slate-200/90 hover:border-emerald-500 hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between h-full relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200" />
                <div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 flex items-center justify-center mb-3.5 group-hover:bg-emerald-700 group-hover:text-white transition-colors shadow-2xs">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors flex items-center gap-1.5">
                    Doctor OPD
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-700" />
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">
                    Live queue, pre-consultation SOAP & Ayush Pariksha, and Rx order sets.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
                  <span>Consultation Room</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>

            {/* 4. Ministry Admin */}
            <motion.div variants={itemVariants}>
              <Link
                href="/admin"
                className="group p-5 bg-white rounded-xl border border-slate-200/90 hover:border-indigo-500 hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between h-full relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200" />
                <div>
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200/80 text-indigo-800 flex items-center justify-center mb-3.5 group-hover:bg-indigo-700 group-hover:text-white transition-colors shadow-2xs">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-800 transition-colors flex items-center gap-1.5">
                    Ministry Admin
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-700" />
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">
                    National disease surveillance, tri-dosha analytics, and ABDM FHIR exports.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-700">
                  <span>Access Command</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Compliance & Standards Strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-12 flex flex-wrap justify-center items-center gap-x-6 gap-y-3 text-xs font-medium text-slate-600"
          >
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
              <Languages className="w-3.5 h-3.5 text-emerald-600" />
              Hindi + 7 Indic languages
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              DPDP Act 2023 Compliant
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              Realtime HIS Sync
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% ABDM M1/M2/M3 Ready
            </span>
          </motion.div>
        </div>
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
