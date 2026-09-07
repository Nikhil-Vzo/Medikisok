import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface StepItem {
  id: string;
  label: string;
  labelHindi?: string;
}

export interface ProgressStepsProps {
  steps: StepItem[];
  currentStepIndex: number;
  className?: string;
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({
  steps,
  currentStepIndex,
  className
}) => {
  const stepCount = steps.length;
  // Calculate center offset for the connecting line between the first and last circles
  const halfStepPercent = stepCount > 0 ? 100 / (stepCount * 2) : 10;
  const progressRatio = stepCount > 1 ? Math.min(1, Math.max(0, currentStepIndex / (stepCount - 1))) : 0;
  const activeLineWidth = `calc((100% - (${halfStepPercent * 2}%)) * ${progressRatio})`;

  return (
    <nav aria-label="Progress" className={cn("w-full py-2", className)}>
      <div className="relative w-full">
        {/* Background track line: connects centers of first and last step circles */}
        <div
          className="absolute top-4 sm:top-[18px] h-1 bg-emerald-100 -translate-y-1/2 z-0 rounded-full"
          style={{
            left: `${halfStepPercent}%`,
            right: `${halfStepPercent}%`,
          }}
        />

        {/* Active leaf-green progress line */}
        <div
          className="absolute top-4 sm:top-[18px] h-1 bg-emerald-500 -translate-y-1/2 z-0 rounded-full transition-all duration-500 ease-out"
          style={{
            left: `${halfStepPercent}%`,
            width: activeLineWidth,
          }}
        />

        {/* Steps List: in normal flex flow so text never overflows or gets clipped */}
        <ol className="flex items-start justify-between relative w-full z-10">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <li
                key={step.id}
                className="flex-1 flex flex-col items-center text-center px-1 group"
              >
                {/* Step Circle */}
                <div
                  className={cn(
                    "w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 shrink-0",
                    isCompleted
                      ? "bg-emerald-500 text-white shadow-xs ring-2 ring-emerald-200"
                      : isCurrent
                      ? "bg-emerald-50 text-emerald-800 border-2 border-emerald-500 shadow-xs ring-4 ring-emerald-100"
                      : "bg-white text-slate-400 border border-emerald-200/80"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                {/* Step Labels: normal flow with clear line heights and no clipping */}
                <div className="mt-2.5 flex flex-col items-center text-center max-w-[120px]">
                  <span
                    className={cn(
                      "text-xs font-semibold tracking-tight transition-colors leading-tight",
                      isCurrent
                        ? "text-emerald-950 font-bold"
                        : isCompleted
                        ? "text-emerald-800"
                        : "text-slate-400"
                    )}
                  >
                    {step.label}
                  </span>
                  {step.labelHindi && (
                    <span
                      className={cn(
                        "text-[11px] font-medium mt-0.5 leading-tight transition-colors",
                        isCurrent
                          ? "text-emerald-700 font-semibold"
                          : isCompleted
                          ? "text-emerald-600 font-medium"
                          : "text-slate-400"
                      )}
                    >
                      {step.labelHindi}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};
