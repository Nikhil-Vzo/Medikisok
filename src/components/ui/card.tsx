import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "interactive" | "alert";
  isSelected?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", isSelected = false, children, ...props }, ref) => {
    const baseStyles = "rounded-xl transition-colors";

    const variants = {
      default: "bg-white border border-slate-200",
      elevated: "bg-white border border-slate-200",
      interactive: cn(
        "bg-white border cursor-pointer select-none transition-colors",
        isSelected
          ? "border-emerald-600 bg-emerald-50/60 shadow-sm"
          : "border-slate-200 hover:border-emerald-300"
      ),
      alert: "bg-red-50 border border-red-200 text-red-950",
    };

    return (
      <div ref={ref} className={cn(baseStyles, variants[variant], className)} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
