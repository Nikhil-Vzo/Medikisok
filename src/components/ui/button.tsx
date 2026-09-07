import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg" | "touch" | "default";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const variants = {
      primary: "bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm",
      secondary: "bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100/80",
      outline: "bg-white text-slate-800 border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 hover:text-emerald-950",
      danger: "bg-red-600 text-white hover:bg-red-700",
      ghost: "text-slate-700 hover:bg-emerald-50/60 hover:text-emerald-900",
    };

    const sizes = {
      default: "h-11 px-5 text-sm rounded-md",
      sm: "h-9 px-3 text-sm rounded-md",
      md: "h-11 px-5 text-sm rounded-md",
      lg: "h-12 px-6 text-base rounded-md",
      touch: "h-16 px-8 text-lg font-medium rounded-md min-h-[56px] min-w-[56px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Processing...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
