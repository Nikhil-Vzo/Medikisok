import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// Force dynamic rendering — this route queries a live database and must not be cached.
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/stats
 *
 * Returns real usage statistics from Supabase (service-role client).
 * Admin page falls back to mock data when this returns null.
 *
 * Required env vars:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY  (server-only, never exposed to client)
 *
 * Tables queried:
 *   - profiles     → total patients, ABHA creation stats
 *   - visits       → daily intake counts, session duration
 *   - summaries    → draft/approved summary counts
 *   - audit_log    → error breakdown, recent audit events
 */
export async function GET() {
  const supabase = createServerClient();

  // No service role key — return null so admin page falls back to mock data
  if (!supabase) {
    return NextResponse.json(null, { status: 200 });
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  // ── 1. Daily intake counts (last 7 days from visits) ──────────────────────
  let dailyIntake: { date: string; count: number }[] = [];
  let totalIntake = 0;

  try {
    const { data: visitData, error: visitErr } = await supabase
      .from("visits")
      .select("visit_date")
      .gte("visit_date", sevenDaysAgo.toISOString());

    if (!visitErr && visitData) {
      // Group by day (YYYY-MM-DD in IST = Asia/Kolkata)
      const counts: Record<string, number> = {};
      for (const v of visitData) {
        const d = new Date(v.visit_date).toLocaleDateString("en-IN", {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "short",
          day: "2-digit",
        });
        // Use sortable date key
        const key = new Date(v.visit_date).toLocaleDateString("en-CA", {
          timeZone: "Asia/Kolkata",
        }); // YYYY-MM-DD
        counts[key] = (counts[key] || 0) + 1;
      }

      // Fill all 7 days (may be empty if no data yet)
      const days: { date: string; count: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
        days.push({ date: key, count: counts[key] || 0 });
      }
      dailyIntake = days;
      totalIntake = visitData.length;
    }
  } catch (e) {
    console.warn("[admin/stats] visits query failed:", e);
  }

  // ── 2. ABHA stats from profiles ──────────────────────────────────────────
  let abhaStats = {
    created: 0,
    linked: 0, // summaries with status=approved linked to profiles with abha_id
    failed: 0,
    rate: 0,
    byDay: [] as { date: string; created: number; linked: number }[],
  };

  try {
    // Total profiles with ABHA IDs
    const { count: totalAbha } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .not("abha_id", "is", null);

    abhaStats.created = totalAbha || 0;

    // Profiles created in last 7 days with ABHA
    const { data: abhaProfiles } = await supabase
      .from("profiles")
      .select("created_at")
      .not("abha_id", "is", null)
      .gte("created_at", sevenDaysAgo.toISOString());

    if (abhaProfiles) {
      const counts: Record<string, number> = {};
      for (const p of abhaProfiles) {
        const key = new Date(p.created_at).toLocaleDateString("en-CA", {
          timeZone: "Asia/Kolkata",
        });
        counts[key] = (counts[key] || 0) + 1;
      }
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
        const prev = abhaStats.byDay[6 - i] || { date: key, created: 0, linked: 0 };
        abhaStats.byDay.push({
          date: key,
          created: counts[key] || 0,
          linked: 0,
        });
      }
    }

    // Approved summaries where patient has ABHA (proxy for "linked")
    const { count: linkedCount } = await supabase
      .from("summaries")
      .select("*, visits!inner(profiles!inner(abha_id))", { count: "exact", head: true })
      .eq("status", "approved")
      .not("visits.profiles.abha_id", "is", null);

    abhaStats.linked = linkedCount || 0;

    if (abhaStats.created > 0) {
      abhaStats.rate = Math.round((abhaStats.linked / abhaStats.created) * 1000) / 10;
    }

    // Failed: profiles without abha_id (incomplete registrations)
    const { count: failedCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .is("abha_id", null)
      .gte("created_at", sevenDaysAgo.toISOString());

    abhaStats.failed = failedCount || 0;
  } catch (e) {
    console.warn("[admin/stats] abha stats query failed:", e);
  }

  // ── 3. Session duration from visits + summaries ───────────────────────────
  // Duration = time between visit created_at and summary created_at (proxy for session end)
  let sessionDuration = {
    avgSeconds: 0,
    p50Seconds: 0,
    p95Seconds: 0,
    byDay: [] as { date: string; avg: number }[],
  };

  try {
    const { data: sessionData } = await supabase
      .from("visits")
      .select(
        `
        created_at,
        visit_date,
        summaries (created_at)
      `
      )
      .gte("created_at", sevenDaysAgo.toISOString())
      .not("summaries", "is", null);

    if (sessionData && sessionData.length > 0) {
      const durations: number[] = [];
      const byDayAcc: Record<string, number[]> = {};

      for (const v of sessionData) {
        const s = v.summaries as unknown as { created_at: string } | null;
        if (s?.created_at) {
          const start = new Date(v.created_at).getTime();
          const end = new Date(s.created_at).getTime();
          const durSec = Math.max(0, Math.round((end - start) / 1000));
          durations.push(durSec);

          const key = new Date(v.created_at).toLocaleDateString("en-CA", {
            timeZone: "Asia/Kolkata",
          });
          if (!byDayAcc[key]) byDayAcc[key] = [];
          byDayAcc[key].push(durSec);
        }
      }

      if (durations.length > 0) {
        durations.sort((a, b) => a - b);
        sessionDuration.avgSeconds = Math.round(durations.reduce((s, d) => s + d, 0) / durations.length);
        sessionDuration.p50Seconds = durations[Math.floor(durations.length * 0.5)] || 0;
        sessionDuration.p95Seconds = durations[Math.floor(durations.length * 0.95)] || 0;

        // Fill 7 days
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const key = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
          const dayDurations = byDayAcc[key] || [];
          sessionDuration.byDay.push({
            date: key,
            avg: dayDurations.length > 0
              ? Math.round(dayDurations.reduce((s, d) => s + d, 0) / dayDurations.length)
              : 0,
          });
        }
      }
    }

    // If no duration data, fill days with zeros
    if (sessionDuration.byDay.length === 0) {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        sessionDuration.byDay.push({
          date: d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
          avg: 0,
        });
      }
    }
  } catch (e) {
    console.warn("[admin/stats] session duration query failed:", e);
    // Fill with empty days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      sessionDuration.byDay.push({
        date: d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
        avg: 0,
      });
    }
  }

  // ── 4. Error breakdown from audit_log ────────────────────────────────────
  let errorRates = {
    overall: 0,
    totalErrors: 0,
    totalRequests: 0,
    byDay: [] as { date: string; errors: number; requests: number }[],
    byType: [] as { type: string; count: number }[],
  };

  try {
    const { data: auditData } = await supabase
      .from("audit_log")
      .select("action, timestamp, details")
      .gte("timestamp", fourteenDaysAgo.toISOString())
      .order("timestamp", { ascending: false })
      .limit(500);

    if (auditData && auditData.length > 0) {
      // Error actions: any action containing ERROR, FAIL, DENIED, TIMEOUT, EXCEPTION
      const errorPattern = /error|fail|denied|timeout|exception|rejected/i;
      const errorRows = auditData.filter((r) => errorPattern.test(r.action));
      errorRates.totalErrors = errorRows.length;
      errorRates.totalRequests = auditData.length;
      errorRates.overall =
        errorRates.totalRequests > 0
          ? Math.round((errorRates.totalErrors / errorRates.totalRequests) * 1000) / 10
          : 0;

      // Group errors by type
      const errorTypeCounts: Record<string, number> = {};
      for (const r of errorRows) {
        // Normalize action name to a readable type
        const type = r.action.replace(/_/g, " ").replace(/[A-Z]/g, (m: string) => " " + m).trim();
        errorTypeCounts[type] = (errorTypeCounts[type] || 0) + 1;
      }
      errorRates.byType = Object.entries(errorTypeCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      // Errors per day (last 7 days)
      const byDayAcc: Record<string, { errors: number; requests: number }> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
        byDayAcc[key] = { errors: 0, requests: 0 };
      }
      for (const r of auditData) {
        const key = new Date(r.timestamp).toLocaleDateString("en-CA", {
          timeZone: "Asia/Kolkata",
        });
        if (byDayAcc[key]) {
          byDayAcc[key].requests++;
          if (errorPattern.test(r.action)) byDayAcc[key].errors++;
        }
      }
      errorRates.byDay = Object.entries(byDayAcc).map(([date, v]) => ({
        date,
        errors: v.errors,
        requests: v.requests,
      }));
    } else {
      // No audit data — fill 7 empty days
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        errorRates.byDay.push({
          date: d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
          errors: 0,
          requests: 0,
        });
      }
    }
  } catch (e) {
    console.warn("[admin/stats] audit query failed:", e);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      errorRates.byDay.push({
        date: d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
        errors: 0,
        requests: 0,
      });
    }
  }

  // ── 5. Recent audit logs ─────────────────────────────────────────────────
  let auditLogs: {
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    resource: string;
    status: string;
  }[] = [];

  try {
    const { data: logs } = await supabase
      .from("audit_log")
      .select("id, actor_id, action, resource_type, resource_id, timestamp, details")
      .order("timestamp", { ascending: false })
      .limit(20);

    if (logs && logs.length > 0) {
      auditLogs = logs.map((l: any) => {
        let status = "VERIFIED";
        if (l.action.includes("ERROR") || l.action.includes("FAIL")) status = "ERROR";
        else if (l.action.includes("DENIED") || l.action.includes("RLS"))
          status = "RLS_PERMITTED";
        else if (l.action.includes("IMMUTABLE") || l.action.includes("EXTRACTED"))
          status = "IMMUTABLE_SAVED";

        const actorLabel = l.actor_id
          ? `User (${String(l.actor_id).slice(0, 8)}…)`
          : "System / AI Engine";

        return {
          id: String(l.id),
          timestamp: new Date(l.timestamp).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          }),
          actor: actorLabel,
          action: l.action,
          resource: `${l.resource_type}${l.resource_id ? ` (${String(l.resource_id).slice(0, 8)}…)` : ""}`,
          status,
        };
      });
    }
  } catch (e) {
    console.warn("[admin/stats] audit logs query failed:", e);
  }

  // ── Build response ────────────────────────────────────────────────────────
  const stats = {
    dailyIntake,
    totalIntake,
    abhaStats,
    sessionDuration,
    errorRates,
    auditLogs,
    generatedAt: new Date().toISOString(),
  };

  return NextResponse.json(stats, { status: 200 });
}
