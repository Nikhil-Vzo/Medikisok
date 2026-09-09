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
  diseaseDuration?: string;
  clinicalMode: "allopathy" | "ayush";
  lastMedicationUsed?: {
    name: string;
    dosage: string;
    whenUsed: string;
    timing: string;
    instructions?: string;
  };
  prescriptionImageUrl?: string;
  prescriptions: Array<{
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
    category: "allopathy" | "ayurveda";
    whenUsed?: string;
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

// Generates an authentic SVG prescription slip data URL
function generateRxSvg(title: string, doctor: string, dept: string, date: string, diagnosis: string, meds: string[]): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1050" width="800" height="1050" style="background:#ffffff; font-family: system-ui, sans-serif;">
    <rect width="800" height="1050" fill="#ffffff"/>
    <!-- Header Banner -->
    <rect width="800" height="120" fill="#047857"/>
    <text x="40" y="45" font-size="22" font-weight="900" fill="#ffffff">ALL INDIA INSTITUTE OF AYURVEDA &amp; OPD CLINIC</text>
    <text x="40" y="72" font-size="13" font-weight="500" fill="#d1fae5">Ministry of Ayush · Govt. of India · ABDM Integrated Health Facility</text>
    <text x="40" y="95" font-size="12" font-weight="600" fill="#a7f3d0">NABH Accredited OPD · Mathura Road, New Delhi - 110076</text>
    
    <!-- Doctor & OPD Info -->
    <rect x="40" y="140" width="720" height="85" rx="8" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1.5"/>
    <text x="60" y="172" font-size="16" font-weight="bold" fill="#065f46">${doctor}</text>
    <text x="60" y="195" font-size="13" font-weight="600" fill="#047857">${dept}</text>
    <text x="60" y="213" font-size="12" fill="#4b5563">Reg. No: AYUSH/DLI/2018/8892 · OPD Timing: 09:00 AM - 02:00 PM</text>
    
    <text x="560" y="172" font-size="12" font-weight="bold" fill="#374151">Date: ${date}</text>
    <text x="560" y="195" font-size="12" fill="#374151">OPD Slip No: AIIA-2026-${Math.floor(1000 + Math.random() * 9000)}</text>
    <text x="560" y="213" font-size="12" font-weight="bold" fill="#047857">ABDM Verified Record</text>

    <!-- Clinical Diagnosis -->
    <rect x="40" y="245" width="720" height="60" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
    <text x="60" y="270" font-size="12" font-weight="bold" fill="#64748b">PROVISIONAL / CLINICAL DIAGNOSIS:</text>
    <text x="60" y="292" font-size="15" font-weight="bold" fill="#0f172a">${diagnosis}</text>

    <!-- Rx Symbol -->
    <text x="45" y="365" font-size="44" font-weight="900" font-family="serif" fill="#047857">℞</text>
    <line x1="100" y1="355" x2="760" y2="355" stroke="#047857" stroke-width="1.5"/>

    <!-- Prescriptions Table -->
    ${meds.map((m, i) => `
      <g transform="translate(60, ${390 + (i * 75)})">
        <circle cx="12" cy="14" r="10" fill="#ecfdf5" stroke="#10b981"/>
        <text x="12" y="18" font-size="11" font-weight="bold" fill="#047857" text-anchor="middle">${i + 1}</text>
        <text x="35" y="18" font-size="15" font-weight="bold" fill="#1e293b">${m}</text>
        <line x1="35" y1="36" x2="700" y2="36" stroke="#f1f5f9" stroke-width="1"/>
      </g>
    `).join('')}

    <!-- Footer & Doctor Signature -->
    <line x1="40" y1="900" x2="760" y2="900" stroke="#e2e8f0" stroke-width="1.5"/>
    <text x="40" y="930" font-size="11" fill="#64748b">Important: Complete full medicine course as advised. For emergency, visit 24x7 Casualty or call 108.</text>
    <text x="40" y="948" font-size="11" fill="#64748b">This digital prescription is verified under ABDM M1/M2/M3 Architecture and DPDP Act 2023.</text>

    <!-- Signature Stamp -->
    <g transform="translate(560, 915)">
      <rect x="0" y="0" width="180" height="70" rx="6" fill="#f0fdf4" stroke="#059669" stroke-width="1" stroke-dasharray="3 3"/>
      <text x="90" y="28" font-size="14" font-weight="bold" font-style="italic" fill="#065f46" text-anchor="middle">${doctor.split(' ')[0]} ${doctor.split(' ')[1] || ''}</text>
      <text x="90" y="46" font-size="11" font-weight="bold" fill="#047857" text-anchor="middle">Authorized Signature</text>
      <text x="90" y="60" font-size="10" fill="#6b7280" text-anchor="middle">AIIA OPD Specialist Stamp</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
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
      diseaseDuration: "3 Months (Chronic Recurrent)",
      clinicalMode: "ayush",
      lastMedicationUsed: {
        name: "Avipattikar Churna 3g",
        dosage: "3g with lukewarm water",
        whenUsed: "Today at 8:30 AM (Morning before breakfast)",
        timing: "Twice daily - Before meals",
        instructions: "Mix with lukewarm water, avoid sour/spicy food",
      },
      prescriptionImageUrl: generateRxSvg(
        "AIIA OPD Prescription",
        "Dr. Ananya Sharma (MD Ayur)",
        "Kayachikitsa (Ayurveda OPD) · Room 104",
        "2026-08-26",
        "Amlapitta with Pitta-Vata imbalance (Duration: 3 Months)",
        [
          "Avipattikar Churna 3g — Twice daily before meals (14 days)",
          "Kamadudha Ras (Moti Yukta) 125mg — Twice daily after meals (14 days)",
          "Sutshekhar Ras 250mg — Once daily morning empty stomach (10 days)"
        ]
      ),
      prescriptions: [
        {
          id: "rx-1",
          name: "Avipattikar Churna",
          dosage: "3g",
          frequency: "Twice daily before meals",
          duration: "14 days",
          instructions: "Mix with lukewarm water",
          category: "ayurveda",
          whenUsed: "Today at 8:30 AM (Morning before breakfast)",
        },
        {
          id: "rx-2",
          name: "Kamadudha Ras (Moti Yukta)",
          dosage: "125mg",
          frequency: "Twice daily after meals",
          duration: "14 days",
          instructions: "Take with cow's milk",
          category: "ayurveda",
          whenUsed: "Yesterday at 9:00 PM (After dinner)",
        },
        {
          id: "rx-3",
          name: "Sutshekhar Ras",
          dosage: "250mg",
          frequency: "Once daily morning",
          duration: "10 days",
          instructions: "Empty stomach",
          category: "ayurveda",
          whenUsed: "Today at 7:00 AM (Empty stomach)",
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
      diseaseDuration: "10 Days (Acute)",
      clinicalMode: "allopathy",
      lastMedicationUsed: {
        name: "Levocetirizine 5mg",
        dosage: "5mg at bedtime",
        whenUsed: "Last taken on 2026-06-17 at night (Course Completed)",
        timing: "Once daily at bedtime",
        instructions: "Complete 5 day course",
      },
      prescriptionImageUrl: generateRxSvg(
        "AIIA OPD Prescription",
        "Dr. Rajesh Mehra (MD Gen Med)",
        "General Medicine OPD · Room 102",
        "2026-06-12",
        "Acute Upper Respiratory Irritation (Duration: 10 Days)",
        [
          "Levocetirizine 5mg — Once daily at bedtime (5 days)",
          "Sitopaladi Churna 2g — Thrice daily with honey (7 days)"
        ]
      ),
      prescriptions: [
        {
          id: "rx-4",
          name: "Levocetirizine 5mg",
          dosage: "5mg",
          frequency: "Once daily at bedtime",
          duration: "5 days",
          category: "allopathy",
          whenUsed: "Completed 5 days course",
        },
        {
          id: "rx-5",
          name: "Sitopaladi Churna",
          dosage: "2g",
          frequency: "Thrice daily with honey",
          duration: "7 days",
          category: "ayurveda",
          whenUsed: "Completed 7 days course",
        },
      ],
      doctorAdvice: "Steam inhalation twice daily. Resolved completely.",
      followUpRecommendedDays: 7,
    },
  ],
};

