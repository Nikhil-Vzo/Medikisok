"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";

/* ============================================================
   MEDIKIOSK LANDING MOTION LIBRARY
   Framer-motion primitives + pure-CSS ambient effects.
   Zero external assets — everything renders as vector/CSS.
   ============================================================ */

// ---------- Scroll reveal wrapper ----------
export function Reveal({
  children,
  delay = 0,
  y = 32,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ---------- Animated counter ----------
export function CountUp({
  to,
  suffix = "",
  prefix = "",
  duration = 1600,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = React.useState(0);

  React.useEffect(() => {
    if (!inView) return;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      // easeOutExpo
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setVal(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {val}
      {suffix}
    </span>
  );
}

// ---------- Aurora / mesh gradient backdrop ----------
export function AuroraBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* base wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#04211C] via-[#062B24] to-[#031312]" />
      {/* aurora blobs */}
      <div className="aurora-blob aurora-a" />
      <div className="aurora-blob aurora-b" />
      <div className="aurora-blob aurora-c" />
      {/* grid overlay */}
      <div className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(110,231,183,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(110,231,183,0.25) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 75%)",
        }}
      />
      {/* floating particles */}
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: `${(i * 71) % 100}%`,
            animationDelay: `${i * 1.7}s`,
            animationDuration: `${9 + (i % 5) * 3}s`,
            width: i % 3 === 0 ? "3px" : "2px",
          }}
        />
      ))}
    </div>
  );
}

// ---------- Voice waveform visualizer (CSS bars) ----------
export function VoiceWave({ active = true, className }: { active?: boolean; className?: string }) {
  return (
    <div className={`flex items-end gap-1 h-10 ${className || ""}`} aria-hidden>
      {[0.9, 0.5, 1.1, 0.7, 1.4, 0.6, 1.0, 0.8, 1.2, 0.55, 0.95].map((d, i) => (
        <span
          key={i}
          className={`w-1 rounded-full bg-gradient-to-t from-emerald-600 to-teal-300 ${active ? "" : "!h-1.5 opacity-40"}`}
          style={{
            animation: active ? `voice-wave ${0.7 + d * 0.4}s ease-in-out ${i * 0.09}s infinite` : undefined,
            height: `${8 + d * 16}px`,
          }}
        />
      ))}
    </div>
  );
}

// ---------- ECG heartbeat line (animated SVG dash) ----------
export function EcgLine({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 80" fill="none" className={className} aria-hidden preserveAspectRatio="none">
      <defs>
        <linearGradient id="ecg-glow" x1="0" x2="1">
          <stop offset="0%" stopColor="#34D399" stopOpacity="0" />
          <stop offset="35%" stopColor="#6EE7B7" />
          <stop offset="65%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 40 H120 l14-18 12 36 12-46 14 54 10-26 H280 l14-18 12 36 12-46 14 54 10-26 H460 l14-18 12 36 12-46 14 54 10-26 H600"
        stroke="url(#ecg-glow)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        className="ecg-trace"
        pathLength={1}
      />
    </svg>
  );
}

// ---------- Kiosk device mockup (pure CSS/SVG hero art) ----------
export function KioskMockup() {
  const [scanLine, setScanLine] = React.useState(true);
  React.useEffect(() => {
    const t = setInterval(() => setScanLine((s) => !s), 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotateX: 12 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      className="relative mx-auto w-[320px] sm:w-[380px] [perspective:1200px]"
    >
      {/* glow halo under kiosk */}
      <div className="absolute -inset-x-16 -bottom-10 h-24 bg-emerald-500/25 blur-3xl rounded-full" aria-hidden />

      {/* floating chips */}
      <motion.div
        className="absolute -left-24 top-16 z-20 hidden md:block"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="glass-chip">
          <MicIcon /> <span>हिन्दी में बोलें</span>
        </div>
      </motion.div>
      <motion.div
        className="absolute -right-28 top-40 z-20 hidden md:block"
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <div className="glass-chip">
          <DocIcon /> <span>OCR · Rx Extracted</span>
        </div>
      </motion.div>
      <motion.div
        className="absolute -left-20 bottom-24 z-20 hidden md:block"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <div className="glass-chip accent">
          <ShieldIcon /> <span>DPDP Verified</span>
        </div>
      </motion.div>

      {/* device frame */}
      <div className="relative rounded-[2rem] border border-emerald-400/20 bg-gradient-to-b from-emerald-900/90 to-emerald-950/95 shadow-[0_40px_80px_-20px_rgba(4,33,28,0.7)] p-3 backdrop-blur">
        {/* screen */}
        <div className="relative overflow-hidden rounded-[1.4rem] bg-gradient-to-br from-[#052E26] to-[#031A17] aspect-[3/4.2] p-5 flex flex-col">
          {/* scan sweep */}
          <div
            className={`pointer-events-none absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-emerald-400/15 to-transparent ${scanLine ? "screen-scan" : "opacity-0"} transition-opacity`}
            aria-hidden
          />
          {/* status bar */}
          <div className="flex items-center justify-between text-[9px] font-semibold text-emerald-200/80">
            <span>AIIA OPD · Room 3</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Live
            </span>
          </div>

          {/* patient avatar + greeting */}
          <div className="mt-5 flex flex-col items-center text-center gap-3">
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 p-[2px]">
              <div className="w-full h-full rounded-full bg-[#05231E] flex items-center justify-center text-xl font-bold text-emerald-300">
                क
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-400 border-4 border-[#05231E]" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">नमस्ते, कमला देवी जी</p>
              <p className="text-emerald-300/80 text-xs mt-0.5">ABHA Verified (xxxx-2041)</p>
            </div>
          </div>

          {/* question card */}
          <div className="mt-5 rounded-xl bg-white/[0.06] border border-white/10 p-4 space-y-3">
            <p className="text-xs text-emerald-400 font-semibold">Question 3 of 8</p>
            <p className="text-white text-xs leading-relaxed font-medium">
              दर्द का रूप कैसा है — दबाव, चुभन, या जलन?
            </p>
            <VoiceWave />
            <div className="grid grid-cols-3 gap-2 pt-1">
              {["दबाव", "चुभन", "जलन"].map((o, i) => (
                <div
                  key={o}
                  className={`rounded-lg py-2 text-center text-xs font-semibold ${
                    i === 0
                      ? "bg-emerald-600 text-white shadow-[0_0_18px_rgba(52,211,153,0.5)]"
                      : "bg-white/5 text-emerald-100/70"
                  }`}
                >
                  {o}
                </div>
              ))}
            </div>
          </div>

          {/* progress */}
          <div className="mt-auto space-y-2">
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-400"
                initial={{ width: "8%" }}
                animate={{ width: ["8%", "42%", "42%"] }}
                transition={{ duration: 5, times: [0, 0.6, 1], repeat: Infinity, repeatDelay: 1.5 }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-medium text-emerald-200/60">
              <span>1. Identity</span><span>2. Consent</span><span>3. Intake</span><span>4. Records</span><span>5. Review</span>
            </div>
          </div>
        </div>
      </div>

      {/* stand */}
      <div className="mx-auto w-24 h-10 bg-gradient-to-b from-emerald-900 to-emerald-950 [clip-path:polygon(15%_0,85%_0,100%_100%,0_100%)]" />
      <div className="mx-auto w-44 h-2.5 rounded-full bg-emerald-950/70 shadow-[0_10px_30px_rgba(4,33,28,0.6)]" />
    </motion.div>
  );
}

function MicIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 19v3"/></svg>
  );
}
function DocIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  );
}
