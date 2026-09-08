import * as React from "react";
import { AlertTriangle, AlertCircle, CheckCircle2, BookOpen, ExternalLink, Activity } from "lucide-react";
import { ClinicalSuggestion } from "@/types/clinical";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

export interface SuggestionAlertsProps {
  suggestions: ClinicalSuggestion[];
  className?: string;
}

export const SuggestionAlerts: React.FC<SuggestionAlertsProps> = ({
  suggestions,
  className
}) => {
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className={cn("p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-500 text-sm", className)}>
        <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
        <p className="font-semibold text-slate-800">No Drug Interactions or Abnormal Flags Detected</p>
        <p className="text-xs text-slate-500 mt-0.5">Scanned records and current symptoms appear within standard baselines.</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-700" />
          <h4 className="text-[14px] font-semibold text-slate-900">Clinical Decision Support</h4>
        </div>
        <span className="text-[11px] font-medium text-slate-400">
          Physician Verification Required
        </span>
      </div>

      <div className="space-y-3">
        {suggestions.map((sug) => {
          const isCritical = sug.severity === "critical" || sug.type === "redflag";
          const isWarning = sug.severity === "high" || sug.type === "interaction";

          return (
            <div
              key={sug.id}
              className={cn(
                "p-4 sm:p-5 rounded-xl border transition-all space-y-2",
                isCritical
                  ? "bg-red-50/90 border-red-300 text-red-950 "
                  : isWarning
                  ? "bg-amber-50/90 border-amber-300 text-amber-950"
                  : "bg-slate-50/80 border-slate-200 text-slate-950"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {isCritical ? (
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  )}
                  <h5 className="text-sm font-bold tracking-tight">{sug.title}</h5>
                </div>
                <Badge variant={isCritical ? "danger" : isWarning ? "warning" : "ayush"} className="text-[10px] py-0">
                  {Math.round(sug.confidenceScore * 100)}% Conf.
                </Badge>
              </div>

              <p className="text-xs leading-relaxed opacity-95 pl-7">{sug.description}</p>

              {sug.citedSource && (
                <div className="flex items-center gap-1.5 pl-7 pt-1 text-[11px] font-medium opacity-75">
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Source: {sug.citedSource}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
