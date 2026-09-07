import * as React from "react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ChoiceCardProps {
  id: string;
  labelEn: string;
  labelHi: string;
  descriptionEn?: string;
  descriptionHi?: string;
  iconName?: string;
  isSelected?: boolean;
  isRedFlag?: boolean;
  onClick: () => void;
  className?: string;
}

export const ChoiceCard: React.FC<ChoiceCardProps> = ({
  labelEn,
  labelHi,
  descriptionEn,
  descriptionHi,
  iconName = "Activity",
  isSelected = false,
  isRedFlag = false,
  onClick,
  className
}) => {
  // Dynamically resolve Lucide Vector Icon safely
  const IconComponent = (Icons as any)[iconName] || Icons.Activity;

  return (
    <button
      onClick={onClick}
      role="radio"
      aria-checked={isSelected}
      className={cn(
        "group relative flex items-center p-5 rounded-xl border text-left transition-all duration-150 focus:outline-none min-h-[92px] w-full select-none active:scale-[0.99]",
        isSelected
          ? isRedFlag
            ? "border-red-600 bg-red-50/80 text-red-950 ring-2 ring-red-600/10"
            : "border-emerald-600 bg-emerald-50/60 text-emerald-950 ring-2 ring-emerald-600/15"
          : "border-slate-200 bg-white text-slate-900 hover:border-emerald-300 hover:bg-emerald-50/30",
        className
      )}
    >
      {/* Leading Vector Icon Container */}
      <div
        className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors mr-4",
          isSelected
            ? isRedFlag
              ? "bg-red-600 text-white"
              : "bg-emerald-700 text-white"
            : "bg-emerald-50/80 text-emerald-800 group-hover:bg-emerald-100 group-hover:text-emerald-900"
        )}
      >
        <IconComponent className="w-5 h-5 stroke-[2]" />
      </div>

      {/* Text Hierarchy */}
      <div className="flex-1 min-w-0">
        <h4 className="text-[17px] font-semibold tracking-tight leading-snug text-slate-900">
          {labelHi}
        </h4>
        <p className="text-sm font-medium text-slate-600 mt-0.5">
          {labelEn}
        </p>
        {(descriptionHi || descriptionEn) && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {descriptionHi || descriptionEn}
          </p>
        )}
      </div>

      {/* Selection Check Ring */}
      <div
        className={cn(
          "w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ml-3 transition-colors",
          isSelected
            ? isRedFlag
              ? "border-red-600 bg-red-600 text-white"
              : "border-emerald-700 bg-emerald-700 text-white"
            : "border-slate-300 bg-white"
        )}
      >
        {isSelected && <Icons.Check className="w-3.5 h-3.5 stroke-[3]" />}
      </div>
    </button>
  );
};
