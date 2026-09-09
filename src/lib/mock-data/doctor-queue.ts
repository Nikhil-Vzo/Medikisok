import { QueuePatient } from "@/components/doctor/patient-queue-table";
import { TimelineRecord } from "@/components/doctor/patient-records-timeline";
import { ClinicalSuggestion } from "@/types/clinical";

/**
 * High-fidelity clinical mockups for MediKiosk Clinician Workspace (/doctor)
 * 1. Ramesh Kumar Verma (Token 01) - Critical Red-Flagged Emergency (ACS / STEMI + Hypertensive Urgency)
 * 2. Sunita Devi Sharma (Token 02) - Routine OPD Chronic Follow-Up (Type 2 Diabetes & Mild Hypertension)
 */
export const MOCK_DOCTOR_QUEUE: QueuePatient[] = [
  {
    id: "mock-pt-001",
    visitId: "visit-emer-001",
    summaryId: "sum-emer-001",
    name: "Ramesh Kumar Verma",
    age: 54,
    gender: "Male",
    abhaId: "91-2345-6789-0123",
    abhaAddress: "ramesh.verma@sbx",
    chiefComplaint: "Severe crushing retrosternal chest pain radiating to left arm and jaw, acute shortness of breath, cold diaphoresis / sweating since 45 minutes",
    clinicalMode: "allopathy",
    isEmergency: true,
    waitTimeMins: 2,
    status: "waiting",
    tokenNumber: 1,
    assignedDoctor: "Dr. S. Mukherjee, MD (Cardiology / Emergency)",
    assignedRoom: "Room 104 - Acute Resuscitation Bay",
    nurseVitals: {
      bloodPressure: "185/110",
      pulseRate: 112,
      spo2: 93,
      temperature: 98.4,
      respiratoryRate: 24,
      bloodSugar: 198,
      weightKg: 78,
      recordedAt: new Date(Date.now() - 5 * 60000).toISOString(),
      nurseName: "Sr. Nurse Sunita Patil (Triage)",
      triageNotes: "CRITICAL RED FLAG: Patient clutching chest with diaphoresis, BP 185/110 mmHg, pulse 112 bpm, SpO2 93% on room air. High NEWS2 score (7). Immediate 12-Lead ECG Bay diversion and CCU alert ordered.",
    },
    nurseNotes: "CRITICAL RED FLAG: Patient clutching chest with diaphoresis, BP 185/110 mmHg, pulse 112 bpm, SpO2 93% on room air. High NEWS2 score (7). Immediate 12-Lead ECG Bay diversion and CCU alert ordered.",
    socratesData: {
      site: "Substernal / retrosternal precordium",
      onset: "Sudden onset while resting, 45 minutes ago",
      character: "Crushing, heavy tightness like an elephant sitting on chest",
      radiation: "Radiating to left shoulder, medial aspect of left arm, and lower jaw",
      associated_symptoms: [
        "Shortness of breath / acute dyspnoea",
        "Cold clammy diaphoresis",
        "Nausea",
        "Dizziness"
      ],
      timing: "Continuous, unremitting, increasing in intensity",
      exacerbating_relieving: "Worse on slightest exertion or deep inspiration; no relief with rest",
      severity: 9,
    },
    draftSummary: {
      visitId: "visit-emer-001",
      patientId: "mock-pt-001",
      chiefComplaint: "Crushing retrosternal chest pain radiating to left arm with diaphoresis and breathlessness x 45 minutes",
      historyOfPresentIllness: "54-year-old male with 10-year history of hypertension presents with sudden onset of severe, crushing substernal chest pain radiating to left arm and jaw since 45 minutes. Accompanied by acute dyspnoea, profuse cold diaphoresis, and nausea. Denies cough, hemoptysis, or syncope. Pain score 9/10.",
      socratesData: {
        site: "Substernal / retrosternal precordium",
        onset: "Sudden onset while resting, 45 minutes ago",
        character: "Crushing, heavy tightness like an elephant sitting on chest",
        radiation: "Radiating to left shoulder, medial aspect of left arm, and lower jaw",
        associated_symptoms: ["Shortness of breath", "Cold diaphoresis", "Nausea", "Dizziness"],
        timing: "Continuous, unremitting",
        exacerbating_relieving: "No relief with sitting or rest",
        severity: 9,
      },
      pastMedicalHistory: [
        "Essential Hypertension (10 years, on irregular Telmisartan)",
        "Dyslipidemia (borderline, unmedicated)",
        "Cigarette Smoker (15 pack-years)"
      ],
      currentMedications: [
        { name: "Tab Telmisartan", dosage: "40mg", frequency: "1-0-0 (OD — Morning)", duration: "Continuous", confidence: 0.95 },
        { name: "Tab Amlodipine", dosage: "5mg", frequency: "0-1-0 (Night — HS)", duration: "Continuous", confidence: 0.92 },
      ],
      allergies: ["No Known Drug Allergies (NKDA)"],
      scannedDocumentsSummary: "Point-of-care ECG strip from triage bay confirms 2.5mm ST-elevation in V1-V4 with reciprocal depressions in III and aVF. Prior lipid panel (May 2026): Total Cholesterol 248 mg/dL, LDL 162 mg/dL.",
      doctorNotes: "Provisional Diagnosis: Acute Anterior Wall ST-Elevation Myocardial Infarction (STEMI) with Hypertensive Urgency. Immediate coronary care unit (CCU) transfer, dual antiplatelet loading (Aspirin 300mg + Ticagrelor 180mg), High-intensity statin (Atorvastatin 80mg), and emergent primary PCI activation.",
      classicalHistory: {
        chiefComplaint: "Severe crushing retrosternal chest pain radiating to left arm with diaphoresis x 45 mins",
        historyOfPresentIllness: "54-year-old male hypertensive presents in severe distress with acute substernal crushing pain radiating to left arm and neck. Associated with cold clammy sweating, air hunger, and nausea. No prior similar episodes.",
        pastMedicalSurgical: [
          "Essential Hypertension (10 years)",
          "Dyslipidemia (4 years)",
          "No past surgical interventions"
        ],
        drugAndAllergies: {
          medications: [
            { name: "Tab Telmisartan", dosage: "40mg", frequency: "OD" },
            { name: "Tab Amlodipine", dosage: "5mg", frequency: "OD" }
          ],
          allergies: ["NKDA (No Known Drug Allergies)"]
        },
        familyHistory: "Father suffered fatal myocardial infarction at age 58; Mother has Type 2 Diabetes Mellitus.",
        personalHistory: {
          diet: "Non-vegetarian, high sodium and saturated fat intake",
          sleep: "Irregular (5-6 hours/night)",
          appetite: "Reduced acutely due to nausea",
          bowelBladder: "Normal regular bowel habits, no dysuria",
          lifestyleHabits: "Smoker (15 pack-years), sedentary occupation"
        },
        reviewOfSystems: {
          cardiovascular: "Severe retrosternal pressure, S4 gallop audible, tachycardia 112 bpm, BP 185/110 mmHg.",
          respiratory: "Tachypneic (RR 24/min), bilateral basilar crackles, SpO2 93% on room air.",
          gastrointestinal: "Nausea present, no active hematemesis or abdominal rigidity.",
          neurological: "Anxious, fully conscious and oriented (GCS 15/15), no focal neurological deficits.",
          musculoskeletal: "No chest wall tenderness upon manual palpation (rules out costochondritis)."
        },
        priorInvestigations: "STAT 12-Lead ECG: Hyperacute T-waves and 2.5mm ST-segment elevation in leads V1-V4. Bedside Point-of-Care Troponin I positive (>0.85 ng/mL)."
      },
      status: "draft",
      isEmergencyTriage: true,
      createdAt: new Date().toISOString(),
    },
    suggestions: [
      {
        id: "sug-1",
        type: "redflag",
        title: "CRITICAL ALERT: Acute STEMI Reperfusion Protocol Activated",
        description: "Vitals and 12-lead ECG meet criteria for emergent myocardial reperfusion therapy. Time-to-balloon window is active (<90 mins). Divert to Cath Lab / CCU without awaiting delayed blood tests.",
        severity: "critical",
        confidenceScore: 0.99,
        citedSource: "ICMR & Cardiological Society of India (CSI) STEMI Guidelines",
      },
      {
        id: "sug-2",
        type: "interaction",
        title: "STAT ORDER: Dual Antiplatelet & High-Intensity Statin Loading",
        description: "Administer chewable Aspirin 300mg + Ticagrelor 180mg (or Clopidogrel 300mg) immediately. Add Atorvastatin 80mg STAT. Prepare IV access with 18G cannula.",
        severity: "high",
        confidenceScore: 0.96,
        citedSource: "ACC/AHA Emergency Cardiac Care Protocols 2024",
      },
      {
        id: "sug-3",
        type: "abnormal_lab",
        title: "Telemetry Warning: Hypertensive Urgency (BP 185/110 mmHg)",
        description: "Marked afterload elevation increases myocardial oxygen demand and infarct size. Avoid acute precipitously low drops in DBP (<60) to protect coronary perfusion.",
        severity: "high",
        confidenceScore: 0.94,
        citedSource: "European Society of Cardiology (ESC) Acute Hypertension Directive",
      },
    ],
    scannedDocuments: [
      {
        id: "doc-1",
        date: "Today (STAT Triage)",
        facility: "Emergency Resuscitation Bay 1",
        docType: "Lab Report",
        doctor: "Dr. S. Mukherjee, MD",
        keyFindings: [
          "12-Lead ECG: 2.5mm ST-segment elevation in Leads V1-V4",
          "Point-of-Care Troponin I: Positive (>0.85 ng/mL) [Critical High]",
          "Bedside Glucose: 198 mg/dL [Elevated Stress Hyperglycemia]"
        ],
        medications: ["O2 by nasal cannula @ 4L/min"],
        isAbnormal: true,
      },
      {
        id: "doc-2",
        date: "12 May 2026",
        facility: "Thyrocare Diagnostic Centre",
        docType: "Lab Report",
        doctor: "Dr. P. Singhal, MD (Pathology)",
        keyFindings: [
          "Lipid Profile: Total Cholesterol 248 mg/dL [High]",
          "LDL Cholesterol: 162 mg/dL [High Risk]",
          "Serum Creatinine: 1.0 mg/dL [Normal eGFR 86]"
        ],
        medications: [],
        isAbnormal: true,
      }
    ],
  },
  {
    id: "mock-pt-002",
    visitId: "visit-opd-002",
    summaryId: "sum-opd-002",
    name: "Sunita Devi Sharma",
    age: 48,
    gender: "Female",
    abhaId: "91-8765-4321-9876",
    abhaAddress: "sunita.sharma@sbx",
    chiefComplaint: "Routine 3-month follow-up for Type 2 Diabetes Mellitus and Mild Hypertension; requests medication refill and review of latest HbA1c",
    clinicalMode: "allopathy",
    isEmergency: false,
    waitTimeMins: 8,
    status: "waiting",
    tokenNumber: 2,
    assignedDoctor: "Dr. Ananya Ray, MD (Internal Medicine)",
    assignedRoom: "Room 202 - General Medicine OPD",
    nurseVitals: {
      bloodPressure: "124/80",
      pulseRate: 74,
      spo2: 99,
      temperature: 98.6,
      respiratoryRate: 16,
      bloodSugar: 132,
      weightKg: 64,
      recordedAt: new Date(Date.now() - 15 * 60000).toISOString(),
      nurseName: "Staff Nurse Anita Roy (OPD Vitals)",
      triageNotes: "Routine OPD Pre-Check: Patient comfortable, afebrile, vitals strictly within goal targets (BP 124/80, HR 74, SpO2 99%). No acute complaints or hypoglycemia episodes reported.",
    },
    nurseNotes: "Routine OPD Pre-Check: Patient comfortable, afebrile, vitals strictly within goal targets (BP 124/80, HR 74, SpO2 99%). No acute complaints or hypoglycemia episodes reported.",
    socratesData: {
      site: "Bilateral knee joints (mild morning stiffness)",
      onset: "Gradual onset over past 6 months, mild",
      character: "Dull aching stiffness lasting <15 minutes upon waking",
      radiation: "None",
      associated_symptoms: ["None; no joint warmth, swelling, or erythema"],
      timing: "Morning upon waking, resolves quickly with light movement",
      exacerbating_relieving: "Relieved with morning walking and warm water bath",
      severity: 2,
    },
    draftSummary: {
      visitId: "visit-opd-002",
      patientId: "mock-pt-002",
      chiefComplaint: "Quarterly OPD review for chronic diabetes & hypertension management; prescription refill",
      historyOfPresentIllness: "48-year-old female known diabetic (5 years) and hypertensive (3 years) presents for routine periodic 3-month evaluation. Reports regular medication adherence, adherence to low-GI diet, and 30-minute daily morning walking. Denies chest pain, palpitations, polyuria, polydipsia, or blurry vision. Reports mild bilateral knee stiffness in the morning, resolving within 15 minutes.",
      socratesData: {
        site: "Bilateral knees",
        onset: "Past 6 months",
        character: "Mild stiffness",
        radiation: "None",
        associated_symptoms: [],
        timing: "Morning",
        exacerbating_relieving: "Relieved by movement",
        severity: 2,
      },
      pastMedicalHistory: [
        "Type 2 Diabetes Mellitus (diagnosed 2021, on Metformin)",
        "Essential Hypertension (diagnosed 2023, on Telmisartan 40mg)",
        "Mild Osteoarthritis of knees (Grade 1 Kellgren-Lawrence)"
      ],
      currentMedications: [
        { name: "Tab Metformin", dosage: "500mg", frequency: "1-0-1 (BD — Twice daily)", duration: "90 Days", instructions: "After meals (post-prandial)", confidence: 0.98 },
        { name: "Tab Telmisartan", dosage: "40mg", frequency: "1-0-0 (OD — Once daily)", duration: "90 Days", instructions: "Morning after breakfast", confidence: 0.97 },
        { name: "Cap Calcium + Vit D3", dosage: "500mg/250IU", frequency: "0-1-0 (Night — HS)", duration: "60 Days", instructions: "At bedtime", confidence: 0.95 },
      ],
      allergies: ["No Known Drug Allergies (NKDA)"],
      scannedDocumentsSummary: "Thyrocare lab report dated 15 July 2026: HbA1c 6.8% (Target <7.0% achieved), Fasting Blood Sugar 118 mg/dL, Post-Prandial Blood Sugar 138 mg/dL, Serum Creatinine 0.8 mg/dL (eGFR >90 mL/min/1.73m2), Urine Microalbumin/Creatinine ratio normal.",
      doctorNotes: "Clinical Impression: Type 2 Diabetes Mellitus & Primary Hypertension in excellent glycemic and blood pressure control on current two-drug regimen. Continue Metformin 500mg BD and Telmisartan 40mg OD. Routine annual retinal examination and lipid panel advised in 3 months.",
      classicalHistory: {
        chiefComplaint: "Quarterly OPD review for chronic diabetes & hypertension management; prescription refill",
        historyOfPresentIllness: "48-year-old female known diabetic and hypertensive presents for routine 3-month periodic evaluation. Reports strict adherence to prescribed medications, diet, and 30-minute daily morning walks. Denies polyuria, polydipsia, blurry vision, chest pain, palpitations, or pedal edema. Mild morning bilateral knee stiffness noted, resolving within 15 minutes.",
        pastMedicalSurgical: [
          "Type 2 Diabetes Mellitus (5 years)",
          "Essential Hypertension (3 years)",
          "No prior hospitalizations or surgical procedures"
        ],
        drugAndAllergies: {
          medications: [
            { name: "Tab Metformin", dosage: "500mg", frequency: "1-0-1 (BD)" },
            { name: "Tab Telmisartan", dosage: "40mg", frequency: "1-0-0 (OD)" },
            { name: "Cap Calcium + Vit D3", dosage: "500mg", frequency: "0-1-0 (HS)" }
          ],
          allergies: ["NKDA (No Known Drug Allergies)"]
        },
        familyHistory: "Mother has Type 2 Diabetes Mellitus; Father had mild hypertension.",
        personalHistory: {
          diet: "Strict vegetarian, balanced diabetic meal plan, low sodium",
          sleep: "7 hours uninterrupted",
          appetite: "Normal, consistent meal timings",
          bowelBladder: "Regular once daily, no nocturia or dysuria",
          lifestyleHabits: "Non-smoker, non-alcoholic, brisk walking 30 mins daily"
        },
        reviewOfSystems: {
          cardiovascular: "No chest discomfort, palpitations, or orthopnea. S1/S2 normal, no murmurs.",
          respiratory: "Clear vesicular breath sounds bilaterally, no wheeze or crackles.",
          gastrointestinal: "Abdomen soft, non-tender, no organomegaly.",
          neurological: "Intact monofilament sensation on both feet; vibration sense normal.",
          musculoskeletal: "Full range of motion in bilateral knees, no joint effusion or crepitus."
        },
        priorInvestigations: "Recent HbA1c 6.8% (Target <7.0%), Fasting Glucose 118 mg/dL, Serum Creatinine 0.8 mg/dL. All within optimal therapeutic parameters."
      },
      status: "draft",
      isEmergencyTriage: false,
      createdAt: new Date().toISOString(),
    },
    suggestions: [
      {
        id: "sug-101",
        type: "abnormal_lab",
        title: "Target Glycemic & BP Control Achieved",
        description: "Latest HbA1c is 6.8% (Target <7.0%) and resting BP is 124/80 mmHg. Excellent adherence. Continue current dual therapy: Metformin 500mg BD + Telmisartan 40mg OD.",
        severity: "low",
        confidenceScore: 0.98,
        citedSource: "RSSDI & American Diabetes Association (ADA) 2026 Standards",
      },
      {
        id: "sug-102",
        type: "interaction",
        title: "Preventive Care: Annual Diabetic Retinopathy Screen Due",
        description: "Patient due for annual dilated fundus examination and bilateral monofilament foot sensory check. Schedule appointment with Ophthalmology OPD.",
        severity: "low",
        confidenceScore: 0.92,
        citedSource: "National Programme for Prevention & Control of NCDs (NP-NCD)",
      },
    ],
    scannedDocuments: [
      {
        id: "doc-101",
        date: "15 July 2026",
        facility: "Thyrocare Central Laboratory",
        docType: "Lab Report",
        doctor: "Dr. K. Mehta, MD (Pathology)",
        keyFindings: [
          "HbA1c: 6.8% [Target Achieved < 7.0%]",
          "Fasting Blood Sugar: 118 mg/dL [Controlled]",
          "Serum Creatinine: 0.8 mg/dL [Normal eGFR >90]",
          "Urine Microalbumin: Negative (< 30 mg/g)"
        ],
        medications: [],
        isAbnormal: false,
      },
      {
        id: "doc-102",
        date: "10 June 2026",
        facility: "Max Super Speciality Hospital, New Delhi",
        docType: "Prescription",
        doctor: "Dr. Rajesh Verma, MD (Internal Medicine)",
        keyFindings: [
          "Diagnosed: Type 2 Diabetes Mellitus & Essential Hypertension",
          "Prescription Refill 90 Days Authorized",
          "Dietary and physical activity advice reinforced"
        ],
        medications: [
          "Tab Metformin 500mg BD",
          "Tab Telmisartan 40mg OD",
          "Cap Calcium + Vit D3"
        ],
        isAbnormal: false,
      }
    ],
  },
];
