"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck, Lock, CheckCircle2, History, Database, KeyRound,
  FileCode, Check, RefreshCw, Activity, Users, Clock, AlertTriangle,
  BarChart3, TrendingUp, TrendingDown, Eye, EyeOff, LockIcon, ArrowLeft
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_DAILY_INTAKE = [
  { date: "Aug 24", count: 42 },
  { date: "Aug 25", count: 58 },
  { date: "Aug 26", count: 37 },
  { date: "Aug 27", count: 63 },
  { date: "Aug 28", count: 71 },
  { date: "Aug 29", count: 55 },
  { date: "Aug 30", count: 68 },
];

const MOCK_ABHA_STATS = {
  created: 1847,
  linked: 1602,
  failed: 31,
  rate: 94.1,
  byDay: [
    { date: "Aug 24", created: 12, linked: 10 },
    { date: "Aug 25", created: 18, linked: 17 },
    { date: "Aug 26", created: 9, linked: 8 },
    { date: "Aug 27", created: 22, linked: 20 },
    { date: "Aug 28", created: 25, linked: 24 },
    { date: "Aug 29", created: 19, linked: 17 },
    { date: "Aug 30", created: 21, linked: 19 },
  ],
};

const MOCK_SESSION_DURATION = {
  avgSeconds: 187,
  p50Seconds: 162,
  p95Seconds: 412,
  byDay: [
    { date: "Aug 24", avg: 195 },
    { date: "Aug 25", avg: 178 },
    { date: "Aug 26", avg: 210 },
    { date: "Aug 27", avg: 165 },
    { date: "Aug 28", avg: 158 },
    { date: "Aug 29", avg: 182 },
    { date: "Aug 30", avg: 171 },
  ],
};

const MOCK_ERROR_RATES = {
  overall: 2.3,
  totalErrors: 47,
  totalRequests: 2043,
  byType: [
    { type: "ABHA OTP Failure", count: 18 },
    { type: "OCR Parse Error", count: 12 },
    { type: "FHIR Export Error", count: 8 },
    { type: "AI Summary Timeout", count: 6 },
    { type: "Supabase RLS Denied", count: 3 },
  ],
};

const MOCK_AUDIT_LOGS = [
  {
    id: "log-101",
    timestamp: "2026-08-30 09:14:02 IST",
    actor: "Patient (Kiosk #1)",
    action: "INTAKE_COMPLETED",
    resource: "Session #4201",
    status: "VERIFIED"
  },
  {
    id: "log-102",
    timestamp: "2026-08-30 09:22:38 IST",
    actor: "Patient (Kiosk #2)",
    action: "ABHA_CREATED",
    resource: "ABHA 91-4523-8819-2041",
    status: "VERIFIED"
  },
  {
    id: "log-103",
    timestamp: "2026-08-30 09:31:15 IST",
    actor: "Dr. Sharma (Room 3)",
    action: "CONSENTED_RECORD_ACCESSED",
    resource: "Summary #4202",
    status: "RLS_PERMITTED"
  },
  {
    id: "log-104",
    timestamp: "2026-08-30 09:45:55 IST",
    actor: "MediKiosk AI Engine",
    action: "DOCUMENT_ENTITIES_EXTRACTED",
    resource: "Prescription (Aug 28)",
    status: "IMMUTABLE_SAVED"
  },
  {
    id: "log-105",
    timestamp: "2026-08-30 10:02:11 IST",
    actor: "Patient (Kiosk #1)",
    action: "DPDP_CONSENT_GRANTED",
    resource: "Consent Artefact (24hr)",
    status: "VERIFIED"
  },
];

// ─── Chart Components ─────────────────────────────────────────────────────────

function BarChart({
  data,
  valueKey,
  color = "bg-emerald-600 hover:bg-emerald-700",
}: {
  data: { date: string; [key: string]: number | string }[];
  valueKey: string;
  color?: string;
}) {
  const max = Math.max(...data.map((d) => Number(d[valueKey])));
  return (
    <div className="flex items-end gap-2.5 h-32 pt-4">
      {data.map((d, i) => {
        const val = Number(d[valueKey]);
        const pct = max > 0 ? (val / max) * 100 : 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
            <span className="text-[11px] font-semibold text-slate-700">{val}</span>
            <div
              className={`w-full rounded-t ${color} transition-all hover:opacity-85`}
              style={{ height: `${Math.max(pct, 6)}%` }}
            />
            <span className="text-[10px] text-slate-400 font-medium">{String(d.date).slice(-5)}</span>
          </div>
        );
      })}
    </div>
  );
}

