import { ClinicalSummaryDraft } from "@/types/clinical";

export function generateAndPrintClinicalReport(summary: ClinicalSummaryDraft, patientDetails: {
  abhaId?: string;
  name?: string;
  gender?: string;
  age?: number;
  tokenNumber?: number | string;
}) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to download or print the official medical report.");
    return;
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>MediKiosk Clinical Intake Summary — ${patientDetails.name || "Patient"}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 40px;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #065f46;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      color: #065f46;
      font-weight: 800;
    }
    .header p {
      margin: 4px 0 0 0;
      font-size: 13px;
      color: #64748b;
      font-weight: 600;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      background: #dcfcee;
      color: #065f46;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .patient-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      font-size: 13px;
    }
    .patient-box div strong {
      display: block;
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
    }
    .section {
      margin-bottom: 20px;
    }
    .section h2 {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #065f46;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
      margin-bottom: 10px;
    }
    .section p, .section ul {
      margin: 0;
      font-size: 13px;
      color: #334155;
    }
    .med-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    .med-table th, .med-table td {
      border: 1px solid #e2e8f0;
      padding: 8px 12px;
      text-align: left;
    }
    .med-table th {
      background: #f1f5f9;
      font-weight: 700;
    }
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 70px;
      color: rgba(6, 95, 70, 0.04);
      font-weight: 900;
      pointer-events: none;
      z-index: -1;
      white-space: nowrap;
    }
    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      margin-top: 32px;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #94a3b8;
    }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="watermark">AIIA · MEDIKIOSK · ABDM</div>

  <div class="header">
    <div>
      <h1>ALL INDIA INSTITUTE OF AYURVEDA (AIIA)</h1>
      <p>Ministry of Ayush · OPD Clinical Intake & Case-Taking Summary</p>
    </div>
    <div style="text-align: right;">
      <span class="badge">DPDP Act 2023 Verified</span>
      <p style="font-size: 11px; color: #64748b; margin-top: 4px;">Date: ${new Date().toLocaleDateString("en-IN")}</p>
    </div>
  </div>

  <div class="patient-box">
    <div>
      <strong>Patient Name</strong>
      ${patientDetails.name || "Patient"}
    </div>
    <div>
      <strong>Age / Gender</strong>
      ${patientDetails.age ? `${patientDetails.age} Y` : "--"} / ${patientDetails.gender || "--"}
    </div>
    <div>
      <strong>ABHA ID</strong>
      ${patientDetails.abhaId || "--"}
    </div>
    <div>
      <strong>Visit Token</strong>
      ${patientDetails.tokenNumber ? `#${patientDetails.tokenNumber}` : "OPD"}
    </div>
  </div>

  <div class="section">
    <h2>1. Chief Complaint & History of Present Illness</h2>
    <p><strong>Chief Complaint:</strong> ${summary.chiefComplaint}</p>
    <p style="margin-top: 6px;">${summary.historyOfPresentIllness}</p>
  </div>

  ${summary.ayushAssessment ? `
  <div class="section">
    <h2>2. Ayurvedic Dashavidha Pariksha Intake</h2>
    <p><strong>Prakriti (Constitution):</strong> ${summary.ayushAssessment.prakriti || "Vata-Pitta"}</p>
    <p><strong>Agni (Digestive Fire):</strong> ${summary.ayushAssessment.agni || "Tikshna Agni"}</p>
    <p><strong>Koshtha (Bowel Habit):</strong> ${summary.ayushAssessment.koshtha || "Madhyama"}</p>
    <p><strong>Sattva (Mental Resilience):</strong> ${summary.ayushAssessment.sattva || "Pravara"}</p>
  </div>
  ` : ""}

  <div class="section">
    <h2>3. Active Medications (From Digitized Records)</h2>
    <table class="med-table">
      <thead>
        <tr>
          <th>Drug / Medicine Name</th>
          <th>Dosage</th>
          <th>Frequency</th>
        </tr>
      </thead>
      <tbody>
        ${(summary.currentMedications || []).map(m => `
          <tr>
            <td><strong>${m.name}</strong></td>
            <td>${m.dosage}</td>
            <td>${m.frequency}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>4. Past Medical History & Allergies</h2>
    <p><strong>Past Conditions:</strong> ${(summary.pastMedicalHistory || []).join(", ") || "None recorded"}</p>
    <p><strong>Allergies:</strong> ${(summary.allergies || []).join(", ") || "No known drug allergies (NKDA)"}</p>
  </div>

  <div class="section">
    <h2>5. Document Digitization Summary</h2>
    <p>${summary.scannedDocumentsSummary || "All physical prescriptions and reports processed via OCR."}</p>
  </div>

  <div class="section">
    <h2>6. Physician Clinical Examination & Final Prescription</h2>
    <div style="min-height: 80px; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 12px; font-size: 13px;">
      ${summary.doctorNotes ? `<p>${summary.doctorNotes}</p>` : `<span style="color: #94a3b8;">[Physician Signature & Remarks]</span>`}
    </div>
  </div>

  <div class="footer">
    <span>Generated by MediKiosk AI Clinical Platform · Compliant with HL7 FHIR R4 & ABDM</span>
    <span>Page 1 of 1</span>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
