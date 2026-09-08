"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Volume2, ArrowRight, Activity } from "lucide-react";
import { RedFlagRule } from "@/lib/ontologies/red-flags";
import { speak } from "@/lib/voice/bhashini";
import { Button } from "@/components/ui/button";

export interface RedFlagAlertBannerProps {
  /** All triggered red-flag rules for this patient */
  triggeredRules: RedFlagRule[];
  patientName: string;
  patientId: string;
  visitId: string;
  /** Primary UI language code (default 'hi') */
  lang?: "hi" | "en";
  /** Set to true to silence TTS (e.g., on re-render when already announced) */
  silent?: boolean;
}

/**
 * Prominent red-flag triage alert banner for the doctor view.
 */
export const RedFlagAlertBanner: React.FC<RedFlagAlertBannerProps> = ({
  triggeredRules,
  patientName,
  patientId,
  visitId,
  lang = "hi",
  silent = false,
}) => {
  const router = useRouter();
  const [ttsDone, setTtsDone] = React.useState(false);

  // Pick the most critical rule (CRITICAL_IMMEDIATE first) for the TTS message
  const primaryRule = React.useMemo(() => {
    return (
      triggeredRules.find((r) => r.priorityLevel === "CRITICAL_IMMEDIATE") ??
      triggeredRules[0]
    );
  }, [triggeredRules]);

  // TTS: speak the alert on mount
  React.useEffect(() => {
    if (silent || ttsDone || !primaryRule) return;

    const messageHi = `आपातकालीन चेतावनी! मरीज ${patientName} में ${primaryRule.titleHi} पाया गया। कृपया तत्काल ट्रायज पेज पर जाएं।`;
    const messageEn = `Emergency! Patient ${patientName} has a critical red flag: ${primaryRule.titleEn}. Redirect to triage immediately.`;

    const message = lang === "hi" ? messageHi : messageEn;

    speak(message, lang, { rate: 1.0 })
      .then(() => setTtsDone(true))
      .catch((err) => {
        console.warn("[RedFlagAlertBanner] TTS failed:", err);
        setTtsDone(true);
      });
  }, [primaryRule, patientName, lang, silent, ttsDone]);

  const handleRouteToTriage = () => {
    router.push(`/triage?visitId=${visitId}&patientId=${patientId}`);
  };

  if (!triggeredRules || triggeredRules.length === 0) return null;

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 overflow-hidden text-red-950">
      {/* Top strip */}
      <div className="flex items-center justify-between px-5 py-3 bg-red-100/70 border-b border-red-200">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-700" />
          <span className="text-xs font-semibold text-red-800">
            Red Flag Clinical Alert · {patientName} ({patientId})
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!ttsDone ? (
            <span className="flex items-center gap-1 text-xs font-medium text-red-700">
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
              Speaking…
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-medium text-red-600">
              <Volume2 className="w-3.5 h-3.5" />
              Announced
            </span>
          )}
        </div>
      </div>

      {/* Rule cards */}
      <div className="p-4 space-y-2.5">
        {triggeredRules.map((rule) => (
          <div
            key={rule.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-white border border-red-200/80"
          >
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13px] font-semibold text-red-950">{rule.titleEn}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                  {rule.priorityLevel.replace("_", " ")}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">{rule.titleHi}</p>
              <p className="text-xs font-medium text-red-900 mt-1 leading-snug">
                {lang === "hi" ? rule.actionHi : rule.actionEn}
              </p>
            </div>
            <Activity className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          </div>
        ))}
      </div>

      {/* Action footer */}
      <div className="flex items-center justify-end gap-3 px-5 py-3 bg-red-100/40 border-t border-red-200/80">
        <Button
          variant="danger"
          size="sm"
          onClick={handleRouteToTriage}
          className="text-xs font-semibold"
        >
          <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
          Transfer to Emergency Triage
        </Button>
      </div>
    </div>
  );
};
