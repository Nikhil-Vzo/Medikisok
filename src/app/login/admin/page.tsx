"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, ArrowRight, ArrowLeft, CheckCircle2, Building2, KeyRound, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function MinistryAdminLoginPage() {
  const router = useRouter();
  const [officialId, setOfficialId] = React.useState("AYUSH-DIR-2026-HQ");
  const [authority, setAuthority] = React.useState("Ministry of Ayush / NHA National Command");
  const [accessLevel, setAccessLevel] = React.useState("National Director (Cross-Hospital Analytics & Export)");
  const [password, setPassword] = React.useState("ministry2026");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/admin");
    }, 600);
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
            <span className="text-[13px] font-medium text-slate-600">Ministry Command Access</span>
          </div>

          <Badge variant="default" className="text-xs font-medium bg-emerald-100 text-emerald-900 border border-emerald-300">
            Government of India
          </Badge>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto w-full">
        <div className="w-full space-y-6 bg-white p-6 sm:p-8 rounded-xl border border-slate-200/80 shadow-sm">
          {/* Back link & Icon */}
          <div className="space-y-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal Selection</span>
            </Link>

            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
              <Landmark className="w-6 h-6" strokeWidth={1.75} />
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Ministry & Health Authority Login
              </h1>
              <p className="text-xs text-slate-600 leading-relaxed">
                National executive console for the Ministry of Ayush, National Health Authority (NHA), and institutional directors to monitor cross-hospital footfalls and export surveillance datasets.
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Government Officer Official ID / NHA Badge ID
              </label>
              <input
                type="text"
                required
                value={officialId}
                onChange={(e) => setOfficialId(e.target.value)}
                className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Department / Authority
              </label>
              <input
                type="text"
                readOnly
                value={authority}
                className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Authorised Clearance Tier
              </label>
              <input
                type="text"
                readOnly
                value={accessLevel}
                className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 cursor-not-allowed"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Access Key / NIC 2FA Token
                </label>
                <span className="text-[11px] text-emerald-700 font-medium">Secured with SHA-256</span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full h-12 rounded-lg text-sm font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isLoading ? "Authenticating Clearance..." : "Enter Ministry Command Center"}</span>
            </Button>
          </form>

          {/* Quick Demo Pre-fill */}
          <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-100 flex items-center justify-between text-xs">
            <span className="text-slate-600">Testing evaluation mode active</span>
            <button
              type="button"
              onClick={() => {
                setOfficialId("AYUSH-SEC-2026-DELHI");
                setPassword("ministry2026");
              }}
              className="text-xs font-semibold text-emerald-800 hover:underline"
            >
              Reset Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