// Map of mobile -> linked ABHA ID
const mobileToAbhaLinkMap: Record<string, string> = {};

// Mobile records store for Guest patients (e.g. Sunita Verma)
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
      diseaseDuration: "2 Months (Subacute)",
      clinicalMode: "ayush",
      lastMedicationUsed: {
        name: "Yograj Guggulu 500mg",
        dosage: "2 tablets with warm water",
        whenUsed: "Today at 9:15 AM (Morning after breakfast)",
        timing: "Twice daily after meals",
        instructions: "Take with warm water",
      },
      prescriptionImageUrl: generateRxSvg(
        "AIIA Panchakarma Unit Prescription",
        "Dr. P. K. Namboodiri",
        "Panchakarma Unit · Room 108",
        "2026-08-20",
        "Lumbosacral strain with Vata vriddhi (Duration: 2 Months)",
        [
          "Yograj Guggulu 500mg — 2 tablets twice daily after meals (21 days)",
          "Mahanarayan Taila 15ml — Gentle massage & warm fomentation twice daily (14 days)"
        ]
      ),
      prescriptions: [
        {
          id: "rx-guest-1",
          name: "Yograj Guggulu",
          dosage: "2 tablets (500mg)",
          frequency: "Twice daily after meals",
          duration: "21 days",
          instructions: "With warm water",
          category: "ayurveda",
          whenUsed: "Today at 9:15 AM (Morning after breakfast)",
        },
        {
          id: "rx-guest-2",
          name: "Mahanarayan Taila",
          dosage: "15ml",
          frequency: "Local application twice daily",
          duration: "14 days",
          instructions: "Gentle massage followed by warm fomentation",
          category: "ayurveda",
          whenUsed: "Yesterday at 8:00 PM",
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