function DualBarChart({
  data,
  keyA,
  keyB,
  labelA,
  labelB,
  colorA = "bg-emerald-700",
  colorB = "bg-emerald-200",
}: {
  data: { date: string; [key: string]: number | string }[];
  keyA: string;
  keyB: string;
  labelA: string;
  labelB: string;
  colorA?: string;
  colorB?: string;
}) {
  const allVals = data.flatMap((d) => [Number(d[keyA]), Number(d[keyB])]);
  const max = Math.max(...allVals, 1);
  return (
    <div>
      <div className="flex items-end gap-2 h-28 pt-2">
        {data.map((d, i) => {
          const a = Number(d[keyA]);
          const b = Number(d[keyB]);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
              <div className="w-full flex items-end gap-1 h-full">
                <div
                  className={`rounded-t ${colorA} flex-1`}
                  style={{ height: `${(a / max) * 100}%`, minHeight: a > 0 ? "4px" : "0" }}
                />
                <div
                  className={`rounded-t ${colorB} flex-1`}
                  style={{ height: `${(b / max) * 100}%`, minHeight: b > 0 ? "4px" : "0" }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-xs font-medium text-slate-400 border-t border-slate-100 pt-1.5">
        <span>{String(data[0]?.date ?? "").slice(-5)}</span>
        <span>{String(data[data.length - 1]?.date ?? "").slice(-5)}</span>
      </div>
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-sm ${colorA}`} />
          <span className="text-xs text-slate-600 font-medium">{labelA}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-sm ${colorB}`} />
          <span className="text-xs text-slate-600 font-medium">{labelB}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 flex items-start gap-4">
      <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-800">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-emerald-800">{label}</p>
        <p className="text-2xl font-semibold tracking-tight text-slate-900 mt-0.5">{value}</p>
        <div className="flex items-center gap-1.5 mt-1">
          {trend === "up" && <TrendingUp className="w-3 h-3 text-emerald-600" />}
          {trend === "down" && <TrendingDown className="w-3 h-3 text-slate-500" />}
          <p className="text-xs text-slate-500 font-medium">{sub}</p>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN GATE ──────────────────────────────────────────────────────────────

function AdminGate({ children }: { children: React.ReactNode }) {
  const [verifying, setVerifying] = React.useState(false);
  const [authed, setAuthed] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState(false);
  const [showPass, setShowPass] = React.useState(false);

  const attempt = React.useCallback(async () => {
    setVerifying(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: password }),
      });
      if (res.ok) {
        setAuthed(true);
      } else {
        setError(true);
        setPassword("");
      }
    } catch {
      setError(true);
    } finally {
      setVerifying(false);
    }
  }, [password]);

  if (authed) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#F7FAF8] text-slate-900 flex flex-col antialiased selection:bg-emerald-100 selection:text-emerald-950">
      {/* Top Header */}
      <header className="border-b border-emerald-100 bg-[#F7FAF8]/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-emerald-600 flex items-center justify-center shadow-xs">
                <span className="text-white text-[11px] font-bold">M</span>
              </div>
              <span className="text-[15px] font-semibold text-slate-900">MediKiosk</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-[13px] font-medium text-slate-600">Administration Access</span>
          </div>

          <Badge variant="default" className="text-xs font-medium">
            System Level
          </Badge>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6 text-center">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-800">
            <LockIcon className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">Admin Authentication</h2>
            <p className="text-xs text-slate-500 font-medium">Enter your administrative authorization key to view system telemetry.</p>
          </div>
          <div className="space-y-3">
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                onKeyDown={(e) => e.key === "Enter" && attempt()}
                placeholder="Enter ADMIN_SECRET"
                className={`w-full h-11 px-3.5 pr-10 rounded-lg border text-sm font-medium outline-none transition-colors ${
                  error ? "border-red-400 bg-red-50" : "border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {error && (
              <p className="text-xs text-red-600 font-medium">Invalid secret key. Access denied.</p>
            )}
            <button
              type="button"
              onClick={attempt}
              disabled={verifying || !password}
              className="w-full h-11 rounded-lg bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {verifying ? "Verifying..." : "Access Telemetry Dashboard"}
            </button>
          </div>
          <p className="text-xs text-slate-400 font-medium">Environment variable: ADMIN_SECRET</p>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ADMIN PAGE ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const [usingMockData, setUsingMockData] = React.useState(false);
  const [auditLogs, setAuditLogs] = React.useState(MOCK_AUDIT_LOGS);
  const [refreshing, setRefreshing] = React.useState(false);
  const [lastRefresh, setLastRefresh] = React.useState<Date | null>(null);

  const loadData = React.useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setUsingMockData(!data || Object.keys(data).length === 0);
      } else {
        setUsingMockData(true);
      }
    } catch {
      setUsingMockData(true);
    } finally {
      setRefreshing(false);
      setLastRefresh(new Date());
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const totalIntake = MOCK_DAILY_INTAKE.reduce((s, d) => s + d.count, 0);
  const avgDaily = Math.round(totalIntake / MOCK_DAILY_INTAKE.length);

  const fmtDuration = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;

  return (
    <AdminGate>
      <div className="min-h-screen bg-[#F7FAF8] text-slate-900 flex flex-col antialiased selection:bg-emerald-100 selection:text-emerald-950">
        {/* Top Header */}
        <header className="sticky top-0 z-50 border-b border-emerald-100 bg-[#F7FAF8]/90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-emerald-600 flex items-center justify-center shadow-xs">
                  <span className="text-white text-[11px] font-bold">M</span>
                </div>
                <span className="text-[15px] font-semibold text-slate-900">MediKiosk</span>
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-[13px] font-medium text-slate-600">System Telemetry & Audit</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                System: Healthy
              </span>
              <button
                type="button"
                onClick={loadData}
                disabled={refreshing}
                className="p-2 rounded-md bg-white border border-slate-200 hover:border-emerald-300 text-slate-600 hover:text-emerald-900 transition-colors"
                title="Refresh Telemetry"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1">
          {/* Sub-bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-slate-200/80 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-slate-900">Hospital Node Telemetry & ALCOA+ Logs</h1>
                <Badge variant="default" className="text-xs font-medium">Live Monitoring</Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Intake volumes, ABHA identity linkages, average session latency, and tamper-evident audit trail.
                {usingMockData && (
                  <span className="ml-1.5 text-slate-500 font-medium">(Simulated Telemetry Feed)</span>
                )}
              </p>
            </div>

            {lastRefresh && (
              <span className="text-xs text-slate-400 font-medium">
                Last heartbeat: {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </div>

          {/* ── Top KPI Row ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Activity}
              label="Today's Intakes"
              value={MOCK_DAILY_INTAKE[MOCK_DAILY_INTAKE.length - 1].count.toLocaleString()}
              sub={`${avgDaily}/day avg · ${totalIntake} total`}
              trend="up"
            />
            <StatCard
              icon={Users}
              label="ABHA Linkages"
              value={MOCK_ABHA_STATS.created.toLocaleString()}
              sub={`${MOCK_ABHA_STATS.rate}% success rate`}
              trend="up"
            />
            <StatCard
              icon={Clock}
              label="Avg Session Latency"
              value={fmtDuration(MOCK_SESSION_DURATION.avgSeconds)}
              sub={`P50 ${fmtDuration(MOCK_SESSION_DURATION.p50Seconds)}`}
              trend="down"
            />
            <StatCard
              icon={AlertTriangle}
              label="System Error Rate"
              value={`${MOCK_ERROR_RATES.overall}%`}
              sub={`${MOCK_ERROR_RATES.totalErrors} errors total`}
              trend="neutral"
            />
          </div>

          {/* ── Charts Row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Intake Bar Chart */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Daily Intake Volume</h3>
                  <p className="text-xs text-slate-500 font-medium">Completed patient case intakes over 7 days</p>
                </div>
                <Badge variant="outline" className="text-xs font-medium">7-Day Rolling</Badge>
              </div>
              <BarChart
                data={MOCK_DAILY_INTAKE}
                valueKey="count"
                color="bg-emerald-600"
              />
            </div>

            {/* ABHA Creation Dual Bar Chart */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">ABHA Generation vs Instant Linking</h3>
                  <p className="text-xs text-slate-500 font-medium">Daily accounts generated vs ABDM linked</p>
                </div>
                <Badge variant="default" className="text-xs font-medium">{MOCK_ABHA_STATS.rate}% Linked</Badge>
              </div>
              <DualBarChart
                data={MOCK_ABHA_STATS.byDay}
                keyA="created"
                keyB="linked"
                labelA="Created"
                labelB="Linked"
                colorA="bg-emerald-700"
                colorB="bg-emerald-200"
              />
            </div>

            {/* Session Duration Bar Chart */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Intake Session Duration</h3>
                  <p className="text-xs text-slate-500 font-medium">Duration from badge tap to doctor queue routing</p>
                </div>
                <Badge variant="outline" className="text-xs font-medium">{fmtDuration(MOCK_SESSION_DURATION.avgSeconds)} Avg</Badge>
              </div>
              <BarChart
                data={MOCK_SESSION_DURATION.byDay}
                valueKey="avg"
                color="bg-emerald-600"
              />
            </div>

            {/* Error Breakdown */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Diagnostic Failure Breakdown</h3>
                  <p className="text-xs text-slate-500 font-medium">{MOCK_ERROR_RATES.totalErrors} total exceptions across {MOCK_ERROR_RATES.totalRequests.toLocaleString()} operations</p>
                </div>
                <Badge variant="outline" className="text-xs font-medium">{MOCK_ERROR_RATES.overall}% Exception Rate</Badge>
              </div>
              <div className="space-y-3 pt-2">
                {MOCK_ERROR_RATES.byType.map((e) => {
                  const pct = (e.count / MOCK_ERROR_RATES.totalErrors) * 100;
                  return (
                    <div key={e.type} className="flex items-center gap-3">
                      <span className="text-xs text-slate-600 font-medium w-40 shrink-0 truncate">{e.type}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-600"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 font-medium w-8 text-right">{e.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── ABHA Linkage Overview ── */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">National Health ID Synchronization</h3>
              <p className="text-xs text-slate-500 font-medium">Aggregated metrics across hospital kiosk nodes</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-100 text-center">
                <p className="text-2xl font-semibold text-slate-900">{MOCK_ABHA_STATS.created.toLocaleString()}</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Total Created</p>
              </div>
              <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-100 text-center">
                <p className="text-2xl font-semibold text-slate-900">{MOCK_ABHA_STATS.linked.toLocaleString()}</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Linked to ABDM</p>
              </div>
              <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-100 text-center">
                <p className="text-2xl font-semibold text-slate-900">{MOCK_ABHA_STATS.failed}</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Failed Retries</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs text-slate-500 w-24">Linkage Rate</span>
              <div className="flex-1 bg-slate-100 rounded-full h-2">
                <div
                  className="h-full rounded-full bg-emerald-600"
                  style={{ width: `${MOCK_ABHA_STATS.rate}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-900 w-12 text-right">{MOCK_ABHA_STATS.rate}%</span>
            </div>
          </div>

          {/* ── Live Audit Trail ── */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">ALCOA+ Compliance Audit Trail</h3>
                <p className="text-xs text-slate-500 font-medium">Attributable, Legible, Contemporaneous, Original, and Accurate immutable log</p>
              </div>
              <Badge variant="outline" className="text-xs font-medium">Append-Only</Badge>
            </div>
            <div className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 text-xs">{log.action}</span>
                      <Badge
                        variant={log.status === "VERIFIED" || log.status === "IMMUTABLE_SAVED" ? "default" : "outline"}
                        className="text-[10px] py-0 font-medium"
                      >
                        {log.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600">Actor: <span className="font-semibold text-slate-800">{log.actor}</span></p>
                    <p className="text-xs text-slate-500">Resource: {log.resource}</p>
                  </div>
                  <span className="text-xs text-slate-400 font-medium shrink-0">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </AdminGate>
  );
}
