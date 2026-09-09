import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export interface PatientVisitRecord {
  id: string;
  visitDate: string;
  department: string;
  doctorName: string;
  roomNumber: string;
  chiefComplaint: string;
  diagnosis: string;
  clinicalMode: "allopathy" | "ayush";
  prescriptions: Array<{
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
    category: "allopathy" | "ayurveda";
  }>;
  labReports?: Array<{
    test: string;
    value: string;
    unit: string;
    normalRange: string;
    status: "normal" | "high" | "low";
    date: string;
  }>;
  doctorAdvice?: string;
  followUpRecommendedDays?: number;
}

// In-memory store for retrospective linking & demo old patients
const seededOldPatientRecords: Record<string, PatientVisitRecord[]> = {
  // Demo Old Patient with prior visits and prescriptions
  "14-5555-6666-7777": [
    {
      id: "vis-past-101",
      visitDate: "2026-08-26",
      department: "Kayachikitsa (Ayurveda OPD)",
      doctorName: "Dr. Ananya Sharma (MD Ayur)",
      roomNumber: "Room 104",
      chiefComplaint: "Acid Peptic Disease / Amlapitta (Severe Heartburn & Gas)",
      diagnosis: "Amlapitta with Pitta-Vata imbalance",
      clinicalMode: "ayush",
      prescriptions: [
        {
          id: "rx-1",
          name: "Avipattikar Churna",
          dosage: "3g",
          frequency: "Twice daily before meals",
          duration: "14 days",
          instructions: "Mix with lukewarm water",
          category: "ayurveda",
        },
        {
          id: "rx-2",
          name: "Kamadudha Ras (Moti Yukta)",
          dosage: "125mg",
          frequency: "Twice daily after meals",
          duration: "14 days",
          instructions: "Take with cow's milk",
          category: "ayurveda",
        },
        {
          id: "rx-3",
          name: "Sutshekhar Ras",
          dosage: "250mg",
          frequency: "Once daily morning",
          duration: "10 days",
          instructions: "Empty stomach",
          category: "ayurveda",
        },
      ],
      labReports: [
        {
          test: "Serum Amylase",
          value: "72",
          unit: "U/L",
          normalRange: "30 - 110",
          status: "normal",
          date: "2026-08-26",
        },
        {
          test: "Serum Bilirubin Total",
          value: "0.8",
          unit: "mg/dL",
          normalRange: "0.2 - 1.2",
          status: "normal",
          date: "2026-08-26",
        },
      ],
      doctorAdvice: "Avoid spicy, deeply fried and fermented foods. Drink warm water. Follow up in 2 weeks if heartburn persists.",
      followUpRecommendedDays: 14,
    },
    {
      id: "vis-past-102",
      visitDate: "2026-06-12",
      department: "General Medicine OPD",
      doctorName: "Dr. Rajesh Mehra (MD Gen Med)",
      roomNumber: "Room 102",
      chiefComplaint: "Seasonal Allergic Rhinitis & Dry Cough",
      diagnosis: "Acute Upper Respiratory Irritation",
      clinicalMode: "allopathy",
      prescriptions: [
        {
          id: "rx-4",
          name: "Levocetirizine 5mg",
          dosage: "5mg",
          frequency: "Once daily at bedtime",
          duration: "5 days",
          category: "allopathy",
        },
        {
          id: "rx-5",
          name: "Sitopaladi Churna",
          dosage: "2g",
          frequency: "Thrice daily with honey",
          duration: "7 days",
          category: "ayurveda",
        },
      ],
      doctorAdvice: "Steam inhalation twice daily. Resolved completely.",
      followUpRecommendedDays: 7,
    },
  ],
};

// Map of mobile -> linked ABHA ID
const mobileToAbhaLinkMap: Record<string, string> = {};

