"use client";

import * as React from "react";
import Link from "next/link";
import { UserCheck, Stethoscope, ArrowRight, ShieldCheck, Building2, Landmark } from "lucide-react";

export default function UniversalLoginPage() {
  return (
    <div className="flex-1 bg-[#F7FAF8] min-h-screen selection:bg-emerald-100 selection:text-emerald-950">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <div className="max-w-xl mx-auto text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            National Health Portal Authentication · ABDM Ecosystem
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            Select your health portal.
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Choose your role to access self-service intake, nurse lobby triage,
            physician OPD consultation, or national health surveillance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* 1. Patient Intake Kiosk */}
          <Link
            href="/login/patient"
            className="group p-7 rounded-xl bg-white border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/20 transition-all flex flex-col justify-between min-h-[260px] shadow-sm hover:shadow-md"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
                <UserCheck className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  ABHA / Aadhaar Check-In
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                  Patient Intake Kiosk
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Self-service clinical case-taking in 8 Indian languages, voice intake,
                  chief complaint triage, and physical prescription digitization.
                </p>
              </div>
            </div>
            <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-800 group-hover:text-emerald-950">
              <span>Enter Patient Kiosk</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.75} />
            </div>
          </Link>

          {/* 2. Hospital Desk (Nurse Lobby Console) */}
          <Link
            href="/desk"
            className="group p-7 rounded-xl bg-white border border-slate-200 hover:border-teal-600 hover:bg-teal-50/20 transition-all flex flex-col justify-between min-h-[260px] shadow-sm hover:shadow-md"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
                <Building2 className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-teal-800 uppercase tracking-wider">
                  Lobby & Reception Console
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                  Hospital Desk (Nurse Station)
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Real-time queue monitoring, doctor & room allotment, physical vitals recording
                  (BP, SpO2, Pulse, Temp), prescription pre-check, and audio paging.
                </p>
              </div>
            </div>
            <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-teal-800 group-hover:text-teal-950">
              <span>Open Hospital Desk</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.75} />
            </div>
          </Link>

          {/* 3. Doctor OPD Desk */}
          <Link
            href="/login/doctor"
            className="group p-7 rounded-xl bg-white border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/20 transition-all flex flex-col justify-between min-h-[260px] shadow-sm hover:shadow-md"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
                <Stethoscope className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  Clinician Consultation Suite
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                  Doctor OPD Desk
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Access live consented OPD patients, review pre-structured SOAP notes,
                  Dashavidha Prakriti assessments, nurse vitals, and 1-click ABDM FHIR sign-off.
                </p>
              </div>
            </div>
            <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-800 group-hover:text-emerald-950">
              <span>Sign in as Clinician</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.75} />
            </div>
          </Link>

          {/* 4. Ministry & NHA Command Center */}
          <Link
            href="/login/admin"
            className="group p-7 rounded-xl bg-white border border-slate-200 hover:border-indigo-600 hover:bg-indigo-50/20 transition-all flex flex-col justify-between min-h-[260px] shadow-sm hover:shadow-md"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-800">
                <Landmark className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                  National Health Authority & Ayush
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                  Ministry Command Center
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Multi-hospital epidemiological surveillance, disease heatmaps, AYUSH Prakriti
                  demographics, and 1-click national health data exports (CSV / ABDM FHIR Bulk).
                </p>
              </div>
            </div>
            <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-800 group-hover:text-indigo-950">
              <span>Access Ministry Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.75} />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
