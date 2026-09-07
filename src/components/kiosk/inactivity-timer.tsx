"use client";

import * as React from "react";
import { Clock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface InactivityTimerProps {
  timeoutSeconds?: number;
  warningSeconds?: number;
  onTimeout: () => void;
}

export const InactivityTimer: React.FC<InactivityTimerProps> = ({
  timeoutSeconds = 90,
  warningSeconds = 20,
  onTimeout,
}) => {
  const [remainingTime, setRemainingTime] = React.useState(timeoutSeconds);
  const [showWarning, setShowWarning] = React.useState(false);

  const resetTimer = React.useCallback(() => {
    setRemainingTime(timeoutSeconds);
    setShowWarning(false);
  }, [timeoutSeconds]);

  // Listen to user touch / mouse / key events to reset inactivity
  React.useEffect(() => {
    const handleActivity = () => {
      resetTimer();
    };

    window.addEventListener("touchstart", handleActivity);
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);

    return () => {
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
    };
  }, [resetTimer]);

  // Tick countdown
  React.useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeout();
          return 0;
        }
        if (prev - 1 <= warningSeconds) {
          setShowWarning(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [warningSeconds, onTimeout]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-50 bg-emerald-950/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl border border-amber-300">
        <div className="w-16 h-16 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-slate-900">Kya Aap Abhi Bhi Yahan Hain?</h3>
          <p className="text-sm text-slate-600 font-medium">
            (Are you still there? Kiosk will auto-reset in <strong className="text-amber-700 font-bold text-base">{remainingTime}s</strong> to protect your medical privacy).
          </p>
        </div>

        <Button
          variant="primary"
          size="touch"
          onClick={resetTimer}
          className="w-full text-base font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Haan, Main Yahan Hoon (Continue Intake)
        </Button>
      </div>
    </div>
  );
};
