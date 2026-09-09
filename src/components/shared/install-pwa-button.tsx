"use client";

import * as React from "react";
import { Download, Check, Smartphone, Monitor, X, Share2, PlusSquare } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface InstallPwaButtonProps {
  variant?: "hero" | "nav" | "banner" | "footer";
  className?: string;
}

export function InstallPwaButton({ variant = "hero", className }: InstallPwaButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [isInstalled, setIsInstalled] = React.useState(false);
  const [isIos, setIsIos] = React.useState(false);
  const [showIosModal, setShowIosModal] = React.useState(false);
  const [justInstalled, setJustInstalled] = React.useState(false);

  React.useEffect(() => {
    // Check if already in standalone mode
    if (typeof window !== "undefined") {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://");

      if (isStandalone) {
        setIsInstalled(true);
      }

      // Detect iOS Safari
      const ua = window.navigator.userAgent;
      const isIosDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
      setIsIos(isIosDevice);

      // Capture PWA beforeinstallprompt event
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };

      const handleAppInstalled = () => {
        setIsInstalled(true);
        setJustInstalled(true);
        setDeferredPrompt(null);
        setTimeout(() => setJustInstalled(false), 5000);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.addEventListener("appinstalled", handleAppInstalled);

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (isInstalled) return;

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
        setJustInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosModal(true);
    } else {
      // Fallback for desktop Chrome/Edge where prompt may not have fired yet
      alert(
        "To install MediKiosk:\n• Desktop: Click the 'Install' icon (⊕) in the right side of your address bar.\n• Mobile: Tap your browser menu (⋮) and choose 'Install App' or 'Add to Home Screen'."
      );
    }
  };

  if (isInstalled && !justInstalled) {
    if (variant === "nav") {
      return (
        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200">
          <Check className="w-3 h-3 text-emerald-600" />
          <span>App Installed</span>
        </span>
      );
    }
    if (variant === "footer") {
      return (
        <span className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-950/50 border border-emerald-500/40 shadow-xs">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>MediKiosk App Installed</span>
        </span>
      );
    }
    return null;
  }

  return (
    <>
      {/* Button Renderers */}
      {variant === "footer" ? (
        <button
          type="button"
          onClick={handleInstallClick}
          aria-label="Download MediKiosk Progressive Web App"
          className={cn(
            "group inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-white text-[#1b3573] hover:bg-blue-50 text-xs font-bold shadow-sm hover:shadow active:scale-[0.98] transition-all duration-150 border border-white/40 cursor-pointer",
            className
          )}
        >
          {justInstalled ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Installed to Device!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-[#1b3573] group-hover:-translate-y-0.5 transition-transform" />
              <span>Download Web App</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                PWA
              </span>
            </>
          )}
        </button>
      ) : variant === "nav" ? (
        <button
          type="button"
          onClick={handleInstallClick}
          title="Install MediKiosk as Web App (PWA)"
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 sm:px-3 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold hover:bg-emerald-100 hover:border-emerald-300 transition-all shadow-2xs active:scale-[0.98]",
            className
          )}
        >
          {justInstalled ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden xs:inline sm:inline">Installed!</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden xs:inline sm:inline">Install App</span>
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleInstallClick}
          className={cn(
            "group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm sm:text-base font-bold shadow-sm hover:shadow-md hover:border-emerald-400 active:scale-[0.98] transition-all duration-150",
            className
          )}
        >
          {justInstalled ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Installed to Device</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-emerald-700 group-hover:-translate-y-0.5 transition-transform" />
              <span>Download Web App</span>
              <span className="hidden sm:inline-block ml-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                PWA
              </span>
            </>
          )}
        </button>
      )}

      {/* iOS Instructions Modal */}
      {showIosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                  M
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Install MediKiosk on iOS</h4>
                  <p className="text-[11px] text-slate-500">Add to iPhone / iPad Home Screen</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIosModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Share2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">1. Tap the Share button</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tap the square share icon with an arrow pointing up at the bottom of Safari.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <PlusSquare className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">2. Select &apos;Add to Home Screen&apos;</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Scroll down in the action sheet and tap <strong>Add to Home Screen</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Smartphone className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">3. Launch Fullscreen Kiosk</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tap the MediKiosk app icon on your home screen for standalone kiosk intake.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
