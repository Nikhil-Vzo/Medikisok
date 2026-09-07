import * as React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-emerald-100 bg-[#F7FAF8]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[12px] text-slate-500">
        <div>
          MediKiosk · All India Institute of Ayurveda · Ministry of Ayush
        </div>
        <div className="font-medium text-slate-500">
          SIH 2026 · v0.1
        </div>
      </div>
    </footer>
  );
};
