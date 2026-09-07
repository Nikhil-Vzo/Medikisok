"use client";

import * as React from "react";
import { Activity, Heart, Thermometer, Wind, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface VitalMeasurements {
  bloodPressure: string;
  pulseRate: number;
  spO2: number;
  temperature: string;
  weight: string;
}

export interface VitalsScannerProps {
  onVitalsRecorded: (vitals: VitalMeasurements) => void;
}

export const VitalsScanner: React.FC<VitalsScannerProps> = ({ onVitalsRecorded }) => {
  const [vitals, setVitals] = React.useState<VitalMeasurements>({
    bloodPressure: "138/88 mmHg",
    pulseRate: 86,
    spO2: 98,
    temperature: "98.6 °F",
    weight: "64.5 kg"
  });
  const [isReading, setIsReading] = React.useState(false);
  const [isCompleted, setIsCompleted] = React.useState(false);

  const simulateVitalScan = () => {
    setIsReading(true);
    setTimeout(() => {
      const recorded: VitalMeasurements = {
        bloodPressure: "142/90 mmHg",
        pulseRate: 88,
        spO2: 97,
        temperature: "98.8 °F",
        weight: "65.0 kg"
      };
      setVitals(recorded);
      setIsReading(false);
      setIsCompleted(true);
      onVitalsRecorded(recorded);
    }, 1500);
  };

  return (
    <div className="p-6 bg-white rounded-xl border border-slate-200 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[15px] font-semibold tracking-tight text-slate-900">Integrated Vital Signs Telemetry</h4>
            <p className="text-xs text-slate-500 font-normal">Automated Bluetooth cuff & pulse oximeter readings</p>
          </div>
        </div>
        <Badge variant="default" className="text-xs font-medium">
          IOT Sensors
        </Badge>
      </div>

      {/* Vitals Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Blood Pressure */}
        <div className="p-3.5 rounded-lg bg-emerald-50/40 border border-emerald-100 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
            <Activity className="w-3 h-3 text-red-600" />
            <span>Blood Pressure</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{vitals.bloodPressure}</p>
          <span className="text-xs text-amber-700 font-medium">
            Stage 1 Elevated
          </span>
        </div>

        {/* Pulse Rate */}
        <div className="p-3.5 rounded-lg bg-emerald-50/40 border border-emerald-100 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
            <Heart className="w-3 h-3 text-slate-700" />
            <span>Pulse / Heart Rate</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{vitals.pulseRate} <span className="text-xs font-normal text-slate-500">BPM</span></p>
          <span className="text-xs text-emerald-700 font-medium">
            Normal Rhythm
          </span>
        </div>

        {/* SpO2 */}
        <div className="p-3.5 rounded-lg bg-emerald-50/40 border border-emerald-100 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
            <Wind className="w-3 h-3 text-slate-700" />
            <span>Blood Oxygen (SpO2)</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{vitals.spO2}%</p>
          <span className="text-xs text-emerald-700 font-medium">
            Optimal Saturation
          </span>
        </div>

        {/* Body Temperature */}
        <div className="p-3.5 rounded-lg bg-emerald-50/40 border border-emerald-100 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
            <Thermometer className="w-3 h-3 text-slate-700" />
            <span>Body Temperature</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{vitals.temperature}</p>
          <span className="text-xs text-emerald-700 font-medium">
            Afebrile Baseline
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-slate-500 font-normal">
          {isCompleted
            ? "Vitals recorded and attached to current ABDM visit payload."
            : "Sit upright with feet flat on the floor before pressing calibrate."}
        </p>
        <Button
          variant="primary"
          size="sm"
          onClick={simulateVitalScan}
          isLoading={isReading}
          className="text-xs font-semibold shrink-0 bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs"
        >
          {isCompleted ? "Recalibrate Sensors" : "Read Connected Vitals"}
        </Button>
      </div>
    </div>
  );
};
