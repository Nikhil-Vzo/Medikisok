"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Stethoscope, Lock, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2, Building2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DoctorLoginPage() {
  const router = useRouter();
  const [staffId, setStaffId] = React.useState("AIIA-DOC-8921");
  const [department, setDepartment] = React.useState("AIIA Ayurvedic General OPD");
  const [roomNumber, setRoomNumber] = React.useState("Room 3");
  const [password, setPassword] = React.useState("docpass2026");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/doctor");
    }, 700);
  };

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
            <span className="text-[13px] font-medium text-slate-600">
              <span className="hidden sm:inline">Clinician Authentication</span>
              <span className="sm:hidden font-semibold">Doctor Login</span>
            </span>
          </div>

          <Badge variant="default" className="text-[11px] sm:text-xs font-medium shrink-0">
            AIIA Faculty Portal
          </Badge>
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
              <span>Back to Portal Selection</span>
            </Link>

            <div>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Physician OPD Login
                </h1>
                <Badge variant="default" className="text-xs font-medium">
                  Staff Only
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                All India Institute of Ayurveda (AIIA) Clinician Authentication
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Staff / Clinician Registration ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  placeholder="AIIA-DOC-XXXX"
                  className="w-full h-12 pl-10 pr-4 rounded-lg border border-slate-200 text-base sm:text-sm font-semibold focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-900"
                />
                <Stethoscope className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Assigned Room
                </label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full h-12 px-3.5 rounded-lg border border-slate-200 text-base sm:text-sm font-semibold focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full h-12 px-3 rounded-lg border border-slate-200 text-base sm:text-xs font-semibold focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all bg-white text-slate-900"
                >
                  <option>AIIA Ayurvedic General OPD</option>
                  <option>Kayachikitsa (Internal Medicine)</option>
                  <option>Panchakarma Department</option>
                  <option>General Allopathic Medicine</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Security PIN / Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter security PIN"
                  className="w-full h-12 pl-10 pr-4 rounded-lg border border-slate-200 text-base sm:text-sm font-semibold focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-900"
                />
                <Lock className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              isLoading={isLoading}
              className="w-full h-12 rounded-lg text-sm font-semibold bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm mt-2"
            >
              <span>Access Clinical Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {/* Demo Quick Fill */}
          <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-100 flex items-center justify-between text-xs text-slate-600">
            <div>
              <span className="font-semibold text-slate-900">Dr. Sharma, MD</span>
              <p className="text-[11px] text-slate-500">Senior Consultant · AIIA OPD Room 3</p>
            </div>
            <Badge variant="default" className="text-xs font-medium">
              Demo Active
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
