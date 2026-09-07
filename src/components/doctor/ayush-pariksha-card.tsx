import * as React from "react";
import { Flame, Wind, Droplets, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

export interface AyushParikshaCardProps {
  assessment: {
    prakriti: string;
    agni: string;
    koshtha: string;
    sattva: string;
    aharaHabits?: string;
    viharaHabits?: string;
  };
  className?: string;
}

export const AyushParikshaCard: React.FC<AyushParikshaCardProps> = ({
  assessment,
  className
}) => {
  return (
    <div className={cn("bg-white rounded-xl border border-slate-200 p-6 space-y-5", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center text-xs font-bold">
            DP
          </div>
          <div>
            <h3 className="text-[15px] font-semibold tracking-tight text-slate-900">Dashavidha Pariksha Profile</h3>
            <p className="text-xs text-slate-500 font-normal">Ayurvedic constitutional & metabolic clinical intake</p>
          </div>
        </div>
        <Badge variant="vedic" className="text-xs font-medium">
          AIIA Protocol
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Prakriti */}
        <div className="p-3 bg-emerald-50/30 rounded-lg border border-emerald-100">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
            <Wind className="w-3.5 h-3.5 text-emerald-700" />
            <span>Prakriti (Dosha)</span>
          </div>
          <p className="text-sm font-semibold text-slate-900 mt-1">{assessment.prakriti || "Vata-Pitta"}</p>
        </div>

        {/* Agni */}
        <div className="p-3 bg-emerald-50/30 rounded-lg border border-emerald-100">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>Agni (Digestion)</span>
          </div>
          <p className="text-sm font-semibold text-slate-900 mt-1">{assessment.agni || "Tikshna Agni"}</p>
        </div>

        {/* Koshtha */}
        <div className="p-3 bg-emerald-50/30 rounded-lg border border-emerald-100">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
            <Droplets className="w-3.5 h-3.5 text-teal-600" />
            <span>Koshtha (Bowel)</span>
          </div>
          <p className="text-sm font-semibold text-slate-900 mt-1">{assessment.koshtha || "Madhyama"}</p>
        </div>

        {/* Sattva */}
        <div className="p-3 bg-emerald-50/30 rounded-lg border border-emerald-100">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Sattva (Mental)</span>
          </div>
          <p className="text-sm font-semibold text-slate-900 mt-1">{assessment.sattva || "Pravara"}</p>
        </div>
      </div>

      {/* Ahara & Vihara Routine */}
      <div className="p-3.5 bg-emerald-50/20 rounded-lg border border-emerald-100 text-xs space-y-1">
        <p className="leading-relaxed">
          <span className="font-semibold text-slate-700">Ahara (Diet): </span>
          <span className="text-slate-600">{assessment.aharaHabits || "Vegetarian, moderate spices, regular timing."}</span>
        </p>
        <p className="leading-relaxed">
          <span className="font-semibold text-slate-700">Vihara (Lifestyle): </span>
          <span className="text-slate-600">{assessment.viharaHabits || "6-7 hours sleep, moderate physical activity."}</span>
        </p>
      </div>
    </div>
  );
};
