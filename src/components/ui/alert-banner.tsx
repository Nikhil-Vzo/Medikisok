import * as React from "react";
import { AlertTriangle, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface AlertBannerProps {
  type?: "danger" | "warning" | "success" | "info";
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type = "info",
  title,
  description,
  actionText,
  onAction,
  className
}) => {
  const styles = {
    danger: {
      bg: "bg-red-50 border-red-200 text-red-950",
      icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
      btn: "bg-red-600 text-white hover:bg-red-700",
    },
    warning: {
      bg: "bg-amber-50 border-amber-200 text-amber-950",
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
      btn: "bg-amber-600 text-white hover:bg-amber-700",
    },
    success: {
      bg: "bg-emerald-50 border-emerald-200 text-emerald-950",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
      btn: "bg-emerald-600 text-white hover:bg-emerald-700",
    },
    info: {
      bg: "bg-emerald-50/60 border-emerald-200 text-emerald-950",
      icon: <Info className="w-5 h-5 text-emerald-700 shrink-0" />,
      btn: "bg-emerald-700 text-white hover:bg-emerald-800",
    },
  };

  const current = styles[type];

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-md border gap-4",
        current.bg,
        className
      )}
    >
      <div className="flex items-start sm:items-center gap-3">
        {current.icon}
        <div>
          <h4 className="text-sm font-semibold tracking-tight">{title}</h4>
          {description && <p className="text-[13px] mt-0.5 opacity-90 leading-relaxed">{description}</p>}
        </div>
      </div>
      {actionText && (
        <button
          onClick={onAction}
          className={cn("px-4 h-9 rounded-md text-sm font-medium whitespace-nowrap transition-colors", current.btn)}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
