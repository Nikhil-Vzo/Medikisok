import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export interface LiveQueueItem {
  id: string;
  visitId: string;
  summaryId: string;
  name: string;
  age: number;
  gender: string;
  abhaId: string;
  chiefComplaint: string;
  clinicalMode: "allopathy" | "ayush";
  isEmergency: boolean;
  waitTimeMins: number;
  status: "waiting" | "in_consultation" | "completed";
  createdAt: string;
  draftSummary?: any;
  fhirBundle?: any;
  scannedDocuments?: any[];
  suggestions?: any[];
  assignedDoctor?: string;
  assignedRoom?: string;
  nurseVitals?: {
    bloodPressureSys?: number;
    bloodPressureDia?: number;
    pulseRate?: number;
    spo2?: number;
    temperature?: number;
    weightKg?: number;
    bloodSugarMgDl?: number;
    nurseNotes?: string;
    recordedAt?: string;
  };
  nurseNotes?: string;
  calledStatus?: "waiting" | "called" | "with_doctor";
  calledAt?: string;
  hospitalName?: string;
}

// In-memory queue cache on server for sub-millisecond sync across kiosk, doctor, and triage
const globalQueue = globalThis as unknown as { __liveOpdQueue?: LiveQueueItem[] };
if (!globalQueue.__liveOpdQueue) {
  globalQueue.__liveOpdQueue = [];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const abhaLookup = searchParams.get("abhaId");

    // If searching for a specific ABHA ID (patient history lookup & active token check)
    if (abhaLookup) {
      const cleanLookup = abhaLookup.replace(/\D/g, "");
      const queueList = globalQueue.__liveOpdQueue || [];
      const memMatchIndex = queueList.findIndex(
        (p) => p.abhaId && p.abhaId.replace(/\D/g, "") === cleanLookup
      );
      if (memMatchIndex >= 0) {
        const item = queueList[memMatchIndex];
        return NextResponse.json({
          found: true,
          inQueue: true,
          tokenNumber: memMatchIndex + 1,
          assignedRoom: item.assignedRoom || "Room 104 (Dr. Ananya)",
          assignedDoctor: item.assignedDoctor || "Dr. Ananya Sharma",
          nowServing: Math.max(1, memMatchIndex),
          waitTimeMins: item.waitTimeMins || (memMatchIndex + 1) * 3,
          patient: item,
        });
      }

      const supabase = createServerClient();
      if (supabase) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*, visits(*, summaries(*))")
          .eq("abha_id", abhaLookup)
          .maybeSingle();

        if (profile) {
          return NextResponse.json({
            found: true,
            inQueue: false,
            patient: {
              name: profile.full_name,
              age: profile.age,
              gender: profile.gender,
              abhaId: profile.abha_id,
              visits: profile.visits || [],
            },
          });
        }
      }
      return NextResponse.json({ found: false, inQueue: false });
    }


    // Otherwise return active OPD Queue
    const supabase = createServerClient();
    let dbQueue: LiveQueueItem[] = [];

    if (supabase) {
      try {
        const { data: visits, error } = await supabase
          .from("visits")
          .select(`
            id,
            visit_date,
            chief_complaint,
            clinical_mode,
            is_emergency,
            patient_id,
            profiles (
              id,
              full_name,
              age,
              gender,
              abha_id
            ),
            summaries (
              id,
              status,
              draft_summary,
              fhir_bundle
            )
          `)
          .order("is_emergency", { ascending: false })
          .order("visit_date", { ascending: false })
          .limit(30);

        if (!error && visits && visits.length > 0) {
          dbQueue = visits.map((v: any) => {
            const p = v.profiles || {};
            const s = v.summaries?.[0] || {};
            const waitTime = Math.max(
              1,
              Math.floor((Date.now() - new Date(v.visit_date).getTime()) / (1000 * 60))
            );

            return {
              id: (p.id || `pat-${v.id}`) as string,
              visitId: v.id as string,
              summaryId: (s.id || `sum-${v.id}`) as string,
              name: (p.full_name || "Patient") as string,
              age: (p.age || 45) as number,
              gender: (p.gender || "Male") as string,
              abhaId: (p.abha_id || "91-0000-0000-0000") as string,
              chiefComplaint: (v.chief_complaint || "General OPD Check-in") as string,
              clinicalMode: (v.clinical_mode === "ayush" ? "ayush" : "allopathy") as "allopathy" | "ayush",
              isEmergency: Boolean(v.is_emergency),
              waitTimeMins: waitTime,
              status: (s.status === "approved" ? "completed" : "waiting") as "completed" | "waiting" | "in_consultation",
              createdAt: v.visit_date,
              draftSummary: s.draft_summary,
              fhirBundle: s.fhir_bundle,
              scannedDocuments: s.draft_summary?.scannedDocuments || [],
            };
          });
        }
      } catch (dbErr) {
        console.warn("Supabase queue fetch warning:", dbErr);
      }
    }

    // Merge in-memory queue with DB queue (deduplicating by unique patient identity)
    const combinedMap = new Map<string, LiveQueueItem>();

    const getPatientKey = (item: LiveQueueItem) => {
      const cleanAbha = (item.abhaId || "").replace(/\D/g, "");
      if (cleanAbha.length >= 10 && !cleanAbha.includes("0000000000")) {
        return `abha_${cleanAbha}`;
      }
      const cleanName = (item.name || "").toLowerCase().trim();
      return `name_${cleanName}`;
    };

    // Candidates: in-memory items followed by DB items
    const candidates = [...(globalQueue.__liveOpdQueue || []), ...dbQueue];

    for (const item of candidates) {
      const key = getPatientKey(item);
      const existing = combinedMap.get(key);
      if (!existing) {
        combinedMap.set(key, item);
      } else {
        // Keep the newest visit for this patient and merge any vitals / allotment / scannedDocs
        const itemTime = new Date(item.createdAt || 0).getTime();
        const existTime = new Date(existing.createdAt || 0).getTime();
        if (itemTime >= existTime) {
          if (!item.nurseVitals && existing.nurseVitals) item.nurseVitals = existing.nurseVitals;
          if (!item.assignedRoom && existing.assignedRoom) item.assignedRoom = existing.assignedRoom;
          if (!item.assignedDoctor && existing.assignedDoctor) item.assignedDoctor = existing.assignedDoctor;
          if ((!item.scannedDocuments || item.scannedDocuments.length === 0) && existing.scannedDocuments?.length) {
            item.scannedDocuments = existing.scannedDocuments;
          }
          if ((!item.draftSummary?.currentMedications || item.draftSummary.currentMedications.length === 0) && existing.draftSummary?.currentMedications?.length) {
            item.draftSummary = { ...item.draftSummary, currentMedications: existing.draftSummary.currentMedications };
          }
          combinedMap.set(key, item);
        } else {
          if (!existing.nurseVitals && item.nurseVitals) existing.nurseVitals = item.nurseVitals;
          if (!existing.assignedRoom && item.assignedRoom) existing.assignedRoom = item.assignedRoom;
          if (!existing.assignedDoctor && item.assignedDoctor) existing.assignedDoctor = item.assignedDoctor;
          if ((!existing.scannedDocuments || existing.scannedDocuments.length === 0) && item.scannedDocuments?.length) {
            existing.scannedDocuments = item.scannedDocuments;
          }
          if ((!existing.draftSummary?.currentMedications || existing.draftSummary.currentMedications.length === 0) && item.draftSummary?.currentMedications?.length) {
            existing.draftSummary = { ...existing.draftSummary, currentMedications: item.draftSummary.currentMedications };
          }
        }
      }
    }

    const merged = Array.from(combinedMap.values()).sort((a, b) => {
      if (a.isEmergency !== b.isEmergency) {
        return a.isEmergency ? -1 : 1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({
      success: true,
      queue: merged,
      count: merged.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Queue API GET error:", error);
    return NextResponse.json(
      { success: false, queue: globalQueue.__liveOpdQueue || [], error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      patient,
      visit,
      summaryDraft,
      fhirBundle,
      scannedDocuments,
      suggestions,
    } = body;

    const visitId = `visit-${Date.now()}`;
    const summaryId = `sum-${Date.now()}`;
    const profileId = `pat-${Date.now()}`;

    const newQueueItem: LiveQueueItem = {
      id: profileId,
      visitId,
      summaryId,
      name: patient?.name || "OPD Patient",
      age: patient?.age || 40,
      gender: patient?.gender || "Female",
      abhaId: patient?.abhaId || "91-0000-0000-0000",
      chiefComplaint: visit?.chiefComplaint || summaryDraft?.chiefComplaint || "Intake Completed",
      clinicalMode: (visit?.clinicalMode === "ayush" ? "ayush" : "allopathy"),
      isEmergency: Boolean(visit?.isEmergency),
      waitTimeMins: 1,
      status: "waiting",
      createdAt: new Date().toISOString(),
      draftSummary: summaryDraft,
      fhirBundle: fhirBundle,
      scannedDocuments: (scannedDocuments && scannedDocuments.length > 0)
        ? scannedDocuments
        : (summaryDraft?.scannedDocuments || []),
      suggestions: suggestions || [],
    };

    // 1. Immediately store in server in-memory queue
    globalQueue.__liveOpdQueue = [newQueueItem, ...(globalQueue.__liveOpdQueue || [])].slice(0, 50);

    // 2. Persist to Supabase if connected
    const supabase = createServerClient();
    if (supabase) {
      try {
        let dbProfileId: string = profileId;
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("abha_id", patient.abhaId)
          .maybeSingle();

        if (existingProfile) {
          dbProfileId = existingProfile.id;
        } else {
          const { data: newProf } = await supabase
            .from("profiles")
            .insert({
              role: "patient",
              abha_id: patient.abhaId,
              full_name: patient.name,
              age: patient.age,
              gender: patient.gender,
              preferred_language: patient.language || "en",
            })
            .select("id")
            .maybeSingle();
          if (newProf) dbProfileId = newProf.id;
        }

        const { data: newVisit } = await supabase
          .from("visits")
          .insert({
            patient_id: dbProfileId,
            chief_complaint: visit?.chiefComplaint || summaryDraft?.chiefComplaint,
            clinical_mode: visit?.clinicalMode || "allopathy",
            is_emergency: Boolean(visit?.isEmergency),
            gap_days: visit?.gapDays || 0,
            interview_type: visit?.interviewType || "full",
          })
          .select("id")
          .maybeSingle();

        const actualVisitId = newVisit?.id || visitId;

        if (summaryDraft) {
          await supabase.from("summaries").insert({
            visit_id: actualVisitId,
            patient_id: dbProfileId,
            draft_summary: summaryDraft,
            fhir_bundle: fhirBundle,
            status: "draft",
          });
        }
      } catch (dbErr) {
        console.warn("Supabase persistence note (cached in memory):", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      visitId,
      summaryId,
      queueItem: newQueueItem,
    });
  } catch (error: any) {
    console.error("Queue API POST error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const {
      visitId,
      status,
      doctorNotes,
      assignedDoctor,
      assignedRoom,
      nurseVitals,
      nurseNotes,
      calledStatus,
      calledAt,
      medications,
      allergies,
    } = await req.json();

    if (globalQueue.__liveOpdQueue) {
      const item = globalQueue.__liveOpdQueue.find((q) => q.visitId === visitId);
      if (item) {
        if (status) item.status = status;
        if (assignedDoctor !== undefined) item.assignedDoctor = assignedDoctor;
        if (assignedRoom !== undefined) item.assignedRoom = assignedRoom;
        if (nurseVitals) item.nurseVitals = { ...item.nurseVitals, ...nurseVitals };
        if (nurseNotes !== undefined) item.nurseNotes = nurseNotes;
        if (calledStatus) item.calledStatus = calledStatus;
        if (calledAt) item.calledAt = calledAt;

        if (item.draftSummary) {
          if (doctorNotes) item.draftSummary.doctorNotes = doctorNotes;
          if (nurseNotes) item.draftSummary.nurseNotes = nurseNotes;
          if (nurseVitals) item.draftSummary.nurseVitals = item.nurseVitals;
          if (assignedDoctor) item.draftSummary.assignedDoctor = assignedDoctor;
          if (assignedRoom) item.draftSummary.assignedRoom = assignedRoom;
          if (medications) item.draftSummary.currentMedications = medications;
          if (allergies) item.draftSummary.allergies = allergies;
        }
      }
    }

    const supabase = createServerClient();
    if (supabase && visitId) {
      try {
        const updatePayload: any = {};
        if (status) updatePayload.status = status === "completed" ? "approved" : "in_consultation";
        if (Object.keys(updatePayload).length > 0) {
          await supabase
            .from("summaries")
            .update(updatePayload)
            .eq("visit_id", visitId);
        }
      } catch (e) {
        console.warn("Supabase status update note:", e);
      }
    }

    return NextResponse.json({
      success: true,
      visitId,
      status,
      assignedRoom,
      assignedDoctor,
      calledStatus,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const visitId = searchParams.get("visitId");
    const clearAll = searchParams.get("all") === "true";

    if (clearAll) {
      globalQueue.__liveOpdQueue = [];
      return NextResponse.json({ success: true, message: "Queue cleared" });
    }

    if (visitId && globalQueue.__liveOpdQueue) {
      globalQueue.__liveOpdQueue = globalQueue.__liveOpdQueue.filter((q) => q.visitId !== visitId);
      return NextResponse.json({ success: true, message: `Removed visit ${visitId}` });
    }

    return NextResponse.json({ success: false, error: "Missing visitId or all parameter" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