// Mobile records store for Guest patients
const mobileRecordsStore: Record<string, PatientVisitRecord[]> = {
  "9876543210": [
    {
      id: "vis-guest-201",
      visitDate: "2026-08-20",
      department: "Panchakarma Unit",
      doctorName: "Dr. P. K. Namboodiri",
      roomNumber: "Room 108",
      chiefComplaint: "Chronic Lower Back Pain (Kati Shoola)",
      diagnosis: "Lumbosacral strain with Vata vriddhi",
      clinicalMode: "ayush",
      prescriptions: [
        {
          id: "rx-guest-1",
          name: "Yograj Guggulu",
          dosage: "2 tablets (500mg)",
          frequency: "Twice daily after meals",
          duration: "21 days",
          instructions: "With warm water",
          category: "ayurveda",
        },
        {
          id: "rx-guest-2",
          name: "Mahanarayan Taila",
          dosage: "15ml",
          frequency: "Local application twice daily",
          duration: "14 days",
          instructions: "Gentle massage followed by warm fomentation",
          category: "ayurveda",
        },
      ],
      doctorAdvice: "Avoid lifting heavy weights. Perform mild Kati-Chakrasana exercises as demonstrated.",
      followUpRecommendedDays: 21,
    },
  ],
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const abhaId = searchParams.get("abhaId")?.trim();
    const phone = searchParams.get("phone")?.replace(/\D/g, "");

    // Check if phone was linked to an ABHA ID
    const effectiveAbha = abhaId || (phone ? mobileToAbhaLinkMap[phone] : undefined);

    let records: PatientVisitRecord[] = [];

    // 1. Check seeded old patient records
    if (effectiveAbha && seededOldPatientRecords[effectiveAbha]) {
      records = [...seededOldPatientRecords[effectiveAbha]];
    }

    // 2. Check mobile records (if guest or linked)
    if (phone && mobileRecordsStore[phone]) {
      // Merge unique
      const existingIds = new Set(records.map((r) => r.id));
      for (const r of mobileRecordsStore[phone]) {
        if (!existingIds.has(r.id)) {
          records.push(r);
        }
      }
    }

    // 3. Query Supabase visits if available
    try {
      const supabase = createServerClient();
      if (supabase && (effectiveAbha || phone)) {
        let query = supabase
          .from("visits")
          .select(`
            id,
            visit_date,
            chief_complaint,
            clinical_mode,
            profiles (
              full_name,
              abha_id,
              age,
              gender
            ),
            summaries (
              id,
              status,
              draft_summary
            )
          `)
          .order("visit_date", { ascending: false });

        if (effectiveAbha) {
          query = query.eq("profiles.abha_id", effectiveAbha);
        }

        const { data: dbVisits } = await query.limit(10);
        if (dbVisits && dbVisits.length > 0) {
          const existingIds = new Set(records.map((r) => r.id));
          for (const v of dbVisits) {
            if (!existingIds.has(v.id) && v.chief_complaint) {
              const sum = v.summaries?.[0]?.draft_summary;
              records.unshift({
                id: v.id,
                visitDate: v.visit_date ? v.visit_date.split("T")[0] : new Date().toISOString().split("T")[0],
                department: sum?.doctorAllotment?.department || "General Medicine OPD",
                doctorName: sum?.doctorAllotment?.doctorName || "Dr. AIIA OPD",
                roomNumber: sum?.doctorAllotment?.roomNumber || "Room 102",
                chiefComplaint: v.chief_complaint,
                diagnosis: sum?.assessment?.provisionalDiagnosis || "Clinical Consultation",
                clinicalMode: v.clinical_mode === "ayush" ? "ayush" : "allopathy",
                prescriptions: (sum?.plan?.prescriptions || []).map((rx: any, idx: number) => ({
                  id: `db-rx-${v.id}-${idx}`,
                  name: rx.medicationName || rx.name || "Prescribed Medication",
                  dosage: rx.dosage || "As directed",
                  frequency: rx.frequency || "Twice daily",
                  duration: rx.duration || "7 days",
                  category: v.clinical_mode === "ayush" ? "ayurveda" : "allopathy",
                })),
                doctorAdvice: sum?.plan?.clinicalAdvice || "Continue medications as prescribed.",
              });
            }
          }
        }
      }
    } catch (dbErr) {
      console.warn("DB visits lookup non-fatal error:", dbErr);
    }

    const isLinked = Boolean(phone && mobileToAbhaLinkMap[phone]);
    const linkedAbha = phone ? mobileToAbhaLinkMap[phone] : undefined;

    return NextResponse.json({
      success: true,
      records,
      count: records.length,
      isOldPatient: records.length > 0,
      isLinked,
      linkedAbha,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch patient records" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, phone, abhaId, fullName, newVisit } = body;

    // Retrospective ABHA Linking
    if (action === "link_abha") {
      if (!phone || !abhaId) {
        return NextResponse.json(
          { success: false, error: "Phone number and ABHA ID are required" },
          { status: 400 }
        );
      }

      const cleanPhone = phone.replace(/\D/g, "");
      const cleanAbha = abhaId.trim();

      mobileToAbhaLinkMap[cleanPhone] = cleanAbha;

      // Transfer any mobile records to the ABHA profile
      if (mobileRecordsStore[cleanPhone]) {
        if (!seededOldPatientRecords[cleanAbha]) {
          seededOldPatientRecords[cleanAbha] = [];
        }
        seededOldPatientRecords[cleanAbha].push(...mobileRecordsStore[cleanPhone]);
      }

      // Also attempt Supabase linking if available
      try {
        const supabase = createServerClient();
        if (supabase) {
          await supabase
            .from("profiles")
            .update({ abha_id: cleanAbha })
            .eq("phone", cleanPhone);
        }
      } catch (e) {
        console.warn("Supabase ABHA link update skipped:", e);
      }

      return NextResponse.json({
        success: true,
        message: `Successfully linked ABHA ID ${cleanAbha} with Mobile +91 ${cleanPhone}. All past hospital records have been synced with your ABDM account.`,
        linkedAbha: cleanAbha,
        recordsTransferred: (mobileRecordsStore[cleanPhone] || []).length,
      });
    }

    // Save newly created visit to records store
    if (action === "add_visit" && newVisit) {
      const targetKey = abhaId || phone;
      if (targetKey) {
        if (!seededOldPatientRecords[targetKey]) {
          seededOldPatientRecords[targetKey] = [];
        }
        seededOldPatientRecords[targetKey].unshift(newVisit);
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
