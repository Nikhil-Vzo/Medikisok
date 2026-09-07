"use client";

import * as React from "react";
import { Mic, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";

/**
 * AnimatedTerminal — Live kiosk-to-doctor case delivery preview
 * Plays once on mount, replays every 12s
 */

const SCRIPT = [
  { type: "patient", text: "मुझे 3 दिन से सीने के बीच में दबाव और दर्द है।", delay: 600 },
  { type: "patient", text: "बाएं हाथ तक भी फैलता है, चलने पर बढ़ जाता है।", delay: 2200 },
  { type: "ai", text: "SOCRATES: Onset gradual · Radiates to L arm · Worse on exertion", delay: 4200 },
  { type: "vitals", label: "Vitals", value: "BP 142/92 · HR 96 · SpO₂ 95%", delay: 5500 },
  { type: "alert", label: "Red Flag", value: "ACS probable — triage immediately", delay: 6800 },
  { type: "delivered", text: "Case delivered to Dr. Sharma", delay: 8500 },
];

export function AnimatedTerminal() {
  const [step, setStep] = React.useState(0);
  const [typed, setTyped] = React.useState("");

  React.useEffect(() => {
    if (step >= SCRIPT.length) {
      // Loop: pause then restart
      const t = setTimeout(() => {
        setStep(0);
        setTyped("");
      }, 3500);
      return () => clearTimeout(t);
    }

    const item = SCRIPT[step];

    // Trigger step at its delay
    const startTimer = setTimeout(() => {
      // typewriter for text lines
      if (item.type === "patient" || item.type === "ai" || item.type === "delivered") {
        const full = item.text ?? "";
        let i = 0;
        setTyped("");
        const tw = setInterval(() => {
          i++;
          setTyped(full.slice(0, i));
          if (i >= full.length) clearInterval(tw);
        }, 28);
        // advance after typing + a beat
        const advance = setTimeout(() => setStep(s => s + 1), full.length * 28 + 900);
        return () => {
          clearInterval(tw);
          clearTimeout(advance);
        };
      } else {
        // vitals / alert — advance after a beat
        const advance = setTimeout(() => setStep(s => s + 1), 1200);
        return () => clearTimeout(advance);
      }
    }, step === 0 ? 400 : item.delay - SCRIPT[step - 1].delay);

    return () => clearTimeout(startTimer);
  }, [step]);

  const current = SCRIPT[step];

  return (
    <div className="rounded-xl border border-emerald-100 bg-white shadow-xs overflow-hidden">
      {/* Terminal header */}
      <div className="flex items-center justify-between px-4 h-9 border-b border-emerald-100 bg-emerald-50/60">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
        </div>
        <div className="text-xs font-semibold text-emerald-900">
          Kiosk Live Stream · Token #42
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span className="text-[11px] font-medium text-emerald-800">Live Intake</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-3 min-h-[340px] text-sm">
        {/* Patient turns */}
        {SCRIPT.slice(0, step + 1).map((s, i) => {
          if (i < step) {
            // Fully rendered
            return renderLine(s, "", false);
          }
          // Active line
          return renderLine(s, typed, true);
        })}

        {/* Cursor on active text line */}
        {current && (current.type === "patient" || current.type === "ai" || current.type === "delivered") && (
          <span className="inline-block w-1.5 h-3.5 bg-emerald-700 ml-0.5 align-middle animate-pulse" />
        )}
      </div>

      {/* Footer: status bar */}
      <div className="flex items-center justify-between px-4 h-8 border-t border-emerald-100 bg-emerald-50/40 text-xs text-emerald-900">
        <span className="font-medium">Bhashini AI · Hindi to English</span>
        <span className="font-semibold text-emerald-700">{step >= SCRIPT.length ? "Delivered to Doctor" : "Processing Audio"}</span>
      </div>
    </div>
  );
}

function renderLine(s: typeof SCRIPT[number], typed: string, active: boolean) {
  const textVal = s.text ?? "";
  if (s.type === "patient") {
    return (
      <div key={`p-${textVal.slice(0, 8)}`} className="flex items-start gap-2">
        <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
          <Mic className="w-3 h-3 text-emerald-700" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold text-emerald-800 mb-0.5">Patient Voice</div>
          <div className="text-slate-800 leading-relaxed font-medium">
            {active ? typed : textVal}
          </div>
        </div>
      </div>
    );
  }
  if (s.type === "ai") {
    return (
      <div key={`a-${textVal.slice(0, 8)}`} className="flex items-start gap-2">
        <div className="w-6 h-6 rounded-full bg-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
          <FileText className="w-3 h-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold text-emerald-800 mb-0.5">Clinical Structuring</div>
          <div className="text-slate-700 leading-relaxed">
            {active ? typed : textVal}
          </div>
        </div>
      </div>
    );
  }
  if (s.type === "vitals") {
    return (
      <div key="v" className="flex items-start gap-2 pl-8">
        <div className="text-xs text-emerald-800 font-semibold mb-0.5 mr-2">Vitals</div>
        <div className="text-slate-900 font-semibold leading-relaxed">
          BP 142/92 · HR 96 · SpO₂ 95%
        </div>
      </div>
    );
  }
  if (s.type === "alert") {
    return (
      <div key="al" className="flex items-start gap-2 pl-8">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-50 border border-red-200">
          <AlertTriangle className="w-3 h-3 text-red-600" />
          <div className="text-xs text-red-600 font-semibold">Red Flag</div>
          <div className="text-red-900 font-semibold text-xs">
            ACS probable — triage
          </div>
        </div>
      </div>
    );
  }
  if (s.type === "delivered") {
    return (
      <div key="d" className="flex items-start gap-2 pt-2 border-t border-slate-100">
        <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-emerald-700 font-semibold mb-0.5">Delivered · 12s</div>
          <div className="text-emerald-900 font-semibold leading-relaxed">
            {active ? typed : s.text}
          </div>
        </div>
      </div>
    );
  }
  return null;
}
