import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "danger" | "warning" | "success" | "outline" | "ayush" | "vedic";
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = "default", children, ...props }) => {
  const base = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium select-none";

  const variants = {
    default: "bg-emerald-50 text-emerald-800 border border-emerald-200/80",
    danger: "bg-red-50 text-red-700 border border-red-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    outline: "bg-transparent text-slate-700 border border-slate-300",
    ayush: "bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-medium",
    vedic: "bg-amber-50 text-amber-800 border border-amber-200/80 font-medium",
  };

  return (
    <span className={cn(base, variants[variant] || variants.default, className)} {...props}>
      {children}
    </span>
  );
};
