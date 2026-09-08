import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "csv";
    const hospital = searchParams.get("hospital") || "all";

    // 1. Fetch live queue + Supabase data
    const queueRes = await fetch(new URL("/api/queue", req.url).toString());
    let patients: any[] = [];
    if (queueRes.ok) {
      const qJson = await queueRes.json();
      patients = qJson.queue || [];
    }

    // Live queue patients from DB
    if (hospital !== "all") {
      patients = patients.filter((p) => !p.hospitalName || p.hospitalName.toLowerCase().includes(hospital.toLowerCase()));
    }

    // 2. FHIR Bulk Export
    if (format === "fhir") {
      const fhirBulkBundle = {
        resourceType: "Bundle",
        type: "collection",
        id: `ndhm-bulk-export-${Date.now()}`,
        meta: {
          lastUpdated: new Date().toISOString(),
          profile: ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle"],
        },
        total: patients.length,
        entry: patients.map((p) => ({
          fullUrl: `urn:uuid:${p.visitId}`,
          resource: p.fhirBundle || {
            resourceType: "Encounter",
            id: p.visitId,
            status: "in-progress",
            class: { system: "http://terminology.hl7.org/CodeSystem/v3-ActCode", code: "AMB", display: "ambulatory" },
            subject: { display: p.name, identifier: { system: "https://healthid.ndhm.gov.in", value: p.abhaId } },
            reasonCode: [{ text: p.chiefComplaint }],
          },
        })),
      };

      return new NextResponse(JSON.stringify(fhirBulkBundle, null, 2), {
        headers: {
          "Content-Type": "application/fhir+json",
          "Content-Disposition": `attachment; filename="medikiosk-fhir-bulk-export-${Date.now()}.json"`,
        },
      });
    }

    // 3. Raw JSON Export
    if (format === "json") {
      return new NextResponse(JSON.stringify(patients, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="medikiosk-registry-export-${Date.now()}.json"`,
        },
      });
    }

    // 4. Default: Tabular CSV Export
    const csvHeaders = [
      "Token",
      "Visit ID",
      "ABHA ID",
      "Patient Name",
      "Age",
      "Gender",
      "Chief Complaint",
      "Clinical Mode",
      "Triage Status",
      "Emergency Flag",
      "Assigned Room",
      "Assigned Doctor",
      "BP Systolic",
      "BP Diastolic",
      "Heart Rate (BPM)",
      "SpO2 (%)",
      "Temperature (F)",
      "Wait Time (Mins)",
      "Status",
      "Registered At",
    ];

    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return '""';
      const val = String(str).replace(/"/g, '""');
      return `"${val}"`;
    };

    const csvRows = patients.map((p, idx) => {
      const v = p.nurseVitals || {};
      return [
        escapeCsv(`#${idx + 1}`),
        escapeCsv(p.visitId),
        escapeCsv(p.abhaId),
        escapeCsv(p.name),
        escapeCsv(p.age),
        escapeCsv(p.gender),
        escapeCsv(p.chiefComplaint),
        escapeCsv(p.clinicalMode),
        escapeCsv(p.isEmergency ? "CRITICAL_RED_FLAG" : "ROUTINE"),
        escapeCsv(p.isEmergency ? "YES" : "NO"),
        escapeCsv(p.assignedRoom || "Unassigned"),
        escapeCsv(p.assignedDoctor || "Pending Allotment"),
        escapeCsv(v.bloodPressureSys || ""),
        escapeCsv(v.bloodPressureDia || ""),
        escapeCsv(v.pulseRate || ""),
        escapeCsv(v.spo2 || ""),
        escapeCsv(v.temperature || ""),
        escapeCsv(p.waitTimeMins || 0),
        escapeCsv(p.status),
        escapeCsv(p.createdAt),
      ].join(",");
    });

    const csvContent = [csvHeaders.join(","), ...csvRows].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="medikiosk-ministry-export-${Date.now()}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
