"use client";

import * as React from "react";
import { Activity, Phone, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchEmergencyAlertsFromSupabase } from "@/lib/supabase/db";
import { createClient } from "@/lib/supabase/client";

export default function TriagePage() {
  const [alerts, setAlerts] = React.useState<any[]>([]);
  const [isRealtime, setIsRealtime] = React.useState(false);

  const loadAlerts = React.useCallback(async () => {
    const remote = await fetchEmergencyAlertsFromSupabase();
    if (remote) {
      setAlerts(remote);
    }
  }, []);

  React.useEffect(() => {
    loadAlerts();

    const pollInterval = setInterval(loadAlerts, 3000);

    try {
      const supabase = createClient();
      const channel = supabase
        .channel("triage_live_emergencies")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "visits" },
          () => {
            loadAlerts();
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setIsRealtime(true);
          }
        });

      return () => {
        clearInterval(pollInterval);
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn("Triage realtime error:", err);
      return () => clearInterval(pollInterval);
    }
  }, [loadAlerts]);

  return (
    <div className="flex-1 flex flex-col bg-[#F7FAF8] text-slate-900 antialiased min-h-screen selection:bg-emerald-100 selection:text-emerald-950">
      {/* Top Bar matching landing page */}
      <header className="sticky top-0 z-50 border-b border-emerald-100 bg-[#F7FAF8]/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-emerald-600 flex items-center justify-center shadow-xs">
                <span className="text-white text-[11px] font-bold">M</span>
              </div>
              <span className="text-[15px] font-semibold text-slate-900">MediKiosk</span>
            </a>
            <span className="text-slate-300">/</span>
            <span className="text-[13px] font-medium text-slate-600">
              <span className="hidden sm:inline">Emergency Triage</span>
              <span className="sm:hidden font-semibold">Triage</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/doctor"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-950 hover:text-emerald-800 transition px-3 py-1.5 rounded-md border border-emerald-200 hover:border-emerald-300 bg-white shadow-xs"
            >
              <span className="hidden sm:inline">Doctor Workspace</span>
              <span className="sm:hidden font-semibold">Doctor</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Top Clinical Banner */}
        <section className="rounded-xl border border-red-200/80 bg-red-50/60 p-4 sm:p-6 lg:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-md bg-red-600 text-white flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
                    Emergency Triage Monitor
                  </h1>
                  <Badge variant="danger" className="text-xs font-medium">
                    Red-Flag Auto-Detection
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Realtime automated clinical alerts dispatched directly from self-service Kiosk terminals
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-center">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                {isRealtime ? "PostgreSQL Realtime Connected" : "Stream Active"}
              </span>
            </div>
          </div>
        </section>

        {/* Priority Emergency Queue */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Active Red-Flag Priority Alerts
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Sorted by severity and arrival time
            </span>
          </div>

          {alerts.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <Activity className="w-10 h-10 text-emerald-600 mx-auto opacity-40" />
              <h3 className="text-base font-bold text-slate-800">No Active Emergency Red Flags</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                When patients reporting high-severity symptoms (acute chest pain, severe dyspnoea, altered consciousness) complete intake at the Kiosk, emergency alerts will trigger here in real-time.
              </p>
            </div>
          ) : (
            alerts.map((alertItem) => (
              <article
                key={alertItem.id}
                className="p-4 sm:p-6 rounded-xl border border-red-200 bg-white hover:border-red-300 transition shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-700 font-bold text-base shrink-0">
                    {alertItem.token}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-slate-900">
                        {alertItem.patientName}
                      </h3>
                      <span className="text-sm font-medium text-slate-500">
                        ({alertItem.age}y / {alertItem.gender})
                      </span>
                      <Badge variant="danger" className="text-xs">
                        {alertItem.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {alertItem.symptom}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium pt-1">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        Detected: {alertItem.time}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Assigned: {alertItem.assignedBay}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <Button
                    variant="danger"
                    size="md"
                    onClick={() => alert("Notified cardiology emergency resuscitation team!")}
                    className="w-full md:w-auto font-semibold"
                  >
                    <Phone className="w-4 h-4 mr-2" aria-hidden="true" />
                    Alert Resuscitation Team
                  </Button>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}