"use client";

import * as React from "react";
import Link from "next/link";
import {
  UserCheck, Stethoscope, ArrowRight, ShieldCheck,
  RefreshCw, Activity, Users, Clock, AlertTriangle,
  Volume2, VolumeX, CheckCircle2, QrCode, FileText,
  HeartPulse, Thermometer, Flame, Wind,
  PhoneCall, Check, UserPlus, Search, Building2, MapPin
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LiveQueueItem } from "@/app/api/queue/route";

const DOCTOR_ROOMS = [
  { id: "room-1", roomNumber: "Room #1", doctorName: "Dr. R. K. Verma", department: "General Medicine / Allopathy" },
  { id: "room-2", roomNumber: "Room #2", doctorName: "Dr. Priya Awasthi", department: "Pulmonology & Respiratory" },
  { id: "room-3", roomNumber: "Room #3", doctorName: "Dr. Sharma, MD", department: "Ayurveda Kayachikitsa & Panchakarma" },
  { id: "bay-1", roomNumber: "Bay 1", doctorName: "Dr. Emergency On-Call", department: "Critical Resuscitation Bay" },
];

export default function HospitalDeskPage() {
  const [patients, setPatients] = React.useState<LiveQueueItem[]>([]);
  const [selectedPatient, setSelectedPatient] = React.useState<LiveQueueItem | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterTab, setFilterTab] = React.useState<"all" | "unassigned" | "emergency" | "allotted">("all");
  const [saveSuccessNotice, setSaveSuccessNotice] = React.useState<string | null>(null);

  // Vitals form state for selected patient
  const [vitalsForm, setVitalsForm] = React.useState({
    bpSys: 120,
    bpDia: 80,
    pulse: 76,
    spo2: 98,
    temp: 98.4,
    weight: 65,
    sugar: 110,
    nurseNotes: "",
  });

  // Room Allotment state
  const [selectedRoom, setSelectedRoom] = React.useState("Room #3");
  const [selectedDoctor, setSelectedDoctor] = React.useState("Dr. Sharma, MD");

  // Medication list editor state
  const [medications, setMedications] = React.useState<any[]>([]);

  // Audio paging state
  const [isCalling, setIsCalling] = React.useState(false);

  // Fetch live queue from /api/queue
  const fetchQueue = React.useCallback(async () => {
    try {
      const res = await fetch("/api/queue");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.queue)) {
          setPatients(data.queue);
          setSelectedPatient((prev) => {
            if (prev) {
              const match = data.queue.find((p: LiveQueueItem) => p.visitId === prev.visitId);
              if (match) return match;
            }
            return data.queue[0] || null;
          });
        }
      }
    } catch (err) {
      console.warn("Hospital desk queue fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 3000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  // Sync vitals and allotment form when selected patient changes
  React.useEffect(() => {
    if (selectedPatient) {
      const v = selectedPatient.nurseVitals || {};
      setVitalsForm({
        bpSys: v.bloodPressureSys || 120,
        bpDia: v.bloodPressureDia || 80,
        pulse: v.pulseRate || 74,
        spo2: v.spo2 || 98,
        temp: v.temperature || 98.4,
        weight: v.weightKg || 65,
        sugar: v.bloodSugarMgDl || 110,
        nurseNotes: selectedPatient.nurseNotes || v.nurseNotes || "",
      });

      setSelectedRoom(selectedPatient.assignedRoom || "Room #3");
      setSelectedDoctor(selectedPatient.assignedDoctor || "Dr. Sharma, MD");

      const draftMeds = selectedPatient.draftSummary?.currentMedications || [];
      setMedications(draftMeds);
    }
  }, [selectedPatient?.visitId]);

  // Handle Room Allotment Save
  const handleSaveAllotment = async () => {
    if (!selectedPatient) return;
    try {
      const res = await fetch("/api/queue", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitId: selectedPatient.visitId,
          assignedRoom: selectedRoom,
          assignedDoctor: selectedDoctor,
        }),
      });

      if (res.ok) {
        setSaveSuccessNotice(`Patient allotted to ${selectedRoom} (${selectedDoctor})`);
        setTimeout(() => setSaveSuccessNotice(null), 3500);
        fetchQueue();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Vitals Save
  const handleSaveVitals = async () => {
    if (!selectedPatient) return;
    try {
      const res = await fetch("/api/queue", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitId: selectedPatient.visitId,
          nurseVitals: {
            bloodPressureSys: Number(vitalsForm.bpSys),
            bloodPressureDia: Number(vitalsForm.bpDia),
            pulseRate: Number(vitalsForm.pulse),
            spo2: Number(vitalsForm.spo2),
            temperature: Number(vitalsForm.temp),
            weightKg: Number(vitalsForm.weight),
            bloodSugarMgDl: Number(vitalsForm.sugar),
            nurseNotes: vitalsForm.nurseNotes,
            recordedAt: new Date().toISOString(),
          },
          nurseNotes: vitalsForm.nurseNotes,
        }),
      });

      if (res.ok) {
        setSaveSuccessNotice("Vitals and Nurse Notes saved successfully");
        setTimeout(() => setSaveSuccessNotice(null), 3500);
        fetchQueue();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Medications Update
  const handleSaveMedications = async () => {
    if (!selectedPatient) return;
    try {
      const res = await fetch("/api/queue", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitId: selectedPatient.visitId,
          medications,
        }),
      });
      if (res.ok) {
        setSaveSuccessNotice("Medication list verified and updated");
        setTimeout(() => setSaveSuccessNotice(null), 3500);
        fetchQueue();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Voice announcement: Call patient to room
  const handleCallPatient = async () => {
    if (!selectedPatient) return;
    setIsCalling(true);

    const room = selectedPatient.assignedRoom || selectedRoom;
    const textEn = `Attention please. Patient ${selectedPatient.name}, token number ${selectedPatient.visitId.slice(-3)}, please proceed to ${room}.`;
    const textHi = `ध्यान दीजिए। मरीज ${selectedPatient.name}, टोकन नंबर ${selectedPatient.visitId.slice(-3)}, कृपया ${room} में जाएं।`;

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utteranceHi = new SpeechSynthesisUtterance(textHi);
      utteranceHi.lang = "hi-IN";
      utteranceHi.rate = 1.0;

      const utteranceEn = new SpeechSynthesisUtterance(textEn);
      utteranceEn.lang = "en-IN";
      utteranceEn.rate = 1.0;

      utteranceHi.onend = () => {
        window.speechSynthesis.speak(utteranceEn);
      };

      utteranceEn.onend = () => {
        setIsCalling(false);
      };

      window.speechSynthesis.speak(utteranceHi);
    } else {
      setTimeout(() => setIsCalling(false), 3000);
    }

    // Mark called status on server
    try {
      await fetch("/api/queue", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitId: selectedPatient.visitId,
          calledStatus: "called",
          calledAt: new Date().toISOString(),
        }),
      });
      fetchQueue();
    } catch {}
  };

  // Filtered patients
  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.abhaId.includes(searchQuery) ||
      p.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === "unassigned") return !p.assignedRoom;
    if (filterTab === "emergency") return p.isEmergency;
    if (filterTab === "allotted") return Boolean(p.assignedRoom);
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#F7FAF8] text-slate-900 antialiased min-h-screen selection:bg-emerald-100 selection:text-emerald-950">
      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b border-emerald-100 bg-[#F7FAF8]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-emerald-600 flex items-center justify-center shadow-xs">
                <span className="text-white text-[11px] font-bold">M</span>
              </div>
              <span className="text-[15px] font-semibold text-slate-900">MediKiosk</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-[13px] font-medium text-slate-700 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              Hospital Desk (Lobby Triage & Allotment)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Nurse Station 01: Sister Preeti, RN
            </span>
            <button
              onClick={fetchQueue}
              className="p-2 rounded-md bg-white border border-slate-200 hover:border-emerald-300 text-slate-600 hover:text-emerald-900 transition-colors"
              title="Refresh Queue"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <Link
              href="/doctor"
              className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:border-emerald-400"
            >
              <span>Go to Doctor OPD Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
              <span>Lobby Registrations</span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{patients.length}</div>
            <div className="text-[11px] text-slate-500 mt-1">Live from self-check kiosk</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
              <span>Pending Allotment</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-700">
              {patients.filter((p) => !p.assignedRoom).length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Awaiting nurse room assignment</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
              <span>Critical Emergencies</span>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-700">
              {patients.filter((p) => p.isEmergency).length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Priority Bay 1 indicated</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
              <span>Allotted to Rooms</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-700">
              {patients.filter((p) => Boolean(p.assignedRoom)).length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Ready for doctor consult</div>
          </div>
        </div>

        {/* Global Save Toast */}
        {saveSuccessNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-semibold text-emerald-900 flex items-center gap-2 animate-in fade-in duration-200 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{saveSuccessNotice}</span>
          </div>
        )}

        {/* 2-Column Core Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Lobby Patient Queue */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-700" />
                  Lobby Waiting Room ({filteredPatients.length})
                </h3>
                <span className="text-[11px] text-slate-500">Auto-refresh 3s</span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patient, ABHA, symptom..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-1 p-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-600">
                {(["all", "unassigned", "emergency", "allotted"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilterTab(tab)}
                    className={`flex-1 py-1 rounded-md capitalize transition-all ${
                      filterTab === tab
                        ? "bg-white text-slate-900 font-semibold shadow-xs"
                        : "hover:text-slate-900"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Patients Scroll List */}
            <div className="space-y-2.5 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
              {filteredPatients.length === 0 ? (
                <div className="p-8 rounded-xl bg-white border border-dashed border-slate-300 text-center space-y-2">
                  <Users className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">No patients match filter</p>
                  <p className="text-[11px] text-slate-500">
                    Patients checking in at the Kiosk will appear here in real-time.
                  </p>
                </div>
              ) : (
                filteredPatients.map((p, idx) => {
                  const isSelected = selectedPatient?.visitId === p.visitId;
                  const hasVitals = Boolean(p.nurseVitals?.bloodPressureSys);

                  return (
                    <div
                      key={p.visitId}
                      onClick={() => setSelectedPatient(p)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer text-left space-y-2.5 ${
                        isSelected
                          ? "bg-emerald-50/70 border-emerald-600 shadow-xs ring-1 ring-emerald-600"
                          : "bg-white border-slate-200/90 hover:border-emerald-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                            #{idx + 1}
                          </span>
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900 leading-tight">
                              {p.name}
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              {p.age}y · {p.gender} · {p.abhaId}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          {p.isEmergency ? (
                            <Badge variant="danger" className="text-[10px] font-bold">
                              CRITICAL RED-FLAG
                            </Badge>
                          ) : (
                            <Badge variant="default" className="text-[10px] font-medium">
                              {p.clinicalMode === "ayush" ? "Ayurveda" : "Allopathy"}
                            </Badge>
                          )}
                          <span className="text-[10px] text-slate-400 font-medium">
                            Wait: {p.waitTimeMins}m
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 font-medium line-clamp-1">
                        {p.chiefComplaint}
                      </p>

                      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span className={`font-semibold ${p.assignedRoom ? "text-emerald-800" : "text-amber-700"}`}>
                            {p.assignedRoom ? `${p.assignedRoom} (${p.assignedDoctor})` : "Unassigned"}
                          </span>
                        </div>

                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          hasVitals ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                        }`}>
                          {hasVitals ? `BP ${p.nurseVitals?.bloodPressureSys}/${p.nurseVitals?.bloodPressureDia}` : "Vitals Pending"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Active Patient Coordination & Clinical Allotment */}
          <div className="lg:col-span-7 space-y-5">
            {selectedPatient ? (
              <>
                {/* Active Patient Card with Paging Action */}
                <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-base">
                        {selectedPatient.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">{selectedPatient.name}</h3>
                          <span className="text-xs text-slate-500 font-medium">
                            {selectedPatient.age}y / {selectedPatient.gender}
                          </span>
                          {selectedPatient.isEmergency && (
                            <Badge variant="danger" className="text-xs font-semibold">
                              EMERGENCY
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          ABHA: {selectedPatient.abhaId} · Token #{selectedPatient.visitId.slice(-3)}
                        </p>
                      </div>
                    </div>

                    {/* Calling / Paging Patient Button */}
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleCallPatient}
                      disabled={isCalling}
                      className="h-10 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs flex items-center gap-2"
                    >
                      <Volume2 className="w-4 h-4 animate-bounce" />
                      <span>{isCalling ? "Calling Patient..." : `Call to ${selectedRoom}`}</span>
                    </Button>
                  </div>

                  {/* Complaint Snapshot */}
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
                    <span className="font-semibold text-slate-800">Chief Complaint: </span>
                    <span className="text-slate-700">{selectedPatient.chiefComplaint}</span>
                  </div>
                </div>

                {/* Section 1: Doctor & Consultation Room Allotment */}
                <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-emerald-700" />
                      Doctor & OPD Room Allotment
                    </h4>
                    <span className="text-[11px] text-slate-500">Assigns patient to specific consultation console</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {DOCTOR_ROOMS.map((r) => {
                      const isChosen = selectedRoom === r.roomNumber;
                      return (
                        <div
                          key={r.id}
                          onClick={() => {
                            setSelectedRoom(r.roomNumber);
                            setSelectedDoctor(r.doctorName);
                          }}
                          className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                            isChosen
                              ? "bg-emerald-50/70 border-emerald-600 shadow-xs ring-1 ring-emerald-600"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900">{r.roomNumber}</span>
                            {isChosen && <Check className="w-4 h-4 text-emerald-700" />}
                          </div>
                          <p className="text-xs font-semibold text-emerald-950 mt-1">{r.doctorName}</p>
                          <p className="text-[11px] text-slate-500">{r.department}</p>
                        </div>
                      );
                    })}
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSaveAllotment}
                    className="w-full h-9 text-xs font-semibold border-emerald-300 hover:bg-emerald-50 text-emerald-900"
                  >
                    Confirm Allotment to {selectedRoom} ({selectedDoctor})
                  </Button>
                </div>

                {/* Section 2: Physical Vitals Pre-Screening */}
                <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <HeartPulse className="w-3.5 h-3.5 text-emerald-700" />
                      Nurse Vitals Measurement (Pre-Consultation Check)
                    </h4>
                    <Badge variant="default" className="text-[10px]">
                      FHIR Observation Linked
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        BP Systolic (mmHg)
                      </label>
                      <input
                        type="number"
                        value={vitalsForm.bpSys}
                        onChange={(e) => setVitalsForm({ ...vitalsForm, bpSys: Number(e.target.value) })}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        BP Diastolic (mmHg)
                      </label>
                      <input
                        type="number"
                        value={vitalsForm.bpDia}
                        onChange={(e) => setVitalsForm({ ...vitalsForm, bpDia: Number(e.target.value) })}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Pulse (bpm)
                      </label>
                      <input
                        type="number"
                        value={vitalsForm.pulse}
                        onChange={(e) => setVitalsForm({ ...vitalsForm, pulse: Number(e.target.value) })}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        SpO2 (%)
                      </label>
                      <input
                        type="number"
                        value={vitalsForm.spo2}
                        onChange={(e) => setVitalsForm({ ...vitalsForm, spo2: Number(e.target.value) })}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Temperature (°F)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={vitalsForm.temp}
                        onChange={(e) => setVitalsForm({ ...vitalsForm, temp: Number(e.target.value) })}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={vitalsForm.weight}
                        onChange={(e) => setVitalsForm({ ...vitalsForm, weight: Number(e.target.value) })}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Random Blood Sugar (mg/dL)
                      </label>
                      <input
                        type="number"
                        value={vitalsForm.sugar}
                        onChange={(e) => setVitalsForm({ ...vitalsForm, sugar: Number(e.target.value) })}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Nurse Observation & Triage Notes
                    </label>
                    <textarea
                      rows={2}
                      value={vitalsForm.nurseNotes}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, nurseNotes: e.target.value })}
                      placeholder="e.g. Patient appeared mildly tachypneic on arrival, ambulatory with son. Vitals recorded prior to consult."
                      className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveVitals}
                    className="w-full h-9 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white"
                  >
                    Save Vitals & Observations
                  </Button>
                </div>

                {/* Section 3: Prescription Pre-Check & Medication Verification */}
                <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-700" />
                      Prescription Pre-Check (Scanned by Kiosk)
                    </h4>
                    <span className="text-[11px] text-slate-500">Nurse can correct dosage or add verified drugs</span>
                  </div>

                  {medications.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No previous medications recorded at kiosk.</p>
                  ) : (
                    <div className="space-y-2">
                      {medications.map((m, mIdx) => (
                        <div key={mIdx} className="grid grid-cols-12 gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                          <input
                            type="text"
                            value={m.name}
                            onChange={(e) => {
                              const updated = [...medications];
                              updated[mIdx].name = e.target.value;
                              setMedications(updated);
                            }}
                            className="col-span-5 h-8 px-2 rounded border border-slate-200 text-xs font-semibold text-slate-900 bg-white"
                            placeholder="Medicine Name"
                          />
                          <input
                            type="text"
                            value={m.dosage}
                            onChange={(e) => {
                              const updated = [...medications];
                              updated[mIdx].dosage = e.target.value;
                              setMedications(updated);
                            }}
                            className="col-span-3 h-8 px-2 rounded border border-slate-200 text-xs text-slate-800 bg-white"
                            placeholder="Dosage"
                          />
                          <input
                            type="text"
                            value={m.frequency}
                            onChange={(e) => {
                              const updated = [...medications];
                              updated[mIdx].frequency = e.target.value;
                              setMedications(updated);
                            }}
                            className="col-span-3 h-8 px-2 rounded border border-slate-200 text-xs text-slate-800 bg-white"
                            placeholder="Frequency (OD/BD)"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setMedications(medications.filter((_, i) => i !== mIdx));
                            }}
                            className="col-span-1 text-red-500 hover:text-red-700 text-xs font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setMedications([...medications, { name: "Tab Paracetamol", dosage: "650mg", frequency: "SOS", confidence: 1 }]);
                      }}
                      className="text-xs h-8"
                    >
                      + Add Drug
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleSaveMedications}
                      className="text-xs h-8 bg-emerald-700 text-white"
                    >
                      Confirm Verified Medications
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 rounded-xl bg-white border border-slate-200 text-center space-y-3">
                <Users className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-semibold text-slate-800">Select a patient from the queue</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Pick any patient arriving from the kiosk to allot a room, pre-screen vitals, and verify medications.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
