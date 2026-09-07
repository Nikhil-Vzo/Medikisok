"use client";

import * as React from "react";
import Link from "next/link";
import { UserCheck, Stethoscope, ArrowRight, ShieldCheck } from "lucide-react";

export default function UniversalLoginPage() {
  return (
    <div className="flex-1 bg-[#F7FAF8] min-h-screen selection:bg-emerald-100 selection:text-emerald-950">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-24">
        <div className="max-w-lg mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            National Health Portal Authentication
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            Select your portal.
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Choose your login type to access the clinical intake system or
            medical dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <Link
            href="/login/patient"
            className="group p-8 rounded-xl bg-white border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/20 transition-all flex flex-col justify-between min-h-[280px] shadow-sm"
          >
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
                <UserCheck className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-emerald-800">
                  ABHA / Aadhaar Check-In
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                  Patient Intake Kiosk
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Start your clinical case-taking interview, record symptoms
                  via voice or touch, and scan prior medical prescriptions
                  before seeing the doctor.
                </p>
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-800 group-hover:text-emerald-950">
              <span>Enter Patient Kiosk</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.75} />
            </div>
          </Link>

          <Link
            href="/login/doctor"
            className="group p-8 rounded-xl bg-white border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/20 transition-all flex flex-col justify-between min-h-[280px] shadow-sm"
          >
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
                <Stethoscope className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-emerald-800">
                  AIIA Faculty Portal
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                  Doctor OPD Desk
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Access live consented OPD patient queue, review
                  pre-structured clinical summaries, Dashavidha profiles, and
                  verify prescriptions.
                </p>
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-800 group-hover:text-emerald-950">
              <span>Sign in as Clinician</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.75} />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
